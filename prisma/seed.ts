import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// ... existing routes for campgrounds, sites, reservations ...

// Reservations endpoints (GET, POST, DELETE if present)
// Assuming these are already defined above

// ----------------------
// Reports / Accounting
// ----------------------

app.get("/reports/daily-revenue", async (req, res) => {
  try {
    const { campgroundId, startDate, endDate } = req.query;

    const where: any = {
      status: { not: "cancelled" },
    };

    if (typeof campgroundId === "string" && campgroundId.trim() !== "") {
      where.campgroundId = campgroundId;
    }

    if (typeof startDate === "string" && startDate) {
      const start = new Date(startDate);
      if (!isNaN(start.getTime())) {
        where.arrivalDate = where.arrivalDate || {};
        where.arrivalDate.gte = start;
      }
    }

    if (typeof endDate === "string" && endDate) {
      const end = new Date(endDate);
      if (!isNaN(end.getTime())) {
        where.arrivalDate = where.arrivalDate || {};
        // exclusive upper bound on the next day
        end.setDate(end.getDate() + 1);
        where.arrivalDate.lt = end;
      }
    }

    const grouped = await prisma.reservation.groupBy({
      by: ["arrivalDate", "campgroundId"],
      where,
      _sum: {
        nights: true,
        subtotalCents: true,
        taxCents: true,
        totalCents: true,
      },
      _count: {
        _all: true,
      },
      orderBy: {
        arrivalDate: "asc",
      },
    });

    const rows = grouped.map((g) => {
      const d = new Date(g.arrivalDate as any);
      const dateStr = d.toISOString().slice(0, 10);
      return {
        date: dateStr,
        campgroundId: g.campgroundId,
        reservationsCount: g._count?._all ?? 0,
        nights: g._sum?.nights ?? 0,
        subtotalCents: g._sum?.subtotalCents ?? 0,
        taxCents: g._sum?.taxCents ?? 0,
        totalCents: g._sum?.totalCents ?? 0,
      };
    });

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load daily revenue report" });
  }
});

// ... any other routes ...

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});