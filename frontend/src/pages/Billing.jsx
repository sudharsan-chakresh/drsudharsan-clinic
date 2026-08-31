import React, { useState } from "react";
import { CheckCircle2, Clock, Receipt } from "lucide-react";
import Panel from "../components/Panel.jsx";
import Field from "../components/Field.jsx";
import Badge, { statusTone } from "../components/Badge.jsx";
import Capsule from "../components/Capsule.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import { PrimaryButton, GhostButton } from "../components/Buttons.jsx";
import { api } from "../api.js";

export default function Billing({ invoices, refresh }) {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ patient: "", amount: "" });
  const [saving, setSaving] = useState(false);

  const collected = invoices.filter((i) => i.status === "Paid").reduce((s, i) => s + i.amount, 0);
  const pending = invoices.filter((i) => i.status === "Pending").reduce((s, i) => s + i.amount, 0);

  async function submit(e) {
    e.preventDefault();
    if (!form.patient || !form.amount || saving) return;
    setSaving(true);
    try {
      await api.createInvoice(form);
      setForm({ patient: "", amount: "" });
      setShow(false);
      await refresh();
    } finally {
      setSaving(false);
    }
  }

  async function togglePaid(id) {
    await api.toggleInvoicePaid(id);
    await refresh();
  }

  return (
    <>
      <SectionHeader eyebrow="Resources & Access" title="Central Billing" subtitle="Invoices across the clinic, at a glance." />

      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <Capsule icon={CheckCircle2} label="Collected" value={`₹${collected.toLocaleString("en-IN")}`} tone="primary" />
        <Capsule icon={Clock} label="Pending" value={`₹${pending.toLocaleString("en-IN")}`} tone="amber" />
        <Capsule icon={Receipt} label="Total invoices" value={invoices.length} tone="ink" />
      </div>

      <Panel title="All invoices" action={<PrimaryButton onClick={() => setShow((s) => !s)}>New invoice</PrimaryButton>}>
        {show && (
          <form onSubmit={submit} className="form-grid" style={{ gridTemplateColumns: "1fr 1fr auto auto" }}>
            <Field label="Patient" value={form.patient} onChange={(e) => setForm({ ...form, patient: e.target.value })} />
            <Field label="Amount (₹)" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            <div style={{ alignSelf: "end" }}><PrimaryButton icon={CheckCircle2}>{saving ? "Creating…" : "Create"}</PrimaryButton></div>
            <div style={{ alignSelf: "end" }}><GhostButton onClick={() => setShow(false)}>Cancel</GhostButton></div>
          </form>
        )}
        <table className="dtable">
          <thead><tr><th>Invoice</th><th>Patient</th><th>Date</th><th>Amount</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {invoices.map((i) => (
              <tr key={i.id}>
                <td style={{ fontWeight: 700, color: "var(--muted)" }}>{i.id}</td>
                <td style={{ fontWeight: 700 }}>{i.patient}</td>
                <td>{i.date}</td>
                <td>₹{i.amount.toLocaleString("en-IN")}</td>
                <td><Badge tone={statusTone(i.status)}>{i.status}</Badge></td>
                <td><GhostButton onClick={() => togglePaid(i.id)}>{i.status === "Paid" ? "Mark pending" : "Mark paid"}</GhostButton></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </>
  );
}
