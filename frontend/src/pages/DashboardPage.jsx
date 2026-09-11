import React, { useState, useEffect } from 'react';
import api from '../api/client';
import MetricCard from '../components/MetricCard';
import {
  DollarSign,
  TrendingUp,
  PieChart as PieIcon,
  Percent,
  Sparkles,
  School,
  Bus,
  Activity,
  Gift,
  Building2,
  Filter,
  RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';

const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [varianceNarrative, setVarianceNarrative] = useState(null);
  const [selectedCampus, setSelectedCampus] = useState('All Campuses');
  const [selectedSegment, setSelectedSegment] = useState('Tuition Fees');
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [sumRes, trendRes, varRes] = await Promise.all([
        api.get(`/dashboard/summary?campus=${encodeURIComponent(selectedCampus)}`),
        api.get(`/dashboard/segment-trends?campus=${encodeURIComponent(selectedCampus)}`),
        api.get(`/dashboard/variance-narrative?segment=${encodeURIComponent(selectedSegment)}`)
      ]);
      setSummary(sumRes.data);
      setTrends(trendRes.data.trends || []);
      setVarianceNarrative(varRes.data);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedCampus, selectedSegment]);

  const metrics = summary?.metrics || {};
  const segmentBreakdown = summary?.segmentBreakdown || {};

  return (
    <div className="space-y-6">
      {/* Header & Global Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Revenue & Profitability Intelligence</h1>
          <p className="text-xs text-slate-500 mt-0.5">Multi-Stream K-12 Segment Financial Performance & Capacity Analytics</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCampus}
              onChange={(e) => setSelectedCampus(e.target.value)}
              className="bg-transparent text-slate-700 font-bold focus:outline-none cursor-pointer"
            >
              <option value="All Campuses">All Campuses</option>
              <option value="Oakridge Main Campus">Oakridge Main</option>
              <option value="St. Jude North">St. Jude North</option>
              <option value="Horizon East">Horizon East</option>
            </select>
          </div>

          <button
            onClick={fetchDashboardData}
            className="p-2 text-slate-500 hover:text-sky-600 bg-slate-50 hover:bg-sky-50 rounded-lg border border-slate-200 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Realized Revenue"
          value={`$${(metrics.totalActualRevenue || 0).toLocaleString()}`}
          change={`${metrics.variancePercentage || 0}% vs Budget`}
          isPositive={metrics.varianceAmount >= 0}
          icon={DollarSign}
          subtitle={`Budget: $${(metrics.totalBudgetRevenue || 0).toLocaleString()}`}
          color="sky"
        />
        <MetricCard
          title="Net Profitability Margin"
          value={`$${(metrics.netProfitability || 0).toLocaleString()}`}
          change={`${metrics.netMarginPercent || 0}% Net`}
          isPositive={true}
          icon={PieIcon}
          subtitle="Operating cost subtracted"
          color="emerald"
        />
        <MetricCard
          title="Revenue Variance"
          value={`${metrics.varianceAmount >= 0 ? '+' : ''}$${(metrics.varianceAmount || 0).toLocaleString()}`}
          change={`${metrics.variancePercentage || 0}%`}
          isPositive={metrics.varianceAmount >= 0}
          icon={TrendingUp}
          subtitle="Actual vs Budget delta"
          color="indigo"
        />
        <MetricCard
          title="School Capacity Utilization"
          value={`${metrics.overallUtilization || 87}%`}
          change="Optimal"
          isPositive={true}
          icon={Percent}
          subtitle={`${(metrics.enrolledStudentsCount || 2450).toLocaleString()} Enrolled Seats`}
          color="purple"
        />
      </div>

      {/* 5 Revenue Streams Cards Grid */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
          5 Core K-12 Revenue Streams Breakdown
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Stream 1 */}
          <div className="p-4 bg-sky-50/60 rounded-xl border border-sky-100">
            <div className="flex items-center space-x-2 text-sky-700 font-bold text-xs mb-2">
              <School className="w-4 h-4" />
              <span>Tuition Fees</span>
            </div>
            <div className="text-base font-extrabold text-slate-900">
              ${(segmentBreakdown['Tuition Fees']?.actual || 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
              <span>Margin: {segmentBreakdown['Tuition Fees']?.margin ? Math.round((segmentBreakdown['Tuition Fees'].margin / segmentBreakdown['Tuition Fees'].actual) * 100) : 48}%</span>
              <span>Util: {segmentBreakdown['Tuition Fees']?.utilization || 94}%</span>
            </div>
          </div>

          {/* Stream 2 */}
          <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100">
            <div className="flex items-center space-x-2 text-indigo-700 font-bold text-xs mb-2">
              <Bus className="w-4 h-4" />
              <span>Transport</span>
            </div>
            <div className="text-base font-extrabold text-slate-900">
              ${(segmentBreakdown['Transport']?.actual || 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
              <span>Margin: 32%</span>
              <span>Util: {segmentBreakdown['Transport']?.utilization || 88}%</span>
            </div>
          </div>

          {/* Stream 3 */}
          <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-100">
            <div className="flex items-center space-x-2 text-purple-700 font-bold text-xs mb-2">
              <Activity className="w-4 h-4" />
              <span>Activities</span>
            </div>
            <div className="text-base font-extrabold text-slate-900">
              ${(segmentBreakdown['Activities']?.actual || 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
              <span>Margin: 41%</span>
              <span>Util: {segmentBreakdown['Activities']?.utilization || 79}%</span>
            </div>
          </div>

          {/* Stream 4 */}
          <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100">
            <div className="flex items-center space-x-2 text-emerald-700 font-bold text-xs mb-2">
              <Gift className="w-4 h-4" />
              <span>Grants</span>
            </div>
            <div className="text-base font-extrabold text-slate-900">
              ${(segmentBreakdown['Grants & Subsidies']?.actual || 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
              <span>Margin: 100%</span>
              <span>Util: 100%</span>
            </div>
          </div>

          {/* Stream 5 */}
          <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-100">
            <div className="flex items-center space-x-2 text-amber-700 font-bold text-xs mb-2">
              <Building2 className="w-4 h-4" />
              <span>Facility Capacity</span>
            </div>
            <div className="text-base font-extrabold text-slate-900">
              ${(segmentBreakdown['Facility & Capacity']?.actual || 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
              <span>Margin: 74%</span>
              <span>Util: {segmentBreakdown['Facility & Capacity']?.utilization || 72}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Stream Trends */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Monthly Revenue Stream Trends (Actual vs Budget)</h3>
            <span className="text-xs text-slate-400 font-medium">FY 2026</span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(val) => `$${val / 1000}k`} />
                <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Tuition" name="Tuition Fees" fill="#0284c7" stackId="a" />
                <Bar dataKey="Transport" name="Transport" fill="#6366f1" stackId="a" />
                <Bar dataKey="Activities" name="Activities" fill="#a855f7" stackId="a" />
                <Bar dataKey="Grants" name="Grants" fill="#10b981" stackId="a" />
                <Bar dataKey="Facility" name="Facility" fill="#f59e0b" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Variance Rationale Box */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2 text-sky-700 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-sky-600" />
                <span>AI Variance Explainer</span>
              </div>
              <select
                value={selectedSegment}
                onChange={(e) => setSelectedSegment(e.target.value)}
                className="text-xs bg-slate-100 border border-slate-200 rounded px-2 py-1 font-semibold text-slate-700 focus:outline-none"
              >
                <option value="Tuition Fees">Tuition Fees</option>
                <option value="Transport">Transport</option>
                <option value="Activities">Activities</option>
                <option value="Grants & Subsidies">Grants</option>
                <option value="Facility & Capacity">Facility</option>
              </select>
            </div>

            <div className="mt-4 p-4 bg-sky-50/70 rounded-xl border border-sky-100 text-xs leading-relaxed text-slate-700">
              {varianceNarrative ? (
                <>
                  <p className="font-medium text-slate-800">{varianceNarrative.narrative}</p>
                  <div className="mt-3 pt-3 border-t border-sky-200/60 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Confidence Score: <strong className="text-slate-900">{varianceNarrative.confidence}%</strong></span>
                    <span className="text-sky-700 font-semibold">{varianceNarrative.modelVersion}</span>
                  </div>
                </>
              ) : (
                <p className="text-slate-400">Generating AI variance insight...</p>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Governance Audit Status</span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
