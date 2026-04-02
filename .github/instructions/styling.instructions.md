---
applyTo: "src/**/*.tsx,src/**/*.css"
---

# Styling Rules

## Tailwind Only
Use Tailwind utility classes exclusively. No custom CSS class names, no inline `style` props, no CSS Modules.  
Exception: `index.css` is allowed for `@import "tailwindcss"` and `@layer` base/component overrides where class names are unavailable (e.g., prose content).

## Class Ordering Convention
Always write classes in this order (mirrors Tailwind's recommended grouping):
1. Layout (`flex`, `grid`, `block`, `hidden`)
2. Spacing (`p-`, `m-`, `gap-`)
3. Sizing (`w-`, `h-`, `min-h-`, `max-w-`)
4. Typography (`text-sm`, `font-medium`, `leading-`)
5. Color / background (`text-white`, `bg-zinc-800`)
6. Border / radius (`border`, `border-zinc-700`, `rounded-xl`)
7. Shadow (`shadow-md`)
8. Interaction / state (`hover:bg-zinc-700`, `transition-colors`, `cursor-pointer`)
9. Responsive variants (`sm:grid-cols-2`, `lg:grid-cols-3`)

## Mobile-First
Always style for the smallest viewport first, then scale up with `sm:`, `md:`, `lg:`. Never write desktop-first then override downward.

## Extract to Component, Not `@apply`
If the same 6+ classes appear in 3+ places, create a React component instead of reaching for `@apply`. Reserve `@apply` only for HTML you cannot attach `className` to.

## Design Tokens
Project-wide colors and spacing belong in `tailwind.config.ts` under `theme.extend`. Do not use arbitrary values (`[#abc123]`, `[32px]`) for any value used more than once.

## Dark Theme (Default)
The lab runs on a dark zinc palette. All new apps must follow it:
- Page background: `bg-zinc-900`
- Surface / card: `bg-zinc-800`
- Hover surface: `bg-zinc-700`
- Primary text: `text-white`
- Secondary / muted text: `text-zinc-400`

## Accessibility — Focus Styles
Use `focus-visible:` (never bare `focus:`) for keyboard focus indicators. Every interactive element must include:
```
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400
```

## Responsive Grid
Use `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` for app gallery and card layouts.
