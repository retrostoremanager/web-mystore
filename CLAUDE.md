# web-mystore — React Frontend

## Efficiency Rules (READ FIRST)

**Follow these rules to avoid hitting spending caps.**

1. **Never run Glob, LS, or Find.** The full file map is below — use it.
2. **Read each file at most once per session.** You have it in context after reading.
3. **For new features:** read the most closely related existing page component and its API service file. That's usually enough.
4. **Before your first tool call:** write a one-sentence plan: which files you'll read and why.
5. **If the task requires >5 files read:** stop and reconsider — you're over-exploring.

## Complete File Map

### src/
- `App.jsx` — router setup, all routes defined here
- `main.jsx` — entry point, Redux Provider, MUI ThemeProvider
- `config.js` — API base URL and other env config
- `index.css` — global base styles (minimal — MUI handles most)

### src/components/ — Pages & UI
- `LandingPage.jsx` — public marketing landing page
- `CompanyLandingPage.jsx` — company-specific landing (after login)
- `CompanyLoginPage.jsx` — login form
- `SignUpForm.jsx` — company registration/signup
- `AccountWizard.jsx` — post-signup onboarding wizard
- `AuthRedirect.jsx` — handles auth redirects
- `SetPasswordPage.jsx` — set password (invite flow)
- `ForgotPasswordPage.jsx` — forgot password
- `ResetPasswordPage.jsx` — reset password
- `VerifyEmailPage.jsx` — email verification
- `Dashboard.jsx` — main dashboard (inventory summary, recent sales)
- `DashboardPreview.jsx` — preview/demo dashboard
- `InventoryPage.jsx` — inventory list and management
- `InventoryItemDetail.jsx` — single inventory item detail
- `AddInventoryItem.jsx` — add inventory item form
- `BulkImportInventory.jsx` — CSV bulk import
- `CustomersPage.jsx` — customer list and management
- `CompanyCustomerPage.jsx` — customer-facing company page
- `SalesHistoryPage.jsx` — sales transaction history
- `CheckoutPage.jsx` — new sale / checkout flow
- `TradeInPage.jsx` — trade-in transaction flow
- `UsersPage.jsx` — user management (employees)
- `RolesPage.jsx` — role management
- `CompanyProfilePage.jsx` — company settings/profile
- `BillingSettingsPage.jsx` — subscription, payment methods, invoices
- `SubscriptionPage.jsx` — subscription plan selection/upgrade
- `PaymentMethodForm.jsx` — Stripe payment method form
- `AccountSuspendedPage.jsx` — shown when account is suspended
- `TrialExpiredPrompt.jsx` — modal/prompt for expired trials
- `PermissionRoute.jsx` — RBAC route guard component
- `ErrorBoundary.jsx` — React error boundary
- `PrivacyPolicyPage.jsx` — static privacy policy
- `TermsOfServicePage.jsx` — static terms of service

### src/services/ — API Calls
- `billingApi.js` — billing endpoints (subscription, invoices, payment methods)
- `customersApi.js` — customer CRUD
- `gameApi.js` — game catalog search
- `inventoryApi.js` — inventory CRUD (also in src/components/)
- `permissionsApi.js` — RBAC permission queries
- `profileApi.js` — company profile get/update
- `rolesApi.js` — role CRUD
- `salesApi.js` — sales transactions
- `usersApi.js` — user management

### src/store/ — Redux State
- `store.js` — Redux store configuration and slices

### src/contexts/ — React Contexts
- `AuthContext.jsx` — auth state (JWT token, user info, company ID)
- `FormattingContext.jsx` — currency/date formatting helpers
- `PermissionsContext.jsx` — RBAC permissions cache
- `TrialStatusContext.jsx` — trial status polling/state

### src/utils/ — Utilities
(check directory if needed — small helper files)

### src/test/ — Test utilities
- Vitest + Testing Library setup

## Build & Test

```bash
npm install
npm run build       # Vite production build
npm test -- --run   # Vitest (non-interactive)
npm run lint        # ESLint
```

## Tech Stack

- **React 18** + JSX (not TypeScript)
- **MUI v5** (`@mui/material`, `@mui/icons-material`) — use MUI components for all UI
- **Redux Toolkit** — global state (auth, permissions)
- **React Router v7** — client-side routing
- **Vite** — build tool
- **Vitest** + Testing Library — unit tests

## Coding Standards

### MUI Usage
- All UI must use MUI v5 components — no raw `<div>`, `<button>`, `<input>` for interactive elements
- Use `sx` prop for one-off styles, theme tokens (`theme.palette.*`, `theme.spacing()`) for anything reused
- DataGrid: use `@mui/x-data-grid` (community) for all list/table views
- Loading: `<Skeleton>` for content loading, `<CircularProgress>` for button/action loading
- Errors: `<Snackbar>` + `<Alert severity="error">` for API errors
- Empty states: always show a message (never an empty white box)
- Dialogs: use `<Dialog>` for forms/confirmations, `<Drawer>` for detail panels

### API Calls
- All API calls go through service files in `src/services/`
- Use `async/await` with try/catch
- Pass `companyId` from `AuthContext` to every API call that needs it
- Never call `fetch` directly from a component — always use a service function

### State
- Global state (auth, permissions): Redux via `store.js`
- Local UI state (open/close, form values): `useState`
- Server data: call API in `useEffect`, store locally with `useState`

### Routing
- All routes defined in `App.jsx`
- Protected routes use `<PermissionRoute>`
- New pages: add route in `App.jsx` and link from appropriate nav

## When Opening PRs

Target the `development` branch. PR body must reference the orchestrator issue: `Closes retrostoremanager/orchestrator-mystore#N`

## Code Review Mode

When your session starts with "Code review mode. Review PR #N", follow the same steps as fn-mystore: check diff, classify issues (MAJOR/MODERATE/MINOR), then run the approve or request-changes commands.
