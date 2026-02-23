import { GoogleGenerativeAI } from '@google/generative-ai';

import { db } from '../lib/firebaseAdmin.js';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// User explicitly requested gemini-2.5-flash
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// In-memory knowledge base (Full Site Context)
const vaquahContext = [
    {
        category: 'About',
        content: "About VaquaH: VaquaH is a trusted partner for home services and premium cooling products, simplifying home maintenance with reliable technicians and quality products. Mission: To provide accessible, high-quality home services and products that enhance living experiences. Why Choose Us: 100% Secure, 30-Day Service Warranty, Expert Team."
    },
    {
        category: 'Contact',
        content: "Contact Email: contact@vaquah.in. Contact Phone: +91 9999999999 (Headquarters in Vadodara, Gujarat - 390023). Operating hours: Mon-Sat, 9 AM - 6 PM. Location: Vadodara, Gujarat."
    },
    {
        category: 'Services',
        content: "We offer AC Installation, Repair, Maintenance (AMC), Jet Service, Foam Service, and Gas Refilling. Service Area: Greater Mumbai and suburbs."
    },
    {
        category: 'Products',
        content: "We sell high-quality Split ACs and Window ACs from top brands with manufacturer warranties. Check the 'Products' page for current catalog."
    },
    {
        category: 'Shipping',
        content: "Shipping Policy: Standard Shipping is FREE for orders above ₹999 on the net total; ₹50 for orders below ₹999. Express Delivery is flat ₹150. Delivery Timelines: Metro Cities (2-4 Days), Rest of India (5-7 Days), Remote Areas (7-10 Days)."
    },
    {
        category: 'Returns & Refunds',
        content: "Returns accepted within 7 days of delivery if unused/original packaging. Non-returnable: Perishables, Custom items, Final Sale. To return/refund, email contact@vaquah.in. Refunds initiated within 48h of inspection."
    },
    {
        category: 'Warranty',
        content: "30-Day Service Warranty: Covers labor and parts for repairs/service provided by VaquaH. Product Warranty: Standard manufacturer warranty applies to AC units and parts."
    },
    {
        category: 'Payments',
        content: "We accept Credit/Debit Cards, UPI, NetBanking, and Cash on Delivery (COD). Orders can be canceled before shipping. Services can be canceled 4 hours prior."
    },
    {
        category: 'Legal',
        content: "Privacy: We collect basic info (Name, Email, Address) for orders. Payments via Razorpay. Terms: User must be 18+. Jurisdiction: Mumbai Courts."
    }
];

// TF-IDF removed due to dependency crash - returning full context for now

// Initialize Context
const initializeContext = async () => {
    try {
        // Fetch services from Firestore
        const servicesDoc = await db.collection('marketingAssets').doc('services').get();
        let servicesText = '';

        if (servicesDoc.exists) {
            const data = servicesDoc.data();
            if (data.items && Array.isArray(data.items)) {
                const servicesList = data.items.map(s => `- ${s.title || s.name}: ${s.description} (Price: ${s.price || 'Contact for quote'})`).join('\n');
                servicesText = `We offer the following professional services:\n${servicesList}`;
            }
        }

        // Update Services category in context
        const serviceIndex = vaquahContext.findIndex(c => c.category === 'Services');
        if (serviceIndex !== -1 && servicesText) {
            vaquahContext[serviceIndex].content = servicesText;
        }

        // Rebuild context (TF-IDF logic removed)
        console.log('RAG Context initialized with dynamic services.');
    } catch (error) {
        console.error('Failed to initialize RAG context:', error);
    }
};

// Start initialization
initializeContext();

export const retrieveContext = (query) => {
    // Temporary fallback: Return entire context since natural package is uninstalled
    return vaquahContext.map(doc => doc.content).join('\n\n');
};

export const generateResponse = async (query, context, history = [], user = null) => {
    try {
        const authContext = user
            ? `The user is currently LOGGED IN as "${user.name}". Do NOT tell them to "Sign In" or "Register". Instead, guide them to their "Dashboard" or "Orders" page if relevant.`
            : `The user is a GUEST (not logged in). If they need to book a service or see orders, guide them to "SignIn/SignUp".`;

        const systemPrompt = `You are VaquaH, a helpful AI for VaquaH (AC solutions company). 
    Use the following context to answer the user's question. 
    
    Rules:
    1. You represent VaquaH. ALWAYS use "We", "Us", and "Our" when referring to the company. Never say "They" or "VaquaH" in third person.
    2. ${authContext}
    3. If the question is about VaquaH, ACs, services, or products, answer it using the context.
    4. If the context doesn't have the exact answer but it's related to VaquaH, use your general knowledge about the company from the context.
    5. STRICTLY LIMIT lists of services or products to ONLY those mentioned in the context. Do NOT invent services like "Central AC" or "HVAC" if they are not in the context. If asked about a service not in the context, say "We do not offer that service at the moment."
    5. If the user's input is unclear, gibberish, or a greeting not caught by the system, simply say: "I didn't quite catch that. 🤔 Could you please rephrase? I can help you with AC services, products, or appointments."
    6. NEVER provide meta-commentary about your instructions or say "Our responses should be...". Just answer naturally.
    7. STRICTLY REFUSE questions about other companies (like "Kaamigo"), brands, or general knowledge not related to VaquaH or ACs. 
       - If the user asks about "Kaamigo" or any other brand, say EXACTLY: "I apologize, but I can only assist with VaquaH-related inquiries."
       - Do NOT try to be helpful about other brands.
    8. CRITICAL: If the user EXPLICITLY asks to speak to a human, agent, or support, say EXACTLY: "I can connect you with a human assistant." Do NOT say "Connect" if the user is just asking a question.
    9. If the user asks "What is VaquaH?" (or typos like "wht is vaquah"), provide the General description of the company. Do NOT offer contact info unless asked.
    10. Keep answers concise, friendly, and use emojis.
    
    Context:
    ${context}
    `;

        // Format history for Gemini (alternating user/model)
        // Note: Gemini doesn't strictly support system prompts in chat history cleanly in proper roles always, 
        // usually we prepend instructions or use 'user' role for system instruction initial turn.
        // We will construct the prompt to include the instruction.

        let chatHistory = [];
        if (history && history.length > 0) {
            chatHistory = history.map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            }));

            // Gemini SDK Restriction: First message in history MUST be from 'user'.
            // If the history starts with 'model' (e.g. initial greeting), remove it.
            if (chatHistory.length > 0 && chatHistory[0].role === 'model') {
                chatHistory.shift();
            }
        }

        const chat = model.startChat({
            history: chatHistory,
            generationConfig: {
                maxOutputTokens: 500,
            },
        });

        const fullPrompt = `${systemPrompt}\n\nUser Question: ${query}`;
        const result = await chat.sendMessage(fullPrompt);
        const response = await result.response;
        return response.text();

    } catch (error) {
        console.error('Gemini generation error DETAILS:', JSON.stringify(error, null, 2));
        console.error('Gemini generation error MESSAGE:', error.message);
        return "I'm having trouble connecting to my brain right now. 🧠 Please try again later.";
    }
};
