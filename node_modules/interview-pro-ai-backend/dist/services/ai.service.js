"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseResumeWithAI = parseResumeWithAI;
exports.generateInterviewQuestions = generateInterviewQuestions;
exports.generateFollowUpQuestion = generateFollowUpQuestion;
exports.evaluateAnswer = evaluateAnswer;
async function callLLM(prompt, systemPrompt) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey && apiKey.trim().length > 10) {
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: prompt },
                    ],
                    temperature: 0.7,
                    response_format: { type: 'json_object' },
                }),
            });
            if (response.ok) {
                const data = await response.json();
                return data.choices[0].message.content;
            }
            else {
                console.warn('OpenAI API call failed, falling back to smart engine:', await response.text());
            }
        }
        catch (err) {
            console.warn('OpenAI request error, falling back to smart engine:', err);
        }
    }
    return ''; // Trigger smart fallback
}
async function parseResumeWithAI(rawText) {
    const systemPrompt = `You are an expert HR and Technical Recruiter AI parser. Extract structured information from the resume text provided. Output MUST be valid JSON with keys: summary, skills (array of {name, category, level}), projects (array of {title, description, technologies, link}), experiences (array of {company, role, duration, responsibilities}), educations (array of {degree, institution, year, details}).`;
    const rawJson = await callLLM(rawText, systemPrompt);
    if (rawJson) {
        try {
            const parsed = JSON.parse(rawJson);
            return {
                summary: parsed.summary || 'Candidate profile extracted from resume.',
                skills: parsed.skills || [],
                projects: parsed.projects || [],
                experiences: parsed.experiences || [],
                educations: parsed.educations || [],
            };
        }
        catch (e) {
            console.error('Failed to parse LLM JSON output for resume analysis');
        }
    }
    // Smart Fallback Parser based on Regex & Keyword Matching
    return smartResumeFallback(rawText);
}
function smartResumeFallback(rawText) {
    const text = rawText || '';
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const commonSkills = [
        'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'HTML', 'CSS',
        'SQL', 'PostgreSQL', 'MongoDB', 'Git', 'Docker', 'AWS', 'REST API', 'Express', 'Tailwind',
        'Communication', 'Problem Solving', 'Teamwork', 'Leadership', 'Agile', 'Scrum'
    ];
    const foundSkills = commonSkills.filter(skill => {
        const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return new RegExp(`${escaped}`, 'i').test(text);
    });
    const skillsList = foundSkills.length > 0
        ? foundSkills.map(s => ({ name: s, category: 'Technical', level: 'Intermediate' }))
        : [
            { name: 'JavaScript', category: 'Frontend', level: 'Intermediate' },
            { name: 'React', category: 'Frontend', level: 'Intermediate' },
            { name: 'Python', category: 'Backend', level: 'Intermediate' },
            { name: 'SQL', category: 'Database', level: 'Intermediate' },
            { name: 'Problem Solving', category: 'Soft Skills', level: 'Advanced' },
        ];
    // Look for project mentions
    const projectMatches = [];
    const projectIdx = lines.findIndex(l => /project/i.test(l));
    if (projectIdx !== -1 && lines[projectIdx + 1]) {
        projectMatches.push({
            title: lines[projectIdx + 1] || 'Web Application Project',
            description: lines[projectIdx + 2] || 'A full-stack application built during academic/professional practice.',
            technologies: skillsList.slice(0, 3).map(s => s.name),
        });
    }
    else {
        projectMatches.push({
            title: 'Full-Stack Recommendation System',
            description: 'Developed an intelligent web system using Python backend and React frontend.',
            technologies: ['Python', 'React', 'REST API', 'SQL'],
        }, {
            title: 'Portfolio & Analytics Dashboard',
            description: 'Created a responsive analytics dashboard with secure authentication.',
            technologies: ['TypeScript', 'Node.js', 'PostgreSQL'],
        });
    }
    return {
        summary: text.slice(0, 300) || 'Motivated software engineer with experience building web applications and solving complex technical challenges.',
        skills: skillsList,
        projects: projectMatches,
        experiences: [
            {
                company: 'Tech Solutions Inc.',
                role: 'Software Engineering Intern',
                duration: '2023 - Present',
                responsibilities: [
                    'Assisted in developing web application features and API endpoints.',
                    'Participated in code reviews, bug fixes, and agile standups.',
                ],
            },
        ],
        educations: [
            {
                degree: 'Bachelor of Science in Computer Science / Engineering',
                institution: 'University / Institute of Technology',
                year: '2020 - 2024',
                details: 'Relevant Coursework: Data Structures, Web Development, Database Systems, Software Engineering.',
            },
        ],
    };
}
async function generateInterviewQuestions(type, difficulty, count, resumeData) {
    const skillsStr = resumeData?.skills.map(s => s.name).join(', ') || 'Software Development, Web Apps, JavaScript, SQL';
    const projectsStr = resumeData?.projects.map(p => `${p.title}: ${p.description}`).join(' | ') || 'Web development project';
    const systemPrompt = `You are a top-tier tech interviewer conducting a ${type} interview at ${difficulty} level.
Generate exactly ${count} realistic, professional interview questions based on the candidate's resume.
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
            console.error('Failed to parse question generation JSON output');
        }
    }
    return generateSmartQuestionsFallback(type, difficulty, count, resumeData);
}
function generateSmartQuestionsFallback(type, difficulty, count, resumeData) {
    const skills = resumeData?.skills.map(s => s.name) || ['JavaScript', 'React', 'Python', 'SQL'];
    const projects = resumeData?.projects || [];
    const primarySkill = skills[0] || 'software development';
    const secondarySkill = skills[1] || 'databases';
    const projectTitle = projects[0]?.title || 'your recent technical project';
    const templates = {
        Technical: [
            {
                questionText: `You mentioned experience with ${primarySkill}. Explain the core concepts of ${primarySkill} and how you apply them in real-world scenarios.`,
                category: 'Core Concepts',
                hints: 'Discuss key features, architecture, and common best practices.',
            },
            {
                questionText: `Walk me through how you handled data persistence or backend communication in ${projectTitle}.`,
                category: 'Architecture & System Design',
                hints: 'Mention API design, error handling, and performance considerations.',
            },
            {
                questionText: `How do you optimize performance and state management when working with ${secondarySkill}?`,
                category: 'Performance Optimization',
                hints: 'Cover caching, memory management, and code structuring.',
            },
            {
                questionText: `Describe a challenging bug or technical hurdle you encountered while building ${projectTitle} and how you debugged it.`,
                category: 'Debugging & Problem Solving',
                hints: 'Use the STAR method (Situation, Task, Action, Result).',
            },
            {
                questionText: `What security practices do you implement when designing user authentication and data access control?`,
                category: 'Security & Best Practices',
                hints: 'Talk about password hashing, JWTs, CORS, and sanitized inputs.',
            },
            {
                questionText: `How do write automated tests or verify your code quality before deploying to production?`,
                category: 'Testing & Reliability',
                hints: 'Mention unit tests, integration testing, and code review processes.',
            },
        ],
        HR: [
            {
                questionText: 'Tell me about yourself, your background, and why you are passionate about pursuing a career in software engineering.',
                category: 'Introduction',
                hints: 'Keep it concise (1-2 mins), highlighting key milestones and technical enthusiasm.',
            },
            {
                questionText: 'Where do you see your technical skills evolving over the next 2-3 years?',
                category: 'Career Goals',
                hints: 'Focus on growth mindset, learning new tech, and contributing value.',
            },
            {
                questionText: 'Describe a situation where you had to learn a brand new framework or technology under a tight deadline.',
                category: 'Adaptability',
                hints: 'Highlight documentation reading, building quick POCs, and staying focused.',
            },
            {
                questionText: 'Why are you interested in this role and what sets your approach apart from other candidates?',
                category: 'Motivation & Fit',
                hints: 'Connect your personal projects and problem-solving mindset to team value.',
            },
            {
                questionText: 'How do you handle receiving constructive feedback during code reviews or team evaluations?',
                category: 'Growth Mindset',
                hints: 'Demonstrate humility, openness, and active implementation of feedback.',
            },
        ],
        Behavioral: [
            {
                questionText: 'Describe a time when you experienced a conflict or disagreement with a team member. How did you resolve it?',
                category: 'Conflict Resolution',
                hints: 'Focus on empathetic listening, objective compromise, and team alignment.',
            },
            {
                questionText: 'Give an example of a project where requirements changed midway through implementation. How did you respond?',
                category: 'Flexibility & Execution',
                hints: 'Discuss prioritizing tasks, updating stakeholders, and refactoring cleanly.',
            },
            {
                questionText: 'Tell me about a time you failed or made a mistake on a technical task. What did you learn from it?',
                category: 'Accountability & Learning',
                hints: 'Be honest, take ownership, and emphasize systemic fixes preventing repeat errors.',
            },
            {
                questionText: 'How do you prioritize competing deadlines when managing multiple technical tasks or courses?',
                category: 'Time Management',
                hints: 'Discuss task breakdown, estimates, and transparent communication.',
            },
        ],
        Project: [
            {
                questionText: `In your project "${projectTitle}", explain your architectural choices and technology stack selection.`,
                category: 'Project Architecture',
                hints: 'Explain why you chose specific tools and the trade-offs involved.',
            },
            {
                questionText: `What was your individual role and biggest contribution to ${projectTitle}?`,
                category: 'Individual Ownership',
                hints: 'Detail specific features, API routes, or UI components you engineered.',
            },
            {
                questionText: `If you had 2 extra weeks to improve ${projectTitle}, what features or optimizations would you add next?`,
                category: 'Future Improvements',
                hints: 'Discuss scalability, UX polish, caching, or monitoring.',
            },
        ],
    };
    const selectedTypeQuestions = templates[type] || templates.Technical;
    const pool = [...selectedTypeQuestions, ...templates.Behavioral, ...templates.HR];
    return pool.slice(0, count);
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
            console.error('Failed to parse answer evaluation JSON');
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
    // Weighted overall calculation: Technical 30%, Quality 25%, Comm 20%, Confidence 15%, Relevance 10%
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
