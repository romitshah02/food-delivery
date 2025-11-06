# Food Delivery Platform

A full-stack food delivery application consisting of a TypeScript/Express/Prisma backend and a React/TypeScript/Vite frontend.

## Architecture

| Layer    | Tech |
|----------|------|
| Backend  | Node.js, Express, TypeScript, Prisma, PostgreSQL |
| Frontend | React 18, Vite, TypeScript, TailwindCSS, React Router, React Query |
| Auth     | JWT access + refresh tokens |

## Key Features

- User authentication & session handling
- Browse items with search & category filtering
- Cart management with stock validation
- Checkout & order creation
- Order history & status tracking
- Responsive, mobile-friendly UI
- Theme toggle (dark / light)
- Secure backend (rate limiting, Helmet, CORS, validation)

## Monorepo Structure

```
food-delivery/
  backend/      # API server, Prisma schema, seed & migrations
  frontend/     # React SPA client
```

## Backend Quick Start

```powershell
cd backend
npm install
Copy-Item .env.example .env  # or manually create .env
# Edit .env with DATABASE_URL, JWT_SECRET, FRONTEND_URL
npm run db:migrate
npm run db:seed
npm run dev
```

Backend runs by default on http://localhost:4000 with routes under /api.

## Frontend Quick Start

```powershell
cd frontend
npm install
Copy-Item .env.example .env  # Ensure VITE_API_BASE_URL=http://localhost:4000/api
npm run dev
```

Frontend (Vite) runs on http://localhost:5173 (or the next free port).

## Environment Variables

Backend `.env` (example):
```
PORT=4000
DATABASE_URL=postgresql://user:password@localhost:5432/food_delivery
JWT_SECRET=your-secret
FRONTEND_URL=http://localhost:5173
```

Frontend `.env`:
```
VITE_API_BASE_URL=http://localhost:4000/api
```

## Common NPM Scripts

Backend:
- `npm run dev` – Start dev server (ts-node / nodemon)
- `npm run build` – Compile TypeScript
- `npm start` – Run compiled server
- `npm run db:migrate` – Apply Prisma migrations
- `npm run db:seed` – Seed database

Frontend:
- `npm run dev` – Vite dev server
- `npm run build` – Production build to `dist/`
- `npm run preview` – Local preview of build

## API Overview (High Level)

Authentication
- POST `/api/auth/register` – create user
- POST `/api/auth/login` – obtain tokens
- POST `/api/auth/logout` – revoke refresh token

Items
- GET `/api/items` – list items
- GET `/api/items/categories` – list categories
- GET `/api/items/category/:category` – items by category
- GET `/api/items/search?q=` – search items

Cart (Auth required)
- GET `/api/cart`
- POST `/api/cart/items` { itemId, quantity }
- PATCH `/api/cart/items/:id` { quantity }
- DELETE `/api/cart/items/:id`

Checkout
- POST `/api/checkout` – creates order from cart

Orders (Auth required)
- GET `/api/orders`
- GET `/api/orders/:id`

## Development Notes

- Frontend uses React Query to minimize redundant network requests.
- Debounced client-side search prevents excessive backend calls.
- Cart refreshes only when authenticated and after mutations.
- Prisma models define relational integrity; seeds populate sample items & user.

## Troubleshooting

| Issue | Possible Cause | Resolution |
|-------|----------------|-----------|
| CORS errors | FRONTEND_URL mismatch | Update backend CORS allowlist |
| 401 Unauthorized | Missing/expired token | Re-login; check axios interceptor |
| Items not loading | Wrong API base URL | Verify `VITE_API_BASE_URL` ends with `/api` |
| Image placeholders failing | External service blocked | Replace with local static asset |
| Prisma P1001 | DB unreachable / SSL misconfig | Confirm DATABASE_URL, SSL params, port |

## Future Enhancements

- Multiple images per item (image carousel)
- Pagination / infinite scroll for items
- Order status real-time updates (WebSockets)
- Improved error boundary handling on frontend

## License

MIT License. See individual folder READMEs for more details.

---
**Maintainer:** romitshah02

Feel free to open issues or PRs for feature requests and improvements.
