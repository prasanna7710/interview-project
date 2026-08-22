import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';
import {
  UploadCloud,
  FileText,
  X,
  Sparkles,
  AlertCircle,
  Loader2,
  ArrowRight,
} from 'lucide-react';

export const ResumeUploadPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploaded' | 'analyzed' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resumeId, setResumeId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleFileSelect = (file: File) => {
    setErrorMsg(null);
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'pdf' && ext !== 'docx') {
      setErrorMsg('Invalid file type. Only PDF (.pdf) and Word (.docx) files are supported.');
      showToast('Only PDF and DOCX files are allowed.', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('File size exceeds 10 MB limit.');
      showToast('File size exceeds 10 MB limit.', 'error');
      return;
    }

    setSelectedFile(file);
    setUploadStatus('idle');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const [statusText, setStatusText] = useState<string>('Uploading resume...');
  const [progressPercent, setProgressPercent] = useState<number>(20);

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setErrorMsg(null);
    setStatusText('Uploading resume...');
    setProgressPercent(25);

    try {
      const formData = new FormData();
      formData.append('resume', selectedFile);

      // Step 1: Upload File
      const uploadRes = await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploadedResume = uploadRes.data.resume;
      setResumeId(uploadedResume.id);
      setIsUploading(false);
      setIsAnalyzing(true);
      setUploadStatus('uploaded');

      setStatusText('Reading resume & extracting text...');
      setProgressPercent(50);

      // Timeout step for visual feedback
      setTimeout(() => {
        setStatusText('Analyzing resume with AI...');
        setProgressPercent(85);
      }, 800);

      // Step 2: Trigger AI Analysis
      const analyzeRes = await api.post(`/resumes/${uploadedResume.id}/analyze`);
      setStatusText('Resume analysis completed.');
      setProgressPercent(100);
      setIsAnalyzing(false);
      setUploadStatus('analyzed');
      showToast('Resume analyzed successfully!', 'success');

      // Redirect to analysis details view
      navigate(`/resume/analysis/${analyzeRes.data.resume.id}`);
    } catch (err: any) {
      setIsUploading(false);
      setIsAnalyzing(false);
      setUploadStatus('error');
      const msg = err.response?.data?.error || 'Failed to upload and analyze resume.';
      setErrorMsg(msg);
      showToast(msg, 'error');
    }
  };

  return (
    <AppLayout title="Upload Resume" subtitle="Upload your resume to extract skills and generate personalized questions">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Instruction Header */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5E5E5] shadow-2xs space-y-2 text-center sm:text-left">
          <h2 className="text-xl font-extrabold text-[#111111] tracking-tight">Upload Your Professional Resume</h2>
          <p className="text-xs text-[#666666] leading-relaxed">
            Our AI parser will analyze your skills, work experience, education, and technical projects to generate tailored interview questions.
          </p>
        </div>

        {/* Dropzone Container */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-4 bg-white ${
            selectedFile ? 'border-[#2563EB] bg-blue-50/20' : 'border-[#E5E5E5] hover:border-[#111111] hover:bg-[#FAFAFA]'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
            accept=".pdf,.docx"
            className="hidden"
          />

          <div className="w-14 h-14 rounded-2xl bg-[#F5F5F5] text-[#111111] border border-[#E5E5E5] flex items-center justify-center">
            <UploadCloud className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-semibold text-[#111111]">
              Drag & drop your resume here, or <span className="text-[#2563EB] underline">browse files</span>
            </p>
            <p className="text-[11px] text-[#666666]">Supports PDF and DOCX files up to 10 MB</p>
          </div>
        </div>

        {/* Selected File Details Box */}
        {selectedFile && (
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E5E5E5] shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#F5F5F5] text-[#111111] rounded-xl border border-[#E5E5E5]">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#111111] truncate max-w-xs">{selectedFile.name}</h4>
                  <p className="text-[11px] text-[#666666]">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.name.split('.').pop()?.toUpperCase()}
                  </p>
                </div>
              </div>

              {!isUploading && !isAnalyzing && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                  className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Error state */}
            {errorMsg && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Progress / Status Indicators */}
            {(isUploading || isAnalyzing) && (
              <div className="space-y-2 bg-[#FAFAFA] p-4 rounded-xl border border-[#E5E5E5]">
                <div className="flex items-center justify-between text-xs font-medium text-[#111111]">
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#2563EB]" />
                    {statusText}
                  </span>
                  <span className="font-mono">{progressPercent}%</span>
                </div>
                <div className="w-full bg-[#E5E5E5] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#2563EB] h-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Analyze Action Button */}
            {!isUploading && !isAnalyzing && (
              <button
                type="button"
                onClick={handleUploadAndAnalyze}
                className="w-full flex items-center justify-center gap-2 bg-[#111111] hover:bg-black text-white font-medium py-2.5 rounded-xl transition-all shadow-2xs text-xs active:scale-[0.99]"
              >
                <Sparkles className="w-4 h-4 text-[#2563EB]" /> Analyze Resume with AI <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

      </div>
    </AppLayout>
  );
};
