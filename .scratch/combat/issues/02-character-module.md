Status: ready-for-agent

## Parent

`.scratch/combat/PRD.md`

## What to build

Deliver the Character module — the entity that represents any creature (player or monster) in the game.

**Character type:**
- A `Character` type with: `name`, ability scores (`strength`, `dexterity`, `constitution`, `intelligence`, `wisdom`, `charisma`), `maxHp`, `currentHp`, `ac`, `attackBonus`, `damageExpression`
- Derived values (ability modifiers, initiative bonus) are computed on access, not stored
- Any object satisfying this shape can participate in combat — no inheritance hierarchy

**Stats module:**
- An `AbilityScores` type with all six scores
- A function to derive a modifier from a score: `floor((score - 10) / 2)`
- A function to get the initiative bonus (DEX modifier)

**Tests:**
- Ability score modifier derivation: e.g., score 14 → modifier +2, score 9 → modifier -1, score 10 → modifier +0
- HP clamping: `currentHp` never exceeds `maxHp`, never goes below 0
- Character construction with all required fields

## Acceptance criteria

- [ ] `npx vitest run` passes with all Character and Stats tests green
- [ ] Ability modifier function correctly computes for scores 1–20
- [ ] A `Character` can be constructed with name, ability scores, HP, AC, attack bonus, and damage expression
- [ ] `currentHp` is clamped: cannot exceed `maxHp`, cannot go below 0
- [ ] All types are exported from `src/types/index.ts`

## Blocked by

- `01-dice-module-and-project-scaffold`
