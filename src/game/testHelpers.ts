import { createCharacter } from "../character/character.js";

export interface MakeCharacterOptions {
  dex?: number;
  str?: number;
  con?: number;
  ac?: number;
  hp?: number;
  attackBonus?: number;
  damage?: string;
}

export function makeCharacter(name: string, opts: MakeCharacterOptions) {
  return createCharacter({
    name,
    abilityScores: {
      strength: opts.str ?? 10,
      dexterity: opts.dex ?? 10,
      constitution: opts.con ?? 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    },
    maxHp: opts.hp ?? 10,
    ac: opts.ac ?? 10,
    attackBonus: opts.attackBonus ?? 2,
    damageExpression: opts.damage ?? "1d6+1",
  });
}
