import type { CombatEvent } from "./events.js";

export function renderEvents(events: CombatEvent[]): string[] {
  const lines: string[] = [];
  let i = 0;

  while (i < events.length) {
    const event = events[i];

    switch (event.type) {
      case "initiativeRolled":
        lines.push(`${event.combatantName} rolls initiative: ${event.total}`);
        i++;
        break;

      case "roundStarted":
        lines.push(`--- Round ${event.round} ---`);
        i++;
        break;

      case "attackMade": {
        const attacker = event.attackerName;
        const defender = event.defenderName;
        i++;

        // Peek ahead for hit/miss + optional damage + optional defeat
        let hit = false;
        if (i < events.length && (events[i].type === "hit" || events[i].type === "miss")) {
          hit = events[i].type === "hit";
          i++;
        }

        let damage = 0;
        let hpRemaining = 0;
        let maxHp = 0;
        if (hit && i < events.length && events[i].type === "damageDealt") {
          const dmgEvent = events[i];
          damage = dmgEvent.damage;
          hpRemaining = dmgEvent.hpRemaining;
          maxHp = dmgEvent.maxHp;
          i++;
        }

        let defeated = false;
        if (i < events.length && events[i].type === "combatantDefeated") {
          defeated = true;
          i++;
        }

        // Build the single EverQuest-style line
        let line: string;
        if (hit) {
          line = `${attacker} hits ${defender} for ${damage} damage!`;
          if (hpRemaining > 0) {
            line += ` (${hpRemaining}/${maxHp} HP)`;
          }
          if (defeated) {
            line += ` ${defender} has been defeated!`;
          }
        } else {
          line = `${attacker} tries to hit ${defender}, but misses!`;
        }
        lines.push(line);
        break;
      }

      case "combatEnded":
        lines.push(
          `${event.winnerNames.join(", ")} wins! Combat ended in ${event.rounds} rounds.`
        );
        i++;
        break;
    }
  }

  return lines;
}
