import { describe, it, expect } from "vitest";
import { Dice } from "./dice.js";

describe("Dice", () => {
  it("rolls 1d20+5 and returns total and individual rolls", () => {
    const result = Dice.roll("1d20+5");

    expect(result).toHaveProperty("total");
    expect(result).toHaveProperty("rolls");
    expect(result.rolls).toHaveLength(1);
    expect(result.total).toBe(result.rolls[0] + 5);
    expect(result.rolls[0]).toBeGreaterThanOrEqual(1);
    expect(result.rolls[0]).toBeLessThanOrEqual(20);
  });

  it("rolls 1d20 with no modifier, total between 1 and 20", () => {
    const result = Dice.roll("1d20");

    expect(result.rolls).toHaveLength(1);
    expect(result.total).toBeGreaterThanOrEqual(1);
    expect(result.total).toBeLessThanOrEqual(20);
  });

  it("rolls 2d6+3 and returns two individual rolls with correct total", () => {
    const result = Dice.roll("2d6+3");

    expect(result.rolls).toHaveLength(2);
    expect(result.total).toBeGreaterThanOrEqual(5);
    expect(result.total).toBeLessThanOrEqual(15);
    expect(result.total).toBe(result.rolls[0] + result.rolls[1] + 3);
    result.rolls.forEach((roll) => {
      expect(roll).toBeGreaterThanOrEqual(1);
      expect(roll).toBeLessThanOrEqual(6);
    });
  });

  it("defaults to 1 die and no modifier when expression is 'd20'", () => {
    const result = Dice.roll("d20");

    expect(result.rolls).toHaveLength(1);
    expect(result.total).toBeGreaterThanOrEqual(1);
    expect(result.total).toBeLessThanOrEqual(20);
    expect(result.total).toBe(result.rolls[0]);
  });

  it("rolls 2d6 with no modifier", () => {
    const result = Dice.roll("2d6");

    expect(result.rolls).toHaveLength(2);
    expect(result.total).toBeGreaterThanOrEqual(2);
    expect(result.total).toBeLessThanOrEqual(12);
    expect(result.total).toBe(result.rolls[0] + result.rolls[1]);
  });

  it("handles negative modifiers", () => {
    const result = Dice.roll("1d20-2");

    expect(result.rolls).toHaveLength(1);
    expect(result.total).toBe(result.rolls[0] - 2);
  });
});
