import Database from "better-sqlite3";
import path from "path";
import { hashPassword } from "./auth";

const dbPath = process.env.VERCEL ? "/tmp/clinic.db" : path.join(__dirname, "..", "clinic.db");
export const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    time TEXT NOT NULL,
    patient TEXT NOT NULL,
    guardian TEXT,
    doctor TEXT,
    type TEXT,
    status TEXT NOT NULL DEFAULT 'Scheduled'
  );

  CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    guardian TEXT,
    age TEXT,
    phone TEXT,
    blood TEXT,
    last_visit TEXT DEFAULT '—'
  );

  CREATE TABLE IF NOT EXISTS queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token TEXT NOT NULL,
    patient TEXT NOT NULL,
    doctor TEXT,
    stage TEXT NOT NULL DEFAULT 'waiting'
  );

  CREATE TABLE IF NOT EXISTS stock (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT,
    qty INTEGER NOT NULL DEFAULT 0,
    reorder INTEGER NOT NULL DEFAULT 0,
    unit TEXT DEFAULT 'units'
  );

  CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    patient TEXT NOT NULL,
    amount INTEGER NOT NULL,
    date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending'
  );

  CREATE TABLE IF NOT EXISTS staff (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    shift TEXT,
    phone TEXT,
    status TEXT NOT NULL DEFAULT 'On duty'
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    phone TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS consultations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    appointment_id INTEGER,
    patient_id INTEGER,
    doctor_id INTEGER,
    status TEXT NOT NULL DEFAULT 'scheduled',
    video_link TEXT,
    prescription TEXT,
    notes TEXT,
    vitals TEXT,
    history TEXT,
    diagnosis TEXT,
    temperature TEXT,
    heart_rate TEXT,
    respiratory_rate TEXT,
    weight TEXT,
    height TEXT,
    created_at TEXT NOT NULL,
    completed_at TEXT
  );
`);

const addColumn = (col: string, type: string) => {
  const exists = db.prepare("SELECT COUNT(*) AS c FROM pragma_table_info('consultations') WHERE name = ?").get(col) as any;
  if (exists.c === 0) {
    db.exec(`ALTER TABLE consultations ADD COLUMN ${col} ${type};`);
  }
};
addColumn("vitals", "TEXT");
addColumn("history", "TEXT");
addColumn("diagnosis", "TEXT");
addColumn("temperature", "TEXT");
addColumn("heart_rate", "TEXT");
addColumn("respiratory_rate", "TEXT");
addColumn("weight", "TEXT");
addColumn("height", "TEXT");

function seedIfEmpty() {
  const counts = {
    appointments: (db.prepare("SELECT COUNT(*) AS c FROM appointments").get() as any).c,
    patients: (db.prepare("SELECT COUNT(*) AS c FROM patients").get() as any).c,
    queue: (db.prepare("SELECT COUNT(*) AS c FROM queue").get() as any).c,
    stock: (db.prepare("SELECT COUNT(*) AS c FROM stock").get() as any).c,
    invoices: (db.prepare("SELECT COUNT(*) AS c FROM invoices").get() as any).c,
    staff: (db.prepare("SELECT COUNT(*) AS c FROM staff").get() as any).c,
    users: (db.prepare("SELECT COUNT(*) AS c FROM users").get() as any).c,
    consultations: (db.prepare("SELECT COUNT(*) AS c FROM consultations").get() as any).c,
  };

  if (counts.appointments === 0) {
    const insert = db.prepare(
      "INSERT INTO appointments (time, patient, guardian, doctor, type, status) VALUES (?, ?, ?, ?, ?, ?)"
    );
    insert.run("09:00 AM", "Aarav Krishnan", "Priya Krishnan", "Dr. Sudharsan", "Vaccination", "Scheduled");
    insert.run("09:30 AM", "Meera Iyer", "Ramesh Iyer", "Dr. Anjali Rao", "Follow-up", "Scheduled");
    insert.run("10:15 AM", "Kabir Shah", "Nisha Shah", "Dr. Sudharsan", "Fever check", "Completed");
    insert.run("11:00 AM", "Ira Menon", "Vishnu Menon", "Dr. Anjali Rao", "Growth review", "Scheduled");
    insert.run("11:45 AM", "Advik Pillai", "Divya Pillai", "Dr. Sudharsan", "New consult", "Cancelled");
  }

  if (counts.patients === 0) {
    const insert = db.prepare(
      "INSERT INTO patients (name, guardian, age, phone, blood, last_visit) VALUES (?, ?, ?, ?, ?, ?)"
    );
    insert.run("Aarav Krishnan", "Priya Krishnan", "3y 2m", "98410 22110", "O+", "12 Aug 2026");
    insert.run("Meera Iyer", "Ramesh Iyer", "6y 8m", "90032 88011", "B+", "20 Aug 2026");
    insert.run("Kabir Shah", "Nisha Shah", "1y 4m", "99401 55622", "A+", "27 Aug 2026");
    insert.run("Ira Menon", "Vishnu Menon", "8y 1m", "97891 33420", "AB+", "18 Aug 2026");
  }

  if (counts.queue === 0) {
    const insert = db.prepare("INSERT INTO queue (token, patient, doctor, stage) VALUES (?, ?, ?, ?)");
    insert.run("T-14", "Kabir Shah", "Dr. Sudharsan", "consult");
    insert.run("T-15", "Ira Menon", "Dr. Anjali Rao", "waiting");
    insert.run("T-16", "Sanvi Reddy", "Dr. Sudharsan", "waiting");
    insert.run("T-13", "Aarav Krishnan", "Dr. Sudharsan", "done");
  }

  if (counts.stock === 0) {
    const insert = db.prepare(
      "INSERT INTO stock (name, category, qty, reorder, unit) VALUES (?, ?, ?, ?, ?)"
    );
    insert.run("Paracetamol Syrup 60ml", "Syrup", 42, 20, "bottles");
    insert.run("ORS Sachets", "Rehydration", 15, 25, "sachets");
    insert.run("Amoxicillin Susp. 125mg", "Antibiotic", 8, 15, "bottles");
    insert.run("BCG Vaccine", "Vaccine", 30, 10, "vials");
    insert.run("Cotton Rolls", "Consumable", 60, 20, "packs");
  }

  if (counts.invoices === 0) {
    const insert = db.prepare(
      "INSERT INTO invoices (id, patient, amount, date, status) VALUES (?, ?, ?, ?, ?)"
    );
    insert.run("INV-2201", "Kabir Shah", 850, "27 Aug 2026", "Paid");
    insert.run("INV-2202", "Meera Iyer", 1200, "27 Aug 2026", "Pending");
    insert.run("INV-2203", "Ira Menon", 650, "26 Aug 2026", "Paid");
    insert.run("INV-2204", "Advik Pillai", 1500, "26 Aug 2026", "Pending");
  }

  if (counts.staff === 0) {
    const insert = db.prepare(
      "INSERT INTO staff (name, role, shift, phone, status) VALUES (?, ?, ?, ?, ?)"
    );
    insert.run("Dr. Sudharsan R.", "doctors", "9:00 AM – 5:00 PM", "94440 12233", "On duty");
    insert.run("Dr. Anjali Rao", "doctors", "11:00 AM – 7:00 PM", "94440 55214", "On duty");
    insert.run("Karthik Suresh", "pharmacists", "9:00 AM – 5:00 PM", "98765 11220", "On duty");
    insert.run("Lavanya Muthu", "receptionist", "8:30 AM – 4:30 PM", "90031 44556", "On duty");
    insert.run("Preethi Ganesan", "receptionist", "12:00 PM – 8:00 PM", "90031 99887", "Off today");
    insert.run("Murugan S.", "housekeeping", "7:00 AM – 3:00 PM", "9042211334", "On duty");
  }

  if (counts.users === 0) {
    const insertUser = db.prepare(
      "INSERT INTO users (email, password, name, role, phone, created_at) VALUES (?, ?, ?, ?, ?, ?)"
    );
    const now = new Date().toISOString();
    insertUser.run("admin@clinic.com", hashPassword("admin123"), "Admin", "Admin", "94440 00000", now);
    insertUser.run("doctor1@clinic.com", hashPassword("doctor123"), "Dr. Sudharsan", "Doctor", "94440 12233", now);
    insertUser.run("doctor2@clinic.com", hashPassword("doctor123"), "Dr. Anjali Rao", "Doctor", "94440 55214", now);
    insertUser.run("pharmacist@clinic.com", hashPassword("pharm123"), "Karthik Suresh", "Pharmacist", "98765 11220", now);
    insertUser.run("receptionist@clinic.com", hashPassword("recep123"), "Lavanya Muthu", "Receptionist", "90031 44556", now);
    insertUser.run("patient@clinic.com", hashPassword("patient123"), "Priya Krishnan", "Patient", "98410 22110", now);
  }

  if (counts.consultations === 0) {
    const insert = db.prepare(
      "INSERT INTO consultations (appointment_id, patient_id, doctor_id, status, video_link, prescription, notes, vitals, history, diagnosis, temperature, heart_rate, respiratory_rate, weight, height, created_at, completed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    insert.run(1, 1, 2, "completed", "https://meet.google.com/abc-def-ghi", "Paracetamol 5ml BD", "Follow up in 3 days", "Temp: 99.2°F, HR: 110bpm, RR: 28/min", "No known allergies", "Viral fever", "99.2°F", "110bpm", "28/min", null, null, "2026-08-25T09:15:00.000Z", "2026-08-25T09:45:00.000Z");
    insert.run(2, 2, 3, "scheduled", "https://meet.google.com/xyz-uvw-rst", null, "Growth review consultation", "Temp: 98.6°F, Wt: 14kg, Ht: 95cm", "Asthma history", "Growth milestone review", "98.6°F", null, null, "14kg", "95cm", "2026-08-27T11:00:00.000Z", null);
    insert.run(3, 3, 2, "in-progress", null, "Amoxicillin 5ml TDS", "Fever check follow-up", "Temp: 100.4°F, HR: 120bpm", "Previous ear infection", "Acute otitis media", "100.4°F", "120bpm", null, null, null, "2026-08-28T10:30:00.000Z", null);
    insert.run(4, 4, 3, "scheduled", null, null, "OPD review", "Temp: 98.8°F, Wt: 18kg", "No significant history", "Routine checkup", "98.8°F", null, null, "18kg", null, "2026-08-29T11:00:00.000Z", null);
  }
}

seedIfEmpty();
