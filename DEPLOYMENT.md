# Deployment Guide

## Option 1: GitHub Pages (Frontend) + Separate Backend

### Frontend Deployment (GitHub Pages)

1. **Enable GitHub Pages in Repository Settings:**
   - Go to: `Settings` → `Pages`
   - Source: `GitHub Actions`

2. **Set Backend URL Secret:**
   - Go to: `Settings` → `Secrets and variables` → `Actions`
   - Add new repository secret:
     - Name: `VITE_API_URL`
     - Value: `https://your-backend-url.com/api` (your backend URL)

3. **Push to main/master branch:**
   ```bash
   git push origin main
   ```

   GitHub Actions will automatically build and deploy the frontend.

4. **Access your site:**
   - URL: `https://your-username.github.io/FakeNews/`

### Backend Deployment Options

#### A) Render.com (Empfohlen - Kostenlos)

1. Create account at [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name:** fakenews-analyzer-api
   - **Root Directory:** `backend`
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment Variables:**
     - `ANTHROPIC_API_KEY`: your_claude_api_key
     - `PORT`: 3001
     - `NODE_ENV`: production
5. Click "Create Web Service"
6. Copy the deployed URL (e.g., `https://fakenews-analyzer-api.onrender.com`)
7. Add `/api` to create your backend URL: `https://fakenews-analyzer-api.onrender.com/api`
8. Update GitHub Secret `VITE_API_URL` with this URL

#### B) Railway.app (Einfach)

1. Create account at [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Add service → Select `backend` folder
5. Add Environment Variables:
   - `ANTHROPIC_API_KEY`
   - `PORT`: 3001
6. Generate domain and use it in frontend

#### C) Heroku

1. Install Heroku CLI
2. Create Heroku app:
   ```bash
   cd backend
   heroku create fakenews-analyzer-api
   ```
3. Set environment variables:
   ```bash
   heroku config:set ANTHROPIC_API_KEY=your_key
   heroku config:set NODE_ENV=production
   ```
4. Create `Procfile` in backend folder:
   ```
   web: node src/server.js
   ```
5. Deploy:
   ```bash
   git subtree push --prefix backend heroku main
   ```

---

## Option 2: Vercel (Empfohlen - Alles in einem)

Vercel kann Frontend + Backend (Serverless Functions) hosten.

### Setup

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Create Vercel configuration:**
   Create `vercel.json` in project root (see generated file)

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Set Environment Variables in Vercel Dashboard:**
   - `ANTHROPIC_API_KEY`
   - `NODE_ENV=production`

5. **Deploy to Production:**
   ```bash
   vercel --prod
   ```

---

## Option 3: Netlify (Alternative zu Vercel)

1. Create account at [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect GitHub repository
4. Configure:
   - **Build command:** `cd frontend && npm install && npm run build`
   - **Publish directory:** `frontend/dist`
   - **Functions directory:** `netlify/functions` (for backend)
5. Set Environment Variables in Netlify Dashboard
6. Deploy

---

## Testing Production Build Locally

### Frontend only:
```bash
cd frontend
npm run build
npm run preview
```

### Full stack with production build:
```bash
# Terminal 1 - Backend
cd backend
NODE_ENV=production npm start

# Terminal 2 - Frontend (production preview)
cd frontend
npm run build
npm run preview
```

---

## CORS Configuration

If you deploy backend separately, make sure to update CORS settings in `backend/src/server.js`:

```javascript
app.use(cors({
  origin: ['https://your-username.github.io', 'http://localhost:3000'],
  credentials: true
}));
```

---

## Troubleshooting

### Issue: 404 on page refresh (GitHub Pages)
**Solution:** Add `404.html` that redirects to `index.html` (already configured in workflow)

### Issue: Backend CORS errors
**Solution:** Update CORS configuration in backend to include your GitHub Pages URL

### Issue: API calls fail
**Solution:** Check that `VITE_API_URL` environment variable is correctly set

### Issue: Build fails
**Solution:** Check Node version (use 18+) and ensure all dependencies are installed

---

## Recommended Setup

**For Production (Best):**
- ✅ **Vercel** - Everything in one place, serverless functions, easy setup
- ✅ **Netlify** - Similar to Vercel, great DX

**For Free Hosting:**
- ✅ **Frontend:** GitHub Pages (free, reliable)
- ✅ **Backend:** Render.com (free tier available, good for Node.js)

**For Learning/Testing:**
- ✅ Use local development (`npm run dev`)
