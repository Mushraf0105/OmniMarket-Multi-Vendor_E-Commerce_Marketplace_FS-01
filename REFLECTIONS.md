# Intern Reflections: Multi-Vendor Marketplace Engineering

## Reflection 1: Backend Architecture & Payment Split Engine
**Domain Owned:** API Gateway, MongoDB Data Modeling, Split Settlement Engine, PDF Invoicing

### Technical Ownership:
- Engineered the Express.js API structure with role-based JWT authentication (`customer`, `vendor`, `admin`).
- Designed the relational data model in MongoDB with Mongoose, ensuring that order items record individual merchant attribution (`vendorShare` and `platformCommission`).
- Developed the mathematical split payment algorithm supporting Razorpay Route and Stripe Connect destination charges, properly pro-rating promotional coupon discounts across vendors.
- Implemented the on-the-fly streaming PDF invoice generator using PDFKit.

### Key Learnings & Takeaways:
- **Financial Precision in Distributed Systems:** Working with multi-vendor splits taught me that financial calculations must avoid floating-point drift. Calculating item proportions in cents/cents-level rounding ensures that the sum of vendor payouts and platform commissions exactly equals the customer's total charge.
- **Defensive API Design:** Writing fallback mechanisms (such as automatic memory MongoDB and mock payment settlement for dev/test environments) significantly boosted team developer velocity and test reliability.

---

## Reflection 2: Search, Caching & Data Infrastructure
**Domain Owned:** Elasticsearch Integration, Redis Cart Caching, AWS S3 Upload Pipeline

### Technical Ownership:
- Integrated Elasticsearch 8.x with custom Edge N-Gram tokenizers and multi-field relevance scoring (`name^3`, `brand^2`).
- Designed the Redis caching layer for carts with TTL expirations and inventory rehydration.
- Configured the AWS S3 multipart upload pipeline with automatic local disk fallback.

### Key Learnings & Takeaways:
- **Search Engine Optimization:** Learned how full-text search engines differ from traditional relational or document queries. Elasticsearch's inverted index and n-gram analyzers allow customers to make typos or partial queries without dropping conversion rates.
- **Cache Invalidation & Consistency:** One of the trickiest parts of e-commerce carts is ensuring that if an admin changes a price or stock runs out, the cart does not process stale data. By implementing price rehydration on cache reads, we attained the speed of Redis while retaining the data consistency of MongoDB.

---

## Reflection 3: Frontend User Experience & Vendor Portals
**Domain Owned:** React 18 SPA Architecture, Tailwind CSS UI/UX, Context State, Vendor Dashboard

### Technical Ownership:
- Built the responsive React application using Vite and Tailwind CSS with an Amazon-inspired design system.
- Developed the Vendor Portal with real-time KPI metrics (gross sales, net earnings, pending packages) and interactive fulfillment lifecycle actions.
- Built the live Split Payment transparency preview in the checkout flow, showing customers and merchants exactly how money is distributed.
- Implemented the product review system with verified purchase verification and interactive 5-star ratings.

### Key Learnings & Takeaways:
- **Multi-Persona State Management:** Managing separate navigation flows and permission gates for customers, vendors, and platform admins required clean encapsulation in React Context (`AuthContext` and `CartContext`).
- **Design for Trust & Transparency:** In a multi-vendor marketplace, buyers want to know who is shipping their package and sellers want clear visibility into commissions. Designing clear visual cues (vendor badges, fulfillment progress bars, split payout tables) makes the application feel production-grade.

