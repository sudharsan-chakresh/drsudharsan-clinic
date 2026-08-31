import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: connectionString,
      ssl: connectionString ? { rejectUnauthorized: false } : false,
      max: 1,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 10000,
    });
  }
  return pool;
}

export async function query(text: string, params: any[] = []) {
  const start = Date.now();
  const p = getPool();
  const res = await p.query(text, params);
  const duration = Date.now() - start;
  console.log("Query executed", { text: text.substring(0, 50), duration, rows: res.rowCount });
  return res;
}

export async function initDb() {
  await query(`
    CREATE TABLE IF NOT EXISTS appointments (
      id SERIAL PRIMARY KEY,
      time TEXT NOT NULL,
      patient TEXT NOT NULL,
      guardian TEXT,
      doctor TEXT,
      type TEXT,
      status TEXT NOT NULL DEFAULT 'Scheduled'
    );

    CREATE TABLE IF NOT EXISTS patients (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      guardian TEXT,
      age TEXT,
      phone TEXT,
      blood TEXT,
      last_visit TEXT DEFAULT '—',
      deleted_at TIMESTAMP DEFAULT NULL
    );

    CREATE TABLE IF NOT EXISTS queue (
      id SERIAL PRIMARY KEY,
      token TEXT NOT NULL,
      patient TEXT NOT NULL,
      doctor TEXT,
      stage TEXT NOT NULL DEFAULT 'waiting'
    );

    CREATE TABLE IF NOT EXISTS stock (
      id SERIAL PRIMARY KEY,
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
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      shift TEXT,
      phone TEXT,
      status TEXT NOT NULL DEFAULT 'On duty',
      deleted_at TIMESTAMP DEFAULT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      phone TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS consultations (
      id SERIAL PRIMARY KEY,
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
      food_recommendations TEXT,
      general_instructions TEXT,
      created_at TEXT NOT NULL,
      completed_at TEXT
    );
  `);
}

export async function seedIfEmpty() {
  const counts: Record<string, number> = {};
  for (const table of ["appointments", "patients", "queue", "stock", "invoices", "staff", "users", "consultations"]) {
    const result = await query(`SELECT COUNT(*) AS c FROM ${table}`);
    counts[table] = parseInt(result.rows[0].c);
  }

  if (counts.appointments === 0) {
    const insert = "INSERT INTO appointments (time, patient, guardian, doctor, type, status) VALUES ($1, $2, $3, $4, $5, $6)";
    await query(insert, ["09:00 AM", "Aarav Krishnan", "Priya Krishnan", "Dr. Sudharsan", "Vaccination", "Scheduled"]);
    await query(insert, ["09:30 AM", "Meera Iyer", "Ramesh Iyer", "Dr. Anjali Rao", "Follow-up", "Scheduled"]);
    await query(insert, ["10:15 AM", "Kabir Shah", "Nisha Shah", "Dr. Sudharsan", "Fever check", "Completed"]);
    await query(insert, ["11:00 AM", "Ira Menon", "Vishnu Menon", "Dr. Anjali Rao", "Growth review", "Scheduled"]);
    await query(insert, ["11:45 AM", "Advik Pillai", "Divya Pillai", "Dr. Sudharsan", "New consult", "Cancelled"]);
  }

  if (counts.patients === 0) {
    const insert = "INSERT INTO patients (name, guardian, age, phone, blood, last_visit) VALUES ($1, $2, $3, $4, $5, $6)";
    await query(insert, ["Aarav Krishnan", "Priya Krishnan", "3y 2m", "98410 22110", "O+", "12 Aug 2026"]);
    await query(insert, ["Meera Iyer", "Ramesh Iyer", "6y 8m", "90032 88011", "B+", "20 Aug 2026"]);
    await query(insert, ["Kabir Shah", "Nisha Shah", "1y 4m", "99401 55622", "A+", "27 Aug 2026"]);
    await query(insert, ["Ira Menon", "Vishnu Menon", "8y 1m", "97891 33420", "AB+", "18 Aug 2026"]);
  }

  if (counts.queue === 0) {
    const insert = "INSERT INTO queue (token, patient, doctor, stage) VALUES ($1, $2, $3, $4)";
    await query(insert, ["T-14", "Kabir Shah", "Dr. Sudharsan", "consult"]);
    await query(insert, ["T-15", "Ira Menon", "Dr. Anjali Rao", "waiting"]);
    await query(insert, ["T-16", "Sanvi Reddy", "Dr. Sudharsan", "waiting"]);
    await query(insert, ["T-13", "Aarav Krishnan", "Dr. Sudharsan", "done"]);
  }

  if (counts.stock === 0) {
    const insert = "INSERT INTO stock (name, category, qty, reorder, unit) VALUES ($1, $2, $3, $4, $5)";
    await query(insert, ["Paracetamol Syrup 60ml", "Syrup", 42, 20, "bottles"]);
    await query(insert, ["ORS Sachets", "Rehydration", 15, 25, "sachets"]);
    await query(insert, ["Amoxicillin Susp. 125mg", "Antibiotic", 8, 15, "bottles"]);
    await query(insert, ["BCG Vaccine", "Vaccine", 30, 10, "vials"]);
    await query(insert, ["Cotton Rolls", "Consumable", 60, 20, "packs"]);
  }

  if (counts.invoices === 0) {
    const insert = "INSERT INTO invoices (id, patient, amount, date, status) VALUES ($1, $2, $3, $4, $5)";
    await query(insert, ["INV-2201", "Kabir Shah", 850, "27 Aug 2026", "Paid"]);
    await query(insert, ["INV-2202", "Meera Iyer", 1200, "27 Aug 2026", "Pending"]);
    await query(insert, ["INV-2203", "Ira Menon", 650, "26 Aug 2026", "Paid"]);
    await query(insert, ["INV-2204", "Advik Pillai", 1500, "26 Aug 2026", "Pending"]);
  }

  if (counts.staff === 0) {
    const insert = "INSERT INTO staff (name, role, shift, phone, status) VALUES ($1, $2, $3, $4, $5)";
    await query(insert, ["Dr. Sudharsan R.", "doctors", "9:00 AM – 5:00 PM", "94440 12233", "On duty"]);
    await query(insert, ["Dr. Anjali Rao", "doctors", "11:00 AM – 7:00 PM", "94440 55214", "On duty"]);
    await query(insert, ["Karthik Suresh", "pharmacists", "9:00 AM – 5:00 PM", "98765 11220", "On duty"]);
    await query(insert, ["Lavanya Muthu", "receptionist", "8:30 AM – 4:30 PM", "90031 44556", "On duty"]);
    await query(insert, ["Preethi Ganesan", "receptionist", "12:00 PM – 8:00 PM", "90031 99887", "Off today"]);
    await query(insert, ["Murugan S.", "housekeeping", "7:00 AM – 3:00 PM", "9042211334", "On duty"]);
  }

  if (counts.users === 0) {
    const { hashPassword } = await import("./auth");
    const insertUser = "INSERT INTO users (email, password, name, role, phone, created_at) VALUES ($1, $2, $3, $4, $5, $6)";
    const now = new Date().toISOString();
    await query(insertUser, ["admin@clinic.com", hashPassword("admin123"), "Admin", "Admin", "94440 00000", now]);
    await query(insertUser, ["doctor1@clinic.com", hashPassword("doctor123"), "Dr. Sudharsan", "Doctor", "94440 12233", now]);
    await query(insertUser, ["doctor2@clinic.com", hashPassword("doctor123"), "Dr. Anjali Rao", "Doctor", "94440 55214", now]);
    await query(insertUser, ["pharmacist@clinic.com", hashPassword("pharm123"), "Karthik Suresh", "Pharmacist", "98765 11220", now]);
    await query(insertUser, ["receptionist@clinic.com", hashPassword("recep123"), "Lavanya Muthu", "Receptionist", "90031 44556", now]);
    await query(insertUser, ["patient@clinic.com", hashPassword("patient123"), "Priya Krishnan", "Patient", "98410 22110", now]);
  }

  if (counts.consultations === 0) {
    const insert = "INSERT INTO consultations (appointment_id, patient_id, doctor_id, status, video_link, prescription, notes, history, diagnosis, temperature, heart_rate, respiratory_rate, weight, height, food_recommendations, general_instructions, created_at, completed_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)";
    await query(insert, [1, 1, 2, "completed", "https://meet.google.com/abc-def-ghi", "Paracetamol 5ml BD", "Follow up in 3 days", "No known allergies", "Viral fever", "99.2°F", "110bpm", "28/min", null, null, null, null, "2026-08-25T09:15:00.000Z", "2026-08-25T09:45:00.000Z"]);
    await query(insert, [2, 2, 3, "scheduled", "https://meet.google.com/xyz-uvw-rst", null, "Growth review consultation", "Asthma history", "Growth milestone review", "98.6°F", null, null, "14kg", "95cm", null, null, "2026-08-27T11:00:00.000Z", null]);
    await query(insert, [3, 3, 2, "in-progress", null, "Amoxicillin 5ml TDS", "Fever check follow-up", "Previous ear infection", "Acute otitis media", "100.4°F", "120bpm", null, null, null, null, null, "2026-08-28T10:30:00.000Z", null]);
    await query(insert, [4, 4, 3, "scheduled", null, null, "OPD review", "No significant history", "Routine checkup", "98.8°F", null, null, "18kg", null, null, null, "2026-08-29T11:00:00.000Z", null]);
  }
}
