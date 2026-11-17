import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, Sparkles, Filter } from 'lucide-react';

export default function SkillsGrid({ matchedSkills = [], missingSkills = [], matchedSoft = [], missingSoft = [] }) {
  const [filter, setFilter] = useState('all'); // 'all' | 'matched' | 'missing'

  const totalMatched = matchedSkills.length + matchedSoft.length;
  const totalMissing = missingSkills.length + missingSoft.length;

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center space-x-2">
            <span>Competencies & Skill Alignment</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Keywords identified across technical stacks, tooling, and operational practices.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 self-stretch sm:self-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'all'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({totalMatched + totalMissing})
          </button>
          <button
            onClick={() => setFilter('matched')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'matched'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-emerald-400'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Matched ({totalMatched})</span>
          </button>
          <button
            onClick={() => setFilter('missing')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'missing'
                ? 'bg-amber-600 text-white shadow'
                : 'text-slate-400 hover:text-amber-400'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Gaps ({totalMissing})</span>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Core Technical Skills */}
        {(filter === 'all' || filter === 'matched' || filter === 'missing') && (
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Technical & Engineering Stack
            </div>
            <div className="flex flex-wrap gap-2.5">
              {/* Matched Tech */}
              {(filter === 'all' || filter === 'matched') &&
                matchedSkills.map((item, idx) => (
                  <span
                    key={`tech-match-${idx}`}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-700/60 text-emerald-300 text-xs font-medium shadow-sm hover:border-emerald-500 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>{item.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-900/60 text-emerald-300 font-mono">
                      Verified
                    </span>
                  </span>
                ))}

              {/* Missing Tech */}
              {(filter === 'all' || filter === 'missing') &&
                missingSkills.map((item, idx) => (
                  <span
                    key={`tech-miss-${idx}`}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-700/60 text-amber-300 text-xs font-medium shadow-sm hover:border-amber-500 transition-colors"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span>{item.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-900/60 text-amber-300 font-mono">
                      Gap
                    </span>
                  </span>
                ))}

              {matchedSkills.length === 0 && missingSkills.length === 0 && (
                <span className="text-xs text-slate-500 italic">No specific technical keywords tagged.</span>
              )}
            </div>
          </div>
        )}

        {/* Domain & Collaboration Skills */}
        {(matchedSoft.length > 0 || missingSoft.length > 0) && (
          <div className="pt-4 border-t border-slate-800">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Domain & Collaboration Competencies
            </div>
            <div className="flex flex-wrap gap-2.5">
              {(filter === 'all' || filter === 'matched') &&
                matchedSoft.map((item, idx) => (
                  <span
                    key={`soft-match-${idx}`}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-950/40 border border-blue-700/60 text-blue-300 text-xs font-medium shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                    <span>{item.name}</span>
                  </span>
                ))}

              {(filter === 'all' || filter === 'missing') &&
                missingSoft.map((item, idx) => (
                  <span
                    key={`soft-miss-${idx}`}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700 text-slate-300 text-xs font-medium shadow-sm"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>{item.name}</span>
                  </span>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
