import { Router } from 'express';
import { getLatestHealth, getHealthHistory, getDetailedHealth } from '../services/healthMonitor.js';

const router = Router();

// GET /api/health/status — Quick status
router.get('/status', (_req, res) => {
  const latest = getLatestHealth();
  if (!latest) return res.json({ status: 'starting', message: 'Health data not yet available' });
  res.json({ status: latest.status, timestamp: latest.timestamp });
});

// GET /api/health/detailed — Full metrics (admin)
router.get('/detailed', async (_req, res) => {
  try {
    const detailed = await getDetailedHealth();
    res.json(detailed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/health/history — Last hour of checks
router.get('/history', (_req, res) => {
  res.json({ checks: getHealthHistory() });
});

export default router;
