/**
 * Web Audio procedural dreamy sound engine.
 * Generates celestial piano chords, chimes, and ambient sparkles with zero external dependencies.
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isMelodyPlaying: boolean = false;
  private loopTimer: number | null = null;
  private noteTimers: number[] = [];
  private masterGain: GainNode | null = null;
  private melodyGain: GainNode | null = null;

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.6;
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public getMelodyPlaying(): boolean {
    return this.isMelodyPlaying;
  }

  public toggleMelody(): boolean {
    if (this.isMelodyPlaying) {
      this.stopMelody();
      return false;
    } else {
      this.startMelody();
      return true;
    }
  }

  public startMelody() {
    if (this.isMelodyPlaying) return;
    const ctx = this.initContext();
    if (!ctx) return;

    this.melodyGain = ctx.createGain();
    this.melodyGain.gain.setValueAtTime(1, ctx.currentTime);
    if (this.masterGain) {
      this.melodyGain.connect(this.masterGain);
    } else {
      this.melodyGain.connect(ctx.destination);
    }

    this.isMelodyPlaying = true;
    this.scheduleNextPhrase();
  }

  public stopMelody() {
    this.isMelodyPlaying = false;
    if (this.loopTimer) {
      window.clearTimeout(this.loopTimer);
      this.loopTimer = null;
    }
    this.noteTimers.forEach((timerId) => window.clearTimeout(timerId));
    this.noteTimers = [];

    if (this.melodyGain && this.ctx) {
      const gainNode = this.melodyGain;
      this.melodyGain = null;
      const now = this.ctx.currentTime;
      try {
        gainNode.gain.cancelScheduledValues(now);
        gainNode.gain.setValueAtTime(gainNode.gain.value, now);
        gainNode.gain.linearRampToValueAtTime(0.0001, now + 0.15);
        window.setTimeout(() => {
          try {
            gainNode.disconnect();
          } catch {
            // Already disconnected
          }
        }, 180);
      } catch {
        // Ignore audio context state errors
      }
    }
  }

  private scheduleNextPhrase() {
    if (!this.isMelodyPlaying || !this.ctx) return;

    // Dreamy celestial arpeggios (D major / F# minor / G maj7 / A sus)
    const chords = [
      // D major 9
      [293.66, 369.99, 440.00, 587.33, 659.25], // D4, F#4, A4, D5, E5
      // B minor 7
      [246.94, 293.66, 369.99, 440.00, 587.33], // B3, D4, F#4, A4, D5
      // G major 7
      [196.00, 293.66, 369.99, 440.00, 587.33], // G3, D4, F#4, A4, D5
      // A add9
      [220.00, 329.63, 440.00, 554.37, 659.25], // A3, E4, A4, C#5, E5
    ];

    const currentChord = chords[Math.floor(Math.random() * chords.length)];
    const pattern = [0, 1, 2, 4, 3, 2, 1, 3];
    const noteDuration = 0.55;
    const activeMelodyGain = this.melodyGain ?? undefined;

    this.noteTimers = [];
    pattern.forEach((noteIdx, i) => {
      const freq = currentChord[noteIdx % currentChord.length];
      const timeOffset = i * noteDuration * 1000;
      const timerId = window.setTimeout(() => {
        if (this.isMelodyPlaying) {
          this.playPianoNote(freq, 2.2, 0.16, activeMelodyGain);
        }
      }, timeOffset);
      this.noteTimers.push(timerId);
    });

    const phraseTotalDuration = pattern.length * noteDuration * 1000 + 400;
    this.loopTimer = window.setTimeout(() => {
      this.scheduleNextPhrase();
    }, phraseTotalDuration);
  }

  public playPianoNote(
    freq: number,
    duration: number = 1.5,
    volume: number = 0.2,
    destinationNode?: GainNode
  ) {
    const ctx = this.initContext();
    if (!ctx || this.isMuted) return;

    const now = ctx.currentTime;
    
    // Fundamental oscillator (warm triangle)
    const osc1 = ctx.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, now);

    // Harmonic overtone (pure sine for gentle bell sheen)
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, now);

    // Lowpass filter for felt piano acoustic warmth
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.frequency.exponentialRampToValueAtTime(350, now + duration);

    // Note Envelope
    const noteGain = ctx.createGain();
    noteGain.gain.setValueAtTime(0, now);
    noteGain.gain.linearRampToValueAtTime(volume, now + 0.04);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(noteGain);
    if (destinationNode) {
      noteGain.connect(destinationNode);
    } else if (this.masterGain) {
      noteGain.connect(this.masterGain);
    } else {
      noteGain.connect(ctx.destination);
    }

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration);
    osc2.stop(now + duration);
  }

  public playTileClick(pitchMultiplier: number = 1) {
    const baseFreq = 440 * pitchMultiplier;
    this.playPianoNote(baseFreq, 0.6, 0.12);
  }

  public playMagicalChime() {
    const ctx = this.initContext();
    if (!ctx) return;

    // Ascending fairy bell cascade
    const notes = [587.33, 659.25, 739.99, 880.00, 987.77, 1174.66, 1318.51]; // D5 - E6
    notes.forEach((freq, idx) => {
      window.setTimeout(() => {
        this.playSparkleNote(freq, 1.8, 0.18);
      }, idx * 110);
    });
  }

  public playBloomHum() {
    const ctx = this.initContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(587.33, now + 2.5);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 1.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 3.0);

    osc.connect(gain);
    if (this.masterGain) {
      gain.connect(this.masterGain);
    } else {
      gain.connect(ctx.destination);
    }

    osc.start(now);
    osc.stop(now + 3.0);

    // Complement with high sparkles
    [880, 1174.66, 1479.98, 1760].forEach((freq, i) => {
      window.setTimeout(() => {
        this.playSparkleNote(freq, 2.0, 0.1);
      }, (i + 1) * 450);
    });
  }

  public playSparkleNote(freq: number, duration: number = 1.2, volume: number = 0.15) {
    const ctx = this.initContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    if (this.masterGain) {
      gain.connect(this.masterGain);
    } else {
      gain.connect(ctx.destination);
    }

    osc.start(now);
    osc.stop(now + duration);
  }

  public playBlowSound() {
    const ctx = this.initContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Gentle soft breath / wind puff
    const bufferSize = ctx.sampleRate * 0.6;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.15;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, now);
    filter.frequency.exponentialRampToValueAtTime(150, now + 0.5);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    noise.connect(filter);
    filter.connect(gain);
    if (this.masterGain) {
      gain.connect(this.masterGain);
    } else {
      gain.connect(ctx.destination);
    }

    noise.start(now);
    noise.stop(now + 0.6);
  }

  public playLetterUnfold() {
    this.playSparkleNote(783.99, 1.5, 0.15);
    window.setTimeout(() => this.playSparkleNote(987.77, 1.8, 0.15), 180);
    window.setTimeout(() => this.playSparkleNote(1174.66, 2.2, 0.2), 360);
  }
}

export const audioEngine = new AudioEngine();
