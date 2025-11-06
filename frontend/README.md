# Food Delivery Frontend

Modern React + TypeScript + Vite application for the Food Delivery platform. Provides a responsive UI for browsing items, managing a cart, checkout flow, authentication, and viewing order history.

## Tech Stack

- React 18 + TypeScript
- Vite for dev/build tooling
- TailwindCSS for styling
- React Router v6 for routing
- React Query (TanStack Query) for data fetching and caching
- Headless UI + Heroicons for accessible components/icons
- Axios for HTTP with credentials
- React Hot Toast for notifications

## Core Features

- Mobile‑first responsive layout
- Debounced item search & client-side category filtering
- Auth (login/register/logout) with persisted tokens (localStorage)
- Protected routes (e.g. Cart / Checkout / Orders)
- Cart management (add, update quantity, remove) with live stock checks
- Order placement & basic status tracking
- Dark/light theme toggle

## Getting Started

1. Navigate to the frontend folder:
```powershell
cd frontend
```
2. Install dependencies:
```powershell
npm install
```
3. Create environment file:
```powershell
Copy-Item .env.example .env
```
4. Edit `.env`:
```env
VITE_API_BASE_URL=http://localhost:4000/api
```
5. Start dev server:
```powershell
npm run dev
```

Visit: http://localhost:5173 (or the port Vite selects) 

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Production build (outputs to `dist/`) |
| `npm run preview` | Preview production build locally |

## Folder Structure

```
src/
  components/     Reusable UI pieces (Navbar, ItemCard, etc.)
  contexts/       React Context providers (Auth, Cart, Theme)
  pages/          Route-level pages (Home, Menu, Cart, Checkout, Orders, Login, Register)
  services/       API wrappers (items, cart, checkout, orders)
  types/          Shared TypeScript interfaces
  utils/          Axios instance and helpers
  styles.css      Tailwind base layer
public/           Static assets
```

## Authentication Flow

1. Register → auto login → tokens stored (`token`, `refreshToken`, `userEmail`).
2. Axios attaches JWT via interceptor (reads `token`).
3. Protected pages check `user` from `AuthContext`.
4. Logout clears tokens and notifies backend.

## Cart Behavior

- Fetches only when a valid `user` is present.
- After mutations (add/update/remove) it refreshes to keep totals correct.
- Subtotal is computed server-side and returned.

## React Query Strategy

- Items list cached for 5 minutes (`staleTime`).
- Manual client filtering for categories & search (debounced 300ms). Reduces network chatter.

## Styling & Responsiveness

- Tailwind utility classes with breakpoint prefixes (`sm:`, `md:`, `lg:`). 
- Item cards animate subtly on hover (`scale` + `translate`).
- Layout adjusts stacks on narrow screens (Cart rows, Orders header, Menu header).

## Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `VITE_API_BASE_URL` | Backend API base (with `/api`) | `http://localhost:4000/api` |

Restart dev server after changing `.env`.

## API Integration Notes

- All requests are relative to `VITE_API_BASE_URL` via the shared axios instance (`src/utils/api.ts`).
- Credentials (`withCredentials: true`) enabled for refresh tokens / session cookies if needed.

## Production Build & Deployment

1. Build: `npm run build`
2. Deploy the `dist/` folder (e.g. Vercel, Netlify). Ensure backend CORS allowlists the deployed origin.
3. Set `VITE_API_BASE_URL` in the hosting provider’s env settings.

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| 401 after refresh | Missing/expired token | Re-login; ensure backend refresh endpoint wired |
| CORS blocked | Origin not in allowlist | Update backend CORS config |
| Blank items list | API base URL mismatch | Confirm `VITE_API_BASE_URL` ends with `/api` |
| Images not showing | Bad `imageUrl` seed or network error | Check seed values / placeholder service |

## Future Enhancements (Ideas)

- Pagination / infinite scroll for items
- Image carousel or multiple images per item
- Persisted theme preference
- Optimistic cart updates

## License

MIT (see repository root for details)

---
### Original Vite Template Notes (Optional)
The default Vite + React + TS template guidance has been replaced by project docs above. For advanced ESLint / compiler setup, refer to the official Vite and TypeScript docs.
