// server/src/server.ts
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';

import auth from './routes/auth';
import places from './routes/places';
import reviews from './routes/reviews';
import bookings from './routes/bookings';
import payments from './routes/payments';
import analytics from './routes/analytics';
import uploads from './routes/uploads';

import { errorHandler } from './middlewares/error';
// import { setupSwagger } from './swagger'; // uncomment if you created swagger.ts

const app = express();

// --- Security & basics ---
app.use(helmet());

// Allow multiple dev origins (5173/4173). Read from env list if provided.
const allowed = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(s => s.trim());

app.use(
  cors({
    origin(origin, cb) {
      // allow non-browser requests (e.g., curl, swagger-ui in same origin)
      if (!origin) return cb(null, true);
      if (allowed.includes(origin)) return cb(null, true);
      return cb(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: false, // you’re using Authorization header, not cookies
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    optionsSuccessStatus: 200,
  })
);

// Single JSON parser with limit
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

// --- Static files (images) ---
app.use('/uploads', express.static('uploads'));

// --- Routes ---
app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', auth);
app.use('/api/places', places);
app.use('/api/places', reviews); // reviews nested under places
app.use('/api/bookings', bookings);
app.use('/api/payments', payments);
app.use('/api', analytics);
app.use('/api/uploads', uploads);

// Swagger (if you added it)
// setupSwagger(app);

// --- Error handler ---
app.use(errorHandler);

export default app;
