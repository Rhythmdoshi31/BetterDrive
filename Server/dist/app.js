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
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173', // React frontend URL
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
app.use('/auth', auth_1.default);
app.use('/api/google', google_1.default);
app.use('/api/waitlist', waitlist_1.default);
const PORT = parseInt(process.env.PORT || '3000');
const startServer = async () => {
    try {
        // Connect to Redis Cloud
        await (0, redis_1.initRedis)();
        console.log('🚀 Redis Cloud Connected');
        app.listen(PORT, () => {
            console.log(`🔥 Server running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('❌ Failed to connect to Redis Cloud:', error);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=app.js.map