import { describe, it, expect } from "vitest";
import { Character, createCharacter } from "./character.js";
import type { AbilityScores } from "./stats.js";

describe("Character construction", () => {
  const scores: AbilityScores = {
    strength: 16,
    dexterity: 12,
    constitution: 14,
    intelligence: 10,
    wisdom: 13,
    charisma: 8,
  };

  it("can be constructed with all required fields", () => {
    const character: Character = {
      name: "Fighter",
      abilityScores: scores,
      maxHp: 30,
      currentHp: 30,
      ac: 16,
      attackBonus: 5,
      damageExpression: "1d8+3",
    };

    expect(character.name).toBe("Fighter");
    expect(character.abilityScores.strength).toBe(16);
    expect(character.maxHp).toBe(30);
    expect(character.currentHp).toBe(30);
    expect(character.ac).toBe(16);
    expect(character.attackBonus).toBe(5);
    expect(character.damageExpression).toBe("1d8+3");
  });

  it("createCharacter builds a character with clamped HP", () => {
    const character = createCharacter({
      name: "Fighter",
      abilityScores: scores,
      maxHp: 30,
      ac: 16,
      attackBonus: 5,
      damageExpression: "1d8+3",
    });

    expect(character.currentHp).toBe(30);
    expect(character.maxHp).toBe(30);
  });
});

describe("HP clamping", () => {
  const scores: AbilityScores = {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  };

  it("clamps currentHp to maxHp when damage would go below 0", () => {
    const character = createCharacter({
      name: "Fighter",
      abilityScores: scores,
      maxHp: 10,
      ac: 10,
      attackBonus: 0,
      damageExpression: "1d6",
    });

    character.currentHp -= 999;
    expect(character.currentHp).toBe(0);
  });

  it("clamps currentHp to maxHp when healing would exceed maxHp", () => {
    const character = createCharacter({
      name: "Fighter",
      abilityScores: scores,
      maxHp: 10,
      ac: 10,
      attackBonus: 0,
      damageExpression: "1d6",
    });

    character.currentHp = 5;
    character.currentHp += 999;
    expect(character.currentHp).toBe(10);
  });

  it("allows currentHp to be set within valid range", () => {
    const character = createCharacter({
      name: "Fighter",
      abilityScores: scores,
      maxHp: 20,
      ac: 10,
      attackBonus: 0,
      damageExpression: "1d6",
    });

    character.currentHp = 10;
    expect(character.currentHp).toBe(10);

    character.currentHp = 0;
    expect(character.currentHp).toBe(0);

    character.currentHp = 20;
    expect(character.currentHp).toBe(20);
  });
});
