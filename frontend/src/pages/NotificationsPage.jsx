import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import { Bell, CheckCircle2, Trash2, Filter, AlertTriangle, Sparkles, School } from 'lucide-react';

const NotificationsPage = () => {
  const { notifications, unreadCount, markAsRead, markAllRead, clearAll } = useNotifications();
  const [typeFilter, setTypeFilter] = useState('All');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const navigate = useNavigate();

  const filteredNotifications = notifications.filter(n => {
    if (unreadOnly && n.isRead) return false;
    if (typeFilter !== 'All' && n.type !== typeFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Notification Center & Alerts</h1>
          <p className="text-xs text-slate-500 mt-0.5">System Events, Margin Leakage Alerts, Approval Requests & AI Insights</p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <button
            onClick={markAllRead}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition"
          >
            Mark All Read
          </button>
          <button
            onClick={clearAll}
            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-lg border border-rose-200 transition"
          >
            Clear Notifications
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-700">Filter Event Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg font-medium text-slate-700 bg-white"
            >
              <option value="All">All Types</option>
              <option value="Margin Leakage Alert">Margin Leakage Alert</option>
              <option value="AI Recommendation">AI Recommendation</option>
              <option value="Approval Request">Approval Request</option>
              <option value="Capacity Warning">Capacity Warning</option>
            </select>
          </div>

          <label className="flex items-center space-x-2 font-semibold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(e) => setUnreadOnly(e.target.checked)}
              className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
            />
            <span>Unread Only ({unreadCount})</span>
          </label>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white p-12 rounded-xl text-center border border-slate-200 text-slate-400 text-xs">
            No notifications match your current filter settings.
          </div>
        ) : (
          filteredNotifications.map((n) => (
            <div
              key={n._id}
              onClick={() => {
                markAsRead(n._id);
                if (n.link) navigate(n.link);
              }}
              className={`p-4 rounded-xl border transition cursor-pointer flex items-start justify-between ${
                n.isRead ? 'bg-white border-slate-200 opacity-80 hover:opacity-100' : 'bg-sky-50/60 border-sky-200 shadow-sm hover:border-sky-300'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2.5 rounded-lg ${
                  n.severity === 'urgent' || n.severity === 'critical' ? 'bg-rose-100 text-rose-700' : 'bg-sky-100 text-sky-700'
                }`}>
                  {n.type?.includes('Leakage') ? <AlertTriangle className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-semibold text-slate-500">{n.type}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{n.message}</p>
                  <span className="text-[10px] text-slate-400 block mt-2">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <StatusBadge status={n.isRead ? 'Read' : 'Unread'} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
