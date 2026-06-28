import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import env from './config/env.js';
import { llmEnabled } from './services/llm/groqClient.js';
import authRoutes from './routes/authRoutes.js';
import tripRoutes from './routes/tripRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(express.json({ limit: '1mb' }));

// CORS — only the configured frontend origin(s) may call the API.
app.use(
  cors({
    origin(origin, cb) {
      // Allow same-origin / curl (no origin) and any whitelisted client origin.
      if (!origin || env.clientOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  })
);

if (!env.isProduction) app.use(morgan('dev'));

// Basic abuse protection on auth + AI generation endpoints.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', llm: llmEnabled ? 'groq' : 'mock', time: new Date().toISOString() })
);

app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/public', publicRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
