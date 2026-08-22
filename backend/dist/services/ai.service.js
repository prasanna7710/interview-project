"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseResumeWithAI = parseResumeWithAI;
exports.generateInterviewQuestions = generateInterviewQuestions;
exports.generateFollowUpQuestion = generateFollowUpQuestion;
exports.evaluateAnswer = evaluateAnswer;
const generative_ai_1 = require("@google/generative-ai");
let genAIInstance = null;
let lastApiKey = undefined;
function getGeminiClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim().length < 10) {
        return null;
    }
    if (!genAIInstance || lastApiKey !== apiKey) {
        genAIInstance = new generative_ai_1.GoogleGenerativeAI(apiKey.trim());
        lastApiKey = apiKey;
    }
    return genAIInstance;
}
/**
 * Executes a prompt against Google Gemini API (gemini-1.5-flash) with structured JSON enforcement.
 * Falls back to intelligent local parser if GEMINI_API_KEY is not configured or in case of API failure.
 */
async function callLLM(prompt, systemPrompt) {
    const client = getGeminiClient();
    if (client) {
        try {
            const model = client.getGenerativeModel({
                model: 'gemini-1.5-flash',
                generationConfig: {
                    responseMimeType: 'application/json',
                    temperature: 0.2,
                },
                systemInstruction: systemPrompt,
            });
            const response = await model.generateContent(prompt);
            const text = response.response.text();
            if (text && text.trim().length > 0) {
                return text.trim();
            }
        }
        catch (err) {
            console.warn('[AI] Google Gemini API request failed, using intelligent local engine:', err?.message || err);
        }
    }
    return ''; // Trigger intelligent local non-mock extraction engine
}
async function parseResumeWithAI(rawText, resumeId, filename) {
    console.log(`[AI RESUME INPUT]\nresumeId: ${resumeId || 'N/A'}\nfilename: ${filename || 'N/A'}\ntext length: ${rawText.length}\nfirst 200 characters: ${JSON.stringify(rawText.slice(0, 200))}`);
    const systemPrompt = `You are a resume analysis system.
Analyze ONLY the resume text supplied in the request.
Do not use sample resumes.
Do not use information from previous users.
Do not invent skills.
Do not invent projects.
Do not invent education.
Do not invent companies.
Do not invent experience.
If information is not present in the resume, return an empty value.

Output MUST be a valid JSON object with keys:
- "name": string or null
- "email": string or null
- "phone": string or null
- "summary": string
- "skills": array of { "name": string, "category": string, "level": string }
- "education": array of { "degree": string, "institution": string, "year": string, "details": string }
- "experience": array of { "company": string, "role": string, "duration": string, "responsibilities": array of string }
- "projects": array of { "title": string, "description": string, "technologies": array of string, "link": string }
- "certifications": array of string
- "languages": array of string
- "technologies": array of string`;
    const rawJson = await callLLM(rawText, systemPrompt);
    let result;
    if (rawJson) {
        try {
            const parsed = JSON.parse(rawJson);
            result = {
                candidateName: parsed.name || parsed.candidateName || undefined,
                email: parsed.email || undefined,
                phone: parsed.phone || undefined,
                summary: parsed.summary || rawText.slice(0, 300),
                skills: Array.isArray(parsed.skills) ? parsed.skills : [],
                projects: Array.isArray(parsed.projects) ? parsed.projects : [],
                experiences: Array.isArray(parsed.experience) ? parsed.experience : (Array.isArray(parsed.experiences) ? parsed.experiences : []),
                educations: Array.isArray(parsed.education) ? parsed.education : (Array.isArray(parsed.educations) ? parsed.educations : []),
            };
        }
        catch (e) {
            console.error('[AI] Failed to parse Gemini JSON output for resume analysis, falling back to local extraction.');
            result = smartResumeFallback(rawText);
        }
    }
    else {
        result = smartResumeFallback(rawText);
    }
    return result;
}
/**
 * Zero-mock local resume extraction engine.
 * Parses the ACTUAL content of the resume using regex, NLP section segmentation, and keyword matching.
 * Never outputs hardcoded fake names, companies, projects, or educations.
 */
function smartResumeFallback(rawText) {
    const text = rawText || '';
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    // 1. Extract Candidate Contact Info
    let candidateName = undefined;
    let email = undefined;
    let phone = undefined;
    // Email regex
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i);
    if (emailMatch)
        email = emailMatch[0];
    // Phone regex
    const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    if (phoneMatch)
        phone = phoneMatch[0];
    // Candidate Name extraction heuristic
    const nameLineMatch = text.match(/(?:Name|Candidate Name|Full Name):\s*([^\n\r,]+)/i);
    if (nameLineMatch && nameLineMatch[1].trim().length > 1) {
        candidateName = nameLineMatch[1].trim();
    }
    else {
        // Look at first 5 non-empty lines for a line that looks like a person's name
        for (let i = 0; i < Math.min(lines.length, 5); i++) {
            const line = lines[i];
            if (!line.includes('@') &&
                !line.includes('|') &&
                !line.match(/resume|curriculum|cv|contact|email|phone|profile|developer|engineer|intern/i) &&
                line.length >= 2 &&
                line.length <= 40 &&
                /^[A-Za-z\s.'-]+$/.test(line)) {
                candidateName = line;
                break;
            }
        }
    }
    if (!candidateName && email) {
        const handle = email.split('@')[0].replace(/[0-9._%+-]/g, ' ').trim();
        if (handle.length > 2) {
            candidateName = handle.charAt(0).toUpperCase() + handle.slice(1);
        }
    }
    // 2. Extract Skills from actual text
    const techDictionary = [
        'JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust',
        'Ruby', 'PHP', 'HTML', 'CSS', 'Tailwind', 'Bootstrap', 'Sass', 'SQL', 'PostgreSQL', 'MySQL', 'SQLite',
        'MongoDB', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'Git', 'GitHub', 'REST API', 'GraphQL',
        'gRPC', 'Microservices', 'Django', 'Flask', 'FastAPI', 'Spring Boot', 'Next.js', 'Vite', 'Vue', 'Angular',
        'Machine Learning', 'Deep Learning', 'PyTorch', 'TensorFlow', 'Pandas', 'NumPy', 'Scikit-learn', 'OpenCV',
        'NLP', 'Linux', 'Bash', 'CI/CD', 'Agile', 'Scrum', 'System Design', 'Communication', 'Problem Solving',
        'Leadership', 'Teamwork', 'Unit Testing', 'Jest', 'Cypress', 'Playwright', 'RTOS', 'Embedded Systems'
    ];
    const matchedSkillsSet = new Set();
    techDictionary.forEach(skill => {
        const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(?:^|[^a-zA-Z0-9_])${escaped}(?:$|[^a-zA-Z0-9_])`, 'i');
        if (regex.test(text)) {
            matchedSkillsSet.add(skill);
        }
    });
    // Check explicit "Skills:" line in text
    const skillsHeaderIdx = lines.findIndex(l => /^(skills|technical skills|technologies|core competencies):?/i.test(l));
    if (skillsHeaderIdx !== -1 && lines[skillsHeaderIdx + 1]) {
        const lineContent = lines[skillsHeaderIdx].includes(':')
            ? lines[skillsHeaderIdx].split(':')[1]
            : lines[skillsHeaderIdx + 1];
        if (lineContent) {
            lineContent.split(/[,|•;]/).forEach(s => {
                const cleaned = s.trim();
                if (cleaned.length > 1 && cleaned.length < 30) {
                    matchedSkillsSet.add(cleaned);
                }
            });
        }
    }
    const skillsList = Array.from(matchedSkillsSet).map(s => ({
        name: s,
        category: 'Technical',
        level: 'Intermediate',
    }));
    // 3. Segment Sections (Projects, Experiences, Educations)
    const sections = {
        projects: [],
        experience: [],
        education: [],
        summary: [],
    };
    let currentSection = 'summary';
    lines.forEach(line => {
        const lower = line.toLowerCase();
        if (/^(projects|personal projects|key projects|academic projects)/i.test(lower)) {
            currentSection = 'projects';
        }
        else if (/^(experience|work experience|employment|professional experience|work history)/i.test(lower)) {
            currentSection = 'experience';
        }
        else if (/^(education|academic background|qualifications)/i.test(lower)) {
            currentSection = 'education';
        }
        else if (/^(summary|profile|about me|objective)/i.test(lower)) {
            currentSection = 'summary';
        }
        else {
            sections[currentSection].push(line);
        }
    });
    // 4. Extract Projects from actual section lines
    const projectsList = [];
    if (sections.projects.length > 0) {
        let currentTitle = '';
        let currentDesc = [];
        sections.projects.forEach(pLine => {
            if (pLine.startsWith('•') || pLine.startsWith('-') || pLine.startsWith('*')) {
                currentDesc.push(pLine.replace(/^[•\-\*]\s*/, ''));
            }
            else if (pLine.includes(':')) {
                if (currentTitle) {
                    projectsList.push({
                        title: currentTitle,
                        description: currentDesc.join(' ') || currentTitle,
                        technologies: skillsList.slice(0, 3).map(s => s.name),
                    });
                    currentDesc = [];
                }
                const parts = pLine.split(':');
                currentTitle = parts[0].trim();
                if (parts[1])
                    currentDesc.push(parts[1].trim());
            }
            else {
                if (!currentTitle) {
                    currentTitle = pLine;
                }
                else {
                    currentDesc.push(pLine);
                }
            }
        });
        if (currentTitle) {
            projectsList.push({
                title: currentTitle,
                description: currentDesc.join(' ') || currentTitle,
                technologies: skillsList.slice(0, 3).map(s => s.name),
            });
        }
    }
    // 5. Extract Experiences from actual section lines
    const experiencesList = [];
    if (sections.experience.length > 0) {
        let currentRole = '';
        let currentCompany = '';
        let currentDuration = '';
        let bullets = [];
        sections.experience.forEach(eLine => {
            if (eLine.startsWith('•') || eLine.startsWith('-') || eLine.startsWith('*')) {
                bullets.push(eLine.replace(/^[•\-\*]\s*/, ''));
            }
            else {
                if (currentRole || currentCompany) {
                    experiencesList.push({
                        company: currentCompany || 'Company / Organization',
                        role: currentRole || 'Position',
                        duration: currentDuration || '',
                        responsibilities: bullets.length > 0 ? bullets : [currentRole],
                    });
                    bullets = [];
                }
                const parts = eLine.split(/[-–|]/);
                currentRole = parts[0]?.trim() || eLine;
                currentCompany = parts[1]?.trim() || '';
                currentDuration = parts[2]?.trim() || '';
            }
        });
        if (currentRole || currentCompany) {
            experiencesList.push({
                company: currentCompany || 'Company / Organization',
                role: currentRole || 'Position',
                duration: currentDuration || '',
                responsibilities: bullets.length > 0 ? bullets : [currentRole],
            });
        }
    }
    // 6. Extract Educations from actual section lines
    const educationsList = [];
    if (sections.education.length > 0) {
        sections.education.forEach(edLine => {
            if (edLine.length > 3) {
                const parts = edLine.split(/[-–|]/);
                educationsList.push({
                    degree: parts[0]?.trim() || edLine,
                    institution: parts[1]?.trim() || 'Institution',
                    year: parts[2]?.trim() || '',
                });
            }
        });
    }
    // 7. Executive Summary from actual text
    const summaryText = sections.summary.slice(0, 4).join(' ') || text.slice(0, 300) || 'Candidate resume parsed successfully.';
    return {
        candidateName,
        email,
        phone,
        summary: summaryText,
        skills: skillsList,
        projects: projectsList,
        experiences: experiencesList,
        educations: educationsList,
    };
}
async function generateInterviewQuestions(type, difficulty, count, resumeData) {
    const candidateName = resumeData?.candidateName || 'Candidate';
    const skillsStr = resumeData?.skills?.map(s => s.name).join(', ') || 'Software Development';
    const projectsStr = resumeData?.projects?.map(p => `${p.title}: ${p.description}`).join(' | ') || 'Projects listed on resume';
    const systemPrompt = `You are a top-tier tech interviewer conducting a ${type} interview at ${difficulty} level for candidate ${candidateName}.
Generate exactly ${count} realistic, professional interview questions based strictly on the candidate's resume content.
Candidate Skills: ${skillsStr}
Candidate Projects: ${projectsStr}

Output MUST be a JSON object with key "questions" containing an array of objects with keys: "questionText", "category", "hints".`;
    const rawJson = await callLLM(`Generate ${count} ${difficulty} level ${type} questions.`, systemPrompt);
    if (rawJson) {
        try {
            const parsed = JSON.parse(rawJson);
            if (Array.isArray(parsed.questions) && parsed.questions.length > 0) {
                return parsed.questions;
            }
        }
        catch (e) {
            console.error('[AI] Failed to parse question generation JSON output from Gemini');
        }
    }
    return generateSmartQuestionsFallback(type, difficulty, count, resumeData);
}
function generateSmartQuestionsFallback(type, difficulty, count, resumeData) {
    const candidateName = resumeData?.candidateName ? `${resumeData.candidateName}` : 'your background';
    const skills = resumeData?.skills?.map(s => s.name) || [];
    const projects = resumeData?.projects || [];
    const primarySkill = skills[0] || 'software development';
    const secondarySkill = skills[1] || skills[0] || 'problem solving';
    const projectTitle = projects[0]?.title || (skills[0] ? `${skills[0]} implementation` : 'your technical project');
    const questions = [];
    if (type === 'Technical') {
        if (skills.length > 0) {
            questions.push({
                questionText: `Based on your resume experience with ${primarySkill}, explain how you structure core concepts of ${primarySkill} in scalable applications.`,
                category: 'Technical Core',
                hints: `Discuss architecture, best practices, and performance when using ${primarySkill}.`,
            });
        }
        if (projects.length > 0) {
            questions.push({
                questionText: `Walk me through your project "${projectTitle}". What technical architectural decisions did you make, and how did you handle data persistence or state management?`,
                category: 'Project Architecture',
                hints: 'Cover backend/frontend trade-offs, API design, and error handling.',
            });
        }
        else {
            questions.push({
                questionText: `How do you optimize performance and manage application state when building solutions using ${secondarySkill}?`,
                category: 'Performance & State',
                hints: 'Mention caching, data structures, and memory efficiency.',
            });
        }
        if (skills.length > 1) {
            questions.push({
                questionText: `Compare your experience working with ${primarySkill} versus ${secondarySkill}. In what scenarios would you choose one over the other?`,
                category: 'Tool & Tech Evaluation',
                hints: 'Focus on trade-offs, ecosystem, speed of development, and system suitability.',
            });
        }
        questions.push({
            questionText: `Describe a complex technical bug or production edge case you encountered while working with ${primarySkill} and how you diagnosed it.`,
            category: 'Debugging & Diagnostics',
            hints: 'Use the STAR method (Situation, Task, Action, Result).',
        });
        questions.push({
            questionText: `What security practices, authentication protocols, or input validation measures do you integrate into your ${primarySkill} applications?`,
            category: 'Security & Quality',
            hints: 'Mention CORS, sanitization, JWTs, or encrypted data handling.',
        });
    }
    else if (type === 'Project') {
        projects.forEach((p) => {
            questions.push({
                questionText: `For your project "${p.title}", explain your specific individual contributions and technical stack choices (${p.technologies?.join(', ') || primarySkill}).`,
                category: 'Project Ownership',
                hints: 'Detail specific components or API endpoints you built.',
            });
            questions.push({
                questionText: `What was the most challenging technical constraint or performance bottleneck you faced while building "${p.title}"?`,
                category: 'Problem Solving',
                hints: 'Explain the obstacle and your exact resolution step.',
            });
        });
        if (questions.length < count) {
            questions.push({
                questionText: `If you were tasked with scaling "${projectTitle}" to handle 10x user traffic, what infrastructure or database refactoring would you perform?`,
                category: 'Scalability',
                hints: 'Discuss caching layers, indexing, microservices, or load balancers.',
            });
        }
    }
    else if (type === 'HR' || type === 'Behavioral') {
        questions.push({
            questionText: `Hello! I reviewed your resume featuring skills like ${skills.slice(0, 3).join(', ') || 'technology'}. Could you give an introduction highlighting your career journey?`,
            category: 'Introduction',
            hints: 'Keep it concise (1-2 minutes) and highlight key milestones.',
        });
        questions.push({
            questionText: `Describe a situation in your work on ${projectTitle} where project requirements changed under a tight deadline. How did you adapt?`,
            category: 'Adaptability',
            hints: 'Focus on priority alignment, communication, and clear execution.',
        });
        questions.push({
            questionText: `Tell me about a time you experienced a technical disagreement with a colleague or peer. How did you resolve it?`,
            category: 'Collaboration',
            hints: 'Emphasize empathetic listening and objective technical compromise.',
        });
        questions.push({
            questionText: `What is a technology or framework outside your comfort zone that you recently learned, and how did you approach mastering it?`,
            category: 'Growth Mindset',
            hints: 'Discuss reading documentation, building proof-of-concepts, and asking questions.',
        });
    }
    else {
        // Mixed
        questions.push({
            questionText: `Welcome! Looking at your background in ${skills.slice(0, 3).join(', ') || 'software development'}, walk me through your technical profile and strengths.`,
            category: 'Overview',
            hints: 'Highlight core technical strengths and experience.',
        });
        if (projects[0]) {
            questions.push({
                questionText: `In "${projects[0].title}", how did you verify code quality, handle error cases, and test your features?`,
                category: 'Code Quality & Testing',
                hints: 'Mention unit tests, integration testing, or manual edge-case testing.',
            });
        }
        questions.push({
            questionText: `Explain a deep-dive technical concept from ${primarySkill} to a non-technical stakeholder.`,
            category: 'Technical Communication',
            hints: 'Use clear analogies without sacrificing technical accuracy.',
        });
        questions.push({
            questionText: `Tell me about a time a technical design didn't go as planned. What went wrong and what did you learn?`,
            category: 'Accountability & Learning',
            hints: 'Be honest and explain how you prevented a recurrence.',
        });
    }
    // Fallback filler if pool is small
    while (questions.length < count) {
        questions.push({
            questionText: `How do you approach automated testing and continuous integration when shipping software built with ${primarySkill}?`,
            category: 'Engineering Best Practices',
            hints: 'Cover CI/CD pipelines, unit testing, and code reviews.',
        });
    }
    return questions.slice(0, count);
}
async function generateFollowUpQuestion(questionText, userAnswer, resumeData) {
    const systemPrompt = `You are a professional AI interviewer. The candidate just answered your question.
Original Question: "${questionText}"
Candidate's Answer: "${userAnswer}"

Generate a short, concise, natural follow-up question (1 sentence) that probes deeper into the candidate's answer.
Output MUST be JSON with key "followUpQuestion".`;
    const rawJson = await callLLM('Generate follow-up question.', systemPrompt);
    if (rawJson) {
        try {
            const parsed = JSON.parse(rawJson);
            if (parsed.followUpQuestion) {
                return parsed.followUpQuestion;
            }
        }
        catch (e) { }
    }
    // Fallback follow-ups
    const answerLower = userAnswer.toLowerCase();
    if (answerLower.includes('python') || answerLower.includes('react') || answerLower.includes('logic') || answerLower.includes('api')) {
        return 'Could you elaborate specifically on how you structured that logic and handled potential edge cases?';
    }
    else if (answerLower.length < 50) {
        return 'That is a good start. Could you provide a concrete example or walk me through the step-by-step implementation?';
    }
    return 'What were the main trade-offs or alternatives you considered when taking that approach?';
}
async function evaluateAnswer(questionText, userAnswer, interviewType, difficulty) {
    const systemPrompt = `You are an expert interview evaluator. Evaluate the candidate's response based on 5 categories (scored 0 to 100):
1. Technical Knowledge (30% weight)
2. Answer Quality & Completeness (25% weight)
3. Communication & Clarity (20% weight)
4. Confidence & Tone (15% weight)
5. Relevance to Question (10% weight)

Question: "${questionText}"
User Answer: "${userAnswer}"

Output MUST be valid JSON with keys:
- technicalScore (number 0-100)
- qualityScore (number 0-100)
- communicationScore (number 0-100)
- confidenceScore (number 0-100)
- relevanceScore (number 0-100)
- overallScore (number 0-100)
- strengths (array of strings)
- improvements (array of strings)
- feedback (summary paragraph string)
`;
    const rawJson = await callLLM('Evaluate candidate answer.', systemPrompt);
    if (rawJson) {
        try {
            const parsed = JSON.parse(rawJson);
            if (parsed.overallScore !== undefined) {
                return {
                    technicalScore: Number(parsed.technicalScore) || 75,
                    qualityScore: Number(parsed.qualityScore) || 75,
                    communicationScore: Number(parsed.communicationScore) || 80,
                    confidenceScore: Number(parsed.confidenceScore) || 80,
                    relevanceScore: Number(parsed.relevanceScore) || 85,
                    overallScore: Number(parsed.overallScore) || 78,
                    strengths: Array.isArray(parsed.strengths) ? parsed.strengths : ['Clear answer'],
                    improvements: Array.isArray(parsed.improvements) ? parsed.improvements : ['Provide more technical depth'],
                    feedback: parsed.feedback || 'Good overall response with clear communication.',
                };
            }
        }
        catch (e) {
            console.error('[AI] Failed to parse answer evaluation JSON from Gemini');
        }
    }
    return evaluateAnswerSmartFallback(questionText, userAnswer);
}
function evaluateAnswerSmartFallback(questionText, userAnswer) {
    const wordCount = userAnswer.trim().split(/\s+/).length;
    const lower = userAnswer.toLowerCase();
    let technical = 70;
    let quality = 70;
    let communication = 75;
    let confidence = 75;
    let relevance = 80;
    // Length heuristics
    if (wordCount > 60) {
        quality += 10;
        technical += 10;
        communication += 5;
    }
    else if (wordCount < 15) {
        quality -= 20;
        technical -= 15;
        communication -= 15;
        confidence -= 20;
    }
    // Keyword check for technical depth
    const techKeywords = ['because', 'architecture', 'function', 'component', 'database', 'api', 'state', 'async', 'handle', 'result', 'star', 'example', 'performance', 'optimized'];
    const matchedKeywords = techKeywords.filter(kw => lower.includes(kw));
    technical += Math.min(matchedKeywords.length * 4, 18);
    relevance += Math.min(matchedKeywords.length * 3, 15);
    // Clamp 0-100
    technical = Math.min(Math.max(technical, 40), 98);
    quality = Math.min(Math.max(quality, 40), 98);
    communication = Math.min(Math.max(communication, 40), 98);
    confidence = Math.min(Math.max(confidence, 40), 98);
    relevance = Math.min(Math.max(relevance, 40), 98);
    // Weighted overall calculation
    const overall = Math.round(technical * 0.30 +
        quality * 0.25 +
        communication * 0.20 +
        confidence * 0.15 +
        relevance * 0.10);
    const strengths = [];
    const improvements = [];
    if (relevance >= 80)
        strengths.push('Directly addressed the question asked.');
    if (communication >= 80)
        strengths.push('Clear expression and readable structure.');
    if (matchedKeywords.length > 2)
        strengths.push('Used relevant technical terminology and practical concepts.');
    if (strengths.length === 0)
        strengths.push('Attempted the response directly.');
    if (wordCount < 30)
        improvements.push('Expand your response using the STAR method (Situation, Task, Action, Result).');
    if (matchedKeywords.length < 2)
        improvements.push('Include specific technical details, algorithms, or tool choices.');
    if (improvements.length === 0)
        improvements.push('Practice summarizing key trade-offs at the end of your response.');
    let feedback = `Your response scored ${overall}/100. `;
    if (overall >= 85) {
        feedback += 'Excellent response with strong technical depth and clear structure.';
    }
    else if (overall >= 70) {
        feedback += 'Good solid answer. Adding more concrete examples will elevate it further.';
    }
    else {
        feedback += 'Answer is brief. Try elaborating on your specific technical contributions and rationale.';
    }
    return {
        technicalScore: technical,
        qualityScore: quality,
        communicationScore: communication,
        confidenceScore: confidence,
        relevanceScore: relevance,
        overallScore: overall,
        strengths,
        improvements,
        feedback,
    };
}
