import React, { useState, useEffect, useRef } from "react";
import { Video, Plus, Check, X, Play, Printer, Trash2 } from "lucide-react";
import { api } from "../api.js";
import SectionHeader from "../components/SectionHeader.jsx";
import Panel from "../components/Panel.jsx";
import Badge from "../components/Badge.jsx";

const emptyMedicine = () => ({
  name: "",
  dosage: "",
  frequency: "",
  duration: "",
  foodRelation: "",
  notes: "",
});

const emptyForm = () => ({
  patient_id: "",
  doctor_id: "",
  video_link: "",
  notes: "",
  history: "",
  diagnosis: "",
  temperature: "",
  heart_rate: "",
  respiratory_rate: "",
  weight: "",
  height: "",
  foodRecommendations: "",
  generalInstructions: "",
  medicines: [emptyMedicine()],
});

export default function Consultation({ user, refresh }) {
  const [consultations, setConsultations] = useState([]);
  const [patients, setPatients] = useState([]);
  const [staff, setStaff] = useState([]);
  const [drugs, setDrugs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState(emptyForm());
  const printRef = useRef();

  useEffect(() => {
    loadConsultations();
    loadPatients();
    loadStaff();
    loadDrugs();
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

  const loadDrugs = async () => {
    try {
      const data = await api.getDrugs();
      setDrugs(data);
    } catch (err) {
      console.error("Failed to load drugs:", err);
    }
  };

  const updateField = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

  const updateMedicine = (index, field, value) => {
    const updated = [...formData.medicines];
    updated[index] = { ...updated[index], [field]: value };
    updateField("medicines", updated);
  };

  const addMedicine = () => updateField("medicines", [...formData.medicines, emptyMedicine()]);
  const removeMedicine = (index) => {
    if (formData.medicines.length <= 1) return;
    updateField("medicines", formData.medicines.filter((_, i) => i !== index));
  };

  const buildPrescriptionText = () => {
    const lines = [];
    formData.medicines.forEach((med, i) => {
      if (med.name) {
        lines.push(`${i + 1}. ${med.name} - ${med.dosage}`);
        if (med.frequency) lines.push(`   Frequency: ${med.frequency}`);
        if (med.duration) lines.push(`   Duration: ${med.duration}`);
        if (med.foodRelation) lines.push(`   Take: ${med.foodRelation}`);
        if (med.notes) lines.push(`   Note: ${med.notes}`);
      }
    });
    return lines.join("\n");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.patient_id || !formData.doctor_id) {
      setError("Patient and Doctor are required");
      return;
    }

    const prescription = buildPrescriptionText();
    const payload = {
      ...formData,
      prescription: prescription || formData.notes,
      medicines: undefined,
    };
    delete payload.medicines;

    try {
      if (editingId) {
        await api.updateConsultation(editingId, payload);
      } else {
        await api.createConsultation(payload);
      }
      resetForm();
      loadConsultations();
    } catch (err) {
      setError(err.message || "Failed to save consultation");
    }
  };

  const resetForm = () => {
    setFormData(emptyForm());
    setShowForm(false);
    setEditingId(null);
    setError("");
  };

  const handleEdit = (c) => {
    let medicines = [emptyMedicine()];
    if (c.prescription) {
      const parsed = parsePrescription(c.prescription);
      if (parsed.length > 0) medicines = parsed;
    }
    setFormData({
      patient_id: c.patient_id?.toString() || "",
      doctor_id: c.doctor_id?.toString() || "",
      video_link: c.video_link || "",
      notes: c.notes || "",
      history: c.history || "",
      diagnosis: c.diagnosis || "",
      temperature: c.temperature || "",
      heart_rate: c.heart_rate || "",
      respiratory_rate: c.respiratory_rate || "",
      weight: c.weight || "",
      height: c.height || "",
      foodRecommendations: c.foodRecommendations || "",
      generalInstructions: c.generalInstructions || "",
      medicines,
    });
    setEditingId(c.id);
    setShowForm(true);
  };

  const parsePrescription = (text) => {
    if (!text) return [];
    const medicines = [];
    const blocks = text.split(/\n\s*\n|\n\d+\./).filter(Boolean);
    blocks.forEach((block) => {
      const lines = block.trim().split("\n");
      const med = emptyMedicine();
      const firstLine = lines[0].replace(/^\d+\.\s*/, "").trim();
      const parts = firstLine.split(" - ");
      med.name = parts[0] || "";
      med.dosage = parts[1] || "";
      lines.slice(1).forEach((line) => {
        const l = line.trim();
        if (l.toLowerCase().startsWith("frequency:")) med.frequency = l.split(":")[1]?.trim() || "";
        else if (l.toLowerCase().startsWith("duration:")) med.duration = l.split(":")[1]?.trim() || "";
        else if (l.toLowerCase().startsWith("take:")) med.foodRelation = l.split(":")[1]?.trim() || "";
        else if (l.toLowerCase().startsWith("note:")) med.notes = l.split(":")[1]?.trim() || "";
      });
      if (med.name) medicines.push(med);
    });
    return medicines.length > 0 ? medicines : [emptyMedicine()];
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
      if (newStatus === "completed") updates.completed_at = new Date().toISOString();
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

  const handlePrint = (consultation) => {
    const patient = patients.find((p) => p.id === consultation.patient_id);
    const doctor = staff.find((s) => s.id === consultation.doctor_id);
    const printContent = `
      <html>
        <head>
          <title>ePrescription - ${patient?.name || "Patient"}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #1a1a1a; }
            .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
            .clinic-name { font-size: 24px; font-weight: 700; color: #2563eb; margin: 0; }
            .subtitle { font-size: 14px; color: #666; margin: 4px 0 0; }
            .section { margin-bottom: 24px; }
            .section-title { font-size: 12px; font-weight: 700; color: #2563eb; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 14px; }
            .info-item { display: flex; gap: 8px; }
            .info-label { font-weight: 600; color: #4b5563; min-width: 100px; }
            .medicine { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 10px; }
            .medicine-name { font-weight: 600; font-size: 15px; color: #1e40af; }
            .medicine-details { font-size: 13px; color: #4b5563; margin-top: 4px; line-height: 1.6; }
            .food-note { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 10px 14px; margin-top: 8px; font-size: 13px; }
            .instructions { background: #ecfdf5; border-left: 4px solid #10b981; padding: 10px 14px; font-size: 13px; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; text-align: center; }
            @media print { body { padding: 20px; } .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="clinic-name">Dr. Sudharsan's Children's Clinic</h1>
            <p class="subtitle">ePrescription | ${new Date(consultation.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
          </div>

          <div class="section">
            <div class="section-title">Patient Information</div>
            <div class="info-grid">
              <div class="info-item"><span class="info-label">Patient:</span> ${patient?.name || `Patient #${consultation.patient_id}`}</div>
              <div class="info-item"><span class="info-label">Doctor:</span> ${doctor?.name || `Doctor #${consultation.doctor_id}`}</div>
              ${patient?.age ? `<div class="info-item"><span class="info-label">Age:</span> ${patient.age}</div>` : ""}
              ${patient?.phone ? `<div class="info-item"><span class="info-label">Phone:</span> ${patient.phone}</div>` : ""}
            </div>
          </div>

          ${(consultation.temperature || consultation.heart_rate || consultation.respiratory_rate || consultation.weight || consultation.height) ? `
          <div class="section">
            <div class="section-title">Vitals</div>
            <div class="info-grid">
              ${consultation.temperature ? `<div class="info-item"><span class="info-label">Temperature:</span> ${consultation.temperature}</div>` : ""}
              ${consultation.heart_rate ? `<div class="info-item"><span class="info-label">Heart Rate:</span> ${consultation.heart_rate}</div>` : ""}
              ${consultation.respiratory_rate ? `<div class="info-item"><span class="info-label">Resp. Rate:</span> ${consultation.respiratory_rate}</div>` : ""}
              ${consultation.weight ? `<div class="info-item"><span class="info-label">Weight:</span> ${consultation.weight}</div>` : ""}
              ${consultation.height ? `<div class="info-item"><span class="info-label">Height:</span> ${consultation.height}</div>` : ""}
            </div>
          </div>` : ""}

          ${consultation.diagnosis ? `
          <div class="section">
            <div class="section-title">Diagnosis</div>
            <p style="font-size: 14px; margin: 0;">${consultation.diagnosis}</p>
          </div>` : ""}

          ${consultation.prescription ? `
          <div class="section">
            <div class="section-title">Prescription</div>
            ${consultation.prescription.split("\n\n").filter(Boolean).map((block) => {
              const lines = block.trim().split("\n");
              const firstLine = lines[0].replace(/^\d+\.\s*/, "").trim();
              const parts = firstLine.split(" - ");
              return `<div class="medicine">
                <div class="medicine-name">${parts[0]}</div>
                <div class="medicine-details">
                  ${parts[1] ? `<div><strong>Dosage:</strong> ${parts[1]}</div>` : ""}
                  ${lines.slice(1).map((l) => {
                    const line = l.trim();
                    if (line.toLowerCase().startsWith("frequency:")) return `<div><strong>Frequency:</strong> ${line.split(":")[1]?.trim()}</div>`;
                    if (line.toLowerCase().startsWith("duration:")) return `<div><strong>Duration:</strong> ${line.split(":")[1]?.trim()}</div>`;
                    if (line.toLowerCase().startsWith("take:")) return `<div><strong>Take:</strong> ${line.split(":")[1]?.trim()}</div>`;
                    if (line.toLowerCase().startsWith("note:")) return `<div><strong>Note:</strong> ${line.split(":")[1]?.trim()}</div>`;
                    return "";
                  }).join("")}
                </div>
              </div>`;
            }).join("")}
          </div>` : ""}

          ${consultation.foodRecommendations ? `
          <div class="section">
            <div class="section-title">Food & Diet Recommendations</div>
            <div class="food-note">${consultation.foodRecommendations}</div>
          </div>` : ""}

          ${consultation.generalInstructions ? `
          <div class="section">
            <div class="section-title">General Instructions</div>
            <div class="instructions">${consultation.generalInstructions}</div>
          </div>` : ""}

          <div class="footer">
            <p>This is a computer-generated ePrescription from Dr. Sudharsan's Children's Clinic.</p>
            <p>For any queries, contact: 94440 12233</p>
          </div>
        </body>
      </html>
    `;
    const win = window.open("", "_blank");
    win.document.write(printContent);
    win.document.close();
    win.print();
  };

  return (
    <>
      <SectionHeader
        eyebrow="Consultations"
        title="Doctor Consultations"
        subtitle="Manage consultations and ePrescriptions"
      />

      {(user?.role === "Doctor" || user?.role === "Admin") && (
        <button className="pb" onClick={() => { setShowForm(!showForm); setEditingId(null); setError(""); }} style={{ marginBottom: "20px" }}>
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
                <select className="fld" value={formData.patient_id} onChange={(e) => updateField("patient_id", e.target.value)} required>
                  <option value="">Select Patient</option>
                  {patients.map((p) => (<option key={p.id} value={p.id}>{p.name} ({p.age})</option>))}
                </select>
              </div>
              <div className="field-label">
                <label>Doctor *</label>
                <select className="fld" value={formData.doctor_id} onChange={(e) => updateField("doctor_id", e.target.value)} required>
                  <option value="">Select Doctor</option>
                  {staff.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
                </select>
              </div>
            </div>

            <div style={{ padding: "14px", background: "var(--surface-alt)", borderRadius: "10px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Vitals</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "10px" }}>
                <div className="field-label" style={{ marginBottom: 0 }}>
                  <label>Temperature</label>
                  <input type="text" className="fld" placeholder="98.6°F" value={formData.temperature} onChange={(e) => updateField("temperature", e.target.value)} />
                </div>
                <div className="field-label" style={{ marginBottom: 0 }}>
                  <label>Heart Rate</label>
                  <input type="text" className="fld" placeholder="110 bpm" value={formData.heart_rate} onChange={(e) => updateField("heart_rate", e.target.value)} />
                </div>
                <div className="field-label" style={{ marginBottom: 0 }}>
                  <label>Resp. Rate</label>
                  <input type="text" className="fld" placeholder="28 /min" value={formData.respiratory_rate} onChange={(e) => updateField("respiratory_rate", e.target.value)} />
                </div>
                <div className="field-label" style={{ marginBottom: 0 }}>
                  <label>Weight</label>
                  <input type="text" className="fld" placeholder="14 kg" value={formData.weight} onChange={(e) => updateField("weight", e.target.value)} />
                </div>
                <div className="field-label" style={{ marginBottom: 0 }}>
                  <label>Height</label>
                  <input type="text" className="fld" placeholder="95 cm" value={formData.height} onChange={(e) => updateField("height", e.target.value)} />
                </div>
              </div>
            </div>

            <div style={{ padding: "14px", background: "var(--surface-alt)", borderRadius: "10px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>History</div>
              <div className="field-label" style={{ marginBottom: 0 }}>
                <textarea className="fld" placeholder="Past medical history, allergies, previous medications..." value={formData.history} onChange={(e) => updateField("history", e.target.value)} style={{ minHeight: "70px", resize: "vertical", fontFamily: "inherit" }} />
              </div>
            </div>

            <div style={{ padding: "14px", background: "var(--surface-alt)", borderRadius: "10px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Diagnosis</div>
              <div className="field-label" style={{ marginBottom: 0 }}>
                <input type="text" className="fld" placeholder="Primary diagnosis..." value={formData.diagnosis} onChange={(e) => updateField("diagnosis", e.target.value)} />
              </div>
            </div>

            <div style={{ padding: "14px", background: "var(--surface-alt)", borderRadius: "10px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>ePrescription - Medicines</div>
                <button type="button" className="gb" onClick={addMedicine} style={{ fontSize: "12px", padding: "4px 10px" }}>
                  <Plus size={12} /> Add Medicine
                </button>
              </div>

              {formData.medicines.map((med, idx) => (
                <div key={idx} style={{ background: "white", border: "1px solid var(--border)", borderRadius: "8px", padding: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--muted)" }}>Medicine #{idx + 1}</span>
                    {formData.medicines.length > 1 && (
                      <button type="button" onClick={() => removeMedicine(idx)} style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer" }}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div className="field-label" style={{ marginBottom: 0 }}>
                      <label>Medicine Name (Generic) *</label>
                      <input
                        type="text"
                        className="fld"
                        placeholder="Paracetamol"
                        value={med.name}
                        onChange={(e) => updateMedicine(idx, "name", e.target.value)}
                        list={`drugs-list-${idx}`}
                        required
                      />
                      <datalist id={`drugs-list-${idx}`}>
                        {drugs.map((d) => (
                          <option key={d.id} value={d.name} />
                        ))}
                      </datalist>
                    </div>
                    <div className="field-label" style={{ marginBottom: 0 }}>
                      <label>Dosage *</label>
                      <input type="text" className="fld" placeholder="5ml" value={med.dosage} onChange={(e) => updateMedicine(idx, "dosage", e.target.value)} required />
                    </div>
                    <div className="field-label" style={{ marginBottom: 0 }}>
                      <label>Frequency</label>
                      <select className="fld" value={med.frequency} onChange={(e) => updateMedicine(idx, "frequency", e.target.value)}>
                        <option value="">Select</option>
                        <option value="Once daily">Once daily</option>
                        <option value="Twice daily (BD)">Twice daily (BD)</option>
                        <option value="Thrice daily (TDS)">Thrice daily (TDS)</option>
                        <option value="Four times daily (QID)">Four times daily (QID)</option>
                        <option value="Every 4 hours">Every 4 hours</option>
                        <option value="Every 6 hours">Every 6 hours</option>
                        <option value="Every 8 hours">Every 8 hours</option>
                        <option value="At bedtime (HS)">At bedtime (HS)</option>
                        <option value="As needed (SOS)">As needed (SOS)</option>
                      </select>
                    </div>
                    <div className="field-label" style={{ marginBottom: 0 }}>
                      <label>Duration</label>
                      <input type="text" className="fld" placeholder="5 days" value={med.duration} onChange={(e) => updateMedicine(idx, "duration", e.target.value)} />
                    </div>
                  </div>
                  <div className="field-label" style={{ marginBottom: 0 }}>
                    <label>Food Relation</label>
                    <select className="fld" value={med.foodRelation} onChange={(e) => updateMedicine(idx, "foodRelation", e.target.value)}>
                      <option value="">Select</option>
                      <option value="Before food (Empty stomach)">Before food (Empty stomach)</option>
                      <option value="After food">After food</option>
                      <option value="With food">With food</option>
                      <option value="No specific requirement">No specific requirement</option>
                    </select>
                  </div>
                  <div className="field-label" style={{ marginBottom: 0 }}>
                    <label>Special Instructions</label>
                    <input type="text" className="fld" placeholder="Shake well before use, refrigerate..." value={med.notes} onChange={(e) => updateMedicine(idx, "notes", e.target.value)} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: "14px", background: "var(--surface-alt)", borderRadius: "10px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Food & Diet Recommendations</div>
              <div className="field-label" style={{ marginBottom: 0 }}>
                <textarea className="fld" placeholder="E.g., Avoid cold drinks, include probiotics, light meals only..." value={formData.foodRecommendations} onChange={(e) => updateField("foodRecommendations", e.target.value)} style={{ minHeight: "60px", resize: "vertical", fontFamily: "inherit" }} />
              </div>
            </div>

            <div style={{ padding: "14px", background: "var(--surface-alt)", borderRadius: "10px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>General Instructions</div>
              <div className="field-label" style={{ marginBottom: 0 }}>
                <textarea className="fld" placeholder="Follow up in 3 days, return if fever persists, adequate rest..." value={formData.generalInstructions} onChange={(e) => updateField("generalInstructions", e.target.value)} style={{ minHeight: "60px", resize: "vertical", fontFamily: "inherit" }} />
              </div>
            </div>

            <div className="field-label">
              <label>Video Link (Optional - for teleconsultation)</label>
              <input type="url" className="fld" placeholder="https://meet.google.com/xxx-xxxx-xxx" value={formData.video_link} onChange={(e) => updateField("video_link", e.target.value)} />
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button type="submit" className="pb">{editingId ? "Update" : "Create"} Consultation</button>
              <button type="button" className="gb" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </Panel>
      )}

      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>Loading consultations...</div>
      ) : consultations.length === 0 ? (
        <Panel title="Consultations">
          <p style={{ fontSize: "13.5px", color: "var(--muted)", textAlign: "center" }}>No consultations yet.</p>
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
                        {patient?.name || `Patient #${c.patient_id}`} • {doctor?.name || `Doctor #${c.doctor_id}`}
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

                {c.diagnosis && (
                  <div style={{ marginBottom: "10px", padding: "10px", background: "var(--surface-alt)", borderRadius: "8px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: "4px" }}>Diagnosis</div>
                    <div style={{ fontSize: "13px", color: "var(--ink)" }}>{c.diagnosis}</div>
                  </div>
                )}

                {c.prescription && (
                  <div style={{ marginBottom: "10px", padding: "10px", background: "var(--surface-alt)", borderRadius: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Prescription</div>
                      <button onClick={() => handlePrint(c)} className="gb" style={{ fontSize: "11px", padding: "4px 8px" }}>
                        <Printer size={12} /> Print
                      </button>
                    </div>
                    <div style={{ fontSize: "13px", color: "var(--ink)", whiteSpace: "pre-wrap", lineHeight: "1.6" }}>{c.prescription}</div>
                  </div>
                )}

                {c.foodRecommendations && (
                  <div style={{ marginBottom: "10px", padding: "10px", background: "#fef3c7", borderRadius: "8px", borderLeft: "4px solid #f59e0b" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#92400e", textTransform: "uppercase", marginBottom: "4px" }}>Food & Diet</div>
                    <div style={{ fontSize: "13px", color: "#78350f" }}>{c.foodRecommendations}</div>
                  </div>
                )}

                {c.generalInstructions && (
                  <div style={{ marginBottom: "10px", padding: "10px", background: "#ecfdf5", borderRadius: "8px", borderLeft: "4px solid #10b981" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#065f46", textTransform: "uppercase", marginBottom: "4px" }}>Instructions</div>
                    <div style={{ fontSize: "13px", color: "#064e3b" }}>{c.generalInstructions}</div>
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
                      <button onClick={() => handleEdit(c)} className="gb" style={{ flex: "1 1 auto" }}>Edit</button>
                      <button onClick={() => handleDelete(c.id)} className="gb" style={{ flex: "1 1 auto", color: "var(--danger)" }}>Delete</button>
                    </>
                  )}
                  {c.status === "completed" && (
                    <button onClick={() => handlePrint(c)} className="gb" style={{ flex: "1 1 auto" }}>
                      <Printer size={14} /> Print ePrescription
                    </button>
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
