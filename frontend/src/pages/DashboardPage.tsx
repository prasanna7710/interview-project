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
    if (score >= 85) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (score >= 70) return 'bg-blue-50 text-[#2563EB] border-blue-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
  };

  if (isLoading) {
    return (
      <AppLayout title="Dashboard">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-6 h-6 text-[#111111] animate-spin" />
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
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E5E5E5] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-[#2563EB] bg-[#F5F5F5] px-3 py-1 rounded-md border border-[#E5E5E5]">
              <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" /> INTERVIEW READINESS ACTIVE
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
              {getGreeting()}, {user?.fullName ? user.fullName.split(' ')[0] : 'Candidate'} 👋
            </h2>
            <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
              Prepare for your next interview. Practice personalized questions generated directly from your resume.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <Link
              to="/interview/setup"
              className="inline-flex items-center justify-center gap-2 bg-[#111111] hover:bg-black text-white font-medium px-5 py-2.5 rounded-xl transition-all shadow-2xs text-xs active:scale-[0.99]"
            >
              <Video className="w-4 h-4" /> Start New Interview
            </Link>
            <Link
              to="/coding/setup"
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-[#111111] font-medium px-5 py-2.5 rounded-xl border border-[#E5E5E5] transition-all text-xs active:scale-[0.99]"
            >
              <Code className="w-4 h-4 text-[#666666]" /> Coding Test
            </Link>
            <Link
              to="/resume"
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-[#111111] font-medium px-5 py-2.5 rounded-xl border border-[#E5E5E5] transition-all text-xs active:scale-[0.99]"
            >
              <UploadCloud className="w-4 h-4 text-[#666666]" /> Upload Resume
            </Link>
          </div>
        </div>

        {/* Metrics Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white p-5 rounded-2xl border border-[#E5E5E5] shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#666666]">Interviews Completed</span>
              <div className="p-2 bg-[#F5F5F5] text-[#111111] rounded-lg border border-[#E5E5E5]">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-[#111111] font-mono">{metrics.totalCompleted}</div>
            <div className="text-[11px] text-[#666666]">Total mock sessions</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E5E5E5] shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#666666]">Average Score</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-[#111111] font-mono">
              {metrics.avgScore}<span className="text-xs font-normal text-[#666666]">/100</span>
            </div>
            <div className="text-[11px] text-[#666666]">Across all categories</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E5E5E5] shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#666666]">Best Score</span>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg border border-amber-100">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-[#111111] font-mono">
              {metrics.bestScore}<span className="text-xs font-normal text-[#666666]">/100</span>
            </div>
            <div className="text-[11px] text-[#666666]">Highest performance</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E5E5E5] shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#666666]">Practice Time</span>
              <div className="p-2 bg-blue-50 text-[#2563EB] rounded-lg border border-blue-100">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-[#111111] font-mono">
              {metrics.totalPracticeMinutes} <span className="text-xs font-normal text-[#666666]">mins</span>
            </div>
            <div className="text-[11px] text-[#666666]">Total practice duration</div>
          </div>
        </div>

        {/* Charts & Recommended Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Progress Chart */}
          <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4">
              <div>
                <h3 className="text-sm font-bold text-[#111111]">Your Score Trend</h3>
                <p className="text-xs text-[#666666]">Overall score progression across recent interviews</p>
              </div>
              <Link to="/analytics" className="text-xs font-semibold text-[#2563EB] hover:underline flex items-center gap-1">
                View Full Analytics <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="h-64 w-full pt-2">
              {analytics?.performanceTrends && analytics.performanceTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.performanceTrends}>
                    <defs>
                      <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#111111" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#111111" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#666666" fontSize={10} tickLine={false} />
                    <YAxis stroke="#666666" fontSize={10} domain={[0, 100]} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E5E5', fontSize: '11px' }}
                    />
                    <Area type="monotone" dataKey="overallScore" stroke="#111111" strokeWidth={2} fillOpacity={1} fill="url(#scoreColor)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center bg-[#FAFAFA] rounded-xl border border-dashed border-[#E5E5E5] text-center p-6 space-y-2">
                  <TrendingUp className="w-6 h-6 text-gray-400" />
                  <p className="text-xs text-[#666666] font-medium">No completed interview sessions yet.</p>
                  <Link to="/interview/setup" className="text-xs font-semibold text-[#2563EB] hover:underline">
                    Take your first mock interview →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recommended Practice Box */}
          <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-2xs space-y-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-[#2563EB] font-mono font-semibold text-xs uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> RECOMMENDED PRACTICE
              </div>
              <h4 className="text-sm font-bold text-[#111111]">STAR Methodology Optimization</h4>
              <p className="text-xs text-[#666666] leading-relaxed bg-[#FAFAFA] p-4 rounded-xl border border-[#E5E5E5]">
                "{analytics?.recommendation || 'Practice explaining your technical projects using the STAR method (Situation, Task, Action, Result).'}"
              </p>
            </div>

            <div className="pt-4 border-t border-[#E5E5E5] space-y-2.5">
              <div className="flex items-center justify-between text-xs text-[#666666]">
                <span>Target Focus</span>
                <span className="font-semibold text-[#111111]">Technical Depth & Rationale</span>
              </div>
              <Link
                to="/interview/setup"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#F5F5F5] hover:bg-gray-100 text-[#111111] py-2 rounded-xl font-medium text-xs transition-colors border border-[#E5E5E5]"
              >
                Practice This Focus Area <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Interviews Table Section */}
        <div className="bg-white rounded-2xl border border-[#E5E5E5] shadow-2xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4">
            <div>
              <h3 className="text-sm font-bold text-[#111111]">Recent Interviews</h3>
              <p className="text-xs text-[#666666]">Your latest practice sessions and evaluation reports</p>
            </div>
            <Link to="/history" className="text-xs font-semibold text-[#2563EB] hover:underline flex items-center gap-1">
              View All History <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentInterviews.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#666666]">
                <thead className="bg-[#FAFAFA] text-[#111111] font-mono uppercase tracking-wider border-b border-[#E5E5E5]">
                  <tr>
                    <th className="py-3 px-4">Interview Title / Type</th>
                    <th className="py-3 px-4">Difficulty</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5]">
                  {recentInterviews.map((inv) => (
                    <tr key={inv.id} className="hover:bg-[#FAFAFA] transition-colors">
                      <td className="py-3.5 px-4 font-medium text-[#111111]">
                        {inv.title || `${inv.type} Interview`}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="bg-[#F5F5F5] text-[#111111] px-2 py-0.5 rounded font-mono text-[10px] border border-[#E5E5E5]">
                          {inv.difficulty}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#666666]">
                        {new Date(inv.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold border ${getScoreBadge(inv.overallScore)}`}>
                          {Math.round(inv.overallScore)}/100
                        </span>
                      </td>
                      <td className="py-3.5 px-4 capitalize text-[#666666]">
                        {inv.status.replace('_', ' ')}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={inv.status === 'completed' ? `/interviews/${inv.id}/results` : `/interview/${inv.id}`}
                          className="text-[#2563EB] hover:underline font-medium"
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
            <div className="py-8 text-center bg-[#FAFAFA] rounded-xl border border-dashed border-[#E5E5E5] space-y-2">
              <FileText className="w-6 h-6 text-gray-400 mx-auto" />
              <p className="text-xs text-[#666666] font-medium">No recent interviews found.</p>
              <Link to="/interview/setup" className="inline-block text-xs font-semibold text-[#2563EB] hover:underline">
                Create your first interview session →
              </Link>
            </div>
          )}
        </div>

      </div>
    </AppLayout>
  );
};
