import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  LayoutDashboard,
  CircleDollarSign,
  Sliders,
  CheckSquare,
  TrendingUp,
  Sparkles,
  Award,
  BarChart3,
  Bell,
  Users,
  ShieldAlert,
  LogOut,
  ChevronDown,
  Search,
  School,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const Layout = () => {
  const { user, logout, switchDemoRole } = useAuth();
  const { notifications, unreadCount, panelOpen, setPanelOpen, markAsRead, markAllRead, clearAll } = useNotifications();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    { name: 'Revenue Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Price List & Margins', path: '/pricing', icon: CircleDollarSign },
    { name: 'Simulations & Deals', path: '/simulations', icon: Sliders },
    { name: 'Impact & Approvals', path: '/recommendation-approval', icon: CheckSquare },
    { name: 'Revenue Forecasts', path: '/forecasts', icon: TrendingUp },
    { name: 'AI Pricing Recs', path: '/recommendations', icon: Sparkles },
    { name: 'Realized Impact', path: '/realized-impact', icon: Award },
    { name: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
    { name: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount },
    { name: 'User Management', path: '/users', icon: Users, roles: ['Admin', 'Executive'] },
    { name: 'Audit & Settings', path: '/audit', icon: ShieldAlert, roles: ['Admin', 'Finance Controller'] }
  ];

  const demoRoles = ['Admin', 'Executive', 'Finance Controller', 'Pricing Manager', 'Sales User'];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="p-2 bg-sky-500 rounded-lg text-slate-900 font-extrabold">
              <School className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white flex items-center">
                K-12 Revenue <span className="text-sky-400 font-normal ml-1 text-sm">Intelligence</span>
              </span>
              <p className="text-[10px] text-slate-400 tracking-wider font-semibold uppercase">Education Pricing & Margin Platform</p>
            </div>
          </div>

          {/* Search bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search quotes, price lists, recommendations..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && globalSearch) {
                    navigate(`/pricing?search=${encodeURIComponent(globalSearch)}`);
                  }
                }}
                className="w-full bg-slate-800 text-white placeholder-slate-400 text-xs rounded-lg pl-9 pr-4 py-2 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Header Controls */}
          <div className="flex items-center space-x-4">
            {/* Persona Quick Switcher */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-semibold transition"
              >
                <span className="text-slate-400">Role:</span>
                <span className="text-sky-300">{user?.role}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-slate-800 rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Switch Test Persona
                  </div>
                  {demoRoles.map((r) => (
                    <button
                      key={r}
                      onClick={async () => {
                        setRoleMenuOpen(false);
                        await switchDemoRole(r);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 transition flex items-center justify-between ${
                        user?.role === r ? 'font-bold text-sky-700 bg-sky-50' : 'text-slate-700'
                      }`}
                    >
                      <span>{r}</span>
                      {user?.role === r && <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => setPanelOpen(true)}
              className="relative p-2 text-slate-300 hover:text-white bg-slate-800 rounded-lg hover:bg-slate-700 transition"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* User Profile */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 bg-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-700 transition border border-slate-700"
              >
                <div className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs">
                  {user?.name ? user.name[0] : 'U'}
                </div>
                <span className="text-xs font-semibold hidden md:inline">{user?.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white text-slate-800 rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                    <p className="text-[11px] text-slate-500">{user?.email}</p>
                    <p className="text-[10px] text-sky-600 font-semibold mt-0.5">{user?.department}</p>
                  </div>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                      navigate('/login');
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center font-semibold transition"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        {/* Navigation Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 hidden lg:block flex-shrink-0 p-4 space-y-1">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Intelligence Modules
          </div>
          {navigationItems
            .filter((item) => !item.roles || item.roles.includes(user?.role) || user?.role === 'Admin')
            .map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
                    isActive
                      ? 'bg-sky-50 text-sky-700 font-bold border-l-4 border-sky-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge > 0 && (
                    <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
        </aside>

        {/* Page Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          <Outlet />
        </main>
      </div>

      {/* Notification Slide-Over Panel */}
      {panelOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setPanelOpen(false)}></div>
          <div className="relative w-full max-w-sm bg-white shadow-2xl h-full flex flex-col z-10 animate-in slide-in-from-right duration-200">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-sky-400" />
                <h3 className="font-bold text-sm">Notifications & Alerts</h3>
              </div>
              <button onClick={() => setPanelOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-100 flex items-center justify-between border-b border-slate-200 text-xs font-semibold">
              <span className="text-slate-600">{unreadCount} Unread Alerts</span>
              <div className="space-x-3">
                <button onClick={markAllRead} className="text-sky-700 hover:underline">Mark all read</button>
                <button onClick={clearAll} className="text-slate-500 hover:underline">Clear all</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {notifications.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">No active notifications</div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    onClick={() => {
                      markAsRead(n._id);
                      if (n.link) navigate(n.link);
                      setPanelOpen(false);
                    }}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition ${
                      n.isRead ? 'bg-white border-slate-200 opacity-70' : 'bg-sky-50/70 border-sky-200 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900">{n.title}</span>
                      <span className="text-[10px] text-slate-400">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-slate-600 text-[11px]">{n.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
