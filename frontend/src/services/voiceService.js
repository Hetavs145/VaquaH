import { useState, useEffect, useRef } from 'react';
import { useAssistant } from '../context/AssistantContext';
import { ASSISTANT_ACTIONS, dispatchAssistantAction } from './assistantActions';
import { useNavigate } from 'react-router-dom';

export const useVoiceRecognition = () => {
    const {
        isAssistantOpen,
        openAssistant,
        closeAssistant,
        isListening,
        setIsListening,
        isWakeWordListening,
        permissions,
        updatePermission,
        setAssistantState
    } = useAssistant();

    const navigate = useNavigate();
    const recognitionRef = useRef(null);
    const wakeWordRecognitionRef = useRef(null);

    // Intent Parser (Simple Keyword Matching)
    const parseIntent = (transcript) => {
        const text = transcript.toLowerCase();

        if (text.includes('close') || text.includes('shut down') || text.includes('bye')) {
            return ASSISTANT_ACTIONS.CLOSE_ASSISTANT;
        }
        if (text.includes('checkout') || text.includes('buy now')) {
            return ASSISTANT_ACTIONS.NAVIGATE_CHECKOUT;
        }
        if (text.includes('cart') || text.includes('basket')) {
            return ASSISTANT_ACTIONS.NAVIGATE_CART;
        }
        if (text.includes('home') || text.includes('main page')) {
            return ASSISTANT_ACTIONS.NAVIGATE_HOME;
        }
        if (text.includes('product') || text.includes('shop')) {
            return ASSISTANT_ACTIONS.NAVIGATE_PRODUCTS;
        }
        if (text.includes('back') || text.includes('go back')) {
            return ASSISTANT_ACTIONS.NAVIGATE_BACK;
        }
        if (text.includes('scroll down') || text.includes('down')) {
            return ASSISTANT_ACTIONS.SCROLL_DOWN;
        }
        if (text.includes('scroll up') || text.includes('up')) {
            return ASSISTANT_ACTIONS.SCROLL_UP;
        }
        if (text.includes('top')) {
            return ASSISTANT_ACTIONS.SCROLL_TOP;
        }
        if (text.includes('bottom')) {
            return ASSISTANT_ACTIONS.SCROLL_BOTTOM;
        }

        return null;
    };

    // Initialize Main Recognition
    useEffect(() => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.error("Browser does not support Speech Recognition");
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = false; // Stop after one sentence for commands
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            updatePermission('microphone', 'granted');
            setAssistantState('listening');
        };

        recognition.onerror = (event) => {
            if (event.error === 'not-allowed') {
                updatePermission('microphone', 'denied');
                setAssistantState('error');
            }
            console.error("Speech Recognition Error", event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
            // If we were listening and it stopped naturally, maybe go back to idle or keep listening?
            // For now, let's close listening state.
            setAssistantState('processing');
            setTimeout(() => {
                if (isAssistantOpen) setAssistantState('idle'); // Back to idle (pulsing)
            }, 1000);
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            console.log("Voice Command:", transcript);

            setAssistantState('processing');

            const action = parseIntent(transcript);
            if (action) {
                if (action === ASSISTANT_ACTIONS.CLOSE_ASSISTANT) {
                    closeAssistant();
                } else {
                    dispatchAssistantAction(action, navigate);
                    // Provide feedback?
                }
            } else {
                console.log("No intent match");
            }
        };

        recognitionRef.current = recognition;

    }, [isAssistantOpen, navigate]);


    // Handle Active Listening Toggle
    useEffect(() => {
        if (isListening && recognitionRef.current) {
            try {
                recognitionRef.current.start();
            } catch (e) {
                // Already started
            }
        } else if (!isListening && recognitionRef.current) {
            recognitionRef.current.stop();
        }
    }, [isListening]);


    // Wake Word Logic ("VaquaH")
    useEffect(() => {
        if (!isWakeWordListening || isAssistantOpen) return;

        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const wakeRecognition = new SpeechRecognition();
        wakeRecognition.continuous = true;
        wakeRecognition.interimResults = true;
        wakeRecognition.lang = 'en-US';

        wakeRecognition.onresult = (event) => {
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    const transcript = event.results[i][0].transcript.trim().toLowerCase();
                    console.log("Wake Word Check:", transcript);
                    if (transcript.includes('vaquah') || transcript.includes('aqua') || transcript.includes('start assistant')) {
                        console.log("Wake Word Detected!");
                        openAssistant();
                        wakeRecognition.stop();
                    }
                }
            }
        };

        wakeRecognition.onerror = (e) => {
            console.log("Wake Word Error (ignorable):", e.error);
            if (e.error === 'not-allowed') updatePermission('microphone', 'denied');
        };

        wakeRecognition.onend = () => {
            // Restart if supposed to be listening
            if (isWakeWordListening && !isAssistantOpen) {
                try {
                    wakeRecognition.start();
                } catch (e) { }
            }
        };

        try {
            wakeRecognition.start();
        } catch (e) { }

        wakeWordRecognitionRef.current = wakeRecognition;

        return () => {
            if (wakeWordRecognitionRef.current) wakeWordRecognitionRef.current.stop();
        };

    }, [isWakeWordListening, isAssistantOpen]);

    return null; // This is a logic hook, doesn't render handling directly
};
