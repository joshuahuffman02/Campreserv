import express from "express";
import dotenv from "dotenv";
import path from "path";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(express.static("public"));

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

// ----------------------
// Helpers
// ----------------------

function getNightDates(arrival: Date, departure: Date): Date[] {
  const dates: Date[] = [];
  const cur = new Date(arrival);
  cur.setHours(0, 0, 0, 0);
  const end = new Date(departure);
  end.setHours(0, 0, 0, 0);

  while (cur < end) {
    dates.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }

  return dates;
}

async function calculateStayPricing(
  campgroundId: string,
  site: { id: string; kind: string; nightlyRateCents: number },
  arrival: Date,
  departure: Date
) {
  const nightDates = getNightDates(arrival, departure);
  const nights = nightDates.length;

  if (nights <= 0) {
    throw new Error("Departure must be after arrival");
  }

  const rules = await prisma.pricingRule.findMany({
    where: {
      campgroundId,
      isActive: true
    }
  });

  let subtotalCents = 0;
  let baseSubtotalCents = 0;

  const perNightDebug: {
    date: string;
    baseNightlyCents: number;
    adjustedNightlyCents: number;
    flatAdjustCents: number;
    percentAdjustTotal: number;
    appliedRuleIds: string[];
  }[] = [];

  for (const night of nightDates) {
    const baseNightly = site.nightlyRateCents ?? 0;
    let nightly = baseNightly;
    let flatAdjust = 0;
    let percentAdjust = 0;
    const appliedRuleIds: string[] = [];

    const dow = night.getDay(); // 0 = Sun ... 6 = Sat

    for (const rule of rules) {
      if (rule.siteId && rule.siteId !== site.id) continue;
      if (rule.siteKind && rule.siteKind !== site.kind) continue;

      if (rule.startDate && night < rule.startDate) continue;
      if (rule.endDate && night >= rule.endDate) continue;

      if (typeof rule.dayOfWeek === "number" && rule.dayOfWeek !== dow) {
        continue;
      }

      if (rule.minNights && nights < rule.minNights) continue;

      if (typeof rule.flatAdjustCents === "number") {
        flatAdjust += rule.flatAdjustCents;
      }
      if (typeof rule.percentAdjust === "number") {
        percentAdjust += rule.percentAdjust;
      }

      // Track which rules fired for this night
      if (rule.id) {
        appliedRuleIds.push(rule.id);
      }
    }

    nightly += flatAdjust;
    nightly = Math.round(nightly * (1 + percentAdjust));

    baseSubtotalCents += baseNightly;
    subtotalCents += nightly;

    perNightDebug.push({
      date: night.toISOString(),
      baseNightlyCents: baseNightly,
      adjustedNightlyCents: nightly,
      flatAdjustCents: flatAdjust,
      percentAdjustTotal: percentAdjust,
      appliedRuleIds
    });
  }

  const rulesDeltaCents = subtotalCents - baseSubtotalCents;

  const debug = {
    nights,
    nightDates: nightDates.map((d) => d.toISOString()),
    baseSubtotalCents,
    rulesDeltaCents,
    subtotalCents,
    perNight: perNightDebug
  };

  return { nights, subtotalCents, baseSubtotalCents, rulesDeltaCents, debug };
}

// ----------------------
// Reports
// ----------------------

app.get("/reports/daily-revenue", async (req, res) => {
  try {
    const { campgroundId, startDate, endDate } = req.query;

    const where: any = {
      status: { not: "cancelled" }
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
        end.setDate(end.getDate() + 1); // next day exclusive
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
        totalCents: true
      },
      _count: {
        _all: true
      },
      orderBy: {
        arrivalDate: "asc"
      }
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
        totalCents: g._sum?.totalCents ?? 0
      };
    });

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load daily revenue report" });
  }
});

// ----------------------
// Static root
// ----------------------

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

// ----------------------
// Campgrounds
// ----------------------

app.get("/campgrounds", async (_req, res) => {
  try {
    const campgrounds = await prisma.campground.findMany({
      orderBy: { name: "asc" }
    });
    res.json(campgrounds);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load campgrounds" });
  }
});

app.post("/campgrounds", async (req, res) => {
  try {
    const { name, city, state, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: "name is required" });
    }

    const cg = await prisma.campground.create({
      data: {
        name,
        city: city || "",
        state: state || "",
        description: description || "",
        stateTaxPercent: 0,
        localTaxPercent: 0,
        taxesEnabled: true
      }
    });

    res.json(cg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create campground" });
  }
});

app.patch("/campgrounds/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      city,
      state,
      description,
      stateTaxPercent,
      localTaxPercent,
      taxesEnabled
    } = req.body;

    const data: any = {};

    if (typeof name === "string") data.name = name;
    if (typeof city === "string") data.city = city;
    if (typeof state === "string") data.state = state;
    if (typeof description === "string") data.description = description;

    if (typeof stateTaxPercent === "number") {
      data.stateTaxPercent = stateTaxPercent;
    }
    if (typeof localTaxPercent === "number") {
      data.localTaxPercent = localTaxPercent;
    }
    if (typeof taxesEnabled === "boolean") {
      data.taxesEnabled = taxesEnabled;
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    const cg = await prisma.campground.update({
      where: { id },
      data
    });

    res.json(cg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update campground" });
  }
});

// ----------------------
// Sites
// ----------------------

app.get("/sites", async (req, res) => {
  try {
    const { campgroundId } = req.query;

    const where: any = {};
    if (typeof campgroundId === "string") {
      where.campgroundId = campgroundId;
    }

    const sites = await prisma.site.findMany({
      where,
      orderBy: { name: "asc" }
    });

    res.json(sites);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load sites" });
  }
});

app.post("/sites", async (req, res) => {
  try {
    const { campgroundId, name, kind, nightlyRateCents } = req.body;

    if (!campgroundId || !name || !kind) {
      return res.status(400).json({
        error: "campgroundId, name and kind are required"
      });
    }

    const rate =
      typeof nightlyRateCents === "number" ? nightlyRateCents : 0;

    const site = await prisma.site.create({
      data: {
        campgroundId,
        name,
        kind,
        nightlyRateCents: rate
      }
    });

    res.json(site);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create site" });
  }
});

app.patch("/sites/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, kind, nightlyRateCents } = req.body;

    const data: any = {};
    if (typeof name === "string") data.name = name;
    if (typeof kind === "string") data.kind = kind;
    if (typeof nightlyRateCents === "number") {
      data.nightlyRateCents = nightlyRateCents;
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    const site = await prisma.site.update({
      where: { id },
      data
    });

    res.json(site);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update site" });
  }
});


// ----------------------
// Pricing Rules
// ----------------------

function generatePricingRuleLabel(args: {
  ruleType: string;
  startDate?: string;
  endDate?: string;
  dayOfWeek?: number | null;
  flatAdjustCents?: number | null;
  percentAdjust?: number | null;
  minNights?: number | null;
}) {
  const {
    ruleType,
    startDate,
    endDate,
    dayOfWeek,
    flatAdjustCents,
    percentAdjust,
    minNights
  } = args;

  // Weekend rule
  if (ruleType === "weekend") {
    if (flatAdjustCents) {
      return `Weekend +$${(flatAdjustCents / 100).toFixed(2)}`;
    }
    if (percentAdjust) {
      const sign = percentAdjust > 0 ? "+" : "";
      return `Weekend ${sign}${percentAdjust}%`;
    }
    return "Weekend Rate Rule";
  }

  // Weekday rule
  if (ruleType === "weekday") {
    return "Weekday Rate Rule";
  }

  // Day of week rule
  if (ruleType === "dayOfWeek" && typeof dayOfWeek === "number") {
    const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const name = names[dayOfWeek] ?? `Day ${dayOfWeek}`;
    return `${name} Adjustment`;
  }

  // Date range rule
  if (ruleType === "dateRange" && startDate && endDate) {
    return `Rate Adjust ${startDate}–${endDate}`;
  }

  // Min nights rule
  if (minNights && minNights > 1) {
    return `Min Stay ${minNights} Nights`;
  }

  // Fallback
  return `${ruleType} rule`;
}

// List pricing rules (optionally by campground)
app.get("/pricing-rules", async (req, res) => {
  try {
    const { campgroundId } = req.query;

    const where: any = {};
    if (campgroundId) {
      where.campgroundId = String(campgroundId);
    }

    const rules = await prisma.pricingRule.findMany({
      where,
      orderBy: [
        { campgroundId: "asc" },
        { startDate: "asc" },
        { createdAt: "desc" }
      ]
    });

    res.json(rules);
  } catch (err) {
    console.error("Error loading pricing rules:", err);
    res.status(500).json({ error: "Failed to load pricing rules" });
  }
});
// ----------------------
// Availability
// ----------------------

// Very simple availability for now:
// - takes campgroundId, startDate, endDate in the query
// - returns all sites for that campground (we'll add conflict checks later)
app.get("/availability", async (req, res) => {
  try {
    const { campgroundId, startDate, endDate } = req.query;

    if (typeof campgroundId !== "string") {
      return res.status(400).json({ error: "campgroundId is required" });
    }

    // We accept startDate / endDate for future use, but don't enforce yet
    // so the UI always gets data.
    const sites = await prisma.site.findMany({
      where: { campgroundId },
      orderBy: { name: "asc" }
    });

    const result = sites.map((s) => ({
      id: s.id,
      name: s.name,
      kind: s.kind,
      // default to 0 if not set, UI handles it
      nightlyRateCents: (s as any).nightlyRateCents ?? 0
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load availability" });
  }
});

// ----------------------
// Reservations
// ----------------------

// List reservations (optionally filtered by campground)
app.get("/reservations", async (req, res) => {
  try {
    const { campgroundId } = req.query;
    const where: any = {};

    if (typeof campgroundId === "string" && campgroundId.trim() !== "") {
      where.campgroundId = campgroundId;
    }

    const reservations = await prisma.reservation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        site: true,
        campground: true
      }
    });
app.delete("/reservations/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Reservation id is required" });
    }

    await prisma.reservation.delete({
      where: { id }
    });

    res.json({ ok: true });
  } catch (err) {
    console.error("Failed to delete reservation", err);
    res.status(500).json({ error: "Failed to delete reservation" });
  }
});
    // --- 5. After campgrounds load, refresh the other panels ---
    if (typeof loadAllSites === "function") {
      await loadAllSites();
    }
    if (typeof loadReservations === "function") {
      await loadReservations();
    }
    if (typeof loadPricingRules === "function") {
      await loadPricingRules();
    }
    res.json(reservations);
  } catch (err) {
    console.error("Error loading reservations:", err);
    res.status(500).json({ error: "Failed to load reservations" });
  }
});

// Create a reservation with basic pricing and tax calculation
app.post("/reservations", async (req, res) => {
  try {
    const {
      campgroundId,
      siteId,
      guestFirstName,
      guestLastName,
      guestEmail,
      arrivalDate,
      departureDate,
      adults,
      kids,
      pets
    } = req.body;

    // Basic validation
    if (
      !campgroundId ||
      !siteId ||
      !guestFirstName ||
      !guestLastName ||
      !guestEmail ||
      !arrivalDate ||
      !departureDate
    ) {
      return res
        .status(400)
        .json({ error: "Missing required fields for reservation" });
    }

    const arrival = new Date(arrivalDate);
    const departure = new Date(departureDate);

    if (isNaN(arrival.getTime()) || isNaN(departure.getTime())) {
      return res
        .status(400)
        .json({ error: "Invalid arrival or departure date" });
    }

    if (departure <= arrival) {
      return res
        .status(400)
        .json({ error: "Departure must be after arrival" });
    }

    // Look up site and campground so we can price correctly
    const site = await prisma.site.findUnique({
      where: { id: siteId }
    });

    if (!site) {
      return res.status(400).json({ error: "Unknown site" });
    }

    const campground = await prisma.campground.findUnique({
      where: { id: campgroundId }
    });

    if (!campground) {
      return res.status(400).json({ error: "Unknown campground" });
    }

    // Use your pricing engine
    const {
      nights,
      subtotalCents,
      baseSubtotalCents,
      rulesDeltaCents,
      debug
    } = await calculateStayPricing(
      campgroundId,
      {
        id: site.id,
        kind: site.kind,
        nightlyRateCents: site.nightlyRateCents ?? 0
      },
      arrival,
      departure
    );

    // Tax based on campground's state + local tax %
    const taxPercentTotal =
      (campground.stateTaxPercent ?? 0) +
      (campground.localTaxPercent ?? 0);

     const taxCents = Math.round(subtotalCents * (taxPercentTotal / 100));
    const feesCents = 0; // placeholder for future resort / cleaning fees
    const totalCents = subtotalCents + taxCents + feesCents;

    const reservation = await prisma.reservation.create({
      data: {
        campgroundId,
        siteId,
        guestFirstName,
        guestLastName,
        guestEmail,
        status: "pending",
        arrivalDate: arrival,
        departureDate: departure,
        nights,
        subtotalCents,
        taxCents,
        // don't send feesCents since the column doesn't exist
        totalCents,
      }
    });

    res.json({
      ...reservation,
      baseSubtotalCents,
      rulesDeltaCents,
      taxCents,
      totalCents,
      pricingDebug: debug
    });

  } catch (err) {
    console.error("Error creating reservation:", err);
    res.status(500).json({ error: "Failed to create reservation" });
  }
});


// Create a pricing rule
app.post("/pricing-rules", async (req, res) => {
  try {
    const {
      campgroundId,
      siteId,
      siteKind,
      ruleType,
      startDate,
      endDate,
      dayOfWeek,
      flatAdjustCents,
      percentAdjust,
      minNights,
      isActive,
      label: labelFromBody
    } = req.body;

    if (!campgroundId || !ruleType) {
      return res
        .status(400)
        .json({ error: "campgroundId and ruleType are required" });
    }

    // If no label is provided, auto-generate a friendly one
    const label =
      typeof labelFromBody === "string" && labelFromBody.trim() !== ""
        ? labelFromBody.trim()
        : generatePricingRuleLabel({
            ruleType,
            startDate,
            endDate,
            dayOfWeek,
            flatAdjustCents,
            percentAdjust,
            minNights
          });

    const rule = await prisma.pricingRule.create({
      data: {
        campgroundId,
        siteId: siteId ?? null,
        siteKind: siteKind ?? null,
        ruleType,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        dayOfWeek: dayOfWeek ?? null,
        flatAdjustCents: flatAdjustCents ?? null,
        percentAdjust: percentAdjust ?? null,
        minNights: minNights ?? null,
        isActive: typeof isActive === "boolean" ? isActive : true,
        label
      }
    });

    res.json(rule);
  } catch (err) {
    console.error("Error creating pricing rule:", err);
    res.status(500).json({ error: "Failed to create pricing rule" });
  }
});

// Toggle active / update rule
app.patch("/pricing-rules/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body ?? {};

    const data: any = {};
    if (typeof isActive === "boolean") {
      data.isActive = isActive;
    }

    const updated = await prisma.pricingRule.update({
      where: { id },
      data
    });

    res.json(updated);
  } catch (err) {
    console.error("Error updating pricing rule:", err);
    res.status(500).json({ error: "Failed to update pricing rule" });
  }
});

// Delete a pricing rule
app.delete("/pricing-rules/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Pricing rule id is required" });
    }

    await prisma.pricingRule.delete({
      where: { id }
    });

    res.json({ ok: true });
  } catch (err) {
    console.error("Error deleting pricing rule:", err);
    res.status(500).json({ error: "Failed to delete pricing rule" });
  }
});
const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  console.log(`Campreserv API listening on port ${port}`);
});