import React, { useState, useEffect } from "react";
import { Video, Plus, Check, X, Play } from "lucide-react";
import { api } from "../api.js";
import SectionHeader from "../components/SectionHeader.jsx";
import Panel from "../components/Panel.jsx";
import Badge from "../components/Badge.jsx";

export default function Consultation({ user, refresh }) {
  const [consultations, setConsultations] = useState([]);
  const [patients, setPatients] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    patient_id: "",
    doctor_id: "",
    video_link: "",
    prescription: "",
    notes: "",
    history: "",
    diagnosis: "",
    temperature: "",
    heart_rate: "",
    respiratory_rate: "",
    weight: "",
    height: "",
  });

  useEffect(() => {
    loadConsultations();
    loadPatients();
    loadStaff();
  }, [user]);

  const loadConsultations = async () => {
    try {
      setLoading(true);
      let data;
      if (user?.role === "Doctor") {
        data = await api.getDoctorConsultations(user.id);
      } else if (user?.role === "Patient") {
        data = await api.getPatientConsultations(user.id);
      } else {
        data = await api.getConsultations();
      }
      setConsultations(data);
    } catch (err) {
      setError("Failed to load consultations");
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      const data = await api.getPatients();
      setPatients(data);
    } catch (err) {
      console.error("Failed to load patients:", err);
    }
  };

  const loadStaff = async () => {
    try {
      const data = await api.getStaff("doctors");
      setStaff(data);
    } catch (err) {
      console.error("Failed to load staff:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.patient_id || !formData.doctor_id) {
      setError("Patient and Doctor are required");
      return;
    }

    try {
      if (editingId) {
        await api.updateConsultation(editingId, formData);
      } else {
        await api.createConsultation(formData);
      }
      resetForm();
      loadConsultations();
    } catch (err) {
      setError(err.message || "Failed to save consultation");
    }
  };

  const resetForm = () => {
    setFormData({
      patient_id: "",
      doctor_id: "",
      video_link: "",
      prescription: "",
      notes: "",
      history: "",
      diagnosis: "",
      temperature: "",
      heart_rate: "",
      respiratory_rate: "",
      weight: "",
      height: "",
    });
    setShowForm(false);
    setEditingId(null);
    setError("");
  };

  const handleEdit = (consultation) => {
    setFormData({
      patient_id: consultation.patient_id?.toString() || "",
      doctor_id: consultation.doctor_id?.toString() || "",
      video_link: consultation.video_link || "",
      prescription: consultation.prescription || "",
      notes: consultation.notes || "",
      history: consultation.history || "",
      diagnosis: consultation.diagnosis || "",
      temperature: consultation.temperature || "",
      heart_rate: consultation.heart_rate || "",
      respiratory_rate: consultation.respiratory_rate || "",
      weight: consultation.weight || "",
      height: consultation.height || "",
    });
    setEditingId(consultation.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this consultation?")) return;
    try {
      await api.deleteConsultation(id);
      loadConsultations();
    } catch (err) {
      setError("Failed to delete consultation");
    }
  };

  const handleStatusChange = async (consultation, newStatus) => {
    try {
      const updates = { status: newStatus };
      if (newStatus === "completed") {
        updates.completed_at = new Date().toISOString();
      }
      await api.updateConsultation(consultation.id, updates);
      loadConsultations();
    } catch (err) {
      setError("Failed to update status");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "scheduled": return "accent";
      case "in-progress": return "primary";
      case "completed": return "success";
      case "cancelled": return "danger";
      default: return "muted";
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
          onClick={() => { setShowForm(!showForm); setEditingId(null); setError(""); }}
          style={{ marginBottom: "20px" }}
        >
          <Plus size={16} />
          New Consultation
        </button>
      )}

      {error && (
        <div style={{ padding: "12px 14px", background: "var(--danger-soft)", color: "var(--danger)", borderRadius: "10px", marginBottom: "16px", fontSize: "13px", fontWeight: 600 }}>
          {error}
        </div>
      )}

      {showForm && (
        <Panel title={editingId ? "Edit Consultation" : "New Consultation"} style={{ marginBottom: "20px" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="field-label">
                <label>Patient *</label>
                <select
                  className="fld"
                  value={formData.patient_id}
                  onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                  required
                >
                  <option value="">Select Patient</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="field-label">
                <label>Doctor *</label>
                <select
                  className="fld"
                  value={formData.doctor_id}
                  onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
                  required
                >
                  <option value="">Select Doctor</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ padding: "14px", background: "var(--surface-alt)", borderRadius: "10px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Vitals</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "10px" }}>
                <div className="field-label" style={{ marginBottom: 0 }}>
                  <label>Temperature</label>
                  <input type="text" className="fld" placeholder="98.6°F" value={formData.temperature} onChange={(e) => setFormData({ ...formData, temperature: e.target.value })} />
                </div>
                <div className="field-label" style={{ marginBottom: 0 }}>
                  <label>Heart Rate</label>
                  <input type="text" className="fld" placeholder="110 bpm" value={formData.heart_rate} onChange={(e) => setFormData({ ...formData, heart_rate: e.target.value })} />
                </div>
                <div className="field-label" style={{ marginBottom: 0 }}>
                  <label>Resp. Rate</label>
                  <input type="text" className="fld" placeholder="28 /min" value={formData.respiratory_rate} onChange={(e) => setFormData({ ...formData, respiratory_rate: e.target.value })} />
                </div>
                <div className="field-label" style={{ marginBottom: 0 }}>
                  <label>Weight</label>
                  <input type="text" className="fld" placeholder="14 kg" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} />
                </div>
                <div className="field-label" style={{ marginBottom: 0 }}>
                  <label>Height</label>
                  <input type="text" className="fld" placeholder="95 cm" value={formData.height} onChange={(e) => setFormData({ ...formData, height: e.target.value })} />
                </div>
              </div>
            </div>

            <div style={{ padding: "14px", background: "var(--surface-alt)", borderRadius: "10px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>History</div>
              <div className="field-label" style={{ marginBottom: 0 }}>
                <textarea className="fld" placeholder="Past medical history, allergies, previous medications..." value={formData.history} onChange={(e) => setFormData({ ...formData, history: e.target.value })} style={{ minHeight: "70px", resize: "vertical", fontFamily: "inherit" }} />
              </div>
            </div>

            <div style={{ padding: "14px", background: "var(--surface-alt)", borderRadius: "10px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Diagnosis</div>
              <div className="field-label" style={{ marginBottom: 0 }}>
                <input type="text" className="fld" placeholder="Primary diagnosis..." value={formData.diagnosis} onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })} />
              </div>
            </div>

            <div style={{ padding: "14px", background: "var(--surface-alt)", borderRadius: "10px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Treatment</div>
              <div className="field-label" style={{ marginBottom: 0 }}>
                <label>Prescription</label>
                <textarea className="fld" placeholder="Medication and dosage details..." value={formData.prescription} onChange={(e) => setFormData({ ...formData, prescription: e.target.value })} style={{ minHeight: "80px", resize: "vertical", fontFamily: "inherit" }} />
              </div>
              <div className="field-label" style={{ marginBottom: 0 }}>
                <label>Notes</label>
                <textarea className="fld" placeholder="Additional consultation notes..." value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} style={{ minHeight: "60px", resize: "vertical", fontFamily: "inherit" }} />
              </div>
            </div>

            <div className="field-label">
              <label>Video Link (Zoom/Meet URL)</label>
              <input type="url" className="fld" placeholder="https://meet.google.com/xxx-xxxx-xxx" value={formData.video_link} onChange={(e) => setFormData({ ...formData, video_link: e.target.value })} />
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button type="submit" className="pb">
                {editingId ? "Update" : "Create"} Consultation
              </button>
              <button type="button" className="gb" onClick={resetForm}>
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
          {consultations.map((c) => {
            const patient = patients.find((p) => p.id === c.patient_id);
            const doctor = staff.find((s) => s.id === c.doctor_id);
            return (
              <Panel key={c.id} style={{ padding: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Video size={18} color="var(--primary)" />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "13.5px" }}>
                        {patient ? patient.name : `Patient #${c.patient_id}`} • {doctor ? doctor.name : `Doctor #${c.doctor_id}`}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                        {new Date(c.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Badge tone={getStatusColor(c.status)}>{c.status}</Badge>
                </div>

                {c.video_link && (
                  <div style={{ marginBottom: "10px" }}>
                    <a href={c.video_link} target="_blank" rel="noopener noreferrer" className="pb" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <Video size={14} /> Join Video Call
                    </a>
                  </div>
                )}

                {(c.temperature || c.heart_rate || c.respiratory_rate || c.weight || c.height) && (
                  <div style={{ marginBottom: "10px", padding: "10px", background: "var(--surface-alt)", borderRadius: "8px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: "4px" }}>Vitals</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", fontSize: "13px" }}>
                      {c.temperature && <span>🌡️ {c.temperature}</span>}
                      {c.heart_rate && <span>❤️ {c.heart_rate}</span>}
                      {c.respiratory_rate && <span>🫁 {c.respiratory_rate}</span>}
                      {c.weight && <span>⚖️ {c.weight}</span>}
                      {c.height && <span>📏 {c.height}</span>}
                    </div>
                  </div>
                )}

                {c.history && (
                  <div style={{ marginBottom: "10px", padding: "10px", background: "var(--surface-alt)", borderRadius: "8px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: "4px" }}>History</div>
                    <div style={{ fontSize: "13px", color: "var(--ink)", whiteSpace: "pre-wrap" }}>{c.history}</div>
                  </div>
                )}

                {c.diagnosis && (
                  <div style={{ marginBottom: "10px", padding: "10px", background: "var(--surface-alt)", borderRadius: "8px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: "4px" }}>Diagnosis</div>
                    <div style={{ fontSize: "13px", color: "var(--ink)", whiteSpace: "pre-wrap" }}>{c.diagnosis}</div>
                  </div>
                )}

                {c.prescription && (
                  <div style={{ marginBottom: "10px", padding: "10px", background: "var(--surface-alt)", borderRadius: "8px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: "4px" }}>Prescription</div>
                    <div style={{ fontSize: "13px", color: "var(--ink)", whiteSpace: "pre-wrap" }}>{c.prescription}</div>
                  </div>
                )}

                {c.notes && (
                  <div style={{ marginBottom: "10px", padding: "10px", background: "var(--surface-alt)", borderRadius: "8px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: "4px" }}>Notes</div>
                    <div style={{ fontSize: "13px", color: "var(--ink)", whiteSpace: "pre-wrap" }}>{c.notes}</div>
                  </div>
                )}

                <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
                  {(user?.role === "Doctor" || user?.role === "Admin") && (
                    <>
                      {c.status === "scheduled" && (
                        <button onClick={() => handleStatusChange(c, "in-progress")} className="gb" style={{ flex: "1 1 auto" }}>
                          <Play size={14} /> Start
                        </button>
                      )}
                      {c.status !== "completed" && c.status !== "cancelled" && (
                        <button onClick={() => handleStatusChange(c, "completed")} className="gb" style={{ flex: "1 1 auto" }}>
                          <Check size={14} /> Complete
                        </button>
                      )}
                      {c.status !== "cancelled" && (
                        <button onClick={() => handleStatusChange(c, "cancelled")} className="gb" style={{ flex: "1 1 auto" }}>
                          <X size={14} /> Cancel
                        </button>
                      )}
                      <button onClick={() => handleEdit(c)} className="gb" style={{ flex: "1 1 auto" }}>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="gb" style={{ flex: "1 1 auto", color: "var(--danger)" }}>
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </Panel>
            );
          })}
        </div>
      )}
    </>
  );
}
