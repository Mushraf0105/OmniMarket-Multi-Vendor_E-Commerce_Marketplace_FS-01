# OmniMarket - Multi-Vendor E-Commerce Platform Architecture

## 1. High-Level System Architecture

```mermaid
flowchart TD
    subgraph ClientLayer ["Client Layer (Frontend)"]
        ReactApp["React 18 SPA (Vite + Tailwind CSS)"]
        CustomerView["Customer Storefront & Redis Cart"]
        VendorPortal["Merchant Vendor Portal (Product CRUD & Orders)"]
        AdminConsole["Admin Financial & Infrastructure Console"]
    end

    subgraph APILayer ["Backend API Layer (Node.js & Express)"]
        AuthMiddleware["JWT Authentication & RBAC Middleware"]
        Router["Express REST API Endpoints"]
        
        subgraph Services ["Core Engine Services"]
            SearchService["Elasticsearch Query & Facet Service"]
            CacheService["Redis Cart & Session Cache Service"]
            SplitPayService["Razorpay & Stripe Split Settlement Service"]
            InvoiceService["PDFKit Tax Invoice Generator"]
            StorageService["AWS S3 / Disk Multipart Storage"]
        end
    end

    subgraph DataLayer ["Data & Infrastructure Layer"]
        MongoDB[("MongoDB 8.x (Documents & Indexes)")]
        RedisCache[("Redis (Cart & TTL Sessions)")]
        ESCluster[("Elasticsearch 8.x (Faceted Search & Aggregations)")]
        AWSS3[("AWS S3 Bucket (Product Media CDN)")]
        Gateways[("Payment Gateways (Razorpay & Stripe Connect)")]
    end

    ReactApp --> CustomerView
    ReactApp --> VendorPortal
    ReactApp --> AdminConsole

    CustomerView -->|HTTP REST + JWT| Router
    VendorPortal -->|HTTP REST + JWT| Router
    AdminConsole -->|HTTP REST + JWT| Router

    Router --> AuthMiddleware
    AuthMiddleware --> Services

    SearchService --> ESCluster
    SearchService -.->|Fallback if offline| MongoDB
    CacheService --> RedisCache
    SplitPayService --> Gateways
    StorageService --> AWSS3
    Router --> MongoDB
```

---

## 2. Multi-Vendor Split Payment Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant Frontend as React Frontend
    participant Backend as Node.js Backend
    participant SplitService as Split Settlement Engine
    participant Gateway as Razorpay / Stripe Connect
    participant Vendor as Vendor Bank Account
    participant Platform as Platform Commission Account

    Customer->>Frontend: Adds multi-vendor items to Cart
    Frontend->>Backend: GET /api/cart (Fetch Redis Cart)
    Customer->>Frontend: Proceed to Checkout & Choose Split Payment
    Frontend->>Backend: POST /api/payments/calculate-split
    Backend->>SplitService: Compute Gross per Vendor, 10% Commission, 90% Vendor Share
    SplitService-->>Frontend: Live Split Preview Returned
    Customer->>Frontend: Click "Place Order & Authorize"
    Frontend->>Backend: POST /api/orders (Items, Address, Payment Method)
    Backend->>Gateway: Create Order with Transfer Data / Destination Charge
    Gateway-->>Backend: Payment Success Webhook / Signature Verified
    Backend->>Vendor: Route 90% Net Payout Transfer
    Backend->>Platform: Retain 10% Platform Commission
    Backend->>Backend: Create Order Record, Decrement Product Stock, Clear Redis Cart
    Backend-->>Frontend: Order Placed + PDF Invoice Ready
    Frontend->>Customer: Display Order Confirmation & Tracking
```

---

## 3. Order Lifecycle State Machine

```mermaid
stateDiagram-v2
    [*] --> Placed: Customer Completes Checkout & Payment Settled
    Placed --> Packed: Vendor Packages Products & Prepares Box
    Packed --> Shipped: Carrier Dispatched (FedEx / USPS Tracking Assigned)
    Shipped --> Delivered: Final Customer Delivery Confirmed
    Delivered --> [*]
    
    Placed --> Cancelled: Cancelled / Refund Issued
    Packed --> Cancelled: Out of Stock Exception
```

---

## 4. Database Schema (Entity Relationship Diagram)

```mermaid
erDiagram
    USER ||--o{ PRODUCT : owns
    USER ||--o{ ORDER : places
    USER ||--o{ REVIEW : writes
    PRODUCT ||--o{ REVIEW : receives
    PRODUCT ||--o{ ORDER_ITEM : contained_in
    ORDER ||--|{ ORDER_ITEM : contains
    CATEGORY ||--o{ PRODUCT : categorizes
    COUPON ||--o{ ORDER : applied_to

    USER {
        ObjectId _id PK
        string name
        string email
        string password
        string role "customer | vendor | admin"
        string phone
        object address
        object vendorProfile "storeName, commissionRate, bankDetails"
    }

    PRODUCT {
        ObjectId _id PK
        string name
        string slug
        string description
        number price
        number compareAtPrice
        ObjectId vendor FK
        string category
        string brand
        string[] images
        number stock
        number rating
        number numReviews
        string[] tags
    }

    ORDER {
        ObjectId _id PK
        string orderNumber
        ObjectId customer FK
        array items
        object shippingAddress
        object payment "method, status, splitTransfers, platformCommissionTotal"
        number subtotal
        number discount
        number tax
        number shippingFee
        number totalAmount
        string overallStatus "placed | packed | shipped | delivered"
        string invoiceNumber
    }

    REVIEW {
        ObjectId _id PK
        ObjectId product FK
        ObjectId user FK
        string userName
        number rating "1 to 5"
        string title
        string comment
        boolean isVerifiedPurchase
    }

    COUPON {
        ObjectId _id PK
        string code
        string discountType "percentage | fixed"
        number discountValue
        number minOrderValue
        number maxDiscount
        date expiryDate
        number usageLimit
        number usedCount
    }
```

---

## 5. Architectural Highlights & Engineering Decisions

1. **Redis Caching for Carts & Sessions**:
   - Customer carts are stored with high-speed key-value access (`cart:user:{id}` and `cart:session:{id}`) with automatic TTL expiry (7 days).
   - Price rehydration ensures real-time inventory validation at moment of checkout without race conditions.

2. **Elasticsearch Indexing & Resilient Fallback**:
   - Products are indexed with custom edge n-gram tokenizers to provide substring search, typo-tolerant fuzzy matching, and multi-field boost (`name^3`, `brand^2`, `tags^2`).
   - If Elasticsearch is offline or unreachable in isolated environments, the system seamlessly transitions to MongoDB compound text & regex queries without throwing 500 errors.

3. **Multi-Vendor Split Settlement**:
   - Each order item carries individual vendor attribution, allowing independent fulfillment tracking.
   - Payout engine automatically allocates proportioned coupon discounts and calculates the exact 90/10 split before routing funds.

4. **Dynamic PDF Invoicing**:
   - Streaming PDF generation with PDFKit produces formatted tax invoices featuring itemized vendor breakdowns, shipping details, and barcode order numbering.

