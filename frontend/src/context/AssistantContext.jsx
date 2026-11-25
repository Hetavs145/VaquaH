import React, { createContext, useContext, useState, useEffect } from 'react';

const AssistantContext = createContext();

export const useAssistant = () => useContext(AssistantContext);

export const AssistantProvider = ({ children }) => {
    const [isAssistantOpen, setIsAssistantOpen] = useState(false);
    const [isListening, setIsListening] = useState(false); // Actively processing command
    const [isWakeWordListening, setIsWakeWordListening] = useState(true); // Passive listening for "VaquaH"
    const [isGestureModeEnabled, setIsGestureModeEnabled] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [lastTranscript, setLastTranscript] = useState('');
    const [lastResponse, setLastResponse] = useState('');
    // Full transcript of the current voice session: [{ role, content, actions? }]
    const [conversation, setConversation] = useState([]);
    const [sessionId, setSessionId] = useState(null);
    // Local Whisper model status: { state: 'idle'|'loading'|'ready'|'error', progress }
    const [sttStatus, setSttStatus] = useState({ state: 'idle', progress: 0 });
    const [voiceError, setVoiceError] = useState('');

    // 'idle' | 'listening' | 'processing' | 'speaking' | 'error'
    const [assistantState, setAssistantState] = useState('idle');

    const [permissions, setPermissions] = useState({
        microphone: 'prompt', // 'granted', 'denied', 'prompt'
        camera: 'prompt'
    });

    // Helper to update permissions
    const updatePermission = (type, status) => {
        setPermissions(prev => ({
            ...prev,
            [type]: status
        }));
    };

    const openAssistant = () => {
        setSessionId(`voice_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`);
        setConversation([]);
        setLastTranscript('');
        setLastResponse('');
        setVoiceError('');
        setIsAssistantOpen(true);
        setAssistantState('listening');
        setIsListening(true);
        // Pause wake word listening while assistant is open to avoid recursion
        setIsWakeWordListening(false);
    };

    const closeAssistant = () => {
        setIsAssistantOpen(false);
        setAssistantState('idle');
        setIsListening(false);
        // Resume wake word listening
        setIsWakeWordListening(true);
    };

    const toggleGestureMode = () => {
        setIsGestureModeEnabled(prev => !prev);
    };

    const value = {
        isAssistantOpen,
        openAssistant,
        closeAssistant,
        isListening,
        setIsListening,
        isWakeWordListening,
        setIsWakeWordListening,
        isGestureModeEnabled,
        toggleGestureMode,
        assistantState,
        setAssistantState,
        permissions,
        updatePermission,
        isMuted,
        setIsMuted,
        lastTranscript,
        setLastTranscript,
        lastResponse,
        setLastResponse,
        conversation,
        setConversation,
        sessionId,
        sttStatus,
        setSttStatus,
        voiceError,
        setVoiceError,
    };

    return (
        <AssistantContext.Provider value={value}>
            {children}
        </AssistantContext.Provider>
    );
};
