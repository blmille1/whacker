import type { Character } from "../character/character.js";
import { abilityModifier } from "../character/stats.js";
import { Dice } from "../dice/dice.js";
import type { CombatEvent } from "./events.js";

/**
 * Intent — a declaration of what a Character wants to do on their Turn.
 * The engine validates legality via `getLegalIntents` and applies effects
 * via `resolveIntent`.
 */
export type Intent =
  | { type: "attack"; targetId: string }
  | { type: "dash" }
  | { type: "dodge" }
  | { type: "disengage" };

/** A participant in combat, paired with its rolled initiative. */
interface CombatParticipant {
  character: Character;
  initiativeRoll: number;
  dexScore: number;
  initiativeTotal: number;
}

/** Mutable combat state — the engine's internal representation. */
export interface Combat {
  participants: CombatParticipant[];
  currentTurnIndex: number;
  round: number;
  events: CombatEvent[];
  pendingNewRound: boolean;
}

/** Read-only snapshot of a participant for the CombatState. */
export interface CombatParticipantState {
  name: string;
  currentHp: number;
  maxHp: number;
  ac: number;
}

/** Read-only snapshot of the Combat, produced after each state change. */
export interface CombatState {
  participants: CombatParticipantState[];
  round: number;
  activeCharacterName: string | null;
  isOver: boolean;
  events: CombatEvent[];
}

/**
 * Create a new Combat from an array of participant Characters.
 * Initiative is rolled once at creation time and sorted highest-first,
 * breaking ties by raw DEX score, then randomly.
 */
export function createCombat(characters: Character[]): Combat {
  const events: CombatEvent[] = [];

  const participants: CombatParticipant[] = characters.map((c) => {
    const roll = Dice.roll("1d20").total;
    const dexMod = abilityModifier(c.abilityScores.dexterity);
    const total = roll + dexMod;
    events.push({
      type: "initiativeRolled",
      combatantName: c.name,
      roll,
      dexModifier: dexMod,
      total,
    });
    return {
      character: c,
      initiativeRoll: roll,
      dexScore: c.abilityScores.dexterity,
      initiativeTotal: total,
    };
  });

  participants.sort((a, b) => {
    if (b.initiativeTotal !== a.initiativeTotal) {
      return b.initiativeTotal - a.initiativeTotal;
    }
    if (b.dexScore !== a.dexScore) {
      return b.dexScore - a.dexScore;
    }
    return Math.random() < 0.5 ? 1 : -1;
  });

  return {
    participants,
    currentTurnIndex: 0,
    round: 0,
    events,
    pendingNewRound: false,
  };
}

/** Returns true if the participant is still standing in the combat. */
function isStanding(p: CombatParticipant): boolean {
  return p.character.currentHp > 0;
}

/**
 * Advance the turn pointer to the next standing participant.
 * Returns true if the turn order wrapped past the start index (new round).
 */
function advanceTurn(combat: Combat): boolean {
  const participantCount = combat.participants.length;
  const startIndex = combat.currentTurnIndex;
  let index = startIndex;

  for (let i = 0; i < participantCount; i++) {
    index = (index + 1) % participantCount;
    if (isStanding(combat.participants[index])) {
      combat.currentTurnIndex = index;
      return index <= startIndex;
    }
  }

  // No other standing participant found — combat is effectively over.
  combat.currentTurnIndex = index;
  return false;
}

/**
 * Produce a read-only snapshot of the current Combat state.
 */
export function getCombatState(combat: Combat): CombatState {
  const participants = combat.participants.map((p) => ({
    name: p.character.name,
    currentHp: p.character.currentHp,
    maxHp: p.character.maxHp,
    ac: p.character.ac,
  }));

  const active = combat.participants[combat.currentTurnIndex];
  const activeCharacterName = isStanding(active) ? active.character.name : null;

  return {
    participants,
    round: combat.round,
    activeCharacterName,
    isOver: isCombatOver(combat),
    events: [...combat.events],
  };
}

/**
 * Return the set of legal Intents for the character whose Turn it is.
 * Attack requires at least one valid enemy target (any other standing combatant).
 * Dash, Dodge, and Disengage are always available.
 */
export function getLegalIntents(combat: Combat, characterId: string): Intent[] {
  const intents: Intent[] = [];

  const attacker = combat.participants.find(
    (p) => p.character.name === characterId && isStanding(p)
  );
  if (!attacker) return intents;

  for (const participant of combat.participants) {
    if (participant.character.name !== attacker.character.name && isStanding(participant)) {
      intents.push({ type: "attack", targetId: participant.character.name });
    }
  }

  intents.push({ type: "dash" });
  intents.push({ type: "dodge" });
  intents.push({ type: "disengage" });

  return intents;
}

/**
 * Resolve an Intent for the active combatant, applying its effects and
 * advancing the turn. Returns a fresh CombatState snapshot.
 *
 * Throws if the active combatant is not standing, if the attack target is
 * invalid, or if the intent type is unrecognized.
 */
export function resolveIntent(combat: Combat, intent: Intent): CombatState {
  const active = combat.participants[combat.currentTurnIndex];
  if (!isStanding(active)) {
    throw new Error("No active combatant");
  }

  if (combat.round === 0 || combat.pendingNewRound) {
    combat.round++;
    combat.pendingNewRound = false;
    combat.events.push({ type: "roundStarted", round: combat.round });
  }

  const attackerName = active.character.name;

  switch (intent.type) {
    case "attack": {
      const target = combat.participants.find(
        (p) => p.character.name === intent.targetId && isStanding(p)
      );
      if (!target) {
        throw new Error(`Invalid attack target: ${intent.targetId}`);
      }

      const attackRoll = Dice.roll("1d20").total;
      const total = attackRoll + active.character.attackBonus;
      combat.events.push({
        type: "attackMade",
        attackerName,
        defenderName: target.character.name,
        attackRoll,
        attackBonus: active.character.attackBonus,
        total,
        targetAc: target.character.ac,
      });

      if (total >= target.character.ac) {
        combat.events.push({
          type: "hit",
          attackerName,
          defenderName: target.character.name,
        });

        const damageResult = Dice.roll(active.character.damageExpression);
        target.character.currentHp = Math.max(
          0,
          target.character.currentHp - damageResult.total
        );

        combat.events.push({
          type: "damageDealt",
          attackerName,
          defenderName: target.character.name,
          damage: damageResult.total,
          hpRemaining: target.character.currentHp,
          maxHp: target.character.maxHp,
        });

        if (target.character.currentHp <= 0) {
          combat.events.push({
            type: "combatantDefeated",
            combatantName: target.character.name,
          });
        }
      } else {
        combat.events.push({
          type: "miss",
          attackerName,
          defenderName: target.character.name,
        });
      }
      break;
    }

    case "dash":
    case "dodge":
    case "disengage":
      // No mechanical effect in this milestone — these are valid but no-op
      // without spatial modeling or condition tracking.
      break;

    default: {
      const exhaustiveCheck: never = intent;
      throw new Error(`Unknown intent type: ${(exhaustiveCheck as Intent).type}`);
    }
  }

  const wrapped = advanceTurn(combat);
  if (wrapped) {
    combat.pendingNewRound = true;
  }

  if (isCombatOver(combat)) {
    const survivors = combat.participants
      .filter(isStanding)
      .map((p) => p.character.name);
    combat.events.push({
      type: "combatEnded",
      winnerNames: survivors,
      rounds: combat.round,
    });
  }

  return getCombatState(combat);
}

/**
 * Returns true when only one combatant (or fewer) remains standing.
 */
export function isCombatOver(combat: Combat): boolean {
  return combat.participants.filter(isStanding).length <= 1;
}
