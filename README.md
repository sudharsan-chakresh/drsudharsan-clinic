# Dr. Sudharsan's Children's Clinic Management System

A full-stack clinic management system built with React, Express, and SQLite. Features include appointment management, patient records, OPD queue management, stock inventory, billing, staff management, and doctor consultations with video call support.

## Features

✨ **Core Features**
- Dashboard with key metrics and real-time updates
- Appointment scheduling and management
- Patient registration and medical history
- OPD Queue management with growth path tracking
- Stock inventory with reorder alerts
- Central billing system with invoice management
- Staff access control and management
- **NEW:** Doctor consultations with video call links and prescriptions

🔐 **Authentication & Authorization**
- Role-based login system (Admin, Doctor, Receptionist, Pharmacist, Patient)
- Session management with localStorage
- Secure password handling

📱 **Responsive Design**
- Mobile-first approach with responsive breakpoints (480px, 768px, 1024px)
- Desktop, tablet, and mobile optimized layouts
- Adaptive typography and spacing using CSS clamp()
- Touch-friendly interface elements

## Tech Stack

**Frontend:**
- React 18 with Vite
- Lucide React icons
- Responsive CSS with modern techniques

**Backend:**
- Node.js with Express
- TypeScript
- SQLite with better-sqlite3
- CORS enabled

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/sudharsan-chakresh/drsudharsan-clinic.git
cd drsudharsan-clinic
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Install frontend dependencies**
```bash
cd ../frontend
npm install
```

### Running Locally

1. **Start the backend** (from `backend/` directory)
```bash
npm run dev
```
Backend runs on `http://localhost:4000`

2. **Start the frontend** (from `frontend/` directory)
```bash
npm run dev
```
Frontend runs on `http://localhost:5173`

### Default Login Credentials

- **Admin**: admin@clinic.com / admin123
- **Doctor**: doctor1@clinic.com / doctor123
- **Receptionist**: receptionist@clinic.com / recep123
- **Pharmacist**: pharmacist@clinic.com / pharm123
- **Patient**: patient@clinic.com / patient123

## Project Structure

```
clinic-app/
├── backend/
│   ├── src/
│   │   ├── db.ts           # Database schema & seeding
│   │   ├── index.ts        # Express app
│   │   ├── types.ts        # TypeScript types
│   │   └── routes/
│   │       ├── auth.ts     # Login & user management
│   │       ├── consultations.ts  # Doctor consultations
│   │       ├── appointments.ts
│   │       ├── patients.ts
│   │       ├── queue.ts
│   │       ├── stock.ts
│   │       ├── billing.ts
│   │       └── staff.ts
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx         # Main app with auth flow
│   │   ├── api.js          # API client
│   │   ├── styles.css      # Global responsive styles
│   │   ├── components/     # Reusable UI components
│   │   └── pages/
│   │       ├── Login.jsx
│   │       ├── Dashboard.jsx
│   │       ├── Consultation.jsx  # NEW: Video & prescriptions
│   │       ├── Appointments.jsx
│   │       ├── Patients.jsx
│   │       ├── Queue.jsx
│   │       ├── Stock.jsx
│   │       ├── Billing.jsx
│   │       └── Staff.jsx
│   └── package.json
├── vercel.json
└── README.md
```

## API Endpoints

### Authentication (NEW)
- `POST /api/auth/login` - Login
- `GET /api/auth/users` - List users
- `POST /api/auth/users` - Create user
- `POST /api/auth/logout` - Logout

### Consultations (NEW)
- `GET /api/consultations` - All consultations
- `GET /api/consultations/doctor/:id` - Doctor's consultations
- `GET /api/consultations/patient/:id` - Patient's consultations
- `POST /api/consultations` - Create consultation
- `PUT /api/consultations/:id` - Update consultation
- `DELETE /api/consultations/:id` - Delete consultation

### Other Resources
- `/api/appointments` - Appointment management
- `/api/patients` - Patient records
- `/api/queue` - OPD queue
- `/api/stock` - Inventory
- `/api/invoices` - Billing
- `/api/staff` - Staff management

## Deployment on Vercel

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Deploy clinic app to Vercel"
git push origin main
```

### Step 2: Deploy to Vercel
1. Visit [vercel.com](https://vercel.com)
2. Click **"Add New..."** → **"Project"**
3. Import from GitHub: select `sudharsan-chakresh/drsudharsan-clinic`
4. Click **Deploy**

Your app will be live at `https://<your-project-name>.vercel.app` 🚀

## Features in Detail

### 🔐 Login System
- Role-based access control
- 5 user roles: Admin, Doctor, Receptionist, Pharmacist, Patient
- Persistent sessions with localStorage
- User profile in navigation bar

### 👨‍⚕️ Doctor Consultation (NEW)
- Schedule video consultations between doctors and patients
- Integrated video call links (Zoom, Google Meet, etc.)
- Medical prescriptions with notes
- Consultation status tracking (scheduled → in-progress → completed)
- Filter by doctor or patient
- Role-based access (Doctors can manage their consultations)

### 📱 Responsive Design
- Breakpoints: 480px (mobile), 768px (tablet), 1024px+ (desktop)
- Sidebar collapses on mobile
- Flexible grid layouts
- Touch-optimized buttons and inputs
- Adaptive font sizes with CSS clamp()

## Recent Updates

### Version 2.0 - Authentication & Consultation
- ✅ Added comprehensive login system with 5 user roles
- ✅ Implemented Doctor Consultation module
- ✅ Added video call link support in consultations
- ✅ Improved responsive design for mobile devices
- ✅ Added user profile display in topbar
- ✅ Prepared for Vercel deployment

## Troubleshooting

### Backend won't start
```bash
cd backend
npm run dev
# Check if port 4000 is available
```

### Frontend can't connect to backend
- Ensure backend is running on `http://localhost:4000`
- Check CORS headers in `backend/src/index.ts`
- Frontend proxy should point to backend API

### Database issues
- Delete `backend/clinic.db*` files
- Restart backend to re-seed data
- Check database permissions

## Contributing

Contributions are welcome! Please open an issue or PR on GitHub.

## License

MIT License - See LICENSE file for details

---

**Built with ❤️ by Sudharsan Chakresh**  
**For Dr. Sudharsan's Children's Clinic**
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
