# Coding Standards

This document defines the project's coding standards. It is read by both the implementation and review agents.

## Project Overview

Whacker is a D&D 5e-style text adventure engine built in TypeScript. It separates an **Engine** layer (combat and mechanics rules) from a **Game Content** layer (stat blocks, encounters, demo wiring). The project uses the SRD 5.2 ruleset as its mechanical foundation.

Domain glossary: See `CONTEXT.md` at the repo root. All code and comments must use the domain vocabulary defined there (e.g., Character, not Actor; Hit Points, not Health).

Architecture decisions: See `docs/adr/`.

## Language & Runtimes

- TypeScript strict mode (`tsc --noEmit` must pass)
- ESM modules (`"type": "module"`)
- Node.js + tsx for execution
- No deno, bun, or other runtimes

## Style

- Use camelCase for variables and functions
- Use PascalCase for types, classes, and interfaces
- Prefer named exports over default exports
- Use `const` by default; `let` only when reassignment is needed
- Prefer `async/await` over raw Promises
- Use `import type` for type-only imports
- Files use `.ts` extension; tests use `.test.ts`

## Testing

- Use **vitest** (not jest, mocha, or any other framework)
- Tests live alongside source files as `*.test.ts`
- Every public function on the engine must have at least one test
- Use descriptive test names that explain the expected behavior
- Tests run via `npm run test` (wraps `vitest run`)

## Verification

Before committing, always run:
```
npm run verify
```
This chains: `npm run lint` → `npm run typecheck` → `npm run test`.

All three must pass. Fix any failures before proceeding.

## Architecture

- Keep modules focused on a single responsibility
- Prefer composition over inheritance
- Engine layer must not reference Game Content (one-way dependency)
- Game Content layer holds all data (Character stat blocks, Monster stat blocks, Encounter definitions)
- Engine exposes an intent interface; content layer drives it
- Use dice expressions (`2d6+3`) for all random resolution

## Git

Commit messages use conventional-commit style:

```
<type>: <short summary>

- <decision or change>
- <decision or change>
- Model: $MODEL
- Fixes #<issue-number>
```

Rules:
- Use a conventional-commit type prefix (`fix:`, `feat:`, `refactor:`, `docs:`, etc.)
- Include the model used as `Model: <name>` in the body (e.g., `Model: openrouter/owl-alpha`)
- Include issue number as `Fixes #<N>`
- List key decisions in the body
- One commit per issue (squash if needed during iteration)
- Do not commit commented-out code, TODOs, or debug logs
- Branch naming: `agent/issue-<N>`

## Rules

- Work on one issue per iteration
- If blocked (missing context, failing tests you cannot fix), leave a comment on the issue and move on — do not close it
- Do not invent abstractions beyond what the current issue requires
- Keep changes as small as possible
