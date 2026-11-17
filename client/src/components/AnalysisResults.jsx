import React, { useState } from 'react';
import {
  ArrowLeft,
  Download,
  Printer,
  Trash2,
  ShieldCheck,
  Building,
  Calendar,
  AlertCircle,
  FileText,
} from 'lucide-react';
import ScoreRadial from './ScoreRadial';
import ScoringFormulaModal from './ScoringFormulaModal';
import SkillsGrid from './SkillsGrid';
import ExperienceBreakdown from './ExperienceBreakdown';
import SuggestionsList from './SuggestionsList';

export default function AnalysisResults({
  analysis,
  onBack,
  onDelete,
}) {
  const [showFormulaModal, setShowFormulaModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!analysis) return null;

  const handleExportJson = () => {
    const filename = `SkillMatch_${analysis.jobTitle?.replace(/\s+/g, '_') || 'Analysis'}.json`;
    const blob = new Blob([JSON.stringify(analysis, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this analysis report permanently?')) {
      setIsDeleting(true);
      await onDelete(analysis._id);
    }
  };

  const piiRedacted = analysis.sanitizationReport || { emailsRedacted: 0, phonesRedacted: 0, addressesRedacted: 0 };
  const totalRedacted = (piiRedacted.emailsRedacted || 0) + (piiRedacted.phonesRedacted || 0) + (piiRedacted.addressesRedacted || 0);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Top Navigation & Action Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>New Analysis</span>
        </button>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportJson}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-semibold border border-red-800/80 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Target Role & Privacy Notice Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 text-xs text-slate-400 mb-1">
            {analysis.jobCompany && (
              <span className="flex items-center space-x-1 font-medium text-slate-300">
                <Building className="w-3.5 h-3.5 text-slate-500" />
                <span>{analysis.jobCompany}</span>
              </span>
            )}
            <span className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{new Date(analysis.createdAt || Date.now()).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
            </span>
            <span className="flex items-center space-x-1">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>{analysis.resumeFileName || 'Resume text'}</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {analysis.jobTitle || 'Target Role Alignment Report'}
          </h1>
        </div>

        {/* Privacy Redaction Pill */}
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs self-start md:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>
            {totalRedacted > 0
              ? `Privacy Guard: ${totalRedacted} contact items sanitized before AI scoring.`
              : 'Privacy Guard: Document processed directly in memory.'}
          </span>
        </div>
      </div>

      {/* Ethical Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-800/40 text-blue-300 text-xs flex items-start space-x-3 leading-relaxed">
        <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
        <span>
          <strong>Ethical & Advisory Notice: </strong>
          {analysis.disclaimer ||
            'SkillMatch AI recommendations are advisory and grounded in the input text. No hiring guarantees are made.'}
        </span>
      </div>

      {/* Scorecard Hero */}
      <ScoreRadial
        score={analysis.overallScore}
        tier={analysis.tier}
        categoryBreakdown={analysis.categoryBreakdown}
        onOpenFormula={() => setShowFormulaModal(true)}
      />

      {/* Skills Comparison Grid */}
      <SkillsGrid
        matchedSkills={analysis.matchedSkills}
        missingSkills={analysis.missingSkills}
        matchedSoft={analysis.matchedSoftSkills}
        missingSoft={analysis.missingSoftSkills}
      />

      {/* Experience Evaluation */}
      <ExperienceBreakdown experienceAnalysis={analysis.experienceAnalysis} />

      {/* Grounded Actionable Recommendations */}
      <SuggestionsList suggestions={analysis.suggestions} />

      {/* Transparent Formula Modal */}
      <ScoringFormulaModal
        isOpen={showFormulaModal}
        onClose={() => setShowFormulaModal(false)}
        breakdown={analysis.categoryBreakdown}
        explanation={analysis.formulaExplanation}
      />
    </div>
  );
}
