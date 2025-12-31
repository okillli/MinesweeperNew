/**
 * AudioManager.js
 *
 * Simple audio system using Web Audio API for procedural sound effects.
 * Provides retro-style synthesized sounds for game events.
 *
 * DEPENDENCIES:
 * - None (uses native Web Audio API)
 *
 * DEPENDENTS:
 * - main.js (plays sounds on game events)
 *
 * USAGE:
 * - AudioManager.init() - Call once on user interaction
 * - AudioManager.play('reveal') - Play a sound effect
 * - AudioManager.setEnabled(true/false) - Toggle sounds
 */

class AudioManager {
  static audioContext = null;
  static enabled = true;
  static initialized = false;
  static masterVolume = 0.3;

  /**
   * Initialize the audio context (must be called after user interaction)
   */
  static init() {
    if (this.initialized) return;

    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
      console.log('AudioManager initialized');
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
      this.enabled = false;
    }
  }

  /**
   * Resume audio context if suspended (required by some browsers)
   */
  static resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  /**
   * Enable or disable sound effects
   * @param {boolean} enabled
   */
  static setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   * Check if audio is enabled
   * @returns {boolean}
   */
  static isEnabled() {
    return this.enabled && this.initialized;
  }

  /**
   * Play a sound effect by name
   * @param {string} soundName - Name of sound to play
   */
  static play(soundName) {
    if (!this.isEnabled() || !this.audioContext) return;

    // Resume context if needed
    this.resume();

    switch (soundName) {
      case 'reveal':
        this._playReveal();
        break;
      case 'reveal_cascade':
        this._playRevealCascade();
        break;
      case 'flag':
        this._playFlag();
        break;
      case 'unflag':
        this._playUnflag();
        break;
      case 'mine':
        this._playMine();
        break;
      case 'coin':
        this._playCoin();
        break;
      case 'mana':
        this._playMana();
        break;
      case 'victory':
        this._playVictory();
        break;
      case 'gameover':
        this._playGameOver();
        break;
      case 'click':
        this._playClick();
        break;
      case 'purchase':
        this._playPurchase();
        break;
      case 'error':
        this._playError();
        break;
      case 'levelup':
        this._playLevelUp();
        break;
      default:
        console.warn(`Unknown sound: ${soundName}`);
    }
  }

  // ============================================
  // SOUND GENERATORS (Web Audio API)
  // ============================================

  /**
   * Create a simple oscillator note
   */
  static _createOscillator(type, frequency, duration, volume = 1) {
    const ctx = this.audioContext;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.value = this.masterVolume * volume;

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Fade out
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }

  /**
   * Single cell reveal - short blip
   */
  static _playReveal() {
    this._createOscillator('sine', 600, 0.08, 0.4);
  }

  /**
   * Cascade reveal - rising arpeggio
   */
  static _playRevealCascade() {
    const ctx = this.audioContext;
    const notes = [400, 500, 600, 800];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this._createOscillator('sine', freq, 0.1, 0.3);
      }, i * 30);
    });
  }

  /**
   * Place flag - two-tone chirp
   */
  static _playFlag() {
    this._createOscillator('square', 440, 0.05, 0.3);
    setTimeout(() => {
      this._createOscillator('square', 660, 0.08, 0.3);
    }, 50);
  }

  /**
   * Remove flag - descending chirp
   */
  static _playUnflag() {
    this._createOscillator('square', 550, 0.05, 0.3);
    setTimeout(() => {
      this._createOscillator('square', 380, 0.08, 0.3);
    }, 50);
  }

  /**
   * Hit mine - explosion bass
   */
  static _playMine() {
    const ctx = this.audioContext;

    // Low rumble
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.value = 80;
    osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.3);

    gain.gain.value = this.masterVolume * 0.6;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);

    // Noise burst
    this._playNoiseBurst(0.15, 0.4);
  }

  /**
   * Collect coin - cheerful ding
   */
  static _playCoin() {
    this._createOscillator('sine', 880, 0.08, 0.3);
    setTimeout(() => {
      this._createOscillator('sine', 1100, 0.12, 0.25);
    }, 60);
  }

  /**
   * Gain mana - soft whoosh
   */
  static _playMana() {
    const ctx = this.audioContext;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = 300;
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.15);

    gain.gain.value = this.masterVolume * 0.2;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  }

  /**
   * Victory fanfare
   */
  static _playVictory() {
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this._createOscillator('sine', freq, 0.3, 0.4);
        this._createOscillator('triangle', freq * 0.5, 0.3, 0.2);
      }, i * 150);
    });
  }

  /**
   * Game over - sad descending
   */
  static _playGameOver() {
    const notes = [400, 350, 300, 200];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this._createOscillator('sawtooth', freq, 0.25, 0.3);
      }, i * 200);
    });
  }

  /**
   * UI click
   */
  static _playClick() {
    this._createOscillator('sine', 500, 0.04, 0.2);
  }

  /**
   * Purchase item
   */
  static _playPurchase() {
    const notes = [600, 800, 1000];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this._createOscillator('sine', freq, 0.1, 0.3);
      }, i * 50);
    });
  }

  /**
   * Error / can't do that
   */
  static _playError() {
    this._createOscillator('square', 200, 0.15, 0.3);
    setTimeout(() => {
      this._createOscillator('square', 150, 0.2, 0.3);
    }, 100);
  }

  /**
   * Level up / board complete
   */
  static _playLevelUp() {
    const notes = [440, 550, 660, 880];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this._createOscillator('sine', freq, 0.15, 0.35);
      }, i * 80);
    });
  }

  /**
   * White noise burst (for explosions)
   */
  static _playNoiseBurst(duration, volume) {
    const ctx = this.audioContext;
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    const gain = ctx.createGain();

    noise.buffer = buffer;
    gain.gain.value = this.masterVolume * volume;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    noise.connect(gain);
    gain.connect(ctx.destination);

    noise.start(ctx.currentTime);
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AudioManager;
}
