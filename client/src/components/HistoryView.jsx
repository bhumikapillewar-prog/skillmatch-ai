import React, { useState } from 'react';
import {
  History,
  Search,
  Building,
  Calendar,
  ChevronRight,
  Trash2,
  FileText,
  Sparkles,
  ArrowUpDown,
} from 'lucide-react';

export default function HistoryView({
  analyses = [],
  loading,
  onSelectAnalysis,
  onDeleteAnalysis,
  onClearAll,
  onGoToStudio,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');

  const filtered = analyses.filter((item) => {
    const term = searchTerm.toLowerCase();
    const titleMatch = item.jobTitle && item.jobTitle.toLowerCase().includes(term);
    const companyMatch = item.jobCompany && item.jobCompany.toLowerCase().includes(term);
    return titleMatch || companyMatch;
  });

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (score >= 70) return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    if (score >= 50) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <History className="w-6 h-6 text-blue-400" />
            <span>Saved Resume Analyses</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Revisit past match reports, track improvements, or purge records.
          </p>
        </div>

        {analyses.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm('Delete all saved analyses? This cannot be undone.')) {
                onClearAll();
              }
            }}
            className="text-xs text-red-400 hover:text-red-300 font-semibold px-3 py-1.5 rounded-lg border border-red-900/60 hover:bg-red-950/40 transition-colors"
          >
            Clear All History
          </button>
        )}
      </div>

      {/* Search & Filter Toolbar */}
      {analyses.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by role or company..."
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center space-x-2 self-end sm:self-auto text-xs text-slate-400">
            <span>Sort:</span>
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 flex items-center space-x-1"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-24 rounded-2xl bg-slate-900/50 border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        /* Analyses List */
        <div className="space-y-4">
          {filtered.map((item) => (
            <div
              key={item._id}
              onClick={() => onSelectAnalysis(item)}
              className="group p-5 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 cursor-pointer shadow-md hover:shadow-xl transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start space-x-4">
                {/* Score badge */}
                <div
                  className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center font-black border flex-shrink-0 ${getScoreColor(
                    item.overallScore
                  )}`}
                >
                  <span className="text-lg leading-none">{item.overallScore}%</span>
                  <span className="text-[9px] uppercase font-bold tracking-wider mt-0.5 opacity-80">Match</span>
                </div>

                {/* Details */}
                <div>
                  <h4 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                    {item.jobTitle || 'Target Role'}
                  </h4>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                    {item.jobCompany && (
                      <span className="flex items-center space-x-1">
                        <Building className="w-3.5 h-3.5 text-slate-500" />
                        <span>{item.jobCompany}</span>
                      </span>
                    )}
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{new Date(item.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>{item.resumeFileName}</span>
                    </span>
                  </div>

                  <div className="mt-2.5 flex items-center space-x-2">
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                      {item.matchedSkills?.length || 0} Matched Skills
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                      {item.missingSkills?.length || 0} Key Gaps
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Tier: {item.tier}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center space-x-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Delete this saved analysis?')) {
                      onDeleteAnalysis(item._id);
                    }
                  }}
                  className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
                  title="Delete analysis"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="flex items-center space-x-1 text-xs font-semibold text-blue-400 group-hover:text-blue-300">
                  <span>View Details</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 px-4 rounded-2xl bg-slate-900/60 border border-dashed border-slate-800">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">No Analyses Found</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
            {searchTerm
              ? `No analyses matched "${searchTerm}". Try a different filter.`
              : 'You haven’t performed any resume analyses yet. Run your first analysis in seconds!'}
          </p>
          <button
            onClick={onGoToStudio}
            className="mt-5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/20 transition-all"
          >
            Go to Match Studio
          </button>
        </div>
      )}
    </div>
  );
}
