export interface User {
  id: string;
  email: string;
  fullName: string;
  photoUrl?: string;
  createdAt?: string;
}

export interface Profile {
  id: string;
  userId: string;
  phone?: string;
  location?: string;
  headline?: string;
  bio?: string;
  photoUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  skills?: string;
  education?: string;
  experience?: string;
  user?: {
    fullName: string;
    email: string;
  };
}

export interface ResumeSkill {
  id?: string;
  name: string;
  category?: string;
  level?: string;
}

export interface ResumeProject {
  id?: string;
  title: string;
  description: string;
  technologies: string[] | string;
  link?: string;
}

export interface ResumeExperience {
  id?: string;
  company: string;
  role: string;
  duration?: string;
  responsibilities?: string[] | string;
}

export interface ResumeEducation {
  id?: string;
  degree: string;
  institution: string;
  year?: string;
  details?: string;
}

export interface Resume {
  id: string;
  userId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  rawText?: string;
  isParsed: boolean;
  parsedAt?: string;
  candidateName?: string;
  email?: string;
  phone?: string;
  summary?: string;
  createdAt: string;
  skills?: ResumeSkill[];
  projects?: ResumeProject[];
  experiences?: ResumeExperience[];
  educations?: ResumeEducation[];
}

export interface InterviewQuestion {
  id: string;
  interviewId: string;
  orderIndex: number;
  questionText: string;
  category?: string;
  isFollowUp: boolean;
  parentQuestionId?: string;
  answer?: InterviewAnswer;
}

export interface InterviewAnswer {
  id: string;
  questionId: string;
  answerText: string;
  inputMethod: 'text' | 'voice';
  durationSec: number;
  createdAt: string;
  evaluation?: InterviewEvaluation;
}

export interface InterviewEvaluation {
  id: string;
  interviewId: string;
  answerId?: string;
  technicalScore: number;
  communicationScore: number;
  relevanceScore: number;
  confidenceScore: number;
  qualityScore: number;
  overallScore: number;
  strengths: string[] | string;
  improvements: string[] | string;
  feedback: string;
}

export interface Interview {
  id: string;
  userId: string;
  resumeId?: string;
  title: string;
  type: 'Technical' | 'HR' | 'Behavioral' | 'Project' | 'Mixed';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  totalQuestions: number;
  mode: 'Text' | 'Voice' | 'VoiceText';
  status: 'pending' | 'in_progress' | 'completed';
  overallScore: number;
  durationSec: number;
  createdAt: string;
  completedAt?: string;
  questions?: InterviewQuestion[];
  evaluations?: InterviewEvaluation[];
  settings?: string;
}

export interface AnalyticsData {
  metrics: {
    totalCompleted: number;
    avgScore: number;
    bestScore: number;
    totalPracticeMinutes: number;
  };
  performanceTrends: Array<{
    interviewIndex: number;
    date: string;
    type: string;
    overallScore: number;
    technical: number;
    communication: number;
    quality: number;
    confidence: number;
    relevance: number;
  }>;
  categoryAverages: {
    technical: number;
    communication: number;
    quality: number;
    confidence: number;
    relevance: number;
  };
  recommendation: string;
}

export interface UserSettings {
  id?: string;
  defaultInterviewType: string;
  defaultDifficulty: string;
  defaultQuestionCount: number;
  defaultMode: string;
  ttsVoice: string;
  ttsSpeed: number;
  emailReminders: boolean;
  performanceReports: boolean;
}
