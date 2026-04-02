# AGENTS.md — Lab Project Guide

> Primary reference for GitHub Copilot agents. Read alongside `.github/copilot-instructions.md`.

---

## 1. Project Identity

**Lab** is a prototype gallery platform. The home page (`/`) displays a card grid — one card per mini web app. Each app is self-contained and lives at `/apps/<name>`. The goal is a fast, low-friction environment for building and showcasing small, focused web experiments.

---

## 2. Stack & Tooling

| Layer | Technology | Version |
|---|---|---|
| Build | Vite | 8.x |
| UI | React | 19.x |
| Language | TypeScript (strict) | ~5.9 |
| Styling | Tailwind CSS | v4 |
| Routing | React Router | v7 |
| Linting | ESLint + typescript-eslint | 9.x / 8.x |

**Key commands**:

```bash
npm run dev       # start dev server
npm run build     # tsc + vite build
npm run lint      # eslint check
npm run preview   # preview production build
```

---

## 3. Directory Map

```
src/
├── App.tsx              # Root router — defines all top-level routes
├── main.tsx             # React entry point, mounts <App />
├── index.css            # Tailwind CSS v4 import
│
├── apps/                # One folder per mini-app
│   └── <name>/
│       └── <Name>App.tsx          # Root component for the app
│       └── use<Name>.ts           # App-specific hook (if needed)
│       └── <Name>.types.ts        # App-specific types (if needed)
│
├── components/          # Shared UI components (2+ consumers required)
│   └── AppCard.tsx      # Card shown on the gallery home page
│
├── data/                # Static data and registries
│   └── apps.ts          # AppMeta registry — source of truth for the gallery
│
├── hooks/               # Shared custom hooks (2+ consumers required)
├── layouts/             # Shared layout wrappers (2+ consumers required)
├── pages/               # Top-level route page components
│   └── Home.tsx         # Gallery home — renders the AppCard grid
│
├── types/               # Shared TypeScript interfaces and types
│   └── app.ts           # AppMeta interface
│
└── utils/               # Pure utility functions (2+ consumers required)
```

**Rule**: code stays inside `src/apps/<name>/` until it is needed by 2+ distinct consumers. Only then promote it to the appropriate shared directory.

---

## 4. How to Add a New App

Three steps, in order, every time:

1. **Create** `src/apps/<name>/<Name>App.tsx` — named export, `data-testid="<name>-app"` on root, `<Link to="/">← Back to Lab</Link>` near top, `min-h-screen bg-zinc-900` wrapper. Co-locate hooks, types, and tests in the same folder.
2. **Register** — add an `AppMeta` entry to `src/data/apps.ts` (`id`, `title`, `description`, `path`, `emoji`).
3. **Route** — add a `React.lazy()` import and `<Route>` inside `<Suspense>` in `src/App.tsx`.

Full templates: use the `scaffold` agent.

---

## 5. Shared vs App-Specific

| Location | Use when |
|---|---|
| `src/apps/<name>/` | Code used only by this one app |
| `src/components/` | UI component used by 2+ apps or pages |
| `src/hooks/` | Custom hook used by 2+ apps or components |
| `src/utils/` | Pure function used by 2+ files |
| `src/types/` | TypeScript type/interface used in 2+ files |
| `src/layouts/` | Layout wrapper used by 2+ pages |

**Promotion rule**: do not extract to shared until the second real consumer exists. YAGNI — don't generalize preemptively.

---

## 6. Key File Roles

| File | Role |
|---|---|
| `src/App.tsx` | Defines the `BrowserRouter` + `Routes` tree. Every new app gets a `<Route>` here. |
| `src/main.tsx` | Entry point — mounts `<App />` into the DOM. Rarely edited. |
| `src/data/apps.ts` | Source of truth for the gallery. The `Home` page reads this to render cards. |
| `src/types/app.ts` | Defines `AppMeta` — the shape of every registry entry. |
| `src/pages/Home.tsx` | Renders the gallery grid by mapping over `apps` from the registry. |
| `src/components/AppCard.tsx` | Displays a single app's card on the home page. |

---

## 7. Conventions Reference

| Resource | Purpose |
|---|---|
| `.github/CONVENTIONS.md` | Full coding standards — rationale, research, examples |
| `.github/TESTING.md` | Testing best practices — Vitest/RTL and Playwright |
| `.github/copilot-instructions.md` | Non-negotiables injected on every prompt |
| `.github/instructions/react-components.instructions.md` | Component structure, props, JSX patterns |
| `.github/instructions/typescript.instructions.md` | Types, interfaces, generics, strict mode |
| `.github/instructions/hooks.instructions.md` | Hook patterns and promotion rules |
| `.github/instructions/styling.instructions.md` | Tailwind v4 usage and class conventions |
| `.github/instructions/apps.instructions.md` | App pattern, registry, routing |
| `.github/instructions/testing.instructions.md` | Testing rules — query priority, userEvent, AAA |
