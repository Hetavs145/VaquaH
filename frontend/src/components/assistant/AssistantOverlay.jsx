import React, { useEffect, useState } from 'react';
import { useAssistant } from '../../context/AssistantContext';
import VoiceSphere from './VoiceSphere';
import { X } from 'lucide-react';

const AssistantOverlay = () => {
    const { isAssistantOpen, closeAssistant, assistantState } = useAssistant();
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        if (isAssistantOpen) {
            setGreeting("Hello, how may I help you?");
            // TODO: Trigger Text-to-Speech here later
        } else {
            setGreeting('');
        }
    }, [isAssistantOpen]);

    if (!isAssistantOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">

            <button
                onClick={closeAssistant}
                className="absolute top-6 right-6 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
                <X size={32} />
            </button>

            <div className="flex flex-col items-center space-y-8">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl md:text-4xl font-light text-white tracking-wide">
                        {greeting}
                    </h2>
                    <p className="text-white/50 text-sm">
                        {assistantState === 'listening' ? "Listening..." : "Processing..."}
                    </p>
                </div>

                <div className="relative">
                    <VoiceSphere />
                </div>

                <div className="flex gap-4">
                    {/* Future: Quick action chips can go here */}
                </div>
            </div>
        </div>
    );
};

export default AssistantOverlay;
