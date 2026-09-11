import test from "node:test";
import assert from "node:assert/strict";
import { parseStockImportRows } from "./routes/stock";

test("parseStockImportRows accepts a headered CSV payload and normalizes values", () => {
  const csv = [
    "name,category,qty,reorder,unit",
    "Paracetamol Syrup,General,42,20,bottles",
    "ORS Sachets,Rehydration,15,25,sachets",
  ].join("\n");

  const result = parseStockImportRows(csv);

  assert.deepEqual(result, [
    { name: "Paracetamol Syrup", category: "General", qty: 42, reorder: 20, unit: "bottles" },
    { name: "ORS Sachets", category: "Rehydration", qty: 15, reorder: 25, unit: "sachets" },
  ]);
});
