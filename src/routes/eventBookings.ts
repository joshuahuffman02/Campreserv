import { Router } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { findAvailableSites } from "../services/availabilityService";
import { requireAuth, requireCampgroundRole } from "../middleware/auth";
import { CampgroundRole, ReservationStatus } from "@prisma/client";

const eventBookingRouter = Router();

const eventAvailabilitySchema = z.object({
  includeDeals: z.string().optional(),
});

// Fetch an event with curated availability and linked deals
// This helps the UI prefill search and surface add-ons specific to the event window
// Example: GET /events/:id/availability?includeDeals=true
// Response: { event, availability: Site[], deals: Deal[] }
eventBookingRouter.get(
  "/:id/availability",
  async (req, res) => {
    const query = eventAvailabilitySchema.safeParse(req.query);
    if (!query.success) return res.status(400).json({ errors: query.error.format() });

    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: { campground: true, deals: true },
    });
    if (!event) return res.status(404).json({ message: "Event not found" });

    const sites = await findAvailableSites(
      event.startDate.toISOString(),
      event.endDate.toISOString(),
      { campgroundId: event.campgroundId }
    );

    return res.json({
      event,
      availability: sites,
      deals: query.data.includeDeals ? event.deals : [],
    });
  }
);

const eventReservationSchema = z.object({
  siteId: z.string(),
  guestEmail: z.string().email(),
  guestFirstName: z.string().min(2),
  guestLastName: z.string().min(2),
  adults: z.number().int().min(1),
  kids: z.number().int().min(0).optional().default(0),
  pets: z.number().int().min(0).optional().default(0),
  notes: z.string().optional(),
  paymentIntentId: z.string().optional(),
});

// Create a reservation tied to an event window
// This keeps pricing and policy logic centralized while giving marketing a deep link target
// Example: POST /events/:id/reservations
// Body: { siteId, guestEmail, guestFirstName, guestLastName, adults, kids?, pets?, notes? }
eventBookingRouter.post(
  "/:id/reservations",
  async (req, res) => {
    const parsedBody = eventReservationSchema.safeParse(req.body);
    if (!parsedBody.success) return res.status(400).json({ errors: parsedBody.error.format() });

    const event = await prisma.event.findUnique({ where: { id: req.params.id } });
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Validate that the site is part of the event's campground and available
    const site = await prisma.site.findUnique({ where: { id: parsedBody.data.siteId } });
    if (!site || site.campgroundId !== event.campgroundId)
      return res.status(400).json({ message: "Site not available for this event" });

    const availability = await findAvailableSites(
      event.startDate.toISOString(),
      event.endDate.toISOString(),
      { campgroundId: event.campgroundId, siteTypeIds: [site.siteTypeId] }
    );

    const siteIsFree = availability.some((s) => s.id === site.id);
    if (!siteIsFree) return res.status(409).json({ message: "Site already booked for event dates" });

    const reservation = await prisma.reservation.create({
      data: {
        campgroundId: event.campgroundId,
        siteId: site.id,
        status: ReservationStatus.pending,
        arrivalDate: event.startDate,
        departureDate: event.endDate,
        guestEmail: parsedBody.data.guestEmail,
        guestFirstName: parsedBody.data.guestFirstName,
        guestLastName: parsedBody.data.guestLastName,
        adults: parsedBody.data.adults,
        kids: parsedBody.data.kids,
        pets: parsedBody.data.pets,
        notes: parsedBody.data.notes,
        paymentIntentId: parsedBody.data.paymentIntentId,
        nightlySubtotalCents: 0,
        taxCents: 0,
        feesCents: 0,
        totalCents: 0,
        paymentStatus: "unpaid",
      },
    });

    res.status(201).json({ reservation, message: "Event reservation created" });
  }
);

const eventDealSchema = z.object({
  campgroundId: z.string(),
  title: z.string().min(3),
  description: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  discountPercent: z.number().min(0).max(100).optional(),
  fixedAmountCents: z.number().int().min(0).optional(),
  code: z.string().optional(),
  featured: z.boolean().optional(),
});

// Dedicated routes for owners/marketing to manage event-linked deals
// Supports per-campground control and future promo codes

const guardRoles = [
  CampgroundRole.owner,
  CampgroundRole.manager,
  CampgroundRole.marketing,
  CampgroundRole.finance,
];

eventBookingRouter.post(
  "/deals",
  requireAuth(),
  requireCampgroundRole(guardRoles),
  async (req, res) => {
    const parsed = eventDealSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ errors: parsed.error.format() });

    const deal = await prisma.deal.create({
      data: {
        ...parsed.data,
        startDate: new Date(parsed.data.startDate),
        endDate: new Date(parsed.data.endDate),
      },
    });
    res.status(201).json(deal);
  }
);

eventBookingRouter.get("/deals", requireAuth(), requireCampgroundRole(guardRoles), async (req, res) => {
  const deals = await prisma.deal.findMany({
    orderBy: [{ featured: "desc" }, { startDate: "asc" }],
  });
  res.json(deals);
});

eventBookingRouter.put(
  "/deals/:id",
  requireAuth(),
  requireCampgroundRole(guardRoles),
  async (req, res) => {
    const parsed = eventDealSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ errors: parsed.error.format() });

    const deal = await prisma.deal.update({
      where: { id: req.params.id },
      data: {
        ...parsed.data,
        startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : undefined,
        endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : undefined,
      },
    });
    res.json(deal);
  }
);

eventBookingRouter.delete(
  "/deals/:id",
  requireAuth(),
  requireCampgroundRole([CampgroundRole.owner, CampgroundRole.manager]),
  async (req, res) => {
    await prisma.deal.delete({ where: { id: req.params.id } });
    res.status(204).send();
  }
);

export { eventBookingRouter };
