import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAssistant } from '../context/AssistantContext';
import { useAuth } from '../context/AuthContext';
import api from './api';
import { createMicVad } from './voice/micVad';
import { transcribe, preloadStt, onSttStatus } from './voice/stt';
import { collectPageElements, executeActions } from './voice/pageActions';

// ---------------------------------------------------------------------------
// TTS: free Microsoft Edge neural voices via the backend (/api/voice/tts),
// falling back to the browser's built-in speechSynthesis.
// ---------------------------------------------------------------------------
let currentAudio = null;
let serverTtsFailures = 0;

const speakWithBrowser = (text) =>
  new Promise((resolve) => {
    if (!('speechSynthesis' in window)) return resolve();
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    u.voice = voices.find((v) => /en-IN/i.test(v.lang)) || voices.find((v) => /^en/i.test(v.lang)) || null;
    u.rate = 1.05;
    u.onend = resolve;
    u.onerror = resolve;
    window.speechSynthesis.speak(u);
  });

const toSpeakable = (text) =>
  String(text || '')
    .replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '') // emojis
    .replace(/[*_#`>]/g, '')
    .replace(/https?:\/\/\S+/g, '')
    .trim();

export const speakResponse = async (text) => {
  stopSpeaking();
  const speakable = toSpeakable(text);
  if (!speakable) return;

  // After 2 server failures, stop waiting on it for the rest of the page session.
  if (serverTtsFailures < 2) {
    try {
      const response = await api.post('/voice/tts', { text: speakable.slice(0, 1900) }, { responseType: 'blob', timeout: 10000 });
      if (!response.data?.size) throw new Error('empty audio');
      serverTtsFailures = 0;
      const audioUrl = URL.createObjectURL(response.data);
      const audio = new Audio(audioUrl);
      currentAudio = audio;
      return await new Promise((resolve) => {
        const done = () => {
          URL.revokeObjectURL(audioUrl);
          if (currentAudio === audio) currentAudio = null;
          resolve();
        };
        audio.onended = done;
        audio.onerror = done;
        audio.onpause = done; // stopSpeaking() pauses
        audio.play().catch(() => { done(); });
      });
    } catch {
      serverTtsFailures += 1;
    }
  }
  return speakWithBrowser(speakable);
};

export const stopSpeaking = () => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
};

// ---------------------------------------------------------------------------
// Live voice conversation: mic + VAD -> Whisper -> AI agent -> actions + TTS
// ---------------------------------------------------------------------------
export const useVoiceRecognition = () => {
  const assistant = useAssistant();
  const {
    isAssistantOpen,
    openAssistant,
    closeAssistant,
    isListening,
    isWakeWordListening,
    updatePermission,
    setAssistantState,
    setLastTranscript,
    setLastResponse,
    setConversation,
    setSttStatus,
    setVoiceError,
  } = assistant;
  const { user } = useAuth() || {};
  const navigate = useNavigate();
  const location = useLocation();

  // Refs so long-lived callbacks always see fresh values
  const latest = useRef({});
  latest.current = { ...assistant, user, navigate, pathname: location.pathname };

  const micRef = useRef(null);
  const busyRef = useRef(false);
  const historyRef = useRef([]);

  useEffect(() => onSttStatus(setSttStatus), [setSttStatus]);

  const resumeListening = () => {
    const { isAssistantOpen: open, isListening: listening } = latest.current;
    if (!open) return;
    if (listening) {
      micRef.current?.resume();
      setAssistantState('listening');
    } else {
      setAssistantState('idle');
    }
  };

  const say = async (text) => {
    if (!text) return;
    micRef.current?.pause(); // don't let the assistant hear itself
    setAssistantState('speaking');
    if (!latest.current.isMuted) await speakResponse(text);
  };

  const handleUtterance = async (audio) => {
    if (busyRef.current) return;
    busyRef.current = true;
    micRef.current?.pause();
    setAssistantState('processing');

    try {
      const text = await transcribe(audio);
      if (!text) return; // silence / noise

      setLastTranscript(text);
      setConversation((c) => [...c, { role: 'user', content: text }]);

      const { user: u, pathname, sessionId } = latest.current;
      const { data } = await api.post('/voice/agent', {
        message: text,
        history: historyRef.current.slice(-8),
        page: pathname,
        pageElements: collectPageElements(),
        sessionId,
        user: u ? { id: u.uid, name: u.name || u.displayName, email: u.email } : null,
      }, { timeout: 30000 });

      const reply = data?.reply || '';
      const actions = data?.actions || [];
      historyRef.current.push({ role: 'user', content: text }, { role: 'assistant', content: reply });
      setLastResponse(reply);
      setConversation((c) => [...c, { role: 'assistant', content: reply, actions }]);

      const { closeRequested, failed } = await executeActions(actions, { navigate: latest.current.navigate });
      if (failed.length) {
        await say("Sorry, I couldn't do that on this page. You may need to do it yourself.");
      } else {
        await say(reply);
      }
      if (closeRequested) closeAssistant();
    } catch (e) {
      console.error('[Assistant] turn failed', e);
      const msg = e?.response ? "Sorry, something went wrong. Please try again." : "I couldn't reach the server right now.";
      setLastResponse(msg);
      setAssistantState('error');
      await say(msg);
    } finally {
      busyRef.current = false;
      resumeListening();
    }
  };

  // Start / stop the live session with the overlay
  useEffect(() => {
    if (!isAssistantOpen) return undefined;
    let cancelled = false;
    historyRef.current = [];
    preloadStt();

    (async () => {
      if (!navigator.mediaDevices?.getUserMedia || !window.AudioWorkletNode) {
        setVoiceError('Voice is not supported in this browser.');
        setAssistantState('error');
        return;
      }
      try {
        const mic = await createMicVad({
          onUtterance: handleUtterance,
          onSpeechChange: (speaking) => { if (speaking) { stopSpeaking(); setAssistantState('listening'); } },
        });
        if (cancelled) { mic.stop(); return; }
        micRef.current = mic;
        updatePermission('microphone', 'granted');
        await say('Hi, I am VaquaH. How can I help you?');
        if (!cancelled) resumeListening();
      } catch (e) {
        console.error('[Assistant] mic error', e);
        const denied = e?.name === 'NotAllowedError';
        if (denied) updatePermission('microphone', 'denied');
        setVoiceError(denied ? 'Microphone access was blocked. Allow it in your browser settings.' : 'Could not start the microphone.');
        setAssistantState('error');
      }
    })();

    return () => {
      cancelled = true;
      stopSpeaking();
      micRef.current?.stop();
      micRef.current = null;
      busyRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAssistantOpen]);

  // Mic button: pause / resume listening
  useEffect(() => {
    if (!micRef.current || busyRef.current) return;
    if (isListening) {
      stopSpeaking();
      micRef.current.resume();
      setAssistantState('listening');
    } else {
      micRef.current.pause();
      setAssistantState('idle');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening]);

  // Optional wake word ("VaquaH") using the browser's speech recognition where available
  useEffect(() => {
    if (!isWakeWordListening || isAssistantOpen) return undefined;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return undefined;

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = 'en-IN';
    let active = true;

    rec.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const t = event.results[i][0].transcript.toLowerCase();
        if (/\b(vaquah|va qua|aqua|hey assistant|start assistant)\b/.test(t)) {
          active = false;
          rec.stop();
          openAssistant();
        }
      }
    };
    rec.onerror = (e) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') active = false;
    };
    rec.onend = () => {
      if (active) { try { rec.start(); } catch { /* ignore */ } }
    };
    try { rec.start(); } catch { /* ignore */ }

    return () => {
      active = false;
      try { rec.stop(); } catch { /* ignore */ }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWakeWordListening, isAssistantOpen]);

  return null;
};
