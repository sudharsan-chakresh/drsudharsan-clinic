export type AppointmentStatus = "Scheduled" | "Completed" | "Cancelled";
export type QueueStage = "waiting" | "consult" | "done";
export type InvoiceStatus = "Paid" | "Pending";
export type StaffRole = "doctors" | "pharmacists" | "receptionist" | "housekeeping";
export type StaffStatus = "On duty" | "Off today";
export type UserRole = "Admin" | "Doctor" | "Receptionist" | "Pharmacist" | "Patient";
export type ConsultationStatus = "scheduled" | "in-progress" | "completed" | "cancelled";

export interface Appointment {
  id: number;
  time: string;
  patient: string;
  guardian: string;
  doctor: string;
  type: string;
  status: AppointmentStatus;
}

export interface Patient {
  id: number;
  name: string;
  guardian: string;
  age: string;
  phone: string;
  blood: string;
  last_visit: string;
}

export interface QueueEntry {
  id: number;
  token: string;
  patient: string;
  doctor: string;
  stage: QueueStage;
}

export interface StockItem {
  id: number;
  name: string;
  category: string;
  qty: number;
  reorder: number;
  unit: string;
}

export interface Invoice {
  id: string;
  patient: string;
  amount: number;
  date: string;
  status: InvoiceStatus;
}

export interface StaffMember {
  id: number;
  name: string;
  role: StaffRole;
  shift: string;
  phone: string;
  status: StaffStatus;
}

export interface User {
  id: number;
  email: string;
  password?: string;
  name: string;
  role: UserRole;
  phone?: string;
  created_at: string;
}

export interface Consultation {
  id: number;
  appointment_id?: number;
  patient_id?: number;
  doctor_id?: number;
  status: ConsultationStatus;
  video_link?: string;
  prescription?: string;
  notes?: string;
  vitals?: string;
  history?: string;
  diagnosis?: string;
  created_at: string;
  completed_at?: string;
}
