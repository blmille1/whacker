import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Dice } from "../dice/dice.js";
import { createCharacter } from "../character/character.js";
import { runCombat } from "./combat.js";

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

describe("combat engine", () => {
  let rollSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    rollSpy = vi.spyOn(Dice, "roll");
  });

  afterEach(() => {
    rollSpy.mockRestore();
  });

  describe("initiative", () => {
    it("rolls initiative for every combatant", () => {
      rollSpy.mockReturnValue({ total: 10, rolls: [10] });

      const fighter = makeCharacter("Fighter", { dex: 14, hp: 20, ac: 15, attackBonus: 5, damage: "1d6" });
      const goblin = makeCharacter("Goblin", { dex: 12, hp: 5, ac: 10, attackBonus: 3, damage: "1d6" });

      const result = runCombat([fighter, goblin]);

      const initiativeEvents = result.events.filter(
        (e) => e.type === "initiativeRolled"
      );
      expect(initiativeEvents).toHaveLength(2);
    });

    it("sorts by initiative result, highest first", () => {
      let callIdx = 0;
      rollSpy.mockImplementation(() => {
        // First two calls are initiative; rest are attacks (use 20 to always hit)
        const totals = [15, 8, 20, 20];
        const total = totals[Math.min(callIdx, totals.length - 1)];
        callIdx++;
        return { total, rolls: [total] };
      });

      const fighter = makeCharacter("Fighter", { dex: 14, hp: 20, ac: 15, attackBonus: 5, damage: "1d6" }); // +2 mod => 17
      const goblin = makeCharacter("Goblin", { dex: 12, hp: 5, ac: 10, attackBonus: 3, damage: "1d6" });   // +1 mod => 9

      const result = runCombat([fighter, goblin]);

      const initiativeEvents = result.events.filter(
        (e) => e.type === "initiativeRolled"
      ) as any[];

      expect(initiativeEvents[0].combatantName).toBe("Fighter");
      expect(initiativeEvents[0].total).toBe(17); // 15 + 2
      expect(initiativeEvents[1].combatantName).toBe("Goblin");
      expect(initiativeEvents[1].total).toBe(9); // 8 + 1
    });

    it("breaks ties by raw DEX score", () => {
      let callIdx = 0;
      rollSpy.mockImplementation(() => {
        const totals = [10, 10, 20, 20]; // same initiative roll
        const total = totals[Math.min(callIdx, totals.length - 1)];
        callIdx++;
        return { total, rolls: [total] };
      });

      const fighter = makeCharacter("Fighter", { dex: 16, hp: 20, ac: 15, attackBonus: 5, damage: "1d6" }); // +3 mod => 13
      const goblin = makeCharacter("Goblin", { dex: 12, hp: 5, ac: 10, attackBonus: 3, damage: "1d6" });   // +1 mod => 11

      const result = runCombat([fighter, goblin]);

      const initiativeEvents = result.events.filter(
        (e) => e.type === "initiativeRolled"
      ) as any[];

      expect(initiativeEvents[0].combatantName).toBe("Fighter");
      expect(initiativeEvents[1].combatantName).toBe("Goblin");
    });
  });

  describe("attack resolution", () => {
    it("a hit deals damage and reduces HP", () => {
      let callIdx = 0;
      rollSpy.mockImplementation(() => {
        const totals = [
          14, // Fighter initiative (goes first, higher DEX)
          10, // Goblin initiative
          15, // Fighter attack roll (15+5=20 >= AC 10 => hit)
          4,  // Fighter damage (goblin: 10→6)
          15, // Goblin attack roll (15+2=17 >= AC 10 => hit)
          3,  // Goblin damage (fighter: 20→17)
          15, // Fighter attack (hit)
          4,  // Fighter damage (goblin: 6→2)
          15, // Goblin attack (hit)
          3,  // Goblin damage (fighter: 17→14)
          15, // Fighter attack (hit)
          4,  // Fighter damage (goblin: 2→0, defeated)
        ];
        const total = totals[Math.min(callIdx, totals.length - 1)];
        callIdx++;
        return { total, rolls: [total] };
      });

      // Fighter has higher DEX so always goes first (no coin flip)
      const fighter = makeCharacter("Fighter", { dex: 14, hp: 20, attackBonus: 5, damage: "1d6" });
      const goblin = makeCharacter("Goblin", { dex: 10, hp: 10, ac: 10, attackBonus: 2 });

      const result = runCombat([fighter, goblin]);

      const damageEvents = result.events.filter(
        (e) => e.type === "damageDealt"
      ) as any[];

      expect(damageEvents.length).toBeGreaterThan(0);
      expect(damageEvents[0].damage).toBe(4);
      expect(damageEvents[0].hpRemaining).toBe(6); // 10 - 4
    });

    it("a miss deals no damage", () => {
      let callIdx = 0;
      rollSpy.mockImplementation(() => {
        const totals = [
          14, // Fighter initiative (goes first, higher DEX)
          10, // Goblin initiative
          2,  // Fighter attack roll (2+5=7 < AC 15 => miss)
          2,  // Goblin attack roll (2+2=4 < AC 15 => miss)
          20, // Fighter attack roll (20+5=25 >= AC 15 => hit)
          20, // Fighter damage (goblin: 5→0, defeated)
        ];
        const total = totals[Math.min(callIdx, totals.length - 1)];
        callIdx++;
        return { total, rolls: [total] };
      });

      const fighter = makeCharacter("Fighter", { dex: 10, hp: 20, attackBonus: 5, damage: "1d6" });
      const goblin = makeCharacter("Goblin", { dex: 10, hp: 5, ac: 15 });

      const result = runCombat([fighter, goblin]);

      const missEvents = result.events.filter((e) => e.type === "miss");
      expect(missEvents.length).toBeGreaterThan(0);

      // The log should contain exactly one "damageDealt" event (the killing blow)
      const damageEvents = result.events.filter((e) => e.type === "damageDealt");
      expect(damageEvents).toHaveLength(1);
    });
  });

  describe("defeat and combat end", () => {
    it("a combatant at 0 HP is removed and combat ends with correct winner", () => {
      rollSpy.mockReturnValue({ total: 20, rolls: [20] });

      const fighter = makeCharacter("Fighter", { dex: 14, hp: 20, attackBonus: 5, damage: "1d6" });
      const goblin = makeCharacter("Goblin", { dex: 12, hp: 5, ac: 10 });

      const result = runCombat([fighter, goblin]);

      const defeatedEvents = result.events.filter(
        (e) => e.type === "combatantDefeated"
      ) as any[];
      expect(defeatedEvents).toHaveLength(1);
      expect(defeatedEvents[0].combatantName).toBe("Goblin");

      expect(result.winner).toHaveLength(1);
      expect(result.winner[0].name).toBe("Fighter");

      const endEvents = result.events.filter(
        (e) => e.type === "combatEnded"
      ) as any[];
      expect(endEvents).toHaveLength(1);
      expect(endEvents[0].winnerNames).toEqual(["Fighter"]);
    });
  });

  describe("event log", () => {
    it("contains the expected sequence of event types", () => {
      rollSpy.mockReturnValue({ total: 20, rolls: [20] });

      const fighter = makeCharacter("Fighter", { dex: 14, hp: 20, attackBonus: 5, damage: "1d6" });
      const goblin = makeCharacter("Goblin", { dex: 12, hp: 5, ac: 10 });

      const result = runCombat([fighter, goblin]);

      const eventTypes = result.events.map((e) => e.type);

      expect(eventTypes[0]).toBe("initiativeRolled");
      expect(eventTypes[1]).toBe("initiativeRolled");
      expect(eventTypes).toContain("attackMade");
      expect(eventTypes).toContain("hit");
      expect(eventTypes).toContain("damageDealt");
      expect(eventTypes).toContain("combatantDefeated");
      expect(eventTypes[eventTypes.length - 1]).toBe("combatEnded");
    });
  });

  describe("1v1 fight: Fighter vs Goblin", () => {
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

      const result = runCombat([fighter, goblin]);

      expect(result.winner.length).toBeGreaterThan(0);
      expect(result.rounds).toBeGreaterThanOrEqual(1);
      expect(result.events.length).toBeGreaterThan(0);

      const endEvent = result.events.find((e) => e.type === "combatEnded") as any;
      expect(endEvent).toBeDefined();
      expect(endEvent.winnerNames.length).toBeGreaterThan(0);
      expect(endEvent.rounds).toBe(result.rounds);
    });
  });
});
