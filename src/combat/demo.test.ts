import { describe, it, expect } from "vitest";
import { createFighter, createGoblin } from "./demo.js";
import { abilityModifier } from "../character/stats.js";

describe("demo characters", () => {
  describe("Fighter", () => {
    it("has SRD 5.2 ability scores", () => {
      const fighter = createFighter();

      expect(fighter.abilityScores.strength).toBe(16);
      expect(fighter.abilityScores.dexterity).toBe(12);
      expect(fighter.abilityScores.constitution).toBe(14);
      expect(fighter.abilityScores.intelligence).toBe(10);
      expect(fighter.abilityScores.wisdom).toBe(11);
      expect(fighter.abilityScores.charisma).toBe(10);
    });

    it("has correct derived stats", () => {
      const fighter = createFighter();

      expect(fighter.maxHp).toBe(12);
      expect(fighter.currentHp).toBe(12);
      expect(fighter.ac).toBe(16);
      expect(fighter.attackBonus).toBe(5);
      expect(fighter.damageExpression).toBe("1d8+3");
    });

    it("has correct ability modifiers", () => {
      const fighter = createFighter();

      expect(abilityModifier(fighter.abilityScores.strength)).toBe(3);
      expect(abilityModifier(fighter.abilityScores.dexterity)).toBe(1);
      expect(abilityModifier(fighter.abilityScores.constitution)).toBe(2);
    });

    it("starts at full HP", () => {
      const fighter = createFighter();

      expect(fighter.currentHp).toBe(fighter.maxHp);
    });
  });

  describe("Goblin", () => {
    it("has SRD 5.2 ability scores", () => {
      const goblin = createGoblin();

      expect(goblin.abilityScores.strength).toBe(8);
      expect(goblin.abilityScores.dexterity).toBe(14);
      expect(goblin.abilityScores.constitution).toBe(10);
      expect(goblin.abilityScores.intelligence).toBe(10);
      expect(goblin.abilityScores.wisdom).toBe(8);
      expect(goblin.abilityScores.charisma).toBe(8);
    });

    it("has correct derived stats", () => {
      const goblin = createGoblin();

      expect(goblin.maxHp).toBe(7);
      expect(goblin.currentHp).toBe(7);
      expect(goblin.ac).toBe(15);
      expect(goblin.attackBonus).toBe(4);
      expect(goblin.damageExpression).toBe("1d6+2");
    });

    it("has correct ability modifiers", () => {
      const goblin = createGoblin();

      expect(abilityModifier(goblin.abilityScores.strength)).toBe(-1);
      expect(abilityModifier(goblin.abilityScores.dexterity)).toBe(2);
      expect(abilityModifier(goblin.abilityScores.constitution)).toBe(0);
    });

    it("starts at full HP", () => {
      const goblin = createGoblin();

      expect(goblin.currentHp).toBe(goblin.maxHp);
    });
  });
});
