import React, { useEffect, useRef } from 'react';
import { useAssistant } from '../../context/AssistantContext';
import VoiceSphere from './VoiceSphere';
import { X, Volume2, VolumeX, Mic, MicOff } from 'lucide-react';
import { stopSpeaking } from '../../services/voiceService';

const STATE_LABEL = {
    listening: 'Listening… just talk',
    processing: 'Thinking…',
    speaking: 'Speaking… (talk to interrupt)',
    error: 'Something went wrong',
    idle: 'Paused — tap the mic to talk',
};

const AssistantOverlay = () => {
    const {
        isAssistantOpen,
        closeAssistant,
        assistantState,
        isMuted,
        setIsMuted,
        isListening,
        setIsListening,
        conversation,
        sttStatus,
        voiceError,
    } = useAssistant();
    const scrollRef = useRef(null);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [conversation]);

    useEffect(() => {
        if (!isAssistantOpen) return undefined;
        const onKey = (e) => { if (e.key === 'Escape') closeAssistant(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isAssistantOpen, closeAssistant]);

    if (!isAssistantOpen) return null;

    const modelLoading = sttStatus?.state === 'loading';

    return (
        <div
            data-assistant-overlay
            role="dialog"
            aria-label="VaquaH voice assistant"
            className="fixed z-50 bottom-4 right-4 left-4 sm:left-auto sm:w-[380px] max-h-[80vh] flex flex-col rounded-2xl bg-slate-950/90 text-white shadow-2xl backdrop-blur-md border border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-3">
                <button
                    onClick={() => { setIsMuted((m) => !m); if (!isMuted) stopSpeaking(); }}
                    className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                    title={isMuted ? 'Unmute voice replies' : 'Mute voice replies'}
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <span className="text-sm font-medium tracking-wide">VaquaH Voice</span>
                <button
                    onClick={closeAssistant}
                    className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                    aria-label="Close assistant"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Transcript */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-2 space-y-2 min-h-[60px] max-h-[40vh]">
                {conversation.length === 0 && (
                    <p className="text-center text-white/50 text-sm py-2">
                        Ask anything, or say things like &ldquo;show me split ACs&rdquo;, &ldquo;book a service&rdquo; or &ldquo;open my cart&rdquo;.
                    </p>
                )}
                {conversation.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${m.role === 'user' ? 'bg-cyan-600/40' : 'bg-white/10'}`}>
                            {m.content}
                            {m.actions?.length > 0 && (
                                <div className="mt-1 text-[11px] text-cyan-200/70">
                                    {m.actions.map((a) => a.path || a.query || a.text || a.direction || a.type).join(' → ')}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Sphere + status */}
            <div className="flex flex-col items-center pb-4 pt-1">
                <div
                    className="w-36 h-36 cursor-pointer [&_canvas]:w-full [&_canvas]:h-full"
                    onClick={() => setIsListening(true)}
                    title="Tap to talk"
                >
                    <VoiceSphere />
                </div>
                <p className="text-white/60 text-xs h-4" aria-live="polite">
                    {voiceError || (modelLoading
                        ? `Loading speech model… ${sttStatus.progress || 0}% (first time only)`
                        : STATE_LABEL[assistantState] || 'Ready')}
                </p>
                <button
                    onClick={() => setIsListening((l) => !l)}
                    className={`mt-3 p-3 rounded-full transition-colors ${isListening ? 'bg-cyan-600/40 hover:bg-cyan-600/60' : 'bg-red-600/40 hover:bg-red-600/60'}`}
                    aria-label={isListening ? 'Pause listening' : 'Resume listening'}
                    title={isListening ? 'Pause listening' : 'Resume listening'}
                >
                    {isListening ? <Mic size={20} /> : <MicOff size={20} />}
                </button>
            </div>
        </div>
    );
};

export default AssistantOverlay;
