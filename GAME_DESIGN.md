# MineQuest - Game Design Document

## 🎮 Core Mechanics

### Minesweeper Foundation

**Grid System**
- Classic minesweeper rules
- Numbers indicate adjacent mine count (8 directions)
- Revealing a zero auto-reveals adjacent cells
- Chording: Click number to reveal surrounding cells if flags match count

**Controls** (Mobile-First)
- **Mobile** (Primary): Tap reveal, long-press flag
- **Desktop** (Secondary): Left-click reveal, right-click flag
- **Chording**: Tap/click on revealed number

### Modifications to Classic Minesweeper

**HP System** (Forgiving)
- Start with 3 HP per run
- Hitting mine costs 1 HP (not instant death)
- 0 HP = run ends
- Can heal with items/potions

**Resource Generation**
- Revealing safe cells generates coins (+10 per cell)
- Revealing safe cells generates mana (+5 per cell)
- Correctly flagging mines generates mana (+10 per flag)
- Perfect board clear (no damage) grants bonus (+50 coins)

## 🎯 Quest System

### Quest Types (MVP - 5 Quests)

**1. Classic Clear**
- Objective: Clear all 5 boards
- Bonus: +20 gems for perfect clear (no damage)
- Difficulty: Easy

**2. Treasure Hunter**
- Objective: Collect 500 coins across the run
- Bonus: +30 gems for 750+ coins
- Difficulty: Medium

**3. Speed Runner**
- Objective: Complete 5 boards in under 8 minutes
- Bonus: +40 gems for under 5 minutes
- Difficulty: Hard

**4. Perfect Game**
- Objective: Complete 3 boards without taking damage
- Bonus: +50 gems for 5 boards perfect
- Difficulty: Very Hard

**5. Boss Slayer**
- Objective: Defeat the boss board
- Bonus: +35 gems for defeating without items
- Difficulty: Hard

### Future Quest Ideas (Post-MVP)
- Rescue Mission: Find hidden NPCs in cells
- Artifact Hunt: Collect special cells
- Minimalist: Win with no items purchased
- Pacifist: Flag all mines without revealing them

## 👥 Character Classes

### Explorer (Starter)
- **Starting HP**: 3
- **Starting Mana**: 0
- **Special**: None (balanced baseline)
- **Unlock**: Available from start

### Scout (Unlock at 5 quest completions)
- **Starting HP**: 3
- **Starting Mana**: 50
- **Special**: "Reveal Vision" - First reveal shows 3x3 area instead of single cell
- **Unlock**: Complete 5 quests

### Merchant (Unlock at 100 gems spent)
- **Starting HP**: 3
- **Starting Mana**: 0
- **Special**: "Deep Pockets" - Earn 2x coins from cells
- **Unlock**: Spend 100 gems on unlocks

### Tank (Unlock at: take 50 total damage)
- **Starting HP**: 5
- **Starting Mana**: 0
- **Special**: "Iron Will" - Regenerate 1 HP every 3 boards
- **Unlock**: Take 50 total damage across all runs

### Mage (Unlock at: use 1000 total mana)
- **Starting HP**: 2
- **Starting Mana**: 150
- **Special**: "Arcane Mastery" - Active abilities cost 25% less mana
- **Unlock**: Use 1000 total mana across all runs

## 📦 Item System

### Item Categories

**Passive Items** (10 total)
- Always active, no cost to use
- Build foundation of your strategy
- Can stack multiple

**Active Abilities** (5 total)
- Cost mana to activate
- Powerful tactical options
- Can only hold 3 active abilities max

**Consumables** (5 total)
- Single use, destroyed after
- Cheap, tactical solutions
- No limit on carrying

### Item Rarity

**Common** (White)
- Drop rate: 60%
- Cost: 20-40 coins
- Power level: Small utility bonuses

**Rare** (Blue)
- Drop rate: 30%
- Cost: 60-100 coins
- Power level: Moderate tactical advantages

**Legendary** (Gold)
- Drop rate: 10%
- Cost: 150-250 coins
- Power level: Game-changing effects

### Complete Item List (MVP)

#### Passive Items

1. **Shield Generator** [Common]
   - Effect: +1 Max HP
   - Cost: 30 coins

2. **Coin Magnet** [Common]
   - Effect: +50% coins from revealing cells
   - Cost: 40 coins

3. **Mana Crystal** [Common]
   - Effect: +50 Max Mana
   - Cost: 25 coins

4. **Lucky Charm** [Rare]
   - Effect: +15% chance for better shop items
   - Cost: 60 coins

5. **Fortify Armor** [Rare]
   - Effect: Gain 1 shield when revealing 5+ consecutive safe cells
   - Cost: 80 coins

6. **Treasure Sense** [Rare]
   - Effect: Cells worth 15+ coins glow slightly
   - Cost: 70 coins

7. **Flag Efficiency** [Common]
   - Effect: Correctly flagging a mine grants +15 mana
   - Cost: 35 coins

8. **Second Wind** [Rare]
   - Effect: Heal 1 HP when clearing a board perfectly
   - Cost: 90 coins

9. **Range Boost** [Legendary]
   - Effect: All area abilities affect +1 extra ring of cells
   - Cost: 180 coins

10. **Combo Master** [Legendary]
    - Effect: Chording grants +5 mana and +10 coins
    - Cost: 200 coins

#### Active Abilities

1. **Scan Area** [Common]
   - Effect: Reveal 3x3 area safely (doesn't trigger mines)
   - Cost: 50 mana
   - Shop Price: 40 coins

2. **Safe Column** [Rare]
   - Effect: Reveal entire column of cells safely
   - Cost: 100 mana
   - Shop Price: 80 coins

3. **Mine Detector** [Rare]
   - Effect: Highlight positions of 3 random mines
   - Cost: 75 mana
   - Shop Price: 70 coins

4. **Auto-Chord** [Legendary]
   - Effect: Automatically perform all safe chords on the board
   - Cost: 125 mana
   - Shop Price: 150 coins

5. **Rewind** [Legendary]
   - Effect: Undo last 3 reveals (doesn't restore HP)
   - Cost: 150 mana
   - Shop Price: 200 coins

#### Consumables

1. **Health Potion** [Common]
   - Effect: Heal 1 HP immediately
   - Cost: 15 coins

2. **Vision Scroll** [Common]
   - Effect: Reveal 5 random safe cells
   - Cost: 20 coins

3. **Shield Token** [Rare]
   - Effect: Next mine hit deals no damage
   - Cost: 25 coins

4. **Mana Potion** [Common]
   - Effect: Restore 50 mana immediately
   - Cost: 10 coins

5. **Lucky Coin** [Common]
   - Effect: Reroll current shop offerings
   - Cost: 30 coins

## 🎲 Progression & Unlocks

### Gem Economy

**Earning Gems**
- Complete quest objective: +20 gems (base)
- Quest bonus achieved: +10 to +30 gems (varies by quest)
- Clear boss board: +15 gems
- Perfect board clear: +5 gems per board
- First time achievements: +50 gems (one-time)

**Spending Gems**
- Unlock new item (adds to pool): 50 gems
- Unlock character class: 100 gems
- Unlock new quest type: 75 gems
- Unlock cosmetic theme: 25 gems

### Unlockables (MVP)

**Items** (Start with 10, unlock 10 more)
- Initial pool: 5 common passives, 2 common actives, 3 consumables
- Unlock new items by spending gems or achievements

**Characters** (Start with 1, unlock 4 more)
- Explorer: Available from start
- Scout, Merchant, Tank, Mage: Unlock via achievements

**Quests** (Start with 3, unlock 2 more)
- Classic Clear, Treasure Hunter, Boss Slayer: Available from start
- Speed Runner, Perfect Game: Unlock after 10 total completions

### Achievement System

| Achievement | Requirement | Reward |
|-------------|-------------|--------|
| First Steps | Complete first quest | +50 gems |
| Veteran | Complete 10 quests | Unlock Scout class |
| Rich | Earn 1000 total coins | Unlock Merchant class |
| Survivor | Take 50 total damage | Unlock Tank class |
| Arcane Scholar | Use 1000 total mana | Unlock Mage class |
| Perfect Run | Complete quest with no damage | +100 gems |
| Speed Demon | Complete run in under 5 minutes | Unlock Speed Runner quest |
| Collector | Unlock all 20 items | +200 gems |
| Master | Complete all 5 quests | Unlock Hard Mode |

## 📊 Difficulty Scaling

### Board Progression (Single Run)

**Board 1: Tutorial**
- Grid Size: 8x8
- Mine Count: 10 (15.6% density)
- Coin Multiplier: 1x
- Special: None

**Board 2: Easy**
- Grid Size: 10x10
- Mine Count: 15 (15% density)
- Coin Multiplier: 1x
- Special: None

**Board 3: Normal**
- Grid Size: 12x12
- Mine Count: 25 (17.4% density)
- Coin Multiplier: 1.5x
- Special: None

**Board 4: Hard**
- Grid Size: 14x14
- Mine Count: 35 (17.9% density)
- Coin Multiplier: 2x
- Special: None

**Board 5: Very Hard**
- Grid Size: 14x14
- Mine Count: 40 (20.4% density)
- Coin Multiplier: 2.5x
- Special: None

**Board 6: BOSS**
- Grid Size: 16x16
- Mine Count: 50 (19.5% density)
- Coin Multiplier: 3x
- Special: Boss Mechanic (TBD - e.g., some cells heal boss, must avoid them)

### Difficulty Modes (Post-MVP)

**Normal Mode**
- Standard difficulty as described above

**Hard Mode** (Unlock after completing all quests)
- +25% mine density
- -1 starting HP
- Shop items cost +50%
- Reward: 2x gems

**Endless Mode** (Future)
- Infinite boards with increasing difficulty
- Leaderboard for longest streak

## 🎨 Visual & Audio Design

### Visual Style Guide

**Color Palette**
- Background: Dark theme (#1a1a2e)
- Cells: Light gray (#eee)
- Numbers: Color-coded (1=blue, 2=green, 3=red, etc.)
- Mines: Red (#e63946)
- Flags: Yellow (#f4a261)

**UI Elements**
- Clean, flat design
- Large touch targets (minimum 44x44px)
- High contrast for accessibility
- Smooth animations (CSS transitions)

**Feedback (Juice)**
- Cell reveal: Fade-in animation (150ms)
- Coin gain: +10 floating text
- Mana gain: Blue particle effect
- Damage: Screen shake + red flash
- Item use: Ability-specific effect

### Audio Design (Post-MVP)

**Sound Effects**
- Cell reveal: Soft "pop"
- Flag place: "Click"
- Mine hit: "Explosion" + rumble (mobile)
- Coin gain: "Ding"
- Item purchase: "Cash register"
- Boss defeated: Epic "Victory" sound

**Music**
- Ambient background track
- Intensity increases with board difficulty
- Mute toggle available

## 🔄 Game Flow

### Main Menu
```
[MineQuest Logo]

> Start Run
  Choose Quest
  Collection (Items/Achievements)
  Settings
  Credits
```

### Run Flow
```
1. Quest Selection Screen
   ↓
2. Character Selection Screen
   ↓
3. Board 1 (with tutorial hints if first time)
   ↓
4. Shop Screen (3 random items)
   ↓
5. Board 2
   ↓
6. Shop Screen
   ↓
7. Board 3
   ↓
8. Shop Screen
   ↓
9. Board 4
   ↓
10. Shop Screen
    ↓
11. Board 5
    ↓
12. Shop Screen (last chance for boss)
    ↓
13. BOSS Board
    ↓
14. Victory/Defeat Screen (gems earned, stats)
    ↓
15. Return to Main Menu
```

### In-Game HUD

**Top Bar**
- HP: ❤️❤️❤️ (visual hearts)
- Mana: [====    ] 50/100 (bar)
- Coins: 💰 250

**Bottom Bar**
- Active Abilities: [Icon] [Icon] [Icon]
- Consumables: [Icon x2] [Icon x1]

**Side Panel** (Desktop only)
- Quest objective progress
- Board number (Board 3/6)
- Passive items (icons)

## 🎯 Balancing Principles

1. **First run should be winnable**: No required unlocks
2. **Items feel impactful**: Every item noticeably changes gameplay
3. **Multiple viable strategies**: No single "best build"
4. **Comeback mechanics**: Bad RNG shouldn't auto-lose
5. **Skill matters**: Good play should overcome bad luck

## 📱 Mobile-First Design (PRIMARY Platform)

**This game is designed mobile-first. Desktop is supported but is not the primary experience.**

### Core Philosophy
- Design for phone touch input FIRST, then ensure desktop works
- Portrait orientation is the default; landscape is optional
- One-handed play should be comfortable (thumb-reachable zones)
- Desktop mouse/keyboard support is an enhancement

### Touch Controls (Primary Input)
- Tap: Reveal cell
- Long-press (500ms): Flag cell
- Tap revealed number: Chord (auto-reveal if flags match)
- All actions achievable with one thumb

### Desktop Controls (Secondary/Enhancement)
- Left-click: Reveal cell
- Right-click: Flag cell
- Click revealed number: Chord
- Keyboard navigation (arrows, Space, F, C)

### UI Requirements
- Vertical layout (portrait-first orientation)
- Bottom-sheet shop UI (thumb-reachable)
- Large touch targets (60x60px minimum, 44x44px absolute minimum)
- Haptic feedback on flag actions (where supported)
- Critical controls in lower half of screen (thumb zone)

### Performance Targets
- 60 FPS on mid-range phones, 30+ FPS on low-end
- <100ms input latency
- <5MB total download size
- Test on mobile browsers BEFORE desktop

### Mobile-First Anti-Patterns to Avoid
- ❌ Designing desktop UI first and "adapting" for mobile
- ❌ Hover-dependent features (mobile has no hover)
- ❌ Requiring precise clicking (finger is less precise than mouse)
- ❌ Small touch targets (<44px)
- ❌ Testing only on desktop during development

---

**Last Updated**: 2025-12-30
**Version**: 0.3.0
