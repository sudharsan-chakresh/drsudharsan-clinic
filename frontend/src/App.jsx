import React, { useEffect, useState, useCallback } from "react";
import Sidebar from "./components/Sidebar.jsx";
import Topbar from "./components/Topbar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Appointments from "./pages/Appointments.jsx";
import Patients from "./pages/Patients.jsx";
import Queue from "./pages/Queue.jsx";
import Stock from "./pages/Stock.jsx";
import Billing from "./pages/Billing.jsx";
import Staff from "./pages/Staff.jsx";
import Consultation from "./pages/Consultation.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import { api } from "./api.js";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          <h2>Something went wrong</h2>
          <p style={{ color: "var(--danger)" }}>{this.state.error?.message}</p>
          <button onClick={() => { localStorage.clear(); window.location.reload(); }}>
            Clear & Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [user, setUser] = useState(null);
  const [section, setSection] = useState("dashboard");
  const [staffTab, setStaffTab] = useState("doctors");
  const [authView, setAuthView] = useState("login");

  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [queue, setQueue] = useState([]);
  const [stock, setStock] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.id && parsed.email && parsed.role) {
          setUser(parsed);
        } else {
          localStorage.removeItem("user");
          localStorage.removeItem("token");
        }
      } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
  }, []);

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (err) {
      // Ignore logout errors
    }
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setSection("dashboard");
  };

  const refresh = useCallback(async () => {
    try {
      const [a, p, q, s, i, st] = await Promise.all([
        api.getAppointments(),
        api.getPatients(),
        api.getQueue(),
        api.getStock(),
        api.getInvoices(),
        api.getStaff(),
      ]);
      setAppointments(a);
      setPatients(p);
      setQueue(q);
      setStock(s);
      setInvoices(i);
      setStaff(st);
      setError(null);
    } catch (err) {
      setError(err.message || "Could not reach the clinic server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      refresh();
    } else {
      setLoading(false);
    }
  }, [user, refresh]);

  const handleLoginSuccess = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  if (!user) {
    return (
      <ErrorBoundary>
        {authView === "register" ? (
          <Register onSwitchToLogin={() => setAuthView("login")} />
        ) : (
          <Login onLoginSuccess={handleLoginSuccess} onSwitchToRegister={() => setAuthView("register")} />
        )}
      </ErrorBoundary>
    );
  }

  if (loading) {
    return <div style={{ padding: 40, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Loading clinic console…</div>;
  }

  if (error) {
    return (
      <div style={{ padding: 40, fontFamily: "'Plus Jakarta Sans', sans-serif", color: "var(--danger)" }}>
        Couldn't connect to the backend at <code>/api</code>. {error}
        <br />
        Make sure the backend is running (<code>npm run dev</code> in <code>backend/</code>) on port 9876.
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="app-shell">
        <Sidebar section={section} setSection={setSection} staffTab={staffTab} setStaffTab={setStaffTab} user={user} onLogout={handleLogout} />
        <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <Topbar user={user} onLogout={handleLogout} />
          <div style={{ padding: "clamp(14px, 4vw, 26px) clamp(14px, 5vw, 28px) clamp(20px, 6vw, 40px)", overflowY: "auto" }}>
            {section === "dashboard" && (
              <Dashboard appointments={appointments} queue={queue} stock={stock} staff={staff} invoices={invoices} user={user} />
            )}
            {section === "appointments" && <Appointments appointments={appointments} refresh={refresh} />}
            {section === "patients" && <Patients patients={patients} refresh={refresh} />}
            {section === "queue" && <Queue queue={queue} refresh={refresh} />}
            {section === "stock" && <Stock stock={stock} refresh={refresh} />}
            {section === "billing" && <Billing invoices={invoices} refresh={refresh} />}
            {section === "staff" && (
              <Staff staff={staff} staffTab={staffTab} setStaffTab={setStaffTab} refresh={refresh} />
            )}
            {section === "consultation" && <Consultation user={user} refresh={refresh} />}
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}
