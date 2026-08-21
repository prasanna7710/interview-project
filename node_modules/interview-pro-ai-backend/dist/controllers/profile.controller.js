"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = getProfile;
exports.updateProfile = updateProfile;
const database_1 = require("../config/database");
async function getProfile(req, res) {
    try {
        const userId = req.user?.userId;
        const profile = await database_1.prisma.profile.findUnique({
            where: { userId },
            include: {
                user: {
                    select: {
                        fullName: true,
                        email: true,
                    },
                },
            },
        });
        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }
        return res.json({ profile });
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to retrieve profile' });
    }
}
async function updateProfile(req, res) {
    try {
        const userId = req.user?.userId;
        const { fullName, phone, location, headline, bio, photoUrl, linkedinUrl, githubUrl, portfolioUrl, skills, education, experience, } = req.body;
        if (fullName) {
            await database_1.prisma.user.update({
                where: { id: userId },
                data: { fullName },
            });
        }
        const updatedProfile = await database_1.prisma.profile.upsert({
            where: { userId: userId },
            update: {
                phone,
                location,
                headline,
                bio,
                photoUrl,
                linkedinUrl,
                githubUrl,
                portfolioUrl,
                skills: typeof skills === 'object' ? JSON.stringify(skills) : skills,
                education: typeof education === 'object' ? JSON.stringify(education) : education,
                experience: typeof experience === 'object' ? JSON.stringify(experience) : experience,
            },
            create: {
                userId: userId,
                phone,
                location,
                headline,
                bio,
                photoUrl,
                linkedinUrl,
                githubUrl,
                portfolioUrl,
                skills: typeof skills === 'object' ? JSON.stringify(skills) : skills,
                education: typeof education === 'object' ? JSON.stringify(education) : education,
                experience: typeof experience === 'object' ? JSON.stringify(experience) : experience,
            },
            include: {
                user: {
                    select: {
                        fullName: true,
                        email: true,
                    },
                },
            },
        });
        return res.json({ message: 'Profile updated successfully', profile: updatedProfile });
    }
    catch (error) {
        console.error('Update profile error:', error);
        return res.status(500).json({ error: 'Failed to update profile' });
    }
}
