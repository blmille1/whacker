export interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export function abilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function initiativeBonus(dexScore: number): number {
  return abilityModifier(dexScore);
}
