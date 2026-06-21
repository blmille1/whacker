import type { AbilityScores } from "./stats.js";

export interface Character {
  name: string;
  abilityScores: AbilityScores;
  maxHp: number;
  currentHp: number;
  ac: number;
  attackBonus: number;
  damageExpression: string;
}

export interface CreateCharacterInput {
  name: string;
  abilityScores: AbilityScores;
  maxHp: number;
  ac: number;
  attackBonus: number;
  damageExpression: string;
}

class CharacterImpl implements Character {
  name: string;
  abilityScores: AbilityScores;
  maxHp: number;
  private _currentHp: number;
  ac: number;
  attackBonus: number;
  damageExpression: string;

  constructor(input: CreateCharacterInput) {
    this.name = input.name;
    this.abilityScores = input.abilityScores;
    this.maxHp = input.maxHp;
    this._currentHp = input.maxHp;
    this.ac = input.ac;
    this.attackBonus = input.attackBonus;
    this.damageExpression = input.damageExpression;
  }

  get currentHp(): number {
    return this._currentHp;
  }

  set currentHp(value: number) {
    this._currentHp = Math.max(0, Math.min(this.maxHp, value));
  }
}

export function createCharacter(input: CreateCharacterInput): Character {
  return new CharacterImpl(input);
}
