import React from 'react';
import { Sparkles, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, FileText, ChevronRight } from 'lucide-react';
import StatusBadge from './StatusBadge';

const AIExplainerCard = ({ recommendation, onApprove, onReject, onOverride }) => {
  const {
    recommendationId,
    title,
    segment,
    campus,
    currentValue,
    recommendedValue,
    expectedFinancialImpact,
    confidenceScore,
    confidenceInterval,
    assumptions = [],
    constraints = [],
    keyDrivers = [],
    explanation,
    modelVersion,
    status,
    reviewedBy,
    overrideReason
  } = recommendation;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:border-sky-300 transition">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-sky-100 text-sky-700 rounded-lg">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-700">{recommendationId}</span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium">{segment}</span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium">{campus}</span>
            </div>
            <h4 className="text-base font-bold text-slate-900 mt-0.5">{title}</h4>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Main Grid */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pricing Impact Box */}
        <div className="p-4 bg-sky-50/60 rounded-xl border border-sky-100 space-y-3">
          <div>
            <span className="text-xs font-medium text-slate-500">Current Value:</span>
            <div className="text-sm font-semibold text-slate-700">{currentValue}</div>
          </div>
          <div>
            <span className="text-xs font-medium text-sky-700">AI Proposed Value:</span>
            <div className="text-base font-bold text-sky-900">{recommendedValue}</div>
          </div>
          <div className="pt-2 border-t border-sky-200/60 flex items-center justify-between">
            <span className="text-xs text-slate-600 font-medium">Expected Impact:</span>
            <span className="text-sm font-bold text-emerald-700">+${(expectedFinancialImpact || 0).toLocaleString()} / yr</span>
          </div>
        </div>

        {/* Confidence & Model Drivers */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center text-xs font-medium text-slate-600 mb-1">
              <span>AI Confidence Score</span>
              <span className="font-bold text-slate-900">{confidenceScore}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  confidenceScore >= 90 ? 'bg-emerald-500' : confidenceScore >= 80 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${confidenceScore}%` }}
              ></div>
            </div>
            {confidenceInterval && (
              <p className="text-xs text-slate-500 mt-1">
                Uplift Range: <span className="font-semibold text-slate-700">${confidenceInterval.minUplift?.toLocaleString()}</span> to <span className="font-semibold text-slate-700">${confidenceInterval.maxUplift?.toLocaleString()}</span>
              </p>
            )}
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Key Model Drivers:</span>
            <ul className="text-xs text-slate-600 mt-1 space-y-1">
              {keyDrivers.map((driver, idx) => (
                <li key={idx} className="flex items-center">
                  <ChevronRight className="w-3.5 h-3.5 text-sky-500 mr-1 flex-shrink-0" />
                  <span>{driver}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Assumptions & Governance */}
        <div className="space-y-3">
          <div>
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Assumptions & Constraints:</span>
            <div className="mt-1 space-y-1">
              {assumptions.slice(0, 2).map((a, idx) => (
                <div key={idx} className="text-xs text-slate-600 flex items-start">
                  <span className="mr-1.5 text-sky-600 font-bold">•</span>
                  <span>{a}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 mr-1" />
              {modelVersion}
            </span>
          </div>
        </div>
      </div>

      {/* Rationale & Evidence Explanation */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-700">
        <span className="font-semibold text-slate-900 mr-2">Evidence & Rationale:</span>
        {explanation}
      </div>

      {/* Reviewer Status / Action Controls */}
      <div className="p-4 bg-white border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
        {status !== 'Pending Action' ? (
          <div className="text-xs text-slate-600 flex items-center space-x-2">
            <span className="font-medium text-slate-900">Decision Recorded by:</span>
            <span className="font-semibold bg-slate-100 px-2 py-0.5 rounded">{reviewedBy || 'Authorized Reviewer'}</span>
            {overrideReason && (
              <span className="text-purple-700 font-medium italic">"{overrideReason}"</span>
            )}
          </div>
        ) : (
          <div className="w-full flex items-center justify-end space-x-3">
            <button
              onClick={() => onReject && onReject(recommendation)}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center transition"
            >
              <XCircle className="w-4 h-4 mr-1.5 text-rose-500" />
              Reject Proposal
            </button>
            <button
              onClick={() => onOverride && onOverride(recommendation)}
              className="px-3.5 py-1.5 rounded-lg border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-semibold flex items-center transition"
            >
              <AlertTriangle className="w-4 h-4 mr-1.5 text-purple-600" />
              Override with Reason
            </button>
            <button
              onClick={() => onApprove && onApprove(recommendation)}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center transition shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              Approve Recommendation
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIExplainerCard;
