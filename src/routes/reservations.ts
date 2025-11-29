import { Router } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { requireAuth, requireCampgroundRole } from "../middleware/auth";
import { CampgroundRole, Role } from "@prisma/client";
import { normalizeDateRange } from "../utils/dateRange";

const reservationsRouter = Router();

const reservationSchema = z.object({
  campgroundId: z.string(),
  siteId: z.string(),
  arrivalDate: z.string(),
  departureDate: z.string(),
  guestFirstName: z.string(),
  guestLastName: z.string(),
  guestEmail: z.string().email(),
  guestPhone: z.string().optional(),
  adults: z.number().int().min(1),
  kids: z.number().int().min(0).default(0),
  pets: z.number().int().min(0).default(0),
  rigType: z.string().optional(),
  rigLengthFt: z.number().int().positive().optional(),
  vehiclePlate: z.string().optional(),
  notes: z.string().optional(),
  nightlySubtotalCents: z.number().int().min(0),
  taxCents: z.number().int().min(0),
  feesCents: z.number().int().min(0),
  totalCents: z.number().int().min(0),
  paymentIntentId: z.string().optional(),
});

reservationsRouter.get(
  "/",
  requireAuth(),
  requireCampgroundRole([
    CampgroundRole.owner,
    CampgroundRole.manager,
    CampgroundRole.front_desk,
    CampgroundRole.maintenance,
    CampgroundRole.finance,
    CampgroundRole.read_only,
  ]),
  async (req, res) => {
    const campgroundId = req.query.campgroundId as string | undefined;
    if (!campgroundId) return res.status(400).json({ message: "campgroundId is required" });
    const reservations = await prisma.reservation.findMany({
      where: { campgroundId },
      include: { site: true },
    });
    res.json(reservations);
  }
);

reservationsRouter.post("/", async (req, res) => {
  const parsed = reservationSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.format() });
  const data = parsed.data;

  try {
    const range = normalizeDateRange(data.arrivalDate, data.departureDate);
    const overlapping = await prisma.reservation.count({
      where: {
        siteId: data.siteId,
        status: { in: ["pending", "confirmed", "checked_in"] },
        arrivalDate: { lt: range.end },
        departureDate: { gt: range.start },
      },
    });
    if (overlapping > 0) {
      return res.status(409).json({ message: "Site not available for selected dates" });
    }

    const reservation = await prisma.reservation.create({
      data: {
        campgroundId: data.campgroundId,
        siteId: data.siteId,
        arrivalDate: range.start,
        departureDate: range.end,
        guestFirstName: data.guestFirstName,
        guestLastName: data.guestLastName,
        guestEmail: data.guestEmail,
        guestPhone: data.guestPhone,
        adults: data.adults,
        kids: data.kids,
        pets: data.pets,
        rigType: data.rigType,
        rigLengthFt: data.rigLengthFt,
        vehiclePlate: data.vehiclePlate,
        notes: data.notes,
        nightlySubtotalCents: data.nightlySubtotalCents,
        taxCents: data.taxCents,
        feesCents: data.feesCents,
        totalCents: data.totalCents,
        paymentStatus: "unpaid",
        status: "pending",
        paymentIntentId: data.paymentIntentId,
      },
    });
    res.status(201).json(reservation);
  } catch (err) {
    return res.status(400).json({ message: "Could not create reservation", error: `${err}` });
  }
});

reservationsRouter.patch(
  "/:id/status",
  requireAuth(),
  requireCampgroundRole([CampgroundRole.owner, CampgroundRole.manager, CampgroundRole.front_desk]),
  async (req, res) => {
    const statusSchema = z.object({ status: z.enum(["pending", "confirmed", "checked_in", "checked_out", "cancelled"]) });
    const parsed = statusSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ errors: parsed.error.format() });
    const reservation = await prisma.reservation.update({ where: { id: req.params.id }, data: { status: parsed.data.status } });
    res.json(reservation);
  }
);

export { reservationsRouter };
