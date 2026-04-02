---
name: scaffold
description: 'Scaffold a new mini-app in the Lab platform. Use when the user asks to "create a new app", "add an app", "scaffold", or describes a new app idea they want added to the gallery.'
---

# Lab Scaffold Skill

A step-by-step procedure for creating fully wired, convention-compliant Lab mini-apps. Follow every step in order. Do not skip steps.

## Step 1 — Gather Requirements (always do this first)

Before writing any code, confirm these three things with the user:

1. **App name** — must be kebab-case (e.g., `color-picker`, `todo-list`, `word-counter`)
2. **One-line description** — shown on the home page card
3. **Emoji** — displayed on the card and as a visual accent in the app

Do not proceed until you have all three.

---

## Step 2 — Create the Component File

**Path**: `src/apps/<name>/<Name>App.tsx`

Rules:
- Named export only — no default export
- Root element must have `data-testid="<name>-app"`
- Wrapper: `<div className="min-h-screen bg-zinc-900 text-white p-8" data-testid="<name>-app">`
- Include a back nav using React Router's `<Link>`:
  ```tsx
  import { Link } from 'react-router-dom'
  // ...
  <Link to="/" className="text-zinc-400 hover:text-white text-sm mb-6 inline-block">
    ← Back to Lab
  </Link>
  ```
- Define a TypeScript `Props` interface above the component if the component accepts props
- Keep components focused and under ~100 lines; extract logic to a co-located hook if needed
- Use Tailwind for all styling — no inline styles, no CSS modules

**Minimal template**:
```tsx
import { Link } from 'react-router-dom'

interface Props {}

export function <Name>App(_props: Props) {
  return (
    <div className="min-h-screen bg-zinc-900 text-white p-8" data-testid="<name>-app">
      <Link to="/" className="text-zinc-400 hover:text-white text-sm mb-6 inline-block">
        ← Back to Lab
      </Link>
      <h1 className="text-3xl font-bold mb-2"><emoji> <Title></h1>
      <p className="text-zinc-400 mb-8"><description></p>
      {/* App content here */}
    </div>
  )
}
```

---

## Step 3 — Co-located Hook (when needed)

Create `src/apps/<name>/use<Name>.ts` if the app has non-trivial logic (state machines, derived state, API calls, timers, etc.).

Rules:
- Named export only
- Define and export a typed return interface:
  ```ts
  export interface Use<Name>Return {
    // all returned values and callbacks typed explicitly
  }
  ```
- Wrap all returned callbacks in `useCallback`
- Clean up subscriptions, timers, and fetch calls in `useEffect` cleanup functions
- Do not mix unrelated concerns in a single hook (SRP)

---

## Step 3.5 — Co-located Test File (required for every app)

**Path**: `src/apps/<name>/<Name>App.test.tsx`

Every scaffolded app must ship with a test file. Create it immediately after the component file.

Rules:
- Import `MemoryRouter` from `react-router-dom` — the component uses `<Link>`, so it needs a router in tests
- Use `userEvent.setup()` for all interactions — never `fireEvent`
- Follow AAA structure with a blank line between each phase
- Query by role or text first; fall back to `getByTestId` only for non-semantic elements

**Required test cases** (minimum three):

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import { <Name>App } from './<Name>App'

const renderApp = () =>
  render(
    <MemoryRouter>
      <<Name>App />
    </MemoryRouter>
  )

describe('<Name>App', () => {
  it('renders without crashing', () => {
    // Arrange + Act
    renderApp()

    // Assert
    expect(screen.getByTestId('<name>-app')).toBeInTheDocument()
  })

  it('displays the back navigation link', () => {
    // Arrange
    renderApp()

    // Assert
    expect(screen.getByRole('link', { name: /back to lab/i })).toBeInTheDocument()
  })

  it('<describes the core interaction>', async () => {
    // Arrange
    const user = userEvent.setup()
    renderApp()

    // Act
    await user.click(screen.getByRole('button', { name: /<action>/i }))

    // Assert
    expect(screen.getBy...(<expected result>)).toBeInTheDocument()
  })
})
```

Replace the third test with the most meaningful interaction for this specific app. Add additional tests for any conditional branches (loading, error, empty states).

---

## Step 4 — Register in `src/data/apps.ts`

Add an entry to the apps array. The `component` field is a `React.lazy()` call — this is what wires the route automatically. **Do not touch `App.tsx`.**

```ts
import { lazy } from 'react'

{
  id: '<name>',
  title: '<Title>',
  description: '<one-line description>',
  emoji: '<emoji>',
  component: lazy(() =>
    import('../apps/<name>/<Name>App').then((m) => ({ default: m.<Name>App }))
  ),
}
```

Read the existing file first to match the import style and append in the correct location.

---

## Step 5 — Verify

After all files are created:
1. Confirm `src/data/apps.ts` contains the new entry with a `component: lazy(...)` field
2. Confirm the route `/apps/<name>` works — it is auto-generated from the registry
3. Confirm the component file exists with the correct `data-testid`
4. Confirm the test file exists at `src/apps/<name>/<Name>App.test.tsx` with at least 3 tests
5. Report the full list of files created/modified and the URL path (`/apps/<name>`) the user can navigate to

---

## Conventions Cheatsheet

| Rule | Correct | Wrong |
|------|---------|-------|
| Exports | `export function FooApp` | `export default function FooApp` |
| Types | Always typed, never `any` | `const x: any = ...` |
| Navigation | `<Link to="/">` | `<a href="/">` |
| Styling | Tailwind classes | Inline styles |
| testid | `data-testid="foo-app"` on root | Missing or on wrong element |
| Cross-app imports | Never import from another app's folder | `import { x } from '../other-app/...'` |
