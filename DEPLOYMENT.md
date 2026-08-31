# Deployment Guide - Vercel

This guide walks you through deploying Dr. Sudharsan's Clinic App to Vercel in just a few steps.

## Prerequisites

- GitHub account with the repository pushed
- Vercel account (create at [vercel.com](https://vercel.com))
- Repository: https://github.com/sudharsan-chakresh/drsudharsan-clinic

## Step 1: Verify GitHub Setup

Ensure your code is pushed to GitHub:

```bash
cd /path/to/clinic-app
git status
git log --oneline -5
```

You should see commits like:
- `feat: Add login authentication and doctor consultation features...`
- `docs: Update README and add Vercel configuration`

## Step 2: Deploy Frontend Only (Recommended for MVP)

### Option A: Deploy Frontend to Vercel (Simple)

The fastest way to get started is to deploy just the frontend:

1. **Go to [vercel.com](https://vercel.com)**
2. Click **"Add New"** → **"Project"**
3. Click **"Continue with GitHub"**
4. Select repository: `sudharsan-chakresh/drsudharsan-clinic`
5. Configure project:
   - Framework: **Vite**
   - Root Directory: **./frontend**
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Add Environment Variables (if needed):
   - `VITE_API_URL=http://localhost:4000/api` (for local testing)
   - Or use your backend URL if you have one deployed
7. Click **Deploy**

✅ Frontend will be live at: `https://drsudharsan-clinic.vercel.app`

**Note:** Backend must be running locally or deployed separately

### Option B: Deploy Backend to Railway, Render, or Heroku

To make both frontend and backend fully deployed:

#### Railway (Recommended)
1. Go to [railway.app](https://railway.app)
2. Click **"New Project"**
3. Connect GitHub account
4. Select `sudharsan-chakresh/drsudharsan-clinic` repo
5. Railway auto-detects services and deploys both
6. Copy backend URL and add to frontend environment variables

#### Render
1. Go to [render.com](https://render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub account
4. Select repo, set Root Directory to `backend/`
5. Deploy

## Step 3: Environment Setup

After deployment, update your frontend environment:

### For Vercel Frontend:

1. Go to your Vercel project dashboard
2. Settings → **Environment Variables**
3. Add:
   ```
   VITE_API_URL=https://your-backend-url/api
   ```
4. Redeploy the frontend

### Update Frontend Code (if needed):

Edit `frontend/src/api.js`:
```javascript
const BASE = import.meta.env.VITE_API_URL || "/api";
```

## Deployment Checklist

- [ ] Code pushed to GitHub (main branch)
- [ ] README.md is up to date
- [ ] All environment variables configured
- [ ] Frontend deployed to Vercel
- [ ] Backend deployed (Railway, Render, or Heroku)
- [ ] API URL updated in frontend
- [ ] Login credentials working in production
- [ ] Database seeded with initial data

## Troubleshooting

### Issue: "Module not found" during build
**Solution:** Check that all imports use correct relative paths
```bash
# Frontend build
cd frontend && npm run build

# Backend build
cd backend && npm run build
```

### Issue: API connection errors
**Solution:** Verify CORS is enabled in backend:
```typescript
// backend/src/index.ts
app.use(cors());
```

### Issue: Static files not loading
**Solution:** Ensure `vercel.json` routes are configured correctly
```json
{
  "routes": [
    { "src": "/api/(.*)", "dest": "backend" },
    { "src": "/(.*)", "dest": "frontend" }
  ]
}
```

### Issue: Database not initializing
**Solution:** Backend needs writable directory for SQLite
- Railway/Render provide writable `/tmp` directory
- Heroku requires volume mounts for persistent storage

## Using Production Credentials

In production, update your login credentials:

1. Backend Admin
   ```bash
   sqlite3 clinic.db
   UPDATE users SET password='your-secure-password' WHERE role='Admin';
   ```

2. Update frontend to use production credentials

## Monitoring

### Vercel Dashboard
- Real-time deployment logs
- Performance metrics
- Error tracking

### Backend Logs
- Railway: Dashboard → Logs
- Render: Service Dashboard → Logs  
- Heroku: `heroku logs --tail`

## Next Steps

1. ✅ Deploy frontend to Vercel
2. ✅ Deploy backend to Railway/Render
3. ✅ Configure environment variables
4. ✅ Test login and features
5. ✅ Share deployed URL with team
6. ✅ Set up custom domain (optional)

## Custom Domain (Optional)

### On Vercel:
1. Project Settings → Domains
2. Add your domain
3. Update DNS records at your registrar

### Example:
- Frontend: `clinic.example.com`
- Backend: `api.example.com`

## Support

- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- Render Docs: https://render.com/docs

---

🚀 **Your clinic app is now live!**

Default Login Credentials (Update in production):
- Admin: admin@clinic.com / admin123
- Doctor: doctor1@clinic.com / doctor123
- Patient: patient@clinic.com / patient123
