import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { requireAuth, requireCampgroundRole } from "../middleware/auth";
import { CampgroundRole } from "@prisma/client";

const eventsRouter = Router();

const eventSchema = z.object({
  campgroundId: z.string(),
  title: z.string().min(2),
  summary: z.string().optional(),
  description: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  heroImageUrl: z.string().url().optional(),
  featured: z.boolean().optional(),
  ctaLabel: z.string().optional(),
});

eventsRouter.get("/", async (req, res) => {
  const query = z
    .object({ campgroundId: z.string().optional(), featured: z.string().optional() })
    .safeParse(req.query);
  if (!query.success) return res.status(400).json({ errors: query.error.format() });

  const { campgroundId, featured } = query.data;
  const events = await prisma.event.findMany({
    where: {
      campgroundId: campgroundId,
      featured: featured ? featured === "true" : undefined,
    },
    orderBy: [{ featured: "desc" }, { startDate: "asc" }],
    include: { deals: true },
  });
  res.json(events);
});

eventsRouter.post(
  "/",
  requireAuth(),
  requireCampgroundRole([CampgroundRole.owner, CampgroundRole.manager, CampgroundRole.marketing]),
  async (req, res) => {
    const parsed = eventSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ errors: parsed.error.format() });

    const event = await prisma.event.create({
      data: {
        ...parsed.data,
        startDate: new Date(parsed.data.startDate),
        endDate: new Date(parsed.data.endDate),
      },
    });
    res.status(201).json(event);
  }
);

eventsRouter.put(
  "/:id",
  requireAuth(),
  requireCampgroundRole([CampgroundRole.owner, CampgroundRole.manager, CampgroundRole.marketing]),
  async (req, res) => {
    const parsed = eventSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ errors: parsed.error.format() });

    const event = await prisma.event.update({
      where: { id: req.params.id },
      data: {
        ...parsed.data,
        startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : undefined,
        endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : undefined,
      },
    });
    res.json(event);
  }
);

eventsRouter.delete(
  "/:id",
  requireAuth(),
  requireCampgroundRole([CampgroundRole.owner, CampgroundRole.manager]),
  async (req, res) => {
    await prisma.event.delete({ where: { id: req.params.id } });
    res.status(204).send();
  }
);

export { eventsRouter };
