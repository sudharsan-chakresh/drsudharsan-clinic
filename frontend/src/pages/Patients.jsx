import React, { useState } from "react";
import { CheckCircle2, Trash2, Phone, Edit2, X } from "lucide-react";
import Panel from "../components/Panel.jsx";
import Field from "../components/Field.jsx";
import Badge from "../components/Badge.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import { PrimaryButton, GhostButton } from "../components/Buttons.jsx";
import { api } from "../api.js";

export default function Patients({ patients, refresh }) {
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", guardian: "", age: "", phone: "", blood: "" });
  const [saving, setSaving] = useState(false);

  function startEdit(p) {
    setEditing(p.id);
    setForm({ name: p.name, guardian: p.guardian || "", age: p.age || "", phone: p.phone || "", blood: p.blood || "" });
    setShow(false);
  }

  function cancelEdit() {
    setEditing(null);
    setForm({ name: "", guardian: "", age: "", phone: "", blood: "" });
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.name || saving) return;
    setSaving(true);
    try {
      if (editing) {
        await api.updatePatient(editing, form);
      } else {
        await api.createPatient(form);
      }
      setForm({ name: "", guardian: "", age: "", phone: "", blood: "" });
      setShow(false);
      setEditing(null);
      await refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Deactivate this patient?")) return;
    try {
      await api.deletePatient(id);
      await refresh();
    } catch (err) {
      alert("Failed to delete");
    }
  }

  return (
    <>
      <SectionHeader eyebrow="Clinical Operations" title="Patient Register" subtitle="Every child registered with the clinic." />
      <Panel title={`${patients.length} patients`} action={
        <PrimaryButton onClick={() => { setShow((s) => !s); setEditing(null); setForm({ name: "", guardian: "", age: "", phone: "", blood: "" }); }}>
          {show ? "Cancel" : "Register patient"}
        </PrimaryButton>
      }>
        {(show || editing) && (
          <form onSubmit={submit} className="form-grid" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
            <Field label="Child's name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Field label="Guardian" value={form.guardian} onChange={(e) => setForm({ ...form, guardian: e.target.value })} />
            <Field label="Age" placeholder="2y 4m" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
            <Field label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Field label="Blood group" placeholder="O+" value={form.blood} onChange={(e) => setForm({ ...form, blood: e.target.value })} />
            <div style={{ gridColumn: "span 5", display: "flex", gap: 8 }}>
              <PrimaryButton icon={CheckCircle2}>{saving ? "Saving…" : editing ? "Update" : "Save patient"}</PrimaryButton>
              <GhostButton onClick={cancelEdit}>Cancel</GhostButton>
            </div>
          </form>
        )}
        <table className="dtable">
          <thead><tr><th>Name</th><th>Guardian</th><th>Age</th><th>Phone</th><th>Blood</th><th>Last visit</th><th>Actions</th></tr></thead>
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
                <td>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button onClick={() => startEdit(p)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--primary)" }} title="Edit">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(p.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)" }} title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </>
  );
}
