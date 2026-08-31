import React, { useState } from "react";
import { CheckCircle2, CircleDot } from "lucide-react";
import Panel from "../components/Panel.jsx";
import Field from "../components/Field.jsx";
import Badge, { statusTone } from "../components/Badge.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import { PrimaryButton, GhostButton } from "../components/Buttons.jsx";
import { STAFF_TABS } from "../components/Sidebar.jsx";
import { api } from "../api.js";

const ACCESS_LABEL = {
  doctors: "Full clinical",
  pharmacists: "Inventory + billing",
  receptionist: "Appointments + queue",
  housekeeping: "Facilities only",
};

export default function Staff({ staff, staffTab, setStaffTab, refresh }) {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ name: "", shift: "", phone: "" });
  const [saving, setSaving] = useState(false);

  const list = staff.filter((s) => s.role === staffTab);

  async function submit(e) {
    e.preventDefault();
    if (!form.name || saving) return;
    setSaving(true);
    try {
      await api.createStaffMember({ ...form, role: staffTab });
      setForm({ name: "", shift: "", phone: "" });
      setShow(false);
      await refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <SectionHeader eyebrow="Resources & Access" title="Staff Access" subtitle="Doctors, pharmacists, receptionist and housekeeping." />

      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {STAFF_TABS.map((t) => (
          <button key={t.key} className={`tabbtn ${staffTab === t.key ? "active" : ""}`} onClick={() => setStaffTab(t.key)}>
            <t.icon size={15} />
            {t.label}
            <span style={{ color: "var(--muted-light)", fontWeight: 600 }}>
              ({staff.filter((s) => s.role === t.key).length})
            </span>
          </button>
        ))}
      </div>

      <Panel title={`${list.length} ${staffTab}`} action={<PrimaryButton onClick={() => setShow((s) => !s)}>Add {staffTab.slice(0, -1)}</PrimaryButton>}>
        {show && (
          <form onSubmit={submit} className="form-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr auto auto" }}>
            <Field label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Field label="Shift" placeholder="9:00 AM – 5:00 PM" value={form.shift} onChange={(e) => setForm({ ...form, shift: e.target.value })} />
            <Field label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <div style={{ alignSelf: "end" }}><PrimaryButton icon={CheckCircle2}>{saving ? "Saving…" : "Save"}</PrimaryButton></div>
            <div style={{ alignSelf: "end" }}><GhostButton onClick={() => setShow(false)}>Cancel</GhostButton></div>
          </form>
        )}
        <table className="dtable">
          <thead><tr><th>Name</th><th>Shift</th><th>Phone</th><th>Access</th><th>Status</th></tr></thead>
          <tbody>
            {list.map((s) => (
              <tr key={s.id}>
                <td style={{ fontWeight: 700 }}>{s.name}</td>
                <td style={{ color: "var(--muted)" }}>{s.shift}</td>
                <td>{s.phone}</td>
                <td>
                  <Badge tone="muted">
                    <CircleDot size={11} /> {ACCESS_LABEL[staffTab]}
                  </Badge>
                </td>
                <td><Badge tone={statusTone(s.status)}>{s.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </>
  );
}
