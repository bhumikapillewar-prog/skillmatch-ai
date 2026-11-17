import React from 'react';
import { X, ShieldCheck, Lock, Trash2, EyeOff, Server, Database } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function PrivacyModal({ isOpen, onClose }) {
  const { user, deleteAccount, isAuthenticated } = useAuth();

  if (!isOpen) return null;

  const handleDeleteMyAccount = async () => {
    if (
      window.confirm(
        'WARNING: This will permanently delete your account and all associated resume evaluations. This action cannot be undone. Are you sure?'
      )
    ) {
      await deleteAccount();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">Privacy, Security & Data Handling</h3>
            <p className="text-xs text-slate-400">Our architecture guarantees transparency and strict data isolation.</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Card 1: Processing */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start space-x-3">
            <Server className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-white">1. Direct In-Memory Document Processing</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Uploaded resumes (PDF, DOCX, TXT) are read directly from memory buffers. Files are never saved to unencrypted temporary disk storage or external bucket dumps.
              </p>
            </div>
          </div>

          {/* Card 2: PII Redaction */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start space-x-3">
            <EyeOff className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-white">2. Automatic PII Sanitization</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Before any text is evaluated or logged, high-risk contact details (phone numbers, physical addresses, government IDs, and direct personal emails) are masked with privacy tokens. Only professional competencies and career history are analyzed.
              </p>
            </div>
          </div>

          {/* Card 3: Zero AI Training */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start space-x-3">
            <Lock className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-white">3. Zero Model Training Policy</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Your résumé data, job descriptions, and analysis outputs are never shared with public model pools or used to train or fine-tune AI foundation models.
              </p>
            </div>
          </div>

          {/* Card 4: TTL Deletion */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start space-x-3">
            <Database className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-white">4. 90-Day Automated Data Retention (TTL)</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Saved analyses are indexed with automatic MongoDB TTL (Time-To-Live) expiration to ensure old records are permanently purged after 90 days, unless manually deleted earlier.
              </p>
            </div>
          </div>
        </div>

        {/* Right to be forgotten / Delete Account */}
        {isAuthenticated && (
          <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-red-400 block">GDPR & Right to be Forgotten</span>
              <span className="text-xs text-slate-400">Permanently purge your account and all evaluation history.</span>
            </div>
            <button
              onClick={handleDeleteMyAccount}
              className="px-3.5 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/80 text-red-300 text-xs font-semibold transition-colors flex items-center space-x-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Entire Account</span>
            </button>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
