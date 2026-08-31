import React from "react";

export default function SectionHeader({ eyebrow, title, subtitle }) {
  return (
    <div style={{ marginBottom: "clamp(14px, 4vw, 22px)" }}>
      <div
        style={{
          fontSize: "clamp(11px, 2.5vw, 12.5px)", fontWeight: 700, color: "var(--primary)",
          letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 4,
        }}
      >
        {eyebrow}
      </div>
      <h1 className="display-font" style={{ fontSize: "clamp(20px, 6vw, 28px)", fontWeight: 600, color: "var(--ink)", margin: 0, lineHeight: 1.2 }}>
        {title}
      </h1>
      {subtitle && <p style={{ color: "var(--muted)", marginTop: 6, fontSize: "clamp(12px, 3vw, 14.5px)" }}>{subtitle}</p>}
    </div>
  );
}
