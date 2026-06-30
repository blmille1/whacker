import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Dice } from "../dice/dice.js";
import { createCharacter } from "../character/character.js";
import { createCombat, getLegalIntents } from "../combat/engine.js";
import { selectNpcIntent } from "./npcController.js";

function makeCharacter(name: string, opts: {
  dex?: number;
  str?: number;
  con?: number;
  ac?: number;
  hp?: number;
  attackBonus?: number;
  damage?: string;
}) {
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

describe("npcController: selectNpcIntent", () => {
  let rollSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    rollSpy = vi.spyOn(Dice, "roll");
  });

  afterEach(() => {
    rollSpy.mockRestore();
  });

  it("selects Attack against the first available enemy", () => {
    rollSpy.mockReturnValue({ total: 10, rolls: [10] });

    const combat = createCombat([
      makeCharacter("Goblin", { dex: 14 }),
      makeCharacter("Fighter", { dex: 10 }),
    ]);

    // Goblin is the active character (higher DEX, same roll)
    const intents = getLegalIntents(combat, "Goblin");
    const selected = selectNpcIntent(intents);

    expect(selected.type).toBe("attack");
    if (selected.type === "attack") {
      expect(selected.targetId).toBe("Fighter");
    }
  });

  it("returns the first attack intent when multiple enemies exist", () => {
    rollSpy.mockReturnValue({ total: 10, rolls: [10] });

    const combat = createCombat([
      makeCharacter("Goblin", { dex: 16 }),
      makeCharacter("Fighter", { dex: 14 }),
      makeCharacter("Orc", { dex: 12 }),
    ]);

    const intents = getLegalIntents(combat, "Goblin");
    const attackIntents = intents.filter((i) => i.type === "attack");
    expect(attackIntents.length).toBe(2);

    const selected = selectNpcIntent(intents);
    expect(selected.type).toBe("attack");
    if (selected.type === "attack") {
      expect(selected.targetId).toBe("Fighter");
    }
  });

  it("throws when no attack intents are available", () => {
    rollSpy.mockReturnValue({ total: 10, rolls: [10] });

    const combat = createCombat([
      makeCharacter("Goblin", { dex: 14 }),
    ]);

    const intents = getLegalIntents(combat, "Goblin");
    // No enemies → no attack intents
    const attackIntents = intents.filter((i) => i.type === "attack");
    expect(attackIntents).toHaveLength(0);

    expect(() => selectNpcIntent(intents)).toThrow();
  });
});
