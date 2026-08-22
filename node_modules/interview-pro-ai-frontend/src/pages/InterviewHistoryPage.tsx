import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';
import { Interview } from '../types';
import {
  Search,
  FileText,
  ChevronRight,
  Video,
  Loader2,
  Code,
} from 'lucide-react';

export const InterviewHistoryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'interviews' | 'coding'>('interviews');
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [codingTests, setCodingTests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');

  const { showToast } = useToast();

  useEffect(() => {
    async function loadHistory() {
      try {
        const [invRes, codRes] = await Promise.allSettled([
          api.get('/interviews'),
          api.get('/coding/history'),
        ]);

        if (invRes.status === 'fulfilled') {
          setInterviews(invRes.value.data.interviews || []);
        }
        if (codRes.status === 'fulfilled') {
          setCodingTests(codRes.value.data.tests || []);
        }
      } catch (err) {
        showToast('Failed to load history.', 'error');
      } finally {
        setIsLoading(false);
      }
    }
    loadHistory();
  }, []);

  const filteredInterviews = interviews
    .filter((inv) => {
      const matchesSearch = inv.title.toLowerCase().includes(searchQuery.toLowerCase()) || inv.type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === 'All' || inv.type === selectedType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === 'score') {
        return b.overallScore - a.overallScore;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const getScoreBadge = (score: number) => {
    if (score >= 85) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (score >= 70) return 'bg-blue-50 text-[#2563EB] border-blue-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
  };

  if (isLoading) {
    return (
      <AppLayout title="Practice History">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-6 h-6 text-[#111111] animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Practice History" subtitle="Review past mock interview sessions and coding test performance">
      <div className="space-y-6 max-w-6xl mx-auto">
        
        {/* Main Tab Switcher */}
        <div className="flex border border-[#E5E5E5] bg-white rounded-2xl p-1.5 shadow-2xs gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('interviews')}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'interviews'
                ? 'bg-[#111111] text-white shadow-2xs'
                : 'text-[#666666] hover:bg-[#FAFAFA]'
            }`}
          >
            <Video className="w-3.5 h-3.5" /> AI Mock Interviews ({interviews.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('coding')}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'coding'
                ? 'bg-[#111111] text-white shadow-2xs'
                : 'text-[#666666] hover:bg-[#FAFAFA]'
            }`}
          >
            <Code className="w-3.5 h-3.5" /> Coding Challenges ({codingTests.length})
          </button>
        </div>

        {activeTab === 'interviews' ? (
          <>
            {/* Search & Filter Controls Header */}
            <div className="bg-white p-5 rounded-2xl border border-[#E5E5E5] shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search history by title or type..."
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-[#E5E5E5] text-xs outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                {/* Filter Pills */}
                <div className="flex items-center gap-1 bg-[#F5F5F5] p-1 rounded-xl text-xs font-medium border border-[#E5E5E5]">
                  {['All', 'Technical', 'HR', 'Behavioral', 'Project', 'Mixed'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setSelectedType(t)}
                      className={`px-3 py-1 rounded-lg transition-colors ${
                        selectedType === t ? 'bg-white text-[#111111] font-bold shadow-2xs' : 'text-[#666666] hover:text-[#111111]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 rounded-xl border border-[#E5E5E5] text-xs font-semibold text-[#111111] outline-none"
                >
                  <option value="date">Sort by Date</option>
                  <option value="score">Sort by Score</option>
                </select>
              </div>
            </div>

            {/* History Table */}
            <div className="bg-white rounded-2xl border border-[#E5E5E5] shadow-2xs overflow-hidden">
              {filteredInterviews.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-[#666666]">
                    <thead className="bg-[#FAFAFA] text-[#111111] font-mono uppercase tracking-wider border-b border-[#E5E5E5]">
                      <tr>
                        <th className="py-3.5 px-5">Session Title</th>
                        <th className="py-3.5 px-5">Type</th>
                        <th className="py-3.5 px-5">Difficulty</th>
                        <th className="py-3.5 px-5">Date</th>
                        <th className="py-3.5 px-5">Duration</th>
                        <th className="py-3.5 px-5">Overall Score</th>
                        <th className="py-3.5 px-5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E5E5]">
                      {filteredInterviews.map((inv) => (
                        <tr key={inv.id} className="hover:bg-[#FAFAFA] transition-colors">
                          <td className="py-4 px-5 font-bold text-[#111111]">{inv.title}</td>
                          <td className="py-4 px-5 font-medium text-[#2563EB]">{inv.type}</td>
                          <td className="py-4 px-5">
                            <span className="bg-[#F5F5F5] text-[#111111] px-2.5 py-0.5 rounded font-mono text-[10px] border border-[#E5E5E5]">
                              {inv.difficulty}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-[#666666]">{new Date(inv.createdAt).toLocaleDateString()}</td>
                          <td className="py-4 px-5 text-[#666666]">{Math.round(inv.durationSec / 60)} mins</td>
                          <td className="py-4 px-5">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-mono font-bold border ${getScoreBadge(inv.overallScore)}`}>
                              {Math.round(inv.overallScore)}/100
                            </span>
                          </td>
                          <td className="py-4 px-5 text-right">
                            <Link
                              to={inv.status === 'completed' ? `/interviews/${inv.id}/results` : `/interview/${inv.id}`}
                              className="text-[#2563EB] font-semibold hover:underline inline-flex items-center gap-1"
                            >
                              {inv.status === 'completed' ? 'View Report' : 'Continue'} <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-16 text-center space-y-3 bg-[#FAFAFA]">
                  <FileText className="w-8 h-8 text-gray-400 mx-auto" />
                  <p className="text-xs font-semibold text-[#111111]">No matching interview sessions found.</p>
                  <Link to="/interview/setup" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] hover:underline">
                    <Video className="w-3.5 h-3.5" /> Start a New Interview
                  </Link>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Coding Test History Table */
          <div className="bg-white rounded-2xl border border-[#E5E5E5] shadow-2xs overflow-hidden">
            {codingTests.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#666666]">
                  <thead className="bg-[#FAFAFA] text-[#111111] font-mono uppercase tracking-wider border-b border-[#E5E5E5]">
                    <tr>
                      <th className="py-3.5 px-5">Test Date</th>
                      <th className="py-3.5 px-5">Language</th>
                      <th className="py-3.5 px-5">Difficulty</th>
                      <th className="py-3.5 px-5">Questions</th>
                      <th className="py-3.5 px-5">Accuracy</th>
                      <th className="py-3.5 px-5">Score</th>
                      <th className="py-3.5 px-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E5]">
                    {codingTests.map((ct) => (
                      <tr key={ct.id} className="hover:bg-[#FAFAFA] transition-colors">
                        <td className="py-4 px-5 text-[#111111] font-medium">{new Date(ct.createdAt).toLocaleDateString()}</td>
                        <td className="py-4 px-5 font-bold text-[#2563EB]">{ct.language}</td>
                        <td className="py-4 px-5">
                          <span className="bg-[#F5F5F5] text-[#111111] px-2.5 py-0.5 rounded font-mono text-[10px] border border-[#E5E5E5]">
                            {ct.difficulty}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-[#111111] font-semibold">{ct.totalQuestions} Questions</td>
                        <td className="py-4 px-5 text-emerald-700 font-mono font-bold">{ct.accuracy}%</td>
                        <td className="py-4 px-5">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-mono font-bold border ${getScoreBadge(ct.score)}`}>
                            {Math.round(ct.score)}%
                          </span>
                        </td>
                        <td className="py-4 px-5 text-right">
                          <Link
                            to={`/coding/results/${ct.id}`}
                            className="text-[#2563EB] font-semibold hover:underline inline-flex items-center gap-1"
                          >
                            View Performance <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-16 text-center space-y-3 bg-[#FAFAFA]">
                <Code className="w-8 h-8 text-gray-400 mx-auto" />
                <p className="text-xs font-semibold text-[#111111]">No completed coding tests found.</p>
                <Link to="/coding/setup" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] hover:underline">
                  <Code className="w-3.5 h-3.5" /> Take an Optional Coding Test
                </Link>
              </div>
            )}
          </div>
        )}

      </div>
    </AppLayout>
  );
};
