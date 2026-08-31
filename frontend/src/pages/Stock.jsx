import React, { useState } from "react";
import { CheckCircle2, Trash2 } from "lucide-react";
import Panel from "../components/Panel.jsx";
import Field from "../components/Field.jsx";
import Badge from "../components/Badge.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import { PrimaryButton, GhostButton } from "../components/Buttons.jsx";
import { api } from "../api.js";

export default function Stock({ stock, refresh }) {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ name: "", category: "", qty: "", reorder: "", unit: "units" });
  const [saving, setSaving] = useState(false);

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

  async function remove(id) {
    await api.deleteStockItem(id);
    await refresh();
  }

  return (
    <>
      <SectionHeader eyebrow="Resources & Access" title="Stock Inventory" subtitle="Medicines, vaccines and consumables on hand." />
      <Panel title={`${stock.length} items tracked`} action={<PrimaryButton onClick={() => setShow((s) => !s)}>Add item</PrimaryButton>}>
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
