/**
 * Web Audio procedural romantic piano & sound effects engine.
 * Generates an instrumental solo-piano arrangement of "Happy Birthday to You"
 * with warm felt-piano harmonics, subtle hall ambience, and zero external dependencies.
 */

export interface PianoNoteEvent {
  freq: number;
  start: number; // seconds from start of loop
  duration: number; // seconds
  volume: number;
  phrase: 1 | 2 | 3 | 4;
}

// Authentic "Happy Birthday to You" melody in F Major (gentle ~88 BPM waltz feel)
export const HAPPY_BIRTHDAY_MELODY: PianoNoteEvent[] = [
  // Phrase 1: "Happy Birthday to you" (C4 C4 D4 C4 F4 E4)
  { freq: 261.63, start: 0.0, duration: 0.38, volume: 0.095, phrase: 1 },
  { freq: 261.63, start: 0.38, duration: 0.3, volume: 0.105, phrase: 1 },
  { freq: 293.66, start: 0.68, duration: 0.68, volume: 0.12, phrase: 1 },
  { freq: 261.63, start: 1.36, duration: 0.68, volume: 0.115, phrase: 1 },
  { freq: 349.23, start: 2.04, duration: 0.68, volume: 0.125, phrase: 1 },
  { freq: 329.63, start: 2.72, duration: 1.35, volume: 0.12, phrase: 1 },

  // Phrase 2: "Happy Birthday to you" (C4 C4 D4 C4 G4 F4)
  { freq: 261.63, start: 4.14, duration: 0.38, volume: 0.095, phrase: 2 },
  { freq: 261.63, start: 4.52, duration: 0.3, volume: 0.105, phrase: 2 },
  { freq: 293.66, start: 4.82, duration: 0.68, volume: 0.12, phrase: 2 },
  { freq: 261.63, start: 5.5, duration: 0.68, volume: 0.115, phrase: 2 },
  { freq: 392.0, start: 6.18, duration: 0.68, volume: 0.128, phrase: 2 },
  { freq: 349.23, start: 6.86, duration: 1.35, volume: 0.122, phrase: 2 },

  // Phrase 3: "Happy Birthday dear [Jasmine]" (C4 C4 C5 A4 F4 E4 D4)
  { freq: 261.63, start: 8.28, duration: 0.38, volume: 0.1, phrase: 3 },
  { freq: 261.63, start: 8.66, duration: 0.3, volume: 0.11, phrase: 3 },
  { freq: 523.25, start: 8.96, duration: 0.72, volume: 0.135, phrase: 3 },
  { freq: 440.0, start: 9.68, duration: 0.68, volume: 0.125, phrase: 3 },
  { freq: 349.23, start: 10.36, duration: 0.68, volume: 0.12, phrase: 3 },
  { freq: 329.63, start: 11.04, duration: 0.68, volume: 0.115, phrase: 3 },
  { freq: 293.66, start: 11.72, duration: 1.28, volume: 0.115, phrase: 3 },

  // Phrase 4: "Happy Birthday to you" (Bb4 Bb4 A4 F4 G4 F4)
  { freq: 466.16, start: 13.1, duration: 0.38, volume: 0.115, phrase: 4 },
  { freq: 466.16, start: 13.48, duration: 0.3, volume: 0.12, phrase: 4 },
  { freq: 440.0, start: 13.78, duration: 0.68, volume: 0.125, phrase: 4 },
  { freq: 349.23, start: 14.46, duration: 0.68, volume: 0.12, phrase: 4 },
  { freq: 392.0, start: 15.14, duration: 0.68, volume: 0.122, phrase: 4 },
  { freq: 349.23, start: 15.82, duration: 2.2, volume: 0.125, phrase: 4 },
];

// Soft left-hand broken-chord piano accompaniment (F - C7 - F - F7 - Bb - F/C - C7 - F)
export const HAPPY_BIRTHDAY_ACCOMPANIMENT: PianoNoteEvent[] = [
  // Phrase 1: F major -> C7
  { freq: 174.61, start: 0.68, duration: 1.8, volume: 0.05, phrase: 1 }, // F3
  { freq: 220.0, start: 1.02, duration: 1.5, volume: 0.04, phrase: 1 }, // A3
  { freq: 130.81, start: 2.72, duration: 1.6, volume: 0.05, phrase: 1 }, // C3
  { freq: 196.0, start: 3.06, duration: 1.4, volume: 0.04, phrase: 1 }, // G3
  { freq: 233.08, start: 3.4, duration: 1.2, volume: 0.036, phrase: 1 }, // Bb3

  // Phrase 2: C7 -> F major
  { freq: 130.81, start: 4.82, duration: 1.8, volume: 0.05, phrase: 2 }, // C3
  { freq: 196.0, start: 5.16, duration: 1.5, volume: 0.04, phrase: 2 }, // G3
  { freq: 233.08, start: 5.5, duration: 1.3, volume: 0.036, phrase: 2 }, // Bb3
  { freq: 174.61, start: 6.86, duration: 1.7, volume: 0.05, phrase: 2 }, // F3
  { freq: 220.0, start: 7.2, duration: 1.5, volume: 0.04, phrase: 2 }, // A3
  { freq: 261.63, start: 7.54, duration: 1.3, volume: 0.036, phrase: 2 }, // C4

  // Phrase 3: F7 -> Bb major
  { freq: 174.61, start: 8.96, duration: 1.6, volume: 0.05, phrase: 3 }, // F3
  { freq: 220.0, start: 9.3, duration: 1.4, volume: 0.04, phrase: 3 }, // A3
  { freq: 233.08, start: 9.64, duration: 1.2, volume: 0.036, phrase: 3 }, // Bb3
  { freq: 116.54, start: 10.36, duration: 2.2, volume: 0.052, phrase: 3 }, // Bb2
  { freq: 174.61, start: 10.7, duration: 1.9, volume: 0.042, phrase: 3 }, // F3
  { freq: 293.66, start: 11.04, duration: 1.6, volume: 0.036, phrase: 3 }, // D4

  // Phrase 4: F/C -> C7 -> F major warm resolution
  { freq: 130.81, start: 13.78, duration: 1.4, volume: 0.048, phrase: 4 }, // C3
  { freq: 220.0, start: 14.12, duration: 1.2, volume: 0.04, phrase: 4 }, // A3
  { freq: 130.81, start: 15.14, duration: 1.1, volume: 0.048, phrase: 4 }, // C3
  { freq: 196.0, start: 15.38, duration: 1.0, volume: 0.038, phrase: 4 }, // G3
  { freq: 174.61, start: 15.82, duration: 2.4, volume: 0.052, phrase: 4 }, // F3
  { freq: 261.63, start: 16.08, duration: 2.1, volume: 0.04, phrase: 4 }, // C4
  { freq: 220.0, start: 16.34, duration: 1.9, volume: 0.038, phrase: 4 }, // A3
];

export const HAPPY_BIRTHDAY_LOOP_DURATION = 19.2; // seconds including warm breathing tail

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isMelodyPlaying: boolean = false;
  private loopTimer: number | null = null;
  private masterGain: GainNode | null = null;
  private melodyGain: GainNode | null = null;
  private melodyDryGain: GainNode | null = null;
  private melodyWetGain: GainNode | null = null;
  private melodyConvolver: ConvolverNode | null = null;
  private reverbImpulse: AudioBuffer | null = null;
  private activeMelodyNodes: OscillatorNode[] = [];

  private createSoftHallImpulse(ctx: AudioContext): AudioBuffer {
    const duration = 1.45;
    const length = Math.floor(ctx.sampleRate * duration);
    const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      let prev = 0;
      for (let i = 0; i < length; i++) {
        const decay = Math.pow(1 - i / length, 2.8);
        const white = (Math.random() * 2 - 1) * decay;
        // One-pole lowpass so hall tail sounds warm rather than metallic
        prev = prev * 0.72 + white * 0.28;
        data[i] = prev * 0.45;
      }
    }
    return impulse;
  }

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.6;
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {
        // Ignore autoplay resume promise rejections prior to user interaction
      });
    }
    return this.ctx;
  }

  public getMelodyPlaying(): boolean {
    return this.isMelodyPlaying;
  }

  public toggleMelody(): boolean {
    if (this.isMelodyPlaying) {
      this.stopMelody();
    } else {
      this.startMelody();
    }
    return this.isMelodyPlaying;
  }

  public startMelody() {
    if (this.isMelodyPlaying) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const melodyBus = ctx.createGain();
    melodyBus.gain.setValueAtTime(0.0001, now);
    melodyBus.gain.linearRampToValueAtTime(0.65, now + 0.25);

    const dry = ctx.createGain();
    dry.gain.value = 0.78;
    melodyBus.connect(dry);

    const wet = ctx.createGain();
    wet.gain.value = 0.24;

    let convolver: ConvolverNode | null = null;
    if (typeof ctx.createConvolver === 'function') {
      if (!this.reverbImpulse) {
        this.reverbImpulse = this.createSoftHallImpulse(ctx);
      }
      convolver = ctx.createConvolver();
      convolver.buffer = this.reverbImpulse;
      melodyBus.connect(convolver);
      convolver.connect(wet);
    } else {
      melodyBus.connect(wet);
    }

    const outNode = this.masterGain ?? ctx.destination;
    dry.connect(outNode);
    wet.connect(outNode);

    this.melodyGain = melodyBus;
    this.melodyDryGain = dry;
    this.melodyWetGain = wet;
    this.melodyConvolver = convolver;
    this.isMelodyPlaying = true;

    this.scheduleMelodyCycle(now + 0.08);
  }

  public stopMelody() {
    this.isMelodyPlaying = false;
    if (this.loopTimer) {
      window.clearTimeout(this.loopTimer);
      this.loopTimer = null;
    }

    const nodesToStop = this.activeMelodyNodes;
    this.activeMelodyNodes = [];

    const bus = this.melodyGain;
    const dry = this.melodyDryGain;
    const wet = this.melodyWetGain;
    const convolver = this.melodyConvolver;
    this.melodyGain = null;
    this.melodyDryGain = null;
    this.melodyWetGain = null;
    this.melodyConvolver = null;

    if (bus && this.ctx) {
      const now = this.ctx.currentTime;
      try {
        bus.gain.cancelScheduledValues(now);
        bus.gain.setValueAtTime(Math.max(0.0001, bus.gain.value), now);
        bus.gain.linearRampToValueAtTime(0.0001, now + 0.18);
      } catch {
        // Ignore audio context state errors
      }

      window.setTimeout(() => {
        nodesToStop.forEach((osc) => {
          try {
            osc.stop();
            osc.disconnect();
          } catch {
            // Already stopped
          }
        });
        [bus, dry, wet, convolver].forEach((node) => {
          try {
            node?.disconnect();
          } catch {
            // Already disconnected
          }
        });
      }, 210);
    } else {
      nodesToStop.forEach((osc) => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {
          // Already stopped
        }
      });
    }
  }

  private scheduleMelodyCycle(cycleStartCtxTime: number) {
    if (!this.isMelodyPlaying || !this.ctx || !this.melodyGain) return;

    const targetBus = this.melodyGain;
    const scheduledOscs: OscillatorNode[] = [];

    const scheduleEvent = (ev: PianoNoteEvent, isAccompaniment: boolean) => {
      const noteTime = cycleStartCtxTime + ev.start;
      const nodes = this.schedulePianoNoteAt(
        ev.freq,
        noteTime,
        ev.duration,
        ev.volume,
        targetBus,
        isAccompaniment ? 780 : 1250
      );
      scheduledOscs.push(...nodes);
    };

    HAPPY_BIRTHDAY_MELODY.forEach((ev) => scheduleEvent(ev, false));
    HAPPY_BIRTHDAY_ACCOMPANIMENT.forEach((ev) => scheduleEvent(ev, true));

    // Keep references only to active/upcoming oscillators
    const maxCleanupDelayMs = (HAPPY_BIRTHDAY_LOOP_DURATION + 1) * 1000;
    this.activeMelodyNodes.push(...scheduledOscs);
    window.setTimeout(() => {
      this.activeMelodyNodes = this.activeMelodyNodes.filter(
        (n) => !scheduledOscs.includes(n)
      );
    }, maxCleanupDelayMs);

    const nextCycleCtxTime = cycleStartCtxTime + HAPPY_BIRTHDAY_LOOP_DURATION;
    const waitMs = Math.max(
      200,
      (nextCycleCtxTime - this.ctx.currentTime - 0.15) * 1000
    );

    this.loopTimer = window.setTimeout(() => {
      if (this.isMelodyPlaying && this.ctx) {
        const nextStart = Math.max(this.ctx.currentTime + 0.05, nextCycleCtxTime);
        this.scheduleMelodyCycle(nextStart);
      }
    }, waitMs);
  }

  private schedulePianoNoteAt(
    freq: number,
    startTime: number,
    duration: number,
    volume: number,
    destinationNode: AudioNode,
    cutoffStartHz: number = 1250
  ): OscillatorNode[] {
    if (!this.ctx || this.isMuted) return [];

    // Warm felt-piano fundamental + soft octave harmonic
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, startTime);

    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, startTime);

    const harmonicGain = this.ctx.createGain();
    harmonicGain.gain.value = 0.24;

    // Gentle lowpass sweep for soft romantic hammer warmth
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(cutoffStartHz, startTime);
    filter.frequency.exponentialRampToValueAtTime(260, startTime + duration);

    // Smooth piano attack & long natural decay
    const noteGain = this.ctx.createGain();
    noteGain.gain.setValueAtTime(0.0001, startTime);
    noteGain.gain.linearRampToValueAtTime(volume, startTime + 0.035);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration + 0.25);

    osc1.connect(filter);
    osc2.connect(harmonicGain);
    harmonicGain.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(destinationNode);

    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + duration + 0.28);
    osc2.stop(startTime + duration + 0.28);

    return [osc1, osc2];
  }

  public playPianoNote(
    freq: number,
    duration: number = 1.5,
    volume: number = 0.2,
    destinationNode?: GainNode
  ) {
    const ctx = this.initContext();
    if (!ctx || this.isMuted) return;

    const target = destinationNode ?? this.masterGain ?? ctx.destination;
    this.schedulePianoNoteAt(freq, ctx.currentTime, duration, volume, target, 1400);
  }

  public playTileClick(pitchMultiplier: number = 1) {
    const baseFreq = 440 * pitchMultiplier;
    this.playPianoNote(baseFreq, 0.6, 0.12);
  }

  public playMagicalChime() {
    const ctx = this.initContext();
    if (!ctx) return;

    // Ascending fairy bell cascade
    const notes = [587.33, 659.25, 739.99, 880.0, 987.77, 1174.66, 1318.51]; // D5 - E6
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
