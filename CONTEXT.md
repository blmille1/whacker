# Whacker

A D&D 5e-style text adventure engine. This context defines the domain language for the game's mechanics, characters, combat, equipment, and world — based on the SRD 5.2 ruleset.

## Language

### Core concepts

**Player**:
The human (or future AI) at the keyboard. The agent that issues commands. A Player may control one or more Characters.
_Avoid_: user, gamer

**Character**:
An in-world avatar. Has ability scores, HP, AC, inventory, and so on. A Character is controlled by a Player (or by the engine, in the case of NPCs). Both the Rogue and the Freeport Guard are Characters.
_Avoid_: actor, entity, unit

**NPC**:
A Character not controlled by a human Player — monsters, enemies, bystanders, and future AI-controlled allies.
_Avoid_: mob, enemy, monster (use Monster for stat-block creatures)

### Characters

**Class**:
A Character's primary vocation (Fighter, Rogue, Wizard, Cleric, etc.). Grants Features, determines hit die, saving throw proficiencies, and weapon/armor proficiencies. The SRD 5.2 defines 12 core classes. A Character has exactly one Class.
_Avoid_: job, profession, archetype

**Species**:
A Character's kind (Human, Elf, Dwarf, Halfling, Goliath, Goblin, etc.). Grants racial Traits (Darkvision, Keen Senses, etc.) and physical characteristics. The SRD 5.2 includes 7 species. A Character has exactly one Species.
_Avoid_: race (older D&D term)

**Background**:
A Character's history and lifestyle (Criminal, Sage, Soldier, etc.). Grants additional skill proficiencies, tool proficiencies, languages, and a Background Feature. The SRD 5.2 includes 6 backgrounds. A Character has exactly one Background.
_Avoid_: origin, backstory

**Level**:
A Character's measure of progression and overall capability. Determines proficiency bonus, hit points gained per level, and which Features are unlocked. Starts at 1.
_Avoid_: tier, rank

**Experience Points (XP)**:
A measure of progress toward the next Level. Awarded for defeating NPCs and overcoming challenges. When XP reaches a threshold, the Character Levels Up.
_Avoid_: exp, points

**Hit Points (HP)**:
A Character's life force. Reduced by Damage. At 0 HP a Character is Unconscious, not dead — death requires failed death saves or a killing blow. Has a maximum (maxHp) and current value.
_Avoid_: health, life

**Hit Die**:
A die type (d6, d8, d10, d12) determined by Class. Used to regain HP during a Short Rest and to determine HP gained on level up. A Character has a number of Hit Dice equal to their Level.
_Avoid_: health die, life die

**Armor Class (AC)**:
How hard a Character is to hit. An attack roll must meet or exceed the target's AC to connect. Determined by armor, shield, and Dexterity modifier.
_Avoid_: defense, defence

**Ability Scores**:
The six core attributes: Strength, Dexterity, Constitution, Intelligence, Wisdom, Charisma. Each is a number (typically 1–20) that yields an Ability Modifier via `(score - 10) / 2` rounded down. Drives nearly every roll in the game.
_Avoid_: stats, attributes

**Ability Modifier**:
The bonus or penalty derived from an Ability Score. Applied to attack rolls, damage rolls, saving throws, skill checks, and other rolls tied to that ability.
_Avoid_: mod, bonus

**Proficiency Bonus**:
A bonus (+2 at level 1, scaling with Level) added to rolls a Character is proficient in: attacks with proficient weapons, proficient saving throws, proficient skills, and proficient tools. Determined solely by Level.
_Avoid_: prof, competence bonus

**Skill**:
A specific area of expertise (Stealth, Perception, Arcana, etc.) tied to an Ability Score. A Character is proficient in a subset of skills, determined by Class and Background. A proficient skill check adds the Proficiency Bonus to the roll.
_Avoid_: proficiency (use for Equipment Proficiency)

**Ability Check**:
A roll made to attempt a task not covered by a Skill — opening a door (Strength), recalling lore (Intelligence), etc. Roll d20 + Ability Modifier (+ Proficiency Bonus if proficient in the relevant skill). Must meet or exceed a Difficulty Class to succeed.
_Avoid_: check, roll, skill check (use for Skill-based rolls)

**Difficulty Class (DC)**:
The target number an Ability Check, Saving Throw, or contest must meet or exceed to succeed. Set by the engine based on the task or by an attacker's spell DC.
_Avoid_: target number, threshold

**Saving Throw**:
A defensive roll made to resist or avoid an effect (a spell, a trap, poison, etc.). Tied to one of the six Ability Scores. A Character is proficient in two, determined by Class.
_Avoid_: save, resist

**Speed**:
How far a Character can move on a Turn, in feet (typically 25 or 30 for player Species). Determined by Species, modified by armor and Conditions.
_Avoid_: move rate, movement speed

**Size**:
A Character's physical footprint (Small, Medium, Large, etc.). Determines space controlled in combat and interacts with grappling, carrying capacity, and hiding. Most player Species are Medium.
_Avoid_: category (too generic)

**Initiative**:
The order in which Characters act in a Combat. Determined by a Dexterity check (d20 + Dexterity modifier) rolled at the start of a Combat. Ties broken by higher Dexterity score, then randomly.
_Avoid_: turn order, initiative order

**Condition**:
A status effect applied to a Character (Unconscious, Poisoned, Stunned, Frightened, Grappled, Prone, etc.). Each Condition modifies what a Character can do. Defined by the SRD; the engine applies and resolves them.
_Avoid_: status, debuff, buff

**Death Save**:
A roll made at the start of a Character's Turn while at 0 HP. Three successes stabilizes the Character; three failures kills them. A roll of 20 restores 1 HP; a roll of 1 counts as two failures.
_Avoid_: death check, dying roll

**Language**:
A Character can speak, read, and write a set of languages. Determined by Species and Background. Common is the default trade language.
_Avoid_: tongue, dialect

### Combat

**Combat**:
A discrete, turn-based fight between two or more Characters with a clear beginning and end. Has an end condition (e.g., one side defeated, all PCs unconscious) and a final state — but no explicit winner field. Who won is derived from the final state, not modeled as data. A Combat is one kind of activity; non-fight activities (exploration, negotiation) are out of scope for now.
_Avoid_: fight, battle, encounter (use Encounter for the broader concept)

**Turn**:
One Character's opportunity to act within a Combat. On a Turn, a Character may move, take an Action, and so on.
_Avoid_: move (use for Movement), go

**Round**:
One full cycle of Turns in which every participant in the Combat has acted exactly once. The pause in the demo occurs between Rounds.
_Avoid_: cycle, phase

**Action**:
A capital-A Action as defined by the SRD — one per Turn, from a defined list (Attack, Cast a Spell, Dash, Disengage, Dodge, Help, Hide, Ready, Search, Use an Object). The engine resolves Actions; it does not invent its own action types beyond what the SRD specifies. Related but distinct: Bonus Action (granted by specific features/spells, one per Turn) and Reaction (available once per round, triggered by specific events).
_Avoid_: move (ambiguous), activity

**Attack**:
An Action or part of an Action where a Character attempts to strike a target. Roll d20 + attack bonus vs target's AC. A roll of 20 is a Critical Hit; a roll of 1 is an Automatic Miss.
_Avoid_: swing, strike, hit (use for the result)

**Attack Bonus**:
The total bonus added to an attack roll. For weapon attacks: Proficiency Bonus (if proficient) + Strength or Dexterity modifier. For spell attacks: Spell Attack Bonus.
_Avoid_: attack modifier, hit bonus

**Critical Hit**:
An attack roll of natural 20. Automatically hits regardless of AC, and rolls all damage dice twice.
_Avoid_: crit, natural 20

**Critical Miss**:
An attack roll of natural 1. Automatically misses. (No additional penalty in standard D&D, but some tables add one.)
_Avoid_: fumble, natural 1

**Damage**:
HP removed from a Character as a result of a hit. Has a type (slashing, piercing, bludgeoning, fire, etc.) that interacts with Resistances and Vulnerabilities.
_Avoid_: hurt, harm

**Damage Roll**:
The dice rolled to determine how much Damage a hit deals. Determined by the weapon or spell. A Critical Hit rolls the dice twice and sums both.
_Avoid_: damage dice, roll damage

**Resistance**:
A trait that halves (round down) incoming Damage of a specific type. Granted by Species, Class Features, Spells, or Equipment.
_Avoid_: damage reduction, DR

**Vulnerability**:
A trait that doubles incoming Damage of a specific type. Rare; mostly found on certain monsters.
_Avoid_: weakness

**Immunity**:
A trait that negates incoming Damage or a Condition entirely.
_Avoid_: invulnerability

**Advantage**:
Roll twice, take the higher result. Granted by favorable Conditions, Features, Spells, or circumstances.
_Avoid_: adv, bonus roll

**Disadvantage**:
Roll twice, take the lower result. Granted by harmful Conditions, Spells, or circumstances. Advantage and Disadvantage cancel each other regardless of how many sources.
_Avoid_: dis, penalty roll

**Movement**:
A Character can move up to their Speed on their Turn. Can be broken up before and after an Action. Difficult terrain costs double.
_Avoid_: move (as a verb), walking

**Cover**:
A defensive bonus to AC and Dexterity Saving Throws granted by obstacles. Half cover (+2), three-quarters cover (+5), full cover (cannot be targeted directly).
_Avoid_: concealment, hiding

**Flanking**:
(Optional rule.) Two allies on opposite sides of an enemy gain Advantage on melee attacks against that enemy.
_Avoid_: surround, pincer

**Opportunity Attack**:
A Reaction taken when a hostile Character moves out of reach. One melee attack against the moving Character.
_Avoid_: attack of opportunity, AoO

**Grapple**:
An Action to grab a Contest (Athletics vs. Athletics or Acrobatics). Success Grapples the target (speed becomes 0).
_Avoid_: grab, restrain

**Shove**:
An Action to push a target 5 feet away or knock them Prone. Resolved as a Contest like Grapple.
_Avoid_: push, knockback

**Contest**:
A roll-off between two Characters, each rolling d20 + Ability Modifier (+ Proficiency if applicable). Higher total wins. Ties go to the acting Character (or defender, depending on context).
_Avoid_: opposed check, versus roll

**Rest**:
A period of downtime that restores resources. Short Rest (at least 1 hour): spend Hit Dice to regain HP, recover some Class Features. Long Rest (at least 8 hours): regain all HP, all Hit Dice (half for some classes), all Spell Slots, and most Class Features.
_Avoid_: sleep, break, downtime

### Spellcasting

**Feature**:
Something a Character can do granted by their Class, Species, or Background. Examples: Second Wind (Fighter), Sneak Attack (Rogue), Darkvision (Elf). Some Features grant Actions, some are passive, some are usable a limited number of times per rest.
_Avoid_: ability, trait, power

**Spell**:
A kind of Feature that requires Spellcasting. Has a level (0–5 in SRD), a casting time, a range, components (verbal, somatic, material), and an effect. Cast using a Spell Slot.
_Avoid_: magic, incantation

**Spell Slot**:
A resource expended to cast a Spell. Number and level of slots determined by Class and Level. Regained on a Long Rest (or Short Rest for some classes).
_Avoid_: spell charge, mana

**Cantrip**:
A Spell of level 0 that can be cast at will, without expending a Spell Slot. Scales in power with the caster's Level.
_Avoid_: at-will spell, level-zero spell

**Spellcasting Ability**:
The Ability Score (Intelligence, Wisdom, or Charisma) used for a Class's spellcasting. Determines the Spell Save DC and Spell Attack Bonus.
_Avoid_: casting stat, magic ability

**Spell Save DC**:
The target number an enemy must meet or exceed with a Saving Throw to resist a Spell. Calculated as 8 + Proficiency Bonus + Spellcasting Ability Modifier.
_Avoid_: spell DC, magic DC

**Spell Attack Bonus**:
The bonus added to an attack roll made with a Spell. Calculated as Proficiency Bonus + Spellcasting Ability Modifier.
_Avoid_: spell hit bonus, magic attack

**Concentration**:
A requirement on some Spells: the caster must maintain focus, and loses the effect if they cast another Concentration spell, take Damage and fail a Constitution save, or are Incapacitated.
_Avoid_: focus, maintain

### Equipment

**Item**:
A physical object a Character can carry, use, or equip. Includes weapons, armor, shields, potions, scrolls, tools, and adventuring gear.
_Avoid_: object, thing, gear

**Weapon**:
An Item used to make Attacks. Has damage dice, damage type, and properties (finesse, heavy, light, loading, reach, thrown, two-handed, versatile). Melee or Ranged.
_Avoid_: arm, tool (too generic)

**Armor**:
An Item worn to increase AC. Categories: light, medium, heavy, and shield. Each has an AC formula and a Strength requirement (for heavy). Wearing armor you're not proficient in imposes Disadvantage on Ability Checks and prevents casting Spells.
_Avoid_: armour (non-US spelling), protection

**Shield**:
A one-handed Item that adds +2 to AC. Requires proficiency.
_Avoid_: buckler

**Equipment Proficiency**:
A Character is proficient with certain weapons, armor, and tools (determined by Class and Background). Using an item without proficiency: no Proficiency Bonus on attacks (weapons), or Disadvantage + no spellcasting (armor).
_Avoid_: weapon proficiency, armor proficiency (use the umbrella term)

**Inventory**:
The set of Items a Character is carrying. Limited by Carrying Capacity.
_Avoid_: bag, backpack, stash

**Carrying Capacity**:
The total weight a Character can carry, equal to Strength score × 15 pounds. Encumbrance rules (optional) impose penalties when exceeded.
_Avoid_: carry limit, load

**Equipped**:
Items currently in use: worn armor, held weapons, donned shield. Only Equipped items grant their mechanical benefits.
_Avoid_: worn, held, active

**Consumable**:
An Item that is destroyed or depleted when used (potions, scrolls, ammunition). Has a limited quantity.
_Avoid_: expendable, one-use

**Magical Item**:
An Item with magical properties. May require Attunement. The SRD includes a subset of common magical items.
_Avoid_: magic item, enchanted item

**Attunement**:
A process of bonding with a Magical Item. A Character can be Attuned to at most 3 items at once. Some items require Attunement to function.
_Avoid_: bond, sync

### Dice

**Dice**:
The resolution mechanic. Expressions like `2d6+3` (roll two six-sided dice, add 3). The engine parses and evaluates dice expressions.
_Avoid_: die (singular), random

**d20 Roll**:
The core resolution roll: roll a d20, add modifiers, compare to a target number (AC, DC, or an opposing roll). Underlies Attacks, Ability Checks, Saving Throws, and Initiative.
_Avoid_: d20 check, twenty-sider

### Monsters

**Monster**:
A kind of NPC defined by a stat block rather than a Class and Level. Uses the same Character mechanics but is built from a Monster Stat Block template.
_Avoid_: creature, beast, foe

**Stat Block**:
The complete set of mechanical data for a Monster: AC, HP, Speed, Ability Scores, Skills, Resistances, Actions, Traits, etc. Analogous to a Character sheet but structured for monsters.
_Avoid_: monster sheet, creature stats

**Lair**:
A Monster's home territory. May include Lair Actions and regional effects. Out of scope for now.
_Avoid_: den, lair (as a verb)

**Lair Action**:
An action a Monster can take on a count of 20 during Initiative while in its Lair. Out of scope for now.
_Avoid_: lair ability, lair power

### World

**Encounter**:
A situation the Characters face. A Combat is one kind of Encounter; others include social encounters, traps, puzzles, and exploration challenges. The engine currently models Combat Encounters; other Encounter types are out of scope for now.
_Avoid_: scene, event, situation

**Adventure**:
A structured series of Encounters forming a complete story arc. Out of scope for now — the engine will eventually support Adventure structure, but the initial build focuses on Combat.
_Avoid_: quest, mission, campaign

**Campaign**:
A series of connected Adventures. Out of scope for now.
_Avoid_: storyline, saga
