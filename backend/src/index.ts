import express from "express";
import cors from "cors";
import { initDb, seedIfEmpty } from "./db";

import { appointmentsRouter } from "./routes/appointments";
import { patientsRouter } from "./routes/patients";
import { queueRouter } from "./routes/queue";
import { stockRouter } from "./routes/stock";
import { billingRouter } from "./routes/billing";
import { staffRouter } from "./routes/staff";
import { authRouter, authenticate } from "./routes/auth";
import { consultationsRouter } from "./routes/consultations";

const app = express();
const PORT = process.env.PORT || 9876;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ status: "ok", clinic: "Dr. Sudharsan's Children's Clinic" }));

app.use("/api/auth", authRouter);

app.use("/api/appointments", authenticate, appointmentsRouter);
app.use("/api/patients", authenticate, patientsRouter);
app.use("/api/queue", authenticate, queueRouter);
app.use("/api/stock", authenticate, stockRouter);
app.use("/api/invoices", authenticate, billingRouter);
app.use("/api/staff", authenticate, staffRouter);
app.use("/api/consultations", authenticate, consultationsRouter);

async function start() {
  try {
    await initDb();
    await seedIfEmpty();
    console.log("Database initialized and seeded");

    if (!process.env.VERCEL) {
      app.listen(PORT, () => {
        console.log(`Clinic backend running at http://localhost:${PORT}`);
      });
    }
  } catch (error) {
    console.error("Failed to start server:", error);
  }
}

start();

if (process.env.VERCEL) {
  module.exports = app;
}
