Status: ready-for-agent

## Parent

`.scratch/combat/PRD.md`

## What to build

Wire everything together into a playable demo and render combat output to the console.

**Hardcoded test characters:**
- **Fighter**: SRD 5.1 stats — STR 16 (+3), CON 14 (+2), chain mail (AC 16), longsword (damage `1d8+3`), attack bonus +5, HP: 12 (10 + CON mod)
- **Goblin**: SRD 5.1 stats — DEX 14 (+2), scimitar (damage `1d6+2`), leather armor + shield (AC 15), attack bonus +4, HP: 7 (2d6 average)

**Entry point (`main.ts`):**
- Creates the Fighter and Goblin
- Calls `runCombat([fighter, goblin])`
- Iterates the event log and prints each event as a human-readable line to the console
- Prints the final result (winner, rounds)

**Text rendering:**
- Each event type maps to a simple text line, e.g.:
  - `initiativeRolled` → `"Fighter rolls initiative: 15"`
  - `attackMade` + `hit` → `"Fighter attacks Goblin. Hit!"`
  - `attackMade` + `miss` → `"Goblin attacks Fighter. Miss!"`
  - `damageDealt` → `"Goblin takes 6 damage. HP: 1/7"`
  - `combatantDefeated` → `"Goblin has been defeated!"`
  - `combatEnded` → `"Fighter wins! Combat ended in 3 rounds."`

## Acceptance criteria

- [ ] `npx tsx src/main.ts` runs a complete Fighter vs. Goblin combat and prints the full encounter to the console
- [ ] The output shows initiative, each attack (hit or miss), damage dealt, HP remaining, defeat messages, and the final winner
- [ ] Fighter and Goblin stats match SRD 5.1 values
- [ ] The demo is deterministic enough to verify correctness (dice can be mocked for the demo run, or output can be inspected manually)
- [ ] No test file for `main.ts` — validated by running the demo

## Blocked by

- `03-combat-engine`
