import React from "react";
import { Calendar, ListOrdered, AlertTriangle, Receipt, Clock } from "lucide-react";
import Capsule from "../components/Capsule.jsx";
import Panel from "../components/Panel.jsx";
import Badge, { statusTone } from "../components/Badge.jsx";
import GrowthPath from "../components/GrowthPath.jsx";
import SectionHeader from "../components/SectionHeader.jsx";

export default function Dashboard({ appointments, queue, stock, staff, invoices }) {
  const lowStockItems = stock.filter((s) => s.qty <= s.reorder);
  const waitingCount = queue.filter((q) => q.stage !== "done").length;
  const onDutyToday = staff.filter((s) => s.status === "On duty");

  const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const todaysBilling = invoices.filter((i) => i.date === today).reduce((sum, i) => sum + i.amount, 0);
  const pendingBilling = invoices.filter((i) => i.status === "Pending").length;

  return (
    <>
      <SectionHeader eyebrow="Overview" title="Good morning, Dr. Sudharsan" subtitle="Here's how the clinic is looking today." />

      <div className="stat-grid">
        <Capsule icon={Calendar} label="Today's appointments" value={appointments.length} tone="primary" />
        <Capsule icon={ListOrdered} label="In OPD queue" value={waitingCount} tone="amber" />
        <Capsule icon={AlertTriangle} label="Low stock alerts" value={lowStockItems.length} tone="coral" />
        <Capsule icon={Receipt} label="Billed today" value={`₹${todaysBilling.toLocaleString("en-IN")}`} tone="ink" />
      </div>

      <div className="two-col">
        <div className="stack">
          <Panel title="Today's appointments">
            <table className="dtable">
              <thead>
                <tr><th>Time</th><th>Patient</th><th>Doctor</th><th>Status</th></tr>
              </thead>
              <tbody>
                {appointments.slice(0, 5).map((a) => (
                  <tr key={a.id}>
                    <td style={{ color: "var(--muted)", fontWeight: 600 }}>{a.time}</td>
                    <td style={{ fontWeight: 700 }}>{a.patient}</td>
                    <td>{a.doctor}</td>
                    <td><Badge tone={statusTone(a.status)}>{a.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>

          <Panel title="OPD queue — growth path">
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {queue.map((q) => (
                <div key={q.id} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 118, flexShrink: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 13.5 }}>{q.token}</div>
                    <div style={{ fontSize: 12.5, color: "var(--muted)" }}>{q.patient}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <GrowthPath stage={q.stage} />
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="stack">
          <Panel title="Stock alerts" action={<Badge tone="danger">{lowStockItems.length} low</Badge>}>
            {lowStockItems.length === 0 ? (
              <p style={{ fontSize: 13.5, color: "var(--muted)" }}>All stock levels healthy.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {lowStockItems.map((s) => (
                  <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13.5 }}>{s.name}</div>
                      <div style={{ fontSize: 12, color: "var(--muted-light)" }}>{s.category}</div>
                    </div>
                    <Badge tone="accent">{s.qty} {s.unit} left</Badge>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel title="Billing summary">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.8 }}>
                <span style={{ color: "var(--muted)" }}>Billed today</span>
                <strong>₹{todaysBilling.toLocaleString("en-IN")}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.8 }}>
                <span style={{ color: "var(--muted)" }}>Pending invoices</span>
                <Badge tone="accent">{pendingBilling}</Badge>
              </div>
            </div>
          </Panel>

          <Panel title="Staff on duty" action={<Badge tone="success">{onDutyToday.length} active</Badge>}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {onDutyToday.slice(0, 4).map((s) => (
                <div key={s.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5 }}>
                  <span style={{ fontWeight: 600 }}>{s.name}</span>
                  <span style={{ color: "var(--muted-light)", fontSize: 12.5 }}>{s.shift}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
