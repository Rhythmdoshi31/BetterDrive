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
import { initRedis } from './lib/redis';
import waitlistRoutes from './routes/waitlist';

dotenv.config();

const app: Application = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',                    // Local development
    'https://better-drive-tau.vercel.app',      // Your Vercel deployment
    'https://betterdrive.rhythmdoshi.site'      // Your custom domain (if you set it up)
  ],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRoutes);
app.use('/api/google', googleRoutes);
app.use('/api/waitlist', waitlistRoutes);

const PORT: number = parseInt(process.env.PORT || '3000');

// Add this at the END of your app.ts file
const startServer = async (): Promise<void> => {
  try {
    await initRedis();
    console.log('🚀 Redis Cloud Connected');
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🔥 Server running on port ${PORT}`);
    });
  } catch (error: unknown) {
    console.error('❌ Failed to connect to Redis Cloud:', error);
    process.exit(1);
  }
};

// ✅ ADD THESE ERROR HANDLERS
process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Promise Rejection:', reason);
  console.error('Promise:', promise);
  // Don't crash - just log the error
});

process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', error.stack);
  // Don't crash - just log the error
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('📤 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

startServer();

