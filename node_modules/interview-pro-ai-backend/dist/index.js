"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
const errorHandler_1 = require("./middleware/errorHandler");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const profile_routes_1 = __importDefault(require("./routes/profile.routes"));
const resume_routes_1 = __importDefault(require("./routes/resume.routes"));
const interview_routes_1 = __importDefault(require("./routes/interview.routes"));
const analytics_routes_1 = __importDefault(require("./routes/analytics.routes"));
const settings_routes_1 = __importDefault(require("./routes/settings.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middlewares
app.use((0, cors_1.default)({ origin: true, credentials: true }));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Serve uploaded files statically if needed
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Health check endpoint
app.get('/api/health', (_req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString(), name: 'Interview Pro AI API' });
});
// API Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/profile', profile_routes_1.default);
app.use('/api/resumes', resume_routes_1.default);
app.use('/api/interviews', interview_routes_1.default);
app.use('/api/analytics', analytics_routes_1.default);
app.use('/api/settings', settings_routes_1.default);
// Global error handler
app.use(errorHandler_1.errorHandler);
// Start server
async function startServer() {
    await (0, database_1.connectDB)();
    app.listen(PORT, () => {
        console.log(`🚀 Interview Pro AI Backend running on http://localhost:${PORT}`);
    });
}
startServer();
