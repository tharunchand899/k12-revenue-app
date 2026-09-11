import React, { useState, useEffect } from 'react';
import api from '../api/client';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import {
  Award,
  Activity,
  Zap,
  Star,
  CheckCircle,
  TrendingUp,
  ShieldAlert,
  MessageSquare
} from 'lucide-react';

const RealizedImpactPage = () => {
  const [impactItems, setImpactItems] = useState([]);
  const [modelMetrics, setModelMetrics] = useState({});
  const [loading, setLoading] = useState(true);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [activeFeedbackId, setActiveFeedbackId] = useState(null);

  const fetchRealizedImpactData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/realized-impact');
      setImpactItems(res.data.items || []);
      setModelMetrics(res.data.modelMetrics || {});
    } catch (err) {
      console.error('Error fetching realized impact:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealizedImpactData();
  }, []);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!activeFeedbackId) return;
    try {
      await api.post(`/realized-impact/${activeFeedbackId}/feedback`, {
        rating: feedbackRating,
        feedbackText
      });
      setActiveFeedbackId(null);
      setFeedbackText('');
      fetchRealizedImpactData();
    } catch (err) {
      alert('Failed to submit model feedback');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Realized Impact & AI Model Health Performance</h1>
          <p className="text-xs text-slate-500 mt-0.5">Post-Decision Financial Outcomes, Prediction Accuracy, Model Drift & Latency Metrics</p>
        </div>
      </div>

      {/* Model Monitoring KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Overall Model Accuracy"
          value={modelMetrics.overallAccuracy || '94.5%'}
          change="High Precision"
          isPositive={true}
          icon={Award}
          subtitle="Predicted vs Realized variance"
          color="emerald"
        />
        <MetricCard
          title="Model Drift Score"
          value={modelMetrics.modelDriftScore || '1.8%'}
          change="Stable"
          isPositive={true}
          icon={Activity}
          subtitle="Data distribution drift"
          color="sky"
        />
        <MetricCard
          title="Inference Latency"
          value={modelMetrics.averageLatencyMs || '380 ms'}
          change="Fast"
          isPositive={true}
          icon={Zap}
          subtitle="Gemini API response time"
          color="purple"
        />
        <MetricCard
          title="Model Adoption Rate"
          value={modelMetrics.adoptionRate || '89.4%'}
          change="Strong"
          isPositive={true}
          icon={TrendingUp}
          subtitle="Executive & Manager approvals"
          color="indigo"
        />
      </div>

      {/* Post-Decision Realized Impact Table */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Post-Decision Realized Financial Impact vs AI Predictions
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                <th className="p-3">Decision / Segment</th>
                <th className="p-3">Implementation Date</th>
                <th className="p-3">Predicted Uplift</th>
                <th className="p-3">Realized Uplift</th>
                <th className="p-3">Variance ($)</th>
                <th className="p-3">Accuracy (%)</th>
                <th className="p-3">Performance Status</th>
                <th className="p-3 text-right">Controller Feedback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {impactItems.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50/80 transition">
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{item.decisionTitle}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{item.segment} • {item.campus}</div>
                  </td>
                  <td className="p-3 font-semibold text-slate-600">
                    {new Date(item.implementationDate).toLocaleDateString()}
                  </td>
                  <td className="p-3 font-bold text-slate-800">${(item.predictedUplift || 0).toLocaleString()}</td>
                  <td className="p-3 font-bold text-emerald-700">${(item.realizedUplift || 0).toLocaleString()}</td>
                  <td className="p-3">
                    <span className={`font-bold ${item.varianceAmount >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {item.varianceAmount >= 0 ? '+' : ''}${(item.varianceAmount || 0).toLocaleString()}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-slate-900">{item.accuracyPercentage}%</td>
                  <td className="p-3">
                    <StatusBadge status={item.performanceStatus} />
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => {
                        setActiveFeedbackId(item._id);
                        setFeedbackText(item.userFeedbackText || '');
                        setFeedbackRating(item.userFeedbackRating || 5);
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold text-[11px] inline-flex items-center space-x-1"
                    >
                      <MessageSquare className="w-3 h-3 text-sky-600" />
                      <span>{item.userFeedbackRating ? `★ ${item.userFeedbackRating}/5` : 'Rate Feedback'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feedback Rating Modal */}
      {activeFeedbackId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-3 border-b border-slate-100 pb-2">Submit Model Evaluation Feedback</h3>
            <form onSubmit={handleFeedbackSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rating (1 to 5 Stars)</label>
                <select
                  value={feedbackRating}
                  onChange={(e) => setFeedbackRating(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-bold"
                >
                  <option value={5}>★★★★★ (5 Stars - Exceptional Accuracy)</option>
                  <option value={4}>★★★★☆ (4 Stars - Highly Satisfactory)</option>
                  <option value={3}>★★★☆☆ (3 Stars - Moderate Accuracy)</option>
                  <option value={2}>★★☆☆☆ (2 Stars - Low Accuracy / Variance)</option>
                  <option value={1}>★☆☆☆☆ (1 Star - Model Misalignment)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">User Feedback & Qualitative Notes</label>
                <textarea
                  rows={3}
                  required
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-sky-500"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveFeedbackId(null)}
                  className="px-3 py-1.5 border rounded text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded font-bold"
                >
                  Submit Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealizedImpactPage;
