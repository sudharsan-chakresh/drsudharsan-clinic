import React from "react";

const TONE_CLASS = {
  success: "badge-success",
  danger: "badge-danger",
  accent: "badge-accent",
  muted: "badge-muted",
};

export function statusTone(status) {
  const s = (status || "").toLowerCase();
  if (["completed", "paid", "on duty", "done"].includes(s)) return "success";
  if (["cancelled", "out of stock", "off today"].includes(s)) return "danger";
  if (["pending", "low stock", "waiting"].includes(s)) return "accent";
  return "muted";
}

export default function Badge({ tone = "muted", children }) {
  return <span className={`badge ${TONE_CLASS[tone] || TONE_CLASS.muted}`}>{children}</span>;
}
