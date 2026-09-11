import React, { useState, useEffect } from 'react';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  FileText,
  Calendar,
  Filter,
  CheckCircle,
  Clock,
  Layers
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

const ReportsPage = () => {
  const [history, setHistory] = useState([]);
  const [waterfallSteps, setWaterfallSteps] = useState([]);
  const [reportType, setReportType] = useState('Revenue & Margin Waterfall');
  const [format, setFormat] = useState('CSV');
  const [campus, setCampus] = useState('All Campuses');
  const [exporting, setExporting] = useState(false);
  const [exportSuccessMessage, setExportSuccessMessage] = useState(null);

  const fetchReportsData = async () => {
    try {
      const [histRes, wfRes] = await Promise.all([
        api.get('/reports/history'),
        api.get('/reports/waterfall')
      ]);
      setHistory(histRes.data || []);
      setWaterfallSteps(wfRes.data.waterfallSteps || []);
    } catch (err) {
      console.error('Error fetching reports data:', err);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, []);

  const handleExport = async (e) => {
    e.preventDefault();
    try {
      setExporting(true);
      setExportSuccessMessage(null);

      if (format === 'CSV') {
        const response = await api.post('/reports/export', { reportType, format, campus }, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `K12_Report_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        setExportSuccessMessage('CSV report exported and downloaded successfully!');
      } else {
        const res = await api.post('/reports/export', { reportType, format, campus });
        setExportSuccessMessage(res.data.message);
      }

      fetchReportsData();
    } catch (err) {
      alert('Failed to generate report export');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Reports, Price Waterfall & Analytics Center</h1>
          <p className="text-xs text-slate-500 mt-0.5">Exportable Financial Statements, Price Waterfall Leakage Analysis & Saved Configurations</p>
        </div>
      </div>

      {/* Export Generator Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-3">
          <Download className="w-4 h-4 text-sky-600" />
          <span>Generate & Export Custom Financial Report</span>
        </div>

        <form onSubmit={handleExport} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Report Module</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded font-medium focus:ring-2 focus:ring-sky-500 bg-white"
            >
              <option value="Revenue & Margin Waterfall">Revenue & Margin Waterfall</option>
              <option value="Price List & Cost Component Breakdown">Price List & Cost Components</option>
              <option value="Margin Leakage & Discount Audit">Margin Leakage & Discount Audit</option>
              <option value="Capacity Utilization & Transport Profitability">Capacity & Transport Profitability</option>
              <option value="AI Recommendation Audit Log">AI Recommendation Audit Log</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Campus Scope</label>
            <select
              value={campus}
              onChange={(e) => setCampus(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded font-medium focus:ring-2 focus:ring-sky-500 bg-white"
            >
              <option value="All Campuses">All Campuses</option>
              <option value="Oakridge Main Campus">Oakridge Main</option>
              <option value="St. Jude North">St. Jude North</option>
              <option value="Horizon East">Horizon East</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Export Format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded font-bold focus:ring-2 focus:ring-sky-500 bg-white"
            >
              <option value="CSV">CSV Data Spreadsheet</option>
              <option value="PDF">PDF Executive Report</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={exporting}
              className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded shadow transition flex items-center justify-center space-x-1.5 disabled:opacity-50"
            >
              {format === 'CSV' ? <FileSpreadsheet className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
              <span>{exporting ? 'Generating...' : `Export ${format}`}</span>
            </button>
          </div>
        </form>

        {exportSuccessMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{exportSuccessMessage}</span>
          </div>
        )}
      </div>

      {/* Price Waterfall Analysis Section */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Price Waterfall Analysis (List Price to Net Margin Bridges)
          </h3>
          <span className="text-xs text-slate-500 font-medium">FY 2026 Consolidated</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={waterfallSteps} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(val) => `$${val / 1000000}M`} />
              <Tooltip formatter={(val) => `$${Number(val).toLocaleString()}`} />
              <Bar dataKey="value" name="Amount ($)">
                {waterfallSteps.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.type === 'base' ? '#0284c7' :
                      entry.type === 'leakage' ? '#f43f5e' :
                      entry.type === 'subtotal' ? '#6366f1' :
                      entry.type === 'cost' ? '#f59e0b' : '#10b981'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Generated Reports History Table */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Report Export History & Archive
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                <th className="p-3">Report ID / Title</th>
                <th className="p-3">Format</th>
                <th className="p-3">Generated By</th>
                <th className="p-3">Timestamp</th>
                <th className="p-3">File Size</th>
                <th className="p-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {history.map((h) => (
                <tr key={h.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-3 font-bold text-slate-900">
                    {h.name}
                    <span className="text-[10px] text-slate-400 font-mono block">{h.id}</span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      h.format === 'CSV' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {h.format}
                    </span>
                  </td>
                  <td className="p-3 font-semibold text-slate-700">{h.generatedBy}</td>
                  <td className="p-3 text-slate-500">{h.timestamp}</td>
                  <td className="p-3 font-mono text-slate-600">{h.fileSize}</td>
                  <td className="p-3 text-right">
                    <StatusBadge status={h.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
