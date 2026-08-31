import React from "react";
import {
  LayoutDashboard, Calendar, UserPlus, ListOrdered, Package, Receipt,
  Users, Stethoscope, Pill, ClipboardList, Sparkles, ChevronDown, Footprints, Video, LogOut, Database,
} from "lucide-react";
import logo from "../../public/logo.png";

const ALL_NAV_GROUPS = [
  {
    label: "Clinical Operations",
    items: [
      { key: "appointments", label: "Appointments", icon: Calendar, roles: ["Admin", "Doctor", "Receptionist", "Patient"] },
      { key: "patients", label: "Patient Register", icon: UserPlus, roles: ["Admin", "Doctor", "Receptionist", "Pharmacist"] },
      { key: "queue", label: "OPD Queue", icon: ListOrdered, roles: ["Admin", "Doctor", "Receptionist", "Pharmacist"] },
      { key: "consultation", label: "Consultations", icon: Video, roles: ["Admin", "Doctor", "Patient"] },
    ],
  },
  {
    label: "Resources & Access",
    items: [
      { key: "stock", label: "Stock Inventory", icon: Package, roles: ["Admin", "Doctor", "Pharmacist"] },
      { key: "billing", "label": "Central Billing", icon: Receipt, roles: ["Admin", "Receptionist"] },
      { key: "staff", label: "Staff Access", icon: Users, roles: ["Admin"] },
    ],
  },
  {
    label: "Masters",
    items: [
      { key: "drugs", label: "Drug Master", icon: Database, roles: ["Admin", "Doctor", "Pharmacist"] },
    ],
  },
];

export const STAFF_TABS = [
  { key: "doctors", label: "Doctors", icon: Stethoscope },
  { key: "pharmacists", label: "Pharmacists", icon: Pill },
  { key: "receptionist", label: "Receptionist", icon: ClipboardList },
  { key: "housekeeping", label: "Housekeeping", icon: Sparkles },
];

export default function Sidebar({ section, setSection, staffTab, setStaffTab, user, onLogout }) {
  const role = user?.role;
  const navGroups = ALL_NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.roles || item.roles.includes(role)),
  })).filter((group) => group.items.length > 0);
  return (
    <aside className="sidebar">
      <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "4px 10px 22px" }}>
        <img
          src={logo}
          alt="Logo"
          style={{
            width: 38, height: 38, borderRadius: 12,
            flexShrink: 0, boxShadow: "0 4px 10px -3px rgba(0,0,0,0.4)",
            objectFit: "cover",
          }}
        />
        <div style={{ minWidth: 0 }}>
          <div className="display-font" style={{ fontStyle: "italic", fontSize: 14.5, fontWeight: 600, color: "#fff", lineHeight: 1.2 }}>
            Dr. Sudharsan's
          </div>
          <div style={{ fontSize: 12, color: "#9FC2BC", fontWeight: 700, letterSpacing: 0.3 }}>
            CHILDREN'S CLINIC
          </div>
        </div>
      </div>

      {user && (
        <div style={{
          background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: "8px 12px",
          marginBottom: 12, fontSize: 12, color: "#BFD8D3",
        }}>
          <div style={{ fontWeight: 700, marginBottom: 2 }}>{user.name}</div>
          <div style={{ fontSize: 11, color: "#9FC2BC" }}>{user.role}</div>
        </div>
      )}

      <button className={`navitem ${section === "dashboard" ? "active" : ""}`} onClick={() => setSection("dashboard")}>
        <LayoutDashboard size={17} />
        Dashboard
      </button>

      {navGroups.map((group) => (
        <div key={group.label} style={{ marginTop: 14 }}>
          <div className="nav-group-label">{group.label}</div>
          {group.items.map((item) => (
            <div key={item.key}>
              <button className={`navitem ${section === item.key ? "active" : ""}`} onClick={() => setSection(item.key)}>
                <item.icon size={17} />
                {item.label}
                {item.key === "staff" && (
                  <ChevronDown
                    size={14}
                    style={{
                      marginLeft: "auto",
                      transform: section === "staff" ? "rotate(180deg)" : "none",
                      transition: "transform .15s",
                    }}
                  />
                )}
              </button>
              {item.key === "staff" && section === "staff" && (
                <div style={{ marginTop: 2, marginBottom: 2 }}>
                  {STAFF_TABS.map((t) => (
                    <button
                      key={t.key}
                      className={`subnavitem ${staffTab === t.key ? "active" : ""}`}
                      onClick={() => setStaffTab(t.key)}
                    >
                      <t.icon size={13.5} />
                      {t.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}

      <div style={{ marginTop: "auto", paddingTop: 18 }}>
        <button
          onClick={onLogout}
          style={{
            display: "flex", alignItems: "center", gap: 8, width: "100%",
            padding: "10px 14px", border: "none", background: "rgba(226, 87, 76, 0.15)",
            color: "#FF8A80", borderRadius: 10, cursor: "pointer", fontSize: 12,
            fontWeight: 700, fontFamily: "inherit", transition: "all .15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(226, 87, 76, 0.25)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(226, 87, 76, 0.15)";
          }}
        >
          <LogOut size={14} />
          Logout
        </button>
        <div
          style={{
            display: "flex", alignItems: "center", gap: 3, color: "#5C8985",
            fontSize: 11, padding: "10px 14px", borderTop: "1px solid rgba(255,255,255,0.08)",
            marginTop: 10,
          }}
        >
          <Footprints size={12} />
          Every visit, one step forward.
        </div>
      </div>
    </aside>
  );
}
