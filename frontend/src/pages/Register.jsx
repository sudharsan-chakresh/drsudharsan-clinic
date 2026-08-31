import React, { useState } from "react";
import { api } from "../api.js";
import logo from "../public/logo.png";

export default function Register({ onSwitchToLogin }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", guardian: "", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.register(form);
      alert("Registration successful! Please login.");
      onSwitchToLogin();
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, var(--primary), var(--primary-deep))",
      padding: "20px",
    }}>
      <div style={{
        background: "white",
        borderRadius: "20px",
        padding: "40px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        width: "100%",
        maxWidth: "400px",
      }}>
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <img src={logo} alt="Logo" style={{ width: "60px", height: "60px", marginBottom: "16px", borderRadius: "12px" }} />
          <h1 className="display-font" style={{ fontSize: "28px", fontWeight: 600, color: "var(--ink)", margin: 0 }}>
            Patient Registration
          </h1>
          <p style={{ fontSize: "14px", color: "var(--muted)", marginTop: "4px" }}>Create your account</p>
        </div>

        {error && (
          <div style={{
            background: "var(--danger-soft)",
            color: "var(--danger)",
            padding: "12px 14px",
            borderRadius: "10px",
            marginBottom: "20px",
            fontSize: "13px",
            fontWeight: 600,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--muted)" }}>Full Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="fld"
              placeholder="Child's full name"
              required
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--muted)" }}>Guardian Name</label>
            <input
              type="text"
              value={form.guardian}
              onChange={(e) => setForm({ ...form, guardian: e.target.value })}
              className="fld"
              placeholder="Parent/Guardian name"
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--muted)" }}>Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="fld"
              placeholder="your@email.com"
              required
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--muted)" }}>Password *</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="fld"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--muted)" }}>Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="fld"
              placeholder="98410 22110"
            />
          </div>

          <button
            type="submit"
            className="pb"
            disabled={loading}
            style={{ marginTop: "10px", opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <p style={{ fontSize: "12px", color: "var(--muted-light)", margin: 0 }}>
            Already have an account?{" "}
            <button onClick={onSwitchToLogin} style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: 600, cursor: "pointer", fontSize: "12px" }}>
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
