export interface DiceResult {
  total: number;
  rolls: number[];
}

export const Dice = {
  roll(expression: string): DiceResult {
    const match = expression.match(/^(\d*)d(\d+)([+-]\d+)?$/);
    if (!match) throw new Error(`Invalid dice expression: ${expression}`);

    const count = match[1] ? parseInt(match[1], 10) : 1;
    const sides = parseInt(match[2], 10);
    const modifier = match[3] ? parseInt(match[3], 10) : 0;

    const rolls: number[] = [];
    for (let i = 0; i < count; i++) {
      rolls.push(Math.floor(Math.random() * sides) + 1);
    }

    const total = rolls.reduce((sum, r) => sum + r, 0) + modifier;
    return { total, rolls };
  },
} as const;
