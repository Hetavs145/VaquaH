import { Router } from 'express';
import { db, AdminFieldValue } from '../lib/firebaseAdmin.js';
import { verifyAdmin } from '../middleware/adminAuth.js';

const router = Router();

// Get visible active offers (Public)
router.get('/', async (req, res) => {
    try {
        const snapshot = await db.collection('offers')
            .where('active', '==', true)
            .where('isHidden', '==', false)
            .orderBy('createdAt', 'desc')
            .get();

        const offers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(offers);
    } catch (error) {
        console.error('Error fetching offers:', error);
        res.status(500).json({ message: 'Failed to fetch offers' });
    }
});

// Validate offer code (Public - for hidden offers)
router.post('/validate', async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) return res.status(400).json({ message: 'Code is required' });

        const snapshot = await db.collection('offers')
            .where('code', '==', code.toUpperCase())
            .limit(1)
            .get();

        if (snapshot.empty) {
            return res.status(404).json({ message: 'Invalid or expired offer code' });
        }

        const offer = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };

        if (!offer.active) {
            return res.status(404).json({ message: 'Invalid or expired offer code' });
        }

        // Check minimum order value if provided in request
        const { amount } = req.body;
        if (amount && offer.minOrderValue && amount < offer.minOrderValue) {
            return res.status(400).json({
                message: `Minimum order value of ₹${offer.minOrderValue} required`,
                minOrderValue: offer.minOrderValue
            });
        }

        res.json(offer);
    } catch (error) {
        console.error('Error validating offer:', error);
        res.status(500).json({ message: 'Failed to validate offer' });
    }
});

// Admin: Get all offers
router.get('/admin', verifyAdmin, async (req, res) => {
    try {
        const snapshot = await db.collection('offers').orderBy('createdAt', 'desc').get();
        const offers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(offers);
    } catch (error) {
        console.error('Error fetching admin offers:', error);
        res.status(500).json({ message: 'Failed to fetch offers' });
    }
});

// Admin: Create offer
router.post('/admin', verifyAdmin, async (req, res) => {
    try {
        const { title, code, discountPercent, active, isHidden, minOrderValue } = req.body;

        const newOffer = {
            title,
            code: code.toUpperCase(),
            discountPercent: Number(discountPercent),
            active: !!active,
            isHidden: !!isHidden,
            minOrderValue: Number(minOrderValue) || 0,
            createdAt: AdminFieldValue.serverTimestamp(),
            updatedAt: AdminFieldValue.serverTimestamp()
        };
        const docRef = await db.collection('offers').add(newOffer);
        res.status(201).json({ id: docRef.id, ...newOffer });
    } catch (error) {
        console.error('Error creating offer:', error);
        res.status(500).json({ message: 'Failed to create offer' });
    }
});

// Admin: Update offer
router.put('/admin/:id', verifyAdmin, async (req, res) => {
    try {
        const { title, code, discountPercent, active, isHidden, minOrderValue } = req.body;
        const { id } = req.params;

        const updateData = {
            title,
            code: code.toUpperCase(),
            discountPercent: Number(discountPercent),
            active: !!active,
            isHidden: !!isHidden,
            minOrderValue: Number(minOrderValue) || 0,
            updatedAt: AdminFieldValue.serverTimestamp()
        };
        await db.collection('offers').doc(id).update(updateData);
        res.json({ id, ...updateData });
    } catch (error) {
        console.error('Error updating offer:', error);
        res.status(500).json({ message: 'Failed to update offer' });
    }
});

// Admin: Delete offer
router.delete('/admin/:id', verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('offers').doc(id).delete();
        res.json({ message: 'Offer deleted successfully' });
    } catch (error) {
        console.error('Error deleting offer:', error);
        res.status(500).json({ message: 'Failed to delete offer' });
    }
});

export default router;
