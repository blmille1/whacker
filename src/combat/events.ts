export interface InitiativeRolledEvent {
  type: "initiativeRolled";
  combatantName: string;
  roll: number;
  dexModifier: number;
  total: number;
}

export interface AttackMadeEvent {
  type: "attackMade";
  attackerName: string;
  defenderName: string;
  attackRoll: number;
  attackBonus: number;
  total: number;
  targetAc: number;
}

export interface HitEvent {
  type: "hit";
  attackerName: string;
  defenderName: string;
}

export interface MissEvent {
  type: "miss";
  attackerName: string;
  defenderName: string;
}

export interface DamageDealtEvent {
  type: "damageDealt";
  attackerName: string;
  defenderName: string;
  damage: number;
  hpRemaining: number;
}

export interface CombatantDefeatedEvent {
  type: "combatantDefeated";
  combatantName: string;
}

export interface CombatEndedEvent {
  type: "combatEnded";
  winnerNames: string[];
  rounds: number;
}

export type CombatEvent =
  | InitiativeRolledEvent
  | AttackMadeEvent
  | HitEvent
  | MissEvent
  | DamageDealtEvent
  | CombatantDefeatedEvent
  | CombatEndedEvent;
