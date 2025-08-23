import { Router } from 'express';
import { db, AdminFieldValue } from '../lib/firebaseAdmin.js';
import { verifyAdmin } from '../middleware/adminAuth.js';

const router = Router();

// Allowed transitions map
const allowedTransitions = {
  created: ['payment_pending', 'cod_pending', 'cancelled'],
  payment_pending: ['paid', 'cancelled'],
  cod_pending: ['awaiting_advance', 'cancelled'],
  awaiting_advance: ['advance_paid', 'cancelled'],
  advance_paid: ['success', 'cancelled'],
  paid: ['success', 'refunded', 'cancelled'],
  success: ['shipping', 'cancelled'],
  shipping: ['out_for_delivery', 'cancelled'],
  out_for_delivery: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
  refunded: [],
};

function canTransition(from, to) {
  const allowed = allowedTransitions[from] || [];
  return allowed.includes(to);
}

// List orders with filters
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const { status, userId, limit = 50 } = req.query;
    let ref = db.collection('orders');
    if (status) ref = ref.where('status', '==', status);
    if (userId) ref = ref.where('userId', '==', userId);
    const snap = await ref.orderBy('createdAt', 'desc').limit(Number(limit)).get();
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return res.json({ orders: data });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to list orders', error: err?.message });
  }
});

// Get single order
router.get('/:id', verifyAdmin, async (req, res) => {
  try {
    const ref = db.collection('orders').doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ message: 'Order not found' });
    return res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to get order', error: err?.message });
  }
});

// Update status with audit timeline
router.post('/:id/status', verifyAdmin, async (req, res) => {
  try {
    const { nextStatus, note } = req.body || {};
    if (!nextStatus) return res.status(400).json({ message: 'nextStatus required' });

    const ref = db.collection('orders').doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ message: 'Order not found' });
    const order = doc.data();
    const current = order.status || (order.isPaid ? 'paid' : 'created');

    if (!canTransition(current, nextStatus)) {
      return res.status(400).json({ message: `Invalid transition from ${current} to ${nextStatus}` });
    }

    await ref.update({ status: nextStatus, updatedAt: AdminFieldValue.serverTimestamp() });
    await ref.collection('timeline').add({
      action: 'status_update',
      fromStatus: current,
      toStatus: nextStatus,
      byUserId: req.admin.uid,
      note: note || null,
      at: AdminFieldValue.serverTimestamp(),
    });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update status', error: err?.message });
  }
});

export default router;


