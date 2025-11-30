import { Router } from "express";
import { z } from "zod";
import { findAvailableSites } from "../services/availabilityService";
import { prisma } from "../prisma";

const availabilityRouter = Router();

const querySchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  campgroundId: z.string(),
  siteTypeIds: z.string().optional(),
  petFriendly: z.string().optional(),
  minLengthFt: z.string().optional(),
  hasWater: z.string().optional(),
  hasSewer: z.string().optional(),
  electricAmps: z.string().optional(),
});

availabilityRouter.get("/", async (req, res) => {
  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.format() });
  const { startDate, endDate, campgroundId, siteTypeIds, petFriendly, minLengthFt, hasWater, hasSewer, electricAmps } = parsed.data;

  try {
    const [sites, campground] = await Promise.all([
      findAvailableSites(startDate, endDate, {
        campgroundId,
        siteTypeIds: siteTypeIds ? siteTypeIds.split(",") : undefined,
        petFriendly: petFriendly ? petFriendly === "true" : undefined,
        minLengthFt: minLengthFt ? Number(minLengthFt) : undefined,
        hasWater: hasWater ? hasWater === "true" : undefined,
        hasSewer: hasSewer ? hasSewer === "true" : undefined,
        electricAmps: electricAmps ? (electricAmps.split(",").map((v) => Number(v)) as (20 | 30 | 50)[]) : undefined,
      }),
      prisma.campground.findUnique({
        where: { id: campgroundId },
        include: { charges: true, policies: true },
      }),
    ]);
    res.json({ sites, charges: campground?.charges ?? [], policies: campground?.policies ?? null });
  } catch (err) {
    return res.status(400).json({ message: "Could not search availability", error: `${err}` });
  }
});

export { availabilityRouter };
