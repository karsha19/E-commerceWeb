# YourPersonalFavouriteStore App

Full-stack e-commerce project: React (Vite + Tailwind) frontend and a
Node.js/Express + MySQL backend, in one repo.

```
ecommerce-app/
├── backend/     Express API, MySQL schema, JWT auth, orders, invoices, coupons
└── frontend/    React app (customer storefront + admin dashboard)
```

Each folder has its own `README.md` with full details. Quick start below.

## 1. Backend

```bash
cd backend
npm install
mysql -u root -p < models/schema.sql
cp .env.example .env
# edit .env: set DB_PASSWORD and a random JWT_SECRET
npm run dev
```
Runs on `http://localhost:5000`. Health check: `GET /api/health`.

Promote your first admin account manually once you've registered a user:
```sql
UPDATE users SET role = 'admin' WHERE email = 'you@example.com';
```

## 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
# defaults to http://localhost:5000/api — matches the backend above
npm run dev
```
Runs on `http://localhost:5173`.

## Notes
- Start the backend first — the frontend has no mock data and calls the API directly.
- Order confirmation emails need SMTP configured in `backend/.env` (optional —
  emails are just logged to the console if left blank).
- Product images upload to `backend/uploads/` and are served at `/uploads/...`.
- Payment method is cash on delivery only, per the project brief.

See `backend/README.md` for the full API reference and `frontend/README.md`
for the design system and page-by-page breakdown.
