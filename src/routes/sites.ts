import { Router } from "express";
import { prisma } from "../prisma";

const sitesRouter = Router();

sitesRouter.get("/:campgroundId/sites", async (req, res) => {
  const { campgroundId } = req.params;

  try {
    const sites = await prisma.site.findMany({
      where: { campgroundId },
      include: {
        siteType: {
          select: {
            id: true,
            name: true,
            occupancyMax: true,
            basePriceCents: true,
            petFriendly: true,
          },
        },
      },
      orderBy: { nameOrNumber: "asc" },
    });

    res.json(sites);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch sites", error: `${error}` });
  }
});

export { sitesRouter };
