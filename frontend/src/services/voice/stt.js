// Speech-to-text: local Whisper in a Web Worker, with the backend
// (/api/voice/stt, Groq Whisper free tier) as a fallback.
import api from '../api';

let worker = null;
let workerBroken = false;
let reqId = 0;
const pending = new Map();
const listeners = new Set();
let status = { state: 'idle', progress: 0 }; // idle | loading | ready | error

const setStatus = (s) => {
  status = { ...status, ...s };
  listeners.forEach((fn) => fn(status));
};

export const onSttStatus = (fn) => {
  listeners.add(fn);
  fn(status);
  return () => listeners.delete(fn);
};

const getWorker = () => {
  if (workerBroken) return null;
  if (worker) return worker;
  try {
    worker = new Worker(new URL('./whisperWorker.js', import.meta.url), { type: 'module' });
    worker.onmessage = ({ data }) => {
      if (data.type === 'progress') setStatus({ state: 'loading', progress: data.progress });
      else if (data.type === 'ready') setStatus({ state: 'ready', progress: 100 });
      else if (data.type === 'result' || data.type === 'error') {
        if (data.type === 'error' && data.id == null) {
          workerBroken = true;
          setStatus({ state: 'error' });
        }
        const p = pending.get(data.id);
        if (p) {
          pending.delete(data.id);
          data.type === 'result' ? p.resolve(data.text) : p.reject(new Error(data.error));
        }
      }
    };
    worker.onerror = () => {
      workerBroken = true;
      setStatus({ state: 'error' });
      pending.forEach((p) => p.reject(new Error('worker crashed')));
      pending.clear();
    };
    return worker;
  } catch {
    workerBroken = true;
    return null;
  }
};

export const preloadStt = () => {
  const w = getWorker();
  if (w && status.state === 'idle') {
    setStatus({ state: 'loading', progress: 0 });
    w.postMessage({ type: 'load' });
  }
};

// Whisper tends to "hear" these on silence / noise.
const HALLUCINATIONS = /^(you|thank you|thanks for watching|bye|\.|okay)\.?!?$/i;

const clean = (text) => {
  const t = (text || '')
    .replace(/\[[^\]]*\]|\([^)]*\)|\*[^*]*\*/g, '') // [BLANK_AUDIO], (music), *sigh*
    .replace(/\s+/g, ' ')
    .trim();
  if (t.length < 2 || HALLUCINATIONS.test(t)) return '';
  return t;
};

const encodeWav = (samples, sampleRate = 16000) => {
  const buf = new ArrayBuffer(44 + samples.length * 2);
  const v = new DataView(buf);
  const w = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  w(0, 'RIFF'); v.setUint32(4, 36 + samples.length * 2, true); w(8, 'WAVE');
  w(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, sampleRate, true); v.setUint32(28, sampleRate * 2, true);
  v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  w(36, 'data'); v.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    v.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([buf], { type: 'audio/wav' });
};

const transcribeOnServer = async (audio) => {
  const form = new FormData();
  form.append('audio', encodeWav(audio), 'speech.wav');
  const { data } = await api.post('/voice/stt', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  return data.transcript || '';
};

/** Transcribe 16 kHz mono Float32 PCM. Returns '' for silence/noise. */
export const transcribe = async (audio) => {
  const w = getWorker();
  if (w) {
    try {
      const id = ++reqId;
      const text = await new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
        w.postMessage({ type: 'transcribe', id, audio });
      });
      return clean(text);
    } catch (e) {
      console.warn('[STT] local Whisper failed, using server:', e.message);
    }
  }
  return clean(await transcribeOnServer(audio));
};
