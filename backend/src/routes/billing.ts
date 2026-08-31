import { Router } from "express";
import { db } from "../db";
import { Invoice } from "../types";

export const billingRouter = Router();

billingRouter.get("/", (_req, res) => {
  const rows = db.prepare("SELECT * FROM invoices ORDER BY id").all();
  res.json(rows);
});

billingRouter.post("/", (req, res) => {
  const { patient, amount } = req.body as Partial<Invoice>;
  if (!patient || !amount) return res.status(400).json({ error: "patient and amount are required" });
  const count = (db.prepare("SELECT COUNT(*) AS c FROM invoices").get() as any).c;
  const id = `INV-${2205 + count}`;
  const date = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  db.prepare("INSERT INTO invoices (id, patient, amount, date, status) VALUES (?, ?, ?, ?, 'Pending')").run(
    id,
    patient,
    Number(amount),
    date
  );
  const created = db.prepare("SELECT * FROM invoices WHERE id = ?").get(id);
  res.status(201).json(created);
});

billingRouter.patch("/:id/toggle-paid", (req, res) => {
  const invoice = db.prepare("SELECT * FROM invoices WHERE id = ?").get(req.params.id) as
    | Invoice
    | undefined;
  if (!invoice) return res.status(404).json({ error: "not found" });
  const nextStatus = invoice.status === "Paid" ? "Pending" : "Paid";
  db.prepare("UPDATE invoices SET status = ? WHERE id = ?").run(nextStatus, req.params.id);
  const updated = db.prepare("SELECT * FROM invoices WHERE id = ?").get(req.params.id);
  res.json(updated);
});
