import { describe, it, expect } from "vitest";
import { abilityModifier, initiativeBonus } from "./stats.js";

describe("abilityModifier", () => {
  it("returns +2 for a score of 14", () => {
    expect(abilityModifier(14)).toBe(2);
  });

  it("returns -1 for a score of 9", () => {
    expect(abilityModifier(9)).toBe(-1);
  });

  it("returns +0 for a score of 10", () => {
    expect(abilityModifier(10)).toBe(0);
  });

  it("returns +0 for a score of 11", () => {
    expect(abilityModifier(11)).toBe(0);
  });

  it("returns +5 for a score of 20", () => {
    expect(abilityModifier(20)).toBe(5);
  });

  it("returns -5 for a score of 1", () => {
    expect(abilityModifier(1)).toBe(-5);
  });

  it("returns +1 for a score of 12", () => {
    expect(abilityModifier(12)).toBe(1);
  });

  it("returns -1 for a score of 8", () => {
    expect(abilityModifier(8)).toBe(-1);
  });
});

describe("initiativeBonus", () => {
  it("equals the DEX modifier", () => {
    expect(initiativeBonus(14)).toBe(2);
    expect(initiativeBonus(8)).toBe(-1);
    expect(initiativeBonus(10)).toBe(0);
  });
});
