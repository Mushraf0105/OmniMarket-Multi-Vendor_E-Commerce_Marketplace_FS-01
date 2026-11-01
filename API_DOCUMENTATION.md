# OmniMarket REST API Documentation

Base URL: `http://localhost:5000/api`

---

## 1. Authentication & User Management

### POST `/auth/register`
Create a new user account (Customer, Vendor, or Admin).
- **Access:** Public
- **Request Body:**
```json
{
  "name": "Jane Merchant",
  "email": "jane@merchant.com",
  "password": "Password@123",
  "role": "vendor",
  "phone": "+1-800-555-0199",
  "storeName": "Jane's Boutique",
  "storeDescription": "Curated fashion and artisan accessories"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR...",
  "user": {
    "id": "6724a1b...",
    "name": "Jane Merchant",
    "email": "jane@merchant.com",
    "role": "vendor",
    "vendorProfile": {
      "storeName": "Jane's Boutique",
      "commissionRate": 10
    }
  }
}
```

### POST `/auth/login`
Authenticate user with email and password to receive JWT token.
- **Access:** Public
- **Request Body:**
```json
{
  "email": "techvendor@omnimarket.io",
  "password": "Password@123"
}
```

### GET `/auth/me`
Retrieve currently logged-in user profile.
- **Access:** Private (`Bearer <token>`)

---

## 2. Products & Elasticsearch Search

### GET `/products`
Search and filter products using Elasticsearch (or MongoDB full-text fallback).
- **Access:** Public
- **Query Parameters:**
  - `q`: Search keyword (fuzzy multi-match)
  - `category`: Filter by category name
  - `minPrice`, `maxPrice`: Numerical price range
  - `minRating`: Minimum average rating (e.g. `4`)
  - `inStock`: `true` to filter out-of-stock items
  - `sort`: `price_asc` | `price_desc` | `rating_desc` | `newest`
  - `page`, `limit`: Pagination parameters
- **Response (200 OK):**
```json
{
  "success": true,
  "source": "elasticsearch",
  "total": 12,
  "totalPages": 1,
  "page": 1,
  "products": [ ... ]
}
```

### GET `/products/:idOrSlug`
Retrieve product details, images, vendor profile, and related products.

### POST `/products`
Create a new product and index it immediately in Elasticsearch.
- **Access:** Private (`Vendor` or `Admin`)
- **Request Body:**
```json
{
  "name": "Wireless Noise-Cancelling Headphones",
  "description": "Studio grade spatial audio with 40-hr battery",
  "price": 249.99,
  "compareAtPrice": 299.99,
  "category": "Electronics",
  "brand": "ApexTech",
  "stock": 30,
  "images": ["https://images.unsplash.com/..."],
  "tags": ["audio", "wireless", "anc"]
}
```

### POST `/products/upload-image`
Upload product image to AWS S3 (or local disk storage fallback).
- **Access:** Private (`Vendor` or `Admin`)
- **Content-Type:** `multipart/form-data` (Field: `image`)

---

## 3. Redis-Backed Shopping Cart

### GET `/cart`
Fetch current items in Redis cart with rehydrated product prices and stock.
- **Access:** Public / Session / Private

### POST `/cart/add`
Add item to Redis-cached cart.
```json
{
  "productId": "6724a1b...",
  "quantity": 2
}
```

### PUT `/cart/update`
Update quantity of an item in Redis cart.
```json
{
  "productId": "6724a1b...",
  "quantity": 3
}
```

### DELETE `/cart/remove/:productId`
Remove specific product from Redis cart.

### DELETE `/cart/clear`
Flush the cart cache.

---

## 4. Multi-Vendor Orders & Lifecycle

### POST `/orders`
Place a multi-vendor order, calculate split payouts, apply coupon, and deduct inventory.
- **Access:** Private (`Customer`)
- **Request Body:**
```json
{
  "items": [
    { "productId": "6724a1b...", "quantity": 1 }
  ],
  "shippingAddress": {
    "fullName": "Alex Johnson",
    "addressLine1": "742 Evergreen Terrace",
    "city": "Springfield",
    "state": "IL",
    "postalCode": "62704",
    "country": "USA",
    "phone": "+1-555-234-5678"
  },
  "paymentMethod": "razorpay",
  "couponCode": "WELCOME10"
}
```

### GET `/orders/:id`
Retrieve order details, multi-vendor fulfillment stages, and tracking.

### GET `/orders/:id/invoice`
Generate and download the official PDF tax invoice (PDFKit).
- **Response:** `Content-Type: application/pdf`

### PUT `/orders/:id/status`
Update order lifecycle status (`placed` -> `packed` -> `shipped` -> `delivered`).
- **Access:** Private (`Admin` or `Vendor`)

---

## 5. Split Payments & Settlements

### POST `/payments/calculate-split`
Preview the financial split breakdown across vendors prior to order authorization.
- **Request Body:**
```json
{
  "items": [
    { "price": 100, "quantity": 2, "vendor": "vendor_1", "vendorName": "Apex Tech" }
  ],
  "discount": 10
}
```
- **Response:**
```json
{
  "success": true,
  "breakdown": {
    "totalGross": 200,
    "totalCommission": 19,
    "totalVendorPayout": 171,
    "splits": [
      {
        "vendorId": "vendor_1",
        "vendorName": "Apex Tech",
        "grossAmount": 200,
        "platformCommission": 19,
        "vendorShare": 171
      }
    ]
  }
}
```

---

## 6. Admin Analytics & Vendor Portal

### GET `/analytics/admin`
Retrieve platform GMV, commission revenues, vendor performance leaderboard, and microservice telemetry.
- **Access:** Private (`Admin`)

### GET `/vendors/dashboard/stats`
Retrieve vendor-specific gross sales, 90% net earnings, 10% commission paid, and pending packages.
- **Access:** Private (`Vendor`)

### POST `/coupons/validate`
Validate promo coupon code against cart total and return discount.
