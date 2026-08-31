import React, { useState } from "react";
import { CheckCircle2, Trash2 } from "lucide-react";
import Panel from "../components/Panel.jsx";
import Field from "../components/Field.jsx";
import Badge, { statusTone } from "../components/Badge.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import { PrimaryButton, GhostButton } from "../components/Buttons.jsx";
import { api } from "../api.js";

export default function Appointments({ appointments, refresh }) {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ time: "", patient: "", guardian: "", doctor: "Dr. Sudharsan", type: "" });
  const [saving, setSaving] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!form.patient || !form.time || saving) return;
    setSaving(true);
    try {
      await api.createAppointment(form);
      setForm({ time: "", patient: "", guardian: "", doctor: "Dr. Sudharsan", type: "" });
      setShow(false);
      await refresh();
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    await api.deleteAppointment(id);
    await refresh();
  }

  return (
    <>
      <SectionHeader eyebrow="Clinical Operations" title="Appointments" subtitle="Every scheduled visit for the clinic, in one place." />
      <Panel title={`${appointments.length} appointments`} action={<PrimaryButton onClick={() => setShow((s) => !s)}>New appointment</PrimaryButton>}>
        {show && (
          <form onSubmit={submit} className="form-grid" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
            <Field label="Time" placeholder="10:00 AM" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
            <Field label="Patient" placeholder="Child's name" value={form.patient} onChange={(e) => setForm({ ...form, patient: e.target.value })} />
            <Field label="Guardian" placeholder="Parent name" value={form.guardian} onChange={(e) => setForm({ ...form, guardian: e.target.value })} />
            <Field label="Doctor" placeholder="Dr. Sudharsan" value={form.doctor} onChange={(e) => setForm({ ...form, doctor: e.target.value })} />
            <Field label="Reason" placeholder="Vaccination…" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
            <div style={{ gridColumn: "span 5", display: "flex", gap: 8 }}>
              <PrimaryButton icon={CheckCircle2}>{saving ? "Saving…" : "Save appointment"}</PrimaryButton>
              <GhostButton onClick={() => setShow(false)}>Cancel</GhostButton>
            </div>
          </form>
        )}
        <table className="dtable">
          <thead><tr><th>Time</th><th>Patient</th><th>Guardian</th><th>Doctor</th><th>Reason</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {appointments.map((a) => (
              <tr key={a.id}>
                <td style={{ fontWeight: 600, color: "var(--muted)" }}>{a.time}</td>
                <td style={{ fontWeight: 700 }}>{a.patient}</td>
                <td>{a.guardian}</td>
                <td>{a.doctor}</td>
                <td>{a.type}</td>
                <td><Badge tone={statusTone(a.status)}>{a.status}</Badge></td>
                <td><button className="rowbtn" onClick={() => remove(a.id)}><Trash2 size={14} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </>
  );
}
