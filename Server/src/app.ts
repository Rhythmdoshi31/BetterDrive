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

dotenv.config();

const app: Application = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // React frontend URL
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


const PORT: number = parseInt(process.env.PORT || '3000');

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
