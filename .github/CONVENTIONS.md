# Lab — Coding Conventions & Best Practices

> Research-backed standards for this Vite + React + TypeScript + Tailwind CSS + React Router v6 project.
> Sources: Telerik, LogRocket, SitePoint, DEV Community, GreatFrontend, GeeksForGeeks, UXPin, rtCamp, and others (2024–2025).

---

## Table of Contents

1. [Engineering Principles](#1-engineering-principles)
2. [Project Structure](#2-project-structure)
3. [TypeScript](#3-typescript)
4. [React Components](#4-react-components)
5. [Custom Hooks](#5-custom-hooks)
6. [State Management](#6-state-management)
7. [React Router](#7-react-router)
8. [Tailwind CSS](#8-tailwind-css)
9. [Performance](#9-performance)
10. [Naming Conventions](#10-naming-conventions)
11. [Imports & Exports](#11-imports--exports)
12. [What to Avoid](#12-what-to-avoid)

---

## 1. Engineering Principles

These principles apply universally across the entire codebase.

### Single Responsibility (SRP)
Each file, component, and hook does **one thing**. A component renders UI. A hook manages logic. A utility function transforms data. Never mix these concerns in one place.

```tsx
// ❌ Bad — component fetches, transforms, and renders
function ProductList() {
  const [products, setProducts] = useState([])
  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(data => {
      setProducts(data.filter(p => p.active).sort(...))
    })
  }, [])
  return <ul>{products.map(...)}</ul>
}

// ✅ Good — concerns separated
function ProductList() {
  const { products } = useProducts() // hook owns fetching + filtering
  return <ul>{products.map(p => <ProductItem key={p.id} product={p} />)}</ul>
}
```

### Open/Closed (OCP)
Components should be **extensible via props** without modifying their internals.

```tsx
// ✅ Extend via props, not by forking the component
<Button variant="danger" onClick={handleDelete}>Delete</Button>
```

### Interface Segregation (ISP)
Pass only the props a component needs. Never pass a whole object when only one field is used.

```tsx
// ❌ Bad
<Avatar user={user} />  // Avatar only needs user.avatarUrl

// ✅ Good
<Avatar src={user.avatarUrl} alt={user.name} />
```

### Dependency Inversion (DIP)
Components should depend on **abstractions** (hooks, context, props), not on concrete implementations (direct API calls, hardcoded data).

### DRY — Don't Repeat Yourself
Extract duplication into a shared component or hook — but only when you have **two or more real instances** of the pattern. Don't abstract speculatively.

### KISS — Keep It Simple
Prefer simple, readable solutions over clever ones. If it needs a comment to be understood, it probably needs to be simplified.

### YAGNI — You Aren't Gonna Need It
Don't build for hypothetical future requirements. Build for what's needed today. Refactor when the new requirement actually arrives.

---

## 2. Project Structure

```
src/
├── apps/                  # Individual mini-apps (one folder per app)
│   └── counter/
│       ├── CounterApp.tsx # Root component, named after the app
│       └── useCounter.ts  # App-specific hook (co-located)
├── components/            # Shared, reusable UI components only
│   └── AppCard.tsx
├── data/                  # Static data, registries, constants
│   └── apps.ts
├── hooks/                 # Shared custom hooks (used across 2+ apps)
│   └── useLocalStorage.ts
├── layouts/               # Shared layout wrappers with <Outlet />
│   └── RootLayout.tsx
├── pages/                 # Top-level route pages
│   └── Home.tsx
├── types/                 # Shared TypeScript interfaces and types
│   └── app.ts
├── utils/                 # Pure utility functions (no React)
│   └── formatDate.ts
├── App.tsx                # Route definitions only
└── main.tsx               # Entry point only
```

### Rules
- **Co-locate** app-specific hooks, types, and sub-components inside `src/apps/<name>/`
- Only promote to `src/components/` or `src/hooks/` when used by **2+ apps**
- `App.tsx` contains only routing — no business logic, no UI
- `main.tsx` contains only the React root mount — nothing else

---

## 3. TypeScript

### Always enable strict mode
`tsconfig.json` must have `"strict": true`. Non-negotiable.

### Prefer `interface` for component props, `type` for unions/intersections

```ts
// Props → interface
interface ButtonProps {
  label: string
  onClick: () => void
  variant?: 'primary' | 'danger' | 'ghost'
}

// Union states → type
type FetchState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string }
```

### Type events explicitly

```ts
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { ... }
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => { ... }
```

### Type hook return values explicitly

```ts
interface UseCounterReturn {
  count: number
  increment: () => void
  decrement: () => void
  reset: () => void
}

function useCounter(initial = 0): UseCounterReturn { ... }
```

### Use utility types to stay DRY

```ts
type UserPreview = Pick<User, 'id' | 'name' | 'avatarUrl'>
type PartialSettings = Partial<Settings>
type PublicUser = Omit<User, 'passwordHash'>
```

### Never use `any`
Use `unknown` when the type truly isn't known, then narrow it with type guards.

```ts
// ❌
function parse(input: any) { ... }

// ✅
function parse(input: unknown): ParsedResult {
  if (typeof input !== 'string') throw new Error('Expected string')
  ...
}
```

---

## 4. React Components

### Always use functional components
Class components are legacy. All new components are functions.

### Named exports only — no default exports for components

```tsx
// ❌
export default function Button() { ... }

// ✅
export function Button({ label, onClick }: ButtonProps) { ... }
```

### Props interface directly above the component

```tsx
interface AppCardProps {
  app: AppMeta
  onClick?: () => void
}

export function AppCard({ app, onClick }: AppCardProps) {
  return (
    <div data-testid={`app-card-${app.id}`} onClick={onClick}>
      ...
    </div>
  )
}
```

### Always add `data-testid` to the root element
Makes testing predictable without coupling to class names or text content.

### Keep components small and focused
If a component exceeds ~100 lines, it's doing too much. Split it.

### Component anatomy (order matters)

```tsx
export function MyComponent({ prop1, prop2 }: MyComponentProps) {
  // 1. hooks
  // 2. derived state / computed values
  // 3. event handlers
  // 4. early returns (loading, error, empty states)
  // 5. JSX
}
```

### Children type

```ts
interface LayoutProps {
  children: React.ReactNode  // always ReactNode, not ReactElement or JSX.Element
}
```

---

## 5. Custom Hooks

### Naming: always prefix with `use`

```ts
useCounter, useLocalStorage, useFetchUser, useDebounce
```

### Single responsibility — one hook, one concern

```ts
// ❌ Bad — does too many things
function useAppState() { /* auth + theme + routing + data */ }

// ✅ Good
function useAuth() { ... }
function useTheme() { ... }
```

### Co-locate hooks with the feature they serve
Only move to `src/hooks/` when used by **2+ features**.

### Return stable references
Wrap returned callbacks in `useCallback` and objects in `useMemo` to prevent unnecessary consumer re-renders.

```ts
return {
  count,
  increment: useCallback(() => setCount(c => c + 1), []),
  reset: useCallback(() => setCount(0), []),
}
```

### Always clean up side effects

```ts
useEffect(() => {
  const controller = new AbortController()
  fetch(url, { signal: controller.signal }).then(...)
  return () => controller.abort()  // ← always clean up
}, [url])
```

### Never put JSX in a hook
Hooks return data and callbacks, never UI.

---

## 6. State Management

### Decision tree

```
Is the state used only by this component?
  → useState / useReducer (local)

Is the state shared across a few sibling components?
  → Lift state up to common parent

Is the state used across many unrelated components?
  → React Context (for low-frequency updates like theme/auth)
  → Zustand (for high-frequency or complex global state)

Is the state from the server (API data)?
  → TanStack Query (React Query) — do not put server state in useState
```

### Keep state as local as possible
Global state is expensive. Default to local, promote only when genuinely necessary.

### Prefer `useReducer` for complex state transitions

```ts
// When you have multiple related values that change together
const [state, dispatch] = useReducer(counterReducer, initialState)
```

---

## 7. React Router

### Centralize route definitions in `App.tsx`
All routes live in one place — the single source of truth.

### Use nested routes + `<Outlet />` for shared layouts

```tsx
<Route path="/" element={<RootLayout />}>
  <Route index element={<Home />} />
  <Route path="apps/counter" element={<CounterApp />} />
  <Route path="*" element={<NotFound />} />
</Route>
```

### Always include a 404 catch-all route

```tsx
<Route path="*" element={<NotFound />} />
```

### Use `React.lazy` + `Suspense` for route-level code splitting
Especially important as the number of apps grows.

```tsx
const CounterApp = React.lazy(() => import('./apps/counter/CounterApp'))

<Route
  path="apps/counter"
  element={
    <Suspense fallback={<PageLoader />}>
      <CounterApp />
    </Suspense>
  }
/>
```

### Use `useNavigate` for programmatic navigation, never `window.location`

```ts
const navigate = useNavigate()
navigate('/apps/counter')
```

### Use `<Link>` for all internal navigation, never `<a href>`

---

## 8. Tailwind CSS

### Class ordering convention (layout → spacing → size → typography → color → interaction)

```tsx
// ✅ Consistent, readable ordering
<div className="flex flex-col items-center gap-4 p-6 w-full text-lg font-semibold bg-zinc-800 rounded-xl hover:bg-zinc-700 transition-colors">
```

### Mobile-first responsive design

```tsx
// Start with mobile, add breakpoints for larger screens
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
```

### Extract repeated class combinations into components, not `@apply`
If you're copying the same 8 classes in 5 places, make a component. Reserve `@apply` only for truly unavoidable cases (e.g., markdown-rendered content you can't add classNames to).

```tsx
// ❌ Repeating classes everywhere
<button className="px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition">

// ✅ Extract to a component
<Button variant="secondary">
```

### Define design tokens in Tailwind config
Colors, spacing, font sizes, breakpoints — anything used project-wide belongs in `tailwind.config.ts`, not scattered as arbitrary values.

```ts
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      surface: '#18181b',       // zinc-900
      'surface-raised': '#27272a', // zinc-800
    }
  }
}
```

### Use `focus-visible` for keyboard accessibility

```tsx
<button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400">
```

---

## 9. Performance

### Profile before optimizing
Use React DevTools Profiler to confirm a bottleneck **before** applying memoization. Premature optimization is the root of unnecessary complexity.

### Memoization rules

| Hook | When to use |
|---|---|
| `useMemo` | Expensive computation with heavy input (sorting/filtering large lists) |
| `useCallback` | Stable function references passed to `React.memo` children |
| `React.memo` | Expensive presentational components with stable props |

```tsx
// ✅ Justified memoization
const sortedItems = useMemo(
  () => [...items].sort((a, b) => a.name.localeCompare(b.name)),
  [items]
)
```

### Lazy-load all route-level components

```tsx
const HeavyApp = React.lazy(() => import('./apps/heavy/HeavyApp'))
```

### Avoid layout thrash
Don't read and write DOM measurements in the same synchronous block.

### React 18 automatic batching
State updates inside async callbacks, timeouts, and event handlers are now automatically batched — no need to manually batch with `unstable_batchedUpdates`.

---

## 10. Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Components | PascalCase | `AppCard`, `CounterApp` |
| Hooks | camelCase, `use` prefix | `useCounter`, `useLocalStorage` |
| Utilities | camelCase | `formatDate`, `clamp` |
| Types / Interfaces | PascalCase | `AppMeta`, `FetchState<T>` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_RETRIES`, `DEFAULT_TIMEOUT` |
| Files (components) | PascalCase | `AppCard.tsx` |
| Files (hooks/utils) | camelCase | `useCounter.ts`, `formatDate.ts` |
| CSS class groups | Tailwind utilities only — no custom class names |
| Event handlers | `handle` prefix | `handleClick`, `handleSubmit` |
| Boolean props | `is`, `has`, `can` prefix | `isLoading`, `hasError`, `canEdit` |

---

## 11. Imports & Exports

### Named exports everywhere (no default exports except `App.tsx` and `main.tsx`)

```ts
// ✅
export function useCounter() { ... }
export function AppCard() { ... }
export type { AppMeta }
```

### Import order (enforced by ESLint if configured)
1. Node built-ins
2. External packages
3. Internal absolute paths (`@/...`)
4. Relative paths (`./`, `../`)
5. Type imports last

```ts
import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { AppCard } from '@/components/AppCard'
import { apps } from './data/apps'
import type { AppMeta } from '@/types/app'
```

### Use path aliases to avoid `../../../` hell
Configure `@/` in `vite.config.ts` and `tsconfig.json`:

```ts
// vite.config.ts
resolve: {
  alias: { '@': path.resolve(__dirname, './src') }
}
```

---

## 12. What to Avoid

| Anti-pattern | Why | Alternative |
|---|---|---|
| `any` type | Defeats TypeScript entirely | `unknown` + type guards |
| Default exports on components | Makes refactoring and imports inconsistent | Named exports |
| Inline logic in JSX | Hard to read and test | Extract to handlers or hooks |
| God components (>100 lines of JSX) | Impossible to maintain | Split into sub-components |
| God hooks (multiple unrelated concerns) | Hard to test, easy to break | One hook per concern |
| Prop drilling 3+ levels deep | Creates tight coupling | Lift state, use Context, or co-locate |
| `useEffect` for derived state | Causes extra renders | Compute inline or with `useMemo` |
| `window.location` for navigation | Bypasses React Router | `useNavigate()` |
| `<a href>` for internal links | Full page reload | `<Link to>` |
| Storing server data in `useState` | No caching, no deduplication | TanStack Query |
| Premature memoization | Adds complexity with no benefit | Profile first, optimize second |
| Speculative abstraction (YAGNI) | Over-engineered for zero benefit | Build for today's requirements |

---

## Sources

- [React Design Patterns 2025 — Telerik](https://www.telerik.com/blogs/react-design-patterns-best-practices)
- [React & TypeScript: 10 Patterns — LogRocket](https://blog.logrocket.com/react-typescript-10-patterns-writing-better-code/)
- [TypeScript for React Developers — GreatFrontend](https://www.greatfrontend.com/blog/typescript-for-react-developers)
- [React with TypeScript: Best Practices — SitePoint](https://www.sitepoint.com/react-with-typescript-best-practices/)
- [React Hooks Best Practices — rtCamp](https://rtcamp.com/handbook/react-best-practices/hooks/)
- [React Router Best Practices — CompileNRun](https://www.compilenrun.com/docs/framework/react/react-routing/react-router-best-practices/)
- [Tailwind CSS Best Practices — Wisp Blog](https://www.wisp.blog/blog/best-practices-for-using-tailwind-css-in-large-projects)
- [React Performance Optimization 2025 — DEV Community](https://dev.to/alex_bobes/react-performance-optimization-15-best-practices-for-2025-17l9)
- [SOLID, DRY, KISS, YAGNI in React — gperrucci.com](https://www.gperrucci.com/blog/engineering/solid-clean-yagni-kiss)
- [Best Folder Structure for React — DEV Community](https://dev.to/shubhadip_bhowmik/best-folder-structure-for-react-complex-projects-432p)
