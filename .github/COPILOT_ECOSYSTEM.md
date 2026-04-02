# Copilot Ecosystem Principles

> Authoritative reference for maintaining the Lab project's GitHub Copilot CLI customization files.
> Every rule here is derived from official GitHub Copilot CLI documentation and the injection behavior of each file type.
> **Update this file first** whenever you change the structure or content strategy of any ecosystem file.

---

## 1. Injection Lifecycle Map

Understanding *when* and *how* each file reaches the model is the foundation of every content principle below.

| File | Injected? | When | Budget |
|---|---|---|---|
| `~/.copilot/copilot-instructions.md` | ✅ As text | **Every prompt**, across all repos | Target ≤3,000 chars; hard limit 4,000 chars¹ |
| `.github/copilot-instructions.md` | ✅ As text | **Every prompt** in this repo | Target ≤3,000 chars; hard limit 4,000 chars¹ |
| `AGENTS.md` (repo root) | ✅ As text | **Every prompt** — treated as *primary* instructions | Keep lean; target ≤6,000 chars |
| `AGENTS.md` (subdirectory) | ✅ As text | **Every prompt** — treated as *additional* instructions | — |
| `.github/instructions/*.instructions.md` | ✅ As text | **Only** when `applyTo` glob matches a file in context | Up to ~8,000 chars each |

> ¹ **Source**: GitHub Copilot Code Review reads only the first 4,000 characters of instruction files ([GitHub Docs](https://docs.github.com/en/copilot/tutorials/use-custom-instructions)). The 3,000 char target maintains a healthy signal-to-noise ratio and leaves headroom for growth — per [GitHub Copilot Customization Handbook](https://copilot-academy.github.io/workshops/copilot-customization/copilot_customization_handbook) and [Token-Budget-Aware LLM Reasoning (arXiv 2412.18547)](https://arxiv.org/abs/2412.18547).
| `.github/agents/*.agent.md` | ✅ As text | **Only** when that agent is explicitly invoked or auto-selected | Up to 30,000 chars |
| `.github/hooks/hooks.json` | ❌ Not in model | Executes shell at lifecycle events; output *may* appear in terminal | Script ≤10s default |
| `~/.copilot/mcp-config.json` | ❌ Not in model | Provides tool functions; model sees tool *signatures*, not config | — |

**Source**: [GitHub Docs — Adding custom instructions for Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/add-custom-instructions), [CLI help output — instruction sources list]

**Critical**: Conflicts between simultaneously injected files (copilot-instructions.md + AGENTS.md + matching instruction files) are **non-deterministic**. The model's choice between contradictory instructions is unpredictable. Prevent all conflicts at authoring time.

---

## 2. Prompt Composition (Every Request)

For any prompt in this repo, the model receives all of the following (additive merge — nothing overrides, everything concatenates):

```
[AGENTS.md]                                     ← repo root, primary
[.github/instructions/**/*.instructions.md]     ← conditional on applyTo match
[.github/copilot-instructions.md]               ← repo always-on
[~/.copilot/copilot-instructions.md]            ← user-level always-on
[COPILOT_CUSTOM_INSTRUCTIONS_DIRS AGENTS.md]    ← env var, if set
[user's actual prompt]
```

**Confirmed order** from `copilot /help` output — this is the exact precedence list the CLI reports.

Agent invocations additionally prepend the `.github/agents/<name>.agent.md` body.

> **Important**: Instructions are **concatenated additively** — there is no "override". All injected files are merged into one system prompt block. Conflicts produce non-deterministic results.

This means `AGENTS.md` + `.github/copilot-instructions.md` together consume tokens on **100% of requests**. Every token here must earn its place.

### Local instructions

You can add personal cross-repo instructions at `~/.copilot/copilot-instructions.md`. These are injected on every prompt across **all** repos.

You can also set `COPILOT_CUSTOM_INSTRUCTIONS_DIRS` to a comma-separated list of directories. Copilot CLI will scan each for `AGENTS.md` and `.github/instructions/**/*.instructions.md` files. Useful for shared team instruction libraries.

---

## 3. File-by-File Principles

### 3.1 `.github/copilot-instructions.md` — Repo-Wide Always-On

**Role**: Identity signal and absolute non-negotiables. The one file the model always has.

**Content formula**:
1. Project identity (1–2 sentences)
2. Stack summary (one line)
3. Non-negotiables as a flat list (imperative, present-tense, ≤10 items)
4. Core principles acronym/summary (1–2 lines)
5. Table of contents pointing to detailed instruction files

**Content rules**:
- ✅ Must — project name, stack, non-negotiable rules (e.g. named exports only, no `any`)
- ✅ Must — TOC table linking to `.github/instructions/` files
- ❌ Never — code blocks or code examples
- ❌ Never — rationale or explanations (those live in `.github/CONVENTIONS.md`)
- ❌ Never — content that duplicates `AGENTS.md` (both are always injected)
- ❌ Never — content that belongs in a path-specific instruction file
- ❌ Never — tool-specific config (MCP, LSP, hooks)

**Size**: Target ≤3,000 characters. GitHub hard limit is 4,000 chars (code review scanning stops there). Leave headroom for growth.

**Conflict rule**: Any rule here is automatically overridden by a matching path-specific instruction file in non-deterministic ways. Keep rules here at the *policy* level (what), not the *implementation* level (how).

---

### 3.2 `AGENTS.md` — Primary Agent Context (Always-On)

**Role**: Project map and workflow reference. Tells agents *how this project is structured* and *what the established workflows are*.

**Content formula**:
1. Project identity and purpose (brief)
2. Stack table with versions
3. Key commands (dev, build, lint)
4. Directory map with rules
5. How-to workflow (e.g., "How to Add a New App" — step by step)
6. Shared vs app-specific decision table
7. Conventions reference index

**Content rules**:
- ✅ Must — directory map with co-location and promotion rules
- ✅ Must — exact step-by-step workflows agents will follow
- ✅ Must — decision tables for ambiguous choices (shared vs app-specific)
- ✅ Must — cross-references to `.github/CONVENTIONS.md` and instruction files
- ❌ Never — repeat non-negotiables already in `copilot-instructions.md`
- ❌ Never — code style rules (those live in instruction files)
- ❌ Never — rationale or research citations (those live in `.github/CONVENTIONS.md`)

**Size guideline**: Target ≤6,000 characters. AGENTS.md is read on every prompt — it must be dense but not padded.

**Source**: [agentsmd/agents.md spec](https://github.com/agentsmd/agents.md); [GitHub Docs — agent instructions](https://docs.github.com/en/copilot/how-tos/copilot-cli/add-custom-instructions#agent-instructions)

---

### 3.3 `.github/instructions/*.instructions.md` — Path-Specific (Conditional)

**Role**: Detailed, file-type-specific coding rules. Only injected when the model is working on matching files — so this is where *implementation detail* lives.

**Content formula**:
1. Frontmatter with precise `applyTo` glob
2. Section headings matching key concerns for that file type
3. Imperative rules (short, scannable)
4. Code examples *only* when a rule is non-obvious without one

**Frontmatter rules**:
- `applyTo` glob must be as **narrow as meaningful** — too broad wastes tokens on unrelated tasks
- Comma-separate multiple patterns: `"**/*.ts,**/*.tsx"`
- Use `excludeAgent` when a rule should not apply to code review: `excludeAgent: "code-review"`
- One file per concern — do not merge unrelated domains into one file

**Content rules**:
- ✅ Must — rules at the implementation level (naming, structure, patterns)
- ✅ Must — short code examples for non-obvious rules
- ✅ Must — explicit "do / do not" pairs to prevent the most common mistakes
- ❌ Never — rules that apply project-wide (those belong in `copilot-instructions.md`)
- ❌ Never — rules that contradict `copilot-instructions.md` (conflicts are non-deterministic)
- ❌ Never — philosophy or rationale beyond one sentence (that lives in `.github/CONVENTIONS.md`)

**Registered instruction files for this project**:

| File | `applyTo` | Covers |
|---|---|---|
| `react-components.instructions.md` | `src/**/*.tsx` | Component anatomy, props, JSX, memoization |
| `typescript.instructions.md` | `**/*.ts,**/*.tsx` | Types, interfaces, generics, strict mode |
| `hooks.instructions.md` | `src/**/use*.ts,src/**/use*.tsx` | Hook patterns, promotion rules |
| `styling.instructions.md` | `src/**/*.tsx,src/**/*.css` | Tailwind v4, class ordering, no inline styles |
| `apps.instructions.md` | `src/apps/**` | New app pattern, 3-step workflow, co-location |
| `testing.instructions.md` | `**/*.test.ts,**/*.test.tsx,**/*.spec.ts,**/*.spec.tsx` | Query priority, userEvent, AAA, mocking, Playwright rules |

**Adding a new instruction file**:
1. Name it `<concern>.instructions.md`
2. Set the narrowest `applyTo` glob that captures all relevant files
3. Add it to the table in section 7 of this document
4. Add a row to the TOC table in `copilot-instructions.md`
5. Verify no rule conflicts with `copilot-instructions.md`

---

### 3.4 `.github/agents/*.agent.md` — Specialized On-Demand Agents

**Role**: Turn Copilot into a specialist for a specific workflow. Only loaded when invoked — so this is where *depth and verbosity* are acceptable.

**Content formula**:
1. YAML frontmatter: `description`, `tools` (limit to what's needed), optional `model`
2. Agent identity statement (what it is, when to use it)
3. Step-by-step workflows with exact file paths and code templates
4. Decision rules for common edge cases
5. Explicit "do not" list to prevent over-reach

**Frontmatter rules**:
- `description` is **mandatory** — this is how Copilot decides when to auto-select this agent
- Write `description` as: when + why. Example: *"Use when scaffolding new apps. Knows the exact 3-step Lab pattern."*
- `tools`: restrict to tools the agent actually needs (principle of least privilege)
- Omit `model` unless there is a specific reason (cost, capability) to override

**Content rules**:
- ✅ Must — concrete templates with real file paths for this project
- ✅ Must — clear stopping conditions ("do not proceed until X is confirmed")
- ✅ Must — read-only annotation for review agents (`disable-model-invocation: false` + read-only tools)
- ❌ Never — duplicate the project map (AGENTS.md covers that; agents inherit it)
- ❌ Never — generic advice that applies to all tasks (that's copilot-instructions.md)
- ❌ Never — rules for file types outside the agent's domain

**Max size**: 30,000 characters per the CLI format spec. In practice, keep under 5000 to stay scannable.

**Registered agents for this project**:

| File | Auto-invoked when | Scope |
|---|---|---|
| `scaffold.agent.md` | "create/add/scaffold app" requests | Create new mini-app (3-step workflow) |
| `review.agent.md` | "review/check/audit code" requests | Read-only conventions audit |

---

### 3.5 `.github/hooks/hooks.json` — Lifecycle Side-Effects

**Role**: Execute shell commands at model lifecycle events. **Never injected into model context.** Provides external side-effects only (logging, warnings, terminal output).

**Architecture rules**:
- `version: 1` is required at root level
- Each hook event maps to an **array** of hook objects (not a single object)
- Each object: `{ "type": "command", "powershell": "...", "timeoutSec": N }`
- Use `bash` key for cross-platform alternatives alongside `powershell`
- `preToolUse` receives `{ toolName, toolArgs, cwd, timestamp }` via **stdin** as JSON — use `$Input | ConvertFrom-Json`
- `timeoutSec` defaults to 30; use 10 for all hooks to prevent session blocking

**Content rules**:
- ✅ Use for — session logging, terminal reminders, non-blocking warnings
- ✅ Use for — `preToolUse` guard rails (warn when writes target unexpected paths)
- ❌ Never — business logic, complex calculations, network calls
- ❌ Never — blocking operations (>10 seconds will stall the session)
- ❌ Never — writing instructions into model context (hooks are NOT the right tool for this)
- ❌ Never — hard errors that prevent tool use (use `Write-Warning`, not `throw`)

**Lifecycle events available**: `sessionStart`, `sessionEnd`, `userPromptSubmitted`, `preToolUse`, `postToolUse`, `errorOccurred`

> **Note on `userPromptSubmitted`**: this hook fires after the user submits a prompt but before the model processes it. It can write to stdout to append context to the prompt. Use sparingly — it fires on every single message.

**Registered hooks for this project**:

| Event | Purpose |
|---|---|
| `sessionStart` | Log session start to `.copilot-session.log`; echo conventions reminder |
| `preToolUse` | Warn (non-blocking) if a write tool targets a path outside `src/` or `public/` |

**Adding a hook**: Only add if there is a concrete, recurring value. Ask: *"Would I manually do this every session without the hook?"* If no, don't add it.

---

### 3.6 `~/.copilot/mcp-config.json` — Tool Providers

**Role**: Register MCP servers that give the model new *capabilities* (tools). Not injected as text — the model sees tool function signatures, not the config itself.

**Content rules**:
- ✅ Add MCPs for capabilities not achievable by built-in tools
- ✅ Prefer user-level (`~/.copilot/mcp-config.json`) for tools used across all projects
- ✅ Prefer project-level (`.github/mcp.json`) for project-specific tools
- ❌ Never add the GitHub MCP — it is built-in to Copilot CLI and adding it is redundant
- ❌ Never add MCPs without a concrete use case already present

**Registered MCPs**:

| Server | Type | Purpose |
|---|---|---|
| `context7` | HTTP (`https://mcp.context7.com/mcp`) | Live library docs (React, Tailwind, TS, etc.) |
| `playwright` | Local (`npx @playwright/mcp@latest`) | Browser automation for UI testing/exploration |

---

### 3.7 `.github/lsp.json` — Code Intelligence

**Role**: Configure Language Server Protocol servers that give Copilot tools real-time code intelligence (go-to-definition, type info, diagnostics). Not injected as text.

**Content rules**:
- `fileExtensions` must match the project's actual extensions
- `command` must be a globally installed binary (verify with `which typescript-language-server`)
- One server per language

**Registered LSP servers for this project**: TypeScript (`typescript-language-server`) for `.ts` and `.tsx`.

---

## 4. Consistency Rules

These govern how the files relate to each other and prevent conflicts.

### 4.1 The No-Redundancy Rule
Each piece of information has **exactly one home**:

| Information type | Lives in |
|---|---|
| "What the project is and its non-negotiables" | `copilot-instructions.md` |
| "How the project is structured and what workflows to follow" | `AGENTS.md` |
| "Full rationale and research behind every rule" | `.github/CONVENTIONS.md` |
| "Detailed rules for file type X" | `X.instructions.md` |
| "Step-by-step specialist workflow for task Y" | `Y.agent.md` |
| "Lifecycle side-effects" | `hooks.json` |

### 4.2 The No-Contradiction Rule
Before adding any rule to any file:
1. Check that the same rule does not already exist elsewhere
2. Check that no existing rule says the opposite
3. If a path-specific instruction *refines* a copilot-instructions rule, the refinement must be strictly additive (more specific, not contradictory)

### 4.3 The Size Awareness Rule
- `copilot-instructions.md`: **target ≤3,000 chars** (hard limit 4,000 chars per GitHub Docs)
- `AGENTS.md`: **target ≤6,000 chars**
- Each instruction file: **≤8,000 chars** — but only injected when relevant

### 4.4 The Scope Separation Rule
- **Policy** (what must be true) → `copilot-instructions.md`
- **Process** (how to do a workflow) → `AGENTS.md`
- **Detail** (how to write a specific file type) → `.instructions.md`
- **Depth** (specialist knowledge for one task) → `.agent.md`
- **Research** (why these decisions were made) → `.github/CONVENTIONS.md`

### 4.5 The Precision Rule for Globs
A path-specific instruction file's `applyTo` glob should match **only the files whose authors need those rules**. Overly broad globs (`**/*`) waste tokens on irrelevant prompts.

---

## 5. Anti-Patterns

| Anti-pattern | Problem | Fix |
|---|---|---|
| Code examples in `copilot-instructions.md` | Consumes token budget on every prompt for content only needed sometimes | Move to the relevant `.instructions.md` file |
| Rationale in instruction files | Bloats token usage; rationale is reference material, not a rule | Move to `.github/CONVENTIONS.md` |
| Duplicate rules across files | Creates non-deterministic conflict resolution | Pick one home per rule; delete all others |
| `applyTo: "**"` in an instruction file | Injects that file's content on every single prompt, defeating lazy injection | Narrow the glob to the actual file types affected |
| Long-running hooks (`timeoutSec > 30`) | Blocks every session start / tool use | Rewrite to finish in ≤10s, or make it async |
| Environment variables in `preToolUse` (e.g. `$env:COPILOT_TOOL_NAME`) | Copilot hooks pass data via stdin JSON, not environment variables | Use `$Input \| ConvertFrom-Json` to read payload |
| Generic advice in agent files | Wastes the agent's context on what AGENTS.md already covers | Reference AGENTS.md; put only specialist content in agent files |
| Instruction file without `applyTo` | File is malformed; `applyTo` is required for path-specific injection | Always include frontmatter with `applyTo` |
| MCP for GitHub operations | GitHub MCP is built-in; adding it is redundant noise | Remove any `github` MCP entry from `mcp-config.json` |

---

## 6. Ecosystem File Inventory

Complete list of all files in this project's Copilot ecosystem. **Keep this table current** whenever files are added, removed, or renamed.

### Project-Level (`.github/`)

| File | Type | Always-On? | Trigger |
|---|---|---|---|
| `copilot-instructions.md` | Repo instructions | ✅ Yes | Every prompt |
| `COPILOT_ECOSYSTEM.md` | Meta-reference (this file) | ❌ No | Human reference only |
| `instructions/react-components.instructions.md` | Path instructions | Conditional | `src/**/*.tsx` in context |
| `instructions/typescript.instructions.md` | Path instructions | Conditional | `**/*.ts,**/*.tsx` in context |
| `instructions/hooks.instructions.md` | Path instructions | Conditional | `src/**/use*.ts,src/**/use*.tsx` in context |
| `instructions/styling.instructions.md` | Path instructions | Conditional | `src/**/*.tsx,src/**/*.css` in context |
| `instructions/apps.instructions.md` | Path instructions | Conditional | `src/apps/**` in context |
| `instructions/testing.instructions.md` | Path instructions | Conditional | `**/*.test.*,**/*.spec.*` in context |
| `agents/scaffold.agent.md` | Specialist agent | ❌ No | Explicit invocation / "scaffold" intent |
| `agents/review.agent.md` | Specialist agent | ❌ No | Explicit invocation / "review" intent |
| `hooks/hooks.json` | Lifecycle hooks | Shell only | `sessionStart`, `preToolUse`, `postToolUse` |

### Repo-Root

| File | Type | Always-On? |
|---|---|---|
| `AGENTS.md` | Primary agent instructions | ✅ Yes — every prompt |
| `.github/CONVENTIONS.md` | Human + agent reference | ❌ No — read on demand |
| `.github/TESTING.md` | Testing best practices reference | ❌ No — read on demand |
| `.github/scripts/validate-copilot-ecosystem.ps1` | Ecosystem validator | ❌ No — manual or `postToolUse` hook |
| `.github/scripts/pre-commit.ps1` | Pre-commit E2E runner | ❌ No — git hook |
| `.github/scripts/install-hooks.ps1` | Git hook installer | ❌ No — run once on clone |
| `.github/scripts/on-pre-tool-use.ps1` | Pre-tool-use hook script | Shell only — `preToolUse` |
| `.github/scripts/on-post-tool-use.ps1` | Post-tool-use hook script | Shell only — `postToolUse` |

### User-Level (`~/.copilot/`)

| File | Type | Always-On? |
|---|---|---|
| `mcp-config.json` | MCP tool providers | Session-wide (all repos) |

---

## 7. Authoring Checklist

Use this checklist any time you add or modify an ecosystem file.

- [ ] The content belongs in this specific file type (see § 4.1 Scope Separation)
- [ ] No rule here contradicts a rule in another injected file (see § 4.2 No-Contradiction)
- [ ] No information here already exists in another file (see § 4.1 No-Redundancy)
- [ ] Size limits respected (copilot-instructions ≤3,000 chars, AGENTS.md ≤6,000 chars) (see § 4.3)
- [ ] `applyTo` glob is as narrow as meaningful (path-specific files only) (see § 4.5)
- [ ] File inventory table in § 6 is updated if files were added/removed
- [ ] TOC in `copilot-instructions.md` is updated if instruction files changed
- [ ] Conventions reference index in `AGENTS.md` § 8 is updated if files changed
