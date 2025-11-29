import { Router } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { requireAuth, requireCampgroundRole } from "../middleware/auth";
import { CampgroundRole, DealType, Role } from "@prisma/client";

const dealsRouter = Router();

const dealSchema = z.object({
  campgroundId: z.string(),
  title: z.string().min(2),
  description: z.string().optional(),
  dealType: z.nativeEnum(DealType),
  discountValue: z.number().int().nonnegative(),
  startDate: z.string(),
  endDate: z.string(),
  minNights: z.number().int().optional(),
  autoApply: z.boolean().optional(),
  siteTypeId: z.string().optional(),
  eventId: z.string().optional(),
});

dealsRouter.get("/", async (req, res) => {
  const query = z
    .object({
      campgroundId: z.string().optional(),
      activeOn: z.string().optional(),
      eventId: z.string().optional(),
    })
    .safeParse(req.query);
  if (!query.success) return res.status(400).json({ errors: query.error.format() });

  const { campgroundId, activeOn, eventId } = query.data;
  const nowDate = activeOn ? new Date(activeOn) : undefined;

  const deals = await prisma.deal.findMany({
    where: {
      campgroundId,
      eventId,
      startDate: nowDate ? { lte: nowDate } : undefined,
      endDate: nowDate ? { gte: nowDate } : undefined,
    },
    orderBy: { startDate: "asc" },
  });

  res.json(deals);
});

dealsRouter.post(
  "/",
  requireAuth(),
  requireCampgroundRole([CampgroundRole.owner, CampgroundRole.manager, CampgroundRole.marketing]),
  async (req, res) => {
    const parsed = dealSchema.safeParse(req.body);
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

dealsRouter.put(
  "/:id",
  requireAuth(),
  requireCampgroundRole([CampgroundRole.owner, CampgroundRole.manager, CampgroundRole.marketing]),
  async (req, res) => {
    const parsed = dealSchema.partial().safeParse(req.body);
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

dealsRouter.delete("/:id", requireAuth([Role.admin]), async (req, res) => {
  await prisma.deal.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export { dealsRouter };
