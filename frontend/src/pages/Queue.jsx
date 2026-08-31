import React, { useState } from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";
import Panel from "../components/Panel.jsx";
import Field from "../components/Field.jsx";
import Badge from "../components/Badge.jsx";
import GrowthPath from "../components/GrowthPath.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import { PrimaryButton, GhostButton } from "../components/Buttons.jsx";
import { api } from "../api.js";

export default function Queue({ queue, refresh }) {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ patient: "", doctor: "Dr. Sudharsan" });
  const [saving, setSaving] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!form.patient || saving) return;
    setSaving(true);
    try {
      await api.createQueueEntry(form);
      setForm({ patient: "", doctor: "Dr. Sudharsan" });
      setShow(false);
      await refresh();
    } finally {
      setSaving(false);
    }
  }

  async function advance(id) {
    await api.advanceQueueEntry(id);
    await refresh();
  }

  return (
    <>
      <SectionHeader eyebrow="Clinical Operations" title="OPD Queue" subtitle="Consultation queue — every child's next step, tracked." />
      <Panel
        title={`${queue.filter((q) => q.stage !== "done").length} waiting or in consult`}
        action={<PrimaryButton onClick={() => setShow((s) => !s)}>Add walk-in</PrimaryButton>}
      >
        {show && (
          <form onSubmit={submit} className="form-grid" style={{ gridTemplateColumns: "1fr 1fr auto auto" }}>
            <Field label="Patient" value={form.patient} onChange={(e) => setForm({ ...form, patient: e.target.value })} />
            <Field label="Doctor" value={form.doctor} onChange={(e) => setForm({ ...form, doctor: e.target.value })} />
            <div style={{ alignSelf: "end" }}><PrimaryButton icon={CheckCircle2}>{saving ? "Adding…" : "Add to queue"}</PrimaryButton></div>
            <div style={{ alignSelf: "end" }}><GhostButton onClick={() => setShow(false)}>Cancel</GhostButton></div>
          </form>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {queue.map((q) => (
            <div
              key={q.id}
              style={{
                display: "flex", alignItems: "center", gap: 18, padding: "14px 16px",
                border: "1px solid var(--border)", borderRadius: 16,
                background: q.stage === "done" ? "var(--surface-alt)" : "#fff",
              }}
            >
              <div style={{ width: 130, flexShrink: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 14 }}>{q.token}</div>
                <div style={{ fontSize: 12.5, color: "var(--muted)" }}>{q.patient}</div>
                <div style={{ fontSize: 11.5, color: "var(--muted-light)" }}>{q.doctor}</div>
              </div>
              <div style={{ flex: 1 }}><GrowthPath stage={q.stage} /></div>
              {q.stage !== "done" ? (
                <GhostButton icon={ArrowRight} onClick={() => advance(q.id)}>
                  {q.stage === "waiting" ? "Call in" : "Mark done"}
                </GhostButton>
              ) : (
                <Badge tone="success">Consulted</Badge>
              )}
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}
