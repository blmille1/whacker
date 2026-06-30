import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Dice } from "../dice/dice.js";
import { createCombat, getLegalIntents } from "../combat/engine.js";
import { selectNpcIntent } from "./npcController.js";
import { makeCharacter } from "./testHelpers.js";

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
