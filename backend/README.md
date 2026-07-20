# E-Commerce Backend (Phase 1: Auth + Products + Categories)

## Setup

1. **Install dependencies**
   ```bash
   cd ecommerce-backend
   npm install
   ```

2. **Set up MySQL**
   - Make sure MySQL is running locally.
   - Run the schema:
     ```bash
     mysql -u root -p < models/schema.sql
     ```
   - This creates the `ecommerce_db` database with all tables and seeds 5 sample categories.

3. **Configure environment variables**
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Edit `.env` and set your MySQL password and a random `JWT_SECRET`
     (generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`).

4. **Run the server**
   ```bash
   npm run dev
   ```
   You should see:
   ```
   ✅ MySQL connected successfully
   🚀 Server running on http://localhost:5000
   ```

5. **Test it**
   - Health check: `GET http://localhost:5000/api/health`
   - Register: `POST /api/auth/register` — body: `{ "name", "email", "password" }`
   - Login: `POST /api/auth/login` — body: `{ "email", "password" }`
   - Products: `GET /api/products?search=phone&sort=price_asc&page=1&limit=12`

## Creating your first admin user
There's no public "become admin" route (by design — security). Register a normal
account, then promote it manually in MySQL:
```sql
UPDATE users SET role = 'admin' WHERE email = 'you@example.com';
```

## What's implemented so far
- ✅ MySQL schema for all 10 tables (users, products, categories, cart, wishlist,
  orders, order_items, reviews, recently_viewed, coupons)
- ✅ JWT + bcrypt authentication (register, login, profile, change password)
- ✅ Role-based middleware (`protect`, `adminOnly`)
- ✅ Product APIs: list (search/filter/sort/pagination), get by ID, related products,
  create/update/delete (admin, with image upload via Multer)
- ✅ Category APIs: list (public), create/update/delete (admin)
- ✅ Local image upload via Multer (`/uploads` folder, served statically).
  Swappable for Cloudinary later without touching controllers.
- ✅ Cart APIs: get, add, update quantity, remove item, clear cart (auto-computes
  subtotal using discounted price)
- ✅ Wishlist APIs: get, add, remove
- ✅ Order APIs (cash on delivery only):
  - `POST /api/orders` — places order from the user's cart in a single DB
    transaction (validates stock, decrements it, creates order + order_items,
    clears cart, rolls back cleanly on any failure)
  - `GET /api/orders` — logged-in user's order history
  - `GET /api/orders/:id` — single order with line items (owner or admin)
  - `GET /api/orders/admin/all` — admin: all orders, filterable by status, paginated
  - `PUT /api/orders/:id/status` — admin: update order status
  - `GET /api/orders/admin/analytics` — admin: total revenue/orders, orders by
    status, last-30-day daily sales, top 5 products by units sold
- ✅ Review APIs (nested under products): `GET/POST /api/products/:productId/reviews`,
  `DELETE /api/products/:productId/reviews/:reviewId`. Only users with a
  **delivered** order for that product can review it. Product's average `rating`
  is recalculated automatically on every add/delete.
- ✅ Recently viewed: `POST /api/recently-viewed/:productId` (call when a product
  page loads), `GET /api/recently-viewed` (last 20, most recent first)
- ✅ Admin user management: `GET /api/users`, `PUT /api/users/:id/role`,
  `DELETE /api/users/:id` (self-protection: can't demote/delete your own account)

- ✅ PDF invoice generation: `GET /api/orders/:id/invoice` streams a downloadable
  PDF (built with `pdfkit`) — shipping details, itemized table, total.
- ✅ Email order confirmation: sent automatically after a successful order via
  `nodemailer`. If `SMTP_HOST` isn't set in `.env`, emails are just logged to the
  console instead of sent, so local dev works without SMTP configured.
- ✅ Coupons: admin CRUD (`GET/POST/PUT/DELETE /api/coupons`) plus
  `POST /api/coupons/validate` for checking a code at checkout. `POST /api/orders`
  now accepts an optional `coupon_code` field and applies the percentage discount
  to the order total (re-validated server-side inside the order transaction).

## Not yet built (next phase)
- Frontend (React + Vite + Tailwind)

## Setting up email (optional)
Order confirmation emails use standard SMTP. For Gmail: enable 2FA on the account,
then generate an [App Password](https://myaccount.google.com/apppasswords) and use
that as `SMTP_PASS`. For quick local testing without a real inbox, services like
Mailtrap.io give you a sandbox SMTP host/user/pass for free.

## Folder structure
```
ecommerce-backend/
├── config/db.js              # MySQL connection pool
├── controllers/
│   ├── auth.controller.js
│   ├── product.controller.js
│   ├── category.controller.js
│   ├── cart.controller.js
│   ├── wishlist.controller.js
│   ├── order.controller.js
│   ├── review.controller.js
│   ├── recentlyViewed.controller.js
│   └── user.controller.js
├── middleware/
│   ├── auth.js                # JWT verify + admin guard
│   └── upload.js               # Multer image upload
├── models/schema.sql           # Full DB schema
├── routes/                     # Express routers (one per resource above)
├── utils/generateToken.js
├── server.js                   # App entry point
├── .env.example
└── package.json
```

## Quick endpoint reference
| Resource | Routes |
|---|---|
| Auth | `POST /api/auth/register`, `/login`; `GET/PUT /api/auth/profile`; `PUT /api/auth/change-password` |
| Products | `GET /api/products`, `/:id`, `/:id/related`; `POST/PUT/DELETE /api/products` (admin) |
| Categories | `GET /api/categories`; `POST/PUT/DELETE /api/categories` (admin) |
| Cart | `GET/POST/DELETE /api/cart`; `PUT/DELETE /api/cart/:productId` |
| Wishlist | `GET/POST /api/wishlist`; `DELETE /api/wishlist/:productId` |
| Orders | `POST/GET /api/orders`; `GET /api/orders/:id`; `GET /api/orders/:id/invoice` (PDF); admin: `/admin/all`, `/admin/analytics`, `PUT /:id/status` |
| Reviews | `GET/POST /api/products/:productId/reviews`; `DELETE .../reviews/:reviewId` |
| Recently viewed | `GET /api/recently-viewed`; `POST /api/recently-viewed/:productId` |
| Users (admin) | `GET /api/users`; `PUT /api/users/:id/role`; `DELETE /api/users/:id` |
| Coupons | `POST /api/coupons/validate` (any user); admin: `GET/POST /api/coupons`, `PUT/DELETE /api/coupons/:id` |
