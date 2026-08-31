import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, Search } from "lucide-react";
import Panel from "../components/Panel.jsx";
import Field from "../components/Field.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import { PrimaryButton, GhostButton } from "../components/Buttons.jsx";
import { api } from "../api.js";

export default function Drugs() {
  const [drugs, setDrugs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", category: "", form: "", strength: "", common_usage: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadDrugs();
    loadCategories();
  }, []);

  async function loadDrugs() {
    try {
      setLoading(true);
      const data = await api.getDrugs(search);
      setDrugs(data);
    } catch (err) {
      console.error("Failed to load drugs:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    try {
      const data = await api.getDrugCategories();
      setCategories(data);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => loadDrugs(), 300);
    return () => clearTimeout(timer);
  }, [search]);

  function startEdit(drug) {
    setEditing(drug.id);
    setForm({
      name: drug.name || "",
      category: drug.category || "",
      form: drug.form || "",
      strength: drug.strength || "",
      common_usage: drug.common_usage || "",
    });
    setShowForm(false);
  }

  function cancelEdit() {
    setEditing(null);
    setForm({ name: "", category: "", form: "", strength: "", common_usage: "" });
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.name || saving) return;
    setSaving(true);
    try {
      if (editing) {
        await api.updateDrug(editing, form);
      } else {
        await api.createDrug(form);
      }
      setForm({ name: "", category: "", form: "", strength: "", common_usage: "" });
      setShowForm(false);
      setEditing(null);
      await loadDrugs();
    } catch (err) {
      alert("Failed to save drug");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this drug?")) return;
    try {
      await api.deleteDrug(id);
      await loadDrugs();
    } catch (err) {
      alert("Failed to delete");
    }
  }

  return (
    <>
      <SectionHeader eyebrow="Masters" title="Drug Master" subtitle="Manage medicine database with generic names, forms, and strengths." />

      <Panel
        title={`${drugs.length} Medicines`}
        action={
          <PrimaryButton onClick={() => { setShowForm((s) => !s); setEditing(null); setForm({ name: "", category: "", form: "", strength: "", common_usage: "" }); }}>
            <Plus size={16} /> Add Drug
          </PrimaryButton>
        }
      >
        <div style={{ marginBottom: "16px", display: "flex", gap: "10px", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={16} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
            <input
              type="text"
              placeholder="Search medicines..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="fld"
              style={{ paddingLeft: "32px" }}
            />
          </div>
        </div>

        {(showForm || editing) && (
          <form onSubmit={submit} style={{ marginBottom: "16px", padding: "16px", background: "var(--surface-alt)", borderRadius: "10px" }}>
            <div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr auto auto" }}>
              <Field label="Drug Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Paracetamol" />
              <Field label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Analgesic" />
              <Field label="Form" value={form.form} onChange={(e) => setForm({ ...form, form: e.target.value })} placeholder="Syrup" />
              <Field label="Strength" value={form.strength} onChange={(e) => setForm({ ...form, strength: e.target.value })} placeholder="120mg/5ml" />
              <Field label="Usage" value={form.common_usage} onChange={(e) => setForm({ ...form, common_usage: e.target.value })} placeholder="Fever" />
              <div style={{ alignSelf: "end" }}><PrimaryButton>{saving ? "Saving…" : editing ? "Update" : "Save"}</PrimaryButton></div>
              <div style={{ alignSelf: "end" }}><GhostButton onClick={cancelEdit} icon={X}>Cancel</GhostButton></div>
            </div>
          </form>
        )}

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>Loading...</div>
        ) : (
          <table className="dtable">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Form</th>
                <th>Strength</th>
                <th>Common Usage</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {drugs.map((d) => (
                <tr key={d.id}>
                  <td style={{ fontWeight: 700 }}>{d.name}</td>
                  <td style={{ color: "var(--muted)" }}>{d.category}</td>
                  <td>{d.form}</td>
                  <td>{d.strength}</td>
                  <td style={{ color: "var(--muted)" }}>{d.common_usage}</td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button onClick={() => startEdit(d)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--primary)" }} title="Edit">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(d.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)" }} title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
    </>
  );
}
