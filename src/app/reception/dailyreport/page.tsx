"use client";

import ReceptionistDailyReportListApi from "@/lib/api/Reception/Report/DailyReport";
import { useToast } from "@/Components/Toast/ToastContext";
import { SearchableDropdown, DropdownOption } from "@/Components/SearchableDropdown";

import { useState, useEffect } from "react";
import { Filter, ChevronDown, X, Loader2, Calendar, Eye, User, Phone, Stethoscope, CreditCard } from "lucide-react";

// Types
type VisitRow = {
  visitID: number;
  visitNo: number;
  visitDate: string;
  mrNo: string;
  patientName: string;
  phone: string;
  complaint: string;
  diagnosis: string | null;
  premorbids: string | null;
  queueStatus: string;
  totalAmount: number | null;
  paidAmount: number | null;
  balance: number | null;
};

type StatusOption = DropdownOption & { metadata?: { status: string } };

export default function DailyReport() {
  const { showToast } = useToast();

  // Data states
  const [visits, setVisits] = useState<VisitRow[]>([]);
  const [filteredVisits, setFilteredVisits] = useState<VisitRow[]>([]);
  const [selectedVisit, setSelectedVisit] = useState<VisitRow | null>(null);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);

  // Filter states
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date()); // Changed: Initialize with Date object
  const [selectedStatus, setSelectedStatus] = useState<StatusOption | null>(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Modal states
  const [detailModal, setDetailModal] = useState(false);

  // Calculate active filter count
  const activeFilterCount = [
    selectedStatus ? "status" : null,
    search ? "search" : null
  ].filter(Boolean).length;

  const hasActiveFilters = activeFilterCount > 0;

  // Status options
  const statusOptions: StatusOption[] = [
    { id: "all", name: "All Status", label: "All Status", metadata: { status: "all" } },
    { id: "DONE", name: "Done", label: "Done", metadata: { status: "DONE" } },
    { id: "Waiting", name: "Waiting", label: "Waiting", metadata: { status: "Waiting" } },
    { id: "In Progress", name: "In Progress", label: "In Progress", metadata: { status: "In Progress" } },
  ];

  // Load data when date changes
  useEffect(() => {
    loadVisits();
  }, [selectedDate]);

  // Apply filters
  useEffect(() => {
    let result = [...visits];

    // Search filter (Patient Name, MR No, Phone)
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(v => 
        v.patientName?.toLowerCase().includes(q) ||
        v.mrNo?.toLowerCase().includes(q) ||
        v.phone?.toLowerCase().includes(q) ||
        v.complaint?.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (selectedStatus && selectedStatus.metadata?.status !== "all") {
      result = result.filter(v => v.queueStatus === selectedStatus.metadata?.status);
    }

    setFilteredVisits(result);
  }, [visits, search, selectedStatus]);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest('.filter-dropdown') || target.closest('[role="listbox"]')) {
        return;
      }
      if (!target.closest('.filter-container')) {
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFilterDropdown]);

  const loadVisits = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("error", "Authentication token missing");
      return;
    }

    setIsLoading(true);
    try {
      const res = await ReceptionistDailyReportListApi(selectedDate, token as string);
      
    if (!res || !Array.isArray(res)) {
  showToast("error", "Failed to load daily report");
  setVisits([]);
  return;
}
setVisits(res);
      showToast("success", `Loaded ${res.length}  visits for ${selectedDate.toISOString().split('T')[0]}`);
    } catch (error: any) {
      console.error("Error loading daily report:", error);
      showToast("error", error?.message || "Failed to load daily report");
      setVisits([]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedStatus(null);
    // Keep the date as today
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return "—";
    return `Rs. ${amount.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "DONE": return "bg-green-100 text-green-700 border-green-200";
      case "WAITING": return "bg-amber-100 text-amber-700 border-amber-200";
      case "IN PROGRESS": return "bg-blue-100 text-blue-700 border-blue-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // Loading row component
  const TableLoadingRow = () => (
    <tr>
      <td colSpan={8} className="px-6 py-12 text-center">
        <div className="flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          <p className="text-sm text-gray-500">Loading visits...</p>
        </div>
      </td>
    </tr>
  );

  // Empty state component
  const TableEmptyState = () => (
    <tr>
      <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
        <div className="flex flex-col items-center justify-center gap-2">
          <Calendar size={48} className="text-gray-300" />
          <p className="text-lg font-medium">No Visits Found</p>
          <p className="text-sm text-gray-400">No visits recorded for {selectedDate.toISOString().split('T')[0]}</p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-2 text-sm text-blue-600 hover:underline"
            >
              Clear filters to see all visits
            </button>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header Card - No HeadBar, Direct Listing */}
      <div className="bg-white rounded-2xl shadow-xl border flex flex-col min-h-0 overflow-hidden">
        
        {/* Header Section */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 bg-[#2B2C2B] text-white flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-semibold truncate">Daily Report</p>
                <p className="text-xs text-white/70 truncate">Reception visits overview</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Date Picker - CHANGED HERE */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20">
                <input
                  type="date"
                  value={selectedDate.toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="bg-transparent text-white text-sm outline-none [&::-webkit-calendar-picker-indicator]:invert"
                />
              </div>

              {/* Total Count */}
              <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-sm">
                  <User className="w-4 h-4" />
                </div>
                <div className="leading-tight">
                  <p className="text-xs text-white/60">Total Visits</p>
                  <p className="text-sm font-semibold">
                    {isLoading ? "..." : filteredVisits.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="p-3 sm:p-4 border-b bg-gray-50 flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
            {/* Search */}
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by patient name, MR no, phone..."
              className="px-4 py-2.5 rounded-lg border bg-white text-sm outline-none focus:ring-2 focus:ring-black flex-1 max-w-md"
            />

            {/* Filter Dropdown */}
            <div className="relative filter-container">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border bg-white text-sm hover:bg-gray-50 whitespace-nowrap ${hasActiveFilters ? "border-black ring-1 ring-black" : ""}`}
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {hasActiveFilters && (
                  <span className="bg-black text-white text-xs px-2 py-0.5 rounded-full">
                    {activeFilterCount}
                  </span>
                )}
                <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showFilterDropdown ? "rotate-180" : ""}`} />
              </button>

              {/* Filter Dropdown Content */}
              {showFilterDropdown && (
                <div className="filter-dropdown absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border z-[100] overflow-y-auto min-h-[60vh]">
                  {/* Status Filter */}
                  <div className="p-4 border-b">
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                      Filter by Status
                    </label>
                    <SearchableDropdown
                      options={statusOptions}
                      value={selectedStatus}
                      onChange={(option) => setSelectedStatus(option as StatusOption)}
                      placeholder="Select status..."
                      emptyMessage="No status options"
                    />
                  </div>

                  {/* Clear Filters */}
                  {hasActiveFilters && (
                    <div className="p-4">
                      <button
                        onClick={clearFilters}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 text-sm"
                      >
                        <X className="w-4 h-4" />
                        Clear All Filters
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="flex-1 overflow-y-auto hidden md:block min-h-[400px]">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-100 text-xs uppercase text-gray-600">
              <tr>
                <th className="px-4 lg:px-6 py-3 lg:py-4 text-left w-12">#</th>
                <th className="px-4 lg:px-6 py-3 lg:py-4 text-left">Visit No</th>
                <th className="px-4 lg:px-6 py-3 lg:py-4 text-left">Patient</th>
                <th className="px-4 lg:px-6 py-3 lg:py-4 text-left">MR No</th>
                <th className="px-4 lg:px-6 py-3 lg:py-4 text-left">Status</th>
                <th className="px-4 lg:px-6 py-3 lg:py-4 text-left">Balance</th>
                <th className="px-4 lg:px-6 py-3 lg:py-4 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {isLoading ? (
                <TableLoadingRow />
              ) : filteredVisits.length > 0 ? (
                filteredVisits.map((visit, i) => {
                  const dateTime = formatDateTime(visit.visitDate);
                  return (
                    <tr key={`${visit.visitID}-${i}`} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-500">{i + 1}</td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900">{visit.visitNo}</span>
                         
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">{visit.patientName}</span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                          
                          </span>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4">
                        <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-mono">
                          {visit.mrNo}
                        </span>
                      </td>
                   
                      <td className="px-4 lg:px-6 py-3 lg:py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 text-xs rounded-full border ${getStatusColor(visit.queueStatus)}`}>
                          {visit.queueStatus}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4">
                        <span className={`font-medium ${(visit.balance || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {formatCurrency(visit.balance)}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-center">
                        <button
                          onClick={() => {
                            setSelectedVisit(visit);
                            setDetailModal(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-black text-white hover:bg-gray-800 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <TableEmptyState />
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="flex-1 overflow-y-auto md:hidden bg-gray-50 min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 p-8">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              <p className="text-sm text-gray-500">Loading visits...</p>
            </div>
          ) : filteredVisits.length > 0 ? (
            <div className="p-3 space-y-3">
              {filteredVisits.map((visit, i) => {
                const dateTime = formatDateTime(visit.visitDate);
                return (
                  <div key={`${visit.visitID}-${i}`} className="bg-white rounded-xl shadow-sm border p-4 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 text-gray-600 text-xs font-medium flex items-center justify-center">
                          {i + 1}
                        </span>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm">{visit.patientName}</h3>
                          <p className="text-xs text-gray-500">Visit #{visit.visitNo} </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(visit.queueStatus)}`}>
                        {visit.queueStatus}
                      </span>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-gray-50 rounded-lg p-2.5">
                        <span className="text-gray-400 block mb-0.5">MR No</span>
                        <span className="font-medium text-gray-700 font-mono">{visit.mrNo}</span>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-2.5">
                        <span className="text-blue-400 block mb-0.5">Phone</span>
                        <span className="font-medium text-blue-700">{visit.phone}</span>
                      </div>
                     
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="text-xs">
                        <span className="text-gray-400">Balance: </span>
                        <span className={`font-semibold ${(visit.balance || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {formatCurrency(visit.balance)}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedVisit(visit);
                          setDetailModal(true);
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg bg-black text-white hover:bg-gray-800"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-400 text-sm">
              <div className="flex flex-col items-center justify-center gap-2">
                <Calendar size={48} className="text-gray-300" />
                <p className="text-lg font-medium text-gray-600">No Visits Found</p>
                <p className="text-gray-400">No visits recorded for {selectedDate.toISOString().split('T')[0]}</p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-2 text-sm text-blue-600 hover:underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {detailModal && selectedVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDetailModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg z-50 mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Visit Details</h3>
                <p className="text-xs text-gray-500">Visit #{selectedVisit.visitNo} • {formatDateTime(selectedVisit.visitDate).date}</p>
              </div>
             
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Patient Info */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <User className="w-4 h-4" /> Patient Information
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500 block text-xs">Name</span>
                    <span className="font-medium text-gray-900">{selectedVisit.patientName}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs">MR Number</span>
                    <span className="font-medium text-gray-900 font-mono">{selectedVisit.mrNo}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs">Phone</span>
                    <span className="font-medium text-gray-900">{selectedVisit.phone}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs">Visit ID</span>
                    <span className="font-medium text-gray-900">{selectedVisit.visitID}</span>
                  </div>
                </div>
              </div>

              {/* Medical Info */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4" /> Medical Details
                </h4>
                <div className="space-y-3">
                  <div className="bg-amber-50 rounded-lg p-3">
                    <span className="text-amber-600 block text-xs font-medium mb-1">Complaint</span>
                    <span className="text-gray-900 text-sm">{selectedVisit.complaint || "—"}</span>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <span className="text-blue-600 block text-xs font-medium mb-1">Diagnosis</span>
                    <span className="text-gray-900 text-sm">{selectedVisit.diagnosis || "—"}</span>
                  </div>
                  {selectedVisit.premorbids && (
                    <div className="bg-purple-50 rounded-lg p-3">
                      <span className="text-purple-600 block text-xs font-medium mb-1">Premorbids</span>
                      <span className="text-gray-900 text-sm">{selectedVisit.premorbids}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status & Payment */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <span className="text-gray-500 block text-xs mb-1">Queue Status</span>
                  <span className={`inline-flex items-center px-2.5 py-1 text-xs rounded-full border ${getStatusColor(selectedVisit.queueStatus)}`}>
                    {selectedVisit.queueStatus}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <span className="text-gray-500 block text-xs mb-1">Visit Date</span>
                  <span className="font-medium text-gray-900 text-sm">
                    {formatDateTime(selectedVisit.visitDate).date}
                  </span>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-gray-900 rounded-xl p-4 text-white">
                <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
                  <CreditCard className="w-4 h-4" /> Payment Summary
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Amount</span>
                    <span className="font-medium">{formatCurrency(selectedVisit.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Paid Amount</span>
                    <span className="font-medium text-green-400">{formatCurrency(selectedVisit.paidAmount)}</span>
                  </div>
                  <div className="border-t border-gray-700 pt-2 flex justify-between">
                    <span className="text-gray-300">Balance</span>
                    <span className={`font-bold ${(selectedVisit.balance || 0) > 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {formatCurrency(selectedVisit.balance)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end">
              <button
                onClick={() => setDetailModal(false)}
                className="px-5 py-2.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}