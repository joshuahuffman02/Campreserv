import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";

const reservationsRouter = Router();

const reservationSchema = z.object({
  campgroundId: z.string(),
  siteId: z.string(),
  guestFirstName: z.string(),
  guestLastName: z.string(),
  guestEmail: z.string().email(),
  arrivalDate: z.string(),
  departureDate: z.string(),
  adults: z.number().int().min(1),
  kids: z.number().int().min(0).default(0),
  pets: z.number().int().min(0).default(0),
});

reservationsRouter.get("/", async (_req, res) => {
  try {
    const reservations = await prisma.reservation.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        campground: { select: { id: true, name: true } },
        site: { select: { id: true, nameOrNumber: true } },
      },
    });

    const shaped = reservations.map((reservation: any) => ({
      id: reservation.id,
      status: reservation.status,
      arrivalDate: reservation.arrivalDate,
      departureDate: reservation.departureDate,
      guestFirstName: reservation.guestFirstName,
      guestLastName: reservation.guestLastName,
      campground: reservation.campground,
      site: reservation.site,
    }));

    res.json(shaped);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reservations", error: `${error}` });
  }
});

reservationsRouter.post("/", async (req, res) => {
  const parsed = reservationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten() });
  }

  const data = parsed.data;
  const arrivalDate = new Date(data.arrivalDate);
  const departureDate = new Date(data.departureDate);

  if (Number.isNaN(arrivalDate.valueOf()) || Number.isNaN(departureDate.valueOf())) {
    return res.status(400).json({ message: "Invalid arrival or departure date" });
  }

  if (arrivalDate >= departureDate) {
    return res.status(400).json({ message: "Departure date must be after arrival date" });
  }

  try {
    const overlapping = await prisma.reservation.findFirst({
      where: {
        siteId: data.siteId,
        status: { in: ["pending", "confirmed"] },
        arrivalDate: { lt: departureDate },
        departureDate: { gt: arrivalDate },
      },
    });

    if (overlapping) {
      return res.status(409).json({ message: "Site not available for selected dates" });
    }

    const reservation = await prisma.reservation.create({
      data: {
        campgroundId: data.campgroundId,
        siteId: data.siteId,
        guestFirstName: data.guestFirstName,
        guestLastName: data.guestLastName,
        guestEmail: data.guestEmail,
        arrivalDate,
        departureDate,
        adults: data.adults,
        kids: data.kids,
        pets: data.pets,
        nightlySubtotalCents: 0,
        taxCents: 0,
        feesCents: 0,
        totalCents: 0,
        status: "pending",
        paymentStatus: "unpaid",
      },
    });

    res.status(201).json(reservation);
  } catch (error) {
    res.status(500).json({ message: "Failed to create reservation", error: `${error}` });
  }
});

export { reservationsRouter };
