# Dr. Sudharsan's Children's Clinic — Operations Console

A clinic management application with two parts:

- **`backend/`** — Node.js + Express + TypeScript API, backed by SQLite (via `better-sqlite3`). No external database server needed; data lives in `backend/clinic.db`, created automatically on first run.
- **`frontend/`** — React (Vite) single-page app, split into components and pages, calling the backend over `/api`.

## Sidebar structure

- **Dashboard**
- **Clinical Operations** — Appointments, Patient Register, OPD Queue
- **Resources & Access** — Stock Inventory, Central Billing, Staff Access (Doctors / Pharmacists / Receptionist / Housekeeping)

## Running it locally

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

This starts the API on **http://localhost:4000**. On first run it creates `clinic.db` and seeds it with sample data (appointments, patients, OPD queue, stock, invoices, staff).

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

This starts the app on **http://localhost:5173**. Vite is configured to proxy any `/api/*` request to the backend on port 4000, so no extra config is needed.

Open http://localhost:5173 in your browser.

## API overview

| Resource      | Endpoints |
|---------------|-----------|
| Appointments  | `GET/POST /api/appointments`, `PATCH /api/appointments/:id`, `DELETE /api/appointments/:id` |
| Patients      | `GET/POST /api/patients`, `DELETE /api/patients/:id` |
| OPD Queue     | `GET/POST /api/queue`, `PATCH /api/queue/:id/advance`, `DELETE /api/queue/:id` |
| Stock         | `GET/POST /api/stock`, `PATCH /api/stock/:id`, `DELETE /api/stock/:id` |
| Billing       | `GET/POST /api/invoices`, `PATCH /api/invoices/:id/toggle-paid` |
| Staff         | `GET/POST /api/staff` (optional `?role=doctors\|pharmacists\|receptionist\|housekeeping`), `DELETE /api/staff/:id` |

## Building for production

```bash
# backend
cd backend && npm run build && npm start

# frontend
cd frontend && npm run build   # outputs static files to frontend/dist
```

Serve `frontend/dist` with any static host (or behind the same reverse proxy as the API), pointing `/api` at the backend.

## Notes

- Design tokens (colors, type) live in `frontend/src/styles.css` — deep teal sidebar, warm amber accent, Fraunces for display type, Plus Jakarta Sans for UI.
- The OPD Queue's "growth path" stepper (`frontend/src/components/GrowthPath.jsx`) is the signature visual element — tracking each visit through Waiting → With Doctor → Done.
- Adding a new sidebar section later: add an entry to `NAV_GROUPS` in `frontend/src/components/Sidebar.jsx`, a new page in `frontend/src/pages/`, and a matching route + table in the backend.
