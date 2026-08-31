import React from "react";

export default function Panel({ title, action, children, style }) {
  return (
    <div className="panel" style={style}>
      {title && (
        <div className="panel-header">
          <h3 className="panel-title">{title}</h3>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
