# Game Concept

## Project Overview

A non-AI-based text adventure game engine built first, with plans to use AI (via OpenRouter) to generate content later. The game will be free and open source software (FOSS).

## Name Candidates
Whacker.  When I was a kid, I wrote a game called whacker where it was a Rogue (EvilMatter) vs. a Freeport Guard.  It was text only and the user would start the fight and there the two would go at it, whacking each other until one won.

### Top Picks

- **Delve** — short, punchy, evocative
- **OpenQuest** — simple, clear, FOSS-feeling
- **Chronicle Engine** — sounds like a real tool
- **Sword & Source** — FOSS pun + D&D

## Ruleset

**D&D 5th Edition under the Systems Reference Document (SRD 5.1) / OGL 1.0a**

### Why SRD 5.1?

- **Free and legal** — Released by Wizards of the Coast under Open Game License
- **Massive community knowledge** — Everyone knows 5e
- **Well-documented** — Clean, comprehensive PDF
- **Proven for digital implementation** — D&D Beyond, Foundry VTT, etc.

### What SRD 5.1 Includes

- 4 core classes (Cleric, Fighter, Rogue, Wizard) with subclasses
- 4 races (Dwarf, Elf, Halfling, Human)
- All core spells through 5th level
- Monster manual subset (100+ monsters)
- Full combat rules, ability checks, saving throws
- Equipment, magic items, conditions

### Future AI-Generated Content

- Additional classes/races beyond the SRD
- Campaign-specific content
- Custom monsters and NPCs
- Adventure modules

## Architecture (Planned)

```
├── main.ts              # Game loop
├── llm.ts               # OpenRouter client wrapper (future)
├── game_state.ts        # World state, inventory, history
├── prompts.ts           # System prompt templates (future)
├── summarizer.ts        # Context compression (future)
```

## Development Principles

1. Build the engine first — no AI dependency for core gameplay
2. Use SRD 5.1 as the mechanical foundation
3. Design for AI content injection later (monsters, NPCs, quests, items)
4. Keep it FOSS and community-friendly
