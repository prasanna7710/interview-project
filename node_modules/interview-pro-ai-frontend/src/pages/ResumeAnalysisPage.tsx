import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';
import { Resume } from '../types';
import {
  FileText,
  Sparkles,
  Award,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Edit3,
  Video,
  Loader2,
  CheckCircle2,
  Save,
} from 'lucide-react';

export const ResumeAnalysisPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [resume, setResume] = useState<Resume | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [summary, setSummary] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    async function loadResume() {
      try {
        const res = await api.get(`/resumes/${id}`);
        setResume(res.data.resume);
        setSummary(res.data.resume.summary || '');
      } catch (err) {
        showToast('Failed to load resume analysis.', 'error');
      } finally {
        setIsLoading(false);
      }
    }
    if (id) loadResume();
  }, [id]);

  const handleSaveEdit = async () => {
    if (!id) return;
    setIsSaving(true);
    try {
      await api.put(`/resumes/${id}`, { summary });
      showToast('Resume summary updated.', 'success');
      setIsEditing(false);
    } catch (err) {
      showToast('Failed to update summary.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout title="Resume Analysis">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-6 h-6 text-[#111111] animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (!resume) {
    return (
      <AppLayout title="Resume Analysis">
        <div className="text-center py-12 space-y-4">
          <p className="text-[#666666] text-xs">Resume record not found.</p>
          <Link to="/resume" className="text-[#2563EB] font-semibold hover:underline text-xs">
            ← Upload a new resume
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Resume AI Analysis" subtitle="Review AI-extracted skills, projects, and work experience">
      <div className="space-y-6 max-w-5xl mx-auto">
        
        {/* Top Action Header */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#F5F5F5] text-[#111111] rounded-2xl border border-[#E5E5E5]">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-[#111111]">{resume.candidateName || resume.fileName}</h2>
                <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2 py-0.5 rounded font-mono font-medium border border-emerald-200 inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> AI PARSED
                </span>
              </div>
              <p className="text-xs text-[#666666] mt-0.5">
                File: {resume.fileName} • Uploaded {new Date(resume.createdAt).toLocaleDateString()} • {(resume.fileSize / 1024).toFixed(1)} KB
              </p>
              {(resume.email || resume.phone) && (
                <div className="flex items-center gap-4 text-xs text-[#666666] mt-1">
                  {resume.email && <span>📧 {resume.email}</span>}
                  {resume.phone && <span>📞 {resume.phone}</span>}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-[#111111] font-medium px-4 py-2 rounded-xl border border-[#E5E5E5] text-xs transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" /> {isEditing ? 'Cancel Edit' : 'Edit Summary'}
            </button>
            <Link
              to={`/interview/setup?resumeId=${resume.id}`}
              className="inline-flex items-center gap-2 bg-[#111111] hover:bg-black text-white font-medium px-4.5 py-2 rounded-xl shadow-2xs text-xs transition-all active:scale-[0.99]"
            >
              <Video className="w-3.5 h-3.5" /> Start Interview With This Resume
            </Link>
          </div>
        </div>

        {/* AI Summary Card */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#111111] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#2563EB]" /> AI Executive Summary
            </h3>
            {isEditing && (
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] hover:underline"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save Summary
              </button>
            )}
          </div>

          {isEditing ? (
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full p-3 rounded-xl border border-[#E5E5E5] text-xs outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
            />
          ) : (
            <p className="text-xs text-[#666666] leading-relaxed bg-[#FAFAFA] p-4 rounded-xl border border-[#E5E5E5]">
              {summary || 'No summary available for this resume.'}
            </p>
          )}
        </div>

        {/* Extracted Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Skills Card */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-[#111111] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#2563EB]" /> Technical & Core Skills ({resume.skills?.length || 0})
            </h3>
            <div className="flex flex-wrap gap-2">
              {resume.skills && resume.skills.length > 0 ? (
                resume.skills.map((s, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 bg-[#F5F5F5] text-[#111111] text-xs font-mono font-medium px-2.5 py-1 rounded-md border border-[#E5E5E5]"
                  >
                    {s.name}
                  </span>
                ))
              ) : (
                <p className="text-xs text-gray-400">No skills detected.</p>
              )}
            </div>
          </div>

          {/* Projects Card */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-[#111111] flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-[#2563EB]" /> Extracted Projects ({resume.projects?.length || 0})
            </h3>
            <div className="space-y-3">
              {resume.projects && resume.projects.length > 0 ? (
                resume.projects.map((p, idx) => (
                  <div key={idx} className="p-3.5 bg-[#FAFAFA] rounded-xl border border-[#E5E5E5] space-y-1">
                    <h4 className="text-xs font-bold text-[#111111]">{p.title}</h4>
                    <p className="text-xs text-[#666666]">{p.description}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400">No projects detected.</p>
              )}
            </div>
          </div>

          {/* Work Experience */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-[#111111] flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#2563EB]" /> Experience ({resume.experiences?.length || 0})
            </h3>
            <div className="space-y-3">
              {resume.experiences && resume.experiences.length > 0 ? (
                resume.experiences.map((exp, idx) => (
                  <div key={idx} className="p-3.5 bg-[#FAFAFA] rounded-xl border border-[#E5E5E5] space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-[#111111]">
                      <span>{exp.role}</span>
                      <span className="text-[#666666] font-normal">{exp.duration}</span>
                    </div>
                    <p className="text-xs text-[#2563EB] font-medium">{exp.company}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400">No experience records detected.</p>
              )}
            </div>
          </div>

          {/* Education */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-[#111111] flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#2563EB]" /> Education ({resume.educations?.length || 0})
            </h3>
            <div className="space-y-3">
              {resume.educations && resume.educations.length > 0 ? (
                resume.educations.map((ed, idx) => (
                  <div key={idx} className="p-3.5 bg-[#FAFAFA] rounded-xl border border-[#E5E5E5] space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-[#111111]">
                      <span>{ed.degree}</span>
                      <span className="text-[#666666] font-normal">{ed.year}</span>
                    </div>
                    <p className="text-xs text-[#666666]">{ed.institution}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400">No education records detected.</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </AppLayout>
  );
};
