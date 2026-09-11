import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import AIExplainerCard from '../components/AIExplainerCard';
import OverrideModal from '../components/OverrideModal';
import { Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw, Plus, Filter } from 'lucide-react';

const RecommendationApprovalPage = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedSegment, setSelectedSegment] = useState('All');
  
  // Override Modal state
  const [activeOverrideRec, setActiveOverrideRec] = useState(null);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/recommendations?status=${selectedStatus}&segment=${selectedSegment}`);
      setRecommendations(res.data.items || []);
      setStats(res.data.stats || {});
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [selectedStatus, selectedSegment]);

  const handleAction = async (id, action, overrideReason = null, revisedValue = null) => {
    try {
      await api.post(`/recommendations/${id}/action`, {
        action,
        overrideReason,
        revisedValue
      });
      fetchRecommendations();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to record recommendation action');
    }
  };

  const handleGenerateNew = async () => {
    try {
      await api.post('/recommendations/generate', {
        segment: 'Tuition Fees',
        campus: 'Oakridge Main Campus',
        currentPrice: 14500,
        marginalCost: 7000,
        capacityUtilization: 94
      });
      fetchRecommendations();
    } catch (err) {
      alert('Failed to trigger AI recommendation generator');
    }
  };

  const openOverrideModal = (rec) => {
    setActiveOverrideRec(rec);
    setOverrideModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">AI Recommendation Impact & Approval Workflow</h1>
          <p className="text-xs text-slate-500 mt-0.5">Human-in-the-Loop AI Recommendation Governance, Confidence Ranges & Audit Log Traces</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleGenerateNew}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold shadow-md transition flex items-center space-x-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Gemini Optimization</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Pending Action</span>
          <div className="text-2xl font-bold text-amber-600 mt-1">{stats.totalPending || 0}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Approved Decisions</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{stats.totalApproved || 0}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Human Overrides</span>
          <div className="text-2xl font-bold text-purple-600 mt-1">{stats.totalOverridden || 0}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Potential Revenue Uplift</span>
          <div className="text-2xl font-bold text-sky-700 mt-1">+${(stats.totalPotentialUplift || 0).toLocaleString()}</div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between text-xs">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-700">Filter Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg font-medium text-slate-700 bg-white"
            >
              <option value="All">All Statuses</option>
              <option value="Pending Action">Pending Action</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Overridden">Overridden</option>
            </select>
          </div>
        </div>

        <button onClick={fetchRecommendations} className="p-2 text-slate-500 hover:text-sky-600">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Recommendations Explainer Cards List */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-16 text-slate-400 text-sm">Loading AI recommendations...</div>
        ) : recommendations.length === 0 ? (
          <div className="bg-white p-12 rounded-xl text-center border border-slate-200 text-slate-400 text-xs">
            No AI recommendations match current filter criteria.
          </div>
        ) : (
          recommendations.map((rec) => (
            <AIExplainerCard
              key={rec._id}
              recommendation={rec}
              onApprove={(r) => handleAction(r._id, 'Approved')}
              onReject={(r) => handleAction(r._id, 'Rejected')}
              onOverride={(r) => openOverrideModal(r)}
            />
          ))
        )}
      </div>

      {/* Human Override Modal */}
      <OverrideModal
        isOpen={overrideModalOpen}
        onClose={() => setOverrideModalOpen(false)}
        recommendation={activeOverrideRec}
        onSubmit={handleAction}
      />
    </div>
  );
};

export default RecommendationApprovalPage;
