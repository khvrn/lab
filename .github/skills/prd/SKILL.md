---
name: prd
description: 'Generate a Product Requirements Document for a new Lab mini-app. Use when the user says "write a PRD", "plan this app", "document requirements", or wants to formally spec out a feature before building.'
license: MIT
---

# Product Requirements Document (PRD)

> Adapted from [github/awesome-copilot — skills/prd](https://github.com/github/awesome-copilot/blob/main/skills/prd/SKILL.md) (MIT).

## Context

You are writing a PRD for a **Lab mini-app** — a small, self-contained web experiment built with Vite 8, React 19, TypeScript (strict), Tailwind CSS v4, and React Router v7. Apps live at `/apps/<name>`. Scope aggressively: a Lab app should be completable in a single focused session.

---

## Operational Workflow

### Phase 1 — Discovery (mandatory, never skip)

Ask the user the following before writing anything. Do not assume context.

- **Problem / motivation**: Why this app? What does it explore or demonstrate?
- **Core interaction**: What does the user *do* in the app? One sentence.
- **Success signal**: How do you know it worked? (observable behaviour, not feelings)
- **Out of scope**: What are we deliberately *not* building in v1?

Require at least two answered questions before proceeding to Phase 2.

### Phase 2 — Scoping

Synthesize answers. Define the minimal feature set. Propose the user flow in 3–5 steps. Name anything deferred to a later version.

### Phase 3 — Draft

Produce the full PRD using the schema below. Present it, then ask: *"Which section would you like to refine?"*

---

## PRD Schema

### 1. Executive Summary

- **Problem**: 1–2 sentences on the motivation.
- **Solution**: 1–2 sentences on what the app does.
- **Success Criteria**: 2–4 measurable, observable outcomes. No vague words ("fast", "nice", "simple").

```diff
# BAD
- The app should feel intuitive and be easy to use.

# GOOD
+ Counter updates in <16ms (single render cycle, confirmed by React DevTools).
+ All 4 Playwright E2E tests pass on first run.
```

### 2. User Experience

- **Persona**: One sentence — who is this for?
- **User Stories**: `As a [user], I want to [action] so that [benefit].`
- **Acceptance Criteria**: Bulleted "Done" definitions per story.
- **Non-Goals**: Explicit list of what is out of scope for v1.

### 3. Technical Specification

- **Stack**: Confirm Vite + React + TypeScript + Tailwind (note any additions with justification).
- **Component tree**: Top-level components and their responsibilities.
- **State shape**: Key state variables and their TypeScript types.
- **Data / side-effects**: Any fetch, localStorage, or external API calls.
- **Routing**: Path (`/apps/<name>`) and any sub-routes.

### 4. Testing Plan

- **Unit / integration** (Vitest + RTL): Which components? Which interactions?
- **E2E** (Playwright): Which user flows must pass before merge?

### 5. Risks & Rollout

- **MVP**: Minimum shippable slice.
- **v1.1 ideas**: What gets added if the MVP lands well?
- **Risks**: Anything that could block or complicate delivery.

---

## Quality Rules

- Every acceptance criterion must be verifiable by a test or direct observation — no subjective criteria.
- If the user hasn't specified something, label it `TBD` — never invent constraints.
- After finalising the PRD, suggest handing off to the `scaffold` skill to begin implementation.
- If this idea originated from a brainstorm session, update its status in `IDEAS.md` to `In Progress`.
