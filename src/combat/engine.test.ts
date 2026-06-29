import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Dice } from "../dice/dice.js";
import { createCharacter } from "../character/character.js";
import {
  createCombat,
  getCombatState,
  getLegalIntents,
  resolveIntent,
  isCombatOver,
} from "./engine.js";

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

describe("engine: createCombat", () => {
  let rollSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    rollSpy = vi.spyOn(Dice, "roll");
  });

  afterEach(() => {
    rollSpy.mockRestore();
  });

  it("rolls initiative for every combatant", () => {
    rollSpy.mockReturnValue({ total: 10, rolls: [10] });

    const combat = createCombat([
      makeCharacter("A", {}),
      makeCharacter("B", {}),
    ]);

    const initEvents = combat.events.filter((e) => e.type === "initiativeRolled");
    expect(initEvents).toHaveLength(2);
  });

  it("sorts by initiative total, highest first", () => {
    let callIdx = 0;
    rollSpy.mockImplementation(() => {
      const totals = [15, 8];
      const total = totals[Math.min(callIdx, totals.length - 1)];
      callIdx++;
      return { total, rolls: [total] };
    });

    const combat = createCombat([
      makeCharacter("Fighter", { dex: 14 }), // +2 => 17
      makeCharacter("Goblin", { dex: 12 }),   // +1 => 9
    ]);

    const state = getCombatState(combat);
    expect(state.participants[0].name).toBe("Fighter");
    expect(state.participants[1].name).toBe("Goblin");
  });

  it("breaks initiative ties by raw DEX score", () => {
    let callIdx = 0;
    rollSpy.mockImplementation(() => {
      const totals = [10, 10];
      const total = totals[Math.min(callIdx, totals.length - 1)];
      callIdx++;
      return { total, rolls: [total] };
    });

    const combat = createCombat([
      makeCharacter("Fighter", { dex: 16 }), // +3 => 13
      makeCharacter("Goblin", { dex: 12 }),   // +1 => 11
    ]);

    const state = getCombatState(combat);
    expect(state.participants[0].name).toBe("Fighter");
    expect(state.participants[1].name).toBe("Goblin");
  });

  it("reports the first participant as the active character", () => {
    rollSpy.mockReturnValue({ total: 10, rolls: [10] });

    const combat = createCombat([
      makeCharacter("A", { dex: 14 }),
      makeCharacter("B", { dex: 10 }),
    ]);

    const state = getCombatState(combat);
    expect(state.activeCharacterName).toBe("A");
    expect(state.isOver).toBe(false);
    expect(state.round).toBe(0);
  });
});

describe("engine: getLegalIntents", () => {
  let rollSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    rollSpy = vi.spyOn(Dice, "roll");
  });

  afterEach(() => {
    rollSpy.mockRestore();
  });

  it("returns Attack (with valid targets), Dash, Dodge, Disengage for the active combatant", () => {
    rollSpy.mockReturnValue({ total: 10, rolls: [10] });

    const combat = createCombat([
      makeCharacter("Fighter", { dex: 14 }),
      makeCharacter("Goblin", { dex: 10 }),
    ]);

    const intents = getLegalIntents(combat, "Fighter");
    const types = intents.map((i) => i.type);

    expect(types).toContain("attack");
    expect(types).toContain("dash");
    expect(types).toContain("dodge");
    expect(types).toContain("disengage");

    const attackIntent = intents.find((i) => i.type === "attack");
    expect(attackIntent).toBeDefined();
    if (attackIntent?.type === "attack") {
      expect(attackIntent.targetId).toBe("Goblin");
    }
  });

  it("returns no Attack intents when no enemies remain", () => {
    rollSpy.mockReturnValue({ total: 10, rolls: [10] });

    const combat = createCombat([
      makeCharacter("Fighter", { dex: 14 }),
      makeCharacter("Goblin", { dex: 10, hp: 1 }),
    ]);

    // Defeat the goblin via a guaranteed hit
    rollSpy.mockReturnValue({ total: 20, rolls: [20] });
    resolveIntent(combat, { type: "attack", targetId: "Goblin" });

    const intents = getLegalIntents(combat, "Fighter");
    const types = intents.map((i) => i.type);
    expect(types).not.toContain("attack");
  });
});

describe("engine: resolveIntent (attack)", () => {
  let rollSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    rollSpy = vi.spyOn(Dice, "roll");
  });

  afterEach(() => {
    rollSpy.mockRestore();
  });

  it("a hit deals damage and reduces HP", () => {
    let callIdx = 0;
    rollSpy.mockImplementation(() => {
      const totals = [
        14, // Fighter initiative
        10, // Goblin initiative
        15, // Fighter attack roll (15+5=20 >= AC 10 => hit)
        4,  // Fighter damage (goblin: 10→6)
      ];
      const total = totals[Math.min(callIdx, totals.length - 1)];
      callIdx++;
      return { total, rolls: [total] };
    });

    const fighter = makeCharacter("Fighter", { dex: 14, hp: 20, attackBonus: 5, damage: "1d6" });
    const goblin = makeCharacter("Goblin", { dex: 10, hp: 10, ac: 10, attackBonus: 2 });

    const combat = createCombat([fighter, goblin]);
    const state = resolveIntent(combat, { type: "attack", targetId: "Goblin" });

    const damageEvents = state.events.filter((e) => e.type === "damageDealt") as any[];
    expect(damageEvents.length).toBeGreaterThan(0);
    expect(damageEvents[0].damage).toBe(4);
    expect(damageEvents[0].hpRemaining).toBe(6);

    const goblinState = state.participants.find((p) => p.name === "Goblin");
    expect(goblinState?.currentHp).toBe(6);
  });

  it("a miss deals no damage", () => {
    let callIdx = 0;
    rollSpy.mockImplementation(() => {
      const totals = [
        14, // Fighter initiative
        10, // Goblin initiative
        2,  // Fighter attack roll (2+5=7 < AC 15 => miss)
      ];
      const total = totals[Math.min(callIdx, totals.length - 1)];
      callIdx++;
      return { total, rolls: [total] };
    });

    const fighter = makeCharacter("Fighter", { dex: 10, hp: 20, attackBonus: 5, damage: "1d6" });
    const goblin = makeCharacter("Goblin", { dex: 10, hp: 5, ac: 15 });

    const combat = createCombat([fighter, goblin]);
    const state = resolveIntent(combat, { type: "attack", targetId: "Goblin" });

    const missEvents = state.events.filter((e) => e.type === "miss");
    expect(missEvents.length).toBeGreaterThan(0);

    const goblinState = state.participants.find((p) => p.name === "Goblin");
    expect(goblinState?.currentHp).toBe(5);
  });

  it("defeats a combatant at 0 HP and ends the combat", () => {
    rollSpy.mockReturnValue({ total: 20, rolls: [20] });

    const fighter = makeCharacter("Fighter", { dex: 14, hp: 20, attackBonus: 5, damage: "1d6" });
    const goblin = makeCharacter("Goblin", { dex: 12, hp: 5, ac: 10 });

    const combat = createCombat([fighter, goblin]);
    const state = resolveIntent(combat, { type: "attack", targetId: "Goblin" });

    const defeatedEvents = state.events.filter((e) => e.type === "combatantDefeated") as any[];
    expect(defeatedEvents).toHaveLength(1);
    expect(defeatedEvents[0].combatantName).toBe("Goblin");

    expect(state.isOver).toBe(true);

    const endEvent = state.events.find((e) => e.type === "combatEnded") as any;
    expect(endEvent).toBeDefined();
    expect(endEvent.winnerNames).toEqual(["Fighter"]);
  });

  it("throws on an invalid attack target", () => {
    rollSpy.mockReturnValue({ total: 10, rolls: [10] });

    const combat = createCombat([
      makeCharacter("Fighter", { dex: 14 }),
      makeCharacter("Goblin", { dex: 10 }),
    ]);

    expect(() =>
      resolveIntent(combat, { type: "attack", targetId: "Nobody" })
    ).toThrow();
  });
});

describe("engine: non-attack intents", () => {
  let rollSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    rollSpy = vi.spyOn(Dice, "roll");
  });

  afterEach(() => {
    rollSpy.mockRestore();
  });

  it("dash, dodge, disengage are valid but produce no damage", () => {
    rollSpy.mockReturnValue({ total: 10, rolls: [10] });

    const combat = createCombat([
      makeCharacter("Fighter", { dex: 14 }),
      makeCharacter("Goblin", { dex: 10 }),
    ]);

    const before = getCombatState(combat);
    const hpBefore = before.participants.find((p) => p.name === "Goblin")!.currentHp;

    const state = resolveIntent(combat, { type: "dash" });

    const damageEvents = state.events.filter((e) => e.type === "damageDealt");
    expect(damageEvents).toHaveLength(0);

    const goblinState = state.participants.find((p) => p.name === "Goblin");
    expect(goblinState?.currentHp).toBe(hpBefore);
  });
});

describe("engine: turn flow", () => {
  let rollSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    rollSpy = vi.spyOn(Dice, "roll");
  });

  afterEach(() => {
    rollSpy.mockRestore();
  });

  it("advances turn to the next combatant after resolving", () => {
    rollSpy.mockReturnValue({ total: 10, rolls: [10] });

    const combat = createCombat([
      makeCharacter("Fighter", { dex: 14 }),
      makeCharacter("Goblin", { dex: 10 }),
    ]);

    let state = getCombatState(combat);
    expect(state.activeCharacterName).toBe("Fighter");

    state = resolveIntent(combat, { type: "dash" });
    expect(state.activeCharacterName).toBe("Goblin");

    state = resolveIntent(combat, { type: "dodge" });
    expect(state.activeCharacterName).toBe("Fighter");
  });

  it("starts a new round after all combatants have acted", () => {
    rollSpy.mockReturnValue({ total: 10, rolls: [10] });

    const combat = createCombat([
      makeCharacter("Fighter", { dex: 14 }),
      makeCharacter("Goblin", { dex: 10 }),
    ]);

    let state = resolveIntent(combat, { type: "dash" }); // Fighter acts
    expect(state.round).toBe(1);

    state = resolveIntent(combat, { type: "dodge" }); // Goblin acts
    expect(state.round).toBe(1);

    state = resolveIntent(combat, { type: "disengage" }); // Fighter acts again — new round
    expect(state.round).toBe(2);

    const roundEvents = state.events.filter((e) => e.type === "roundStarted");
    expect(roundEvents).toHaveLength(2);
  });
});

describe("engine: isCombatOver", () => {
  let rollSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    rollSpy = vi.spyOn(Dice, "roll");
  });

  afterEach(() => {
    rollSpy.mockRestore();
  });

  it("returns false when multiple combatants are standing", () => {
    rollSpy.mockReturnValue({ total: 10, rolls: [10] });

    const combat = createCombat([
      makeCharacter("Fighter", { dex: 14 }),
      makeCharacter("Goblin", { dex: 10 }),
    ]);

    expect(isCombatOver(combat)).toBe(false);
  });

  it("returns true when only one combatant remains", () => {
    rollSpy.mockReturnValue({ total: 20, rolls: [20] });

    const combat = createCombat([
      makeCharacter("Fighter", { dex: 14, hp: 20, attackBonus: 5, damage: "1d6" }),
      makeCharacter("Goblin", { dex: 12, hp: 5, ac: 10 }),
    ]);

    resolveIntent(combat, { type: "attack", targetId: "Goblin" });
    expect(isCombatOver(combat)).toBe(true);
  });
});

describe("engine: full 1v1 fight through intent interface", () => {
  let rollSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    rollSpy = vi.spyOn(Dice, "roll");
  });

  afterEach(() => {
    rollSpy.mockRestore();
  });

  it("completes and produces a winner", () => {
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

    const combat = createCombat([fighter, goblin]);

    let iterations = 0;
    while (!isCombatOver(combat) && iterations < 100) {
      iterations++;
      const state = getCombatState(combat);
      const active = state.activeCharacterName;
      if (!active) break;

      const intents = getLegalIntents(combat, active);
      const attack = intents.find((i) => i.type === "attack");
      if (!attack) break;

      resolveIntent(combat, attack);
    }

    const finalState = getCombatState(combat);
    expect(finalState.isOver).toBe(true);

    const endEvent = finalState.events.find((e) => e.type === "combatEnded") as any;
    expect(endEvent).toBeDefined();
    expect(endEvent.winnerNames.length).toBeGreaterThan(0);
    expect(endEvent.rounds).toBeGreaterThanOrEqual(1);
  });
});
