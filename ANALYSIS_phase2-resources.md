# Analysis: Phase 2 - Resource Systems

**Date**: 2025-12-30
**Analyst**: Claude Code
**Status**: Complete

---

## 1. Understanding the Request

### What is being asked?
Implement the resource systems (HP, Coins, Mana) to create the roguelike gameplay loop:
- HP tracking (damage on mine hits, game over at 0 HP)
- Coin generation (+10 per safe cell revealed)
- Mana system (+5 per cell, +10 per flag)
- Reactive HUD updates showing all resources

### Why is it needed?
Phase 1 has working minesweeper mechanics, but no roguelike elements. Resources create:
- **Consequence for mistakes** (HP damage) without instant death
- **Economy for items** (coins for shop purchases)
- **Ability fuel** (mana for active abilities)
- **Strategic decisions** (risk vs reward)

### What problem does it solve?
- Current: Mine hit just shows game over, no progression
- Goal: Mine hit costs 1 HP, player has 3 chances, creates tension
- Current: No in-run rewards for playing well
- Goal: Coins reward safe reveals, enable shop purchases

### Acceptance Criteria
- [ ] HP starts at 3, decreases on mine hit, game over at 0
- [ ] Coins start at 0, +10 per safe cell revealed
- [ ] Mana starts at 0, +5 per cell, +10 per correct flag
- [ ] HUD shows real-time HP/Coins/Mana values
- [ ] HUD updates immediately on value changes
- [ ] Game over only when HP reaches 0 (not on first mine hit)

---

## 2. Scope Analysis

### Files Affected

| File | Changes | Reason |
|------|---------|--------|
| `src/core/GameState.js` | Modify resource initialization | HP/coins/mana already defined but not used |
| `src/main.js` | Add resource tracking logic | Update resources on cell reveals, mine hits, flags |
| `src/main.js` | Add `updateHUD()` calls | Make HUD reactive to state changes |
| `src/entities/Grid.js` | Possibly add `revealedCells` tracking | Need to know which cells were just revealed for coins |
| `index.html` | HUD already exists | Verify structure supports dynamic updates |

### Systems Interaction
- **GameState** → Stores current resource values
- **Grid** → Provides reveal/flag events
- **main.js** → Updates resources based on events
- **HUD (DOM)** → Displays current values

### Dependencies
- Grid.revealCell() must return revealed cell info
- Grid.toggleFlag() must return success/failure
- GameState.takeDamage() already exists
- GameState.addCoins() already exists
- GameState.addMana() already exists

### What Could Break?
- Game over flow might trigger too early if HP logic wrong
- HUD updates could be inefficient if called too often
- Coin calculation could be wrong if cascade counted multiple times
- Mana calculation could overflow if not capped

---

## 3. Assumptions & Unknowns

### Assumptions
1. HP system replaces instant game-over on mine hit
2. Starting values: HP=3, Coins=0, Mana=0, MaxMana=100
3. Coin reward is +10 per cell (not per board)
4. Mana rewards: +5 per cell, +10 per correct flag
5. HUD already has correct DOM structure
6. Resources reset between runs, not between boards

### Unknowns (Need Clarification)
1. **Coin calculation for cascade**: Do we give +10 for each cell in a cascade, or just the clicked cell?
   - **Decision**: +10 for EACH cell revealed (encourages clicking zeros)

2. **Mana cap**: Is maxMana=100 correct? Can it be increased?
   - **Decision**: 100 for now, items can increase later

3. **Flag mana bonus**: Only correct flags, or all flags?
   - **Decision**: ALL flags get +10 (we don't know if correct until revealed)

4. **HP display**: Show hearts or numbers?
   - **Decision**: Numbers for now (3/3), can add hearts in Phase 4

### Edge Cases
1. **Cascading reveals**: Multiple cells revealed at once
   - Solution: Track total cells revealed, multiply by 10
2. **Flagging and unflagging**: Mana on flag placement or toggle?
   - Solution: Only on placement (isFlagged becomes true)
3. **Mana overflow**: What if mana would exceed maxMana?
   - Solution: Cap at maxMana (already handled in GameState.addMana)
4. **Multiple mines hit**: If chord reveals multiple mines?
   - Solution: -1 HP per mine revealed

---

## 4. Risk Assessment

### Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| HUD updates cause performance issues | Low | Medium | Only update when values change, use simple DOM updates |
| Coin calculation incorrect | Medium | High | Extensive testing with cascades and chording |
| HP logic breaks game over flow | Low | Critical | Test: 3 mines → still playing, 4th mine → game over |
| Mana calculation allows exploits | Low | Medium | Cap at maxMana, validate inputs |

### Blast Radius
- **If HP logic fails**: Game becomes unplayable (too easy or impossible)
- **If coin logic fails**: Economy broken (too much/little money for shop)
- **If mana logic fails**: Abilities unusable or exploitable
- **Affected users**: All players

### Mitigation Strategies
1. Test all edge cases manually
2. Add console.log for debugging resource changes
3. Validate all resource updates (no negative values)
4. Use GameState methods (don't mutate directly)

---

## 5. Complexity Assessment

**Estimated Complexity**: **Low-Medium**

**Factors**:
- **Code Complexity**: 2/5 (straightforward math)
- **Integration Complexity**: 3/5 (need to hook into multiple places)
- **Testing Complexity**: 3/5 (need to test cascades, chording, multiple scenarios)
- **Risk Level**: 3/5 (game balance critical)

**Total Score**: 11/20

**Recommendation**:
- [x] Proceed with standard workflow
- [x] Requires detailed planning
- [ ] Needs research phase (minimal - well-understood systems)
- [ ] Requires user clarification first

---

## 6. Alternatives Considered

### Option 1: Event-Based Updates (Recommended)
**Approach**: Update resources immediately when events occur (cell reveal, mine hit, flag)

**Pros**:
- Simple to implement
- Easy to debug
- Real-time feedback

**Cons**:
- Tight coupling between game logic and resource updates

**Verdict**: ✅ Accept - Simple and effective for Phase 2

### Option 2: Observer Pattern with EventBus
**Approach**: Emit events for all game actions, resource system listens

**Pros**:
- Decoupled architecture
- Easy to add more systems later

**Cons**:
- More complex
- Overkill for current needs
- EventBus not integrated yet

**Verdict**: ❌ Defer to later phase when more systems need events

### Option 3: Frame-Based Updates
**Approach**: Check state each frame and update resources

**Pros**:
- Guaranteed updates

**Cons**:
- Inefficient
- Harder to track what caused changes

**Verdict**: ❌ Reject - Unnecessary overhead

**Recommended Approach**: **Option 1 - Direct updates on events**

---

## 7. Next Steps

1. [x] Research best practices → Quick review of roguelike resource systems
2. [ ] Create implementation plan → `PLAN_phase2-resources.md`
3. [ ] Get user approval on approach (if needed)
4. [ ] Begin implementation

---

## 8. Research Topics Needed

- [x] Roguelike resource management patterns (quick review)
- [x] HUD update performance best practices
- [x] Game balance: Starting HP, coin rates, mana rates
- [ ] Extensive research not needed (well-understood systems)

---

## Summary

**Complexity**: Low-Medium
**Risk**: Low-Medium (game balance is main concern)
**Approach**: Direct event-based resource updates
**Estimated Time**: 2-3 hours total
- Analysis: ✅ Complete (30 min)
- Research: Quick review (15 min)
- Planning: 30 min
- Implementation: 1-2 hours
- Testing: 30 min

**Key Decisions**:
- +10 coins for EACH cell in cascade (not just clicked cell)
- +10 mana for ALL flags (not just correct ones)
- HP shown as numbers (3/3) for now
- -1 HP per mine, game over at 0 HP

**Analysis Complete**: ✅ Yes
**Ready for Planning**: ✅ Yes
**User Approval Needed**: ❌ No - straightforward implementation
