import express, { Application } from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

// Import passport configuration
import './lib/passport';

// Import routes
import authRoutes from './routes/auth';
import googleRoutes from './routes/google';
import { initRedis, redisClient } from './lib/redis';
import waitlistRoutes from './routes/waitlist';
import RedisStore from 'connect-redis';

dotenv.config();

const app: Application = express();

// ✅ Basic middleware (always available)
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

// ✅ Routes that don't need sessions (always available)
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

// ✅ Waitlist routes (no session needed)
app.use('/api/waitlist', waitlistRoutes);

const PORT: number = process.env.PORT
  ? parseInt(process.env.PORT)
  : (() => {
      throw new Error('PORT environment variable is not set');
    })();

const setupSessionAndAuth = async (): Promise<void> => {
  // ✅ Connect Redis first
  await initRedis();
  console.log('🚀 Redis Cloud Connected');
  
  // ✅ Setup session with Redis store
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

  // ✅ Initialize passport after session
  app.use(passport.initialize());
  app.use(passport.session());

  // ✅ Add session-dependent routes
  app.use('/auth', authRoutes);
  app.use('/api/google', googleRoutes);

  console.log('✅ Session, passport, and auth routes configured');
};

const startServer = async (): Promise<void> => {
  try {
    // ✅ Setup session and auth
    await setupSessionAndAuth();
    
    // ✅ Start server after everything is configured
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🔥 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✅ Health check: http://localhost:${PORT}/health`);
      console.log(`✅ Test endpoint: http://localhost:${PORT}/test`);
      console.log(`✅ Waitlist API: http://localhost:${PORT}/api/waitlist/count`);
    });
    
  } catch (error: unknown) {
    console.error('❌ Failed to start server:', error);
    console.error('Error details:', error);
    
    // ✅ Start server anyway with basic functionality
    console.log('⚠️ Starting server with basic functionality only...');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🔥 Server running on port ${PORT} (basic mode)`);
      console.log(`✅ Health check: http://localhost:${PORT}/health`);
      console.log(`✅ Test endpoint: http://localhost:${PORT}/test`);
    });
  }
};

// ✅ Error handlers to prevent crashes
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

startServer();
