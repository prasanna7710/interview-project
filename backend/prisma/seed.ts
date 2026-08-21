import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Interview Pro AI database...');

  const passwordHash = await bcrypt.hash('password123', 10);

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@interviewpro.ai' },
    update: {},
    create: {
      email: 'demo@interviewpro.ai',
      fullName: 'Prasanna',
      passwordHash,
      profile: {
        create: {
          headline: 'Full Stack Software Engineer',
          location: 'San Francisco, CA',
          phone: '+1 (555) 234-5678',
          bio: 'Passionate developer with 3+ years experience building web applications using React, Python, and SQL.',
          skills: JSON.stringify(['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'SQL', 'REST API', 'System Design']),
          linkedinUrl: 'https://linkedin.com/in/demouser',
          githubUrl: 'https://github.com/demouser',
        },
      },
      settings: {
        create: {
          defaultInterviewType: 'Technical',
          defaultDifficulty: 'Medium',
          defaultQuestionCount: 5,
        },
      },
    },
  });

  // Seed sample resume
  const demoResume = await prisma.resume.create({
    data: {
      userId: demoUser.id,
      fileName: 'Prasanna_Resume.pdf',
      fileType: 'application/pdf',
      fileSize: 245000,
      filePath: 'uploads/sample-resume.pdf',
      rawText: 'Full Stack Engineer with experience in Python, React, and Node.js. Built Smart Canteen Recommendation System.',
      isParsed: true,
      parsedAt: new Date(),
      summary: 'Experienced Full Stack Software Engineer specializing in React, Node.js, and Python backend services.',
      skills: {
        create: [
          { name: 'Python', category: 'Backend', level: 'Advanced' },
          { name: 'React', category: 'Frontend', level: 'Advanced' },
          { name: 'Node.js', category: 'Backend', level: 'Intermediate' },
          { name: 'SQL & PostgreSQL', category: 'Database', level: 'Intermediate' },
        ],
      },
      projects: {
        create: [
          {
            title: 'Smart Canteen Recommendation System',
            description: 'Developed an intelligent food recommendation engine using Python and React.',
            technologies: JSON.stringify(['Python', 'React', 'SQL']),
          },
        ],
      },
      experiences: {
        create: [
          {
            company: 'Tech Solutions Inc.',
            role: 'Software Engineer Intern',
            duration: '2023 - 2024',
            responsibilities: JSON.stringify(['Developed API endpoints', 'Built responsive user interfaces']),
          },
        ],
      },
      educations: {
        create: [
          {
            degree: 'B.S. Computer Science',
            institution: 'University of Technology',
            year: '2020 - 2024',
          },
        ],
      },
    },
  });

  // Seed sample interview
  const demoInterview = await prisma.interview.create({
    data: {
      userId: demoUser.id,
      resumeId: demoResume.id,
      title: 'Technical Mock Interview',
      type: 'Technical',
      difficulty: 'Medium',
      totalQuestions: 2,
      mode: 'VoiceText',
      status: 'completed',
      overallScore: 86,
      durationSec: 420,
      completedAt: new Date(),
    },
  });

  const q1 = await prisma.interviewQuestion.create({
    data: {
      interviewId: demoInterview.id,
      orderIndex: 1,
      questionText: 'Explain how you structured the Python backend and database models in your Smart Canteen Recommendation System.',
      category: 'Architecture',
      isFollowUp: false,
    },
  });

  const a1 = await prisma.interviewAnswer.create({
    data: {
      questionId: q1.id,
      answerText: 'We structured the application using a layered modular architecture. The recommendation logic was decoupled into a standalone service module using Python Flask, interacting with PostgreSQL tables for user preferences.',
      inputMethod: 'voice',
      durationSec: 45,
    },
  });

  await prisma.interviewEvaluation.create({
    data: {
      interviewId: demoInterview.id,
      answerId: a1.id,
      technicalScore: 88,
      communicationScore: 85,
      relevanceScore: 90,
      confidenceScore: 86,
      qualityScore: 86,
      overallScore: 87,
      strengths: JSON.stringify(['Clear modular architecture explanation', 'Directly mentioned technology stack']),
      improvements: JSON.stringify(['Mention error handling and database caching']),
      feedback: 'Great response demonstrating solid understanding of backend service design.',
    },
  });

  console.log('✅ Seeding complete successfully!');
  console.log(`Demo User credentials:\n  Email: demo@interviewpro.ai\n  Password: password123`);
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
