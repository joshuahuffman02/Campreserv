import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";

const campgroundsRouter = Router();

const createCampgroundSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
});

campgroundsRouter.get("/", async (_req, res) => {
  try {
    const campgrounds = await prisma.campground.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        city: true,
        state: true,
        country: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(campgrounds);
  } catch (error) {
    res.status(500).json({ message: "Failed to load campgrounds", error: `${error}` });
  }
});

campgroundsRouter.post("/", async (req, res) => {
  const parsed = createCampgroundSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten() });
  }

  try {
    const campground = await prisma.campground.create({ data: parsed.data });
    res.status(201).json(campground);
  } catch (error) {
    res.status(500).json({ message: "Failed to create campground", error: `${error}` });
  }
});

export { campgroundsRouter };
