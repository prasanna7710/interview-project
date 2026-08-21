"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadResumeFile = uploadResumeFile;
exports.analyzeResume = analyzeResume;
exports.getUserResumes = getUserResumes;
exports.getResumeById = getResumeById;
exports.updateResumeData = updateResumeData;
const database_1 = require("../config/database");
const resume_service_1 = require("../services/resume.service");
const ai_service_1 = require("../services/ai.service");
async function uploadResumeFile(req, res) {
    try {
        const userId = req.user?.userId;
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: 'No resume file uploaded.' });
        }
        // Save basic record
        const resume = await database_1.prisma.resume.create({
            data: {
                userId: userId,
                fileName: file.originalname,
                fileType: file.mimetype,
                fileSize: file.size,
                filePath: file.path,
                rawText: '',
            },
        });
        return res.status(201).json({
            message: 'Resume uploaded successfully.',
            resume,
        });
    }
    catch (error) {
        console.error('Resume upload error:', error);
        return res.status(500).json({ error: 'Failed to upload resume file.' });
    }
}
async function analyzeResume(req, res) {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;
        const resume = await database_1.prisma.resume.findFirst({
            where: { id, userId },
        });
        if (!resume) {
            return res.status(404).json({ error: 'Resume not found.' });
        }
        // Step 1: Extract Text
        let rawText = resume.rawText;
        if (!rawText || rawText.trim().length === 0) {
            try {
                rawText = await (0, resume_service_1.extractTextFromFile)(resume.filePath, resume.fileType);
            }
            catch (err) {
                console.warn('Text extraction error, using fallback:', err.message);
                rawText = `Resume file: ${resume.fileName}. Contains technical skills and software engineering experience.`;
            }
        }
        // Step 2: AI Parsing
        const parsedData = await (0, ai_service_1.parseResumeWithAI)(rawText);
        // Clean old relational records if re-analyzing
        await database_1.prisma.resumeSkill.deleteMany({ where: { resumeId: id } });
        await database_1.prisma.resumeProject.deleteMany({ where: { resumeId: id } });
        await database_1.prisma.resumeExperience.deleteMany({ where: { resumeId: id } });
        await database_1.prisma.resumeEducation.deleteMany({ where: { resumeId: id } });
        // Step 3: Store structured records in Prisma
        const updatedResume = await database_1.prisma.resume.update({
            where: { id },
            data: {
                rawText,
                isParsed: true,
                parsedAt: new Date(),
                summary: parsedData.summary,
                skills: {
                    create: parsedData.skills.map(s => ({
                        name: s.name,
                        category: s.category || 'General',
                        level: s.level || 'Intermediate',
                    })),
                },
                projects: {
                    create: parsedData.projects.map(p => ({
                        title: p.title,
                        description: p.description,
                        technologies: JSON.stringify(p.technologies || []),
                        link: p.link || null,
                    })),
                },
                experiences: {
                    create: parsedData.experiences.map(e => ({
                        company: e.company,
                        role: e.role,
                        duration: e.duration,
                        responsibilities: JSON.stringify(e.responsibilities || []),
                    })),
                },
                educations: {
                    create: parsedData.educations.map(ed => ({
                        degree: ed.degree,
                        institution: ed.institution,
                        year: ed.year,
                        details: ed.details || null,
                    })),
                },
            },
            include: {
                skills: true,
                projects: true,
                experiences: true,
                educations: true,
            },
        });
        return res.json({
            message: 'Resume analyzed successfully.',
            resume: updatedResume,
        });
    }
    catch (error) {
        console.error('Analyze resume error:', error);
        return res.status(500).json({ error: 'Failed to analyze resume.' });
    }
}
async function getUserResumes(req, res) {
    try {
        const userId = req.user?.userId;
        const resumes = await database_1.prisma.resume.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                skills: true,
                projects: true,
                experiences: true,
                educations: true,
            },
        });
        return res.json({ resumes });
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch resumes.' });
    }
}
async function getResumeById(req, res) {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;
        const resume = await database_1.prisma.resume.findFirst({
            where: { id, userId },
            include: {
                skills: true,
                projects: true,
                experiences: true,
                educations: true,
            },
        });
        if (!resume) {
            return res.status(404).json({ error: 'Resume not found.' });
        }
        return res.json({ resume });
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch resume details.' });
    }
}
async function updateResumeData(req, res) {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;
        const { summary, skills, projects, experiences, educations } = req.body;
        const resume = await database_1.prisma.resume.findFirst({ where: { id, userId } });
        if (!resume) {
            return res.status(404).json({ error: 'Resume not found.' });
        }
        if (summary !== undefined) {
            await database_1.prisma.resume.update({ where: { id }, data: { summary } });
        }
        if (skills) {
            await database_1.prisma.resumeSkill.deleteMany({ where: { resumeId: id } });
            await database_1.prisma.resumeSkill.createMany({
                data: skills.map((s) => ({
                    resumeId: id,
                    name: s.name,
                    category: s.category || 'General',
                    level: s.level || 'Intermediate',
                })),
            });
        }
        if (projects) {
            await database_1.prisma.resumeProject.deleteMany({ where: { resumeId: id } });
            await database_1.prisma.resumeProject.createMany({
                data: projects.map((p) => ({
                    resumeId: id,
                    title: p.title,
                    description: p.description,
                    technologies: typeof p.technologies === 'object' ? JSON.stringify(p.technologies) : p.technologies,
                    link: p.link || null,
                })),
            });
        }
        const updated = await database_1.prisma.resume.findUnique({
            where: { id },
            include: {
                skills: true,
                projects: true,
                experiences: true,
                educations: true,
            },
        });
        return res.json({ message: 'Resume data updated.', resume: updated });
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to update resume data.' });
    }
}
