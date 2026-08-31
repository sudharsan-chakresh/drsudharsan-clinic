import React, { useState } from "react";
import { CheckCircle2, Trash2, Phone } from "lucide-react";
import Panel from "../components/Panel.jsx";
import Field from "../components/Field.jsx";
import Badge from "../components/Badge.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import { PrimaryButton, GhostButton } from "../components/Buttons.jsx";
import { api } from "../api.js";

export default function Patients({ patients, refresh }) {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ name: "", guardian: "", age: "", phone: "", blood: "" });
  const [saving, setSaving] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!form.name || saving) return;
    setSaving(true);
    try {
      await api.createPatient(form);
      setForm({ name: "", guardian: "", age: "", phone: "", blood: "" });
      setShow(false);
      await refresh();
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    await api.deletePatient(id);
    await refresh();
  }

  return (
    <>
      <SectionHeader eyebrow="Clinical Operations" title="Patient Register" subtitle="Every child registered with the clinic." />
      <Panel title={`${patients.length} patients`} action={<PrimaryButton onClick={() => setShow((s) => !s)}>Register patient</PrimaryButton>}>
        {show && (
          <form onSubmit={submit} className="form-grid" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
            <Field label="Child's name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Field label="Guardian" value={form.guardian} onChange={(e) => setForm({ ...form, guardian: e.target.value })} />
            <Field label="Age" placeholder="2y 4m" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
            <Field label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Field label="Blood group" placeholder="O+" value={form.blood} onChange={(e) => setForm({ ...form, blood: e.target.value })} />
            <div style={{ gridColumn: "span 5", display: "flex", gap: 8 }}>
              <PrimaryButton icon={CheckCircle2}>{saving ? "Saving…" : "Save patient"}</PrimaryButton>
              <GhostButton onClick={() => setShow(false)}>Cancel</GhostButton>
            </div>
          </form>
        )}
        <table className="dtable">
          <thead><tr><th>Name</th><th>Guardian</th><th>Age</th><th>Phone</th><th>Blood</th><th>Last visit</th><th></th></tr></thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p.id}>
                <td style={{ fontWeight: 700 }}>{p.name}</td>
                <td>{p.guardian}</td>
                <td>{p.age}</td>
                <td style={{ color: "var(--muted)" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Phone size={12} />{p.phone}</span>
                </td>
                <td><Badge>{p.blood}</Badge></td>
                <td style={{ color: "var(--muted-light)" }}>{p.last_visit}</td>
                <td><button className="rowbtn" onClick={() => remove(p.id)}><Trash2 size={14} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </>
  );
}
