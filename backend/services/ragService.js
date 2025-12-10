import natural from 'natural';
import { Ollama } from 'ollama';

import { db } from '../lib/firebaseAdmin.js';

const ollama = new Ollama({ host: 'http://127.0.0.1:11434' });

// In-memory knowledge base (Lite RAG)
const vaquahContext = [
    {
        category: 'General',
        content: 'VaquaH is a premium Split AC solution provider for Indian homes and businesses. About VaquaH: We are a leading company offering quality AC products, expert installation, and reliable services. Who is VaquaH? We are your trusted partner for all air conditioning needs. What is VaquaH? A dedicated AC solutions brand.'
    },
    {
        category: 'Contact',
        content: 'You can contact VaquaH support at +91 9999999999 (This number is not an actual number please do not call) or email contact@vaquah.in. Our address is Vadodara Gujarat -390023, India. Operating hours: Mon-Sat: 10AM - 7PM IST.'
    },
    {
        category: 'Services',
        content: 'We offer AC Installation, AC Repair, AC Servicing (Jet Service, Foam Service), and Annual Maintenance Contracts (AMC). We also sell Split AC units.'
    },
    {
        category: 'Products',
        content: 'We sell high-quality Split ACs from top brands. Check our Products page for the latest models and prices.'
    },
    {
        category: 'Warranty',
        content: 'We provide standard manufacturer warranty on all products. Installation warranty is 1 year.'
    },
    {
        category: 'Shipping',
        content: 'We ship across Gujarat. Delivery usually takes 3-5 business days.'
    },
    {
        category: 'Offers',
        content: 'Check our Offers page for the latest discounts and hidden coupon codes.'
    },
    {
        category: 'Account',
        content: 'You are currently on our website. To create a profile or log in, simply click on the "SignIn/SignUp" button in the top navigation menu. This will take you to the login page where you can also find the option to register.'
    },
    {
        category: 'Site Structure',
        content: 'Our website has the following sections: Home, Products, Schedule Service (Book Appointment), Contracts, Offers, Contact. In the footer, you can find: FAQs, Warranty Policy, Shipping Info, Returns & Refunds, Track Your Order, Privacy Policy, and Terms of Service. We do NOT have a generic "Help" section; please refer to FAQs or Contact.'
    }
];

// TF-IDF for simple retrieval
const tfidf = new natural.TfIdf();

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

        // Rebuild TF-IDF
        tfidf.documents = []; // Clear existing
        vaquahContext.forEach((doc, index) => {
            tfidf.addDocument(doc.content.toLowerCase() + ' ' + doc.category.toLowerCase());
        });

        console.log('RAG Context initialized with dynamic services.');
    } catch (error) {
        console.error('Failed to initialize RAG context:', error);
        // Fallback to static TF-IDF build
        vaquahContext.forEach((doc, index) => {
            tfidf.addDocument(doc.content.toLowerCase() + ' ' + doc.category.toLowerCase());
        });
    }
};

// Start initialization
initializeContext();

export const retrieveContext = (query) => {
    const retrievalScores = [];

    tfidf.tfidfs(query.toLowerCase(), (i, measure) => {
        if (measure > 0) {
            retrievalScores.push({ index: i, score: measure, content: vaquahContext[i].content });
        }
    });

    // Sort by score and take top 3
    const topDocs = retrievalScores
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(d => d.content);

    return topDocs.join('\n\n');
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

        // Format history for Ollama
        const messages = [
            { role: 'system', content: systemPrompt },
            ...history.map(msg => ({ role: msg.role, content: msg.content })),
            { role: 'user', content: query }
        ];

        const response = await ollama.chat({
            model: 'llama3.2:1b', // Using a small model for speed
            messages: messages,
            stream: false
        });

        return response.message.content;
    } catch (error) {
        console.error('Ollama generation error:', error);
        return "I'm having trouble connecting to my brain right now. 🧠 Please try again later.";
    }
};
