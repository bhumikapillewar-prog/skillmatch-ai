import React from 'react';
import { Clock, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

export default function ExperienceBreakdown({ experienceAnalysis }) {
  if (!experienceAnalysis) return null;

  const {
    summary,
    candidateYears = 0,
    targetYears = 0,
    alignmentLevel = 'Moderate',
    highlightedStrengths = [],
    potentialGaps = [],
  } = experienceAnalysis;

  const isSatisfied = candidateYears >= targetYears;

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center space-x-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            <span>Experience & Seniority Evaluation</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Objective tenure and seniority alignment derived from work chronology.
          </p>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-xs font-semibold border ${
            isSatisfied
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
          }`}
        >
          {alignmentLevel} Fit
        </div>
      </div>

      {/* Tenure Comparison Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-5">
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Your Evidenced Experience
          </span>
          <div className="text-2xl font-black text-white mt-1">
            ~{candidateYears} <span className="text-sm font-normal text-slate-400">years</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Calculated from employment history & year ranges.</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Role Stated Requirement
          </span>
          <div className="text-2xl font-black text-white mt-1">
            {targetYears > 0 ? `${targetYears}+` : 'Not specified'} <span className="text-sm font-normal text-slate-400">years</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Extracted from target job qualifications.</p>
        </div>
      </div>

      {/* Summary Narrative */}
      <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 text-sm text-slate-300 leading-relaxed mb-6">
        {summary}
      </div>

      {/* Strengths and Gaps Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Highlighted Strengths */}
        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/40">
          <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider mb-2">
            <CheckCircle className="w-4 h-4" />
            <span>Notable Background Strengths</span>
          </div>
          <ul className="space-y-1.5">
            {highlightedStrengths.length > 0 ? (
              highlightedStrengths.map((str, idx) => (
                <li key={idx} className="text-xs text-slate-300 flex items-start space-x-2">
                  <span className="text-emerald-500 mt-0.5">•</span>
                  <span>{str}</span>
                </li>
              ))
            ) : (
              <li className="text-xs text-slate-400">Baseline software engineering experience detected.</li>
            )}
          </ul>
        </div>

        {/* Potential Gaps */}
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/40">
          <div className="flex items-center space-x-2 text-amber-400 font-semibold text-xs uppercase tracking-wider mb-2">
            <AlertCircle className="w-4 h-4" />
            <span>Areas to Clarify / Potential Gaps</span>
          </div>
          <ul className="space-y-1.5">
            {potentialGaps.length > 0 ? (
              potentialGaps.map((gap, idx) => (
                <li key={idx} className="text-xs text-slate-300 flex items-start space-x-2">
                  <span className="text-amber-500 mt-0.5">•</span>
                  <span>{gap}</span>
                </li>
              ))
            ) : (
              <li className="text-xs text-slate-400">No major experiential roadblocks identified.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
