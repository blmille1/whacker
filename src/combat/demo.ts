import { createCharacter } from "../character/character.js";

export function createFighter() {
  return createCharacter({
    name: "Fighter",
    abilityScores: {
      strength: 16,
      dexterity: 12,
      constitution: 14,
      intelligence: 10,
      wisdom: 11,
      charisma: 10,
    },
    maxHp: 12,
    ac: 16,
    attackBonus: 5,
    damageExpression: "1d8+3",
  });
}

export function createGoblin() {
  return createCharacter({
    name: "Goblin",
    abilityScores: {
      strength: 8,
      dexterity: 14,
      constitution: 10,
      intelligence: 10,
      wisdom: 8,
      charisma: 8,
    },
    maxHp: 7,
    ac: 15,
    attackBonus: 4,
    damageExpression: "1d6+2",
  });
}
