import { Router } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { requireAuth, requireCampgroundRole } from "../middleware/auth";
import { CampgroundRole, Role } from "@prisma/client";

const sitesRouter = Router();

const siteSchema = z.object({
  campgroundId: z.string(),
  siteTypeId: z.string(),
  nameOrNumber: z.string(),
  occupancyMaxOverride: z.number().int().positive().optional(),
  lengthLimitFtOverride: z.number().int().positive().optional(),
  priceOverrideCents: z.number().int().positive().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().optional(),
});

sitesRouter.get("/", async (req, res) => {
  const campgroundId = req.query.campgroundId as string | undefined;
  const sites = await prisma.site.findMany({
    where: campgroundId ? { campgroundId } : undefined,
    include: { siteType: true },
  });
  res.json(sites);
});

sitesRouter.post(
  "/",
  requireAuth(),
  requireCampgroundRole([CampgroundRole.owner, CampgroundRole.manager, CampgroundRole.maintenance]),
  async (req, res) => {
    const parsed = siteSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ errors: parsed.error.format() });
    const site = await prisma.site.create({ data: parsed.data });
    res.status(201).json(site);
  }
);

sitesRouter.put(
  "/:id",
  requireAuth(),
  requireCampgroundRole([CampgroundRole.owner, CampgroundRole.manager, CampgroundRole.maintenance]),
  async (req, res) => {
    const parsed = siteSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ errors: parsed.error.format() });
    const site = await prisma.site.update({ where: { id: req.params.id }, data: parsed.data });
    res.json(site);
  }
);

sitesRouter.delete(
  "/:id",
  requireAuth([Role.admin]),
  async (req, res) => {
    await prisma.site.delete({ where: { id: req.params.id } });
    res.status(204).send();
  }
);

export { sitesRouter };
