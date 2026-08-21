"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSettings = getSettings;
exports.updateSettings = updateSettings;
const database_1 = require("../config/database");
async function getSettings(req, res) {
    try {
        const userId = req.user?.userId;
        let settings = await database_1.prisma.userSettings.findUnique({
            where: { userId },
        });
        if (!settings) {
            settings = await database_1.prisma.userSettings.create({
                data: { userId: userId },
            });
        }
        return res.json({ settings });
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to retrieve settings' });
    }
}
async function updateSettings(req, res) {
    try {
        const userId = req.user?.userId;
        const { defaultInterviewType, defaultDifficulty, defaultQuestionCount, defaultMode, ttsVoice, ttsSpeed, emailReminders, performanceReports, } = req.body;
        const updated = await database_1.prisma.userSettings.upsert({
            where: { userId: userId },
            update: {
                defaultInterviewType,
                defaultDifficulty,
                defaultQuestionCount: Number(defaultQuestionCount) || 5,
                defaultMode,
                ttsVoice,
                ttsSpeed: Number(ttsSpeed) || 1.0,
                emailReminders: Boolean(emailReminders),
                performanceReports: Boolean(performanceReports),
            },
            create: {
                userId: userId,
                defaultInterviewType,
                defaultDifficulty,
                defaultQuestionCount: Number(defaultQuestionCount) || 5,
                defaultMode,
                ttsVoice,
                ttsSpeed: Number(ttsSpeed) || 1.0,
                emailReminders: Boolean(emailReminders),
                performanceReports: Boolean(performanceReports),
            },
        });
        return res.json({ message: 'Settings updated successfully', settings: updated });
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to update settings' });
    }
}
