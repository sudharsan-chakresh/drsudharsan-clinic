const BASE = "/api";

async function request(path, options = {}) {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    headers,
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  login: async (email, password) => {
    const data = await request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
    if (data.token) localStorage.setItem("token", data.token);
    return data.user;
  },
  register: (data) => request("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  logout: () => {
    localStorage.removeItem("token");
    return request("/auth/logout", { method: "POST" });
  },
  getUsers: () => request("/auth/users"),
  createUser: (data) => request("/auth/users", { method: "POST", body: JSON.stringify(data) }),
  getUser: (id) => request(`/auth/users/${id}`),

  getConsultations: () => request("/consultations"),
  getDoctorConsultations: (doctorId) => request(`/consultations/doctor/${doctorId}`),
  getPatientConsultations: (patientId) => request(`/consultations/patient/${patientId}`),
  getConsultation: (id) => request(`/consultations/${id}`),
  createConsultation: (data) => request("/consultations", { method: "POST", body: JSON.stringify(data) }),
  updateConsultation: (id, data) => request(`/consultations/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteConsultation: (id) => request(`/consultations/${id}`, { method: "DELETE" }),

  getAppointments: () => request("/appointments"),
  createAppointment: (data) => request("/appointments", { method: "POST", body: JSON.stringify(data) }),
  deleteAppointment: (id) => request(`/appointments/${id}`, { method: "DELETE" }),

  getPatients: () => request("/patients"),
  createPatient: (data) => request("/patients", { method: "POST", body: JSON.stringify(data) }),
  deletePatient: (id) => request(`/patients/${id}`, { method: "DELETE" }),

  getQueue: () => request("/queue"),
  createQueueEntry: (data) => request("/queue", { method: "POST", body: JSON.stringify(data) }),
  advanceQueueEntry: (id) => request(`/queue/${id}/advance`, { method: "PATCH" }),
  deleteQueueEntry: (id) => request(`/queue/${id}`, { method: "DELETE" }),

  getStock: () => request("/stock"),
  createStockItem: (data) => request("/stock", { method: "POST", body: JSON.stringify(data) }),
  deleteStockItem: (id) => request(`/stock/${id}`, { method: "DELETE" }),

  getInvoices: () => request("/invoices"),
  createInvoice: (data) => request("/invoices", { method: "POST", body: JSON.stringify(data) }),
  toggleInvoicePaid: (id) => request(`/invoices/${id}/toggle-paid`, { method: "PATCH" }),

  getStaff: (role) => request(role ? `/staff?role=${role}` : "/staff"),
  createStaffMember: (data) => request("/staff", { method: "POST", body: JSON.stringify(data) }),
  deleteStaffMember: (id) => request(`/staff/${id}`, { method: "DELETE" }),
};
