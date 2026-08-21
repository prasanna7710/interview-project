"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInterview = createInterview;
exports.getInterviews = getInterviews;
exports.getInterviewById = getInterviewById;
exports.submitAnswer = submitAnswer;
exports.completeInterview = completeInterview;
const database_1 = require("../config/database");
const ai_service_1 = require("../services/ai.service");
async function createInterview(req, res) {
    try {
        const userId = req.user?.userId;
        const { type = 'Technical', difficulty = 'Medium', questionCount = 5, mode = 'VoiceText', resumeId, options = {}, } = req.body;
        // Fetch resume context if provided
        let resumeData = null;
        if (resumeId) {
            resumeData = await database_1.prisma.resume.findFirst({
                where: { id: resumeId, userId },
                include: { skills: true, projects: true, experiences: true, educations: true },
            });
        }
        else {
            // Pick latest resume if available
            resumeData = await database_1.prisma.resume.findFirst({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                include: { skills: true, projects: true, experiences: true, educations: true },
            });
        }
        const title = `${type} Interview (${difficulty})`;
        const interview = await database_1.prisma.interview.create({
            data: {
                userId: userId,
                resumeId: resumeData?.id || null,
                title,
                type,
                difficulty,
                totalQuestions: Number(questionCount),
                mode,
                status: 'in_progress',
                settings: JSON.stringify(options),
            },
        });
        // Generate initial question set
        const generatedQuestions = await (0, ai_service_1.generateInterviewQuestions)(type, difficulty, Number(questionCount), resumeData ? {
            summary: resumeData.summary || '',
            skills: resumeData.skills,
            projects: resumeData.projects.map((p) => ({
                title: p.title,
                description: p.description || '',
                technologies: p.technologies ? JSON.parse(p.technologies) : [],
            })),
            experiences: resumeData.experiences.map((e) => ({
                company: e.company,
                role: e.role,
                duration: e.duration || '',
                responsibilities: e.responsibilities ? JSON.parse(e.responsibilities) : [],
            })),
            educations: resumeData.educations,
        } : null);
        // Save questions to database
        await database_1.prisma.interviewQuestion.createMany({
            data: generatedQuestions.map((q, idx) => ({
                interviewId: interview.id,
                orderIndex: idx + 1,
                questionText: q.questionText,
                category: q.category || type,
                isFollowUp: false,
            })),
        });
        const fullInterview = await database_1.prisma.interview.findUnique({
            where: { id: interview.id },
            include: {
                questions: {
                    orderBy: { orderIndex: 'asc' },
                },
            },
        });
        return res.status(201).json({
            message: 'Interview session created successfully.',
            interview: fullInterview,
        });
    }
    catch (error) {
        console.error('Create interview error:', error);
        return res.status(500).json({ error: 'Failed to create interview session.' });
    }
}
async function getInterviews(req, res) {
    try {
        const userId = req.user?.userId;
        const { type, status } = req.query;
        const where = { userId };
        if (type)
            where.type = String(type);
        if (status)
            where.status = String(status);
        const interviews = await database_1.prisma.interview.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                questions: {
                    include: {
                        answer: {
                            include: { evaluation: true },
                        },
                    },
                },
            },
        });
        return res.json({ interviews });
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch interview history.' });
    }
}
async function getInterviewById(req, res) {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;
        const interview = await database_1.prisma.interview.findFirst({
            where: { id, userId },
            include: {
                resume: true,
                questions: {
                    orderBy: { orderIndex: 'asc' },
                    include: {
                        answer: {
                            include: { evaluation: true },
                        },
                    },
                },
                evaluations: true,
            },
        });
        if (!interview) {
            return res.status(404).json({ error: 'Interview session not found.' });
        }
        return res.json({ interview });
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch interview details.' });
    }
}
async function submitAnswer(req, res) {
    try {
        const userId = req.user?.userId;
        const { id: interviewId } = req.params;
        const { questionId, answerText, inputMethod = 'text', durationSec = 0 } = req.body;
        if (!questionId || !answerText || !answerText.trim()) {
            return res.status(400).json({ error: 'Question ID and answer text are required.' });
        }
        const interview = await database_1.prisma.interview.findFirst({
            where: { id: interviewId, userId },
        });
        if (!interview) {
            return res.status(404).json({ error: 'Interview session not found.' });
        }
        const question = await database_1.prisma.interviewQuestion.findFirst({
            where: { id: questionId, interviewId },
        });
        if (!question) {
            return res.status(404).json({ error: 'Question not found.' });
        }
        // Save answer
        const answer = await database_1.prisma.interviewAnswer.upsert({
            where: { questionId },
            update: {
                answerText: answerText.trim(),
                inputMethod,
                durationSec: Number(durationSec),
            },
            create: {
                questionId,
                answerText: answerText.trim(),
                inputMethod,
                durationSec: Number(durationSec),
            },
        });
        // Evaluate answer with AI
        const evalResult = await (0, ai_service_1.evaluateAnswer)(question.questionText, answerText.trim(), interview.type, interview.difficulty);
        // Save evaluation record
        const evaluation = await database_1.prisma.interviewEvaluation.upsert({
            where: { answerId: answer.id },
            update: {
                interviewId,
                technicalScore: evalResult.technicalScore,
                communicationScore: evalResult.communicationScore,
                relevanceScore: evalResult.relevanceScore,
                confidenceScore: evalResult.confidenceScore,
                qualityScore: evalResult.qualityScore,
                overallScore: evalResult.overallScore,
                strengths: JSON.stringify(evalResult.strengths),
                improvements: JSON.stringify(evalResult.improvements),
                feedback: evalResult.feedback,
            },
            create: {
                interviewId,
                answerId: answer.id,
                technicalScore: evalResult.technicalScore,
                communicationScore: evalResult.communicationScore,
                relevanceScore: evalResult.relevanceScore,
                confidenceScore: evalResult.confidenceScore,
                qualityScore: evalResult.qualityScore,
                overallScore: evalResult.overallScore,
                strengths: JSON.stringify(evalResult.strengths),
                improvements: JSON.stringify(evalResult.improvements),
                feedback: evalResult.feedback,
            },
        });
        // Optional follow-up question check
        let followUpQuestion = null;
        const settings = interview.settings ? JSON.parse(interview.settings) : {};
        const enableFollowUps = settings.enableFollowUp !== false;
        if (enableFollowUps && !question.isFollowUp && Math.random() > 0.4) {
            const followUpText = await (0, ai_service_1.generateFollowUpQuestion)(question.questionText, answerText.trim());
            const newQuestionCount = await database_1.prisma.interviewQuestion.count({ where: { interviewId } });
            followUpQuestion = await database_1.prisma.interviewQuestion.create({
                data: {
                    interviewId,
                    orderIndex: question.orderIndex + 1,
                    questionText: followUpText,
                    category: 'Follow-Up',
                    isFollowUp: true,
                    parentQuestionId: question.id,
                },
            });
        }
        return res.json({
            message: 'Answer submitted and evaluated successfully.',
            answer,
            evaluation: {
                ...evaluation,
                strengths: evalResult.strengths,
                improvements: evalResult.improvements,
            },
            followUpQuestion,
        });
    }
    catch (error) {
        console.error('Submit answer error:', error);
        return res.status(500).json({ error: 'Failed to evaluate answer.' });
    }
}
async function completeInterview(req, res) {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;
        const { totalDurationSec = 0 } = req.body;
        const interview = await database_1.prisma.interview.findFirst({
            where: { id, userId },
            include: {
                evaluations: true,
            },
        });
        if (!interview) {
            return res.status(404).json({ error: 'Interview not found.' });
        }
        // Calculate aggregated overall score
        const evals = interview.evaluations;
        let avgOverallScore = 0;
        if (evals.length > 0) {
            const sum = evals.reduce((acc, curr) => acc + curr.overallScore, 0);
            avgOverallScore = Math.round(sum / evals.length);
        }
        const updated = await database_1.prisma.interview.update({
            where: { id },
            data: {
                status: 'completed',
                completedAt: new Date(),
                overallScore: avgOverallScore,
                durationSec: Number(totalDurationSec) || 300,
            },
            include: {
                questions: {
                    orderBy: { orderIndex: 'asc' },
                    include: {
                        answer: {
                            include: { evaluation: true },
                        },
                    },
                },
                evaluations: true,
            },
        });
        return res.json({
            message: 'Interview marked as completed.',
            interview: updated,
        });
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to complete interview.' });
    }
}
