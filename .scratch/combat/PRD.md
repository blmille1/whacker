Status: ready-for-agent

## Problem Statement

Whacker is a text adventure game engine, but it has no gameplay yet. The namesake mechanic — two characters whacking each other in combat — doesn't exist. There is no way to create entities, resolve attacks, track health, or determine a winner. The project needs a foundational combat engine that implements the core D&D 5e combat loop so that all future features (spells, abilities, AI, encounters) have something to build on.

## Solution

Build a D&D 5e combat engine that takes two or more combatants, runs a complete combat encounter following SRD 5.1 rules, and produces a structured log of events plus a final result. The engine will be domain-organized, tested via its public interface, and designed so that richer narration, AI decision-making, and expanded rules can be layered on later without modifying the core.

## User Stories

1. As a developer, I want a `Dice` class that parses and rolls dice expressions (e.g., `"1d20+5"`, `"2d6+3"`), so that all random number generation in the game flows through a single, testable utility.
2. As a developer, I want ability scores to automatically derive modifiers using the standard D&D formula (`floor((score - 10) / 2)`), so that the math is consistent and not hand-rolled in every module.
3. As a developer, I want a `Character` entity that holds ability scores, HP, AC, and an attack definition, so that any creature — player or monster — can participate in combat through a shared interface.
4. As a developer, I want to roll initiative for all combatants at the start of an encounter, so that turn order follows D&D 5e rules (d20 + DEX modifier, ties broken by DEX score).
5. As a player, I want combatants to take turns in initiative order, so that the encounter feels like a real D&D fight.
6. As a player, I want each attack to roll a d20 plus an attack bonus against the target's AC, so that hits and misses follow D&D 5e rules.
7. As a player, I want a hit to deal damage based on the attacker's damage dice expression (e.g., `"1d8"` for a longsword), so that different weapons and creatures feel distinct.
8. As a player, I want damage to reduce the target's current HP, so that combat has consequences.
9. As a player, I want a combatant reduced to 0 HP to be removed from the encounter, so that the fight progresses toward a conclusion.
10. As a player, I want combat to end when only one side has combatants standing, so that there is a clear winner and loser.
11. As a developer, I want the combat engine to emit structured events (initiativeRolled, attackMade, hit, miss, damageDealt, combatantDefeated, combatEnded), so that a text renderer or AI system can consume them without coupling to the engine internals.
12. As a developer, I want the combat engine's public interface to accept an array of combatants and return a result (winner, rounds, event log), so that the entire feature can be tested through a single integration seam.
13. As a developer, I want to create hardcoded test characters (a Fighter and a Goblin) with SRD-accurate stats, so that I can run a demo combat without a character creation system.
14. As a player, I want to see a text log of the combat encounter from start to finish, so that I can follow what happened even in this first minimal version.

## Implementation Decisions

- **Dice module**: A `Dice` class with a static `roll(expression: string)` method that parses standard dice notation (`NdS+M`, where N = number of dice, S = sides, M = modifier). Returns the total and optionally the individual rolls. This is the single source of randomness in the game.

- **Character module**: A `Character` type/entity with: name, ability scores (STR, DEX, CON, INT, WIS, CHA), max HP, current HP, AC, an attack bonus, and a damage dice expression. Derived values (ability modifiers, initiative bonus) are computed, not stored. Any entity that satisfies this shape can participate in combat — no inheritance hierarchy.

- **Combat engine**: A `runCombat(combatants: Character[])` function that is the single public entry point. It: (1) rolls initiative for each combatant, (2) sorts by initiative, (3) iterates rounds where each standing combatant takes a turn attacking the next available enemy, (4) removes combatants at 0 HP, (5) stops when one side remains. Returns a `CombatResult` with the winning side, number of rounds, and the full event log.

- **Initiative**: d20 + DEX modifier. Ties broken by raw DEX score. Further ties broken by a coin flip (random).

- **Attack resolution**: Roll d20 + attack bonus. If total >= target AC, it's a hit. Roll damage dice expression and subtract from target's current HP. No critical hits in this slice.

- **Targeting**: In this first slice, each combatant attacks the first available enemy in initiative order. No AI decision-making — deterministic targeting keeps the engine simple.

- **Event log**: The engine emits a typed event stream. Each event has a type discriminator and relevant payload. This is the seam that future narration and AI layers will consume.

- **Domain-driven file structure**: `src/combat/`, `src/character/`, `src/dice/`, `src/types/`. One concept per file. Flat within domains until a domain grows enough to warrant sub-files.

- **TypeScript ESM**: `"type": "module"` in `package.json`. All files use `import`/`export`. `tsx` for running, Vitest for testing.

- **No external dependencies in the engine**: The combat engine, dice, and character modules have zero npm dependencies. Only dev dependencies (Vitest, tsx, TypeScript).

## Testing Decisions

- **Test external behavior, not implementation details**: Tests should assert on inputs and outputs of the public interface, not on internal state or private methods. For the combat engine, this means: given these combatants, the result should be a win for X with N rounds and an event log matching these expected events.

- **Primary integration seam — `runCombat`**: The combat engine is tested end-to-end through `runCombat()`. Feed in combatants with known stats, verify the output. Use seeded/fixed dice or mock the dice module to make tests deterministic.

- **Dice module — unit tested**: The `Dice` class is tested in isolation for parsing correctness, roll bounds (e.g., 1d20 always returns 1–20), and modifier application. Statistical distribution tests are out of scope.

- **Character module — unit tested**: Ability score modifier derivation, HP clamping (current HP never exceeds max, never goes below 0), and attack bonus calculations.

- **No test for `main.ts`**: The entry point wires modules together and is validated by running the demo, not by automated tests.

- **Prior art**: This is the first code in the repo, so there is no existing test patterns to follow. Establish the convention: `*.test.ts` co-located with source files, Vitest with ESM, describe/it blocks with descriptive names.

## Out of Scope

- Character creation flow (race, class selection, equipment)
- Spells, special abilities, or class features
- Advantage/disadvantage mechanics
- Critical hits
- Movement, positioning, or range
- Multiple combatants per side (the engine supports it, but the demo is 1v1)
- AI decision-making for NPC targeting
- Rich/flavored text narration (structured events only)
- Persistence, save/load, or session management
- Any UI beyond console output

## Further Notes

- This PRD represents the **first vertical slice** of Whacker. Future slices will add character creation, richer combat (advantage, crits, conditions), exploration/rooms, inventory, and eventually AI-generated content via OpenRouter.
- The event log design is intentional — it's the seam that lets us plug in a narrative text renderer or an AI dungeon master later without touching the combat engine.
- Hardcoded test characters should use SRD 5.1 stats: Fighter (Longsword, 1d8+STR damage, chain mail AC 16, HP based on d10+CON) and Goblins (Scimitar, 1d6+DEX damage, leather+shield AC 15, HP 2d6).
