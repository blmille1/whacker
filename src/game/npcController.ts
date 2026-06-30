import type { Intent } from "../combat/engine.js";

/**
 * NPC controller — selects an Intent for an NPC's Turn.
 *
 * Simplest viable AI: always pick Attack against the first available enemy.
 * This lives in the game content layer; the engine is NPC-agnostic and
 * resolves whatever valid Intent it receives.
 *
 * @param intents - the set of legal Intents for the active NPC, as returned
 *   by `getLegalIntents`.
 * @returns the selected Intent (always an Attack if one is available).
 * @throws if no Attack intent is available (no valid enemy targets).
 */
export function selectNpcIntent(intents: Intent[]): Intent {
  const attackIntent = intents.find((i) => i.type === "attack");
  if (!attackIntent) {
    throw new Error("No attack intent available — no valid enemy targets");
  }
  return attackIntent;
}
