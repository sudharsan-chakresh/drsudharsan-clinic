import React, { Fragment } from "react";
import { CheckCircle2, Footprints } from "lucide-react";

// Signature element: a dotted "growth path" stepper tracking a child's
// visit — Waiting -> With doctor -> Done — echoing a growth-chart line.
export default function GrowthPath({ stage }) {
  const stages = ["waiting", "consult", "done"];
  const idx = stages.indexOf(stage);
  const labels = ["Waiting", "With doctor", "Done"];

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      {stages.map((s, i) => (
        <Fragment key={s}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 24, height: 24, borderRadius: "50%", display: "flex",
                alignItems: "center", justifyContent: "center",
                background: i <= idx ? "var(--primary)" : "#EEF3F1",
                color: i <= idx ? "#fff" : "var(--muted-light)",
                transition: "all 0.2s ease",
              }}
            >
              {i < idx ? <CheckCircle2 size={13} /> : <Footprints size={12} />}
            </div>
            <span
              style={{
                fontSize: 11.5,
                color: i <= idx ? "var(--ink)" : "var(--muted-light)",
                fontWeight: i === idx ? 700 : 500,
              }}
            >
              {labels[i]}
            </span>
          </div>
          {i < 2 && (
            <div
              style={{
                flex: 1, minWidth: 14, height: 0,
                borderTop: `2px dotted ${i < idx ? "var(--primary)" : "#D8E3E0"}`,
                margin: "0 2px",
              }}
            />
          )}
        </Fragment>
      ))}
    </div>
  );
}
