---
applyTo: "src/**/use*.ts,src/**/use*.tsx"
---

# Custom Hook Rules

## Single Responsibility
One hook, one concern. If a hook is growing to handle multiple unrelated concerns, split it. No "god hooks".

## Naming
- Always prefix with `use`.
- Name describes **what** it manages, not **how**: `useCounter`, `useFetchUser`, `useLocalStorage`.

## Co-location
- If a hook is consumed by one app only, keep it inside `src/apps/<name>/`.
- Promote to `src/hooks/` only when two or more features consume it.

## Stable Return References
- Wrap all returned callbacks in `useCallback`.
- Memoize returned objects/arrays with `useMemo`.
- This prevents unnecessary re-renders in consumers.

## Effect Cleanup
Always return a cleanup function from `useEffect` when the effect creates a subscription, timer, or fetch:
- Use `AbortController` to cancel in-flight fetch requests.
- Clear timers with `clearTimeout` / `clearInterval`.
- Unsubscribe from event listeners or observables.

## No JSX in Hooks
Hooks return data, state, and callbacks — never JSX or React elements. If you need to render something, that is a component.

## Side Effects
Never run side effects directly in the hook body. All side effects belong inside `useEffect`.

## `useReducer` Over `useState`
When managing three or more related state values, or when state transitions are complex, use `useReducer` instead of multiple `useState` calls.

## Dependency Arrays
Dependency arrays must always be explicit and complete. Never use an empty `[]` for an effect that reads values from its closure. Follow the `react-hooks/exhaustive-deps` ESLint rule without disabling it.

## Typed Return Interface
Always define `interface Use<Name>Return { ... }` and annotate the hook's return type explicitly:
```ts
interface UseCounterReturn {
  count: number
  increment: () => void
  reset: () => void
}

export function useCounter(initial = 0): UseCounterReturn { ... }
```
