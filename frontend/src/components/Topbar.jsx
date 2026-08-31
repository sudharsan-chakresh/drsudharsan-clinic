import React from "react";
import { Search, Bell, LogOut } from "lucide-react";

export default function Topbar({ user, onLogout }) {
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "short", year: "numeric" });

  return (
    <div
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "clamp(8px, 4vw, 16px) clamp(14px, 5vw, 28px)", borderBottom: "1px solid var(--border)", background: "var(--surface-alt)",
        gap: "clamp(8px, 3vw, 14px)", flexWrap: "wrap",
      }}
    >
      <div
        style={{
          display: "flex", alignItems: "center", gap: 10, background: "#fff",
          border: "1px solid var(--border)", borderRadius: 11, padding: "8px 12px", flex: "1 1 auto", minWidth: "150px", maxWidth: "300px",
        }}
      >
        <Search size={15} color="var(--muted-light)" />
        <input
          placeholder="Search patients, invoices, staff…"
          style={{ border: "none", outline: "none", fontSize: "clamp(12px, 2.5vw, 13.5px)", fontFamily: "inherit", width: "100%", background: "transparent" }}
        />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "clamp(10px, 3vw, 18px)" }}>
        <div style={{ fontSize: "clamp(11px, 2vw, 13px)", color: "var(--muted)", fontWeight: 600, whiteSpace: "nowrap" }}>{today}</div>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <Bell size={18} color="var(--muted)" />
          <span style={{ position: "absolute", top: -2, right: -2, width: 7, height: 7, borderRadius: "50%", background: "var(--danger)" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div
            className="display-font"
            style={{
              width: 34, height: 34, borderRadius: "50%", background: "var(--accent-soft)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, color: "#9A5F14", fontSize: "clamp(12px, 2vw, 13.5px)",
            }}
          >
            {user?.name?.substring(0, 2).toUpperCase() || "U"}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <div style={{ fontSize: "clamp(11px, 2vw, 13px)", fontWeight: 700, color: "var(--ink)" }}>{user?.name}</div>
            <div style={{ fontSize: "clamp(9px, 1.5vw, 11px)", color: "var(--muted)" }}>{user?.role}</div>
          </div>
          <button
            onClick={onLogout}
            style={{
              background: "none", border: "none", cursor: "pointer", padding: "4px 8px",
              color: "var(--muted)", marginLeft: "8px", transition: "color .15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--danger)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--muted)"; }}
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
