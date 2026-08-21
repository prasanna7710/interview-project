import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';
import { AnalyticsData } from '../types';
import {
  BarChart3,
  TrendingUp,
  Award,
  AlertCircle,
  Sparkles,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { showToast } = useToast();

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await api.get('/analytics');
        setAnalytics(res.data);
      } catch (err) {
        showToast('Failed to load performance analytics.', 'error');
      } finally {
        setIsLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (isLoading) {
    return (
      <AppLayout title="Performance Analytics">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  const categoryAvgs = analytics?.categoryAverages || {
    technical: 82,
    communication: 78,
    quality: 80,
    confidence: 84,
    relevance: 86,
  };

  const categoryData = [
    { name: 'Technical', score: categoryAvgs.technical },
    { name: 'Answer Quality', score: categoryAvgs.quality },
    { name: 'Communication', score: categoryAvgs.communication },
    { name: 'Confidence', score: categoryAvgs.confidence },
    { name: 'Relevance', score: categoryAvgs.relevance },
  ];

  // Best & weakest area computation
  const sortedCategories = [...categoryData].sort((a, b) => b.score - a.score);
  const bestArea = sortedCategories[0];
  const weakestArea = sortedCategories[sortedCategories.length - 1];

  return (
    <AppLayout title="Performance Analytics" subtitle="Track score trends, skill categories, and targeted recommendations">
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Top Highlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Best Performing Area</span>
              <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-bold text-gray-900">{bestArea?.name || 'Technical'}</div>
            <div className="text-xs text-green-700 font-semibold">{bestArea?.score || 85}/100 Average Rating</div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Weakest Focus Area</span>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-bold text-gray-900">{weakestArea?.name || 'Communication'}</div>
            <div className="text-xs text-amber-700 font-semibold">{weakestArea?.score || 72}/100 Priority for Practice</div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Mock Sessions</span>
              <div className="p-2 bg-brand-50 text-brand-600 rounded-lg">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-bold text-gray-900">{analytics?.metrics.totalCompleted || 0} Sessions</div>
            <div className="text-xs text-gray-500">{analytics?.metrics.totalPracticeMinutes || 0} Total practice minutes</div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chart 1: Score over time */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-gray-900">Score Trend Over Time</h3>
              <p className="text-xs text-gray-500">Overall score trajectory across mock interviews</p>
            </div>

            <div className="h-64 w-full pt-4">
              {analytics?.performanceTrends && analytics.performanceTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.performanceTrends}>
                    <defs>
                      <linearGradient id="analyticsScoreColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={11} domain={[0, 100]} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0' }} />
                    <Area type="monotone" dataKey="overallScore" stroke="#2563EB" strokeWidth={3} fill="url(#analyticsScoreColor)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-50 rounded-xl text-xs text-gray-400">
                  Complete mock interviews to view score trends.
                </div>
              )}
            </div>
          </div>

          {/* Chart 2: Category Breakdown Bar Chart */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-gray-900">Category Averages</h3>
              <p className="text-xs text-gray-500">Breakdown by rubric criteria</p>
            </div>

            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis type="category" dataKey="name" stroke="#94A3B8" fontSize={11} width={100} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0' }} />
                  <Bar dataKey="score" fill="#2563EB" radius={[0, 8, 8, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* AI Targeted Recommendations Card */}
        <div className="bg-brand-50/60 p-6 rounded-2xl border border-brand-100 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-brand-700 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-brand-600" /> AI Practice Guidance
          </div>
          <p className="text-sm font-semibold text-gray-900">
            "{analytics?.recommendation || 'Practice explaining your projects using the STAR method (Situation, Task, Action, Result).'}"
          </p>
        </div>
      </div>
    </AppLayout>
  );
};
