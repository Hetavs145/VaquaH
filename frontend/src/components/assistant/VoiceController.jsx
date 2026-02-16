import React from 'react';
import { useVoiceRecognition } from '../../services/voiceService';

const VoiceController = () => {
    useVoiceRecognition();
    return null;
};

export default VoiceController;
