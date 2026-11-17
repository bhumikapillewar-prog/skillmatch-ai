import React from 'react';
import { HelpCircle, ChevronRight, Award } from 'lucide-react';

export default function ScoreRadial({ score, tier, categoryBreakdown, onOpenFormula }) {
  // SVG circle calculation
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const safeScore = Math.min(100, Math.max(0, score || 0));
  const strokeDashoffset = circumference - (safeScore / 100) * circumference;

  let strokeColor = '#3b82f6'; // blue
  let glowColor = 'rgba(59, 130, 246, 0.3)';
  let tierBadgeBg = 'bg-blue-500/10 border-blue-500/30 text-blue-400';

  if (safeScore >= 85) {
    strokeColor = '#10b981'; // emerald
    glowColor = 'rgba(16, 185, 129, 0.3)';
    tierBadgeBg = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
  } else if (safeScore >= 70) {
    strokeColor = '#3b82f6'; // blue
    glowColor = 'rgba(59, 130, 246, 0.3)';
    tierBadgeBg = 'bg-blue-500/10 border-blue-500/30 text-blue-400';
  } else if (safeScore >= 50) {
    strokeColor = '#f59e0b'; // amber
    glowColor = 'rgba(245, 158, 11, 0.3)';
    tierBadgeBg = 'bg-amber-500/10 border-amber-500/30 text-amber-400';
  } else {
    strokeColor = '#f43f5e'; // rose
    glowColor = 'rgba(244, 63, 94, 0.3)';
    tierBadgeBg = 'bg-rose-500/10 border-rose-500/30 text-rose-400';
  }

  const tech = categoryBreakdown?.technicalSkills || { score: 0, weight: 40 };
  const exp = categoryBreakdown?.experienceDepth || { score: 0, weight: 30 };
  const soft = categoryBreakdown?.domainSoftSkills || { score: 0, weight: 20 };
  const edu = categoryBreakdown?.educationAndCerts || { score: 0, weight: 10 };

  return (
    <div className="relative rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-8 shadow-xl">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Radial Meter */}
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative w-40 h-40 flex items-center justify-center flex-shrink-0">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
              {/* Background Track */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke="#1e293b"
                strokeWidth="12"
                fill="transparent"
              />
              {/* Animated Progress Circle */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke={strokeColor}
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                style={{
                  filter: `drop-shadow(0 0 8px ${glowColor})`,
                  transition: 'stroke-dashoffset 1s ease-in-out',
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-extrabold text-white tracking-tight">{safeScore}%</span>
              <span className="text-xs uppercase font-medium text-slate-400 tracking-wider mt-0.5">Match</span>
            </div>
          </div>

          {/* Tier and Description */}
          <div className="text-center sm:text-left">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border mb-2.5 backdrop-blur-sm"
              style={{ backgroundColor: `${glowColor.replace('0.3', '0.1')}`, borderColor: strokeColor }}>
              <Award className="w-3.5 h-3.5" style={{ color: strokeColor }} />
              <span style={{ color: strokeColor }}>{tier}</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Overall Alignment Score</h2>
            <p className="text-sm text-slate-400 mt-1 max-w-md">
              Calculated via multi-factor evaluation of technical keywords, verified career tenure, domain tools, and education alignment.
            </p>
            <button
              onClick={onOpenFormula}
              className="mt-3 inline-flex items-center space-x-1 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>How is this score calculated? (View formula breakdown)</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 4 Category Score Pills */}
        <div className="w-full lg:w-auto grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <div className="text-xs text-slate-400 font-medium">Core Tech Skills</div>
            <div className="text-lg font-bold text-white mt-0.5">
              {tech.score}<span className="text-xs text-slate-500 font-normal">/{tech.weight} pts</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.round((tech.score / tech.weight) * 100)}%` }}
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <div className="text-xs text-slate-400 font-medium">Experience Depth</div>
            <div className="text-lg font-bold text-white mt-0.5">
              {exp.score}<span className="text-xs text-slate-500 font-normal">/{exp.weight} pts</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.round((exp.score / exp.weight) * 100)}%` }}
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <div className="text-xs text-slate-400 font-medium">Domain & Soft Skills</div>
            <div className="text-lg font-bold text-white mt-0.5">
              {soft.score}<span className="text-xs text-slate-500 font-normal">/{soft.weight} pts</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.round((soft.score / soft.weight) * 100)}%` }}
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <div className="text-xs text-slate-400 font-medium">Education & Certs</div>
            <div className="text-lg font-bold text-white mt-0.5">
              {edu.score}<span className="text-xs text-slate-500 font-normal">/{edu.weight} pts</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.round((edu.score / edu.weight) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
