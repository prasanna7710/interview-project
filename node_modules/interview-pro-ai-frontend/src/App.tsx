import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { ResumeUploadPage } from './pages/ResumeUploadPage';
import { ResumeAnalysisPage } from './pages/ResumeAnalysisPage';
import { InterviewSetupPage } from './pages/InterviewSetupPage';
import { InterviewPage } from './pages/InterviewPage';
import { InterviewResultsPage } from './pages/InterviewResultsPage';
import { InterviewHistoryPage } from './pages/InterviewHistoryPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';

// Coding Test Pages
import { CodingSetupPage } from './pages/CodingSetupPage';
import { CodingTestPage } from './pages/CodingTestPage';
import { CodingResultsPage } from './pages/CodingResultsPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Protected Dashboard & App Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/resume"
              element={
                <ProtectedRoute>
                  <ResumeUploadPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/resume/analysis/:id"
              element={
                <ProtectedRoute>
                  <ResumeAnalysisPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/interview/setup"
              element={
                <ProtectedRoute>
                  <InterviewSetupPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/interview/:id"
              element={
                <ProtectedRoute>
                  <InterviewPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/interviews/:id/results"
              element={
                <ProtectedRoute>
                  <InterviewResultsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/coding/setup"
              element={
                <ProtectedRoute>
                  <CodingSetupPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/coding/test/:id"
              element={
                <ProtectedRoute>
                  <CodingTestPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/coding/results/:id"
              element={
                <ProtectedRoute>
                  <CodingResultsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <InterviewHistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
