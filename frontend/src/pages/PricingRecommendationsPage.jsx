import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import AIExplainerCard from '../components/AIExplainerCard';
import OverrideModal from '../components/OverrideModal';
import { Sparkles, Sliders, ShieldCheck, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

const PricingRecommendationsPage = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state for generating custom AI recommendations
  const [segment, setSegment] = useState('Tuition Fees');
  const [campus, setCampus] = useState('Oakridge Main Campus');
  const [currentPrice, setCurrentPrice] = useState(14500);
  const [marginalCost, setMarginalCost] = useState(7000);
  const [capacityUtilization, setCapacityUtilization] = useState(94);
  const [generating, setGenerating] = useState(false);

  // Override Modal
  const [activeRec, setActiveRec] = useState(null);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/recommendations');
      setRecommendations(res.data.items || []);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      setGenerating(true);
      await api.post('/recommendations/generate', {
        segment,
        campus,
        currentPrice: Number(currentPrice),
        marginalCost: Number(marginalCost),
        capacityUtilization: Number(capacityUtilization)
      });
      fetchRecommendations();
    } catch (err) {
      alert('Failed to generate recommendation');
    } finally {
      setGenerating(false);
    }
  };

  const handleAction = async (id, action, overrideReason = null, revisedValue = null) => {
    try {
      await api.post(`/recommendations/${id}/action`, {
        action,
        overrideReason,
        revisedValue
      });
      fetchRecommendations();
    } catch (err) {
      alert(err.response?.data?.error || 'Action failed');
    }
  };

  const aiProposedList = recommendations.filter(r => r.status === 'Pending Action');
  const approvedList = recommendations.filter(r => r.status === 'Approved' || r.status === 'Overridden');

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">AI Pricing & Discount Recommendations Engine</h1>
          <p className="text-xs text-slate-500 mt-0.5">Google Gemini API Real-Time Dynamic Price Recommendations & Human Approval Governance</p>
        </div>
      </div>

      {/* Real-time Generator Form */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-3">
          <Sparkles className="w-4 h-4 text-sky-600" />
          <span>Run Gemini AI Price & Discount Recommendation Analysis</span>
        </div>

        <form onSubmit={handleGenerate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Segment Stream</label>
            <select
              value={segment}
              onChange={(e) => setSegment(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-medium focus:ring-2 focus:ring-sky-500"
            >
              <option value="Tuition Fees">Tuition Fees</option>
              <option value="Transport">Transport</option>
              <option value="Activities">Activities</option>
              <option value="Facility & Capacity">Facility</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Campus</label>
            <select
              value={campus}
              onChange={(e) => setCampus(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-medium focus:ring-2 focus:ring-sky-500"
            >
              <option value="Oakridge Main Campus">Oakridge Main</option>
              <option value="St. Jude North">St. Jude North</option>
              <option value="Horizon East">Horizon East</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Current Fee ($)</label>
            <input
              type="number"
              value={currentPrice}
              onChange={(e) => setCurrentPrice(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Marginal Cost ($)</label>
            <input
              type="number"
              value={marginalCost}
              onChange={(e) => setMarginalCost(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Capacity Util (%)</label>
            <input
              type="number"
              value={capacityUtilization}
              onChange={(e) => setCapacityUtilization(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={generating}
              className="w-full py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded shadow transition flex items-center justify-center space-x-1 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{generating ? 'Analyzing...' : 'Run Gemini AI'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Section 1: AI Unapproved Suggestions */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Unapproved AI Proposals ({aiProposedList.length})
          </h3>
        </div>

        {aiProposedList.length === 0 ? (
          <div className="bg-white p-8 rounded-xl text-center border border-slate-200 text-slate-400 text-xs">
            No pending AI proposals. Run Gemini analysis above to generate suggestions.
          </div>
        ) : (
          aiProposedList.map((rec) => (
            <AIExplainerCard
              key={rec._id}
              recommendation={rec}
              onApprove={(r) => handleAction(r._id, 'Approved')}
              onReject={(r) => handleAction(r._id, 'Rejected')}
              onOverride={(r) => {
                setActiveRec(r);
                setOverrideModalOpen(true);
              }}
            />
          ))
        )}
      </div>

      {/* Section 2: Approved / Overridden Business Decisions */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Approved & Overridden Business Decisions ({approvedList.length})
          </h3>
        </div>

        {approvedList.map((rec) => (
          <AIExplainerCard key={rec._id} recommendation={rec} />
        ))}
      </div>

      {/* Override Modal */}
      <OverrideModal
        isOpen={overrideModalOpen}
        onClose={() => setOverrideModalOpen(false)}
        recommendation={activeRec}
        onSubmit={handleAction}
      />
    </div>
  );
};

export default PricingRecommendationsPage;
