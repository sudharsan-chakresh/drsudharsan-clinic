import React, { useState } from "react";
import { api } from "../api.js";
import logo from "../public/logo.png";

export default function Login({ onLoginSuccess, onSwitchToRegister }) {
  const [email, setEmail] = useState("admin@clinic.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await api.login(email, password);
      onLoginSuccess(user);
    } catch (err) {
      setError(err.message || "Login failed");
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
          <img src={logo} alt="Logo" style={{ width: "100px", height: "100px", marginBottom: "16px", borderRadius: "16px" }} />
          <h1 className="display-font" style={{ fontSize: "28px", fontWeight: 600, color: "var(--ink)", margin: 0 }}>
            Dr. Sudharsan's
          </h1>
          <p style={{ fontSize: "14px", color: "var(--muted)", marginTop: "4px" }}>Children's Clinic</p>
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

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--muted)" }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="fld"
              placeholder="your@email.com"
              required
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--muted)" }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="fld"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="pb"
            disabled={loading}
            style={{ marginTop: "10px", opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <p style={{ fontSize: "12px", color: "var(--muted-light)", margin: 0 }}>Demo credentials:</p>
          <p style={{ fontSize: "11px", color: "var(--muted-light)", margin: "4px 0" }}>Admin: admin@clinic.com / admin123</p>
          <p style={{ fontSize: "11px", color: "var(--muted-light)", margin: "4px 0" }}>Doctor: doctor1@clinic.com / doctor123</p>
          <p style={{ fontSize: "11px", color: "var(--muted-light)", margin: "4px 0" }}>Patient: patient@clinic.com / patient123</p>
          <p style={{ fontSize: "12px", color: "var(--muted-light)", marginTop: "12px" }}>
            New patient?{" "}
            <button onClick={onSwitchToRegister} style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: 600, cursor: "pointer", fontSize: "12px" }}>
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
