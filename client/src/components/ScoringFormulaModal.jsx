import React from 'react';
import { X, CheckCircle, Calculator, ShieldCheck } from 'lucide-react';

export default function ScoringFormulaModal({ isOpen, onClose, breakdown, explanation }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Transparent Scoring Formula</h3>
            <p className="text-xs text-slate-400">Deterministic, auditable, and unweighted by arbitrary bias.</p>
          </div>
        </div>

        {/* Formula Quote */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-300 font-mono mb-6 leading-relaxed">
          {explanation ||
            'Total Score (100 pts) = Tech Skills (40 pts) + Experience Tenure (30 pts) + Domain / Soft Skills (20 pts) + Education & Certs (10 pts)'}
        </div>

        <div className="space-y-4">
          {/* Tech Skills */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-white text-sm">1. Core Technical Competencies (40% Weight)</span>
              <span className="text-sm font-bold text-blue-400">
                {breakdown?.technicalSkills?.score || 0} / 40 pts
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-2">
              Measures the coverage ratio of required vs verified frameworks, languages, databases, and infrastructure tools.
            </p>
            <p className="text-xs text-slate-300 bg-slate-900 p-2.5 rounded-lg border border-slate-800/60">
              {breakdown?.technicalSkills?.explanation || 'Evaluated against required technical keywords in the job description.'}
            </p>
          </div>

          {/* Experience Depth */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-white text-sm">2. Professional Experience Depth (30% Weight)</span>
              <span className="text-sm font-bold text-indigo-400">
                {breakdown?.experienceDepth?.score || 0} / 30 pts
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-2">
              Compares candidate career tenure against the seniority level requested by the hiring team.
            </p>
            <p className="text-xs text-slate-300 bg-slate-900 p-2.5 rounded-lg border border-slate-800/60">
              {breakdown?.experienceDepth?.explanation || 'Compares candidate career tenure against role seniority level.'}
            </p>
          </div>

          {/* Domain & Soft Skills */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-white text-sm">3. Domain Knowledge & Collaboration (20% Weight)</span>
              <span className="text-sm font-bold text-emerald-400">
                {breakdown?.domainSoftSkills?.score || 0} / 20 pts
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-2">
              Evaluates leadership, agile methodologies, communication, code review, and team collaboration signals.
            </p>
            <p className="text-xs text-slate-300 bg-slate-900 p-2.5 rounded-lg border border-slate-800/60">
              {breakdown?.domainSoftSkills?.explanation || 'Evaluated against operational and interpersonal expectations.'}
            </p>
          </div>

          {/* Education & Certifications */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-white text-sm">4. Education & Certifications (10% Weight)</span>
              <span className="text-sm font-bold text-amber-400">
                {breakdown?.educationAndCerts?.score || 0} / 10 pts
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-2">
              Accounts for relevant degree coursework, industry credentials (e.g. AWS, GCP, CKA), or equivalent verified tenure.
            </p>
            <p className="text-xs text-slate-300 bg-slate-900 p-2.5 rounded-lg border border-slate-800/60">
              {breakdown?.educationAndCerts?.explanation || 'Accounts for degrees or technical credentials.'}
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-1.5 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Zero Hallucination Guarantee</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
