import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { normalizeDateRange } from "../utils/dateRange";

type AvailabilityFilter = {
  campgroundId: string;
  siteTypeIds?: string[];
  petFriendly?: boolean;
  minLengthFt?: number;
  hasWater?: boolean;
  hasSewer?: boolean;
  electricAmps?: (20 | 30 | 50)[];
};

export const findAvailableSites = async (
  startDate: string,
  endDate: string,
  filters: AvailabilityFilter
) => {
  const range = normalizeDateRange(startDate, endDate);

  const electricConditions = filters.electricAmps?.map((amp) => {
    const column =
      amp === 20 ? "hasElectric20" : amp === 30 ? "hasElectric30" : "hasElectric50";
    return { [column]: true } as Record<string, boolean>;
  });

  const where: Prisma.SiteWhereInput = {
    campgroundId: filters.campgroundId,
    isActive: true,
    siteType: {
      id: filters.siteTypeIds ? { in: filters.siteTypeIds } : undefined,
      petFriendly: filters.petFriendly,
      lengthLimitFt: filters.minLengthFt ? { gte: filters.minLengthFt } : undefined,
      hasWater: filters.hasWater,
      hasSewer: filters.hasSewer,
      AND: electricConditions,
    },
    blackouts: {
      none: {
        AND: [
          { startDate: { lt: range.end } },
          { endDate: { gt: range.start } },
        ],
      },
    },
    maintenanceBlocks: {
      none: {
        AND: [
          { startDate: { lt: range.end } },
          { endDate: { gt: range.start } },
        ],
      },
    },
    reservations: {
      none: {
        status: { in: ["pending", "confirmed", "checked_in"] },
        AND: [
          { arrivalDate: { lt: range.end } },
          { departureDate: { gt: range.start } },
        ],
      },
    },
  };

  const availableSites = await prisma.site.findMany({
    where,
    include: {
      siteType: true,
      pricingRules: true,
    },
  });

  return availableSites;
};
