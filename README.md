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

## 📂 Project Structure

```text
OmniMarket-Multi-Vendor_E-Commerce_Marketplace_FS-01/
├── credentials/                 # File-based user store (Zero-DB immediate auth)
│   ├── Admin.json               # Platform administrator credentials
│   ├── Customer.json            # Registered shoppers & demo accounts
│   └── Vendor.json              # Merchant vendor credentials & store configs
├── backend/                     # Node.js Express REST API server
│   ├── server.js                # Express entrypoint, middleware & dual route mounting
│   ├── Dockerfile               # Production container image configuration
│   ├── package.json             # Backend dependencies and scripts
│   ├── credentials/             # Cloud-mirrored credentials fallback store
│   ├── src/
│   │   ├── config/              # Infrastructure drivers & auto-fallbacks
│   │   │   ├── db.js            # MongoDB & In-Memory MongoDB Server manager
│   │   │   ├── elasticsearch.js # Elasticsearch client with Mongo text fallback
│   │   │   ├── payments.js      # Razorpay Route & Stripe split payment engine
│   │   │   ├── redis.js         # Redis client with In-Memory KV fallback
│   │   │   └── s3.js            # AWS S3 uploader with local disk storage
│   │   ├── controllers/         # HTTP request handlers & business logic
│   │   │   ├── analyticsController.js # Admin platform GMV & health telemetry
│   │   │   ├── authController.js      # JWT authentication, register & login
│   │   │   ├── cartController.js      # Redis cart operations & session handling
│   │   │   ├── couponController.js    # Promotional discount codes & validation
│   │   │   ├── orderController.js     # 4-stage order lifecycle & checkout
│   │   │   ├── paymentController.js   # Split calculations & payment intents
│   │   │   ├── productController.js   # Product catalog CRUD & categories
│   │   │   ├── reviewController.js    # Verified customer review system
│   │   │   └── vendorController.js    # Vendor onboarding & merchant dashboard
│   │   ├── middleware/          # Security, auth, and error handling
│   │   │   ├── auth.js          # Bearer JWT token protection & verification
│   │   │   ├── errorHandler.js  # Global API error response handler
│   │   │   ├── role.js          # Role-Based Access Control (RBAC: Admin/Vendor/Customer)
│   │   │   └── upload.js        # Multer image upload parser
│   │   ├── models/              # Mongoose data schemas & validation
│   │   │   ├── Category.js      # Category taxonomy & active counts
│   │   │   ├── Coupon.js        # Discount rates, limits & vendor scope
│   │   │   ├── Order.js         # Order schema with split vendor items & status history
│   │   │   ├── Product.js       # Product details, stock, pricing & Elasticsearch sync
│   │   │   ├── Review.js        # Customer star ratings & feedback
│   │   │   └── User.js          # User profiles, passwords, & merchant stores
│   │   ├── routes/              # Express API route endpoints
│   │   ├── scripts/             # Data population & utility scripts
│   │   │   └── seed.js          # Full catalog & demo account database seeder
│   │   └── services/            # Specialized domain services
│   │       ├── cartService.js        # Cart session & caching logic
│   │       ├── credentialLogger.js   # Multi-candidate file credential persistence
│   │       ├── invoiceService.js     # Dynamic PDFKit tax invoice generation
│   │       └── searchService.js      # Elasticsearch multi-match search logic
│   └── tests/
│       └── splitPayment.test.js # Unit test suite for 90/10 split settlements
├── frontend/                    # React 18 SPA (Vite + Tailwind CSS)
│   ├── index.html               # HTML entry point with metadata
│   ├── vercel.json              # Vercel SPA client-side rewrite rules
│   ├── vite.config.js           # Vite build config & backend proxy
│   ├── tailwind.config.js       # Tailwind theme colors & styling extensions
│   ├── package.json             # Frontend dependencies and build scripts
│   ├── public/
│   │   ├── favicon.svg          # Marketplace brand favicon
│   │   └── _redirects           # Netlify SPA fallback routing
│   └── src/
│       ├── main.jsx             # React DOM root render
│       ├── App.jsx              # Application router & layout wrapping
│       ├── index.css            # Tailwind directives & global typography
│       ├── components/          # Reusable UI component library
│       │   ├── Footer.jsx           # Platform footer & tech highlights
│       │   ├── LifecycleTracker.jsx # 4-stage order timeline visualization
│       │   ├── Navbar.jsx           # Global search, category bar & auth controls
│       │   ├── ProductCard.jsx      # Product listing card with rating stars & cart CTA
│       │   └── RatingStars.jsx      # Dynamic star rating display
│       ├── context/             # Global React state management
│       │   ├── AuthContext.jsx      # User authentication, token & role state
│       │   └── CartContext.jsx      # Cart items, discounts & coupon state
│       ├── pages/               # Route views & user personas
│       │   ├── AdminDashboardPage.jsx    # Admin GMV metrics & system health
│       │   ├── CartPage.jsx              # Cart items, coupons & vendor breakdown
│       │   ├── CheckoutPage.jsx          # Shipping form & split payment preview
│       │   ├── HomePage.jsx              # Hero banner, categories & product grid
│       │   ├── LoginPage.jsx             # 1-Click demo logins & authentication
│       │   ├── OrderDetailPage.jsx       # Order tracking & PDF invoice download
│       │   ├── OrderHistoryPage.jsx      # Customer order ledger
│       │   ├── OrderSuccessPage.jsx      # Order confirmation & split summary
│       │   ├── ProductDetailPage.jsx     # Product specifications & reviews
│       │   ├── RegisterPage.jsx          # Customer & vendor account creation
│       │   ├── SearchPage.jsx            # Fuzzy search, facet filters & sorting
│       │   ├── VendorDashboardPage.jsx   # Merchant 90% payout & orders tracker
│       │   ├── VendorOnboardingPage.jsx  # Vendor store profile creation
│       │   ├── VendorProductsPage.jsx    # Vendor product management & inventory CRUD
│       │   └── VendorStorePage.jsx       # Public vendor storefront view
│       └── services/
│           └── api.js               # Axios instance with baseURL auto-normalization
├── docker-compose.yml           # Multi-container orchestration (MongoDB, Redis, ES)
├── API_DOCUMENTATION.md         # Full REST API endpoint reference
├── ARCHITECTURE.md              # System design diagrams, ERD schema & state machine
├── DEPLOYMENT.md                # Deployment guide for Vercel, Render & Docker
├── PRESENTATION.md              # 10-minute presentation slides
├── REFLECTIONS.md               # Individual intern reflections & takeaways
├── TEST_REPORT.md               # Automated testing benchmarks & coverage
└── README.md                    # Project overview, quickstart & documentation
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v22.19.0)
- **npm** v9+
- *(Optional)* Docker if running containerized MongoDB, Redis, and Elasticsearch via `docker-compose.yml`. (If not running, the platform has built-in auto-fallbacks so it starts and runs immediately out of the box!)

### 2. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/Mushraf0105/OmniMarket-Multi-Vendor_E-Commerce_Marketplace_FS-01.git
cd OmniMarket-Multi-Vendor_E-Commerce_Marketplace_FS-01
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
>
> 📁 **Credentials Store (`credentials/`):** All new registrations are automatically stored in [`credentials/Customer.json`](./credentials/Customer.json) and [`credentials/Vendor.json`](./credentials/Vendor.json), allowing instant authentication without requiring any external database. All actions trigger real-time feedback with `react-toastify`.

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
ISC License © 2026 Nexvia Technologies Team. Full-Stack Assessment FS-01.

