---
applyTo: "**/*.test.ts,**/*.test.tsx,**/*.spec.ts,**/*.spec.tsx"
---

# Testing Rules

> Full rationale, examples, and research citations: `.github/TESTING.md`

---

## File Placement

- Component / unit tests: co-locate next to the file under test (`Foo.tsx` → `Foo.test.tsx`)
- E2E specs: `e2e/<feature>.spec.ts` at repo root — never inside `src/`

---

## Query Priority — Always Use This Order

1. `getByRole` ← start here
2. `getByLabelText`
3. `getByPlaceholderText`
4. `getByText`
5. `getByDisplayValue`
6. `getByAltText`
7. `getByTitle`
8. `getByTestId` ← **escape hatch only**

If you reach for `getByTestId` on a `<button>` or `<input>`, stop — fix the component's accessible role/label instead.

---

## userEvent — Always Use Setup Instance

```ts
// ✅ correct
const user = userEvent.setup()
await user.click(screen.getByRole('button', { name: 'Increment' }))

// ❌ wrong — skips pointer/focus events
fireEvent.click(...)
```

---

## Test Structure — AAA with Blank Lines

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

## One Behavior Per Test

Each `it` proves exactly one outcome. If you need "and" in the description, split it.

---

## Coverage Requirements

**Unit (hooks, utils)**: happy path · edge cases (empty/null/boundary) · every state transition · every returned callback

**Component**: smoke render · default props output · every user interaction · every conditional branch (loading / error / empty / populated) · `data-testid` on root

**E2E**: critical navigation flows · core feature journeys — never duplicate component-level coverage

---

## Mocking

- Mock only at the boundary: network, timers, external modules
- Never mock the component or hook under test
- `vi.fn()` for callback props · `vi.spyOn()` to observe without replacing
- Use MSW for API mocking — never mock `fetch` directly
- `vi.restoreAllMocks()` in `afterEach`

---

## Assertions — Use jest-dom Matchers

```ts
expect(el).toBeInTheDocument()   // not toBeTruthy()
expect(el).toBeVisible()
expect(el).toBeDisabled()
expect(el).toHaveTextContent('Submit')
expect(el).toHaveAttribute('href', '/apps/counter')
expect(input).toHaveValue('hello')
```

---

## Playwright Rules

- Locators: `getByRole` → `getByText` → `getByTestId` — never CSS selectors or XPath
- No `waitForTimeout` — use `await expect(locator).toBeVisible()`
- Every test gets a clean browser context — never share state between tests
- Scope to critical journeys only — do not duplicate component test coverage

---

## Naming

| Thing | Convention | Example |
|---|---|---|
| `describe` | Component or feature name | `describe('AppCard', ...)` |
| `it` | Present-tense verb phrase | `'renders the app title'` |
| E2E spec | `e2e/<feature>.spec.ts` | `e2e/home.spec.ts` |

---

## Anti-Patterns

- `fireEvent` instead of `userEvent`
- `getByTestId` on interactive elements
- Snapshot tests on large trees
- Asserting on `className`
- `waitForTimeout` in any test
- Mocking the module under test
- Multiple behaviors in one `it` block

