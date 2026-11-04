# OmniMarket — Multi-Vendor E-Commerce Marketplace

[![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20MongoDB%20%7C%20Elasticsearch%20%7C%20Redis%20%7C%20AWS%20S3-blue.svg)](#required-tech-stack)
[![Tailwind CSS](https://img.shields.io/badge/UI-Tailwind%20CSS-38bdf8.svg)](https://tailwindcss.com)
[![License: ISC](https://img.shields.io/badge/License-ISC-green.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/Tests-100%25%20Passing-brightgreen.svg)](#automated-testing)

An Amazon-style multi-vendor e-commerce marketplace where independent merchants onboard and sell, customers buy in a single unified checkout, and the platform automatically splits payments and earns a 10% commission.

---

## 📋 Assessment Alignment & Requirements Met

| Requirement | Implementation in OmniMarket | Location |
|---|---|---|
| **1. Roles & Schema** | Customer, Vendor, and Admin roles with full RBAC and ERD schema | `backend/src/models/`, `backend/src/middleware/role.js` |
| **2. Authentication** | JWT-based auth with bcrypt password hashing and token persistence | `backend/src/controllers/authController.js` |
| **3. Vendor Onboarding & S3** | Store profile setup, Product CRUD, and AWS S3 image upload with local fallback | `backend/src/controllers/vendorController.js`, `backend/src/config/s3.js` |
| **4. Elasticsearch Search** | Multi-match fuzzy search, category/price/rating filtering & sorting with Mongo fallback | `backend/src/services/searchService.js`, `backend/src/config/elasticsearch.js` |
| **5. Redis Cart & Lifecycle** | High-speed Redis cart caching, 4-stage order lifecycle (`placed` → `packed` → `shipped` → `delivered`) | `backend/src/services/cartService.js`, `backend/src/controllers/orderController.js` |
| **6. Split Payments** | Razorpay Route & Stripe Connect test mode split payments (90% vendor / 10% platform fee) | `backend/src/config/payments.js`, `backend/src/controllers/paymentController.js` |
| **7. Reviews, Coupons, Invoices** | Verified customer reviews, promo discount coupons, dynamic PDF tax invoices, and Admin analytics | `backend/src/services/invoiceService.js`, `backend/src/controllers/analyticsController.js` |
| **Tailwind CSS & Separation** | React frontend styled with Tailwind CSS, distinct `backend/` and `frontend/` folders | `frontend/`, `backend/` |

---

## 🛠️ Required Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide React, Axios, React Router Dom
- **Backend:** Node.js (v22+), Express.js (ES Modules), JWT, Multer
- **Database:** MongoDB 8.x (Mongoose ODM) with automated in-memory MongoDB fallback
- **Search Engine:** Elasticsearch 8.x with custom Edge N-Gram tokenizers & MongoDB text search fallback
- **Cart & Session Cache:** Redis (ioredis) with in-memory key-value fallback
- **Payment Processing:** Razorpay Route & Stripe Connect (Automated Split Transfer calculation)
- **Object Storage:** AWS S3 (`@aws-sdk/client-s3`) with multipart disk fallback
- **Invoicing:** PDFKit dynamic tax invoice generation

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v22.19.0)
- **npm** v9+
- *(Optional)* Docker if running containerized MongoDB, Redis, and Elasticsearch via `docker-compose.yml`. (If not running, the platform has built-in auto-fallbacks so it starts and runs immediately out of the box!)

### 2. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/your-username/multivendor-ecommerce.git
cd multivendor-ecommerce
```

### 3. Start the Backend API

```bash
cd backend
npm install
npm run seed     # Seeds demo categories, products, coupons, and vendors
npm start        # Starts Express server on http://localhost:5000
```

> **Note on Portability:** If MongoDB, Redis, or Elasticsearch are not running locally, the server automatically starts high-fidelity in-memory instances and logging fallbacks so you can test all features immediately without any manual system configuration!

### 4. Start the Frontend Client

In a separate terminal:

```bash
cd frontend
npm install
npm run dev      # Starts Vite dev server on http://localhost:5173
```

Visit **`http://localhost:5173`** in your browser.

---

## 👥 Demo Accounts & Credentials

The platform comes pre-seeded with rich demo accounts across all three marketplace personas (Password for all: `Password@123`):

| Persona | Email | Password | Access & Capabilities |
|---|---|---|---|
| **Platform Admin** | `admin@omnimarket.io` | `Password@123` | Master GMV metrics, commission tracking, vendor leaderboard, system telemetry, database seed |
| **Apex Electronics (Vendor)** | `techvendor@omnimarket.io` | `Password@123` | Merchant portal, 90% net earnings breakdown, product CRUD, S3 upload, order fulfillment |
| **Urban Chic (Vendor)** | `fashionvendor@omnimarket.io` | `Password@123` | Fashion storefront, inventory manager, order package shipping |
| **Customer (Shopper)** | `customer@omnimarket.io` | `Password@123` | Browse catalog, Redis cart, multi-vendor split checkout, track orders, PDF invoices |

> **Pro Tip:** The Login screen (`/login`) includes **1-Click Quick Demo Login** buttons for Customer, Vendor, and Admin for immediate assessment review!

---

## 💰 Multi-Vendor Split Payment Mathematics

When a customer checks out an order containing items from multiple vendors:
1. Each item's gross price (`price * quantity`) is credited to its respective seller.
2. Any promotional coupon (e.g. `WELCOME10` or `MEGA50`) is **proportionately pro-rated** across vendors based on their gross cart contribution.
3. The platform deducts the standard **10% platform commission**.
4. The remaining **90% net earnings** are scheduled for automated settlement to the vendor's bank account via Razorpay Route or Stripe Connect transfer.

### Example:
- **Item 1:** Headphones (₹200) from *Apex Electronics*
- **Item 2:** Wool Sweater (₹100) from *Urban Chic Apparel*
- **Order Subtotal:** ₹300
- **Coupon Discount (`WELCOME10`):** -₹30 (₹20 from Apex, ₹10 from Urban)
- **Net Gross:** Apex = ₹180, Urban = ₹90
- **Platform Commission (10%):** Apex = ₹18, Urban = ₹9 ➔ **₹27 total platform revenue**
- **Vendor Payouts (90%):** Apex = **₹162**, Urban = **₹81**

---

## 📦 Order Lifecycle State Machine

Each order transitions through four distinct fulfillment stages:
1. **`placed`**: Customer has authorized payment; split payouts and commission ledger records created.
2. **`packed`**: Vendor boxes items and prepares them for courier pickup.
3. **`shipped`**: Carrier tracking number assigned (e.g. FedEx / USPS).
4. **`delivered`**: Final delivery confirmed to customer address.

---

## 🧪 Automated Testing

Run the automated test suite verifying split payments, coupon pro-rating, and calculations:

```bash
cd backend
npm test
```

Expected output:
```
✔ Marketplace Split Payments: 10% Platform Commission and 90% Vendor Payout
✔ Marketplace Multi-Vendor Split: Independent Vendors in Single Cart
✔ Marketplace Split with Promotional Coupon Discount Pro-rated Across Vendors
3 pass, 0 fail (100% Passing)
```

See [`TEST_REPORT.md`](./TEST_REPORT.md) for full benchmarks and coverage matrix.

---

## 📚 Documentation & Deliverables

- 📐 [**System Architecture & Diagrams**](./ARCHITECTURE.md) — Mermaid architecture diagrams, split payment sequence flows, order state machine, and ERD schema.
- 📡 [**REST API Documentation**](./API_DOCUMENTATION.md) — Complete endpoint reference with request/response schemas.
- 📊 [**Test Report & Benchmarks**](./TEST_REPORT.md) — Latency numbers for Redis, Elasticsearch throughput, and test matrix.
- 🎤 [**10-Minute Presentation Slide Deck**](./PRESENTATION.md) — Markdown slide deck covering Problem, Design, Challenges, Results, and Next Steps.
- 💡 [**Individual Intern Reflections**](./REFLECTIONS.md) — Technical ownership, engineering trade-offs, and lessons learned.
- 🚀 [**Deployment Guide**](./DEPLOYMENT.md) — Step-by-step instructions for separate frontend (Vercel) and backend (Render) deployment, Docker, and demo recording.
- 🐳 [**Docker Compose Configuration**](./docker-compose.yml) — Containerized deployment for MongoDB, Redis, and Elasticsearch.

---

## 📄 License
ISC License © 2026 OmniMarket Team. Full-Stack Assessment FS-01.

