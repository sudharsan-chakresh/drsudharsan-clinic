import React from "react";

export function PrimaryButton({ children, onClick, icon: Icon }) {
  return (
    <button className="pb" onClick={onClick} type={onClick ? "button" : "submit"}>
      {Icon && <Icon size={15} strokeWidth={2.3} />}
      {children}
    </button>
  );
}

export function GhostButton({ children, onClick, icon: Icon }) {
  return (
    <button className="gb" onClick={onClick} type="button">
      {Icon && <Icon size={15} strokeWidth={2.3} />}
      {children}
    </button>
  );
}
