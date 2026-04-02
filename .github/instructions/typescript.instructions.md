---
applyTo: "**/*.ts,**/*.tsx"
---

# TypeScript Rules

## Strict Mode
`tsconfig.json` has `"strict": true`. This is non-negotiable. Never disable or work around strict checks.

## `interface` vs `type`
- `interface` — component props, plain objects that may be extended elsewhere.
- `type` — unions, intersections, discriminated union state shapes.

## Event Handler Types
Always type event parameters explicitly — never infer or omit:
- `React.ChangeEvent<HTMLInputElement>`
- `React.MouseEvent<HTMLButtonElement>`
- `React.FormEvent<HTMLFormElement>`

## Hook Return Types
Define a named interface for every custom hook's return value (e.g., `interface UseCounterReturn`) and annotate the hook with it explicitly.

## No `any`
`any` is never acceptable. Use `unknown` when the type is genuinely uncertain, then narrow with a type guard before use.

## Utility Types
Use built-in utility types to stay DRY: `Partial<T>`, `Required<T>`, `Pick<T, K>`, `Omit<T, K>`, `Record<K, V>`.

## Discriminated Unions for State
Prefer discriminated unions over boolean flag combinations:
```ts
type FetchState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string }
```

## Generics
Use generics for reusable components and hooks that need to work across different data shapes.

## Type-Only Imports
Use `import type { Foo }` whenever importing only a type. This prevents accidental value imports and helps tree-shaking.

## No Type Assertions
Avoid `as SomeType` casts. Write a type guard (`instanceof`, `typeof`, or a custom predicate) instead.

## Naming Conventions
- Interfaces and type aliases: PascalCase (`UserProfile`, `FetchState`).
- Constants: SCREAMING_SNAKE_CASE (`MAX_RETRIES`, `API_BASE_URL`).
