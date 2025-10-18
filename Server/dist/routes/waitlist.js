"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const email_1 = require("../lib/email");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Timeout wrapper for async operations
const withTimeout = (promise, timeoutMs) => {
    return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Operation timeout')), timeoutMs)),
    ]);
};
// GET /api/waitlist/count - Get waitlist count
router.get('/count', async (req, res) => {
    try {
        const count = await withTimeout(prisma.waitlist.count(), 5000);
        res.json({ success: true, count });
    }
    catch (error) {
        console.error('Get waitlist count error:', error);
        res.status(500).json({ success: false, message: 'Failed to get count' });
    }
});
// POST /api/waitlist - Join waitlist
router.post('/', async (req, res) => {
    // Set response timeout to 10 seconds
    const timeoutId = setTimeout(() => {
        if (!res.headersSent) {
            res.status(408).json({
                success: false,
                message: 'Request timeout. Please try again.'
            });
        }
    }, 10000);
    try {
        const { name, email } = req.body;
        // Validation
        if (!name || !email) {
            clearTimeout(timeoutId);
            return res.status(400).json({
                success: false,
                message: 'Name and email are required'
            });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            clearTimeout(timeoutId);
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid email address'
            });
        }
        const trimmedEmail = email.toLowerCase().trim();
        const trimmedName = name.trim();
        // Check if email already exists (with timeout)
        const existingUser = await withTimeout(prisma.waitlist.findUnique({
            where: { email: trimmedEmail }
        }), 3000);
        if (existingUser) {
            clearTimeout(timeoutId);
            return res.status(409).json({
                success: false,
                message: 'Email already registered in the VIP List'
            });
        }
        // Add to database (with timeout)
        const waitlistUser = await withTimeout(prisma.waitlist.create({
            data: {
                name: trimmedName,
                email: trimmedEmail,
            }
        }), 3000);
        // Get total count (with timeout)
        const totalCount = await withTimeout(prisma.waitlist.count(), 2000);
        // Send email asynchronously (don't wait for it)
        (0, email_1.sendWelcomeEmail)({
            toEmail: trimmedEmail,
            name: trimmedName,
            message: `Thanks for joining our VIP list! You're #${totalCount} in line for early access to BetterDrive. 🎉`
        })
            .then(() => {
            console.log(`✅ Welcome email sent to ${trimmedEmail} (Position: #${totalCount})`);
        })
            .catch((emailError) => {
            console.error('⚠️ Email failed but signup succeeded:', emailError);
        });
        // Clear timeout and send success response immediately
        clearTimeout(timeoutId);
        res.status(201).json({
            success: true,
            message: 'Successfully joined the waitlist!',
            data: {
                id: waitlistUser.id,
                name: waitlistUser.name,
                email: waitlistUser.email,
                position: totalCount,
                joinedAt: waitlistUser.createdAt
            }
        });
    }
    catch (error) {
        clearTimeout(timeoutId);
        if (res.headersSent) {
            return;
        }
        console.error('Waitlist signup error:', error);
        if (error instanceof Error && error.message === 'Operation timeout') {
            return res.status(408).json({
                success: false,
                message: 'Database is taking too long to respond. Please try again.'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Something went wrong. Please try again later.'
        });
    }
});
exports.default = router;
//# sourceMappingURL=waitlist.js.map