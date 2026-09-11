import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { ShieldAlert, Search, Filter, Settings, Save, Lock, ChevronLeft, ChevronRight } from 'lucide-react';

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [settings, setSettings] = useState([]);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  const fetchAuditLogs = async (page = 1) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page,
        limit: 10,
        search,
        action: actionFilter,
        role: roleFilter
      });
      const res = await api.get(`/audit/logs?${queryParams.toString()}`);
      setLogs(res.data.logs || []);
      setPagination(res.data.pagination || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemSettings = async () => {
    try {
      const res = await api.get('/audit/settings');
      setSettings(res.data || []);
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  useEffect(() => {
    fetchAuditLogs(1);
    fetchSystemSettings();
  }, [search, actionFilter, roleFilter]);

  const handleUpdateSetting = async (key, newValue) => {
    try {
      await api.put(`/audit/settings/${key}`, { configValue: newValue });
      fetchSystemSettings();
      fetchAuditLogs(1);
      alert(`Setting ${key} updated successfully.`);
    } catch (err) {
      alert('Failed to update system setting');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">System Audit Trail & Master Configurations</h1>
          <p className="text-xs text-slate-500 mt-0.5">Immutable Append-Only Audit Trail, Governance Policies & AI Threshold Parameters</p>
        </div>
      </div>

      {/* System Settings & Thresholds */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-3">
          <Settings className="w-4 h-4 text-sky-600" />
          <span>Master System Parameters & AI Approval Thresholds</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {settings.map((cfg) => (
            <div key={cfg._id} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 font-mono">{cfg.configKey}</span>
                <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded font-semibold text-slate-700">{cfg.category}</span>
              </div>
              <p className="text-slate-600 text-[11px]">{cfg.description}</p>
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="text"
                  defaultValue={cfg.configValue}
                  id={`cfg-${cfg.configKey}`}
                  className="flex-1 px-2.5 py-1 bg-white border border-slate-300 rounded font-semibold text-slate-800"
                />
                <button
                  onClick={() => {
                    const inputVal = document.getElementById(`cfg-${cfg.configKey}`).value;
                    handleUpdateSetting(cfg.configKey, inputVal);
                  }}
                  className="px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded font-bold transition flex items-center space-x-1"
                >
                  <Save className="w-3 h-3" />
                  <span>Save</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Searchable Audit Log Table */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">Immutable Audit Trail</h3>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                placeholder="Search actor or details..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                <th className="p-3">Actor Profile</th>
                <th className="p-3">Action Event</th>
                <th className="p-3">Entity Type</th>
                <th className="p-3">Audit Log Details</th>
                <th className="p-3">IP Address</th>
                <th className="p-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">Loading audit trail...</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{log.actorName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{log.actorEmail} ({log.actorRole})</div>
                    </td>
                    <td className="p-3 font-bold text-slate-800">
                      <span className="bg-slate-100 px-2 py-0.5 rounded font-mono text-[10px]">{log.action}</span>
                    </td>
                    <td className="p-3 font-semibold text-slate-600">{log.entityType}</td>
                    <td className="p-3 text-slate-700 max-w-xs truncate">{log.details}</td>
                    <td className="p-3 font-mono text-slate-500">{log.ipAddress}</td>
                    <td className="p-3 text-right text-slate-500 font-mono text-[10px]">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">
            Page {pagination.page} of {pagination.pages} ({pagination.total} entries)
          </span>
          <div className="flex space-x-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => fetchAuditLogs(pagination.page - 1)}
              className="p-1 border border-slate-300 rounded bg-white hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={pagination.page >= pagination.pages}
              onClick={() => fetchAuditLogs(pagination.page + 1)}
              className="p-1 border border-slate-300 rounded bg-white hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogsPage;
