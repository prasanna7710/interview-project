"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, _req, res, _next) => {
    console.error('Server error:', err);
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({ error: 'Invalid token or unauthorized access' });
    }
    if (err.message && err.message.includes('Only PDF and DOCX')) {
        return res.status(400).json({ error: err.message });
    }
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
    return res.status(statusCode).json({
        error: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
    });
};
exports.errorHandler = errorHandler;
