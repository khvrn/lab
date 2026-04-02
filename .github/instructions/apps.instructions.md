---
applyTo: src/apps/**
---

# App Conventions

## Folder Structure
Each app lives entirely inside `src/apps/<name>/`. The entry component is `<Name>App.tsx`. Co-locate everything the app needs here: hooks, types, sub-components, tests, utils. Do not scatter app files outside this folder.

## Registration — the only step required to wire a new app
Every app is registered **once** in `src/data/apps.ts`. This single entry drives both the gallery card **and** the route — you never touch `App.tsx`.

```ts
import { lazy } from 'react'

{
  id: 'todo-list',
  title: 'Todo List',
  description: 'Manage tasks with persistence.',
  emoji: '✅',
  component: lazy(() =>
    import('../apps/todo-list/TodoListApp').then((m) => ({ default: m.TodoListApp }))
  ),
}
```

> **`path` is derived automatically** as `/apps/${id}`. Do not add a `path` field.

An app that is not in this registry will not appear in the gallery and will have no route.

## Routing — automatic, never manual
`App.tsx` generates `<Route>` elements by mapping over the `apps` registry. Each `component` is already a `React.lazy()` call, wrapped in a single top-level `<Suspense>`. **Do not add routes to `App.tsx` manually — ever.**

## Root Component Rules
The root `<Name>App.tsx` component must:
- Use a **named export**: `export function TodoListApp()`
- Have `data-testid="<name>-app"` on the outermost element
- Include `<Link to="/">← Back to Lab</Link>` near the top of the rendered output
- Apply `min-h-screen bg-zinc-900` on the main wrapper to match the lab theme

## Self-Contained
Apps must not import from other apps (`src/apps/<other>/`). If logic is needed in two or more apps, promote it to:
- `src/hooks/` — shared custom hooks
- `src/components/` — shared UI components
- `src/utils/` — shared utility functions

## State Management
Prefer local component state (`useState`, `useReducer`). Only introduce a global state library if the app genuinely requires cross-component or persistent shared state that local state cannot serve.

## Naming Conventions
| Part | Convention | Example |
|---|---|---|
| Folder | kebab-case | `todo-list` |
| Root component file | PascalCase + `App` suffix | `TodoListApp.tsx` |
| `apps.ts` id | kebab-case | `'todo-list'` |
| Route path (auto-derived) | `/apps/<id>` | `/apps/todo-list` |
