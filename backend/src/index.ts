import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import { errorHandler } from './middleware/errorHandler';

import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/profile.routes';
import resumeRoutes from './routes/resume.routes';
import interviewRoutes from './routes/interview.routes';
import analyticsRoutes from './routes/analytics.routes';
import settingsRoutes from './routes/settings.routes';
import codingRoutes from './routes/coding.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically if needed
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Root & Health check endpoints
app.get('/', (_req, res) => {
  res.json({ 
    message: 'Interview Pro AI Backend API Server is running', 
    status: 'online', 
    healthCheck: '/api/health',
    frontendUrl: 'http://localhost:3000'
  });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString(), name: 'Interview Pro AI API' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/coding', codingRoutes);

// Global error handler
app.use(errorHandler);

// Connect DB on start
connectDB().catch((err) => console.error('DB connection error:', err));

// Start server locally if not running in Vercel serverless environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Interview Pro AI Backend running on http://localhost:${PORT}`);
  });
}

export default app;
