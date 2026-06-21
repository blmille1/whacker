import { createFighter, createGoblin } from "./combat/demo.js";
import { runCombat } from "./combat/combat.js";
import { renderEvents } from "./combat/renderer.js";

const ROUND_DURATION_MS = 6000;

const fighter = createFighter();
const goblin = createGoblin();

const result = runCombat([fighter, goblin]);
const lines = renderEvents(result.events);

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  let firstRound = true;

  for (const line of lines) {
    if (line.startsWith("--- Round")) {
      if (!firstRound) {
        await wait(ROUND_DURATION_MS);
      }
      firstRound = false;
    }
    console.log(line);
  }
}

void main();
