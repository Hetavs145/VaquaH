import { Router } from 'express';
import { retrieveContext, generateResponse } from '../services/ragService.js';

const router = Router();

// Intent Regex Patterns
const GREETING_REGEX = /^(hi|hello|hey|hillo|helo|hola|holla|holllla|hiya|yo|greetings|good morning|good afternoon|good evening)/i;
const BYE_REGEX = /^(ok\s*)?(bye+|byy+|goodbye|tata|cya|see\s*you|exit|quit|end(\s*chat)?|no\s*thanks|i'?m\s*done|stop|finish|leave)/i;
const CONNECT_REGEX = /^(connect|contact|human|support|agent|help me human)/i;

const GREETING_RESPONSES = [
    "Hello! 👋 Welcome to VaquaH. How can I assist you today?",
    "Hi there! 🌟 I'm VaquaH. What can I do for you?",
    "Greetings! ❄️ Ready to help you with all things AC. Ask away!"
];

router.post('/', async (req, res) => {
    try {
        const { message, history, user } = req.body;

        if (!message) return res.status(400).json({ message: 'Message is required' });

        const cleanMessage = message.trim().toLowerCase();

        // 1. Check for Greetings (Fast Path)
        if (GREETING_REGEX.test(cleanMessage)) {
            const response = GREETING_RESPONSES[Math.floor(Math.random() * GREETING_RESPONSES.length)];
            return res.json({
                response,
                type: 'text'
            });
        }

        // 2. Check for Bye (Fast Path)
        if (BYE_REGEX.test(cleanMessage)) {
            return res.json({
                response: "Is there anything else I could help you with? 😊",
                type: 'options',
                options: [
                    { label: 'End Chat', action: 'end_chat' },
                    { label: 'Start New Conversation', action: 'new_chat' }
                ]
            });
        }

        // 3. Check for Connect/Human (Fast Path)
        if (CONNECT_REGEX.test(cleanMessage)) {
            return res.json({
                response: "Sure, I can connect you with a human assistant. 🤝 Choose an option below:",
                type: 'options',
                options: [
                    { label: 'Call Us 📞', action: 'link', url: 'tel:+919999999999' },
                    { label: 'Email Us 📧', action: 'link', url: 'mailto:contact@vaquah.in' }
                ]
            });
        }

        // 4. RAG / LLM Generation (Slow Path)
        // Retrieve context
        const context = retrieveContext(cleanMessage);

        // Generate response
        const aiResponse = await generateResponse(message, context, history || [], user);

        // Check if AI suggests connecting
        if (aiResponse.toLowerCase().includes('connect') && (aiResponse.toLowerCase().includes('human') || aiResponse.toLowerCase().includes('assistant') || aiResponse.toLowerCase().includes('representative'))) {
            return res.json({
                response: aiResponse,
                type: 'options',
                options: [
                    { label: 'Call Us 📞', action: 'link', url: 'tel:+919999999999' },
                    { label: 'Email Us 📧', action: 'link', url: 'mailto:contact@vaquah.in' }
                ]
            });
        }

        return res.json({
            response: aiResponse,
            type: 'text'
        });

    } catch (error) {
        console.error('Chatbot error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
