---
applyTo: "**/*.test.ts,**/*.test.tsx,**/*.spec.ts,**/*.spec.tsx"
---

# Testing Rules

## Test Runner
- **Unit / component**: Vitest + React Testing Library (`npm test`)
- **E2E**: Playwright (`npm run test:e2e`)

## File Placement
- Unit and component tests: co-locate next to the file under test (`Foo.tsx` → `Foo.test.tsx`)
- E2E tests: live in `e2e/` at the repo root (`e2e/*.spec.ts`)

## What to Test
- **Unit**: pure functions, hooks, derived state logic
- **Component**: renders correct output, responds to user events, matches `data-testid` contract
- **E2E**: critical user flows end-to-end (navigation, core feature interactions)

## React Testing Library
- Query by role first (`getByRole`), then label, then `getByTestId` as last resort
- Use `userEvent` (not `fireEvent`) for simulating user interactions — it's closer to real browser behavior
- Never test implementation details (internal state, private methods) — test behavior

## Assertions
- Prefer `toBeInTheDocument`, `toBeVisible`, `toHaveAttribute`, `toHaveTextContent` from `@testing-library/jest-dom`
- One logical assertion per `it` block — split into separate tests if testing multiple behaviors

## Test Structure
```ts
describe('ComponentName', () => {
  it('does X when Y', async () => {
    // Arrange
    render(<Component />)
    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }))
    // Assert
    expect(screen.getByText('Done')).toBeInTheDocument()
  })
})
```

## Mocking
- Mock only at the boundary (API calls, timers, external modules) — never mock the component under test
- Use `vi.fn()` for function mocks, `vi.spyOn()` for spies

## Coverage
- Every component must have at minimum: a render test, a user interaction test, and a `data-testid` assertion
- Every hook must have: tests for each state transition and returned callback

## Naming
- Test files: `<Name>.test.tsx` for components, `<name>.test.ts` for utils/hooks
- E2E files: `<feature>.spec.ts`
- `it` descriptions: start with a verb in third-person — "renders X", "increments count", "shows error when..."
