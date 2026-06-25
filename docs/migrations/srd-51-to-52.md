# Migration: SRD 5.1 → SRD 5.2.1

**Date:** 2026-06-25
**Status:** Approved
**Scope:** Documentation + license + test descriptions only. No logic changes.

## Why

SRD 5.2.1 is available under CC-BY-4.0 exclusively. This is a simpler, non-viral, internationally recognized license compared to OGL 1.0a. The project has no SRD-derived data structures in code yet, so migration cost is minimal.

Key reasons:
- **CC-BY-4.0 is simpler** — one attribution paragraph, no "Open Game Content" / "Product Identity" distinction, no full license text reproduction requirement
- **CC-BY-4.0 is not viral** — downstream users can license their own work however they want
- **CC-BY-4.0 is irrevocable by design** — survived the 2023 OGL deauthorization attempt through its own structure
- **SRD 5.2.1 has more content** than SRD 5.1 — weapon mastery, expanded rules glossary, exploration mechanics, additional species (Goliath), additional backgrounds (Criminal, Sage, Soldier)
- **SRD 5.2.1 aligns with 2024/5.5e rules** — the current direction of D&D

## What Changed

### 1. LICENSE — Added CC-BY-4.0 section for game content

**File:** `LICENSE`

Added a "Game Content (SRD 5.2)" section after the MIT section containing:
- Required SRD 5.2 attribution statement from Wizards of the Coast
- Declaration that original game content is also released under CC-BY-4.0

The attribution statement:
> This work includes material from the System Reference Document 5.2 ("SRD 5.2") by Wizards of the Coast LLC, available at https://www.dndbeyond.com/srd. The SRD 5.2 is licensed under the Creative Commons Attribution 4.0 International License, available at https://creativecommons.org/licenses/by/4.0/legalcode.

### 2. LICENSE-OGL — Deleted

**File:** `LICENSE-OGL` → **removed**

The OGL 1.0a never applied to actual content in the codebase. The file existed as a placeholder for future SRD 5.1 game content. It is preserved in git history if ever needed.

### 3. README.md — Updated ruleset and licensing sections

**File:** `README.md`

Changes:
- "D&D 5th Edition under the Systems Reference Document (SRD 5.1) / OGL 1.0a" → "D&D 2024 under the System Reference Document (SRD 5.2) / CC-BY-4.0"
- "Why SRD 5.1?" section → "Why SRD 5.2?" with updated rationale
- "What SRD 5.1 Includes" → "What SRD 5.2 Includes" with expanded content list (added weapon mastery, exploration mechanics, rules glossary, 12 classes, 7 species, 6 backgrounds)
- Licensing table: replaced OGL 1.0a with CC-BY-4.0, removed SRD 5.1 row, added SRD 5.2 row
- "SRD 5.1 content is used under the Open Game License" → "SRD 5.2 content is used under CC-BY-4.0"

### 4. MISSION.md — Updated ruleset reference

**File:** `MISSION.md`

- "D&D 5e text adventure engine, TypeScript, FOSS, SRD 5.1 ruleset" → "D&D 2024 text adventure engine, TypeScript, FOSS, SRD 5.2 ruleset"

### 5. learning-records/003 — Updated project context

**File:** `learning-records/003-project-context-dnd-engine.md`

- "SRD 5.1 (OGL 1.0a)" → "SRD 5.2 (CC-BY-4.0)"

### 6. .scratch/combat/PRD.md — Updated ruleset throughout

**File:** `.scratch/combat/PRD.md`

- All "SRD 5.1" → "SRD 5.2"
- "D&D 5e" (where ruleset-specific) → "D&D 2024"
- "OGL" references → "CC-BY-4.0"
- "SRD 5.1 stats" → "SRD 5.2 stats"

### 7. .scratch/combat/issues/04 — Updated SRD version

**File:** `.scratch/combat/issues/04-hardcoded-demo-and-text-log.md`

- "SRD 5.1 stats" → "SRD 5.2 stats" (3 occurrences)
- "SRD 5.1 values" → "SRD 5.2 values" (1 occurrence)

### 8. src/combat/demo.test.ts — Updated test descriptions

**File:** `src/combat/demo.test.ts`

- `it("has SRD 5.1 ability scores")` → `it("has SRD 5.2 ability scores")` (2 occurrences)

## What Was NOT Changed

- **No TypeScript logic changes** — Fighter/Goblin stats, combat resolution, event types, character interface are all unchanged. The stat values are the same in both SRDs.
- **No new 2024 mechanics added** — weapon mastery, revised action economy, capitalized game terms in data, feat taxonomy: these will be introduced naturally when building future slices (interactive combat, character creation)
- **package-lock.json** — references to "5.1" are npm package versions (estraverse, postcss, etc.), not SRD
- **src/combat/demo.ts** — no SRD version string in this file
- **src/combat/combat.ts, events.ts, renderer.ts** — no SRD version references
- **src/character/character.ts, stats.ts** — no SRD version references
- **src/dice/dice.ts** — no SRD version references

## Verification

After migration, the following grep should return zero hits (excluding node_modules, .git, package-lock.json):

```bash
grep -ri "5\.1\|OGL\|ogl" --include="*.md" --include="*.ts" --include="*.mjs" \
  --exclude-dir=node_modules --exclude-dir=.git
```

The word "SRD" should only appear alongside "5.2" or in the phrase "System Reference Document."

## License Structure After Migration

| Layer | License | Location |
|-------|---------|----------|
| Engine code | MIT | `LICENSE` (section 1) |
| SRD 5.2 game content | CC-BY-4.0 | `LICENSE` (section 2 — attribution) |
| Original game content | CC-BY-4.0 | `LICENSE` (section 2 — declared) |

## Future Considerations

- When building character creation (next major slice), use SRD 5.2 class/species/background data structures with 2024 mechanics (weapon mastery, revised action economy, capitalized game terms)
- SRD 5.2 is part of the official errata process — future patch versions (5.2.2, etc.) will follow core rulebook errata; check https://www.dndbeyond.com/srd for updates
- The Conversion Guide (`Converting to SRD 5.2.1`) tags every change as `[New Rule]`, `[Revised Rule]`, `[New Name]`, or `[Omitted Rule]` — use it when implementing new 2024 mechanics
- If you ever want to use Forgotten Realms IP or Beholders etc., that requires the DMsGuild license, not CC-BY-4.0
