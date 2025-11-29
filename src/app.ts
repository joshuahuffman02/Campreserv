import express from "express";
import cors from "cors";
import { json } from "express";
import { authRouter } from "./routes/auth";
import { campgroundsRouter } from "./routes/campgrounds";
import { sitesRouter } from "./routes/sites";
import { availabilityRouter } from "./routes/availability";
import { reservationsRouter } from "./routes/reservations";
import { eventsRouter } from "./routes/events";
import { dealsRouter } from "./routes/deals";

const app = express();

app.use(cors());
app.use(json());

app.use("/auth", authRouter);
app.use("/campgrounds", campgroundsRouter);
app.use("/sites", sitesRouter);
app.use("/availability", availabilityRouter);
app.use("/reservations", reservationsRouter);
app.use("/events", eventsRouter);
app.use("/deals", dealsRouter);

app.get("/health", (_req, res) => res.json({ status: "ok" }));

export { app };
