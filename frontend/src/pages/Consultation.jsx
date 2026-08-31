import React, { useState, useEffect } from "react";
import { Video, Plus, Check, X } from "lucide-react";
import { api } from "../api.js";
import SectionHeader from "../components/SectionHeader.jsx";
import Panel from "../components/Panel.jsx";
import Badge from "../components/Badge.jsx";

export default function Consultation({ user, refresh }) {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    patient_id: "",
    doctor_id: "",
    video_link: "",
    prescription: "",
    notes: "",
    vitals: "",
    history: "",
    diagnosis: "",
  });

  useEffect(() => {
    loadConsultations();
  }, [user]);

  const loadConsultations = async () => {
    try {
      setLoading(true);
      if (user?.role === "Doctor") {
        const data = await api.getDoctorConsultations(user.id);
        setConsultations(data);
      } else if (user?.role === "Patient") {
        const data = await api.getPatientConsultations(user.id);
        setConsultations(data);
      } else {
        const data = await api.getConsultations();
        setConsultations(data);
      }
    } catch (error) {
      console.error("Failed to load consultations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.updateConsultation(editingId, formData);
      } else {
        await api.createConsultation(formData);
      }
            setFormData({ patient_id: "", doctor_id: "", video_link: "", prescription: "", notes: "", vitals: "", history: "", diagnosis: "" });
      setShowForm(false);
      setEditingId(null);
      loadConsultations();
    } catch (error) {
      console.error("Failed to save consultation:", error);
    }
  };

  const handleEdit = (consultation) => {
    setFormData(consultation);
    setEditingId(consultation.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this consultation?")) {
      try {
        await api.deleteConsultation(id);
        loadConsultations();
      } catch (error) {
        console.error("Failed to delete consultation:", error);
      }
    }
  };

  const handleStatusChange = async (consultation, newStatus) => {
    try {
      const completed_at = newStatus === "completed" ? new Date().toISOString() : null;
      await api.updateConsultation(consultation.id, { status: newStatus, completed_at });
      loadConsultations();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "scheduled":
        return "accent";
      case "in-progress":
        return "primary";
      case "completed":
        return "success";
      case "cancelled":
        return "danger";
      default:
        return "muted";
    }
  };

  return (
    <>
      <SectionHeader
        eyebrow="Consultations"
        title="Doctor Consultations"
        subtitle="Manage video consultations and prescriptions"
      />

      {(user?.role === "Doctor" || user?.role === "Admin") && (
        <button
          className="pb"
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
      setFormData({ patient_id: "", doctor_id: "", video_link: "", prescription: "", notes: "", vitals: "", history: "", diagnosis: "" });
          }}
          style={{ marginBottom: "20px" }}
        >
          <Plus size={16} />
          New Consultation
        </button>
      )}

      {showForm && (
        <Panel title={editingId ? "Edit Consultation" : "New Consultation"} style={{ marginBottom: "20px" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="field-label">
                <label>Patient ID</label>
                <input
                  type="number"
                  className="fld"
                  value={formData.patient_id}
                  onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                />
              </div>
              <div className="field-label">
                <label>Doctor ID</label>
                <input
                  type="number"
                  className="fld"
                  value={formData.doctor_id}
                  onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
                />
              </div>
            </div>

            <div className="field-label">
              <label>Video Link (Zoom/Meet URL)</label>
              <input
                type="url"
                className="fld"
                placeholder="https://meet.google.com/xxx-xxxx-xxx"
                value={formData.video_link}
                onChange={(e) => setFormData({ ...formData, video_link: e.target.value })}
              />
            </div>

            <div className="field-label">
              <label>Prescription</label>
              <textarea
                className="fld"
                placeholder="Medication and dosage details..."
                value={formData.prescription}
                onChange={(e) => setFormData({ ...formData, prescription: e.target.value })}
                style={{ minHeight: "80px", resize: "vertical", fontFamily: "inherit" }}
              />
            </div>

            <div className="field-label">
              <label>Notes</label>
              <textarea
                className="fld"
                placeholder="Additional consultation notes..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                style={{ minHeight: "80px", resize: "vertical", fontFamily: "inherit" }}
              />
            </div>

            <div className="field-label">
              <label>Vitals</label>
              <input
                type="text"
                className="fld"
                placeholder="Temp: 99°F, HR: 110bpm, RR: 28/min..."
                value={formData.vitals}
                onChange={(e) => setFormData({ ...formData, vitals: e.target.value })}
              />
            </div>

            <div className="field-label">
              <label>History</label>
              <textarea
                className="fld"
                placeholder="Past medical history, allergies, etc..."
                value={formData.history}
                onChange={(e) => setFormData({ ...formData, history: e.target.value })}
                style={{ minHeight: "60px", resize: "vertical", fontFamily: "inherit" }}
              />
            </div>

            <div className="field-label">
              <label>Diagnosis</label>
              <input
                type="text"
                className="fld"
                placeholder="Primary diagnosis..."
                value={formData.diagnosis}
                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              />
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button type="submit" className="pb">
                {editingId ? "Update" : "Create"} Consultation
              </button>
              <button
                type="button"
                className="gb"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </Panel>
      )}

      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>Loading consultations...</div>
      ) : consultations.length === 0 ? (
        <Panel title="Consultations">
          <p style={{ fontSize: "13.5px", color: "var(--muted)", textAlign: "center" }}>No consultations scheduled yet.</p>
        </Panel>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {consultations.map((consultation) => (
            <Panel key={consultation.id} style={{ padding: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Video size={18} color="var(--primary)" />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "13.5px" }}>
                      Patient #{consultation.patient_id} • Doctor #{consultation.doctor_id}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                      {new Date(consultation.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <Badge tone={getStatusColor(consultation.status)}>{consultation.status}</Badge>
              </div>

              {consultation.video_link && (
                <div style={{ marginBottom: "10px" }}>
                  <a href={consultation.video_link} target="_blank" rel="noopener noreferrer" className="pb" style={{ textDecoration: "none" }}>
                    <Video size={14} /> Join Video Call
                  </a>
                </div>
              )}

              {consultation.prescription && (
                <div style={{ marginBottom: "10px", padding: "10px", background: "var(--surface-alt)", borderRadius: "8px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: "4px" }}>
                    Prescription
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--ink)", whiteSpace: "pre-wrap" }}>{consultation.prescription}</div>
                </div>
              )}

              {consultation.notes && (
                <div style={{ marginBottom: "10px", padding: "10px", background: "var(--surface-alt)", borderRadius: "8px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: "4px" }}>
                    Notes
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--ink)", whiteSpace: "pre-wrap" }}>{consultation.notes}</div>
                </div>
              )}

              {consultation.vitals && (
                <div style={{ marginBottom: "10px", padding: "10px", background: "var(--surface-alt)", borderRadius: "8px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: "4px" }}>
                    Vitals
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--ink)", whiteSpace: "pre-wrap" }}>{consultation.vitals}</div>
                </div>
              )}

              {consultation.history && (
                <div style={{ marginBottom: "10px", padding: "10px", background: "var(--surface-alt)", borderRadius: "8px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: "4px" }}>
                    History
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--ink)", whiteSpace: "pre-wrap" }}>{consultation.history}</div>
                </div>
              )}

              {consultation.diagnosis && (
                <div style={{ marginBottom: "10px", padding: "10px", background: "var(--surface-alt)", borderRadius: "8px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: "4px" }}>
                    Diagnosis
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--ink)", whiteSpace: "pre-wrap" }}>{consultation.diagnosis}</div>
                </div>
              )}

              <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                {(user?.role === "Doctor" || user?.role === "Admin") && (
                  <>
                    {consultation.status !== "completed" && (
                      <button
                        onClick={() => handleStatusChange(consultation, "completed")}
                        className="gb"
                        style={{ flex: 1 }}
                      >
                        <Check size={14} /> Mark Complete
                      </button>
                    )}
                    {consultation.status !== "cancelled" && (
                      <button
                        onClick={() => handleStatusChange(consultation, "cancelled")}
                        className="gb"
                        style={{ flex: 1 }}
                      >
                        <X size={14} /> Cancel
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(consultation)}
                      className="gb"
                      style={{ flex: 1 }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(consultation.id)}
                      className="gb"
                      style={{ flex: 1, color: "var(--danger)" }}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </Panel>
          ))}
        </div>
      )}
    </>
  );
}
