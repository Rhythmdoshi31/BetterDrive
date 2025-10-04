import express, { Application } from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import './lib/passport';
import authRoutes from './routes/auth';
import googleRoutes from './routes/google';
import { initRedis, redisClient } from './lib/redis';
import waitlistRoutes from './routes/waitlist';
import RedisStore from 'connect-redis';

dotenv.config();

const app: Application = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://better-drive-tau.vercel.app',
    'https://betterdrive.rhythmdoshi.site'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Routes without sessions
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    redis: redisClient.isOpen ? 'connected' : 'disconnected'
  });
});

app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

app.use('/api/waitlist', waitlistRoutes);

const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : (() => {
  throw new Error('PORT environment variable is not set');
})();
const HOST: string = '0.0.0.0';

const setupSessionAndAuth = async (): Promise<void> => {
  await initRedis();
  console.log('🚀 Redis Cloud Connected');
  
  app.use(session({
    store: new RedisStore({ 
      client: redisClient,
      prefix: 'betterdrive:sess:',
      ttl: 24 * 60 * 60
    }),
    secret: process.env.SESSION_SECRET || 'fallback-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true
    }
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  app.use('/auth', authRoutes);
  app.use('/api/google', googleRoutes);

  console.log('✅ Session, passport, and auth routes configured');
};

const startServer = async (): Promise<void> => {
  try {
    await setupSessionAndAuth();
    
    app.listen(PORT, HOST, () => {
      console.log(`🔥 Server running on http://${HOST}:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✅ Health check: http://${HOST}:${PORT}/health`);
      console.log(`✅ Test endpoint: http://${HOST}:${PORT}/test`);
      console.log(`✅ Waitlist API: http://${HOST}:${PORT}/api/waitlist/count`);
    });
    
  } catch (error: unknown) {
    console.error('❌ Failed to start server:', error);
    console.error('Error details:', error);
    
    console.log('⚠️ Starting server with basic functionality only...');
    app.listen(PORT, HOST, () => {
      console.log(`🔥 Server running on http://${HOST}:${PORT} (basic mode)`);
      console.log(`✅ Health check: http://${HOST}:${PORT}/health`);
      console.log(`✅ Test endpoint: http://${HOST}:${PORT}/test`);
    });
  }
};

// Error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection at:', promise);
  console.error('🚨 Reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', error);
  console.error('🚨 Stack:', error.stack);
});

process.on('SIGTERM', () => {
  console.log('📤 SIGTERM received, shutting down gracefully');
  if (redisClient.isOpen) {
    redisClient.quit();
  }
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('📤 SIGINT received, shutting down gracefully');
  if (redisClient.isOpen) {
    redisClient.quit();
  }
  process.exit(0);
});

// Global error handler for routes
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('🚨 Route Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

startServer();