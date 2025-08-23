import { Router } from 'express';
import { adminAuth } from '../lib/firebaseAdmin.js';

const router = Router();

// Simple bootstrap route to grant admin role using a server secret
// Usage: POST /api/admin/users/grant-admin { email | uid }
router.post('/grant-admin', async (req, res) => {
  try {
    const secret = req.headers['x-admin-secret'];
    if (!process.env.ADMIN_BOOTSTRAP_SECRET) {
      return res.status(500).json({ message: 'ADMIN_BOOTSTRAP_SECRET not configured' });
    }
    if (secret !== process.env.ADMIN_BOOTSTRAP_SECRET) {
      return res.status(403).json({ message: 'Invalid bootstrap secret' });
    }

    const { email, uid } = req.body || {};
    if (!email && !uid) {
      return res.status(400).json({ message: 'Provide email or uid' });
    }

    let userRecord;
    if (uid) {
      userRecord = await adminAuth.getUser(uid);
    } else {
      userRecord = await adminAuth.getUserByEmail(email);
    }

    await adminAuth.setCustomUserClaims(userRecord.uid, { role: 'admin' });
    return res.json({ ok: true, uid: userRecord.uid, email: userRecord.email, role: 'admin' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to grant admin', error: err?.message });
  }
});

export default router;


