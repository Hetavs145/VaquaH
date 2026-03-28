import { webcrypto } from 'crypto';
if (!globalThis.crypto) globalThis.crypto = webcrypto;

import pkg from 'msedge-tts';
const { MsEdgeTTS, OUTPUT_FORMAT } = pkg;

const DEFAULT_VOICE = 'en-IN-NeerjaNeural'; // Indian English female

export const synthesizeSpeech = async (text, voice = DEFAULT_VOICE) => {
  const tts = new MsEdgeTTS();
  await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);

  const { audioStream } = tts.toStream(text);

  const chunks = [];
  for await (const chunk of audioStream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
};

export const listVoices = async () => {
  const tts = new MsEdgeTTS();
  const voices = await tts.getVoices();
  return voices
    .filter(v => v.Locale.startsWith('en-'))
    .map(v => ({ name: v.ShortName, locale: v.Locale, gender: v.Gender }));
};
