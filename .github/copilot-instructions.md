# Lab — Copilot Instructions

**Lab** is a prototype gallery: a home page shows cards for mini web apps; each app lives at `/apps/<name>`.

**Stack**: Vite 8 · React 19 · TypeScript 5.9 (strict) · Tailwind CSS v4 · React Router v7

## Non-Negotiables

- Named exports only (exception: top-level `App` default export)
- No `any` — use `unknown`, generics, or proper types
- Functional components only — no class components
- Every component root must have `data-testid`
- Co-locate app code in `src/apps/<name>/` — do not bleed into shared dirs
- Promote to shared (`components/`, `hooks/`, `utils/`) only when 2+ real consumers exist

## Principles

**SRP** — one purpose per file/function. **DRY** — extract only after 2+ real duplicates exist. **KISS** — readable over clever. **YAGNI** — build for today's requirements only.

## Detailed Standards

| Instruction file | Covers |
|---|---|
| `react-components.instructions.md` | Component structure, props, JSX |
| `typescript.instructions.md` | Types, interfaces, generics, strict mode |
| `hooks.instructions.md` | Custom hook patterns and promotion rules |
| `styling.instructions.md` | Tailwind v4 usage and class conventions |
| `apps.instructions.md` | Adding apps, registry entries, routing |
| `testing.instructions.md` | Vitest, RTL, Playwright conventions |

Full reference: `.github/CONVENTIONS.md` · Project map & workflows: `AGENTS.md`
