import React, { useState, useEffect } from 'react';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';
import { Users, Plus, Search, Filter, Shield, UserCheck, UserX, Lock } from 'lucide-react';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [newUserModal, setNewUserModal] = useState(false);

  // New user form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Password123!');
  const [role, setRole] = useState('Pricing Manager');
  const [department, setDepartment] = useState('Revenue Optimization');
  const [schoolCampus, setSchoolCampus] = useState('Oakridge Main Campus');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        search,
        role: roleFilter,
        status: statusFilter
      });
      const res = await api.get(`/users?${queryParams.toString()}`);
      setUsers(res.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, statusFilter]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', { name, email, password, role, department, schoolCampus });
      setNewUserModal(false);
      setName('');
      setEmail('');
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create user');
    }
  };

  const handleToggleUserActive = async (id, currentActive, currentRole) => {
    try {
      await api.put(`/users/${id}`, { isActive: !currentActive, role: currentRole });
      fetchUsers();
    } catch (err) {
      alert('Failed to update user status');
    }
  };

  const handleRoleChange = async (id, newRole, currentActive) => {
    try {
      await api.put(`/users/${id}`, { role: newRole, isActive: currentActive });
      fetchUsers();
    } catch (err) {
      alert('Failed to update user role');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">User & Role Permission Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">Least-Privilege RBAC Security Matrix & Multi-Campus Access Governance</p>
        </div>

        <button
          onClick={() => setNewUserModal(true)}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold shadow-md transition flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff Account</span>
        </button>
      </div>

      {/* Filter Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3 flex-1 min-w-[240px]">
          <div className="relative w-full max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search user name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg font-medium text-slate-700 bg-white"
          >
            <option value="All">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Executive">Executive</option>
            <option value="Finance Controller">Finance Controller</option>
            <option value="Pricing Manager">Pricing Manager</option>
            <option value="Sales User">Sales User</option>
          </select>
        </div>

        <span className="text-slate-500 font-semibold">{users.length} Active Accounts</span>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                <th className="p-3.5">User Profile</th>
                <th className="p-3.5">Department & Campus</th>
                <th className="p-3.5">Assigned Role</th>
                <th className="p-3.5">Account Status</th>
                <th className="p-3.5">Last Login</th>
                <th className="p-3.5 text-right">RBAC Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">Loading user accounts...</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{u.email}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-800">{u.department}</div>
                      <div className="text-[10px] text-slate-500">{u.schoolCampus}</div>
                    </td>
                    <td className="p-3.5">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value, u.isActive)}
                        className="px-2 py-1 border border-slate-300 rounded font-bold text-[11px] text-slate-800 bg-slate-50"
                      >
                        <option value="Sales User">Sales User</option>
                        <option value="Pricing Manager">Pricing Manager</option>
                        <option value="Finance Controller">Finance Controller</option>
                        <option value="Executive">Executive</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </td>
                    <td className="p-3.5">
                      <StatusBadge status={u.isActive ? 'Active' : 'Inactive'} />
                    </td>
                    <td className="p-3.5 text-slate-500">
                      {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Never'}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleToggleUserActive(u._id, u.isActive, u.role)}
                        className={`px-2.5 py-1 rounded font-bold transition text-[11px] ${
                          u.isActive
                            ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                            : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        }`}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New User Modal */}
      {newUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Add Staff User Account</h3>
            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="sjenkins@school.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Default Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded font-medium"
                  >
                    <option value="Sales User">Sales User</option>
                    <option value="Pricing Manager">Pricing Manager</option>
                    <option value="Finance Controller">Finance Controller</option>
                    <option value="Executive">Executive</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Campus</label>
                  <select
                    value={schoolCampus}
                    onChange={(e) => setSchoolCampus(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded font-medium"
                  >
                    <option value="Oakridge Main Campus">Oakridge Main</option>
                    <option value="St. Jude North">St. Jude North</option>
                    <option value="Horizon East">Horizon East</option>
                    <option value="All Campuses">All Campuses</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setNewUserModal(false)}
                  className="px-3 py-1.5 border rounded text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded font-bold"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;
