# Preproute Test Manager

A 5-page test management admin application for creating, editing, and publishing tests with MCQ questions.

## Setup

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
cd preproute-test-manager
npm install
```

### Environment

**Production / build** — `.env`:

```env
VITE_API_BASE_URL=https://admin-moderator-backend-staging.up.railway.app/api
```

**Development (avoids CORS)** — `.env.development` (included):

```env
VITE_API_BASE_URL=/api
```

Vite proxies `/api` to the staging backend. In dev, the app always calls `http://localhost:<port>/api/...` (works on 5173, 5174, etc.).

**If you get 404 on `/api/...`:** stop all running `npm run dev` terminals, then start only one:

```bash
npm run dev
```

A second Vite instance on another port may be an old process without the proxy.

### Run development server

```bash
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`).

### Build for production

```bash
npm run build
npm run preview
```

## Test credentials

| Field    | Value         |
|----------|---------------|
| User ID  | `vedant-admin` |
| Password | `vedant123`   |

## Application flow

1. **Login** — Authenticates via `/auth/login`, stores JWT in `localStorage` and Redux.
2. **Dashboard** — Lists all tests with edit/delete actions.
3. **Create/Edit Test** — Test metadata, subjects, topics, sub-topics, marking scheme.
4. **Add Questions** — Build MCQ questions locally, bulk save via API.
5. **Preview & Publish** — Review test and questions, publish with `status: live`.

## Draft workflow

| Step | What happens |
|------|----------------|
| **Save as Draft** | Saves test details with status `draft`. You stay on the form. |
| **Next: Add Questions** | Saves as `draft`, then opens the questions page. |
| **Save & Continue** | Requires question count = planned total questions; updates total marks as `correct_marks × questions`. |
| **Publish Test** | On Preview only — sets status to `live`. |

## Marking validation

- **Total marks** = Correct marks × Total questions (auto-calculated on the form).
- **Wrong marks** must be ≤ 0 (e.g. `-1` for negative marking).
- **Unattempt marks** must be ≤ 0.

## Tech stack

| Layer        | Choice                                      |
|-------------|-----------------------------------------------|
| Framework   | React 18 + TypeScript (Vite)                  |
| State       | Redux Toolkit + RTK Query                     |
| Routing     | React Router v6                               |
| Styling     | Tailwind CSS                                  |
| UI          | shadcn/ui (Radix primitives)                  |
| Forms       | React Hook Form + Zod                         |
| HTTP        | Axios (JWT interceptors) + RTK Query base     |
| Dates       | dayjs                                         |
| Toasts      | Sonner                                        |

## Tech decisions

- **RTK Query with Axios base query** — Reuses the shared `axiosClient` so JWT attachment and 401 handling stay centralized while still getting RTK caching and hooks.
- **Redux wizard slice** — `testsSlice` holds `currentTestId`, questions, and step so navigation between create → questions → preview stays consistent.
- **API type mapping** — The backend uses `chapterwise` / `pyq` / `mock` test types; the UI uses `practice` / `exam` / `mock` per spec, mapped in `utils/helpers.ts`.
- **All UI strings in `constants/messages.ts`** — No hardcoded copy in components.
- **Subject/topic resolution** — Edit mode resolves subject names and topic names back to UUIDs for form controls.

## Project structure

```
src/
├── api/           # Axios client + RTK base query
├── app/           # Redux store
├── components/    # Shared UI + shadcn re-exports
├── constants/     # MESSAGES
├── features/      # auth, tests, questions
├── hooks/         # useAuth
├── layouts/       # AppLayout
├── routes/        # ProtectedRoute
├── types/         # TypeScript interfaces
├── validations/   # Zod schemas
└── utils/         # Helpers & API mappers
```
