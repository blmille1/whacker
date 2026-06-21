Status: done

## Parent

`.scratch/combat/PRD.md`

## What to build

Set up the Whacker project from scratch and deliver the Dice module.

**Project scaffold:**
- Initialize a TypeScript ESM project (`"type": "module"` in `package.json`)
- Configure `tsconfig.json` for ESM output
- Configure Vitest with ESM support
- Set up the domain-driven file structure: `src/combat/`, `src/character/`, `src/dice/`, `src/types/`
- Dev dependencies only: `typescript`, `tsx`, `vitest`

**Dice module:**
- A `Dice` class with a static `roll(expression: string)` method
- Parses standard dice notation: `NdS+M` where N = number of dice, S = sides, M = modifier (e.g., `"1d20+5"`, `"2d6+3"`, `"1d8"`)
- Returns an object with `total` and `rolls` (individual die results)
- Handles edge cases: `"d20"` (defaults to 1 die), `"2d6"` (no modifier), negative modifiers

**Shared types:**
- A `types/index.ts` barrel file that re-exports all shared types from one place

**Tests:**
- `*.test.ts` co-located with source files
- Dice tests cover: parsing correctness, roll bounds (e.g., 1d20 always 1–20), modifier application, individual roll tracking

## Acceptance criteria

- [ ] `npm install` completes cleanly
- [ ] `npx vitest run` passes with all Dice tests green
- [ ] `Dice.roll("1d20+5")` returns `{ total: 12, rolls: [7] }` (example — actual values are random)
- [ ] `Dice.roll("2d6+3")` returns correct total and two individual rolls
- [ ] `Dice.roll("d20")` defaults to 1 die with no modifier
- [ ] All tests are deterministic where possible (test bounds and parsing, not random distribution)
- [ ] `src/types/index.ts` exists as the shared type barrel

## Blocked by

None — can start immediately
