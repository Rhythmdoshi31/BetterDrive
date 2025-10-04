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

// ✅ ONLY basic middleware that doesn't need Redis
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://better-drive-tau.vercel.app',
    'https://betterdrive.rhythmdoshi.site'
  ],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// ✅ Health route (no dependencies)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    redis: redisClient.isOpen ? 'connected' : 'disconnected'
  });
});

// ✅ REMOVE ALL SESSION/PASSPORT/ROUTES FROM HERE
// They will be added inside startServer() after Redis connects

const PORT: number = parseInt(process.env.PORT || '3000');

const startServer = async (): Promise<void> => {
  try {
    // ✅ 1. Connect Redis first
    await initRedis();
    console.log('🚀 Redis Cloud Connected');
    
    // ✅ 2. Setup session AFTER Redis is connected (ONLY HERE)
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

    // ✅ 3. Initialize passport AFTER session (ONLY HERE)
    app.use(passport.initialize());
    app.use(passport.session());

    // ✅ 4. Add routes AFTER everything is set up (ONLY HERE)
    app.use('/auth', authRoutes);
    app.use('/api/google', googleRoutes);
    app.use('/api/waitlist', waitlistRoutes);

    console.log('✅ Session, passport, and routes configured');

    // ✅ 5. Start server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🔥 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    });
    
  } catch (error: unknown) {
    console.error('❌ Failed to start server:', error);
    console.error('Error details:', error);
    process.exit(1);
  }
};

// Error handlers to prevent crashes
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
  redisClient.quit();
  process.exit(0);
});

startServer();
