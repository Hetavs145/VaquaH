import Groq from 'groq-sdk';
import fs from 'fs';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const transcribeAudio = async (filePath) => {
  try {
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
