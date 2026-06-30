import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Dice } from "../dice/dice.js";
import { createCharacter } from "../character/character.js";
import { runCombat } from "../combat/combat.js";
import { autoPilotCombat } from "./autoPilot.js";

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

describe("autoPilotCombat", () => {
  let rollSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    rollSpy = vi.spyOn(Dice, "roll");
  });

  afterEach(() => {
    rollSpy.mockRestore();
  });

  it("auto-plays a full 1v1 combat to completion", () => {
    rollSpy.mockReturnValue({ total: 20, rolls: [20] });

    const fighter = makeCharacter("Fighter", {
      dex: 14,
      str: 16,
      con: 14,
      hp: 30,
      ac: 16,
      attackBonus: 5,
      damage: "1d8+3",
    });

    const goblin = makeCharacter("Goblin", {
      dex: 12,
      str: 8,
      con: 10,
      hp: 10,
      ac: 15,
      attackBonus: 3,
      damage: "1d6+2",
    });

    const result = autoPilotCombat([fighter, goblin]);

    expect(result.isOver).toBe(true);

    const endEvent = result.events.find((e) => e.type === "combatEnded") as any;
    expect(endEvent).toBeDefined();
    expect(endEvent.winnerNames.length).toBeGreaterThan(0);
    expect(endEvent.rounds).toBeGreaterThanOrEqual(1);
  });

  it("produces the same event sequence as runCombat for the same dice rolls", () => {
    // Use a deterministic sequence of dice rolls
    let callIdx = 0;
    const totals = [
      14, // Fighter initiative
      10, // Goblin initiative
      15, // Fighter attack (hit)
      4,  // Fighter damage
      15, // Goblin attack (hit)
      3,  // Goblin damage
      15, // Fighter attack (hit)
      4,  // Fighter damage
      15, // Goblin attack (hit)
      3,  // Goblin damage
      15, // Fighter attack (hit)
      4,  // Fighter damage (goblin defeated)
    ];

    // Run with runCombat
    rollSpy.mockImplementation(() => {
      const total = totals[Math.min(callIdx, totals.length - 1)];
      callIdx++;
      return { total, rolls: [total] };
    });

    const fighter1 = makeCharacter("Fighter", { dex: 14, hp: 20, attackBonus: 5, damage: "1d6" });
    const goblin1 = makeCharacter("Goblin", { dex: 10, hp: 10, ac: 10, attackBonus: 2 });
    const runCombatResult = runCombat([fighter1, goblin1]);

    // Reset and run with autoPilot
    callIdx = 0;
    rollSpy.mockImplementation(() => {
      const total = totals[Math.min(callIdx, totals.length - 1)];
      callIdx++;
      return { total, rolls: [total] };
    });

    const fighter2 = makeCharacter("Fighter", { dex: 14, hp: 20, attackBonus: 5, damage: "1d6" });
    const goblin2 = makeCharacter("Goblin", { dex: 10, hp: 10, ac: 10, attackBonus: 2 });
    const autoPilotResult = autoPilotCombat([fighter2, goblin2]);

    // The event sequences should match
    expect(autoPilotResult.events).toEqual(runCombatResult.events);
  });

  it("emits events incrementally after each resolveIntent call", () => {
    let callIdx = 0;
    rollSpy.mockImplementation(() => {
      const totals = [
        14, // Fighter initiative
        10, // Goblin initiative
        15, // Fighter attack (hit)
        4,  // Fighter damage
        15, // Goblin attack (hit)
        3,  // Goblin damage
        15, // Fighter attack (hit)
        4,  // Fighter damage
        15, // Goblin attack (hit)
        3,  // Goblin damage
        15, // Fighter attack (hit)
        4,  // Fighter damage (goblin defeated)
      ];
      const total = totals[Math.min(callIdx, totals.length - 1)];
      callIdx++;
      return { total, rolls: [total] };
    });

    const fighter = makeCharacter("Fighter", { dex: 14, hp: 20, attackBonus: 5, damage: "1d6" });
    const goblin = makeCharacter("Goblin", { dex: 10, hp: 10, ac: 10, attackBonus: 2 });

    const result = autoPilotCombat([fighter, goblin]);

    // Events should be a flat sequence — no batching at the end
    const eventTypes = result.events.map((e) => e.type);

    // Verify the expected sequence: initiative, round, attacks, damage, defeat, end
    expect(eventTypes[0]).toBe("initiativeRolled");
    expect(eventTypes[1]).toBe("initiativeRolled");
    expect(eventTypes).toContain("roundStarted");
    expect(eventTypes).toContain("attackMade");
    expect(eventTypes).toContain("hit");
    expect(eventTypes).toContain("damageDealt");
    expect(eventTypes).toContain("combatantDefeated");
    expect(eventTypes[eventTypes.length - 1]).toBe("combatEnded");
  });
});
