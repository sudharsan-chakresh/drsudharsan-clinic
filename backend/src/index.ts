import express from "express";
import cors from "cors";
import { initDb, seedIfEmpty, query } from "./db";
import { initDrugMaster, seedDrugs } from "./drugs";

import { appointmentsRouter } from "./routes/appointments";
import { patientsRouter } from "./routes/patients";
import { queueRouter } from "./routes/queue";
import { stockRouter } from "./routes/stock";
import { billingRouter } from "./routes/billing";
import { staffRouter } from "./routes/staff";
import { authRouter, authenticate } from "./routes/auth";
import { generateToken } from "./auth";
import { consultationsRouter } from "./routes/consultations";
import { drugsRouter } from "./routes/drugs";

const app = express();
const PORT = process.env.PORT || 9876;

app.use(cors());
app.use(express.json());

let dbInitialized = false;

async function ensureDb() {
  if (dbInitialized) return;
  dbInitialized = true;
  try {
    await initDb();
    await seedIfEmpty();
    await initDrugMaster();
    await seedDrugs();
    console.log("Database initialized and seeded");
  } catch (error) {
    console.error("Failed to initialize database:", error);
    dbInitialized = false;
  }
}

app.get("/api/ping", (_req, res) => {
  res.json({ status: "pong", time: new Date().toISOString() });
});

app.get("/api/health", async (_req, res) => {
  const health: any = {
    status: "ok",
    clinic: "Dr. Sudharsan's Children's Clinic",
    hasDbUrl: !!process.env.DATABASE_URL,
    nodeEnv: process.env.NODE_ENV,
    vercel: !!process.env.VERCEL,
  };

  try {
    await ensureDb();
    const result = await query("SELECT NOW() as time");
    health.db = "connected";
    health.time = result.rows[0].time;
  } catch (error: any) {
    console.error("Health check error:", error);
    health.db = "disconnected";
    health.error = error.message;
    health.code = error.code;
  }

  res.json(health);
});

app.get("/api/test-login", async (req, res) => {
  try {
    const result = await query("SELECT id, email, name, role FROM users WHERE email = $1", ["admin@clinic.com"]);
    if (result.rows.length === 0) {
      return res.json({ error: "User not found" });
    }
    const user = result.rows[0];
    const token = generateToken(user.id);
    res.json({ user, token, message: "Use this token to test authenticated endpoints" });
  } catch (error: any) {
    res.json({ error: error.message });
  }
});

app.use("/api/auth", authRouter);

app.use("/api/appointments", authenticate, appointmentsRouter);
app.use("/api/patients", authenticate, patientsRouter);
app.use("/api/queue", authenticate, queueRouter);
app.use("/api/stock", authenticate, stockRouter);
app.use("/api/invoices", authenticate, billingRouter);
app.use("/api/staff", authenticate, staffRouter);
app.use("/api/consultations", authenticate, consultationsRouter);
app.use("/api/drugs", authenticate, drugsRouter);

async function start() {
  console.log("Starting backend...");
  console.log("DATABASE_URL set:", !!process.env.DATABASE_URL);
  console.log("JWT_SECRET set:", !!process.env.JWT_SECRET);

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set!");
  }

  if (!process.env.VERCEL) {
    try {
      await ensureDb();
      console.log("Database initialized and seeded");
    } catch (error) {
      console.error("Failed to initialize database:", error);
    }

    app.listen(PORT, () => {
      console.log(`Clinic backend running at http://localhost:${PORT}`);
    });
  }
}

start();

if (process.env.VERCEL) {
  module.exports = app;
}
