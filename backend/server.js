import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import paymentRoutes from './routes/paymentRoutes.js';
import adminOrdersRouter from './routes/adminOrders.js';
import adminUsersRouter from './routes/adminUsers.js';
import offersRoutes from './routes/offersRoutes.js';
import chatbotRoutes from './routes/chatbotRoutes.js';

const app = express();

const corsOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'http://localhost:8081',
  'http://127.0.0.1:8081',
];

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin || corsOrigins.includes(origin)) return cb(null, true);
    return cb(null, true); // dev-friendly
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

// Health
app.get('/', (_req, res) => res.json({ message: 'VaquaH API is running', status: 'success', timestamp: new Date().toISOString() }));
app.get('/health', (_req, res) => res.json({ status: 'healthy', timestamp: new Date().toISOString(), uptime: process.uptime() }));
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Routes
app.use('/api/payments', paymentRoutes);
app.use('/api/admin/orders', adminOrdersRouter);
app.use('/api/admin/users', adminUsersRouter);
app.use('/api/offers', offersRoutes);
app.use('/api/chat', chatbotRoutes);

// Initialize Services
import { initCleanupService } from './services/cleanupService.js';
initCleanupService();

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
