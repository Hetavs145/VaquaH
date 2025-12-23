import cron from 'node-cron';
import { db } from '../lib/firebaseAdmin.js';

const CLEANUP_THRESHOLD_DAYS = 365;

const cleanupOldData = async () => {
    console.log('🧹 [Cleanup] Starting daily cleanup job...');

    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - CLEANUP_THRESHOLD_DAYS);
        const cutoffTimestamp = cutoffDate; // Firestore handles Date objects in queries

        console.log(`🧹 [Cleanup] Deleting records older than: ${cutoffDate.toISOString()}`);

        // 1. Cleanup Orders
        const ordersSnapshot = await db.collection('orders')
            .where('createdAt', '<', cutoffTimestamp)
            .limit(500) // Process in batches to avoid memory/timeout issues
            .get();

        if (!ordersSnapshot.empty) {
            const batch = db.batch();
            ordersSnapshot.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
            console.log(`✅ [Cleanup] Deleted ${ordersSnapshot.size} old orders.`);

            // If we hit the limit, re-run immediately to get the next batch (optional, but good for backlog)
            if (ordersSnapshot.size === 500) {
                console.log('🧹 [Cleanup] More orders to delete, re-running cleanup...');
                setImmediate(cleanupOldData);
                return;
            }
        } else {
            console.log('✅ [Cleanup] No old orders found.');
        }

        // 2. Cleanup Appointments
        // Appointments might use 'date' or 'createdAt'
        // We'll check 'date' primarily as that's the service date
        const appointmentsSnapshot = await db.collection('appointments')
            .where('date', '<', cutoffTimestamp)
            .limit(500)
            .get();

        if (!appointmentsSnapshot.empty) {
            const batch = db.batch();
            appointmentsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
            console.log(`✅ [Cleanup] Deleted ${appointmentsSnapshot.size} old appointments.`);
        } else {
            console.log('✅ [Cleanup] No old appointments found.');
        }

    } catch (error) {
        console.error('❌ [Cleanup] Error during cleanup:', error);
    }
};

export const initCleanupService = () => {
    // Run every day at midnight (00:00)
    cron.schedule('0 0 * * *', () => {
        cleanupOldData();
    });

    console.log('🕰️ [Cleanup] Service initialized (Runs daily at 00:00)');
};
