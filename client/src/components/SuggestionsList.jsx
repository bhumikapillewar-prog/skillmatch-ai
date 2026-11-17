import React from 'react';
import { Lightbulb, ArrowUpRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function SuggestionsList({ suggestions = [] }) {
  if (!suggestions || suggestions.length === 0) return null;

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-500/10 border-red-500/30 text-red-400';
      case 'Medium':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
      case 'Low':
      default:
        return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
    }
  };

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center space-x-2">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            <span>Targeted Resume Enhancements</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Grounded recommendations to align your genuine experience with the target job profile.
          </p>
        </div>
        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-800 text-[11px] text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Grounded in your text</span>
        </div>
      </div>

      <div className="space-y-4">
        {suggestions.map((item, idx) => (
          <div
            key={idx}
            className="p-5 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-colors"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                {item.category || 'General Advice'}
              </span>
              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getPriorityStyle(
                  item.priority
                )}`}
              >
                {item.priority} Priority
              </span>
            </div>

            <div className="text-sm font-medium text-white mb-2 leading-snug">
              {item.action}
            </div>

            <div className="text-xs text-slate-400 bg-slate-900/60 p-3 rounded-lg border border-slate-800/40 leading-relaxed">
              <span className="text-blue-400 font-semibold">Strategic Rationale: </span>
              {item.rationale}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
