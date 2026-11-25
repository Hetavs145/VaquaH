import { chatComplete } from '../lib/llm.js';
import { retrieveContext } from './ragService.js';

// Pages the agent may navigate to. Keep in sync with frontend/src/App.jsx routes.
export const SITE_PAGES = {
  '/': 'Home page',
  '/products': 'All AC products catalog',
  '/services': 'All AC services (installation, repair, gas refill, etc.)',
  '/appointments/new': 'Book / schedule a service appointment (requires login)',
  '/contracts': 'Annual maintenance contracts (AMC)',
  '/cart': 'Shopping cart (requires login)',
  '/checkout': 'Checkout (requires login)',
  '/wishlist': 'Wishlist (requires login)',
  '/dashboard': "User's dashboard, orders and appointments (requires login)",
  '/track-order': 'Track an order',
  '/search': 'Search results (use the search action instead of navigating here)',
  '/login': 'Sign in',
  '/register': 'Create an account',
  '/about': 'About VaquaH',
  '/contact': 'Contact us',
  '/faqs': 'Frequently asked questions',
  '/warranty': 'Warranty policy',
  '/shipping': 'Shipping policy',
  '/returns': 'Returns & refunds policy',
  '/privacy-policy': 'Privacy policy',
  '/terms': 'Terms and conditions',
  '/guide': 'How to use the website',
};

const ACTION_TYPES = ['navigate', 'scroll', 'back', 'search', 'click', 'fill', 'close'];

const buildSystemPrompt = ({ context, page, pageElements, user }) => `You are VaquaH's live voice assistant on the VaquaH website (AC products and services company, India).
You talk to the user by VOICE and you can operate the website for them.

Reply ONLY with a JSON object of this shape:
{"reply": "<what you say out loud>", "actions": [ ...zero or more actions... ]}

Available actions (executed in order in the user's browser):
- {"type":"navigate","path":"<one of the pages below>"}
- {"type":"search","query":"<product or service search text>"}
- {"type":"scroll","direction":"up"|"down"|"top"|"bottom"}
- {"type":"back"}
- {"type":"click","text":"<exact visible text of a button or link on the current page>"}
- {"type":"fill","field":"<label/placeholder/name of an input on the current page>","value":"<text>"}
- {"type":"close"}  (close the voice assistant, e.g. when the user says bye)

Pages:
${Object.entries(SITE_PAGES).map(([p, d]) => `  ${p} — ${d}`).join('\n')}

Current page: ${page || '/'}
Clickable elements / inputs visible on the current page:
${pageElements?.length ? pageElements.slice(0, 60).map(e => `  - ${e}`).join('\n') : '  (unknown)'}

User: ${user ? `logged in as ${user.name || user.email}` : 'guest (not logged in)'}

Rules:
1. "reply" is spoken aloud: 1-2 short, natural sentences. No emojis, markdown, lists or URLs.
2. If the user asks to go somewhere or do something on the site, include the matching action(s) and briefly confirm ("Opening your cart.").
3. Only use "click"/"fill" with elements that appear in the list above. Never click anything that pays, places an order, deletes data or logs out — ask the user to do that themselves.
4. Answer questions about VaquaH using the knowledge below. Speak as "we". If you don't know, say so and offer the Contact page.
5. Politely decline topics unrelated to VaquaH, air conditioners or using this website.
6. If unsure what the user meant, ask a short clarifying question with no actions.

Knowledge:
${context}`;

const sanitizeActions = (actions) => {
  if (!Array.isArray(actions)) return [];
  return actions
    .filter(a => a && ACTION_TYPES.includes(a.type))
    .map(a => {
      switch (a.type) {
        case 'navigate': {
          const path = typeof a.path === 'string' ? a.path.split('?')[0] : '';
          return SITE_PAGES[path] ? { type: 'navigate', path } : null;
        }
        case 'scroll':
          return ['up', 'down', 'top', 'bottom'].includes(a.direction) ? { type: 'scroll', direction: a.direction } : null;
        case 'search':
          return typeof a.query === 'string' && a.query.trim() ? { type: 'search', query: a.query.trim().slice(0, 100) } : null;
        case 'click':
          return typeof a.text === 'string' && a.text.trim() ? { type: 'click', text: a.text.trim().slice(0, 100) } : null;
        case 'fill':
          return typeof a.field === 'string' && typeof a.value === 'string'
            ? { type: 'fill', field: a.field.slice(0, 100), value: a.value.slice(0, 500) } : null;
        default:
          return { type: a.type };
      }
    })
    .filter(Boolean)
    .slice(0, 5);
};

// Used when no LLM is reachable, so basic navigation still works.
const fallbackIntent = (message) => {
  const t = message.toLowerCase();
  const nav = [
    [/\b(cart|basket)\b/, '/cart', 'Opening your cart.'],
    [/\bcheck ?out\b/, '/checkout', 'Taking you to checkout.'],
    [/\b(book|schedule|appointment)\b/, '/appointments/new', 'Opening the booking page.'],
    [/\bservices?\b/, '/services', 'Here are our services.'],
    [/\b(products?|shop|catalog)\b/, '/products', 'Here are our products.'],
    [/\b(contract|amc)\b/, '/contracts', 'Here are our maintenance contracts.'],
    [/\b(dashboard|my orders|orders)\b/, '/dashboard', 'Opening your dashboard.'],
    [/\bwishlist\b/, '/wishlist', 'Opening your wishlist.'],
    [/\bcontact\b/, '/contact', 'Opening the contact page.'],
    [/\babout\b/, '/about', 'Here is more about us.'],
    [/\bfaqs?\b/, '/faqs', 'Opening the FAQs.'],
    [/\b(log ?in|sign ?in)\b/, '/login', 'Opening sign in.'],
    [/\bhome\b/, '/', 'Going home.'],
  ];
  if (/\b(bye|goodbye|close|stop listening)\b/.test(t)) return { reply: 'Goodbye!', actions: [{ type: 'close' }] };
  if (/\bgo back\b/.test(t)) return { reply: 'Going back.', actions: [{ type: 'back' }] };
  if (/\bscroll (down|up)\b/.test(t)) return { reply: '', actions: [{ type: 'scroll', direction: t.match(/scroll (down|up)/)[1] }] };
  for (const [re, path, reply] of nav) if (re.test(t)) return { reply, actions: [{ type: 'navigate', path }] };
  return { reply: "Sorry, I can't reach my AI brain right now. I can still open pages like products, services or your cart.", actions: [] };
};

export const runAgent = async ({ message, history = [], page, pageElements, user }) => {
  let context = '';
  try {
    context = await retrieveContext(message.toLowerCase());
  } catch { /* knowledge is optional */ }

  const messages = [{ role: 'system', content: buildSystemPrompt({ context, page, pageElements, user }) }];
  for (const m of (Array.isArray(history) ? history.slice(-8) : [])) {
    if (!m?.content) continue;
    messages.push({ role: m.role === 'user' ? 'user' : 'assistant', content: String(m.content).slice(0, 1000) });
  }
  messages.push({ role: 'user', content: message });

  try {
    const raw = await chatComplete(messages, { json: true, maxTokens: 400, temperature: 0.3 });
    const match = raw.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(match ? match[0] : raw);
    const actions = sanitizeActions(parsed.actions);
    let reply = typeof parsed.reply === 'string' ? parsed.reply.trim() : '';
    if (!reply && !actions.length) {
      reply = 'Sorry, I can only help with VaquaH, air conditioners and using this website.';
    }
    return { reply, actions };
  } catch (e) {
    console.error('Agent LLM error:', e.message);
    return fallbackIntent(message);
  }
};
