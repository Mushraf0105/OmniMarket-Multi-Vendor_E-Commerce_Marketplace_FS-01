# OmniMarket — Deployment Guide

This guide details how to deploy the Multi-Vendor E-Commerce Platform according to the assessment requirement:
> **"Deploy front end and back end separately."** (Assessment Step 7)  
> Deliverable: **"Working demo (deployed or screen-recorded)"**

---

## Architecture Overview

```
                                      +--------------------------+
                                      |   Browser (Customer,     |
                                      |   Vendor, Admin)         |
                                      +------------+-------------+
                                                   |
                         +-------------------------+-------------------------+
                         |                                                   |
                         v                                                   v
           +-----------------------------+                     +-----------------------------+
           |     FRONTEND (React SPA)    |                     |    BACKEND (Node.js API)    |
           |   Hosted on: Vercel/Netlify |                     |    Hosted on: Render/Railway|
           |   Port: 443 (HTTPS)         |                     |    Port: 5000 / HTTPS       |
           +-----------------------------+                     +--------------+--------------+
                                                                              |
                                           +----------------------------------+----------------------------------+
                                           |                                  |                                  |
                                           v                                  v                                  v
                             +---------------------------+      +---------------------------+      +---------------------------+
                             |    MongoDB Database       |      |    Elasticsearch Engine   |      |    Redis Cache            |
                             |    (MongoDB Atlas)        |      |    (Cloud / In-Memory)    |      |    (Upstash / In-Memory)  |
                             +---------------------------+      +---------------------------+      +---------------------------+
```

---

## Method 1: Free Cloud Deployment (Vercel + Render + MongoDB Atlas)

This is the standard industry approach for deploying React + Node.js separately with zero hosting costs.

### Step 1: Push Project to GitHub

1. Create a new GitHub repository (e.g. `omnimarket` or `fs-01-multivendor`).
2. Run in terminal:
   ```powershell
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git branch -M main
   git push -u origin main
   ```

---

### Step 2: Set Up Free MongoDB Atlas Database

1. Sign up for a free account at [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free shared cluster (**M0 Free Sandbox**).
3. Under **Database Access**, create a database user (e.g., `admin_user` with a strong password).
4. Under **Network Access**, click **Add IP Address** $\rightarrow$ select **Allow Access from Anywhere (`0.0.0.0/0`)**.
5. Click **Connect** $\rightarrow$ **Drivers (Node.js)** $\rightarrow$ copy your connection string:
   ```
   mongodb+srv://admin_user:<password>@cluster0.xxx.mongodb.net/omnimarket?retryWrites=true&w=majority
   ```

---

### Step 3: Deploy Backend on Render (Render.com)

1. Sign up / Log in to [Render.com](https://render.com).
2. Click **New +** $\rightarrow$ **Web Service**.
3. Select your GitHub repository.
4. Configure the service:
   * **Name:** `omnimarket-backend`
   * **Root Directory:** `backend`
   * **Environment:** `Node`
   * **Build Command:** `npm install`
   * **Start Command:** `node server.js`
   * **Instance Type:** `Free`
5. Click **Advanced** $\rightarrow$ **Add Environment Variable**:
   | Key | Value | Notes |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Production mode |
   | `PORT` | `5000` | Port |
   | `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection string |
   | `JWT_SECRET` | `super_secret_jwt_token_for_assessment_fs01_2026` | Token secret |
   | `DEFAULT_COMMISSION_PERCENTAGE` | `10` | 10% platform commission |
6. Click **Deploy Web Service**.
7. Once deployed, copy your backend URL:
   * Example: `https://omnimarket-backend.onrender.com`
   * Test health check: `https://omnimarket-backend.onrender.com/api/health`

*(Note: On first startup, the backend automatically seeds demo users, categories, products, and coupons into the database!)*

---

### Step 4: Deploy Frontend on Vercel (Vercel.com)

1. Sign up / Log in to [Vercel.com](https://vercel.com).
2. Click **Add New...** $\rightarrow$ **Project**.
3. Import your GitHub repository.
4. Configure Project:
   * **Framework Preset:** `Vite`
   * **Root Directory:** Click **Edit** $\rightarrow$ Select `frontend`
   * **Build Command:** `npm run build`
   * **Output Directory:** `dist`
5. Expand **Environment Variables**:
   | Key | Value |
   | :--- | :--- |
   | `VITE_API_URL` | `https://omnimarket-backend.onrender.com/api` (Replace with your actual Render backend URL) |
6. Click **Deploy**.
7. Vercel will provide your production URL (e.g. `https://omnimarket.vercel.app`).
   * The included [`frontend/vercel.json`](file:///e:/FS-01/frontend/vercel.json) handles SPA route rewrites for clean client-side navigation.

---

## Method 2: Containerized Deployment (Docker Compose)

If deploying to a single Virtual Machine (AWS EC2, DigitalOcean Droplet, Linode):

1. Clone repository onto the server.
2. Build and start all services (Frontend, Backend, MongoDB, Redis, Elasticsearch):
   ```bash
   docker compose up -d --build
   ```
3. Services running:
   * Frontend: `http://<server-ip>:80`
   * Backend API: `http://<server-ip>:5000`
   * MongoDB: Port `27017`
   * Redis: Port `6379`
   * Elasticsearch: Port `9200`

---

## Method 3: Screen-Recorded Demo (Assessment Compliant)

The assessment guidelines specifically provide an alternative:
> **"Working demo (deployed or screen-recorded)"**

If you choose to screen-record a demo instead of or in addition to cloud deployment:

### Recommended Screen-Recording Checklist (5–7 Minutes):
1. **Start the Platform:**
   - Run backend: `cd backend && npm start`
   - Run frontend: `cd frontend && npm run dev`
2. **Customer Journey:**
   - Show homepage product grid with category pills and price in ₹.
   - Perform Elasticsearch multi-match search with sorting and price filters.
   - Add items to cart (demonstrating React Toast notifications).
   - Apply coupon `SAVE20` (showing discount calculation).
   - Checkout with simulated split payment.
   - Download the official PDF Tax Invoice from the order confirmation page.
3. **Vendor Portal:**
   - Login with demo vendor (`techvendor@omnimarket.io` / `Password@123`).
   - Show vendor dashboard showing order items, payout totals (90%), and fulfillment status tracker (`placed` $\rightarrow$ `packed` $\rightarrow$ `shipped` $\rightarrow$ `delivered`).
   - Add or edit a product.
4. **Admin Console:**
   - Login with admin (`admin@omnimarket.io` / `Password@123`).
   - Show GMV, platform commission (10%), vendor payouts (90%), and microservice health telemetry.
   - Show automated tests passing (`npm test` in backend, 3/3 green).
