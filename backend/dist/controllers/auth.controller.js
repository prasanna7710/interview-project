"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.getMe = getMe;
exports.forgotPassword = forgotPassword;
exports.resetPassword = resetPassword;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
async function register(req, res) {
    try {
        const { fullName, email, password } = req.body;
        if (!fullName || !email || !password) {
            return res.status(400).json({ error: 'Full name, email, and password are required.' });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
        }
        const existingUser = await database_1.prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() },
        });
        if (existingUser) {
            return res.status(400).json({ error: 'An account with this email already exists.' });
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const user = await database_1.prisma.user.create({
            data: {
                fullName,
                email: email.toLowerCase().trim(),
                passwordHash,
                profile: {
                    create: {
                        headline: 'Job Candidate / Developer',
                    },
                },
                settings: {
                    create: {},
                },
            },
            include: {
                profile: true,
            },
        });
        const secret = process.env.JWT_SECRET || 'interview_pro_ai_super_secret_jwt_key_2026';
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, secret, { expiresIn: '7d' });
        return res.status(201).json({
            message: 'Registration successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
            },
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ error: 'Failed to register user.' });
    }
}
async function login(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }
        const user = await database_1.prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() },
            include: { profile: true },
        });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }
        const secret = process.env.JWT_SECRET || 'interview_pro_ai_super_secret_jwt_key_2026';
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, secret, { expiresIn: '7d' });
        return res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                photoUrl: user.profile?.photoUrl,
            },
        });
    }
    catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Failed to login user.' });
    }
}
async function getMe(req, res) {
    try {
        const userId = req.user?.userId;
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                fullName: true,
                email: true,
                createdAt: true,
                profile: true,
                settings: true,
            },
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        return res.json({ user });
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch user context.' });
    }
}
async function forgotPassword(req, res) {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: 'Email is required.' });
    }
    // Simulated token flow
    return res.json({
        message: 'Password reset instructions have been generated. Check console/logs for reset token.',
        resetToken: 'demo-reset-token-' + Date.now(),
    });
}
async function resetPassword(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and new password are required.' });
    }
    const passwordHash = await bcryptjs_1.default.hash(password, 10);
    await database_1.prisma.user.update({
        where: { email: email.toLowerCase().trim() },
        data: { passwordHash },
    });
    return res.json({ message: 'Password updated successfully. Please login.' });
}
