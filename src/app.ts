import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "node:path";
import { campgroundsRouter } from "./routes/campgrounds";
import { sitesRouter } from "./routes/sites";
import { reservationsRouter } from "./routes/reservations";

dotenv.config();

const app = express();
const publicDir = path.join(process.cwd(), "public");

app.use(cors());
app.use(express.json());
app.use(express.static(publicDir));

app.get("/", (req, res) => {
  if (req.accepts("html")) {
    return res.sendFile(path.join(publicDir, "index.html"));
  }

  res.json({ status: "ok", message: "Campreserv API is running" });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", message: "Campreserv API is running" });
});

app.use("/campgrounds", campgroundsRouter);
app.use("/campgrounds", sitesRouter);
app.use("/reservations", reservationsRouter);

export { app };
