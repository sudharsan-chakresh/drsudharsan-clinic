import { Router } from "express";
import { query } from "../db";

export type StockImportRow = {
  name: string;
  category: string;
  qty: number;
  reorder: number;
  unit: string;
};

function normalizeColumnName(value: string): string {
  return value
    .replace(/\uFEFF/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function splitCsvLine(line: string): string[] {
  const delimiter = line.includes(";") && !line.includes(",") ? ";" : ",";
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === delimiter && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

const headerAliases: Record<string, string[]> = {
  name: ["name", "item name", "item", "product", "medicine", "drug", "stock item", "stock name"],
  qty: ["qty", "quantity", "current stock qty", "stock qty", "available qty", "available", "count"],
  category: ["category", "type", "stock type", "group", "class"],
  reorder: ["reorder level", "reorder", "minimum level", "threshold", "alert level", "stock reorder"],
  unit: ["unit", "units", "uom", "pack", "measure", "pack size", "primary form available"],
};

function findHeaderIndex(header: string[], aliases: string[]): number {
  const normalizedAliases = aliases.map(normalizeColumnName);
  return header.findIndex((column) => normalizedAliases.includes(column));
}

export function parseStockImportRows(csvText: string): StockImportRow[] {
  const normalized = (csvText ?? "").trim();
  if (!normalized) return [];

  const rows = normalized.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (rows.length < 2) {
    throw new Error("CSV import requires a header row and at least one stock item");
  }

  const header = splitCsvLine(rows[0]).map(normalizeColumnName);
  const required = ["name", "qty"] as const;
  const missingFields = required.filter((field) => findHeaderIndex(header, headerAliases[field] ?? [field]) === -1);

  if (missingFields.length > 0) {
    throw new Error(`CSV import is missing required columns: ${missingFields.join(", ")}`);
  }

  const nameIndex = findHeaderIndex(header, headerAliases.name);
  const qtyIndex = findHeaderIndex(header, headerAliases.qty);
  const categoryIndex = findHeaderIndex(header, headerAliases.category);
  const reorderIndex = findHeaderIndex(header, headerAliases.reorder);
  const unitIndex = findHeaderIndex(header, headerAliases.unit);

  const items: StockImportRow[] = [];

  for (let index = 1; index < rows.length; index += 1) {
    const values = splitCsvLine(rows[index]);
    if (values.every((value) => value.trim() === "")) continue;

    const name = (values[nameIndex] ?? "").trim();
    const qty = Number((values[qtyIndex] ?? "0").toString().replace(/[^0-9.-]/g, ""));
    if (!name) continue;

    const item: StockImportRow = {
      name,
      category: (values[categoryIndex] ?? "").trim(),
      qty: Number.isFinite(qty) ? qty : 0,
      reorder: Number((values[reorderIndex] ?? "0").toString().replace(/[^0-9.-]/g, "")) || 0,
      unit: (values[unitIndex] ?? "units").trim() || "units",
    };

    items.push(item);
  }

  return items;
}

export const stockRouter = Router();

stockRouter.get("/", async (_req, res) => {
  try {
    const result = await query("SELECT * FROM stock ORDER BY id");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stock" });
  }
});

stockRouter.post("/import", async (req, res) => {
  try {
    const rawCsv = typeof req.body?.csv === "string" ? req.body.csv : "";
    const rows = parseStockImportRows(rawCsv);

    if (rows.length === 0) {
      return res.status(400).json({ error: "No stock rows were found in the CSV import" });
    }

    const inserted = [] as any[];
    for (const row of rows) {
      const result = await query(
        "INSERT INTO stock (name, category, qty, reorder, unit) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [row.name, row.category || "", Number(row.qty) || 0, Number(row.reorder) || 0, row.unit || "units"]
      );
      inserted.push(result.rows[0]);
    }

    res.status(201).json({ imported: inserted.length, items: inserted });
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Failed to import stock items" });
  }
});

stockRouter.post("/", async (req, res) => {
  try {
    const { name, category, qty, reorder, unit } = req.body;
    if (!name) return res.status(400).json({ error: "name is required" });
    const result = await query(
      "INSERT INTO stock (name, category, qty, reorder, unit) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, category ?? "", Number(qty) || 0, Number(reorder) || 0, unit ?? "units"]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to create stock item" });
  }
});

stockRouter.patch("/:id", async (req, res) => {
  try {
    const { qty } = req.body;
    if (qty === undefined) return res.status(400).json({ error: "qty is required" });
    const result = await query("UPDATE stock SET qty = $1 WHERE id = $2 RETURNING *", [Number(qty), req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Stock item not found" });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to update stock item" });
  }
});

stockRouter.delete("/:id", async (req, res) => {
  try {
    await query("DELETE FROM stock WHERE id = $1", [req.params.id]);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete stock item" });
  }
});
