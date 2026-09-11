import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const OverrideModal = ({ isOpen, onClose, onSubmit, recommendation }) => {
  const [overrideReason, setOverrideReason] = useState('');
  const [revisedValue, setRevisedValue] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !recommendation) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!overrideReason || overrideReason.trim().length < 5) {
      setError('A detailed mandatory justification reason is required to override AI recommendation.');
      return;
    }
    setError('');
    onSubmit(recommendation._id, 'Overridden', overrideReason, revisedValue);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center space-x-2 text-purple-700 font-bold">
            <AlertTriangle className="w-5 h-5" />
            <span>Override AI Recommendation</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4 bg-purple-50 p-3 rounded-lg border border-purple-100 text-xs text-purple-900">
          <p className="font-semibold">{recommendation.title}</p>
          <p className="text-purple-700 mt-0.5">AI Proposed: {recommendation.recommendedValue}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Revised Recommendation Value (Optional):
            </label>
            <input
              type="text"
              placeholder="e.g. $14,800 / yr (7% discount cap)"
              value={revisedValue}
              onChange={(e) => setRevisedValue(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mandatory Overriding Justification <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              placeholder="State the business rationale, market dynamics, or special guardian context requiring this override..."
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
            ></textarea>
            <p className="text-xs text-slate-400 mt-1">This decision will be permanently recorded in the append-only audit trail.</p>
          </div>

          {error && <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-medium">{error}</div>}

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-semibold shadow-sm transition"
            >
              Submit Override & Audit Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OverrideModal;
