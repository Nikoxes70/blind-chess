export type SoundName =
  | "move"
  | "capture"
  | "check"
  | "checkmate"
  | "illegal"
  | "select"
  | "start"
  | "end";

/**
 * Tiny Web Audio synth — no asset downloads, no layout shift, and every cue is
 * generated from a handful of oscillators.
 */
class SoundEngine {
  private context: AudioContext | null = null;
  private enabled = true;

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (enabled) this.unlock();
  }

  unlock() {
    const context = this.getContext();
    if (context?.state === "suspended") void context.resume();
  }

  play(name: SoundName) {
    if (!this.enabled) return;
    const context = this.getContext();
    if (!context) return;
    if (context.state === "suspended") void context.resume();
    const start = context.currentTime + 0.002;

    switch (name) {
      case "move":
        this.tone(context, start, 210, 150, 0.09, 0.05, "sine");
        this.noise(context, start, 0.045, 0.018, 1400);
        break;
      case "capture":
        this.tone(context, start, 150, 62, 0.17, 0.075, "triangle");
        this.noise(context, start, 0.11, 0.04, 900);
        break;
      case "check":
        this.tone(context, start, 880, 880, 0.09, 0.04, "sine");
        this.tone(context, start + 0.1, 1174, 1174, 0.12, 0.035, "sine");
        break;
      case "checkmate":
        this.tone(context, start, 523, 523, 0.24, 0.05, "triangle");
        this.tone(context, start + 0.16, 415, 415, 0.26, 0.045, "triangle");
        this.tone(context, start + 0.32, 311, 311, 0.4, 0.04, "triangle");
        break;
      case "illegal":
        this.tone(context, start, 120, 78, 0.16, 0.045, "sawtooth", 600);
        break;
      case "select":
        this.tone(context, start, 540, 540, 0.035, 0.018, "sine");
        break;
      case "start":
        this.tone(context, start, 392, 392, 0.16, 0.035, "sine");
        this.tone(context, start + 0.12, 523, 523, 0.18, 0.03, "sine");
        this.tone(context, start + 0.24, 659, 659, 0.22, 0.025, "sine");
        break;
      case "end":
        this.tone(context, start, 330, 330, 0.22, 0.035, "sine");
        this.tone(context, start + 0.18, 262, 262, 0.32, 0.03, "sine");
        break;
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (this.context) return this.context;
    try {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return null;
      this.context = new Ctor();
      return this.context;
    } catch {
      return null;
    }
  }

  private tone(
    context: AudioContext,
    start: number,
    frequency: number,
    endFrequency: number,
    duration: number,
    volume: number,
    type: OscillatorType,
    lowpass?: number,
  ) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    if (endFrequency !== frequency) {
      oscillator.frequency.exponentialRampToValueAtTime(
        Math.max(1, endFrequency),
        start + duration,
      );
    }

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    let node: AudioNode = oscillator;
    if (lowpass) {
      const filter = context.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = lowpass;
      node = node.connect(filter);
    }
    node.connect(gain);
    gain.connect(context.destination);

    oscillator.start(start);
    oscillator.stop(start + duration + 0.03);
  }

  private noise(
    context: AudioContext,
    start: number,
    duration: number,
    volume: number,
    cutoff: number,
  ) {
    const frames = Math.max(1, Math.floor(context.sampleRate * duration));
    const buffer = context.createBuffer(1, frames, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < frames; index += 1) {
      data[index] = (Math.random() * 2 - 1) * (1 - index / frames);
    }

    const source = context.createBufferSource();
    source.buffer = buffer;

    const filter = context.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = cutoff;
    filter.Q.value = 0.8;

    const gain = context.createGain();
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(context.destination);
    source.start(start);
  }
}

let instance: SoundEngine | null = null;

export function getSoundEngine(): SoundEngine {
  if (!instance) instance = new SoundEngine();
  return instance;
}
