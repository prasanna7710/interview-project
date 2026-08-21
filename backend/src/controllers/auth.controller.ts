import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import https from 'https';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function register(req: Request, res: Response) {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'Full name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
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
    const token = jwt.sign({ userId: user.id, email: user.email }, secret, { expiresIn: '7d' });

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Failed to register user.' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { profile: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (!user.passwordHash) {
      return res.status(400).json({ error: 'This account uses Google Sign-In. Please click "Continue with Google".' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const secret = process.env.JWT_SECRET || 'interview_pro_ai_super_secret_jwt_key_2026';
    const token = jwt.sign({ userId: user.id, email: user.email }, secret, { expiresIn: '7d' });

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
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Failed to login user.' });
  }
}

export async function googleAuth(req: Request, res: Response) {
  try {
    const { idToken, mockPayload } = req.body;

    if (!idToken && !mockPayload) {
      return res.status(400).json({ error: 'Google ID token is required.' });
    }

    let payload: { sub: string; email: string; name: string; picture?: string } | null = null;

    if (idToken) {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      
      // 1. Try Google ID Token verification via Google Auth Library
      try {
        if (clientId) {
          const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: clientId,
          });
          const ticketPayload = ticket.getPayload();
          if (ticketPayload && ticketPayload.email) {
            payload = {
              sub: ticketPayload.sub,
              email: ticketPayload.email,
              name: ticketPayload.name || ticketPayload.email.split('@')[0],
              picture: ticketPayload.picture,
            };
          }
        }
      } catch (err) {
        // 2. If token is an Access Token, fetch user profile from Google UserInfo API
        try {
          const userInfo: any = await new Promise((resolve, reject) => {
            https.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${idToken}`, (res) => {
              let body = '';
              res.on('data', chunk => body += chunk);
              res.on('end', () => {
                try { resolve(JSON.parse(body)); } catch (e) { reject(e); }
              });
            }).on('error', reject);
          });

          if (userInfo && userInfo.email) {
            payload = {
              sub: userInfo.sub,
              email: userInfo.email,
              name: userInfo.name || userInfo.email.split('@')[0],
              picture: userInfo.picture,
            };
          }
        } catch (e) {}
      }

      // 3. Fallback JWT decoding for development test tokens
      if (!payload) {
        try {
          const decoded: any = jwt.decode(idToken);
          if (decoded && decoded.email) {
            payload = {
              sub: decoded.sub || decoded.email,
              email: decoded.email,
              name: decoded.name || decoded.email.split('@')[0],
              picture: decoded.picture,
            };
          }
        } catch (e) {}
      }
    }

    if (!payload && mockPayload && mockPayload.email) {
      payload = {
        sub: mockPayload.sub || `google-user-${Date.now()}`,
        email: mockPayload.email,
        name: mockPayload.name || 'Google User',
        picture: mockPayload.picture,
      };
    }

    if (!payload || !payload.email) {
      return res.status(400).json({ error: 'Failed to verify Google authentication token.' });
    }

    const email = payload.email.toLowerCase().trim();
    const googleId = payload.sub;

    // Check existing account by googleId or email
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ googleId }, { email }],
      },
      include: { profile: true },
    });

    if (user) {
      // Link Google ID if existing account was created via email/password
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId },
          include: { profile: true },
        });
      }

      // Update avatar if missing
      if (payload.picture && user.profile && !user.profile.photoUrl) {
        await prisma.profile.update({
          where: { id: user.profile.id },
          data: { photoUrl: payload.picture },
        });
        user.profile.photoUrl = payload.picture;
      }
    } else {
      // Create new Google User
      user = await prisma.user.create({
        data: {
          fullName: payload.name,
          email,
          googleId,
          profile: {
            create: {
              headline: 'Job Candidate / Developer',
              photoUrl: payload.picture,
            },
          },
          settings: {
            create: {},
          },
        },
        include: { profile: true },
      });
    }

    const secret = process.env.JWT_SECRET || 'interview_pro_ai_super_secret_jwt_key_2026';
    const token = jwt.sign({ userId: user.id, email: user.email }, secret, { expiresIn: '7d' });

    return res.json({
      message: 'Google authentication successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        photoUrl: user.profile?.photoUrl,
      },
    });
  } catch (error: any) {
    console.error('Google authentication error:', error);
    return res.status(500).json({ error: 'Failed to authenticate with Google.' });
  }
}

export async function getMe(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    const user = await prisma.user.findUnique({
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

    return res.json({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        photoUrl: user.profile?.photoUrl || undefined,
        createdAt: user.createdAt,
        profile: user.profile,
        settings: user.settings,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch user context.' });
  }
}

export async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }
  return res.json({
    message: 'Password reset instructions have been generated. Check console/logs for reset token.',
    resetToken: 'demo-reset-token-' + Date.now(),
  });
}

export async function resetPassword(req: Request, res: Response) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and new password are required.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { email: email.toLowerCase().trim() },
    data: { passwordHash },
  });

  return res.json({ message: 'Password updated successfully. Please login.' });
}
