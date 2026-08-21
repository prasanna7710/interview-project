import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import {
  FileText,
  Mic,
  BrainCircuit,
  BarChart2,
  CheckCircle,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  Award,
  MessageSquareText,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-600 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-brand-200 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                Smart AI Mock Interviews Powered by LLM
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.15]">
                Ace Your Next Interview with <span className="text-brand-600">AI</span>
              </h1>

              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Upload your resume, practice personalized interviews, answer naturally with your voice, and receive clear AI-powered feedback.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-medium px-7 py-3.5 rounded-xl shadow-md transition transform active:scale-95 text-base"
                >
                  Start Practicing
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href="#how-it-works"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-medium px-6 py-3.5 rounded-xl border border-gray-300 shadow-2xs transition text-base"
                >
                  See How It Works
                </a>
              </div>

              <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-gray-500 font-medium">
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-green-600" /> Free Trial Available</span>
                <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-brand-600" /> Voice & Text Answering</span>
                <span className="flex items-center gap-1.5"><Award className="w-4 h-4 text-amber-500" /> STAR Rubric Scoring</span>
              </div>
            </div>

            {/* Right Illustration Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-elevated border border-gray-200 space-y-5">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center font-bold">
                      AI
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">AI Senior Technical Interviewer</h4>
                      <p className="text-xs text-brand-600 font-medium">Conducting Technical Mock Session</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs px-2.5 py-1 rounded-full font-medium border border-green-200">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Live Session
                  </span>
                </div>

                {/* AI Question Box */}
                <div className="bg-brand-50/60 p-4 rounded-xl border border-brand-100 space-y-2">
                  <div className="flex items-center justify-between text-xs text-brand-600 font-semibold">
                    <span>Question 2 of 5</span>
                    <span className="bg-white px-2 py-0.5 rounded border border-brand-200">React & Node.js</span>
                  </div>
                  <p className="text-sm font-medium text-gray-800">
                    "You mentioned developing a Smart Canteen Recommendation System using Python and React. How did you structure your API endpoints and handle state management?"
                  </p>
                </div>

                {/* Candidate Voice Box */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="font-semibold text-gray-700">Candidate Answer (Voice Recorded)</span>
                    <span className="flex items-center gap-1 text-brand-600 font-medium"><Mic className="w-3.5 h-3.5 animate-pulse" /> 00:42</span>
                  </div>
                  <p className="text-xs text-gray-600 italic">
                    "We used Python Flask for backend recommendation logic, returning JSON responses to React components managed via Context state..."
                  </p>
                </div>

                {/* Real-time score snippet */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-green-100 text-green-700 flex items-center justify-center font-bold text-xs">
                      88
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-900">Score Rating: Excellent</div>
                      <div className="text-[11px] text-gray-500">Technical Depth: 90/100</div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-brand-600">Generating Feedback...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold text-brand-600 uppercase tracking-widest">Platform Features</h2>
            <p className="text-3xl font-extrabold text-gray-900 sm:text-4xl tracking-tight">
              Everything You Need to Command Your Interviews
            </p>
            <p className="text-gray-600 text-base">
              Comprehensive tools designed to build realistic interview confidence through customized AI simulations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-[#F8FAFC] p-6 rounded-2xl border border-gray-200 space-y-3 hover:border-brand-300 transition shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0F172A]">1. Resume-Based Questions</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Questions generated dynamically from your actual projects, technologies, education, and work experience. No generic templates.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#F8FAFC] p-6 rounded-2xl border border-gray-200 space-y-3 hover:border-brand-300 transition shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center">
                <MessageSquareText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0F172A]">2. AI Follow-Up Questions</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Interviewer probes deeper into your answers naturally, asking intelligent follow-up questions to test your genuine technical depth.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#F8FAFC] p-6 rounded-2xl border border-gray-200 space-y-3 hover:border-brand-300 transition shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0F172A]">3. Voice & Speech Answering</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Real browser speech recognition lets you answer questions naturally using your voice, while text-to-speech reads interviewer questions aloud.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-[#F8FAFC] p-6 rounded-2xl border border-gray-200 space-y-3 hover:border-brand-300 transition shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0F172A]">4. Real-Time Feedback</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Instant actionable evaluation after every response, highlighting exact strengths and specific areas to improve.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-[#F8FAFC] p-6 rounded-2xl border border-gray-200 space-y-3 hover:border-brand-300 transition shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0F172A]">5. Transparent Scoring</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Weighted 0–100 rubric evaluating Technical Knowledge (30%), Answer Quality (25%), Communication (20%), Confidence (15%), and Relevance (10%).
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-[#F8FAFC] p-6 rounded-2xl border border-gray-200 space-y-3 hover:border-brand-300 transition shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center">
                <BarChart2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0F172A]">6. Performance Analytics</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Track your improvement over time with clean score trend charts, weak spot identification, and targeted practice advice.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-[#F0F7FF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold text-brand-600 uppercase tracking-widest">Simple Step-by-Step Flow</h2>
            <p className="text-3xl font-extrabold text-gray-900 sm:text-4xl tracking-tight">
              How Interview Pro AI Works
            </p>
            <p className="text-gray-600 text-base">
              5 easy steps to prepare for your dream job interview.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              { step: 'Step 1', title: 'Upload Resume', desc: 'Drag & drop your PDF or DOCX resume into your dashboard.' },
              { step: 'Step 2', title: 'AI Analysis', desc: 'AI extracts your technical skills, projects, and work experience.' },
              { step: 'Step 3', title: 'Setup Interview', desc: 'Select technical, HR, behavioral, or project mode with difficulty level.' },
              { step: 'Step 4', title: 'AI Interview', desc: 'Speak or type your answers to personalized AI interviewer questions.' },
              { step: 'Step 5', title: 'Receive Feedback', desc: 'View detailed 0-100 breakdown, strengths, and recommendations.' },
            ].map((s, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-200 space-y-3 relative shadow-2xs">
                <div className="text-xs font-bold text-brand-600 uppercase tracking-wider">{s.step}</div>
                <h4 className="text-base font-bold text-gray-900">{s.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-brand-600 to-brand-800 text-white">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Ace Your Next Interview?
          </h2>
          <p className="text-brand-100 text-base max-w-2xl mx-auto">
            Join thousands of candidates who practice smarter, interview better, and land top offers.
          </p>
          <div className="pt-2">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-white text-brand-700 hover:bg-brand-50 font-bold px-8 py-4 rounded-xl shadow-lg transition text-base"
            >
              Get Started Now — Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
