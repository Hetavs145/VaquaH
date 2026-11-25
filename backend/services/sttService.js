import { getGroq } from '../lib/llm.js';
import fs from 'fs';

export const transcribeAudio = async (filePath) => {
  try {
    const groq = getGroq();
    if (!groq) throw new Error('GROQ_API_KEY not set (server STT unavailable; the browser uses local Whisper instead)');
    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: 'whisper-large-v3-turbo',
      language: 'en',
      response_format: 'json',
    });

    // Clean up temp file
    fs.unlink(filePath, () => {});

    return transcription.text;
  } catch (error) {
    // Clean up temp file on error
    fs.unlink(filePath, () => {});
    console.error('STT error:', error.message);
    throw error;
  }
};
