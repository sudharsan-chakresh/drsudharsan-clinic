import React, { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { CheckCircle2, Download, Trash2, Upload } from "lucide-react";
import Panel from "../components/Panel.jsx";
import Field from "../components/Field.jsx";
import Badge from "../components/Badge.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import { PrimaryButton, GhostButton } from "../components/Buttons.jsx";
import { api } from "../api.js";

const sampleCsv = `name,category,qty,reorder,unit\nParacetamol Syrup,General,42,20,bottles\nORS Sachets,Rehydration,15,25,sachets`;

export default function Stock({ stock, refresh }) {
  const fileInputRef = useRef(null);
  const [show, setShow] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [form, setForm] = useState({ name: "", category: "", qty: "", reorder: "", unit: "units" });
  const [csvText, setCsvText] = useState(sampleCsv);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!form.name || saving) return;
    setSaving(true);
    try {
      await api.createStockItem(form);
      setForm({ name: "", category: "", qty: "", reorder: "", unit: "units" });
      setShow(false);
      await refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleBrowseFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const fileName = file.name.toLowerCase();
      if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls") || fileName.endsWith(".xlsm")) {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const firstSheet = workbook.Sheets[firstSheetName];
        const csv = XLSX.utils.sheet_to_csv(firstSheet);
        setCsvText(csv);
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result;
          if (typeof result === "string") {
            setCsvText(result);
          }
        };
        reader.readAsText(file);
      }
    } catch (error) {
      alert("Unable to read the selected file. Please choose a CSV or Excel file.");
    }

    event.target.value = "";
  }

  async function submitImport(e) {
    e.preventDefault();
    if (!csvText.trim() || importing) return;
    setImporting(true);
    try {
      await api.importStockItems(csvText);
      setCsvText(sampleCsv);
      setShowImport(false);
      await refresh();
    } catch (error) {
      alert(error.message || "Unable to import stock CSV");
    } finally {
      setImporting(false);
    }
  }

  async function remove(id) {
    await api.deleteStockItem(id);
    await refresh();
  }

  return (
    <>
      <SectionHeader eyebrow="Resources & Access" title="Stock Inventory" subtitle="Medicines, vaccines and consumables on hand." />
      <Panel title={`${stock.length} items tracked`} action={
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <PrimaryButton onClick={() => setShow((s) => !s)}>Add item</PrimaryButton>
          <GhostButton onClick={() => setShowImport((s) => !s)} icon={Download}>Import CSV</GhostButton>
        </div>
      }>
        {show && (
          <form onSubmit={submit} className="form-grid" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
            <Field label="Item name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Field label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <Field label="Quantity" type="number" value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} />
            <Field label="Reorder level" type="number" value={form.reorder} onChange={(e) => setForm({ ...form, reorder: e.target.value })} />
            <Field label="Unit" placeholder="bottles" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
            <div style={{ gridColumn: "span 5", display: "flex", gap: 8 }}>
              <PrimaryButton icon={CheckCircle2}>{saving ? "Saving…" : "Save item"}</PrimaryButton>
              <GhostButton onClick={() => setShow(false)}>Cancel</GhostButton>
            </div>
          </form>
        )}
        {showImport && (
          <form onSubmit={submitImport} style={{ marginTop: 16, display: "grid", gap: 12 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <GhostButton icon={Upload} onClick={() => fileInputRef.current?.click()}>Browse</GhostButton>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xls,.xlsx,.xlsm,text/csv"
                hidden
                onChange={handleBrowseFile}
              />
              <span style={{ fontSize: 12, color: "var(--muted)" }}>CSV file from your computer</span>
            </div>
            <label className="field-label">
              CSV import
              <textarea
                className="fld"
                rows={8}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="name,category,qty,reorder,unit\nParacetamol Syrup,General,42,20,bottles"
                style={{ resize: "vertical", minHeight: 140 }}
              />
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <PrimaryButton icon={Download}>{importing ? "Importing…" : "Import stock"}</PrimaryButton>
              <GhostButton onClick={() => setShowImport(false)}>Cancel</GhostButton>
            </div>
          </form>
        )}
        <table className="dtable">
          <thead><tr><th>Item</th><th>Category</th><th>Quantity</th><th>Reorder at</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {stock.map((s) => {
              const low = s.qty <= s.reorder;
              return (
                <tr key={s.id}>
                  <td style={{ fontWeight: 700 }}>{s.name}</td>
                  <td>{s.category}</td>
                  <td>{s.qty} {s.unit}</td>
                  <td style={{ color: "var(--muted-light)" }}>{s.reorder} {s.unit}</td>
                  <td><Badge tone={low ? "danger" : "success"}>{low ? "Low stock" : "In stock"}</Badge></td>
                  <td><button className="rowbtn" onClick={() => remove(s.id)}><Trash2 size={14} /></button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Panel>
    </>
  );
}
