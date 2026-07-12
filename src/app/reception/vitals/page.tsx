"use client";

import VitalListApi from "@/lib/api/Common/Vitals/VitalList";
import VitalUpdateApi from "@/lib/api/Common/Vitals/VitalUpdate";
import ReceptionistDailyReportListApi from "@/lib/api/Reception/Report/DailyReport";
import { useToast } from "@/Components/Toast/ToastContext";
import { SearchableDropdown, DropdownOption } from "@/Components/SearchableDropdown";
import HeadBar from "@/Components/headbar";
import { useState, useEffect } from "react";
import SaveButton from "@/Components/button"
import {
  Filter,
  ChevronDown,
  X,
  Loader2,
  Eye,
  Activity,
  Thermometer,
  Heart,
  Wind,
  Droplets,
  Ruler,
  Weight,
  Stethoscope,
  User,
  Calendar,
  FileText,
  Search
} from "lucide-react";

// Types
type VitalRow = {
  vitalID: any;
  visitID: number;
  recordedAt: string;
  temperature: number;
  pulse: number;
  bloodPressure: string;
  respiratoryRate: number;
  oxygenSaturation: number;
  weight: number;
  height: number;
};

type VisitData = {
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
  totalAmount: number;
  paidAmount: number;
  balance: number;
};

type VisitOption = DropdownOption & { metadata?: { visitID: number } };

export default function Vitals() {
  const { showToast } = useToast();

  // Data states
  const [vitals, setVitals] = useState<VitalRow[]>([]);
  const [selectedVital, setSelectedVital] = useState<VitalRow | null>(null);
  const [visits, setVisits] = useState<VisitData[]>([]);
  const [filteredVitals, setFilteredVitals] = useState<VitalRow[]>([]);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingVisits, setIsLoadingVisits] = useState(false);

  // View states
  const [activeTab, setActiveTab] = useState<"list" | "add">("list");

  // Filter states
  const [search, setSearch] = useState("");
  const [selectedVisitFilter, setSelectedVisitFilter] = useState<VisitOption | null>(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Modal states
  const [detailModal, setDetailModal] = useState(false);

  // Form states
  const [selectedVisit, setSelectedVisit] = useState<VisitOption | null>(null);
  const [visitOptions, setVisitOptions] = useState<VisitOption[]>([]);

  // Form fields
  const [temperature, setTemperature] = useState("");
  const [pulse, setPulse] = useState("");
  const [bloodPressure, setBloodPressure] = useState("");
  const [respiratoryRate, setRespiratoryRate] = useState("");
  const [oxygenSaturation, setOxygenSaturation] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");

  // Calculate active filter count
  const activeFilterCount = [
    selectedVisitFilter ? "visit" : null,
    search ? "search" : null
  ].filter(Boolean).length;

  const hasActiveFilters = activeFilterCount > 0;

  // Load visits from DailyReport on mount
  useEffect(() => {
    loadVisitsFromDailyReport();
  }, []);

  // Generate visit options when visits data changes
  useEffect(() => {
    const options: VisitOption[] = visits.map((visit, idx) => ({
      id: idx,
      name: `${visit.patientName} (Visit #${visit.visitID})`,
      label: `${visit.patientName} (Visit #${visit.visitID})`,
      metadata: { visitID: visit.visitID }
    }));
    setVisitOptions(options);
  }, [visits]);

  // Apply filters
  useEffect(() => {
    let result = [...vitals];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(v => {
        const visit = visits.find(vis => vis.visitID === v.visitID);
        return (
          v.vitalID.toString().includes(q) ||
          v.visitID.toString().includes(q) ||
          v.bloodPressure?.toLowerCase().includes(q) ||
          visit?.patientName?.toLowerCase().includes(q)
        );
      });
    }

    if (selectedVisitFilter) {
      result = result.filter(v => v.visitID === selectedVisitFilter.metadata?.visitID);
    }

    setFilteredVitals(result);
  }, [vitals, search, selectedVisitFilter, visits]);

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

    const isMobile = window.innerWidth < 640;
    if (showFilterDropdown && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [showFilterDropdown]);

  // Load visits from DailyReport API
  const loadVisitsFromDailyReport = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("error", "Authentication token missing");
      return;
    }
    const today = new Date()
    setIsLoadingVisits(true);
    try {
      const res = await ReceptionistDailyReportListApi(today as Date, token);

      if (!res || !Array.isArray(res)) {
        showToast("error", "Failed to load visits");
        return;
      }

      setVisits(res);
      showToast("success", `Loaded ${res.length} visits`);
    } catch (error: any) {
      console.error("Error loading visits:", error);
      showToast("error", error?.message || "Failed to load visits");
    } finally {
      setIsLoadingVisits(false);
    }
  };

  // Load vitals for a specific visit
  const loadVitalsByVisit = async (visitID: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("error", "Authentication token missing");
      return;
    }

    setIsLoading(true);
    try {
      const res = await VitalListApi(visitID, token);

      if (!res || !Array.isArray(res)) {
        showToast("error", "Failed to load vitals");
        return;
      }

      setVitals(res);

      // NEW: If vitals exist for this visit, populate the form with the first one (most recent)
      if (res.length > 0) {
        const existingVital = res[0]; // Take the first vital record
        setSelectedVital(existingVital);

        // Populate form fields with existing vital data
        setTemperature(existingVital.temperature.toString());
        setPulse(existingVital.pulse.toString());
        setBloodPressure(existingVital.bloodPressure);
        setRespiratoryRate(existingVital.respiratoryRate.toString());
        setOxygenSaturation(existingVital.oxygenSaturation.toString());
        setWeight(existingVital.weight.toString());
        setHeight(existingVital.height.toString());

        showToast("success", `Loaded ${res.length} vitals for Visit #${visitID}. Existing vital data populated for editing.`);
      } else {
        // No existing vitals - clear form for new entry
        setSelectedVital(null);
        setTemperature("");
        setPulse("");
        setBloodPressure("");
        setRespiratoryRate("");
        setOxygenSaturation("");
        setWeight("");
        setHeight("");
        showToast("success", `No existing vitals found for Visit #${visitID}. Enter new vital data.`);
      }
    } catch (error: any) {
      console.error("Error loading vitals:", error);
      showToast("error", error?.message || "Failed to load vitals");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveVital = async () => {
    if (!selectedVisit) {
      showToast("error", "Please select a visit first");
      return;
    }

    if (!temperature || !pulse || !bloodPressure) {
      showToast("error", "Temperature, Pulse, and Blood Pressure are required");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      showToast("error", "Authentication token missing");
      return;
    }

    setIsSaving(true);
    try {
      const vitalData = {
       
      };

      await VitalUpdateApi( { vitalID: selectedVital?.vitalID,
        temperature: parseFloat(temperature),
        pulse: parseInt(pulse),
        bloodPressure: bloodPressure,
        respiratoryRate: parseInt(respiratoryRate) || 0,
        oxygenSaturation: parseInt(oxygenSaturation) || 0,
        weight: parseFloat(weight) || 0,
        height: parseFloat(height) || 0,} , token);

      showToast("success", selectedVital ? "Vitals updated successfully" : "Vitals added successfully");
      resetForm();
      loadVitalsByVisit(selectedVisit.metadata?.visitID || 0);
    } catch (error: any) {
      console.error("Error saving vitals:", error);
      showToast("error", error?.message || "Failed to save vitals");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditVital = (vital: VitalRow) => {
    setSelectedVital(vital);

    const visitData = visits.find(v => v.visitID === vital.visitID);
    const visitOpt = visitOptions.find(v => v.metadata?.visitID === vital.visitID) || {
      id: vital.visitID,
      name: visitData ? `${visitData.patientName} (Visit #${vital.visitID})` : `Visit #${vital.visitID}`,
      label: visitData ? `${visitData.patientName} (Visit #${vital.visitID})` : `Visit #${vital.visitID}`,
      metadata: { visitID: vital.visitID }
    };
    setSelectedVisit(visitOpt);

    setTemperature(vital.temperature.toString());
    setPulse(vital.pulse.toString());
    setBloodPressure(vital.bloodPressure);
    setRespiratoryRate(vital.respiratoryRate.toString());
    setOxygenSaturation(vital.oxygenSaturation.toString());
    setWeight(vital.weight.toString());
    setHeight(vital.height.toString());

    setActiveTab("add");
  };

  const handleViewVital = (vital: VitalRow) => {
    setSelectedVital(vital);
    setDetailModal(true);
  };

  const resetForm = () => {
    setSelectedVital(null);
    setSelectedVisit(null);
    setTemperature("");
    setPulse("");
    setBloodPressure("");
    setRespiratoryRate("");
    setOxygenSaturation("");
    setWeight("");
    setHeight("");
    setActiveTab("list");
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedVisitFilter(null);
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getPatientName = (visitID: number) => {
    const visit = visits.find(v => v.visitID === visitID);
    return visit?.patientName || `Visit #${visitID}`;
  };

  const TableLoadingRow = () => (
    <tr>
      <td colSpan={9} className="px-6 py-12 text-center">
        <div className="flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          <p className="text-sm text-gray-500">Loading vitals...</p>
        </div>
      </td>
    </tr>
  );

  const TableEmptyState = () => (
    <tr>
      <td colSpan={9} className="px-6 py-12 text-center text-gray-400">
        <div className="flex flex-col items-center justify-center gap-2">
          <Activity size={48} className="text-gray-300" />
          <p className="text-lg font-medium">No Vitals Found</p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-2 text-sm text-blue-600 hover:underline"
            >
              Clear filters to see all vitals
            </button>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="mb-3 sm:mb-5 mt-5 sm:mt-0 flex-shrink-0">
        <HeadBar
          list="Vitals"
          add=" Record Vitals"
          active={activeTab === "add" ? "left" : "right"}
          onLeftClick={() => setActiveTab("add")}
          onRightClick={() => setActiveTab("list")}
        />
      </div>

      {activeTab === "add" && (
        <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-2xl p-4 sm:p-6 lg:p-10 overflow-auto min-h-0">
          <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10 border">
            <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-black text-white flex items-center justify-center text-lg sm:text-xl flex-shrink-0">
                <Stethoscope />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold truncate">
                  {selectedVital ? "Update Vitals" : "Record Vitals"}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 truncate">
                  Enter patient vital signs
                </p>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Select Visit <span className="text-red-500">*</span>
                </label>
                <SearchableDropdown
                  options={visitOptions}
                  value={selectedVisit}
                  onChange={(option) => {
                    setSelectedVisit(option as VisitOption);
                    if ((option as VisitOption)?.metadata?.visitID) {
                      loadVitalsByVisit((option as VisitOption).metadata!.visitID);
                    }
                  }}
                  placeholder={isLoadingVisits ? "Loading visits..." : "Search patient or visit..."}
                  emptyMessage="No visits available"
                />
                {isLoadingVisits && (
                  <p className="mt-1 text-xs text-gray-400 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Loading visits from daily report...
                  </p>
                )}
              </div>

              {selectedVisit && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">
                        {getPatientName(selectedVisit.metadata?.visitID || 0)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Visit ID: #{selectedVisit.metadata?.visitID} | MR No:
                        {visits.find(v => v.visitID === selectedVisit.metadata?.visitID)?.mrNo || 'N/A'}
                      </p>
                      {visits.find(v => v.visitID === selectedVisit.metadata?.visitID)?.complaint && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          <FileText className="w-3 h-3 inline mr-1" />
                          {visits.find(v => v.visitID === selectedVisit.metadata?.visitID)?.complaint}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                    <Thermometer className="w-4 h-4 text-amber-500" />
                    Temperature <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                      className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl border bg-gray-50 focus:ring-2 focus:ring-black outline-none text-sm sm:text-base"
                      placeholder="36.5"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">°C</span>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                    <Heart className="w-4 h-4 text-red-500" />
                    Pulse <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={pulse}
                      onChange={(e) => setPulse(e.target.value)}
                      className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl border bg-gray-50 focus:ring-2 focus:ring-black outline-none text-sm sm:text-base"
                      placeholder="72"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">bpm</span>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                    <Activity className="w-4 h-4 text-purple-500" />
                    Blood Pressure <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={bloodPressure}
                    onChange={(e) => setBloodPressure(e.target.value)}
                    className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl border bg-gray-50 focus:ring-2 focus:ring-black outline-none text-sm sm:text-base"
                    placeholder="120/80"
                  />
                  <p className="mt-1 text-xs text-gray-400">Format: Systolic/Diastolic</p>
                </div>

                <div>
                  <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                    <Wind className="w-4 h-4 text-blue-500" />
                    Respiratory Rate
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={respiratoryRate}
                      onChange={(e) => setRespiratoryRate(e.target.value)}
                      className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl border bg-gray-50 focus:ring-2 focus:ring-black outline-none text-sm sm:text-base"
                      placeholder="16"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">/min</span>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                    <Droplets className="w-4 h-4 text-cyan-500" />
                    Oxygen Saturation
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={oxygenSaturation}
                      onChange={(e) => setOxygenSaturation(e.target.value)}
                      className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl border bg-gray-50 focus:ring-2 focus:ring-black outline-none text-sm sm:text-base"
                      placeholder="98"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                    <Weight className="w-4 h-4 text-green-500" />
                    Weight
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl border bg-gray-50 focus:ring-2 focus:ring-black outline-none text-sm sm:text-base"
                      placeholder="70.5"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kg</span>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                    <Ruler className="w-4 h-4 text-indigo-500" />
                    Height
                  </label>
                  <div className="relative max-w-xs">
                    <input
                      type="number"
                      step="0.1"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl border bg-gray-50 focus:ring-2 focus:ring-black outline-none text-sm sm:text-base"
                      placeholder="175"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">cm</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 mt-6 sm:mt-8">
              <button
                onClick={resetForm}
                className="px-5 sm:px-6 py-3 rounded-xl text-gray-600 hover:bg-gray-100 text-sm sm:text-base w-full sm:w-auto"
              >
                Cancel
              </button>
              <SaveButton
                text={selectedVital ? "Update Vitals" : "Save Vitals"}
                onClick={handleSaveVital}
                loading={isSaving}
                disabled={!selectedVisit || !temperature || !pulse || !bloodPressure}
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === "list" && (
        <div className="flex-1 bg-white rounded-2xl shadow-xl border flex flex-col min-h-0">
          <div className="px-4 sm:px-6 py-4 sm:py-5 bg-[#2B2C2B] text-white rounded-t-2xl flex-shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Activity className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-semibold truncate">Vitals Records</p>
                  <p className="text-xs text-white/70 truncate">Patient vital signs history</p>
                </div>
              </div>

              <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-sm">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div className="leading-tight">
                  <p className="text-xs text-white/60">Total Records</p>
                  <p className="text-sm font-semibold">
                    {isLoading ? "..." : filteredVitals.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 sm:p-4 border-b bg-gray-50 flex-shrink-0">
            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by patient name, vital ID, visit ID, or BP..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-white text-sm outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              {/* Visit Dropdown */}
              <div className="w-full lg:w-72">
                 <SearchableDropdown
            options={visitOptions}
            value={selectedVisitFilter}
            onChange={(option) => {
              setSelectedVisitFilter(option as VisitOption);
              // ADD THIS LINE:
              if ((option as VisitOption)?.metadata?.visitID) {
                loadVitalsByVisit((option as VisitOption).metadata!.visitID);
              }
            }}
            placeholder="Select Visit..."
            emptyMessage="No visits found"
          />
              </div>

              {/* Filter Button */}
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

                {showFilterDropdown && (
                  <div className="filter-dropdown absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border z-[100] overflow-y-auto max-h-[70vh]">
                    <div className="p-4 border-b">
                      <h3 className="font-semibold text-gray-900 mb-3">Filter Options</h3>
                      
                      {/* Date Range Filter */}
                      <div className="mb-4">
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                          Date Range
                        </label>
                        <div className="space-y-2">
                          <input
                            type="date"
                            className="w-full px-3 py-2 rounded-lg border bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-black"
                            placeholder="From Date"
                          />
                          <input
                            type="date"
                            className="w-full px-3 py-2 rounded-lg border bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-black"
                            placeholder="To Date"
                          />
                        </div>
                      </div>

                      {/* Vitals Range Filters */}
                      <div className="mb-4">
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                          Temperature Range (°C)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            step="0.1"
                            placeholder="Min"
                            className="w-full px-3 py-2 rounded-lg border bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-black"
                          />
                          <input
                            type="number"
                            step="0.1"
                            placeholder="Max"
                            className="w-full px-3 py-2 rounded-lg border bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-black"
                          />
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                          Pulse Range (bpm)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder="Min"
                            className="w-full px-3 py-2 rounded-lg border bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-black"
                          />
                          <input
                            type="number"
                            placeholder="Max"
                            className="w-full px-3 py-2 rounded-lg border bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-black"
                          />
                        </div>
                      </div>

                      {/* Sort Options */}
                      <div className="mb-4">
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                          Sort By
                        </label>
                        <select className="w-full px-3 py-2 rounded-lg border bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-black">
                          <option value="newest">Newest First</option>
                          <option value="oldest">Oldest First</option>
                          <option value="tempHigh">Temperature (High to Low)</option>
                          <option value="tempLow">Temperature (Low to High)</option>
                          <option value="pulseHigh">Pulse (High to Low)</option>
                          <option value="pulseLow">Pulse (Low to High)</option>
                        </select>
                      </div>
                    </div>

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

          <div className="flex-1 overflow-y-auto hidden md:block min-h-[400px]">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-100 text-xs uppercase text-gray-600">
                <tr>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left w-12">#</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left">Vital ID</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left">Patient</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left">Visit ID</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left">Recorded</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left">Temp</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left">Pulse</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left">BP</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-center">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {isLoading ? (
                  <TableLoadingRow />
                ) : filteredVitals.length > 0 ? (
                  filteredVitals.map((vital, i) => {
                    const dateTime = formatDateTime(vital.recordedAt);
                    const patientName = getPatientName(vital.visitID);
                    return (
                      <tr key={vital.vitalID} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-500">{i + 1}</td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          <span className="font-semibold text-gray-900 font-mono">#{vital.vitalID}</span>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="font-medium text-gray-900 truncate">{patientName}</span>
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          <span className="inline-flex items-center px-2.5 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-mono">
                            {vital.visitID}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          <div className="flex flex-col">
                            <span className="text-gray-700">{dateTime.date}</span>
                            <span className="text-xs text-gray-400">{dateTime.time}</span>
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          <span className="inline-flex items-center gap-1 text-amber-600">
                            <Thermometer className="w-3.5 h-3.5" />
                            {vital.temperature}°C
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          <span className="inline-flex items-center gap-1 text-red-600">
                            <Heart className="w-3.5 h-3.5" />
                            {vital.pulse}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          <span className="font-medium text-purple-600">{vital.bloodPressure}</span>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleViewVital(vital)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              View
                            </button>
                            <button
                              onClick={() => handleEditVital(vital)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-black text-white hover:bg-gray-800 transition-colors"
                            >
                              Edit
                            </button>
                          </div>
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

          <div className="flex-1 overflow-y-auto md:hidden bg-gray-50 min-h-[400px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center gap-3 p-8">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                <p className="text-sm text-gray-500">Loading vitals...</p>
              </div>
            ) : filteredVitals.length > 0 ? (
              <div className="p-3 space-y-3">
                {filteredVitals.map((vital, i) => {
                  const dateTime = formatDateTime(vital.recordedAt);
                  const patientName = getPatientName(vital.visitID);
                  return (
                    <div key={vital.vitalID} className="bg-white rounded-xl shadow-sm border p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 text-gray-600 text-xs font-medium flex items-center justify-center">
                            {i + 1}
                          </span>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm truncate">{patientName}</h3>
                            <p className="text-xs text-gray-500">Vital #{vital.vitalID} • Visit #{vital.visitID}</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-amber-50 rounded-lg p-2.5 text-center">
                          <span className="text-amber-600 block mb-0.5"><Thermometer className="w-3 h-3 mx-auto" /></span>
                          <span className="font-medium text-gray-900">{vital.temperature}°C</span>
                        </div>
                        <div className="bg-red-50 rounded-lg p-2.5 text-center">
                          <span className="text-red-600 block mb-0.5"><Heart className="w-3 h-3 mx-auto" /></span>
                          <span className="font-medium text-gray-900">{vital.pulse}</span>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-2.5 text-center">
                          <span className="text-purple-600 block mb-0.5">BP</span>
                          <span className="font-medium text-gray-900">{vital.bloodPressure}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>{dateTime.date} {dateTime.time}</span>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => handleViewVital(vital)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                        <button
                          onClick={() => handleEditVital(vital)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs rounded-lg bg-black text-white hover:bg-gray-800"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400 text-sm">
                <div className="flex flex-col items-center justify-center gap-2">
                  <Activity size={48} className="text-gray-300" />
                  <p className="text-lg font-medium text-gray-600">No Vitals Found</p>
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
      )}

      {detailModal && selectedVital && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDetailModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md z-50 mx-4">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Vital Details</h3>
                <p className="text-xs text-gray-500">Vital #{selectedVital.vitalID}</p>
              </div>
              <button
                onClick={() => setDetailModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{getPatientName(selectedVital.visitID)}</p>
                    <p className="text-xs text-gray-500">Visit ID: #{selectedVital.visitID}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">Recorded At</span>
                  <span className="font-medium text-gray-900">
                    {formatDateTime(selectedVital.recordedAt).date} {formatDateTime(selectedVital.recordedAt).time}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-amber-50 rounded-xl p-4 text-center">
                  <Thermometer className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Temperature</p>
                  <p className="text-lg font-bold text-gray-900">{selectedVital.temperature}°C</p>
                </div>
                <div className="bg-red-50 rounded-xl p-4 text-center">
                  <Heart className="w-5 h-5 text-red-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Pulse</p>
                  <p className="text-lg font-bold text-gray-900">{selectedVital.pulse} bpm</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <Activity className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Blood Pressure</p>
                  <p className="text-lg font-bold text-gray-900">{selectedVital.bloodPressure}</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <Wind className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Respiratory</p>
                  <p className="text-lg font-bold text-gray-900">{selectedVital.respiratoryRate}/min</p>
                </div>
                <div className="bg-cyan-50 rounded-xl p-4 text-center">
                  <Droplets className="w-5 h-5 text-cyan-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">SpO2</p>
                  <p className="text-lg font-bold text-gray-900">{selectedVital.oxygenSaturation}%</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <Weight className="w-5 h-5 text-green-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Weight</p>
                  <p className="text-lg font-bold text-gray-900">{selectedVital.weight} kg</p>
                </div>
              </div>

              <div className="bg-indigo-50 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Ruler className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="text-xs text-gray-500">Height</p>
                    <p className="text-lg font-bold text-gray-900">{selectedVital.height} cm</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <button
                onClick={() => setDetailModal(false)}
                className="px-5 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setDetailModal(false);
                  handleEditVital(selectedVital);
                }}
                className="px-5 py-2 rounded-lg bg-black text-white hover:bg-gray-800 text-sm font-medium transition-colors"
              >
                Edit Vitals
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}