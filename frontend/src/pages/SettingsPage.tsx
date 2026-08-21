import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';
import { Settings, Save, Loader2, Bell, Shield, Sliders } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [defaultInterviewType, setDefaultInterviewType] = useState('Technical');
  const [defaultDifficulty, setDefaultDifficulty] = useState('Medium');
  const [defaultQuestionCount, setDefaultQuestionCount] = useState(5);
  const [defaultMode, setDefaultMode] = useState('VoiceText');
  const [ttsSpeed, setTtsSpeed] = useState(1.0);
  const [emailReminders, setEmailReminders] = useState(true);
  const [performanceReports, setPerformanceReports] = useState(true);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await api.get('/settings');
        if (res.data.settings) {
          const s = res.data.settings;
          setDefaultInterviewType(s.defaultInterviewType || 'Technical');
          setDefaultDifficulty(s.defaultDifficulty || 'Medium');
          setDefaultQuestionCount(s.defaultQuestionCount || 5);
          setDefaultMode(s.defaultMode || 'VoiceText');
          setTtsSpeed(s.ttsSpeed || 1.0);
          setEmailReminders(s.emailReminders !== false);
          setPerformanceReports(s.performanceReports !== false);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await api.put('/settings', {
        defaultInterviewType,
        defaultDifficulty,
        defaultQuestionCount,
        defaultMode,
        ttsSpeed,
        emailReminders,
        performanceReports,
      });

      showToast('Interview settings updated successfully.', 'success');
    } catch (err) {
      showToast('Failed to save settings.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout title="Settings">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Settings & Preferences" subtitle="Manage default interview options, voice preferences, and privacy">
      <form onSubmit={handleSaveSettings} className="space-y-6 max-w-4xl mx-auto">
        {/* Header Action */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-card flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Application Preferences</h2>
            <p className="text-xs text-gray-500">Configure default values for your mock sessions</p>
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm text-sm transition"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Settings
          </button>
        </div>

        {/* Interview Defaults */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-brand-600" /> Default Interview Preferences
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Default Interview Type</label>
              <select
                value={defaultInterviewType}
                onChange={(e) => setDefaultInterviewType(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              >
                <option value="Technical">Technical</option>
                <option value="HR">HR & Culture</option>
                <option value="Behavioral">Behavioral</option>
                <option value="Project">Project Deep-Dive</option>
                <option value="Mixed">Mixed Comprehensive</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Default Difficulty</label>
              <select
                value={defaultDifficulty}
                onChange={(e) => setDefaultDifficulty(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Default Question Count</label>
              <select
                value={defaultQuestionCount}
                onChange={(e) => setDefaultQuestionCount(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              >
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
                <option value={15}>15 Questions</option>
                <option value={20}>20 Questions</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">AI Voice Reading Speed</label>
              <select
                value={ttsSpeed}
                onChange={(e) => setTtsSpeed(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              >
                <option value={0.8}>0.8x (Slower)</option>
                <option value={1.0}>1.0x (Normal Cadence)</option>
                <option value={1.2}>1.2x (Faster)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications & Privacy */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-4 h-4 text-brand-600" /> Notifications & Reminders
          </h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200 cursor-pointer">
              <span className="text-xs font-semibold text-gray-800">Email Interview Reminders</span>
              <input
                type="checkbox"
                checked={emailReminders}
                onChange={(e) => setEmailReminders(e.target.checked)}
                className="h-4 w-4 text-brand-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200 cursor-pointer">
              <span className="text-xs font-semibold text-gray-800">Weekly Performance Summary Reports</span>
              <input
                type="checkbox"
                checked={performanceReports}
                onChange={(e) => setPerformanceReports(e.target.checked)}
                className="h-4 w-4 text-brand-600 rounded"
              />
            </label>
          </div>
        </div>
      </form>
    </AppLayout>
  );
};
