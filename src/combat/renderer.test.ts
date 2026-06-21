import { describe, it, expect } from "vitest";
import { renderEvents } from "./renderer.js";
import type { CombatEvent } from "./events.js";

describe("renderer", () => {
  describe("initiativeRolled", () => {
    it("renders initiative rolls", () => {
      const events: CombatEvent[] = [
        { type: "initiativeRolled", combatantName: "Fighter", roll: 15, dexModifier: 2, total: 17 },
        { type: "initiativeRolled", combatantName: "Goblin", roll: 8, dexModifier: 1, total: 9 },
      ];

      const lines = renderEvents(events);

      expect(lines).toEqual([
        "Fighter rolls initiative: 17",
        "Goblin rolls initiative: 9",
      ]);
    });
  });

  describe("roundStarted", () => {
    it("renders round headers", () => {
      const events: CombatEvent[] = [
        { type: "roundStarted", round: 1 },
        { type: "roundStarted", round: 2 },
      ];

      const lines = renderEvents(events);

      expect(lines).toEqual([
        "--- Round 1 ---",
        "--- Round 2 ---",
      ]);
    });
  });

  describe("attackMade", () => {
    it("renders a hit with damage and remaining HP", () => {
      const events: CombatEvent[] = [
        { type: "attackMade", attackerName: "Fighter", defenderName: "Goblin", attackRoll: 18, attackBonus: 5, total: 23, targetAc: 15 },
        { type: "hit", attackerName: "Fighter", defenderName: "Goblin" },
        { type: "damageDealt", attackerName: "Fighter", defenderName: "Goblin", damage: 6, hpRemaining: 1, maxHp: 7 },
      ];

      const lines = renderEvents(events);

      expect(lines).toEqual([
        "Fighter hits Goblin for 6 damage! (1/7 HP)",
      ]);
    });

    it("renders a hit that defeats the target", () => {
      const events: CombatEvent[] = [
        { type: "attackMade", attackerName: "Fighter", defenderName: "Goblin", attackRoll: 20, attackBonus: 5, total: 25, targetAc: 15 },
        { type: "hit", attackerName: "Fighter", defenderName: "Goblin" },
        { type: "damageDealt", attackerName: "Fighter", defenderName: "Goblin", damage: 8, hpRemaining: 0, maxHp: 7 },
        { type: "combatantDefeated", combatantName: "Goblin" },
      ];

      const lines = renderEvents(events);

      expect(lines).toEqual([
        "Fighter hits Goblin for 8 damage! Goblin has been defeated!",
      ]);
    });

    it("renders a miss", () => {
      const events: CombatEvent[] = [
        { type: "attackMade", attackerName: "Goblin", defenderName: "Fighter", attackRoll: 5, attackBonus: 4, total: 9, targetAc: 16 },
        { type: "miss", attackerName: "Goblin", defenderName: "Fighter" },
      ];

      const lines = renderEvents(events);

      expect(lines).toEqual([
        "Goblin tries to hit Fighter, but misses!",
      ]);
    });
  });

  describe("combatEnded", () => {
    it("renders the final result", () => {
      const events: CombatEvent[] = [
        { type: "combatEnded", winnerNames: ["Fighter"], rounds: 3 },
      ];

      const lines = renderEvents(events);

      expect(lines).toEqual([
        "Fighter wins! Combat ended in 3 rounds.",
      ]);
    });
  });

  describe("full encounter", () => {
    it("renders a complete combat log", () => {
      const events: CombatEvent[] = [
        { type: "initiativeRolled", combatantName: "Fighter", roll: 15, dexModifier: 1, total: 16 },
        { type: "initiativeRolled", combatantName: "Goblin", roll: 10, dexModifier: 2, total: 12 },
        { type: "roundStarted", round: 1 },
        { type: "attackMade", attackerName: "Fighter", defenderName: "Goblin", attackRoll: 18, attackBonus: 5, total: 23, targetAc: 15 },
        { type: "hit", attackerName: "Fighter", defenderName: "Goblin" },
        { type: "damageDealt", attackerName: "Fighter", defenderName: "Goblin", damage: 6, hpRemaining: 1, maxHp: 7 },
        { type: "attackMade", attackerName: "Goblin", defenderName: "Fighter", attackRoll: 5, attackBonus: 4, total: 9, targetAc: 16 },
        { type: "miss", attackerName: "Goblin", defenderName: "Fighter" },
        { type: "roundStarted", round: 2 },
        { type: "attackMade", attackerName: "Fighter", defenderName: "Goblin", attackRoll: 14, attackBonus: 5, total: 19, targetAc: 15 },
        { type: "hit", attackerName: "Fighter", defenderName: "Goblin" },
        { type: "damageDealt", attackerName: "Fighter", defenderName: "Goblin", damage: 8, hpRemaining: 0, maxHp: 7 },
        { type: "combatantDefeated", combatantName: "Goblin" },
        { type: "combatEnded", winnerNames: ["Fighter"], rounds: 2 },
      ];

      const lines = renderEvents(events);

      expect(lines).toEqual([
        "Fighter rolls initiative: 16",
        "Goblin rolls initiative: 12",
        "--- Round 1 ---",
        "Fighter hits Goblin for 6 damage! (1/7 HP)",
        "Goblin tries to hit Fighter, but misses!",
        "--- Round 2 ---",
        "Fighter hits Goblin for 8 damage! Goblin has been defeated!",
        "Fighter wins! Combat ended in 2 rounds.",
      ]);
    });
  });
});
