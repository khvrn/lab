# Testing Standards

> Research sources: [Kent C. Dodds — Testing React](https://kentcdodds.com/talks/testing-react) ·
> [Testing Library docs](https://testing-library.com/docs/react-testing-library/intro/) ·
> [Playwright Best Practices](https://playwright.dev/docs/best-practices) ·
> [Vitest + RTL Guide — Makers' Den](https://makersden.io/blog/guide-to-react-testing-library-vitest) ·
> [Frontend Testing Strategy](https://feature-sliced.design/blog/frontend-testing-strategy)

---

## Core Philosophy

> "The more your tests resemble the way your software is used, the more confidence they can give you."
> — Kent C. Dodds

Tests verify **user-visible behavior** — not implementation details. A test that breaks when you rename internal state but the UI still works is a liability. A test that catches a broken button is an asset.

---

## Testing Pyramid

Distribution for a React SPA backed by industry research:

| Layer | What it tests | Tools | Target |
|---|---|---|---|
| **Unit** | Pure functions, hooks in isolation | Vitest | ~70% |
| **Component / Integration** | Component output + user interactions, multi-component flows | Vitest + RTL | ~25% |
| **E2E** | Critical user journeys across multiple pages | Playwright | ~5% |

**Rule**: Never write an E2E test for something a component test already covers. E2E tests are slow and flaky — spend them only on flows that require a real browser navigating real routes.

---

---

## Part 1 — Vitest + React Testing Library

### Query Priority

Always query in this order. Stop at the first that works. This order comes directly from the [Testing Library query priority docs](https://testing-library.com/docs/queries/about#priority):

1. `getByRole` — semantic, accessible, most preferred
2. `getByLabelText` — for form inputs with a `<label>`
3. `getByPlaceholderText` — for unlabeled inputs
4. `getByText` — for non-interactive text content
5. `getByDisplayValue` — for current value of a form field
6. `getByAltText` — for images
7. `getByTitle` — last semantic resort
8. **`getByTestId` — escape hatch only** — use only when no semantic query exists

If you reach for `getByTestId` on a `<button>` or `<input>`, stop. That element is missing an accessible role or label — fix the component, not the test.

---

### userEvent vs fireEvent

Always use `userEvent`. It simulates the full event sequence a real user triggers (pointerover → mousedown → focus → input → keyup → click). `fireEvent` fires a single synthetic event and misses real-world edge cases.

```ts
// ✅ correct — mirrors real browser behaviour
const user = userEvent.setup()
await user.click(screen.getByRole('button', { name: 'Submit' }))

// ❌ wrong — skips pointer events, focus, etc.
fireEvent.click(screen.getByRole('button', { name: 'Submit' }))
```

Always call `userEvent.setup()` at the top of each test (or in a `beforeEach`) rather than calling `userEvent.click()` directly — the setup instance manages pointer state across sequential interactions.

---

### Arrange / Act / Assert

Every test follows AAA with a blank line separating each phase:

```ts
it('increments count when + is clicked', async () => {
  // Arrange
  const user = userEvent.setup()
  render(<CounterApp />)

  // Act
  await user.click(screen.getByTestId('increment'))

  // Assert
  expect(screen.getByText('1')).toBeInTheDocument()
})
```

---

### One Behavior Per Test

Each `it` block proves exactly one thing. If you need "and" in the description, split it. Single-behavior tests produce diagnostic failures — one test breaks for one reason.

```ts
// ✅ correct — separate concerns
it('renders the app title', () => { ... })
it('links to the app path', () => { ... })

// ❌ wrong — two concerns, one test
it('renders the title and links correctly', () => { ... })
```

---

### What to Cover at Each Layer

**Unit — pure functions and hooks**
- All happy-path return values
- All meaningful edge cases (empty, null, zero, max boundary)
- Each state transition in a `useReducer` or multi-`useState` hook
- Each callback returned by the hook

**Component**
- Renders without crashing (smoke test)
- Correct output given default props
- Each user interaction → expected DOM change
- Each conditional render branch (loading, error, empty, populated)
- `data-testid` on root element is present

**Integration**
- Multi-component flows (e.g., form submit → success message)
- Context provider + consumer interaction
- Hook + component wired together end-to-end

---

### Mocking Rules

- Mock **only at the boundary** — network, timers, external modules
- Never mock the component or hook under test — that invalidates the test
- Use `vi.fn()` for callback props and injected dependencies
- Use `vi.spyOn()` to observe calls on real objects without replacing them
- Use [MSW (Mock Service Worker)](https://mswjs.io/) for API mocking at the integration layer — never mock `fetch` or `axios` directly
- Restore mocks after each test with `vi.restoreAllMocks()` in `afterEach`

---

### Assertions — Use jest-dom Matchers

Prefer specific `@testing-library/jest-dom` matchers over generic ones. They produce readable failure output:

```ts
// ✅ readable failure messages
expect(el).toBeInTheDocument()
expect(el).toBeVisible()
expect(el).toBeDisabled()
expect(el).toHaveTextContent('Submit')
expect(el).toHaveAttribute('href', '/apps/counter')
expect(input).toHaveValue('hello')

// ❌ opaque — tells you nothing on failure
expect(el).toBeTruthy()
```

---

### Anti-Patterns — Vitest + RTL

| Anti-pattern | Why it's wrong | Fix |
|---|---|---|
| `fireEvent` instead of `userEvent` | Misses real browser event sequence | Use `userEvent.setup()` |
| `getByTestId` on a `<button>` or `<input>` | Element is missing accessible role/label | Add `aria-label` or `<label>`, query by role |
| Asserting on `className` | Tests style, not behavior | Test what the user sees |
| Snapshot tests on large trees | Breaks on every refactor, encodes nothing meaningful | Assert on specific elements |
| Testing internal state directly | Couples test to implementation | Test the DOM output |
| `waitForTimeout` / `setTimeout` in tests | Race condition | Use `waitFor(() => expect(...))` |
| One mega-test proving 10 behaviors | One failure hides others | Split into focused `it` blocks |
| Mocking the module under test | Invalidates the test entirely | Only mock boundaries |

---

---

## Part 2 — Playwright E2E

### What Belongs in E2E

E2E tests are expensive to run and maintain. Reserve them for:

- **Critical navigation flows** — home → app → back to home
- **Multi-step user journeys** — interactions that span multiple pages or require real routing
- **Core feature interactions** — the primary action of each app (e.g., counter increments)

Do not write E2E tests for things already covered by component tests.

---

### Locator Priority

Follow the same semantic-first priority as RTL. From the [Playwright best practices docs](https://playwright.dev/docs/best-practices):

1. `page.getByRole()` — preferred; reflects accessible semantics
2. `page.getByLabel()` — for form fields
3. `page.getByText()` — for visible text content
4. `page.getByPlaceholder()` — for inputs without a label
5. `page.getByTestId()` — acceptable for non-semantic elements (using `data-testid`)
6. CSS selectors / XPath — **never** — brittle, breaks on structural changes

---

### Auto-Waiting — No Manual Waits

Playwright auto-waits for elements to be actionable before interacting and for assertions to become true. Never use explicit waits:

```ts
// ✅ correct — Playwright waits automatically
await expect(page.getByText('Saved')).toBeVisible()

// ❌ wrong — hardcoded wait is a race condition
await page.waitForTimeout(1000)
```

---

### Test Isolation

Every test must be fully independent:
- Each test gets its own browser context (configured in `playwright.config.ts`)
- Never depend on state left by a previous test
- Never share user accounts or login sessions across tests without explicit fixtures
- Clean up any data created during the test

---

### Focus on Outcomes, Not Structure

Test what the user experiences, not the DOM structure:

```ts
// ✅ correct — asserts user-visible outcome
await expect(page.getByText('1')).toBeVisible()

// ❌ wrong — asserts DOM structure detail
await expect(page.locator('div.counter-value')).toHaveText('1')
```

---

### Traces and Debugging

`playwright.config.ts` is configured with `trace: 'on-first-retry'`. On failure:
- The trace viewer shows every action, network request, and DOM snapshot
- Run `npx playwright show-trace trace.zip` to inspect locally
- Screenshots and video are available for flaky test investigation

---

### Anti-Patterns — Playwright

| Anti-pattern | Why it's wrong | Fix |
|---|---|---|
| `waitForTimeout` | Hardcoded wait — flaky by definition | Use `expect(locator).toBeVisible()` |
| CSS/XPath selectors | Break on structural refactors | Use `getByRole`, `getByText`, `getByTestId` |
| Shared state between tests | Tests fail in unpredictable order | Use isolated browser contexts per test |
| E2E test for unit-level behavior | Slow, flaky, duplicate coverage | Write a component test instead |
| Asserting on dynamic class names | Breaks on style changes | Assert on text content or ARIA state |
| Testing third-party pages | Outside your control | Mock the boundary in component tests |

---

## File Conventions

| File type | Location | Naming |
|---|---|---|
| Component test | Co-located with component | `Foo.test.tsx` |
| Hook / util test | Co-located with hook | `useCounter.test.ts` |
| E2E spec | `e2e/` at repo root | `counter.spec.ts` |

`describe` blocks use the component or feature name. `it` descriptions use a present-tense verb phrase:
- ✅ `'renders the app title'`
- ✅ `'increments count when + is clicked'`
- ✅ `'shows error message when fetch fails'`
- ❌ `'test counter'`
- ❌ `'it should work'`
