import Groq from 'groq-sdk';

// Lazily-created Groq client so a missing key doesn't crash the server at import time.
// (Also used for server-side Whisper STT in services/sttService.js.)
let groqClient = null;
export const getGroq = () => {
  if (!process.env.GROQ_API_KEY) return null;
  if (!groqClient) groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return groqClient;
};

const list = (v, d) => (v || d).split(',').map((s) => s.trim()).filter(Boolean);

/**
 * LLM providers, tried in order. All are OpenAI-compatible chat APIs.
 *   1. OpenCode Zen  (OPENCODE_API_KEY)   — deepseek-v4.1-flash-free
 *   2. OpenRouter    (OPENROUTER_API_KEY) — free Gemma 4 models
 *   3. Groq          (GROQ_API_KEY)       — optional extra fallback
 * Free model lists change over time; override with the *_MODEL(S) env vars.
 */
const providers = () => [
  {
    name: 'opencode',
    key: process.env.OPENCODE_API_KEY,
    url: 'https://opencode.ai/zen/v1/chat/completions',
    models: list(process.env.OPENCODE_MODELS, 'deepseek-v4.1-flash-free'),
  },
  {
    name: 'openrouter',
    key: process.env.OPENROUTER_API_KEY,
    url: 'https://openrouter.ai/api/v1/chat/completions',
    // 26b-a4b (MoE, ~4B active params) is the faster one for voice; 31b is the stronger backup.
    models: list(process.env.OPENROUTER_MODELS, 'google/gemma-4-26b-a4b-it:free,google/gemma-4-31b-it:free'),
    extraHeaders: { 'HTTP-Referer': 'https://vaquah.in', 'X-Title': 'VaquaH Assistant' },
  },
  {
    name: 'groq',
    key: process.env.GROQ_API_KEY,
    url: 'https://api.groq.com/openai/v1/chat/completions',
    models: list(process.env.GROQ_MODELS, 'llama-3.3-70b-versatile'),
  },
];

const TIMEOUT_MS = Number(process.env.LLM_TIMEOUT_MS || 20000);

const callModel = async (p, model, messages, { json, maxTokens, temperature }) => {
  const res = await fetch(p.url, {
    method: 'POST',
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: {
      Authorization: `Bearer ${p.key}`,
      'Content-Type': 'application/json',
      ...(p.extraHeaders || {}),
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
      ...(json ? { response_format: { type: 'json_object' } } : {}),
    }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('empty response');
  return content;
};

/** OpenAI-style chat completion with provider/model fallback. Returns the content string. */
export const chatComplete = async (messages, { json = false, maxTokens = 500, temperature = 0.4 } = {}) => {
  const errors = [];
  for (const p of providers()) {
    if (!p.key) continue;
    for (const model of p.models) {
      try {
        return await callModel(p, model, messages, { json, maxTokens, temperature });
      } catch (e) {
        errors.push(`${p.name}/${model}: ${e.message}`);
        console.warn(`[LLM] ${p.name}/${model} failed: ${e.message}`);
      }
    }
  }
  throw new Error(errors.length ? errors.join(' | ') : 'No LLM configured (set OPENCODE_API_KEY, OPENROUTER_API_KEY or GROQ_API_KEY)');
};
