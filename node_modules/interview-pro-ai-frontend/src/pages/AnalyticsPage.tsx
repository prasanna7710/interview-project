import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';
import { AnalyticsData } from '../types';
import {
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
          <Loader2 className="w-6 h-6 text-[#111111] animate-spin" />
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
          <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-[#666666] uppercase tracking-wider">Best Performing Area</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-extrabold text-[#111111]">{bestArea?.name || 'Technical'}</div>
            <div className="text-xs text-emerald-700 font-mono font-semibold">{bestArea?.score || 85}/100 Average Rating</div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-[#666666] uppercase tracking-wider">Weakest Focus Area</span>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg border border-amber-100">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-extrabold text-[#111111]">{weakestArea?.name || 'Communication'}</div>
            <div className="text-xs text-amber-700 font-mono font-semibold">{weakestArea?.score || 72}/100 Priority for Practice</div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-[#666666] uppercase tracking-wider">Total Mock Sessions</span>
              <div className="p-2 bg-[#F5F5F5] text-[#111111] rounded-lg border border-[#E5E5E5]">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-extrabold text-[#111111] font-mono">{analytics?.metrics.totalCompleted || 0} Sessions</div>
            <div className="text-xs text-[#666666] font-mono">{analytics?.metrics.totalPracticeMinutes || 0} Total practice mins</div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chart 1: Score over time */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-2xs space-y-4">
            <div className="border-b border-[#E5E5E5] pb-3">
              <h3 className="text-sm font-bold text-[#111111]">Score Trend Over Time</h3>
              <p className="text-xs text-[#666666]">Overall score trajectory across mock interviews</p>
            </div>

            <div className="h-64 w-full pt-2">
              {analytics?.performanceTrends && analytics.performanceTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.performanceTrends}>
                    <defs>
                      <linearGradient id="analyticsScoreColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#111111" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#111111" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#666666" fontSize={10} tickLine={false} />
                    <YAxis stroke="#666666" fontSize={10} domain={[0, 100]} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E5E5', fontSize: '11px' }} />
                    <Area type="monotone" dataKey="overallScore" stroke="#111111" strokeWidth={2} fill="url(#analyticsScoreColor)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center bg-[#FAFAFA] rounded-xl border border-dashed border-[#E5E5E5] text-xs text-[#666666]">
                  Complete mock interviews to view score trends.
                </div>
              )}
            </div>
          </div>

          {/* Chart 2: Category Breakdown Bar Chart */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-2xs space-y-4">
            <div className="border-b border-[#E5E5E5] pb-3">
              <h3 className="text-sm font-bold text-[#111111]">Category Averages</h3>
              <p className="text-xs text-[#666666]">Breakdown by rubric criteria</p>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} stroke="#666666" fontSize={10} tickLine={false} />
                  <YAxis type="category" dataKey="name" stroke="#666666" fontSize={10} width={90} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E5E5', fontSize: '11px' }} />
                  <Bar dataKey="score" fill="#111111" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* AI Targeted Recommendations Card */}
        <div className="bg-[#FAFAFA] p-6 rounded-2xl border border-[#E5E5E5] space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#2563EB] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> AI PRACTICE GUIDANCE
          </div>
          <p className="text-xs sm:text-sm font-semibold text-[#111111] leading-relaxed">
            "{analytics?.recommendation || 'Practice explaining your projects using the STAR method (Situation, Task, Action, Result).'}"
          </p>
        </div>

      </div>
    </AppLayout>
  );
};
