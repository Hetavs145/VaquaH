// Lets the voice agent "see" and operate the current page.

const BLOCKED = /\b(pay|payment|place order|confirm order|delete|remove account|log ?out|sign ?out)\b/i;
const OVERLAY_SELECTOR = '[data-assistant-overlay]';

const isVisible = (el) => {
  if (el.closest(OVERLAY_SELECTOR)) return false;
  const r = el.getBoundingClientRect();
  if (r.width === 0 || r.height === 0) return false;
  const s = window.getComputedStyle(el);
  return s.visibility !== 'hidden' && s.display !== 'none' && s.opacity !== '0';
};

const labelOf = (el) => {
  const text = (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
  return (
    text ||
    el.getAttribute('aria-label') ||
    el.getAttribute('title') ||
    el.getAttribute('placeholder') ||
    el.getAttribute('name') ||
    ''
  ).slice(0, 80);
};

const fieldLabel = (el) => {
  const byFor = el.id ? document.querySelector(`label[for="${CSS.escape(el.id)}"]`) : null;
  return (
    el.getAttribute('aria-label') ||
    el.getAttribute('placeholder') ||
    byFor?.innerText ||
    el.closest('label')?.innerText ||
    el.getAttribute('name') ||
    ''
  ).replace(/\s+/g, ' ').trim().slice(0, 80);
};

/** Short descriptions of what's clickable / fillable right now (sent to the agent). */
export const collectPageElements = () => {
  const seen = new Set();
  const out = [];
  const add = (s) => { if (s && !seen.has(s)) { seen.add(s); out.push(s); } };

  document.querySelectorAll('a[href], button, [role="button"]').forEach((el) => {
    if (out.length >= 80 || !isVisible(el)) return;
    const label = labelOf(el);
    if (label) add(`${el.tagName === 'A' ? 'link' : 'button'}: ${label}`);
  });
  document.querySelectorAll('input:not([type=hidden]):not([type=password]), textarea, select').forEach((el) => {
    if (out.length >= 80 || !isVisible(el)) return;
    const label = fieldLabel(el);
    if (label) add(`input: ${label}`);
  });
  return out;
};

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9₹ ]/g, '').replace(/\s+/g, ' ').trim();

const findClickable = (text) => {
  const target = norm(text);
  const candidates = [...document.querySelectorAll('a[href], button, [role="button"]')].filter(isVisible);
  return (
    candidates.find((el) => norm(labelOf(el)) === target) ||
    candidates.find((el) => norm(labelOf(el)).startsWith(target)) ||
    candidates.find((el) => norm(labelOf(el)).includes(target))
  );
};

const findField = (name) => {
  const target = norm(name);
  const fields = [...document.querySelectorAll('input:not([type=hidden]):not([type=password]), textarea')].filter(isVisible);
  return fields.find((el) => norm(fieldLabel(el)) === target) || fields.find((el) => norm(fieldLabel(el)).includes(target));
};

const setNativeValue = (el, value) => {
  const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value); // works with React-controlled inputs
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
};

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Execute agent actions in order.
 * @returns {Promise<{closeRequested: boolean, failed: string[]}>}
 */
export const executeActions = async (actions = [], { navigate }) => {
  let closeRequested = false;
  const failed = [];

  for (const a of actions) {
    try {
      switch (a.type) {
        case 'navigate':
          navigate(a.path);
          await wait(400); // let the new page render before any follow-up action
          break;
        case 'search':
          navigate(`/search?q=${encodeURIComponent(a.query)}`);
          await wait(400);
          break;
        case 'back':
          navigate(-1);
          await wait(400);
          break;
        case 'scroll': {
          const amount = window.innerHeight * 0.8;
          if (a.direction === 'down') window.scrollBy({ top: amount, behavior: 'smooth' });
          if (a.direction === 'up') window.scrollBy({ top: -amount, behavior: 'smooth' });
          if (a.direction === 'top') window.scrollTo({ top: 0, behavior: 'smooth' });
          if (a.direction === 'bottom') window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
          break;
        }
        case 'click': {
          if (BLOCKED.test(a.text)) { failed.push(a.text); break; }
          const el = findClickable(a.text);
          if (!el || BLOCKED.test(labelOf(el))) { failed.push(a.text); break; }
          el.scrollIntoView({ block: 'center', behavior: 'smooth' });
          await wait(250);
          el.click();
          await wait(400);
          break;
        }
        case 'fill': {
          const el = findField(a.field);
          if (!el) { failed.push(a.field); break; }
          el.focus();
          setNativeValue(el, a.value);
          break;
        }
        case 'close':
          closeRequested = true;
          break;
        default:
          break;
      }
    } catch (e) {
      console.warn('[Assistant] action failed', a, e);
      failed.push(a.type);
    }
  }
  return { closeRequested, failed };
};
