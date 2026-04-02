---
applyTo: src/apps/**
---

# App Conventions

## Folder Structure
Each app lives entirely inside `src/apps/<name>/`. The entry component is `<Name>App.tsx`. Co-locate everything the app needs here: hooks, types, sub-components, utils. Do not scatter app files outside this folder.

## Registration
Every app must be registered in `src/data/apps.ts` by adding an `AppMeta` entry:
```ts
{ id: 'todo-list', title: 'Todo List', description: '...', path: '/apps/todo-list', emoji: '✅' }
```
An app that is not registered will not appear in the lab gallery.

## Routing
Every app must have a `<Route>` in `src/App.tsx`. Always use `React.lazy()` + `<Suspense>` for the route element — never static imports for app components.

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
| Route path | kebab-case | `/apps/todo-list` |
| `data.ts` id | kebab-case | `'todo-list'` |
