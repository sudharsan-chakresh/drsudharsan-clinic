import React from "react";

const TONE_CLASS = {
  primary: "capsule-primary",
  amber: "capsule-amber",
  coral: "capsule-coral",
  ink: "capsule-ink",
};

export default function Capsule({ icon: Icon, label, value, tone = "primary" }) {
  return (
    <div className={`capsule ${TONE_CLASS[tone] || TONE_CLASS.primary}`}>
      <div className="capsule-icon">
        <Icon size={19} strokeWidth={2.2} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div className="capsule-label">{label}</div>
        <div className="capsule-value">{value}</div>
      </div>
    </div>
  );
}
