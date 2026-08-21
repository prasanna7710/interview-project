import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Interview, AnalyticsData } from '../types';
import {
  Video,
  UploadCloud,
  FileText,
  Award,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  TrendingUp,
  ChevronRight,
  Loader2,
  Code,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [recentInterviews, setRecentInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [analyticsRes, interviewsRes] = await Promise.all([
          api.get('/analytics'),
          api.get('/interviews'),
        ]);
        setAnalytics(analyticsRes.data);
        setRecentInterviews(interviewsRes.data.interviews.slice(0, 5));
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 85) return 'bg-green-50 text-green-700 border-green-200';
    if (score >= 70) return 'bg-brand-50 text-brand-700 border-brand-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
  };

  if (isLoading) {
    return (
      <AppLayout title="Dashboard">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  const metrics = analytics?.metrics || {
    totalCompleted: recentInterviews.filter(i => i.status === 'completed').length,
    avgScore: recentInterviews.length > 0 ? Math.round(recentInterviews.reduce((a, b) => a + b.overallScore, 0) / recentInterviews.length) : 0,
    bestScore: recentInterviews.length > 0 ? Math.max(...recentInterviews.map(i => i.overallScore)) : 0,
    totalPracticeMinutes: recentInterviews.reduce((a, b) => a + Math.round(b.durationSec / 60), 0),
  };

  return (
    <AppLayout title="Dashboard" subtitle="Track your progress and start mock interviews">
      <div className="space-y-6">
        {/* Welcome Header Hero */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E2E8F0] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#2563EB] bg-[#EFF6FF] px-3 py-1 rounded-full border border-blue-100">
              <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" /> AI Interview Readiness Active
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              {getGreeting()}, {user?.fullName ? user.fullName.split(' ')[0] : 'Candidate'} 👋
            </h2>
            <p className="text-sm text-[#64748B]">
              Prepare for your next interview. Practice personalized questions generated directly from your resume.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link
              to="/interview/setup"
              className="inline-flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold px-5 py-3 rounded-xl shadow-xs hover:shadow transition-all duration-150 text-sm"
            >
              <Video className="w-4 h-4" /> Start New Interview
            </Link>
            <Link
              to="/coding/setup"
              className="inline-flex items-center justify-center gap-2 bg-[#EFF6FF] hover:bg-blue-100 text-[#2563EB] font-semibold px-5 py-3 rounded-xl border border-blue-200 transition-all duration-150 text-sm"
            >
              <Code className="w-4 h-4" /> Optional Coding Test
            </Link>
            <Link
              to="/resume"
              className="inline-flex items-center justify-center gap-2 bg-[#F8FAFC] hover:bg-gray-100 text-[#0F172A] font-semibold px-5 py-3 rounded-xl border border-[#E2E8F0] transition-all duration-150 text-sm"
            >
              <UploadCloud className="w-4 h-4 text-[#64748B]" /> Upload Resume
            </Link>
          </div>
        </div>

        {/* Metrics Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs hover:shadow-sm transition-all duration-150 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#64748B]">Interviews Completed</span>
              <div className="p-2 bg-[#EFF6FF] text-[#2563EB] rounded-xl">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-[#0F172A]">{metrics.totalCompleted}</div>
            <div className="text-xs text-[#64748B]">Total mock sessions</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs hover:shadow-sm transition-all duration-150 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#64748B]">Average Score</span>
              <div className="p-2 bg-emerald-50 text-[#10B981] rounded-xl">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-[#0F172A]">{metrics.avgScore}<span className="text-sm font-normal text-[#64748B]">/100</span></div>
            <div className="text-xs text-[#64748B]">Across all categories</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs hover:shadow-sm transition-all duration-150 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">Best Score</span>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{metrics.bestScore}<span className="text-sm font-normal text-gray-400">/100</span></div>
            <div className="text-xs text-gray-500">Highest performance</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">Practice Time</span>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{metrics.totalPracticeMinutes} <span className="text-sm font-normal text-gray-400">mins</span></div>
            <div className="text-xs text-gray-500">Total interview time</div>
          </div>
        </div>

        {/* Charts & Recommended Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Progress Chart */}
          <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">Your Score Trend</h3>
                <p className="text-xs text-gray-500">Overall score progression across recent interviews</p>
              </div>
              <Link to="/analytics" className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
                View Full Analytics <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="h-64 w-full pt-4">
              {analytics?.performanceTrends && analytics.performanceTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.performanceTrends}>
                    <defs>
                      <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={11} domain={[0, 100]} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                    />
                    <Area type="monotone" dataKey="overallScore" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#scoreColor)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center p-6 space-y-2">
                  <TrendingUp className="w-8 h-8 text-gray-300" />
                  <p className="text-xs text-gray-500 font-medium">No completed interview sessions yet.</p>
                  <Link to="/interview/setup" className="text-xs font-semibold text-brand-600 hover:underline">
                    Take your first mock interview →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recommended Practice Box */}
          <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-brand-600 font-semibold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4" /> Recommended Practice
              </div>
              <h4 className="text-base font-bold text-gray-900">STAR Methodology Optimization</h4>
              <p className="text-xs text-gray-600 leading-relaxed bg-brand-50/50 p-4 rounded-xl border border-brand-100">
                "{analytics?.recommendation || 'Practice explaining your technical projects using the STAR method (Situation, Task, Action, Result).'}"
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100 space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Target Focus</span>
                <span className="font-semibold text-gray-900">Technical Depth & Rationale</span>
              </div>
              <Link
                to="/interview/setup"
                className="w-full inline-flex items-center justify-center gap-2 bg-brand-50 hover:bg-brand-100 text-brand-700 py-2.5 rounded-xl font-semibold text-xs transition border border-brand-200"
              >
                Practice This Focus Area <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Interviews Table Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">Recent Interviews</h3>
              <p className="text-xs text-gray-500">Your latest practice sessions and report scores</p>
            </div>
            <Link to="/history" className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
              View All History <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentInterviews.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-50 text-gray-400 font-semibold uppercase tracking-wider border-b border-gray-100">
                  <tr>
                    <th className="py-3 px-4">Interview Title / Type</th>
                    <th className="py-3 px-4">Difficulty</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentInterviews.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50/50 transition">
                      <td className="py-3.5 px-4 font-semibold text-gray-900">
                        {inv.title || `${inv.type} Interview`}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-medium text-[11px]">
                          {inv.difficulty}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-500">
                        {new Date(inv.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getScoreBadge(inv.overallScore)}`}>
                          {Math.round(inv.overallScore)}/100
                        </span>
                      </td>
                      <td className="py-3.5 px-4 capitalize font-medium text-gray-700">
                        {inv.status.replace('_', ' ')}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={inv.status === 'completed' ? `/interviews/${inv.id}/results` : `/interview/${inv.id}`}
                          className="text-brand-600 hover:text-brand-700 font-semibold hover:underline"
                        >
                          {inv.status === 'completed' ? 'View Report' : 'Continue'}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200 space-y-2">
              <FileText className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="text-xs text-gray-500 font-medium">No recent interviews found.</p>
              <Link to="/interview/setup" className="inline-block text-xs font-semibold text-brand-600 hover:underline">
                Create your first interview session →
              </Link>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};
