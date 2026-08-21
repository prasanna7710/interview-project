import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
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
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-2 text-center sm:text-left">
          <h2 className="text-xl font-bold text-gray-900">Upload Your Professional Resume</h2>
          <p className="text-xs text-gray-600 leading-relaxed">
            Our AI parser will analyze your skills, work experience, education, and technical projects to generate tailored interview questions.
          </p>
        </div>

        {/* Dropzone Container */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition flex flex-col items-center justify-center gap-4 bg-white ${
            selectedFile ? 'border-brand-500 bg-brand-50/20' : 'border-gray-300 hover:border-brand-400 hover:bg-gray-50/50'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
            accept=".pdf,.docx"
            className="hidden"
          />

          <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 border border-brand-100 flex items-center justify-center shadow-2xs">
            <UploadCloud className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-semibold text-gray-900">
              Drag & drop your resume here, or <span className="text-brand-600 underline">browse files</span>
            </p>
            <p className="text-xs text-gray-500">Supports PDF and DOCX files up to 10 MB</p>
          </div>
        </div>

        {/* Selected File Details Box */}
        {selectedFile && (
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-brand-50 text-brand-600 rounded-xl border border-brand-100">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 truncate max-w-xs">{selectedFile.name}</h4>
                  <p className="text-xs text-gray-500">
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
                  className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
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
              <div className="space-y-2 bg-brand-50/60 p-4 rounded-xl border border-brand-100">
                <div className="flex items-center justify-between text-xs font-semibold text-brand-700">
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
                    {statusText}
                  </span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="w-full bg-brand-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-brand-600 h-full transition-all duration-500"
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
                className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-xl shadow-sm transition text-sm"
              >
                <Sparkles className="w-4 h-4" /> Analyze Resume with AI <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};
