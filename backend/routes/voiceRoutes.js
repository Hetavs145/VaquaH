import { Router } from 'express';
import multer from 'multer';
import os from 'os';
import path from 'path';
import { synthesizeSpeech, listVoices } from '../services/ttsService.js';
import { transcribeAudio } from '../services/sttService.js';
import { runAgent } from '../services/agentService.js';
import { logTurn } from '../services/conversationLog.js';

const router = Router();

// Multer for audio upload (temp dir, 10MB limit)
const upload = multer({
  dest: os.tmpdir(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) return cb(null, true);
    cb(new Error('Only audio files are accepted'));
  },
});

// POST /api/voice/tts — Text-to-Speech
router.post('/tts', async (req, res) => {
  try {
    const { text, voice } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ message: 'text is required' });
    }
    if (text.length > 2000) {
      return res.status(400).json({ message: 'text must be under 2000 characters' });
    }

    const audioBuffer = await synthesizeSpeech(text, voice);
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length,
    });
    res.send(audioBuffer);
  } catch (error) {
    console.error('TTS route error:', error.message);
    res.status(500).json({ message: 'TTS failed' });
  }
});

// POST /api/voice/stt — Speech-to-Text
router.post('/stt', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'audio file is required' });
    }
    const transcript = await transcribeAudio(req.file.path);
    res.json({ transcript });
  } catch (error) {
    console.error('STT route error:', error.message);
    res.status(500).json({ message: 'STT failed' });
  }
});

// POST /api/voice/agent — Voice agent: answers + returns website actions to execute
router.post('/agent', async (req, res) => {
  try {
    const { message, history, page, pageElements, user, sessionId } = req.body || {};
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ message: 'message is required' });
    }
    if (message.length > 2000) {
      return res.status(400).json({ message: 'message must be under 2000 characters' });
    }

    const result = await runAgent({
      message: message.trim(),
      history,
      page: typeof page === 'string' ? page.slice(0, 200) : '/',
      pageElements: Array.isArray(pageElements) ? pageElements.filter(e => typeof e === 'string').map(e => e.slice(0, 80)) : [],
      user,
    });

    // Log asynchronously; don't make the user wait on Firestore
    logTurn({
      sessionId,
      channel: 'voice',
      user,
      page,
      messages: [
        { role: 'user', content: message.trim() },
        { role: 'assistant', content: result.reply, actions: result.actions },
      ],
    });

    res.json(result);
  } catch (error) {
    console.error('Agent route error:', error.message);
    res.status(500).json({ message: 'Agent failed' });
  }
});

// GET /api/voice/voices — List available TTS voices
router.get('/voices', async (_req, res) => {
  try {
    const voices = await listVoices();
    res.json({ voices });
  } catch (error) {
    console.error('Voices route error:', error.message);
    res.status(500).json({ message: 'Failed to list voices' });
  }
});

export default router;
