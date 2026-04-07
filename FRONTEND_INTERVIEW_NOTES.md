# Frontend Interview Notes - Golf Charity Subscription Platform

## 1. Project Overview

This frontend is a React single-page application for a Golf Charity Subscription Platform.

The main idea is:

- Users can create a free account.
- Users can browse charities and choose a cause to support.
- Logged-in users can track golf scores.
- Users can optionally subscribe to a paid plan for draw participation and automated charity giving.
- Winners can upload proof for verification.
- Admin users can manage users, charities, draws, analytics, and proof reviews.

In an interview, you can describe it as:

> I built a Vite React frontend for a charity-focused golf subscription platform. It supports public charity browsing, authentication, protected user dashboards, subscription checkout, score tracking, and an admin panel for managing platform operations.

## 2. Tech Stack

- React 19 for UI components.
- Vite for fast development and production builds.
- React Router for client-side routing.
- Axios for backend API communication.
- Tailwind CSS plus custom CSS variables for styling.
- Framer Motion for UI animations.
- Lucide React for icons.
- Vercel configuration for deployment.

Useful file references:

- `client/package.json`: dependencies and scripts.
- `client/vite.config.js`: Vite setup and local API proxy.
- `client/tailwind.config.js`: Tailwind content configuration.
- `client/vercel.json`: rewrite rules for React Router on Vercel.

## 3. Application Entry Flow

The app starts in `client/src/main.jsx`.

The render tree is:

1. `React.StrictMode`
2. `BrowserRouter`
3. `ThemeProvider`
4. `AuthProvider`
5. `App`

Why this matters:

- `BrowserRouter` enables routes like `/dashboard`, `/charities`, and `/admin`.
- `ThemeProvider` makes dark/light mode available globally.
- `AuthProvider` makes logged-in user state available globally.
- `App` defines which page appears for each route.

Interview explanation:

> I wrapped the app with router, theme, and auth providers at the root so any page can access navigation, theme state, and authentication state without prop drilling.

## 4. Routing Structure

Routes are defined in `client/src/App.jsx`.

Public routes:

- `/`: Home page.
- `/login`: Login page.
- `/register`: Register page.
- `/charities`: Charity listing page.
- `/charities/:slug`: Charity detail page.
- `/score-center`: Score page. The page is visible publicly, but score management actions depend on login state.

Protected user routes:

- `/dashboard`: User dashboard.
- `/subscribe`: Subscription and payment page.

Protected admin route:

- `/admin`: Admin dashboard.

Key implementation details:

- Pages are loaded with `React.lazy`.
- `Suspense` shows a loading fallback while page chunks load.
- `AppLayout` wraps routes with a shared navbar, main content area, and footer.
- `ProtectedRoute` handles user-only and admin-only access control.

Interview explanation:

> I used lazy loading for route components so each page can be split into separate chunks. Protected routes use an outlet-based wrapper, which keeps route protection reusable for both normal users and admins.

## 5. Authentication

Authentication is managed in `client/src/context/AuthContext.jsx`.

Main behavior:

- On app startup, it checks `localStorage` for `golf-charity-token`.
- If a token exists, it calls `/auth/me` to restore the current user.
- Login stores the token and user in context.
- Register also stores the token and user in context.
- Logout calls the backend, then removes the token locally and clears the user.
- `isAdmin` is derived from `user?.role === 'admin'`.

The custom hook `client/src/hooks/useAuth.js` exposes the auth context.

Interview explanation:

> The auth context centralizes session state. The app persists the token in localStorage, validates it on refresh with the backend, and exposes login, register, logout, user, and admin status to the rest of the frontend.

Important security note:

> The frontend protects routes for user experience, but real authorization must still be enforced on the backend because frontend route guards can be bypassed.

## 6. API Layer

API configuration is in `client/src/services/api.js`.

Main behavior:

- Uses Axios.
- Reads `VITE_API_URL`, defaulting to `http://localhost:5000`.
- Removes trailing slashes and duplicate `/api`.
- In development, API calls go to `/api` so Vite can proxy them.
- In production, API calls go to `${VITE_API_URL}/api`.
- Adds the auth token to requests using an Axios request interceptor.
- Logs a helpful backend connectivity message in development if the API is unreachable.

API service groups are in `client/src/services/index.js`.

Service groups:

- `authService`: login, register, current user, logout.
- `charityService`: list, featured, detail, create, update, delete.
- `subscriptionService`: status, create, checkout session, confirm checkout, cancel, donate.
- `userService`: dashboard, preferences, scores, draws, prizes, proof upload.
- `adminService`: analytics, users, draw preview/publish, proof review.

Interview explanation:

> I separated raw Axios setup from domain-specific service functions. That keeps pages cleaner because they call `charityService.list()` or `subscriptionService.status()` instead of hardcoding URLs all over the UI.

## 7. Layout And Reusable Components

Shared layout:

- `client/src/layouts/AppLayout.jsx`
- Adds the navbar, page container, and footer.
- Uses `Outlet` so child routes render inside the layout.

Navbar:

- `client/src/components/Navbar.jsx`
- Shows public nav links.
- Shows login/register buttons for guests.
- Shows dashboard/admin/logout controls for authenticated users.
- Includes theme toggle.
- Uses `NavLink` to highlight active navigation items.

Reusable UI components:

- `SectionTitle`: animated section heading using Framer Motion.
- `StatCard`: animated stat display card with tone-based gradients.
- `ProtectedRoute`: route access wrapper for user/admin pages.

Interview explanation:

> I extracted common layout and small UI blocks so pages stay focused on business logic and data fetching instead of repeating header, card, or route guard code.

## 8. Theme System

Theme state is managed in `client/src/context/ThemeContext.jsx`.

Main behavior:

- Checks `localStorage` for `golf-charity-theme`.
- Falls back to the user's system preference.
- Sets `document.documentElement.dataset.theme`.
- Persists the selected theme.
- Provides `toggleTheme`.

Styling is defined in `client/src/index.css`.

Important CSS approach:

- `:root` defines dark theme variables.
- `:root[data-theme='light']` overrides variables for light theme.
- Components use CSS variables like `--text`, `--brand`, `--panel`, and `--line`.
- Tailwind is used for layout and utility classes.

Interview explanation:

> I used CSS variables for theme colors, then toggled a `data-theme` attribute on the root element. This avoids duplicating styles across components and makes dark/light mode consistent across the whole app.

## 9. Page-By-Page Notes

### Home Page

File: `client/src/pages/HomePage.jsx`

Purpose:

- Landing page for the platform.
- Explains free signup and optional paid subscription.
- Shows featured charity data.
- Shows recent draw data.
- Uses animated cards and stats.

Data fetched:

- `charityService.featured()`
- `userService.draws()`

Interview explanation:

> The home page is designed as a marketing and onboarding page. It fetches dynamic featured charity and recent draw data, but gracefully falls back to default text if the backend response is not available.

### Login Page

File: `client/src/pages/LoginPage.jsx`

Purpose:

- Allows users to log in.
- Redirects authenticated users automatically.
- Admin users go to `/admin`; normal users go to `/dashboard`.

Key details:

- Uses `useAuth().login`.
- Handles loading state with `submitting`.
- Shows backend error messages when available.

### Register Page

File: `client/src/pages/RegisterPage.jsx`

Purpose:

- Allows free account registration.
- Lets users optionally choose a charity during signup.
- Sends contribution percentage as a number.

Data fetched:

- `charityService.list()`

Interview explanation:

> Registration is intentionally free. Charity selection is optional, which reduces onboarding friction while still letting motivated users choose a cause immediately.

### Charity List Page

File: `client/src/pages/CharityListPage.jsx`

Purpose:

- Displays charities in a responsive card grid.
- Supports search.
- Links each charity to its detail page using the charity slug.

Data fetched:

- `charityService.list({ search })`

Key UI detail:

- Uses fallback image if a charity image is missing or fails to load.

### Charity Detail Page

File: `client/src/pages/CharityDetailPage.jsx`

Purpose:

- Shows one charity profile.
- Displays description, location, website, impact metric, total donations, and donation count.

Data fetched:

- `charityService.detail(slug)`

### Score Page

File: `client/src/pages/ScorePage.jsx`

Purpose:

- Lets logged-in users add and edit golf scores.
- Score values are between 1 and 45.
- Shows last score entries returned by the backend.

Data fetched:

- `userService.scores()`

Actions:

- `userService.addScore(form)`
- `userService.updateScore(editingId, form)`

Interview explanation:

> The score page supports create and update behavior in one form. If `editingId` is set, it updates an existing score; otherwise, it creates a new one.

### Dashboard Page

File: `client/src/pages/DashboardPage.jsx`

Purpose:

- Main logged-in user dashboard.
- Shows subscription status, contribution percentage, selected charity, and winnings.
- Shows draw history, charity giving summary, donations, and prize verification status.
- Lets users make independent donations.
- Lets winners upload proof images.

Data fetched:

- `userService.dashboard()`
- `subscriptionService.status()`

Actions:

- `subscriptionService.donate({ amount })`
- `userService.uploadProof(prizeId, formData)`

Key implementation detail:

- Uses `Promise.all` to fetch dashboard and subscription data in parallel.
- Uses `FormData` for proof image upload.

Interview explanation:

> The dashboard combines several backend resources into one user-facing view. I fetch dashboard and subscription data in parallel, then refresh the dashboard after actions like donation or proof upload to keep the UI in sync.

### Subscription Page

File: `client/src/pages/SubscriptionPage.jsx`

Purpose:

- Lets users select a charity and subscription plan.
- Starts payment through checkout.
- Confirms successful checkout after redirect.
- Displays current subscription and payment history.

Data fetched:

- `subscriptionService.status()`
- `charityService.list()`

Actions:

- `userService.updatePreferences({ charityId })`
- `subscriptionService.createCheckoutSession(payload)`
- `subscriptionService.confirmCheckoutSession(sessionId)`

Checkout flow:

1. User picks charity and plan.
2. User clicks subscribe/pay.
3. Frontend asks backend to create checkout session.
4. If backend returns a redirect URL, browser navigates to the payment provider.
5. After successful redirect, the page reads `checkout=success` and `session_id`.
6. Frontend calls backend to confirm the session.
7. URL is cleaned with `window.history.replaceState`.

Interview explanation:

> The frontend does not directly process payments. It asks the backend to create a checkout session, redirects the user to the provider, and then confirms the session after the provider redirects back.

### Admin Page

File: `client/src/pages/AdminPage.jsx`

Purpose:

- Admin-only operational dashboard.
- Shows analytics.
- Lets admins preview and publish draws.
- Lets admins update users, roles, subscription status, charity preferences, and score history.
- Lets admins create, update, and delete charities.
- Lets admins review winner proof and mark payouts.

Data fetched:

- `adminService.analytics()`
- `adminService.users()`
- `adminService.proofs()`
- `charityService.list()`

Actions:

- `adminService.previewDraw({ logic })`
- `adminService.publishDraw({ logic })`
- `adminService.updateUser(id, payload)`
- `charityService.create(payload)`
- `charityService.update(id, payload)`
- `charityService.remove(id)`
- `adminService.reviewProof(id, payload)`

Interview explanation:

> The admin page centralizes platform management. It uses the same API service layer but calls admin endpoints for analytics, draw logic, user management, charity CRUD, and proof verification.

## 10. ProtectedRoute Explanation

File: `client/src/components/ProtectedRoute.jsx`

Logic:

- If auth is still loading, show a loading message.
- If no user exists, redirect to `/login`.
- If the route is admin-only and the user is not admin, redirect to `/dashboard`.
- Otherwise, render nested routes with `Outlet`.

Interview explanation:

> I built one reusable route guard that can protect normal logged-in pages and admin-only pages by accepting an `adminOnly` prop.

## 11. State Management Approach

The app uses local React state and context instead of Redux.

Why this is reasonable:

- Auth and theme are global, so they live in context.
- Page-specific data like charity lists, dashboard data, plans, forms, and admin state stay inside their pages.
- API calls are abstracted in services to reduce duplication.

Interview explanation:

> I used React Context only for truly global state: auth and theme. Most data is page-local because it is only needed in one view, which keeps the state model simpler.

## 12. Styling And UX

Main styling file:

- `client/src/index.css`

Styling approach:

- Tailwind utilities handle layout, spacing, typography, and responsive design.
- Custom classes like `glass`, `page-card`, `btn`, `input`, `badge`, and `card-hover` create a consistent design system.
- CSS variables support theme switching.
- Framer Motion adds subtle entrance and hover animations.
- Lucide icons improve visual clarity.

Interview explanation:

> I combined Tailwind for fast layout with a small custom design system for repeated UI patterns like buttons, cards, badges, inputs, and glassmorphism panels.

## 13. Deployment Notes

Deployment guide:

- `VERCEL_DEPLOYMENT.md`

Vercel config:

- `client/vercel.json`

Important deployment behavior:

- Vercel root directory should be `client`.
- Build command is `npm run build`.
- Output directory is `dist`.
- Production needs `VITE_API_URL`.
- Do not include `/api` at the end of `VITE_API_URL` because the frontend adds it.
- Vercel rewrite sends all routes to `index.html`, which prevents refresh errors on React Router pages.

Vite config:

- Development server runs on port `5173`.
- Local `/api` requests are proxied to the backend from `VITE_API_URL` or `http://localhost:5000`.

Interview explanation:

> Local development uses the Vite proxy, but production sends API requests directly to `VITE_API_URL/api`. The Vercel rewrite is needed because this is a client-side routed single-page app.

## 14. Strengths To Mention In Interview

- Clear separation between pages, services, context, hooks, and shared components.
- Reusable protected route pattern for user and admin access.
- Centralized Axios configuration with auth token injection.
- Good user flow from free signup to optional paid subscription.
- Dynamic charity browsing and detail pages.
- Dashboard combines subscription, donations, scores, prizes, and proof uploads.
- Admin panel supports real operational workflows.
- Dark/light theme system is implemented globally with persisted preference.
- Vercel deployment is documented and configured.
- Page components use loading, error, and success states.

## 15. Possible Interview Questions And Answers

### Why did you use React Context?

> I used context for auth and theme because both are global concerns needed across many pages. I kept page-specific data in local component state to avoid unnecessary global complexity.

### How does authentication work?

> On login or register, the backend returns a token and user. I store the token in localStorage, keep the user in AuthContext, and attach the token to future Axios requests using an interceptor. On refresh, the app calls `/auth/me` to restore the session.

### How are protected routes handled?

> I created a `ProtectedRoute` component that checks auth loading, user existence, and admin role if needed. It redirects unauthenticated users to login and non-admin users away from the admin page.

### How does the subscription checkout work?

> The frontend selects a plan and charity, then asks the backend to create a checkout session. If the backend returns a redirect URL, the browser goes to the payment provider. After success, the frontend reads the session ID from the URL and asks the backend to confirm the subscription.

### How is the API layer organized?

> There is a base Axios instance in `api.js`, and `index.js` exports domain services like auth, charity, subscription, user, and admin services. This prevents repeating endpoints inside UI components.

### How does theme switching work?

> The theme provider stores the selected theme in localStorage and writes it to `document.documentElement.dataset.theme`. CSS variables change based on that attribute, so the entire UI updates consistently.

### Why use lazy loading?

> Route components are loaded with `React.lazy` so the initial bundle can stay lighter. `Suspense` displays a loading fallback while a page component is being downloaded.

### What would you improve next?

Good answers:

- Add form validation with a library like React Hook Form or Zod.
- Add automated tests for route guards, auth flows, and subscription behavior.
- Add loading skeletons for charity and dashboard pages.
- Add debouncing to charity search to reduce API calls.
- Improve accessibility audits for keyboard and screen reader behavior.
- Add optimistic UI or query caching with React Query.

## 16. Short 60-Second Project Pitch

> This is a Vite React frontend for a Golf Charity Subscription Platform. It lets users sign up for free, browse charities, track golf scores, and optionally subscribe to a paid plan for monthly draw participation and automated charity giving. I structured the app with React Router for public, protected, and admin routes; React Context for auth and theme; Axios services for clean API communication; and Tailwind/CSS variables for a polished responsive UI with dark and light modes. The dashboard handles donations, subscription status, draw history, winnings, and proof upload, while the admin panel supports analytics, user management, charity CRUD, draw publishing, and winner verification. The app is also configured for Vercel deployment with production API environment variables and SPA route rewrites.

