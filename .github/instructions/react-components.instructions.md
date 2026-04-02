---
applyTo: src/**/*.tsx
---

# React Component Rules

## Exports
- **Named exports only.** Never use `export default` on components. Exceptions: `App.tsx` and `main.tsx`.

## Props Interface
- Define as `interface <Name>Props` immediately above the component function.
- Use `interface` for props (allows `extends`). Use `type` for union state shapes.

## Component Anatomy Order
Always write component internals in this order — no exceptions:
1. Hooks (`useState`, `useEffect`, custom hooks)
2. Derived state / computed values
3. Event handlers (prefixed `handle`)
4. Early returns (loading / error / empty states)
5. JSX return

## Naming
- Boolean props must be prefixed: `isLoading`, `hasError`, `canSubmit`.
- Event handlers must be prefixed `handle`: `handleClick`, `handleSubmit`, `handleChange`.

## Testing
- Add `data-testid` to the root element of every component.
- Pattern: `data-testid="component-name"` or `data-testid="component-name-{id}"` for list items.

## Children
- Always type children as `React.ReactNode`. Never use `ReactElement` or `JSX.Element`.

## Size
- If a component exceeds ~100 lines it is doing too much. Extract sub-components or custom hooks.

## Memoization
- Do **not** apply `React.memo`, `useMemo`, or `useCallback` speculatively.
- Add them only after profiling confirms a measurable render bottleneck.

## Architecture
- Functional components only. No class components.
- Prefer composition: extend behaviour via props, children, or render props rather than forking components.

## Navigation
- Every full app page must include `<Link to="/">← Back to Lab</Link>` near the top of the rendered output.
