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

**D&D 2024 under the System Reference Document (SRD 5.2) / CC-BY-4.0**

### Why SRD 5.2?

- **CC-BY-4.0 is simpler** — one attribution paragraph, no "Open Game Content" / "Product Identity" distinction, no full license text reproduction required
- **CC-BY-4.0 is not viral** — downstream users can license their own work however they want
- **CC-BY-4.0 is irrevocable by design** — survived the 2023 OGL deauthorization attempt through its own structure
- **SRD 5.2 has more content** — weapon mastery, expanded rules glossary, exploration mechanics, additional species (Goliath), additional backgrounds (Criminal, Sage, Soldier)
- **SRD 5.2 aligns with 2024/5.5e rules** — the current direction of D&D

### What SRD 5.2 Includes

- 12 core classes with subclasses
- 7 species (Dwarf, Elf, Halfling, Human, Goliath, and more)
- 6 backgrounds (including Criminal, Sage, Soldier)
- All core spells through 5th level
- Monster manual subset (100+ monsters)
- Full combat rules, ability checks, saving throws
- Weapon mastery mechanics
- Exploration mechanics
- Rules glossary
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

## Architecture

The project is split into two layers:

- **Engine** — a content-agnostic game engine (MIT licensed). Handles combat resolution, character state, dice, and event emission.
- **Game content** — data and content that plugs into the engine. Lives in clearly marked directories.

This separation means the engine can be extracted into its own package/repo independently of any game content.

## Licensing

| Layer | License | File |
|-------|---------|------|
| Code (engine + game code) | MIT | `LICENSE` |
| SRD 5.2 game content | CC-BY-4.0 | `LICENSE` (attribution section) |
| Original game content | CC-BY-4.0 | `LICENSE` (declared) |

Game mechanics (ability scores, AC, HP, attack rolls) are not copyrightable. SRD 5.2 content is used under CC-BY-4.0. Original content created for this project is released under CC-BY-4.0.

## Development Principles

1. Build the engine first — no AI dependency for core gameplay
2. Use SRD 5.2 as the mechanical foundation
3. Design for AI content injection later (monsters, NPCs, quests, items)
4. Keep it FOSS and community-friendly
5. Maintain clean separation between engine code and game content
