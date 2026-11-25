import { db, AdminFieldValue } from '../lib/firebaseAdmin.js';

const COLLECTION = 'assistantConversations';

/**
 * Append messages to a conversation in Firestore:
 *   assistantConversations/{sessionId}            -> summary doc
 *   assistantConversations/{sessionId}/messages/* -> each turn
 * Never throws: logging must not break the assistant.
 */
export const logTurn = async ({ sessionId, channel = 'chat', user = null, page = null, messages = [] }) => {
  if (!sessionId || typeof sessionId !== 'string' || sessionId.length > 100 || !messages.length) return;
  try {
    const convRef = db.collection(COLLECTION).doc(sessionId);
    const batch = db.batch();
    const now = AdminFieldValue.serverTimestamp();
    const isNew = !(await convRef.get()).exists;

    batch.set(convRef, {
      channel,
      userId: user?.id || null,
      userName: user?.name || null,
      userEmail: user?.email || null,
      lastPage: page || null,
      lastMessage: String(messages[messages.length - 1].content || '').slice(0, 500),
      messageCount: AdminFieldValue.increment(messages.length),
      updatedAt: now,
      ...(isNew ? { createdAt: now } : {}),
    }, { merge: true });

    messages.forEach((m, i) => {
      const ref = convRef.collection('messages').doc();
      batch.set(ref, {
        role: m.role,
        content: String(m.content || '').slice(0, 4000),
        actions: m.actions || [],
        page: page || null,
        channel,
        order: Date.now() + i,
        createdAt: now,
      });
    });

    await batch.commit();
  } catch (e) {
    console.warn('Conversation log failed:', e.message);
  }
};
