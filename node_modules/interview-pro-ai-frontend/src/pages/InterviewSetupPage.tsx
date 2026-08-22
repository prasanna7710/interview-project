import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';
import { Resume } from '../types';
import {
  Video,
  Code,
  Users,
  BrainCircuit,
  FolderGit2,
  Sliders,
  CheckCircle2,
  ArrowRight,
  Loader2,
  FileText,
  Mic,
} from 'lucide-react';

export const InterviewSetupPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const defaultResumeId = searchParams.get('resumeId');

  const [type, setType] = useState<'Technical' | 'HR' | 'Behavioral' | 'Project' | 'Mixed'>('Technical');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [mode, setMode] = useState<'Text' | 'Voice' | 'VoiceText'>('VoiceText');
  const [enableFollowUps, setEnableFollowUps] = useState(true);
  const [evalCommunication, setEvalCommunication] = useState(true);
  const [evalConfidence, setEvalConfidence] = useState(true);

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>(defaultResumeId || '');
  const [isCreating, setIsCreating] = useState(false);
  const [isLoadingResumes, setIsLoadingResumes] = useState(true);

  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadResumes() {
      try {
        const res = await api.get('/resumes');
        setResumes(res.data.resumes || []);
        if (!selectedResumeId && res.data.resumes.length > 0) {
          setSelectedResumeId(res.data.resumes[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingResumes(false);
      }
    }
    loadResumes();
  }, []);

  const handleStartInterview = async () => {
    setIsCreating(true);
    try {
      const res = await api.post('/interviews', {
        type,
        difficulty,
        questionCount,
        mode,
        resumeId: selectedResumeId || undefined,
        options: {
          enableFollowUps,
          evalCommunication,
          evalConfidence,
        },
      });

      showToast('Interview session generated successfully!', 'success');
      navigate(`/interview/${res.data.interview.id}`);
    } catch (err: any) {
      showToast('Failed to create interview session.', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const types = [
    { id: 'Technical', title: 'Technical', desc: 'Code architecture, algorithms, and technical skills', icon: Code },
    { id: 'HR', title: 'HR & Culture', desc: 'Background, motivation, and culture fit', icon: Users },
    { id: 'Behavioral', title: 'Behavioral', desc: 'STAR methodology and situational problem solving', icon: BrainCircuit },
    { id: 'Project', title: 'Project Deep-Dive', desc: 'Detailed interrogation on your specific projects', icon: FolderGit2 },
    { id: 'Mixed', title: 'Mixed Comprehensive', desc: 'Balanced blend of all question types', icon: Sliders },
  ];

  return (
    <AppLayout title="Interview Setup" subtitle="Customize your AI mock interview parameters">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Step 1: Select Interview Type */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-[#111111]">1. Select Interview Type</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {types.map((t) => {
              const Icon = t.icon;
              const isSelected = type === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setType(t.id as any)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                    isSelected
                      ? 'border-[#2563EB] bg-blue-50/30'
                      : 'border-[#E5E5E5] hover:border-[#111111] bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-[#111111] text-white' : 'bg-[#F5F5F5] text-[#111111]'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />}
                  </div>
                  <h4 className="text-xs font-bold text-[#111111]">{t.title}</h4>
                  <p className="text-[11px] text-[#666666] leading-relaxed">{t.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 2: Resume Context & Difficulty */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Resume Selection */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-[#111111] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#2563EB]" /> 2. Resume Context
            </h3>
            {isLoadingResumes ? (
              <p className="text-xs text-[#666666]">Loading resumes...</p>
            ) : resumes.length > 0 ? (
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E5E5] text-xs outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
              >
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.fileName} (Uploaded {new Date(r.createdAt).toLocaleDateString()})
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                No resume uploaded. Interview will use general candidate profile skills.
              </div>
            )}
          </div>

          {/* Difficulty Selection */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-[#111111]">3. Difficulty Level</h3>
            <div className="grid grid-cols-3 gap-2">
              {(['Easy', 'Medium', 'Hard'] as const).map((d) => (
                <button
                  type="button"
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    difficulty === d
                      ? 'border-[#111111] bg-[#111111] text-white shadow-2xs'
                      : 'border-[#E5E5E5] text-[#111111] hover:bg-[#FAFAFA]'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step 3: Question Count & Mode */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-[#111111]">4. Number of Questions</h3>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 15, 20].map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setQuestionCount(c)}
                  className={`py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    questionCount === c
                      ? 'border-[#111111] bg-[#111111] text-white shadow-2xs'
                      : 'border-[#E5E5E5] text-[#111111] hover:bg-[#FAFAFA]'
                  }`}
                >
                  {c} Qs
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-[#111111] flex items-center gap-2">
              <Mic className="w-4 h-4 text-[#2563EB]" /> 5. Interview Mode
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'Text', label: 'Text Only' },
                { id: 'Voice', label: 'Voice Only' },
                { id: 'VoiceText', label: 'Voice + Text' },
              ].map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setMode(m.id as any)}
                  className={`py-2.5 px-2 rounded-xl border text-xs font-semibold transition-all ${
                    mode === m.id
                      ? 'border-[#111111] bg-[#111111] text-white shadow-2xs'
                      : 'border-[#E5E5E5] text-[#111111] hover:bg-[#FAFAFA]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step 4: Summary Card & Confirmation */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-[#111111]">Summary & Launch</h3>
          <div className="bg-[#FAFAFA] p-4 rounded-xl border border-[#E5E5E5] flex flex-wrap items-center justify-between gap-4 text-xs font-medium text-[#666666]">
            <div>Type: <strong className="text-[#111111]">{type}</strong></div>
            <div>Difficulty: <strong className="text-[#111111]">{difficulty}</strong></div>
            <div>Questions: <strong className="text-[#111111]">{questionCount}</strong></div>
            <div>Mode: <strong className="text-[#111111]">{mode}</strong></div>
          </div>

          <button
            type="button"
            onClick={handleStartInterview}
            disabled={isCreating}
            className="w-full flex items-center justify-center gap-2 bg-[#111111] hover:bg-black disabled:bg-gray-400 text-white py-3 rounded-xl font-bold text-xs shadow-2xs transition-all active:scale-[0.99]"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Generating AI Question Set...
              </>
            ) : (
              <>
                <Video className="w-4 h-4" /> Start Interview Now <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </div>
    </AppLayout>
  );
};
