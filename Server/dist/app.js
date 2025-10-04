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
// Import passport configuration
require("./lib/passport");
// Import routes
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
        'http://localhost:3000', // Local development
        'https://better-drive-tau.vercel.app', // Your Vercel deployment
        'https://betterdrive.rhythmdoshi.site' // Your custom domain (if you set it up)
    ],
    credentials: true
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.urlencoded({ extended: true }));
// Session configuration
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000
    }
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        redis: redis_1.redisClient.isOpen ? 'connected' : 'disconnected'
    });
});
app.use('/auth', auth_1.default);
app.use('/api/google', google_1.default);
app.use('/api/waitlist', waitlist_1.default);
const PORT = parseInt(process.env.PORT || '3000');
const startServer = async () => {
    try {
        // ✅ 1. Connect Redis first
        await (0, redis_1.initRedis)();
        console.log('🚀 Redis Cloud Connected');
        // ✅ 2. Setup session AFTER Redis is connected
        app.use((0, express_session_1.default)({
            store: new connect_redis_1.default({
                client: redis_1.redisClient,
                prefix: 'betterdrive:sess:',
                ttl: 24 * 60 * 60 // 24 hours in seconds
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
        // ✅ 3. Initialize passport AFTER session
        app.use(passport_1.default.initialize());
        app.use(passport_1.default.session());
        // ✅ 4. Add routes AFTER everything is set up
        app.use('/auth', auth_1.default);
        app.use('/api/google', google_1.default);
        app.use('/api/waitlist', waitlist_1.default);
        // ✅ 5. Start server
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🔥 Server running on port ${PORT}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
        });
    }
    catch (error) {
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
    redis_1.redisClient.quit();
    process.exit(0);
});
startServer();
//# sourceMappingURL=app.js.map