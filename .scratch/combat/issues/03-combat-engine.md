Status: ready-for-agent

## Parent

`.scratch/combat/PRD.md`

## What to build

Deliver the core combat engine — the `runCombat()` function that runs a complete D&D 5e combat encounter.

**Initiative:**
- Roll d20 + DEX modifier for each combatant at encounter start
- Sort by initiative result (highest first)
- Break ties by raw DEX score; further ties by coin flip (random)

**Combat loop:**
- Iterate rounds; on each round, every standing combatant takes one turn
- On a turn, the combatant attacks the first available enemy in initiative order
- Attack resolution: roll d20 + attack bonus vs. target AC. If >= AC, it's a hit
- On a hit: roll the attacker's damage expression, subtract from target's `currentHp`
- A combatant at 0 HP is removed from the encounter (defeated)
- Combat ends when only one side has combatants standing

**Event stream:**
- The engine emits typed events: `initiativeRolled`, `attackMade`, `hit`, `miss`, `damageDealt`, `combatantDefeated`, `combatEnded`
- Each event has a type discriminator and relevant payload
- The full event log is part of the return value

**Public interface:**
- `runCombat(combatants: Character[]): CombatResult`
- `CombatResult` includes: `winner` (the surviving side's combatants), `rounds` (number of full rounds completed), `events` (the full event log)

**Tests:**
- End-to-end through `runCombat()` with deterministic dice (mock or fix the Dice module)
- Test: initiative is rolled and sorted correctly
- Test: a hit deals damage and reduces HP
- Test: a combatant at 0 HP is removed
- Test: combat ends with the correct winner
- Test: the event log contains the expected sequence of events
- Test: a 1v1 fight between a Fighter and Goblin completes and produces a winner

## Acceptance criteria

- [ ] `npx vitest run` passes with all combat engine tests green
- [ ] `runCombat()` accepts an array of characters and returns a `CombatResult`
- [ ] Initiative is rolled and combatants act in correct order
- [ ] Attack resolution correctly determines hit/miss based on d20 + attack bonus vs. AC
- [ ] Damage reduces target HP and defeated combatants are removed
- [ ] Combat ends when one side remains standing
- [ ] The event log contains all expected event types in the correct sequence
- [ ] All types are exported from `src/types/index.ts`

## Blocked by

- `02-character-module`
