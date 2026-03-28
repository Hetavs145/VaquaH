import os from 'os';
import { db } from '../lib/firebaseAdmin.js';

const CHECK_INTERVAL = 60_000; // 60s
const history = []; // rolling window of last 60 readings (1 hour)
const MAX_HISTORY = 60;

const getSystemMetrics = () => ({
  timestamp: new Date().toISOString(),
  uptime: process.uptime(),
  memory: {
    rss: process.memoryUsage().rss,
    heapUsed: process.memoryUsage().heapUsed,
    heapTotal: process.memoryUsage().heapTotal,
    external: process.memoryUsage().external,
  },
  cpu: os.loadavg(),
  freeMemory: os.freemem(),
  totalMemory: os.totalmem(),
  platform: os.platform(),
  nodeVersion: process.version,
});

const checkFirestore = async () => {
  try {
    const start = Date.now();
    await db.collection('_health').doc('ping').set({ t: Date.now() });
    return { ok: true, latencyMs: Date.now() - start };
  } catch (e) {
    return { ok: false, error: e.message };
  }
};

const runHealthCheck = async () => {
  const system = getSystemMetrics();
  const firestore = await checkFirestore();

  const entry = {
    timestamp: system.timestamp,
    system,
    services: { firestore },
    status: firestore.ok ? 'healthy' : 'degraded',
  };

  history.push(entry);
  if (history.length > MAX_HISTORY) history.shift();

  return entry;
};

export const getLatestHealth = () => history[history.length - 1] || null;
export const getHealthHistory = () => [...history];

export const getDetailedHealth = async () => {
  const latest = await runHealthCheck();
  const memUsagePct = ((1 - os.freemem() / os.totalmem()) * 100).toFixed(1);
  return {
    ...latest,
    memoryUsagePercent: memUsagePct,
    historyLength: history.length,
  };
};

export const initHealthMonitor = () => {
  // Run initial check immediately
  runHealthCheck().then((h) => {
    console.log(`🏥 Health monitor started: ${h.status}`);
  });

  // Schedule recurring checks
  setInterval(runHealthCheck, CHECK_INTERVAL);
};
