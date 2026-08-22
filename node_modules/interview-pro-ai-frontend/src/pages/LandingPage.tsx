import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import {
  FileText,
  Mic,
  BrainCircuit,
  BarChart2,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Volume2,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#111111] font-sans antialiased selection:bg-[#2563EB]/10 selection:text-[#2563EB]">
      {/* Navigation Header */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 border-b border-[#E5E5E5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 bg-[#F5F5F5] border border-[#E5E5E5] text-[#666666] px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
              INTERVIEW PREPARATION, REIMAGINED
            </div>

            {/* Large Editorial Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[#111111] tracking-tight leading-[1.08]">
              Prepare for interviews.<br />
              Build <span className="text-[#2563EB]">confidence.</span>
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-xl text-[#666666] font-normal leading-relaxed max-w-2xl mx-auto">
              Practice personalized mock interviews based on your resume, receive structured feedback, and improve your interview performance.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#111111] hover:bg-black text-white font-medium px-8 py-3.5 rounded-xl text-base transition-all shadow-xs active:scale-[0.99]"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
              
              <a
                href="#how-it-works"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-[#111111] font-medium px-7 py-3.5 rounded-xl border border-[#E5E5E5] text-base transition-all active:scale-[0.99]"
              >
                See How It Works
              </a>
            </div>

            {/* Subtle Product Information Badges */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-[#666666] font-medium">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB]" /> Resume-based questions
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB]" /> Voice & text interviews
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB]" /> Structured feedback
              </span>
            </div>

          </div>

          {/* Hero Visual: Minimal Product Application Interface Preview */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6 sm:p-8 shadow-xs space-y-6">
              
              {/* Session Top Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5E5E5] pb-4 text-xs">
                <div className="flex items-center gap-3 font-mono">
                  <span className="font-bold text-[#111111] uppercase tracking-wider">INTERVIEW SESSION</span>
                  <span className="text-[#666666]">/</span>
                  <span className="text-[#666666]">Question 03 of 05</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-blue-50 text-[#2563EB] border border-blue-100 rounded-md font-semibold text-[11px]">
                    Technical Mode
                  </span>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md font-semibold text-[11px]">
                    In Progress
                  </span>
                </div>
              </div>

              {/* Question Panel */}
              <div className="bg-[#F5F5F5] p-5 rounded-xl border border-[#E5E5E5] space-y-2">
                <div className="flex items-center justify-between text-xs text-[#666666] font-mono">
                  <span>Question 03</span>
                  <span className="text-[#2563EB] flex items-center gap-1 font-semibold">
                    <Volume2 className="w-3.5 h-3.5" /> Audio Prompt
                  </span>
                </div>
                <p className="text-base font-semibold text-[#111111] leading-snug">
                  "Tell me about a project where you solved a difficult technical problem in your backend architecture."
                </p>
              </div>

              {/* Candidate Transcript Box */}
              <div className="bg-white p-5 rounded-xl border border-[#E5E5E5] space-y-2">
                <div className="flex items-center justify-between text-xs text-[#666666]">
                  <span className="font-semibold text-[#111111] font-mono uppercase">Candidate Response (Voice Recorded)</span>
                  <span className="font-mono text-[#2563EB]">00:45 / 02:00</span>
                </div>
                <p className="text-sm text-[#333333] leading-relaxed">
                  "In our microservices architecture, we decoupled the monolithic order processing API using Node.js, PostgreSQL connection pooling, and Redis caching. This reduced peak query latency by 40% and eliminated production timeouts during high traffic spikes."
                </p>
              </div>

              {/* STAR Rubric Evaluation Preview */}
              <div className="bg-[#FAFAFA] p-5 rounded-xl border border-[#E5E5E5] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#111111] text-white flex items-center justify-center font-bold text-lg font-mono">
                    86
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#111111]">Overall STAR Rubric Score</h4>
                    <p className="text-xs text-[#666666]">Technical Depth: 90% | Communication: 88% | Relevance: 85%</p>
                  </div>
                </div>
                <div className="text-xs text-[#666666] md:text-right max-w-sm">
                  <span className="font-semibold text-[#111111]">Feedback Summary:</span> Clear architectural details, concrete database optimization metrics, and logical trade-off analysis.
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white border-b border-[#E5E5E5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <h2 className="text-xs font-mono font-bold text-[#2563EB] uppercase tracking-widest">FEATURES</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-[#111111] tracking-tight">
              Everything you need to prepare.
            </p>
            <p className="text-base text-[#666666]">
              Comprehensive tools designed to build realistic interview confidence through customized AI simulations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            
            {/* Feature 1 */}
            <div className="bg-white p-7 rounded-2xl border border-[#E5E5E5] space-y-4 hover:border-[#111111] transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#F5F5F5] border border-[#E5E5E5] text-[#111111] flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#111111]">1. Resume-Based Interviews</h3>
              <p className="text-sm text-[#666666] leading-relaxed">
                Questions are generated directly from the candidate's resume, skills, projects, and work experience. No generic templates.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-7 rounded-2xl border border-[#E5E5E5] space-y-4 hover:border-[#111111] transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#F5F5F5] border border-[#E5E5E5] text-[#111111] flex items-center justify-center">
                <Mic className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#111111]">2. Voice & Text Answers</h3>
              <p className="text-sm text-[#666666] leading-relaxed">
                Practice answering naturally using speech recognition or structured text responses with real-time browser audio playback.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-7 rounded-2xl border border-[#E5E5E5] space-y-4 hover:border-[#111111] transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#F5F5F5] border border-[#E5E5E5] text-[#111111] flex items-center justify-center">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#111111]">3. Structured Feedback</h3>
              <p className="text-sm text-[#666666] leading-relaxed">
                Receive clear feedback on communication, technical depth, confidence, and answer quality after every response.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-7 rounded-2xl border border-[#E5E5E5] space-y-4 hover:border-[#111111] transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#F5F5F5] border border-[#E5E5E5] text-[#111111] flex items-center justify-center">
                <BarChart2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#111111]">4. Interview Performance</h3>
              <p className="text-sm text-[#666666] leading-relaxed">
                Track your performance over time and identify specific areas for technical and behavioral improvement.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-[#FAFAFA] border-b border-[#E5E5E5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <h2 className="text-xs font-mono font-bold text-[#2563EB] uppercase tracking-widest">WORKFLOW</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-[#111111] tracking-tight">
              Three simple steps.
            </p>
            <p className="text-base text-[#666666]">
              How InterviewPro transforms your interview preparation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            
            <div className="bg-white p-8 rounded-2xl border border-[#E5E5E5] space-y-4 relative">
              <div className="text-3xl font-extrabold font-mono text-[#2563EB]">01</div>
              <h3 className="text-lg font-bold text-[#111111]">Upload your resume</h3>
              <p className="text-sm text-[#666666] leading-relaxed">
                Drag and drop your PDF or DOCX resume for automated technical skill, project, and experience extraction.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-[#E5E5E5] space-y-4 relative">
              <div className="text-3xl font-extrabold font-mono text-[#2563EB]">02</div>
              <h3 className="text-lg font-bold text-[#111111]">Complete your mock interview</h3>
              <p className="text-sm text-[#666666] leading-relaxed">
                Answer personalized technical, behavioral, or project questions using your voice or keyboard.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-[#E5E5E5] space-y-4 relative">
              <div className="text-3xl font-extrabold font-mono text-[#2563EB]">03</div>
              <h3 className="text-lg font-bold text-[#111111]">Review your feedback</h3>
              <p className="text-sm text-[#666666] leading-relaxed">
                Receive a transparent 0–100 rubric score, key strengths, and targeted technical recommendations.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white border-b border-[#E5E5E5]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-xs font-mono font-bold text-[#2563EB] uppercase tracking-widest">ABOUT INTERVIEWPRO</h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-[#111111] tracking-tight">
            Built to make interview preparation more practical.
          </h3>
          <p className="text-base sm:text-lg text-[#666666] leading-relaxed max-w-3xl mx-auto">
            InterviewPro was created to bridge the gap between passive studying and real interview performance. Traditional question lists often fail to test authentic technical depth or personal resume claims.
          </p>
          <p className="text-sm sm:text-base text-[#666666] leading-relaxed max-w-3xl mx-auto">
            By combining document parsing, LLM context generation, voice-to-text input, and 5-dimensional rubric scoring, InterviewPro provides candidates with a realistic, structured environment to build genuine interview confidence.
          </p>
        </div>
      </section>

      {/* Bottom Call To Action Banner */}
      <section className="py-20 bg-[#111111] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Ready for your next interview?
          </h2>
          <p className="text-[#AAAAAA] text-base sm:text-lg max-w-xl mx-auto font-normal">
            Practice smarter. Answer with confidence.
          </p>
          <div className="pt-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-[#111111] font-bold px-8 py-4 rounded-xl text-base transition-all shadow-md active:scale-[0.99]"
            >
              Start Practicing
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};
