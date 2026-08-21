"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnalytics = getAnalytics;
const database_1 = require("../config/database");
async function getAnalytics(req, res) {
    try {
        const userId = req.user?.userId;
        const interviews = await database_1.prisma.interview.findMany({
            where: { userId, status: 'completed' },
            orderBy: { createdAt: 'asc' },
            include: {
                evaluations: true,
            },
        });
        const totalCompleted = interviews.length;
        let avgScore = 0;
        let bestScore = 0;
        let totalPracticeTimeSec = 0;
        if (totalCompleted > 0) {
            const totalScoreSum = interviews.reduce((acc, curr) => acc + curr.overallScore, 0);
            avgScore = Math.round(totalScoreSum / totalCompleted);
            bestScore = Math.round(Math.max(...interviews.map(i => i.overallScore)));
            totalPracticeTimeSec = interviews.reduce((acc, curr) => acc + curr.durationSec, 0);
        }
        // Performance trends over time
        const performanceTrends = interviews.map((inv, idx) => {
            const evals = inv.evaluations;
            let techSum = 0, commSum = 0, qualSum = 0, confSum = 0, relSum = 0;
            if (evals.length > 0) {
                techSum = evals.reduce((a, c) => a + c.technicalScore, 0) / evals.length;
                commSum = evals.reduce((a, c) => a + c.communicationScore, 0) / evals.length;
                qualSum = evals.reduce((a, c) => a + c.qualityScore, 0) / evals.length;
                confSum = evals.reduce((a, c) => a + c.confidenceScore, 0) / evals.length;
                relSum = evals.reduce((a, c) => a + c.relevanceScore, 0) / evals.length;
            }
            return {
                interviewIndex: idx + 1,
                date: inv.createdAt.toISOString().split('T')[0],
                type: inv.type,
                overallScore: Math.round(inv.overallScore),
                technical: Math.round(techSum || inv.overallScore),
                communication: Math.round(commSum || inv.overallScore),
                quality: Math.round(qualSum || inv.overallScore),
                confidence: Math.round(confSum || inv.overallScore),
                relevance: Math.round(relSum || inv.overallScore),
            };
        });
        // Calculate category averages across all evaluations
        const allEvals = interviews.flatMap(i => i.evaluations);
        let categoryAverages = {
            technical: 0,
            communication: 0,
            quality: 0,
            confidence: 0,
            relevance: 0,
        };
        if (allEvals.length > 0) {
            categoryAverages = {
                technical: Math.round(allEvals.reduce((a, c) => a + c.technicalScore, 0) / allEvals.length),
                communication: Math.round(allEvals.reduce((a, c) => a + c.communicationScore, 0) / allEvals.length),
                quality: Math.round(allEvals.reduce((a, c) => a + c.qualityScore, 0) / allEvals.length),
                confidence: Math.round(allEvals.reduce((a, c) => a + c.confidenceScore, 0) / allEvals.length),
                relevance: Math.round(allEvals.reduce((a, c) => a + c.relevanceScore, 0) / allEvals.length),
            };
        }
        // Recommendation logic
        let recommendation = 'Practice explaining your projects using the STAR method (Situation, Task, Action, Result).';
        if (categoryAverages.technical > 0 && categoryAverages.technical < categoryAverages.communication) {
            recommendation = 'Focus on deep-diving into core language concepts, architectural design, and edge cases.';
        }
        else if (categoryAverages.communication > 0 && categoryAverages.communication < 75) {
            recommendation = 'Work on structuring your verbal answers clearly with a opening summary and concluding outcome.';
        }
        return res.json({
            metrics: {
                totalCompleted,
                avgScore,
                bestScore,
                totalPracticeMinutes: Math.round(totalPracticeTimeSec / 60),
            },
            performanceTrends,
            categoryAverages,
            recommendation,
        });
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to retrieve analytics.' });
    }
}
