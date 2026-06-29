import type { Character } from "../character/character.js";
import type { CombatEvent } from "./events.js";
import {
  createCombat,
  getCombatState,
  getLegalIntents,
  isCombatOver,
  resolveIntent,
} from "./engine.js";
export type { CombatEvent } from "./events.js";

export interface CombatResult {
  winner: Character[];
  rounds: number;
  events: CombatEvent[];
}

/**
 * Run a full combat to completion using the intent-based engine.
 * Each combatant always Attacks the first available enemy — this preserves
 * the original auto-resolution behavior while delegating to the new engine.
 */
export function runCombat(combatants: Character[]): CombatResult {
  const combat = createCombat(combatants);

  while (!isCombatOver(combat)) {
    const state = getCombatState(combat);
    const activeName = state.activeCharacterName;
    if (!activeName) break;

    const intents = getLegalIntents(combat, activeName);
    const attackIntent = intents.find((i) => i.type === "attack");
    if (!attackIntent) break;

    resolveIntent(combat, attackIntent);
  }

  const finalState = getCombatState(combat);
  const endEvent = finalState.events.find((e) => e.type === "combatEnded");
  const winnerNames = endEvent?.winnerNames ?? [];
  const winner = combatants.filter((c) => winnerNames.includes(c.name));

  return {
    winner,
    rounds: finalState.round,
    events: finalState.events,
  };
}
