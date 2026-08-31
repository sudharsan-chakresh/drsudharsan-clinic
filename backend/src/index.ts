import express from "express";
import cors from "cors";
import "./db";

import { appointmentsRouter } from "./routes/appointments";
import { patientsRouter } from "./routes/patients";
import { queueRouter } from "./routes/queue";
import { stockRouter } from "./routes/stock";
import { billingRouter } from "./routes/billing";
import { staffRouter } from "./routes/staff";
import { authRouter } from "./routes/auth";
import { consultationsRouter } from "./routes/consultations";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ status: "ok", clinic: "Dr. Sudharsan's Children's Clinic" }));

app.use("/api/auth", authRouter);
app.use("/api/appointments", appointmentsRouter);
app.use("/api/patients", patientsRouter);
app.use("/api/queue", queueRouter);
app.use("/api/stock", stockRouter);
app.use("/api/invoices", billingRouter);
app.use("/api/staff", staffRouter);
app.use("/api/consultations", consultationsRouter);

if (process.env.VERCEL) {
  module.exports = app;
} else {
  app.listen(PORT, () => {
    console.log(`Clinic backend running at http://localhost:${PORT}`);
  });
}
