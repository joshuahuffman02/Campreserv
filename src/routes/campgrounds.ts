import { Router } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { requireAuth } from "../middleware/auth";
import { Role } from "@prisma/client";

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

campgroundsRouter.put("/:id", requireAuth([Role.admin]), async (req, res) => {
  const parsed = campgroundSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.format() });
  const campground = await prisma.campground.update({ where: { id: req.params.id }, data: parsed.data });
  res.json(campground);
});

campgroundsRouter.delete("/:id", requireAuth([Role.admin]), async (req, res) => {
  await prisma.campground.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export { campgroundsRouter };
