import type { Character } from "../character/character.js";
import type { CombatEvent } from "../combat/events.js";
import {
  createCombat,
  getCombatState,
  getLegalIntents,
  isCombatOver,
  resolveIntent,
} from "../combat/engine.js";
import { selectNpcIntent } from "./npcController.js";

export interface AutoPilotResult {
  isOver: boolean;
  events: CombatEvent[];
  rounds: number;
}

/**
 * Auto-play a full Combat using the NPC controller for every combatant.
 *
 * Both Player and NPC turns are driven by the same `selectNpcIntent` logic —
 * always Attack the first available enemy. This proves the engine is fully
 * drivable by an external decision-maker without human input.
 *
 * Events are emitted incrementally by the engine after each `resolveIntent`
 * call; this function simply collects them into the final result.
 */
export function autoPilotCombat(combatants: Character[]): AutoPilotResult {
  const combat = createCombat(combatants);

  while (!isCombatOver(combat)) {
    const state = getCombatState(combat);
    const activeName = state.activeCharacterName;
    if (!activeName) break;

    const intents = getLegalIntents(combat, activeName);
    const intent = selectNpcIntent(intents);

    resolveIntent(combat, intent);
  }

  const finalState = getCombatState(combat);
  return {
    isOver: finalState.isOver,
    events: finalState.events,
    rounds: finalState.round,
  };
}
