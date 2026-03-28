import React, { useEffect, useState } from 'react';
import { useAssistant } from '../../context/AssistantContext';
import VoiceSphere from './VoiceSphere';
import { X, Volume2, VolumeX, Mic } from 'lucide-react';
import { speakResponse, stopSpeaking } from '../../services/voiceService';

const AssistantOverlay = () => {
    const {
        isAssistantOpen,
        closeAssistant,
        assistantState,
        isMuted,
        setIsMuted,
        lastTranscript,
        lastResponse,
        setIsListening,
    } = useAssistant();
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        if (isAssistantOpen) {
            const msg = "Hello, how may I help you?";
            setGreeting(msg);
            if (!isMuted) speakResponse(msg);
        } else {
            setGreeting('');
            stopSpeaking();
        }
    }, [isAssistantOpen]);

    if (!isAssistantOpen) return null;

    const stateLabel = {
        listening: 'Listening...',
        processing: 'Processing...',
        speaking: 'Speaking...',
        error: 'Something went wrong',
        idle: 'Tap the mic to speak',
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">

            <button
                onClick={closeAssistant}
                className="absolute top-6 right-6 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
                <X size={32} />
            </button>

            {/* Mute toggle */}
            <button
                onClick={() => { setIsMuted(m => !m); if (!isMuted) stopSpeaking(); }}
                className="absolute top-6 left-6 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
            >
                {isMuted ? <VolumeX size={28} /> : <Volume2 size={28} />}
            </button>

            <div className="flex flex-col items-center space-y-8 max-w-lg px-4">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl md:text-4xl font-light text-white tracking-wide">
                        {lastResponse || greeting}
                    </h2>
                    {lastTranscript && (
                        <p className="text-cyan-300/80 text-base italic">
                            &ldquo;{lastTranscript}&rdquo;
                        </p>
                    )}
                    <p className="text-white/50 text-sm">
                        {stateLabel[assistantState] || 'Ready'}
                    </p>
                </div>

                <div className="relative cursor-pointer" onClick={() => setIsListening(true)}>
                    <VoiceSphere />
                </div>

                {/* Mic button for manual trigger */}
                <button
                    onClick={() => setIsListening(true)}
                    className="p-4 rounded-full bg-cyan-600/30 hover:bg-cyan-600/50 text-white transition-colors"
                    disabled={assistantState === 'processing' || assistantState === 'speaking'}
                >
                    <Mic size={24} />
                </button>
            </div>
        </div>
    );
};

export default AssistantOverlay;
