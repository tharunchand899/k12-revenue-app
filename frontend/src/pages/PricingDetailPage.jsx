import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import {
  CircleDollarSign,
  Plus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Layers,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  FileText
} from 'lucide-react';

const PricingDetailPage = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('All');
  const [selectedCampus, setSelectedCampus] = useState('All Campuses');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // New item form state
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newSegment, setNewSegment] = useState('Tuition Fees');
  const [newCampus, setNewCampus] = useState('Oakridge Main Campus');
  const [newGradeLevel, setNewGradeLevel] = useState('Secondary (Grade 9-10)');
  const [newBasePrice, setNewBasePrice] = useState('14500');
  const [newFixedCost, setNewFixedCost] = useState('4200');
  const [newVariableCost, setNewVariableCost] = useState('2800');
  const [newMaxDiscount, setNewMaxDiscount] = useState('12');

  const fetchPricingData = async (page = 1) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page,
        limit: 8,
        search,
        segment: selectedSegment,
        campus: selectedCampus
      });
      const res = await api.get(`/pricing?${queryParams.toString()}`);
      setItems(res.data.items || []);
      setPagination(res.data.pagination || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      console.error('Error fetching pricing list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPricingData(1);
  }, [search, selectedSegment, selectedCampus]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/pricing', {
        name: newName,
        code: newCode,
        segment: newSegment,
        campus: newCampus,
        gradeLevel: newGradeLevel,
        basePrice: newBasePrice,
        fixedCostComponent: newFixedCost,
        variableCostComponent: newVariableCost,
        maxDiscountPercent: newMaxDiscount
      });
      setModalOpen(false);
      fetchPricingData(1);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create price list entry');
    }
  };

  const handleApprovalChange = async (id, status) => {
    try {
      await api.put(`/pricing/${id}/approval`, { approvalStatus: status });
      fetchPricingData(pagination.page);
    } catch (err) {
      alert('Failed to update approval status');
    }
  };

  const canEdit = user?.role === 'Pricing Manager' || user?.role === 'Finance Controller' || user?.role === 'Admin';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Pricing, Cost & Contribution Margins</h1>
          <p className="text-xs text-slate-500 mt-0.5">Master Fee Schedules, Marginal Cost Component Breakdown & Target Margins</p>
        </div>

        {canEdit && (
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold shadow-md transition flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Fee Schedule</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3 flex-1 min-w-[240px]">
          <div className="relative w-full max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search code, grade, name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <select
            value={selectedSegment}
            onChange={(e) => setSelectedSegment(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg font-medium text-slate-700 bg-white focus:outline-none"
          >
            <option value="All">All Streams</option>
            <option value="Tuition Fees">Tuition Fees</option>
            <option value="Transport">Transport</option>
            <option value="Activities">Activities</option>
            <option value="Grants & Subsidies">Grants</option>
            <option value="Facility & Capacity">Facility</option>
          </select>
        </div>

        <span className="text-slate-500 font-semibold">{pagination.total} Active Schedules</span>
      </div>

      {/* Pricing Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                <th className="p-3.5">Fee Schedule / Code</th>
                <th className="p-3.5">Segment & Grade</th>
                <th className="p-3.5">Base Price</th>
                <th className="p-3.5">Fixed / Variable Cost</th>
                <th className="p-3.5">Contribution Margin</th>
                <th className="p-3.5">Max Discount</th>
                <th className="p-3.5">Tier & Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">Loading fee records...</td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">No price lists matching filter criteria.</td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{item.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{item.code} • {item.campus}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-800">{item.segment}</div>
                      <div className="text-[10px] text-slate-500">{item.gradeLevel}</div>
                    </td>
                    <td className="p-3.5 font-bold text-slate-900">
                      ${item.basePrice?.toLocaleString()}
                      <span className="text-[10px] text-slate-400 font-normal block">{item.unit}</span>
                    </td>
                    <td className="p-3.5 text-slate-600">
                      <div>Fixed: ${item.fixedCostComponent?.toLocaleString()}</div>
                      <div>Variable: ${item.variableCostComponent?.toLocaleString()}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-emerald-700">+${item.contributionMargin?.toLocaleString()}</div>
                      <div className="text-[10px] font-semibold text-emerald-600">{item.marginPercentage}% Margin</div>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-800">
                      {item.maxDiscountPercent}% Cap
                    </td>
                    <td className="p-3.5 space-y-1">
                      <StatusBadge status={item.approvalStatus} />
                      <div className="text-[10px] text-slate-500">{item.profitabilityTier}</div>
                    </td>
                    <td className="p-3.5 text-right space-x-1">
                      {canEdit && item.approvalStatus === 'Pending Review' && (
                        <>
                          <button
                            onClick={() => handleApprovalChange(item._id, 'Approved')}
                            className="px-2 py-1 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 rounded font-bold transition text-[11px]"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleApprovalChange(item._id, 'Rejected')}
                            className="px-2 py-1 bg-rose-100 text-rose-800 hover:bg-rose-200 rounded font-bold transition text-[11px]"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">
            Page {pagination.page} of {pagination.pages}
          </span>
          <div className="flex space-x-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => fetchPricingData(pagination.page - 1)}
              className="p-1.5 border border-slate-300 rounded bg-white hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={pagination.page >= pagination.pages}
              onClick={() => fetchPricingData(pagination.page + 1)}
              className="p-1.5 border border-slate-300 rounded bg-white hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal for creating Fee Schedule */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Create New Fee Schedule</h3>
            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Schedule Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grade 11-12 IB Diploma Tuition"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Code</label>
                  <input
                    type="text"
                    required
                    placeholder="PL-IB-G1112"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Segment</label>
                  <select
                    value={newSegment}
                    onChange={(e) => setNewSegment(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded"
                  >
                    <option value="Tuition Fees">Tuition Fees</option>
                    <option value="Transport">Transport</option>
                    <option value="Activities">Activities</option>
                    <option value="Facility & Capacity">Facility</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Base Price ($)</label>
                  <input
                    type="number"
                    required
                    value={newBasePrice}
                    onChange={(e) => setNewBasePrice(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fixed Cost ($)</label>
                  <input
                    type="number"
                    required
                    value={newFixedCost}
                    onChange={(e) => setNewFixedCost(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Var Cost ($)</label>
                  <input
                    type="number"
                    required
                    value={newVariableCost}
                    onChange={(e) => setNewVariableCost(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 border rounded text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded font-bold"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingDetailPage;
