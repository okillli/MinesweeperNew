# LiMineZZsweeperIE - Game Design Document

> **Authoritative source for all game mechanics, items, and balance**
> **Read Time**: ~12 minutes

---

## 🎮 Core Mechanics

### Controls (Mobile-First)
| Input | Reveal | Flag | Chord |
|-------|--------|------|-------|
| **Touch** (Primary) | Tap | Long-press (500ms) | Tap revealed number |
| **Mouse** (Secondary) | Left-click | Right-click | Click revealed number |
| **Keyboard** | Space/Enter | F | C |

### HP System
- Start: 3 HP per run
- Mine hit: -1 HP (not instant death)
- 0 HP = run ends
- Can heal with items/potions

### Resource Generation
| Action | Coins | Mana |
|--------|-------|------|
| Reveal safe cell | +10 | +5 |
| Correct flag | — | +10 |
| Perfect board | +50 bonus | — |

---

## 🎯 Quests (5 Total)

| Quest | Objective | Bonus | Difficulty |
|-------|-----------|-------|------------|
| **Classic Clear** | Clear all 5 boards | +20 gems (no damage) | Easy |
| **Treasure Hunter** | Collect 500 coins | +30 gems (750+) | Medium |
| **Speed Runner** | Complete in <8 min | +40 gems (<5 min) | Hard |
| **Perfect Game** | 3 boards no damage | +50 gems (5 boards) | Very Hard |
| **Boss Slayer** | Defeat boss board | +35 gems (no items) | Hard |

**Starter quests**: Classic Clear, Treasure Hunter, Boss Slayer
**Unlock**: Speed Runner, Perfect Game after 10 completions

---

## 👥 Characters (5 Total)

| Class | HP | Mana | Special | Unlock |
|-------|-----|------|---------|--------|
| **Explorer** | 3 | 0 | None (baseline) | Start |
| **Scout** | 3 | 50 | First reveal = 3×3 | 5 quests |
| **Merchant** | 3 | 0 | 2× coins | 100 gems spent |
| **Tank** | 5 | 0 | Regen 1 HP/3 boards | 50 damage taken |
| **Mage** | 2 | 150 | Abilities -25% cost | 1000 mana used |

---

## 📦 Items (20 Total)

### Passive Items (10)

| Item | Rarity | Cost | Effect |
|------|--------|------|--------|
| Shield Generator | Common | 30 | +1 Max HP |
| Coin Magnet | Common | 40 | +50% coins |
| Mana Crystal | Common | 25 | +50 Max Mana |
| Flag Efficiency | Common | 35 | +15 mana per correct flag |
| Lucky Charm | Rare | 60 | +15% better shop items |
| Fortify Armor | Rare | 80 | Shield after 5+ safe reveals |
| Treasure Sense | Rare | 70 | High-value cells glow |
| Second Wind | Rare | 90 | +1 HP on perfect board |
| Range Boost | Legendary | 180 | Area abilities +1 ring |
| Combo Master | Legendary | 200 | Chord: +5 mana, +10 coins |

### Active Abilities (5)

| Ability | Rarity | Mana | Shop | Effect |
|---------|--------|------|------|--------|
| Scan Area | Common | 50 | 40 | Safely reveal 3×3 |
| Safe Column | Rare | 100 | 80 | Safely reveal column |
| Mine Detector | Rare | 75 | 70 | Highlight 3 random mines |
| Auto-Chord | Legendary | 125 | 150 | Auto-perform all safe chords |
| Rewind | Legendary | 150 | 200 | Undo last 3 reveals |

### Consumables (5)

| Item | Rarity | Cost | Effect |
|------|--------|------|--------|
| Health Potion | Common | 15 | Heal 1 HP |
| Vision Scroll | Common | 20 | Reveal 5 random safe cells |
| Mana Potion | Common | 10 | Restore 50 mana |
| Lucky Coin | Common | 30 | Reroll shop offerings |
| Shield Token | Rare | 25 | Next mine hit = no damage |

### Item Rules
- **Passive**: Always active, can stack multiples
- **Active**: Max 3 slots, cost mana to use
- **Consumable**: Single use, no carrying limit
- **Rarity rates**: 60% Common, 30% Rare, 10% Legendary

---

## 📊 Board Progression

| Board | Size | Mines | Density | Coin Mult |
|-------|------|-------|---------|-----------|
| 1 (Tutorial) | 8×8 | 10 | 15.6% | 1.0× |
| 2 (Easy) | 10×10 | 15 | 15.0% | 1.0× |
| 3 (Normal) | 12×12 | 25 | 17.4% | 1.5× |
| 4 (Hard) | 14×14 | 35 | 17.9% | 2.0× |
| 5 (V. Hard) | 14×14 | 40 | 20.4% | 2.5× |
| 6 (Boss) | 16×16 | 50 | 19.5% | 3.0× |

---

## 💎 Gem Economy

### Earning Gems
| Source | Amount |
|--------|--------|
| Complete quest | +20 base |
| Quest bonus | +10 to +30 |
| Clear boss | +15 |
| Perfect board | +5 each |
| First achievement | +50 (one-time) |

### Spending Gems
| Unlock | Cost |
|--------|------|
| New item | 50 |
| Character class | 100 |
| Quest type | 75 |
| Cosmetic theme | 25 |

---

## 🏆 Achievements

| Achievement | Requirement | Reward |
|-------------|-------------|--------|
| First Steps | Complete first quest | +50 gems |
| Veteran | Complete 10 quests | Unlock Scout |
| Rich | Earn 1000 total coins | Unlock Merchant |
| Survivor | Take 50 total damage | Unlock Tank |
| Arcane Scholar | Use 1000 total mana | Unlock Mage |
| Perfect Run | Quest with no damage | +100 gems |
| Speed Demon | Run in <5 minutes | Unlock Speed Runner |
| Collector | All 20 items | +200 gems |
| Master | All 5 quests | Unlock Hard Mode |

---

## 🔄 Game Flow

```
Menu → Quest Select → Character Select → Board 1 → Shop → Board 2 → Shop →
Board 3 → Shop → Board 4 → Shop → Board 5 → Shop → Boss → Victory/Defeat
```

### HUD Layout
- **Top Left**: ❤️ HP, 💎 Mana, 🪙 Coins
- **Top Right**: 📊 Board progress, Zoom controls
- **Bottom**: Active abilities, Consumables
- **Side** (desktop): Quest progress, Passive icons

---

## 🎨 Visual Design

### Colors
| Element | Color |
|---------|-------|
| Background | #1a1a2e (dark blue) |
| Cells | #eee (light gray) |
| Mines | #e63946 (red) |
| Flags | #f4a261 (orange) |

### Numbers
1=blue, 2=green, 3=red, 4=dark blue, 5=brown, 6=teal, 7=black, 8=gray

### Icons (Consistent Throughout)
| Resource | Icon | Color |
|----------|------|-------|
| HP | ❤️ | Red/Green |
| Mana | 💎 | Blue |
| Coins | 🪙 | Gold |
| Board | 📊 | White |
| Gems | 💠 | Cyan |

### Feedback
- Cell reveal: 150ms fade-in
- Coin gain: 🪙+10 floating text
- Mana gain: 💎+5 floating text
- Damage: ❤️-1 + screen shake + red flash
- Heal: ❤️+1 green floating text

---

## ⚖️ Balance Principles

1. **First run winnable** - No required unlocks
2. **Items feel impactful** - Every item changes gameplay
3. **Multiple strategies** - No single "best build"
4. **Comeback mechanics** - Bad RNG shouldn't auto-lose
5. **Skill matters** - Good play overcomes bad luck

---

## 📱 Mobile-First

> See [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) for design philosophy

- Touch targets: 60×60px minimum (44×44px absolute minimum)
- Portrait orientation default
- Critical controls in thumb zone
- Test mobile BEFORE desktop
- Never require hover

---

**Version**: 0.3.0 | **Last Updated**: 2025-12-30
