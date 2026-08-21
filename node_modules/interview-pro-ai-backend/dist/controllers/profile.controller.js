"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = getProfile;
exports.updateProfile = updateProfile;
exports.uploadAvatarImage = uploadAvatarImage;
exports.deleteAvatarImage = deleteAvatarImage;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
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
                ...(photoUrl !== undefined ? { photoUrl } : {}),
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
async function uploadAvatarImage(req, res) {
    try {
        const userId = req.user?.userId;
        const file = req.file;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized user.' });
        }
        if (!file) {
            return res.status(400).json({ error: 'No image file uploaded.' });
        }
        // Construct photo URL path
        const photoUrl = `http://localhost:5000/uploads/profiles/${file.filename}`;
        console.log(`[PROFILE AVATAR UPLOAD] userId=${userId} | filename=${file.filename} | photoUrl=${photoUrl}`);
        // Update Profile record for authenticated user
        const updatedProfile = await database_1.prisma.profile.upsert({
            where: { userId },
            update: { photoUrl },
            create: {
                userId,
                photoUrl,
                headline: 'Job Candidate / Developer',
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
        return res.json({
            message: 'Profile picture uploaded successfully.',
            photoUrl,
            profile: updatedProfile,
        });
    }
    catch (error) {
        console.error('Profile avatar upload error:', error);
        return res.status(500).json({ error: 'Failed to upload profile picture.' });
    }
}
async function deleteAvatarImage(req, res) {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized user.' });
        }
        const profile = await database_1.prisma.profile.findUnique({
            where: { userId },
        });
        if (profile?.photoUrl) {
            // Remove old image file from disk if local
            try {
                const urlParts = profile.photoUrl.split('/uploads/profiles/');
                if (urlParts.length > 1) {
                    const filename = urlParts[1];
                    const localPath = path_1.default.join(__dirname, '../../uploads/profiles', filename);
                    if (fs_1.default.existsSync(localPath)) {
                        fs_1.default.unlinkSync(localPath);
                        console.log(`[PROFILE AVATAR DELETE] Deleted disk file: ${localPath}`);
                    }
                }
            }
            catch (e) {
                console.warn('[PROFILE AVATAR DELETE WARNING] Could not remove old file:', e.message);
            }
        }
        const updatedProfile = await database_1.prisma.profile.update({
            where: { userId },
            data: { photoUrl: null },
            include: {
                user: {
                    select: {
                        fullName: true,
                        email: true,
                    },
                },
            },
        });
        console.log(`[PROFILE AVATAR REMOVED] userId=${userId}`);
        return res.json({
            message: 'Profile picture removed successfully.',
            photoUrl: null,
            profile: updatedProfile,
        });
    }
    catch (error) {
        console.error('Delete avatar error:', error);
        return res.status(500).json({ error: 'Failed to remove profile picture.' });
    }
}
