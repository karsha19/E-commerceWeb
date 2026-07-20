# E-Commerce Frontend (React + Vite + Tailwind)

## Setup

1. **Install dependencies**
   ```bash
   cd ecommerce-frontend
   npm install
   ```

2. **Configure the API URL**
   ```bash
   cp .env.example .env
   ```
   Defaults to `http://localhost:5000/api` — matches the backend's default port.

3. **Run the dev server**
   ```bash
   npm run dev
   ```
   Opens on `http://localhost:5173`. Make sure the backend (`ecommerce-backend`) is
   running first — the app calls it directly, there's no mock data.

4. **Build for production**
   ```bash
   npm run build
   ```
   Output goes to `dist/`. `npm run preview` serves that build locally.

## Design system
Built around one signature element: prices render as a die-cut **price tag**
(`.price-tag` in `src/index.css`, wrapped by `<PriceTag />`) — used consistently
on product cards, the product page, cart, and checkout.

- **Colors:** Ink `#12131A` (text), Paper `#F5F6F2` (background), Cobalt `#2547F4`
  (primary actions/links), Amber `#F2A93B` (sale badges), Line `#DEDFDA` (borders)
- **Type:** Space Grotesk (headings), Inter (body), IBM Plex Mono (prices, SKUs,
  quantities — treats numbers as data, not prose)

## Pages
| Route | Access | Purpose |
|---|---|---|
| `/` | public | Hero, category chips, newest products |
| `/products` | public | Search, filter (category/price), sort, pagination |
| `/products/:id` | public | Detail, reviews, related products, add to cart/wishlist |
| `/login`, `/register` | public | Auth |
| `/cart` | logged in | Quantity controls, subtotal |
| `/wishlist` | logged in | Saved items, move to cart |
| `/checkout` | logged in | Shipping form, coupon, cash-on-delivery |
| `/orders`, `/orders/:id` | logged in | History, tracking timeline, invoice download |
| `/profile` | logged in | Edit details, change password |
| `/admin` | admin only | Dashboard (revenue, top products, 30-day chart) |
| `/admin/products` (+ new/edit) | admin only | CRUD with image upload |
| `/admin/categories` | admin only | CRUD |
| `/admin/orders` | admin only | Filter by status, update status |
| `/admin/users` | admin only | Promote/demote, delete |
| `/admin/coupons` | admin only | CRUD, activate/deactivate |

## Notes
- Auth token is stored in `localStorage` and attached to every request via an
  axios interceptor (`src/api/axios.js`). A 401 response clears the session and
  redirects to `/login`.
- `AuthContext` and `CartContext` (`src/context/`) hold global state — no Redux
  needed at this scale.
- Product listing uses classic pagination (not infinite scroll) for predictable
  behavior and simpler state; swapping to infinite scroll would mean replacing
  `Pagination` with an intersection-observer "load more" in `Products.jsx`.
- Dark mode is implemented via a `ThemeContext` + toggle button in the navbar
  (the ☾/☀ icon). The palette uses CSS variables (`--color-ink`, `--color-paper`,
  etc. in `src/index.css`) so existing `bg-paper`/`text-ink`/`border-line`
  utility classes automatically flip — no per-component dark: variants needed.
  Preference is saved to `localStorage` and respects the OS setting on first visit.
