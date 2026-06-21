import type { Character } from "../character/character.js";
import { abilityModifier } from "../character/stats.js";
import { Dice } from "../dice/dice.js";
import type { CombatEvent } from "./events.js";

export interface CombatResult {
  winner: Character[];
  rounds: number;
  events: CombatEvent[];
}

interface InitiativeEntry {
  character: Character;
  roll: number;
  dexScore: number;
  total: number;
}

export function runCombat(combatants: Character[]): CombatResult {
  const events: CombatEvent[] = [];

  // Roll initiative
  const initiativeOrder: InitiativeEntry[] = combatants.map((c) => {
    const roll = Dice.roll("1d20").total;
    const dexMod = abilityModifier(c.abilityScores.dexterity);
    const total = roll + dexMod;
    events.push({
      type: "initiativeRolled",
      combatantName: c.name,
      roll,
      dexModifier: dexMod,
      total,
    });
    return { character: c, roll, dexScore: c.abilityScores.dexterity, total };
  });

  // Sort initiative: highest total, then highest DEX, then coin flip
  initiativeOrder.sort((a, b) => {
    if (b.total !== a.total) return b.total - a.total;
    if (b.dexScore !== a.dexScore) return b.dexScore - a.dexScore;
    return Math.random() < 0.5 ? 1 : -1;
  });

  let rounds = 0;

  // Combat loop
  while (true) {
    const standing = initiativeOrder.filter((e) => e.character.currentHp > 0);

    if (standing.length <= 1) break;

    rounds++;
    events.push({ type: "roundStarted", round: rounds });

    for (const entry of [...initiativeOrder]) {
      const attacker = entry.character;
      if (attacker.currentHp <= 0) continue;

      // Find first available enemy in initiative order
      const target = initiativeOrder
        .map((e) => e.character)
        .find((c) => c.name !== attacker.name && c.currentHp > 0);

      if (!target) break;

      // Attack resolution
      const attackRoll = Dice.roll("1d20").total;
      const total = attackRoll + attacker.attackBonus;
      events.push({
        type: "attackMade",
        attackerName: attacker.name,
        defenderName: target.name,
        attackRoll,
        attackBonus: attacker.attackBonus,
        total,
        targetAc: target.ac,
      });

      if (total >= target.ac) {
        // Hit
        events.push({
          type: "hit",
          attackerName: attacker.name,
          defenderName: target.name,
        });

        const damageResult = Dice.roll(attacker.damageExpression);
        target.currentHp = Math.max(0, target.currentHp - damageResult.total);

        const maxHp = target.maxHp;
        events.push({
          type: "damageDealt",
          attackerName: attacker.name,
          defenderName: target.name,
          damage: damageResult.total,
          hpRemaining: target.currentHp,
          maxHp,
        });

        if (target.currentHp <= 0) {
          events.push({
            type: "combatantDefeated",
            combatantName: target.name,
          });
        }
      } else {
        events.push({
          type: "miss",
          attackerName: attacker.name,
          defenderName: target.name,
        });
      }
    }
  }

  const survivors = initiativeOrder
    .filter((e) => e.character.currentHp > 0)
    .map((e) => e.character);

  events.push({
    type: "combatEnded",
    winnerNames: survivors.map((c) => c.name),
    rounds,
  });

  return { winner: survivors, rounds, events };
}
