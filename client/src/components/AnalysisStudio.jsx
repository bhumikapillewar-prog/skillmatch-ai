import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Briefcase,
  Sparkles,
  AlertCircle,
  FileCheck,
  ShieldCheck,
  RotateCcw,
  Building,
} from 'lucide-react';
import { SAMPLE_RESUME, SAMPLE_JOBS } from '../utils/sampleData';

export default function AnalysisStudio({ onStartAnalysis, isAnalyzing, analysisProgress }) {
  const [resumeMode, setResumeMode] = useState('upload'); // 'upload' | 'paste'
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobCompany, setJobCompany] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelected = (file) => {
    const validExtensions = ['pdf', 'docx', 'doc', 'txt', 'md'];
    const ext = file.name.split('.').pop().toLowerCase();

    if (!validExtensions.includes(ext)) {
      setErrorMsg('Please upload a PDF, DOCX, or TXT file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('File size must be under 5 MB.');
      return;
    }

    setErrorMsg('');
    setResumeFile(file);
  };

  const loadSampleJob = (index) => {
    const selected = SAMPLE_JOBS[index];
    if (selected) {
      setJobTitle(selected.title);
      setJobCompany(selected.company);
      setJobDescription(selected.text);
    }
  };

  const loadSampleResume = () => {
    setResumeMode('paste');
    setResumeText(SAMPLE_RESUME);
    setResumeFile(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Validations
    if (resumeMode === 'upload' && !resumeFile) {
      setErrorMsg('Please select a resume file (PDF, DOCX, TXT) to upload.');
      return;
    }

    if (resumeMode === 'paste' && resumeText.trim().length < 40) {
      setErrorMsg('Please paste at least 40 characters of resume content.');
      return;
    }

    if (!jobDescription || jobDescription.trim().length < 40) {
      setErrorMsg('Please enter a comprehensive job description (at least 40 characters).');
      return;
    }

    onStartAnalysis({
      mode: resumeMode,
      file: resumeFile,
      resumeText,
      jobDescription,
      jobTitle,
      jobCompany,
    });
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      {/* Intro Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Grounded & Transparent AI Matcher</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Analyze Your Resume Against Any Job Role
        </h1>
        <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-2xl mx-auto">
          Upload your résumé and paste a target job description to receive an objective, mathematical match score, highlighted skill gaps, and verifiable improvement actions.
        </p>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-sm flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT COLUMN: RESUME INPUT */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 flex flex-col shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold text-white">1. Candidate Résumé</h3>
              </div>

              {/* Mode Toggle */}
              <div className="flex items-center space-x-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setResumeMode('upload')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    resumeMode === 'upload'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setResumeMode('paste')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    resumeMode === 'paste'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Paste Text
                </button>
              </div>
            </div>

            {/* Upload Area */}
            {resumeMode === 'upload' ? (
              <div className="flex-1 flex flex-col justify-center">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-blue-500 bg-blue-500/10'
                      : resumeFile
                      ? 'border-emerald-600/70 bg-emerald-950/20'
                      : 'border-slate-800 hover:border-slate-700 bg-slate-950/60'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.doc,.txt,.md"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileSelected(e.target.files[0]);
                      }
                    }}
                  />

                  {resumeFile ? (
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                        <FileCheck className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-semibold text-white break-all">{resumeFile.name}</span>
                      <span className="text-xs text-slate-400 mt-1">
                        {(resumeFile.size / 1024).toFixed(1)} KB • Ready to analyze
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setResumeFile(null);
                        }}
                        className="mt-3 text-xs text-red-400 hover:underline"
                      >
                        Remove and select another file
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 text-blue-400 flex items-center justify-center mb-3">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-semibold text-white">
                        Click or drag & drop résumé
                      </span>
                      <span className="text-xs text-slate-400 mt-1">
                        Supports PDF, DOCX, TXT (Max 5 MB)
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center space-x-1 text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>In-memory processing (Zero disk leaks)</span>
                  </div>
                  <button
                    type="button"
                    onClick={loadSampleResume}
                    className="text-blue-400 hover:underline font-medium"
                  >
                    Load Sample Resume Text
                  </button>
                </div>
              </div>
            ) : (
              /* Paste Resume Area */
              <div className="flex-1 flex flex-col">
                <textarea
                  rows={12}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste complete résumé text here (include technical skills, work history, titles, and dates)..."
                  className="w-full flex-1 p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 text-xs sm:text-sm font-mono focus:outline-none focus:border-blue-500 resize-none"
                />
                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                  <span>{resumeText.length} characters • ~{resumeText.split(/\s+/).filter(Boolean).length} words</span>
                  <button
                    type="button"
                    onClick={loadSampleResume}
                    className="text-blue-400 hover:underline font-medium"
                  >
                    Load Sample Resume
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: JOB DESCRIPTION */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 flex flex-col shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-white">2. Target Job Description</h3>
              </div>

              {/* Sample Job Presets */}
              <div className="flex items-center space-x-1 text-xs">
                <span className="text-slate-500 hidden sm:inline">Sample:</span>
                <button
                  type="button"
                  onClick={() => loadSampleJob(0)}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                >
                  Full-Stack
                </button>
                <button
                  type="button"
                  onClick={() => loadSampleJob(1)}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                >
                  Frontend
                </button>
                <button
                  type="button"
                  onClick={() => loadSampleJob(2)}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                >
                  Backend
                </button>
              </div>
            </div>

            {/* Optional Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Job Title (e.g. Senior MERN Engineer)"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={jobCompany}
                  onChange={(e) => setJobCompany(e.target.value)}
                  placeholder="Company (e.g. Acme Corp)"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Job Description Textarea */}
            <div className="flex-1 flex flex-col">
              <textarea
                rows={11}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the target job description, responsibilities, and requirements here..."
                className="w-full flex-1 p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 text-xs sm:text-sm font-sans focus:outline-none focus:border-blue-500 resize-none"
              />
              <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                <span>{jobDescription.length} characters</span>
                <span className="text-slate-500">Min. 40 characters recommended</span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit & Progress Bar */}
        <div className="pt-2">
          {isAnalyzing ? (
            <div className="p-6 rounded-2xl bg-slate-900 border border-blue-500/40 shadow-xl text-center">
              <div className="inline-flex items-center space-x-2 text-blue-400 font-semibold mb-3">
                <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                <span>{analysisProgress || 'Performing deep semantic match analysis...'}</span>
              </div>
              <div className="w-full max-w-md mx-auto bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-sky-400 animate-pulse w-3/4 rounded-full" />
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Sanitizing contact PII • Calculating transparent category weights • Grounding suggestions
              </p>
            </div>
          ) : (
            <button
              type="submit"
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-base shadow-xl shadow-blue-600/25 transition-all hover:scale-[1.005] active:scale-[0.99] flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-5 h-5 text-white" />
              <span>Run Transparent Match Analysis</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
