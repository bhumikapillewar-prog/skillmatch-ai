import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import AnalysisStudio from './components/AnalysisStudio';
import AnalysisResults from './components/AnalysisResults';
import HistoryView from './components/HistoryView';
import AuthModal from './components/AuthModal';
import PrivacyModal from './components/PrivacyModal';
import { useAuth } from './context/AuthContext';
import { api } from './services/api';

export default function App() {
  const { user, isAuthenticated, login, register } = useAuth();
  const [activeTab, setActiveTab] = useState('studio'); // 'studio' | 'results' | 'history'
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [savedAnalyses, setSavedAnalyses] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);

  // Load user's saved analyses whenever user changes or tab switches to history
  useEffect(() => {
    if (isAuthenticated) {
      loadHistory();
    } else {
      setSavedAnalyses([]);
    }
  }, [isAuthenticated, activeTab]);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await api.getAnalyses();
      if (res.success && res.data.analyses) {
        setSavedAnalyses(res.data.analyses);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Helper to ensure user session exists before analysis
  const ensureAuthenticated = async () => {
    if (isAuthenticated) return true;
    try {
      // Auto-provision demo candidate session for seamless one-click experience
      const demoEmail = 'candidate.demo@skillmatch.ai';
      const demoPass = 'SkillMatchDemo2026!';
      try {
        await login(demoEmail, demoPass);
      } catch {
        await register('Demo Candidate', demoEmail, demoPass, 'Full-Stack Developer');
      }
      return true;
    } catch (err) {
      setAuthModalOpen(true);
      return false;
    }
  };

  const handleStartAnalysis = async ({ mode, file, resumeText, jobDescription, jobTitle, jobCompany }) => {
    setIsAnalyzing(true);
    setAnalysisProgress('Sanitizing contact PII & parsing text...');

    try {
      await ensureAuthenticated();

      // Simulated animated milestones for feedback
      setTimeout(() => {
        setAnalysisProgress('Identifying key technical competencies & frameworks...');
      }, 700);

      setTimeout(() => {
        setAnalysisProgress('Auditing experience tenure & seniority match...');
      }, 1400);

      setTimeout(() => {
        setAnalysisProgress('Synthesizing grounded, actionable recommendations...');
      }, 2100);

      let res;
      if (mode === 'upload' && file) {
        const formData = new FormData();
        formData.append('resume', file);
        formData.append('jobDescription', jobDescription);
        if (jobTitle) formData.append('jobTitle', jobTitle);
        if (jobCompany) formData.append('jobCompany', jobCompany);
        formData.append('resumeSource', 'file_upload');

        res = await api.createAnalysisFormData(formData);
      } else {
        const payload = {
          resumeText,
          jobDescription,
          jobTitle: jobTitle || 'Target Role',
          jobCompany: jobCompany || '',
          resumeSource: 'text_paste',
        };
        res = await api.createAnalysisJson(payload);
      }

      if (res.success && res.data.analysis) {
        setCurrentAnalysis(res.data.analysis);
        setActiveTab('results');
        loadHistory();
      }
    } catch (err) {
      alert(`Analysis Error: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress('');
    }
  };

  const handleDeleteAnalysis = async (id) => {
    try {
      await api.deleteAnalysis(id);
      setSavedAnalyses((prev) => prev.filter((item) => item._id !== id));
      if (currentAnalysis && currentAnalysis._id === id) {
        setCurrentAnalysis(null);
        setActiveTab('studio');
      }
    } catch (err) {
      alert(`Could not delete analysis: ${err.message}`);
    }
  };

  const handleClearAllHistory = async () => {
    try {
      await api.clearAllAnalyses();
      setSavedAnalyses([]);
      if (currentAnalysis) {
        setCurrentAnalysis(null);
        setActiveTab('studio');
      }
    } catch (err) {
      alert(`Could not clear history: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openAuthModal={() => setAuthModalOpen(true)}
        openPrivacyModal={() => setPrivacyModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'studio' && (
          <AnalysisStudio
            onStartAnalysis={handleStartAnalysis}
            isAnalyzing={isAnalyzing}
            analysisProgress={analysisProgress}
          />
        )}

        {activeTab === 'results' && currentAnalysis && (
          <AnalysisResults
            analysis={currentAnalysis}
            onBack={() => setActiveTab('studio')}
            onDelete={handleDeleteAnalysis}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            analyses={savedAnalyses}
            loading={loadingHistory}
            onSelectAnalysis={(item) => {
              setCurrentAnalysis(item);
              setActiveTab('results');
            }}
            onDeleteAnalysis={handleDeleteAnalysis}
            onClearAll={handleClearAllHistory}
            onGoToStudio={() => setActiveTab('studio')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-8 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-400">SkillMatch AI</span>
            <span>•</span>
            <span>Privacy-First MERN Stack Resume Matcher</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setPrivacyModalOpen(true)}
              className="hover:text-slate-300 transition-colors"
            >
              Privacy Policy & Retention
            </button>
            <span>•</span>
            <span className="text-slate-600">Zero Model Training Guarantee</span>
          </div>
        </div>
      </footer>

      {/* Authentication Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* Privacy Policy Modal */}
      <PrivacyModal isOpen={privacyModalOpen} onClose={() => setPrivacyModalOpen(false)} />
    </div>
  );
}
