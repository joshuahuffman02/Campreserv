import { Router } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { requireAuth, requireCampgroundRole, AuthRequest } from "../middleware/auth";
import { CampgroundRole, Role } from "@prisma/client";

const campgroundsRouter = Router();

const campgroundSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  timezone: z.string().optional(),
  checkInTime: z.string().optional(),
  checkOutTime: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
});

campgroundsRouter.get("/", async (_req, res) => {
  const campgrounds = await prisma.campground.findMany();
  res.json(campgrounds);
});

campgroundsRouter.post("/", requireAuth([Role.admin]), async (req, res) => {
  const parsed = campgroundSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.format() });
  const campground = await prisma.campground.create({ data: parsed.data });
  res.status(201).json(campground);
});

campgroundsRouter.put(
  "/:id",
  requireAuth(),
  requireCampgroundRole([CampgroundRole.owner, CampgroundRole.manager]),
  async (req: AuthRequest, res) => {
    const parsed = campgroundSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ errors: parsed.error.format() });
    const campground = await prisma.campground.update({ where: { id: req.params.id }, data: parsed.data });
    res.json(campground);
  }
);

campgroundsRouter.delete(
  "/:id",
  requireAuth([Role.admin]),
  async (req, res) => {
    await prisma.campground.delete({ where: { id: req.params.id } });
    res.status(204).send();
  }
);

const chargeSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(["tax", "fee"]),
  basis: z.enum(["per_stay", "per_night", "per_person", "per_pet"]).optional(),
  amountCents: z.number().int().nonnegative().optional(),
  percentage: z.number().int().min(0).max(10000).optional(),
  appliesToPets: z.boolean().optional(),
  appliesToSites: z.boolean().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

campgroundsRouter.get(
  "/:id/settings",
  requireAuth(),
  requireCampgroundRole([
    CampgroundRole.owner,
    CampgroundRole.manager,
    CampgroundRole.finance,
    CampgroundRole.marketing,
    CampgroundRole.front_desk,
    CampgroundRole.read_only,
  ]),
  async (req, res) => {
    const campground = await prisma.campground.findUnique({
      where: { id: req.params.id },
      include: { charges: true, policies: true },
    });
    res.json(campground);
  }
);

campgroundsRouter.post(
  "/:id/charges",
  requireAuth(),
  requireCampgroundRole([CampgroundRole.owner, CampgroundRole.manager, CampgroundRole.finance]),
  async (req, res) => {
    const parsed = chargeSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ errors: parsed.error.format() });
    const charge = await prisma.campgroundCharge.create({
      data: {
        ...parsed.data,
        campgroundId: req.params.id,
        startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : undefined,
        endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : undefined,
      },
    });
    res.status(201).json(charge);
  }
);

const policySchema = z.object({
  cancellationPolicy: z.string().optional(),
  refundPolicy: z.string().optional(),
  quietHours: z.string().optional(),
  petPolicy: z.string().optional(),
  lateArrivalPolicy: z.string().optional(),
  bookingWindowDays: z.number().int().positive().optional(),
  allowSameDayBookings: z.boolean().optional(),
});

campgroundsRouter.put(
  "/:id/policies",
  requireAuth(),
  requireCampgroundRole([CampgroundRole.owner, CampgroundRole.manager]),
  async (req, res) => {
    const parsed = policySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ errors: parsed.error.format() });

    const policy = await prisma.campgroundPolicy.upsert({
      where: { campgroundId: req.params.id },
      update: parsed.data,
      create: { campgroundId: req.params.id, ...parsed.data },
    });
    res.json(policy);
  }
);

const membershipSchema = z.object({
  userId: z.string(),
  role: z.enum([
    "owner",
    "manager",
    "front_desk",
    "maintenance",
    "finance",
    "marketing",
    "read_only",
  ]),
});

campgroundsRouter.post(
  "/:id/memberships",
  requireAuth(),
  requireCampgroundRole([CampgroundRole.owner, CampgroundRole.manager]),
  async (req, res) => {
    const parsed = membershipSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ errors: parsed.error.format() });

    const membership = await prisma.campgroundMembership.upsert({
      where: { userId_campgroundId: { userId: parsed.data.userId, campgroundId: req.params.id } },
      create: { campgroundId: req.params.id, userId: parsed.data.userId, role: parsed.data.role as CampgroundRole },
      update: { role: parsed.data.role as CampgroundRole },
    });
    res.status(201).json(membership);
  }
);

export { campgroundsRouter };
