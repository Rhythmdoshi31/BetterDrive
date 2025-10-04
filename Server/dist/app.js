"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
require("./lib/passport");
const auth_1 = __importDefault(require("./routes/auth"));
const google_1 = __importDefault(require("./routes/google"));
const redis_1 = require("./lib/redis");
const waitlist_1 = __importDefault(require("./routes/waitlist"));
const connect_redis_1 = __importDefault(require("connect-redis"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)({
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
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.urlencoded({ extended: true }));
// Routes without sessions
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        redis: redis_1.redisClient.isOpen ? 'connected' : 'disconnected'
    });
});
app.get('/test', (req, res) => {
    res.json({ message: 'Server is working!' });
});
app.use('/api/waitlist', waitlist_1.default);
const PORT = process.env.PORT ? parseInt(process.env.PORT) : (() => {
    throw new Error('PORT environment variable is not set');
})();
const HOST = '0.0.0.0';
const setupSessionAndAuth = async () => {
    await (0, redis_1.initRedis)();
    console.log('🚀 Redis Cloud Connected');
    app.use((0, express_session_1.default)({
        store: new connect_redis_1.default({
            client: redis_1.redisClient,
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
    app.use(passport_1.default.initialize());
    app.use(passport_1.default.session());
    app.use('/auth', auth_1.default);
    app.use('/api/google', google_1.default);
    console.log('✅ Session, passport, and auth routes configured');
};
const startServer = async () => {
    try {
        await setupSessionAndAuth();
        app.listen(PORT, HOST, () => {
            console.log(`🔥 Server running on http://${HOST}:${PORT}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`✅ Health check: http://${HOST}:${PORT}/health`);
            console.log(`✅ Test endpoint: http://${HOST}:${PORT}/test`);
            console.log(`✅ Waitlist API: http://${HOST}:${PORT}/api/waitlist/count`);
        });
    }
    catch (error) {
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
    if (redis_1.redisClient.isOpen) {
        redis_1.redisClient.quit();
    }
    process.exit(0);
});
process.on('SIGINT', () => {
    console.log('📤 SIGINT received, shutting down gracefully');
    if (redis_1.redisClient.isOpen) {
        redis_1.redisClient.quit();
    }
    process.exit(0);
});
// Global error handler for routes
app.use((err, req, res, next) => {
    console.error('🚨 Route Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});
startServer();
//# sourceMappingURL=app.js.map