import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';

export async function getSettings(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    let settings = await prisma.userSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      settings = await prisma.userSettings.create({
        data: { userId: userId! },
      });
    }

    return res.json({ settings });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve settings' });
  }
}

export async function updateSettings(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    const {
      defaultInterviewType,
      defaultDifficulty,
      defaultQuestionCount,
      defaultMode,
      ttsVoice,
      ttsSpeed,
      emailReminders,
      performanceReports,
    } = req.body;

    const updated = await prisma.userSettings.upsert({
      where: { userId: userId! },
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
        userId: userId!,
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
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update settings' });
  }
}
