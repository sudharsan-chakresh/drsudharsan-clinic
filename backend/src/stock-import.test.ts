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

test("parseStockImportRows accepts workbook-style headers from Excel exports", () => {
  const csv = [
    "Name,Active Ingredient,Stock Type,Primary Form Available,Qty,Reorder Level,Unit",
    "Lasix,Furosemide,Commercial,Syrup / Oral Solution,100,25,bottles",
    "Lanoxin Pediatric,Digoxin,Commercial,Elixir / Oral Solution,40,10,ml",
  ].join("\n");

  const result = parseStockImportRows(csv);

  assert.deepEqual(result, [
    { name: "Lasix", category: "Commercial", qty: 100, reorder: 25, unit: "Syrup / Oral Solution" },
    { name: "Lanoxin Pediatric", category: "Commercial", qty: 40, reorder: 10, unit: "Elixir / Oral Solution" },
  ]);
});
