import React, { useState, useEffect } from 'react';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';
import {
  Sliders,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Percent,
  Plus,
  Play,
  Layers,
  ArrowRight
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const PricingSimulationPage = () => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newQuoteModal, setNewQuoteModal] = useState(false);

  // What-If Simulation State
  const [simBasePrice, setSimBasePrice] = useState(14500);
  const [simPriceChange, setSimPriceChange] = useState(5);
  const [simDiscount, setSimDiscount] = useState(8);
  const [simEnrolment, setSimEnrolment] = useState(450);
  const [simElasticity, setSimElasticity] = useState(-0.65);
  const [simCostPerStudent, setSimCostPerStudent] = useState(7000);
  const [simulationResult, setSimulationResult] = useState(null);

  // New Deal Quote Form State
  const [studentName, setStudentName] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [campus, setCampus] = useState('Oakridge Main Campus');
  const [itemDescription, setItemDescription] = useState('Secondary Enrolment Package');
  const [basePrice, setBasePrice] = useState(14500);
  const [requestedDiscountPercent, setRequestedDiscountPercent] = useState(18); // Default triggers leakage alert

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/simulations/quotes');
      setQuotes(res.data || []);
    } catch (err) {
      console.error('Error fetching quotes:', err);
    } finally {
      setLoading(false);
    }
  };

  const runSimulation = async () => {
    try {
      const res = await api.post('/simulations/what-if', {
        basePrice: simBasePrice,
        priceChangePercent: simPriceChange,
        discountPercent: simDiscount,
        currentEnrolment: simEnrolment,
        elasticity: simElasticity,
        costPerStudent: simCostPerStudent
      });
      setSimulationResult(res.data);
    } catch (err) {
      console.error('Error running simulation:', err);
    }
  };

  useEffect(() => {
    fetchQuotes();
    runSimulation();
  }, []);

  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/simulations/quotes', {
        studentName,
        guardianName,
        campus,
        itemDescription,
        basePrice,
        requestedDiscountPercent
      });
      setNewQuoteModal(false);
      setStudentName('');
      setGuardianName('');
      fetchQuotes();
    } catch (err) {
      alert('Failed to submit quote proposal');
    }
  };

  const handleQuoteDecision = async (id, status, notes = '') => {
    try {
      await api.put(`/simulations/quotes/${id}/decision`, { approvalStatus: status, decisionNotes: notes });
      fetchQuotes();
    } catch (err) {
      alert('Failed to record deal decision');
    }
  };

  // Generate elasticity graph points
  const elasticityData = [-20, -15, -10, -5, 0, 5, 10, 15, 20].map(pct => {
    const p = simBasePrice * (1 + pct / 100);
    const demandDelta = simElasticity * pct;
    const q = Math.round(simEnrolment * (1 + demandDelta / 100));
    return {
      priceChange: `${pct > 0 ? '+' : ''}${pct}%`,
      price: Math.round(p),
      enrolment: q,
      revenue: Math.round(p * q)
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Price Elasticity, What-If & Deal Approvals</h1>
          <p className="text-xs text-slate-500 mt-0.5">Simulate Net Revenue Curves, Detect Margin Leakage & Approve Custom Student Deals</p>
        </div>

        <button
          onClick={() => setNewQuoteModal(true)}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold shadow-md transition flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Deal Quote</span>
        </button>
      </div>

      {/* Simulator Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Simulator Controls */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-3">
            <Sliders className="w-4 h-4 text-sky-600" />
            <span>Interactive What-If Simulator</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Base Price:</span>
                <span className="text-slate-900 font-bold">${simBasePrice.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="5000"
                max="25000"
                step="500"
                value={simBasePrice}
                onChange={(e) => setSimBasePrice(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
              />
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Price Adjustment (%):</span>
                <span className={`font-bold ${simPriceChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {simPriceChange >= 0 ? '+' : ''}{simPriceChange}%
                </span>
              </div>
              <input
                type="range"
                min="-20"
                max="20"
                step="1"
                value={simPriceChange}
                onChange={(e) => setSimPriceChange(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
              />
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Promotional Discount (%):</span>
                <span className="text-slate-900 font-bold">{simDiscount}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                step="1"
                value={simDiscount}
                onChange={(e) => setSimDiscount(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
              />
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Price Elasticity (ε):</span>
                <span className="text-slate-900 font-bold">{simElasticity}</span>
              </div>
              <input
                type="range"
                min="-1.5"
                max="-0.2"
                step="0.05"
                value={simElasticity}
                onChange={(e) => setSimElasticity(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
              />
            </div>

            <button
              onClick={runSimulation}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition flex items-center justify-center space-x-1.5 mt-2"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Recalculate Scenario</span>
            </button>
          </div>
        </div>

        {/* Simulation Output & Graph */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Enrolment Demand Elasticity Curve</h3>
            <span className="text-xs text-sky-700 font-semibold bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
              Model Elasticity: {simElasticity}
            </span>
          </div>

          {simulationResult && (
            <div className="grid grid-cols-3 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-500 block">Simulated Enrolment:</span>
                <span className="text-base font-bold text-slate-900">{simulationResult.simulatedScenario?.enrolment} Seats</span>
              </div>
              <div>
                <span className="text-slate-500 block">Net Revenue:</span>
                <span className="text-base font-bold text-slate-900">${(simulationResult.simulatedScenario?.totalRevenue || 0).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Net Margin Impact:</span>
                <span className={`text-base font-bold ${simulationResult.variance?.marginVariance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {simulationResult.variance?.marginVariance >= 0 ? '+' : ''}${simulationResult.variance?.marginVariance?.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={elasticityData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="priceChange" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} tickFormatter={(val) => `$${val / 1000}k`} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val) => Number(val).toLocaleString()} />
                <Line yAxisId="left" type="monotone" dataKey="revenue" name="Total Revenue ($)" stroke="#0284c7" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="enrolment" name="Enrolment (Seats)" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Deal Approvals & Margin Leakage Queue */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            <h3 className="text-base font-bold text-slate-900">Deal Approval Queue & Margin Leakage Alerts</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">{quotes.length} Quotes in Pipeline</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                <th className="p-3">Quote # / Student</th>
                <th className="p-3">Base Price</th>
                <th className="p-3">Req. Discount</th>
                <th className="p-3">Offered Price</th>
                <th className="p-3">Projected Margin</th>
                <th className="p-3">Deal Score</th>
                <th className="p-3">Status / Alerts</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {quotes.map((q) => (
                <tr key={q._id} className="hover:bg-slate-50/80 transition">
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{q.studentName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{q.quoteNumber} • {q.campus}</div>
                  </td>
                  <td className="p-3 font-semibold">${q.basePrice?.toLocaleString()}</td>
                  <td className="p-3 font-bold text-slate-900">{q.requestedDiscountPercent}%</td>
                  <td className="p-3 font-bold text-sky-800">${q.offeredPrice?.toLocaleString()}</td>
                  <td className="p-3">
                    <div className="font-bold text-emerald-700">+${q.projectedMargin?.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-500">{q.projectedMarginPercent}% net</div>
                  </td>
                  <td className="p-3">
                    <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                      q.dealScore >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {q.dealScore}/100
                    </span>
                  </td>
                  <td className="p-3 space-y-1">
                    <StatusBadge status={q.approvalStatus} />
                    {q.marginLeakageAlert && (
                      <div className="text-[10px] text-rose-600 font-bold flex items-center">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Leakage Warning
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-right space-x-1">
                    {q.approvalStatus === 'Pending Review' && (
                      <>
                        <button
                          onClick={() => handleQuoteDecision(q._id, 'Approved', 'Approved per authorized manager review')}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold transition text-[11px]"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleQuoteDecision(q._id, 'Rejected', 'Discount exceeds margin floor policy')}
                          className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold transition text-[11px]"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for creating custom quote */}
      {newQuoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Submit Student Deal Quote</h3>
            <form onSubmit={handleQuoteSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Student Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lucas Harrison"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Guardian Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Robert Harrison"
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Base Price ($)</label>
                  <input
                    type="number"
                    required
                    value={basePrice}
                    onChange={(e) => setBasePrice(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Requested Discount (%)</label>
                  <input
                    type="number"
                    required
                    value={requestedDiscountPercent}
                    onChange={(e) => setRequestedDiscountPercent(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-800 rounded text-[11px]">
                Note: Discount &gt; 15% will automatically trigger a <strong>Margin Leakage Alert</strong> for Pricing Controller approval.
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setNewQuoteModal(false)}
                  className="px-3 py-1.5 border rounded text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded font-bold"
                >
                  Submit Quote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingSimulationPage;
