# The African Store (TAS) — Full Stack Codebase

A hybrid fabric marketplace — modern e-commerce + RFQ bidding system. Built with Next.js, Node.js/Express, MongoDB, Cloudinary, and Paystack.

---

## Project Structure

```
tas/
├── tas-frontend/     # Next.js 14 frontend (deploy to Vercel)
└── tas-backend/      # Node.js + Express API (deploy to Railway/Render)
```

---

## FRONTEND SETUP

### Tech Stack
- Next.js 14, TypeScript, TailwindCSS
- Zustand (auth + cart state)
- React Query (data fetching)
- React Hook Form (forms)
- Paystack Inline JS (payments)

### 1. Install dependencies
```bash
cd tas-frontend
npm install
```

### 2. Configure environment
```bash
cp .env.local.example .env.local
```
Edit `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxx
```

### 3. Run locally
```bash
npm run dev
# Opens at http://localhost:3000
```

### 4. Deploy to Vercel
```bash
npm install -g vercel
vercel
```
Set the same environment variables in the Vercel dashboard under Project → Settings → Environment Variables.

---

## BACKEND SETUP

### Tech Stack
- Node.js + Express
- MongoDB Atlas (via Mongoose)
- Cloudinary (image uploads)
- Paystack (payment verification)
- JWT authentication
- Helmet + rate limiting (security)

### 1. Install dependencies
```bash
cd tas-backend
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```
Edit `.env` with your real keys:
```
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_long_random_secret
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
PAYSTACK_SECRET_KEY=sk_test_...
CLIENT_URL=http://localhost:3000
```

### 3. Run locally
```bash
npm run dev
# API runs at http://localhost:5000
```

### 4. Deploy to Railway
1. Push your backend to a GitHub repo
2. Go to https://railway.app → New Project → Deploy from GitHub
3. Add all environment variables in Railway dashboard
4. Railway auto-detects Node.js and runs `npm start`

Or deploy to Render (https://render.com):
- New Web Service → connect GitHub repo
- Build command: `npm install`
- Start command: `node src/server.js`

---

## EXTERNAL SERVICES SETUP

### MongoDB Atlas (free tier works)
1. Go to https://mongodb.com/atlas → Create free cluster
2. Create a database user (username + password)
3. Whitelist `0.0.0.0/0` in Network Access (or your server IP)
4. Get connection string → paste into `MONGO_URI`

### Cloudinary (free tier works)
1. Sign up at https://cloudinary.com
2. Go to Dashboard → copy Cloud Name, API Key, API Secret
3. Paste into your `.env`

### Paystack
1. Sign up at https://paystack.com
2. Go to Settings → API Keys
3. Copy Public Key (for frontend) and Secret Key (for backend)
4. Use test keys during development (`pk_test_...` / `sk_test_...`)

---

## API ENDPOINTS

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register buyer or vendor |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| PATCH | /api/auth/profile | Update profile |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/products | List products (with filters) |
| GET | /api/products/:id | Single product |
| POST | /api/products | Create product (vendor) |
| PATCH | /api/products/:id | Update product (vendor) |
| DELETE | /api/products/:id | Remove product (vendor) |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/orders | Create order |
| POST | /api/orders/:id/verify-payment | Verify Paystack payment |
| PATCH | /api/orders/:id/confirm-delivery | Confirm delivery (buyer) |
| GET | /api/orders/my | Buyer's orders |
| GET | /api/orders/:id | Single order |

### RFQ (Fabric Requests)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/rfq | List open requests |
| GET | /api/rfq/:id | Single request |
| POST | /api/rfq | Create request (buyer) |
| POST | /api/rfq/:id/offer | Submit offer (vendor) |
| PATCH | /api/rfq/:id/offer/:offerId/accept | Accept offer (buyer) |
| DELETE | /api/rfq/:id | Delete request (buyer) |

### Vendor
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/vendor/profile | Get own profile |
| PATCH | /api/vendor/profile | Update profile |
| GET | /api/vendor/stats | Dashboard stats |
| GET | /api/vendor/products | Own products |
| GET | /api/vendor/orders | Orders for vendor's products |
| PATCH | /api/vendor/orders/:id/ship | Mark as shipped |
| GET | /api/vendor/all | Public: list all vendors |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/stats | Platform stats |
| GET | /api/admin/vendors/pending | Pending vendor approvals |
| PATCH | /api/admin/vendors/:id/approve | Approve vendor |
| PATCH | /api/admin/vendors/:id/reject | Reject vendor |
| GET | /api/admin/users | All users |
| PATCH | /api/admin/products/:id/feature | Toggle featured |
| GET | /api/admin/orders | All orders |

### Upload
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/upload | Upload images to Cloudinary |

---

## FRONTEND PAGES

| Path | Description |
|------|-------------|
| `/` | Homepage with hero, featured products |
| `/shop` | Product listing with filters |
| `/shop/[id]` | Product detail + add to cart |
| `/cart` | Cart + Paystack checkout |
| `/auth/login` | Sign in |
| `/auth/register` | Register (buyer or vendor) |
| `/rfq` | Browse fabric requests |
| `/rfq/new` | Post a fabric request |
| `/rfq/[id]` | Request detail + submit/accept offers |
| `/vendor/dashboard` | Vendor dashboard (stats, products, orders) |
| `/vendor/products/new` | Add new product listing |
| `/orders` | Buyer's order history |

---

## CREATING THE FIRST ADMIN USER

There's no admin registration UI (by design). To promote a user to admin:

1. Register normally via the app
2. Open MongoDB Atlas → Browse Collections → `users`
3. Find your user document
4. Change `"role": "buyer"` to `"role": "admin"`
5. Save — you now have admin access

---

## PAYMENT FLOW

```
Buyer adds to cart
       ↓
POST /api/orders  → creates order with "pending" payment
       ↓
Paystack Inline opens (frontend)
       ↓
Buyer completes payment on Paystack
       ↓
POST /api/orders/:id/verify-payment
  → verifies with Paystack API
  → marks order "paid"
  → decrements product stock
       ↓
Vendor sees order, ships it
       ↓
Buyer confirms delivery
  → PATCH /api/orders/:id/confirm-delivery
  → marks "delivered"
  → (TODO: trigger Paystack payout to vendor)
```

---

## PHASE 2 — WHAT TO BUILD NEXT

- [ ] Email notifications (use Nodemailer or Resend)
- [ ] Paystack Transfer API for automatic vendor payouts
- [ ] Admin mediation / dispute system
- [ ] Vendor onboarding page (collect bank details)
- [ ] Product reviews after delivery
- [ ] Logistics API integration (GIG, DHL Nigeria)
- [ ] Analytics dashboard (Chart.js)
- [ ] Flutter mobile app

---

## FOLDER STRUCTURE (Backend)

```
tas-backend/src/
├── server.js            # Entry point
├── config/
│   ├── db.js            # MongoDB connection
│   └── cloudinary.js    # Cloudinary + multer config
├── middleware/
│   └── auth.js          # JWT protect + authorize
├── models/
│   ├── User.js
│   ├── VendorProfile.js
│   ├── Product.js
│   ├── Order.js
│   ├── FabricRequest.js
│   └── Review.js
└── routes/
    ├── auth.js
    ├── products.js
    ├── orders.js
    ├── rfq.js
    ├── vendor.js
    ├── admin.js
    ├── reviews.js
    └── upload.js
```

---

Built for The African Store (TAS) — Modernizing African fabric trade, one transaction at a time.
