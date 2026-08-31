import { Router } from "express";
import { query } from "../db";

export const billingRouter = Router();

billingRouter.get("/", async (_req, res) => {
  try {
    const result = await query("SELECT * FROM invoices ORDER BY id");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});

billingRouter.post("/", async (req, res) => {
  try {
    const { patient, amount } = req.body;
    if (!patient || !amount) return res.status(400).json({ error: "patient and amount are required" });
    const countResult = await query("SELECT COUNT(*) AS c FROM invoices");
    const count = parseInt(countResult.rows[0].c);
    const id = `INV-${2205 + count}`;
    const date = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const result = await query(
      "INSERT INTO invoices (id, patient, amount, date, status) VALUES ($1, $2, $3, $4, 'Pending') RETURNING *",
      [id, patient, Number(amount), date]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to create invoice" });
  }
});

billingRouter.patch("/:id/toggle-paid", async (req, res) => {
  try {
    const invoiceResult = await query("SELECT * FROM invoices WHERE id = $1", [req.params.id]);
    if (invoiceResult.rows.length === 0) return res.status(404).json({ error: "not found" });
    const invoice = invoiceResult.rows[0];
    const nextStatus = invoice.status === "Paid" ? "Pending" : "Paid";
    const result = await query("UPDATE invoices SET status = $1 WHERE id = $2 RETURNING *", [nextStatus, req.params.id]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to toggle invoice status" });
  }
});
