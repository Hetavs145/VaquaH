// Runs OpenAI Whisper (open-source weights, ONNX) fully in the browser.
// Free, private, no API key. Model files are downloaded once and cached by the browser.
import { pipeline, env } from '@huggingface/transformers';

env.allowLocalModels = false;

const MODEL_ID = 'onnx-community/whisper-base.en';
let asrPromise = null;

const load = () => {
  if (!asrPromise) {
    const progress = {};
    asrPromise = pipeline('automatic-speech-recognition', MODEL_ID, {
      dtype: 'q8',
      device: 'wasm',
      progress_callback: (p) => {
        if (p.status === 'progress' && p.file) {
          progress[p.file] = { loaded: p.loaded || 0, total: p.total || 0 };
          const vals = Object.values(progress);
          const loaded = vals.reduce((a, v) => a + v.loaded, 0);
          const total = vals.reduce((a, v) => a + v.total, 0);
          self.postMessage({ type: 'progress', progress: total ? Math.round((loaded / total) * 100) : 0 });
        }
      },
    }).then((asr) => {
      self.postMessage({ type: 'ready' });
      return asr;
    }).catch((err) => {
      asrPromise = null;
      throw err;
    });
  }
  return asrPromise;
};

self.onmessage = async ({ data }) => {
  try {
    if (data.type === 'load') {
      await load();
    } else if (data.type === 'transcribe') {
      const asr = await load();
      const out = await asr(data.audio);
      self.postMessage({ type: 'result', id: data.id, text: (out?.text || '').trim() });
    }
  } catch (err) {
    self.postMessage({ type: 'error', id: data.id, error: String(err?.message || err) });
  }
};
