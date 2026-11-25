// Hands-free microphone capture with a lightweight energy-based voice activity
// detector (adaptive noise floor). Emits one 16 kHz Float32Array per utterance.

const WORKLET = `
class Tap extends AudioWorkletProcessor {
  process(inputs) {
    const ch = inputs[0] && inputs[0][0];
    if (ch) this.port.postMessage(ch.slice(0));
    return true;
  }
}
registerProcessor('vaquah-tap', Tap);
`;

const TARGET_RATE = 16000;

const resample = (chunks, fromRate) => {
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const input = new Float32Array(total);
  let off = 0;
  for (const c of chunks) { input.set(c, off); off += c.length; }
  if (fromRate === TARGET_RATE) return input;
  const ratio = fromRate / TARGET_RATE;
  const out = new Float32Array(Math.floor(total / ratio));
  for (let i = 0; i < out.length; i++) {
    // average the source samples covered by this output sample (cheap low-pass)
    const start = Math.floor(i * ratio);
    const end = Math.min(total, Math.floor((i + 1) * ratio));
    let sum = 0;
    for (let j = start; j < end; j++) sum += input[j];
    out[i] = sum / Math.max(1, end - start);
  }
  return out;
};

/**
 * @param {object} opts
 * @param {(audio: Float32Array) => void} opts.onUtterance
 * @param {(speaking: boolean) => void} [opts.onSpeechChange]
 * @param {(level: number) => void} [opts.onLevel] 0..1 mic level for visuals
 */
export const createMicVad = async ({ onUtterance, onSpeechChange, onLevel }) => {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 },
  });

  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const url = URL.createObjectURL(new Blob([WORKLET], { type: 'application/javascript' }));
  await ctx.audioWorklet.addModule(url);
  URL.revokeObjectURL(url);

  const source = ctx.createMediaStreamSource(stream);
  const tap = new AudioWorkletNode(ctx, 'vaquah-tap');
  const mute = ctx.createGain();
  mute.gain.value = 0;
  source.connect(tap);
  tap.connect(mute).connect(ctx.destination); // keep the graph pulling

  const rate = ctx.sampleRate;
  const frameMs = (128 / rate) * 1000;
  const PRE_ROLL_MS = 300;
  const START_MS = 120;     // sustained voice needed to start an utterance
  const END_SILENCE_MS = 900;
  const MIN_SPEECH_MS = 350;
  const MAX_MS = 15000;

  let paused = false;
  let noise = 0.005;
  let speaking = false;
  let aboveMs = 0;
  let silenceMs = 0;
  let speechMs = 0;
  let preRoll = [];
  let chunks = [];

  const reset = () => {
    speaking = false; aboveMs = 0; silenceMs = 0; speechMs = 0; chunks = []; preRoll = [];
  };

  const finish = () => {
    const utter = chunks;
    const dur = speechMs;
    reset();
    onSpeechChange?.(false);
    if (dur >= MIN_SPEECH_MS) onUtterance(resample(utter, rate));
  };

  tap.port.onmessage = ({ data: frame }) => {
    let sum = 0;
    for (let i = 0; i < frame.length; i++) sum += frame[i] * frame[i];
    const rms = Math.sqrt(sum / frame.length);
    onLevel?.(Math.min(1, rms * 12));
    if (paused) return;

    const threshold = Math.max(0.012, noise * 3);
    const isVoice = rms > threshold;

    if (!speaking) {
      if (!isVoice) noise = noise * 0.98 + rms * 0.02; // track background noise
      preRoll.push(frame);
      while (preRoll.length * frameMs > PRE_ROLL_MS) preRoll.shift();
      aboveMs = isVoice ? aboveMs + frameMs : 0;
      if (aboveMs >= START_MS) {
        speaking = true;
        chunks = preRoll.slice();
        preRoll = [];
        speechMs = aboveMs;
        silenceMs = 0;
        onSpeechChange?.(true);
      }
      return;
    }

    chunks.push(frame);
    if (isVoice) { speechMs += frameMs; silenceMs = 0; } else { silenceMs += frameMs; }
    if (silenceMs >= END_SILENCE_MS || chunks.length * frameMs >= MAX_MS) finish();
  };

  if (ctx.state === 'suspended') await ctx.resume();

  return {
    /** Ignore the mic (e.g. while the assistant is talking). */
    pause() { paused = true; if (speaking) { reset(); onSpeechChange?.(false); } },
    resume() { paused = false; reset(); },
    get paused() { return paused; },
    async stop() {
      paused = true;
      tap.port.onmessage = null;
      stream.getTracks().forEach((t) => t.stop());
      try { await ctx.close(); } catch { /* already closed */ }
    },
  };
};
