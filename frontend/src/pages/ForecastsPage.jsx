import React, { useState, useEffect } from 'react';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';
import {
  TrendingUp,
  AlertTriangle,
  Layers,
  Sparkles,
  HelpCircle,
  BarChart2,
  RefreshCw,
  Info
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const ForecastsPage = () => {
  const [forecasts, setForecasts] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeStateTab, setActiveStateTab] = useState('normal'); // 'normal', 'low-confidence', 'insufficient-data', 'unavailable-model'
  const [simulatedStateData, setSimulatedStateData] = useState(null);
  const [errorStateMessage, setErrorStateMessage] = useState(null);

  const fetchForecasts = async () => {
    try {
      setLoading(true);
      setErrorStateMessage(null);
      setSimulatedStateData(null);
      const res = await api.get('/forecasts');
      setForecasts(res.data.forecasts || []);
      setSummary(res.data.summary || {});
    } catch (err) {
      console.error('Error fetching forecasts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStateTabChange = async (tab) => {
    setActiveStateTab(tab);
    if (tab === 'normal') {
      fetchForecasts();
      return;
    }

    try {
      setLoading(true);
      setErrorStateMessage(null);
      setSimulatedStateData(null);
      const res = await api.get(`/forecasts/simulate-state/${tab}`);
      setSimulatedStateData(res.data);
    } catch (err) {
      setErrorStateMessage(err.response?.data || { error: 'Model prediction failed', code: 'FAILED_PREDICTION' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecasts();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Revenue, Margin & Capacity Forecasts</h1>
          <p className="text-xs text-slate-500 mt-0.5">Multi-Segment Predictive Models, Elasticity Indices & Error State Handling</p>
        </div>

        {/* State Simulator Tabs for Evaluation */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
          <button
            onClick={() => handleStateTabChange('normal')}
            className={`px-3 py-1.5 rounded-md transition ${activeStateTab === 'normal' ? 'bg-white shadow-xs text-sky-700 font-bold' : 'text-slate-600'}`}
          >
            Normal Models
          </button>
          <button
            onClick={() => handleStateTabChange('low-confidence')}
            className={`px-3 py-1.5 rounded-md transition ${activeStateTab === 'low-confidence' ? 'bg-white shadow-xs text-amber-700 font-bold' : 'text-slate-600'}`}
          >
            ⚠️ Low Confidence
          </button>
          <button
            onClick={() => handleStateTabChange('insufficient-data')}
            className={`px-3 py-1.5 rounded-md transition ${activeStateTab === 'insufficient-data' ? 'bg-white shadow-xs text-purple-700 font-bold' : 'text-slate-600'}`}
          >
            📊 Insufficient Data
          </button>
          <button
            onClick={() => handleStateTabChange('unavailable-model')}
            className={`px-3 py-1.5 rounded-md transition ${activeStateTab === 'unavailable-model' ? 'bg-white shadow-xs text-rose-700 font-bold' : 'text-slate-600'}`}
          >
            ❌ Offline Model
          </button>
        </div>
      </div>

      {/* Error or State Alerts */}
      {errorStateMessage && (
        <div className="p-5 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
          <div className="flex items-center space-x-2 text-rose-800 font-bold text-sm">
            <AlertTriangle className="w-5 h-5" />
            <span>AI Model State Exception [{errorStateMessage.code}]</span>
          </div>
          <p className="text-xs text-rose-700">{errorStateMessage.error}</p>
        </div>
      )}

      {/* Simulated Single State View */}
      {simulatedStateData && (
        <div className="p-6 bg-amber-50/80 border border-amber-200 rounded-xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Simulated Model State View</span>
            <StatusBadge status={`Confidence: ${simulatedStateData.confidenceScore}%`} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs bg-white p-4 rounded-lg border border-amber-100">
            <div>
              <span className="text-slate-500 font-medium">Segment / Campus:</span>
              <div className="font-bold text-slate-900 mt-0.5">{simulatedStateData.segment} • {simulatedStateData.campus}</div>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Predicted Revenue:</span>
              <div className="font-bold text-slate-900 mt-0.5">${(simulatedStateData.predictedRevenue || 0).toLocaleString()}</div>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Price Sensitivity Index:</span>
              <div className="font-bold text-amber-700 mt-0.5">{simulatedStateData.priceSensitivityIndex}</div>
            </div>
          </div>

          <div className="text-xs text-slate-700 leading-relaxed font-medium bg-white p-4 rounded-lg border border-amber-100">
            <strong className="text-amber-900">AI Explanation:</strong> {simulatedStateData.explanationNarrative}
          </div>
        </div>
      )}

      {/* Normal View Content */}
      {!errorStateMessage && !simulatedStateData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-medium">Projected Revenue Total</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">${(summary.totalPredictedRevenue || 0).toLocaleString()}</div>
              <span className="text-xs text-emerald-600 font-semibold mt-1 block">▲ +6.4% Growth Trend</span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-medium">Avg Forecast Margin</span>
              <div className="text-2xl font-bold text-emerald-700 mt-1">{summary.avgMarginPercent || 49}%</div>
              <span className="text-xs text-slate-500 mt-1 block">Net contribution basis</span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-medium">Predicted Capacity Utilization</span>
              <div className="text-2xl font-bold text-sky-700 mt-1">{summary.avgCapacityUtilization || 89}%</div>
              <span className="text-xs text-slate-500 mt-1 block">School facilities & transport routes</span>
            </div>
          </div>

          {/* Forecast Models Cards */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Active Segment Predictive Models</h3>
            {forecasts.map((f) => (
              <div key={f._id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-2">
                  <div>
                    <span className="text-xs font-semibold text-sky-700 uppercase tracking-wider">{f.forecastPeriod}</span>
                    <h4 className="text-base font-bold text-slate-900">{f.segment} - {f.campus}</h4>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
                      Confidence: {f.confidenceScore}%
                    </span>
                    <StatusBadge status={f.confidenceScore >= 90 ? 'High Accuracy' : 'Moderate'} />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-slate-500 block">Predicted Revenue:</span>
                    <span className="text-sm font-bold text-slate-900">${(f.predictedRevenue || 0).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Predicted Margin:</span>
                    <span className="text-sm font-bold text-emerald-700">${(f.predictedMargin || 0).toLocaleString()} ({f.predictedMarginPercent}%)</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Price Sensitivity (ε):</span>
                    <span className="text-sm font-bold text-slate-800">{f.priceSensitivityIndex}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Propensity Score:</span>
                    <span className="text-sm font-bold text-sky-700">{f.propensityScore}/100</span>
                  </div>
                </div>

                {/* Confidence Range Band */}
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>P10 Pessimistic: ${(f.confidenceBands?.p10 || 0).toLocaleString()}</span>
                    <span className="font-bold text-slate-900">P50 Expected: ${(f.confidenceBands?.p50 || 0).toLocaleString()}</span>
                    <span>P90 Optimistic: ${(f.confidenceBands?.p90 || 0).toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                    <div className="bg-amber-300 h-full" style={{ width: '30%' }}></div>
                    <div className="bg-sky-500 h-full" style={{ width: '40%' }}></div>
                    <div className="bg-emerald-400 h-full" style={{ width: '30%' }}></div>
                  </div>
                </div>

                <div className="p-3 bg-sky-50/60 rounded-lg border border-sky-100 text-xs text-slate-700 leading-relaxed">
                  <strong className="text-sky-900">Model Narrative Rationale:</strong> {f.explanationNarrative}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ForecastsPage;
