"use client";

import BillingListApi from "@/lib/api/Common/Billing/BillingList";
import BillingTransactionUpdateApi from "@/lib/api/Common/Billing/BillingUpdate";
import BillingTransactionAddApi from "@/lib/api/Common/Billing/BillingAdd";
import ReceptionistDailyReportListApi from "@/lib/api/Reception/Report/DailyReport";
import { useToast } from "@/Components/Toast/ToastContext";
import { SearchableDropdown, DropdownOption } from "@/Components/SearchableDropdown";
import HeadBar from "@/Components/headbar";
import { useState, useEffect } from "react";
import SaveButton, { EditButton } from "@/Components/button"
import { Filter, ChevronDown, X, Loader2, Receipt, CreditCard, Stethoscope, FlaskConical, Pill, MoreHorizontal, Calendar, Plus, User, Search, Activity } from "lucide-react";

type BillingRow = {
  billID: number;
  visitID: number;
  visitNo: number;
  visitDate: string;
  mrNo: string;
  patientName: string;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  type: string;
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

type TransactionType = "Lab" | "Medicine" | "DoctorFee" | "Other";

type VisitOption = DropdownOption & { metadata?: { visitID: number } };

const transactionTypes: { value: TransactionType; label: string; icon: React.ElementType }[] = [
  { value: "DoctorFee", label: "Doctor Fee", icon: Stethoscope },
  { value: "Lab", label: "Lab", icon: FlaskConical },
  { value: "Medicine", label: "Medicine", icon: Pill },
  { value: "Other", label: "Other", icon: MoreHorizontal },
];

/* ===== Premium row selector ===== */
function RowSelect({ checked, onClick }: { checked: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0
      ${checked ? "bg-black border-black" : "bg-white border-gray-300 hover:border-gray-400"}`}
    >
      {checked && <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white" />}
    </button>
  );
}

/* ===== Mobile Billing Card Component ===== */
function MobileBillingCard({
  bill,
  index,
  isSelected,
  onToggleSelect,
  onUpdate,
}: {
  bill: BillingRow;
  index: number;
  isSelected: boolean;
  onToggleSelect: () => void;
  onUpdate: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTypeIcon = (type: string) => {
    const found = transactionTypes.find(t => t.value === type || t.label === type);
    return found ? found.icon : MoreHorizontal;
  };

  const TypeIcon = getTypeIcon(bill.type);

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 space-y-3">
      {/* Header: Number + Patient Name + Selector */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs font-medium flex items-center justify-center">
            {index + 1}
          </span>
          <h3 className="font-semibold text-gray-900 text-sm leading-tight break-words">
            {bill.patientName}
          </h3>
        </div>
        <RowSelect checked={isSelected} onClick={onToggleSelect} />
      </div>

      {/* Type Badge */}
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
          <TypeIcon className="w-3 h-3" />
          {bill.type}
        </span>
      </div>

      {/* Info Grid - Show only 2 fields by default */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-gray-50 rounded-lg p-2">
          <span className="text-gray-400 block mb-0.5">MR No</span>
          <span className="font-medium text-gray-700">{bill.mrNo}</span>
        </div>
        <div className="bg-blue-50 rounded-lg p-2">
          <span className="text-blue-400 block mb-0.5">Visit No</span>
          <span className="font-medium text-blue-700">#{bill.visitNo}</span>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="grid grid-cols-2 gap-2 text-xs animate-in slide-in-from-top-2 duration-200">
          <div className="bg-purple-50 rounded-lg p-2">
            <span className="text-purple-400 block mb-0.5">Bill ID</span>
            <span className="font-medium text-purple-700">#{bill.billID}</span>
          </div>
          <div className="bg-green-50 rounded-lg p-2">
            <span className="text-green-400 block mb-0.5">Visit Date</span>
            <span className="font-medium text-green-700">{formatDate(bill.visitDate)}</span>
          </div>
          <div className="bg-orange-50 rounded-lg p-2">
            <span className="text-orange-400 block mb-0.5">Total Amount</span>
            <span className="font-medium text-orange-700">Rs. {bill.totalAmount.toLocaleString()}</span>
          </div>
          <div className="bg-pink-50 rounded-lg p-2">
            <span className="text-pink-400 block mb-0.5">Balance</span>
            <span className={`font-medium ${bill.balance > 0 ? "text-pink-700" : "text-green-600"}`}>
              Rs. {bill.balance.toLocaleString()}
            </span>
          </div>
          <div className="bg-gray-100 rounded-lg p-2 col-span-2">
            <span className="text-gray-400 block mb-0.5">Paid Amount</span>
            <span className="font-medium text-gray-700">Rs. {bill.paidAmount.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Show More/Less Button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-1 py-2 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
      >
        {expanded ? (
          <>
            Show Less
            <ChevronDown className="w-4 h-4 rotate-180" />
          </>
        ) : (
          <>
            Show More
            <ChevronDown className="w-4 h-4" />
          </>
        )}
      </button>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <EditButton text="Update" onClick={onUpdate} />
      </div>
    </div>
  );
}

export default function Billing() {
  const [activeTab, setActiveTab] = useState<"list" | "add" | "update">("list");
  const [selected, setSelected] = useState<number[]>([]);
  
  // Update form states
  const [selectedBill, setSelectedBill] = useState<BillingRow | null>(null);
  
  // Add form states
  const [transactionType, setTransactionType] = useState<TransactionType>("DoctorFee");
  const [addFormTotalAmount, setAddFormTotalAmount] = useState<number>(0);
  const [addFormPaidAmount, setAddFormPaidAmount] = useState<number>(0);
  const [addFormPaymentMode, setAddFormPaymentMode] = useState<string>("Cash");
  const [addFormRemarks, setAddFormRemarks] = useState<string>("");
  
  // Visit selection states
  const [visits, setVisits] = useState<VisitData[]>([]);
  const [visitOptions, setVisitOptions] = useState<VisitOption[]>([]);
  const [selectedVisit, setSelectedVisit] = useState<VisitOption | null>(null);
  const [selectedUpdateVisit, setSelectedUpdateVisit] = useState<VisitOption | null>(null);
  const [visitBills, setVisitBills] = useState<BillingRow[]>([]);
  const [isLoadingVisits, setIsLoadingVisits] = useState(false);

  // Search and filter states
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"az" | "za">("az");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Data states
  const [bills, setBills] = useState<BillingRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingBills, setIsLoadingBills] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { showToast } = useToast();

  // Calculate active filter count
  const activeFilterCount = [
    sort !== "az" ? "sort" : null,
    !isToday(selectedDate) ? "date" : null
  ].filter(Boolean).length;
  const hasActiveFilters = activeFilterCount > 0;

  // Helper to check if date is today
  function isToday(date: Date) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  }

  // Load visits on mount
  useEffect(() => {
    loadVisits();
  }, []);

  // Generate visit options when visits data changes
  useEffect(() => {
    const options: VisitOption[] = visits.map((visit, idx) => ({
      id: idx,
      name: `${visit.patientName} (MR: ${visit.mrNo} - Visit #${visit.visitID})`,
      label: `${visit.patientName} (MR: ${visit.mrNo} - Visit #${visit.visitID})`,
      metadata: { visitID: visit.visitID }
    }));
    setVisitOptions(options);
  }, [visits]);

  // Filter and sort bills
  const filtered = bills
    .filter((b) => {
      const patientNameLower = b.patientName?.toLowerCase() || "";
      const mrNoLower = b.mrNo?.toLowerCase() || "";
      const q = search.toLowerCase();

      const matchesSearch =
        patientNameLower.includes(q) ||
        mrNoLower.includes(q) ||
        b.billID.toString().includes(q) ||
        b.type?.toLowerCase().includes(q);

      return matchesSearch;
    })
    .sort((a, b) => {
      const nameA = a.patientName || "";
      const nameB = b.patientName || "";
      return sort === "az"
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    });

  // Get existing bill types for selected visit
  const getExistingBillTypes = () => {
    if (!selectedVisit) return [];
    return visitBills
      .filter(b => b.visitID === selectedVisit.metadata?.visitID)
      .map(b => b.type);
  };

  // Get available types for add form (excluding existing types)
  const getAvailableTypes = () => {
    const existingTypes = getExistingBillTypes();
    return transactionTypes.filter(t => !existingTypes.includes(t.label) && !existingTypes.includes(t.value));
  };

  // Load bills on mount and when date changes
  useEffect(() => {
    loadBills();
  }, [selectedDate]);

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

  const loadVisits = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("error", "Authentication token missing");
      return;
    }
    const today = new Date();
    setIsLoadingVisits(true);
    try {
      const res = await ReceptionistDailyReportListApi(today, token);
      if (!res || !Array.isArray(res)) {
        showToast("error", "Failed to load visits");
        return;
      }
      setVisits(res);
    } catch (error: any) {
      console.error("Error loading visits:", error);
      showToast("error", error?.message || "Failed to load visits");
    } finally {
      setIsLoadingVisits(false);
    }
  };

  const loadBills = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("error", "Authentication token missing");
      return;
    }

    setIsLoadingBills(true);
    try {
      const res = await BillingListApi(selectedDate, token);
      if (!res || !Array.isArray(res)) {
        showToast("error", "Failed to load bills - invalid response");
        setBills([]);
        return;
      }
      setBills(res);
    } catch (error: any) {
      console.error("Error loading bills:", error);
      showToast("error", error?.message || "Network error - Failed to load bills");
      setBills([]);
    } finally {
      setIsLoadingBills(false);
    }
  };

  // Load bills for a specific visit
  const loadBillsByVisit = async (visitID: number, isForUpdate: boolean = false) => {
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("error", "Authentication token missing");
      return;
    }

    setIsLoading(true);
    try {
      // Get all bills for today and filter by visit
      const res = await BillingListApi(selectedDate, token);
      if (!res || !Array.isArray(res)) {
        showToast("error", "Failed to load bills");
        return;
      }
      
      const visitBillsData = res.filter((b: BillingRow) => b.visitID === visitID);
      setVisitBills(visitBillsData);
      
      if (isForUpdate && visitBillsData.length === 0) {
        showToast("info", "No bills found for this visit");
      }
    } catch (error: any) {
      console.error("Error loading bills:", error);
      showToast("error", error?.message || "Failed to load bills");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateBill = (bill: BillingRow) => {
    setSelectedBill(bill);
    
    // Set the visit dropdown
    const visitOpt = visitOptions.find(v => v.metadata?.visitID === bill.visitID) || {
      id: bill.visitID,
      name: `${bill.patientName} (MR: ${bill.mrNo} - Visit #${bill.visitID})`,
      label: `${bill.patientName} (MR: ${bill.mrNo} - Visit #${bill.visitID})`,
      metadata: { visitID: bill.visitID }
    };
    setSelectedUpdateVisit(visitOpt);
    
    // Load bills for this visit
    loadBillsByVisit(bill.visitID, true);
    
    setActiveTab("update");
  };

  const handleSaveAdd = async () => {
    if (!selectedVisit) {
      showToast("error", "Please select a visit first");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      showToast("error", "Authentication token missing");
      return;
    }

    if (addFormTotalAmount <= 0) {
      showToast("error", "Please enter a valid amount");
      return;
    }

    if (addFormPaidAmount > addFormTotalAmount) {
      showToast("error", "Paid amount cannot exceed total amount");
      return;
    }

    setIsSaving(true);
    try {
      await BillingTransactionAddApi(
        {
          visitID: selectedVisit.metadata?.visitID || 0,
          totalAmount: addFormTotalAmount,
          paidAmount: addFormPaidAmount,
          type: transactionType,
          paymentMode: addFormPaymentMode,
          remarks: addFormRemarks
        },
        token
      );

      showToast("success", "Billing transaction added successfully");
      resetAddForm();
      loadBills();
      setActiveTab("list");
    } catch (error: any) {
      console.error("Error adding billing:", error);
      showToast("error", error?.message || "Failed to add billing");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveUpdate = async () => {
    if (!selectedBill) {
      showToast("error", "No bill selected");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      showToast("error", "Authentication token missing");
      return;
    }

    setIsSaving(true);
    try {
      await BillingTransactionUpdateApi(
        selectedBill.billID,
        selectedBill.totalAmount,
        token
      );

      showToast("success", "Billing updated successfully");
      resetUpdateForm();
      loadBills();
      setActiveTab("list");
    } catch (error: any) {
      console.error("Error updating billing:", error);
      showToast("error", error?.message || "Failed to update billing");
    } finally {
      setIsSaving(false);
    }
  };

  const resetAddForm = () => {
    setSelectedVisit(null);
    setVisitBills([]);
    setTransactionType("DoctorFee");
    setAddFormTotalAmount(0);
    setAddFormPaidAmount(0);
    setAddFormPaymentMode("Cash");
    setAddFormRemarks("");
  };

  const resetUpdateForm = () => {
    setSelectedBill(null);
    setSelectedUpdateVisit(null);
    setVisitBills([]);
  };

  const clearFilters = () => {
    setSort("az");
    setSearch("");
    setSelectedDate(new Date());
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getPatientInfo = (visitID: number) => {
    const visit = visits.find(v => v.visitID === visitID);
    return visit || null;
  };

  // Loading row component for table
  const TableLoadingRow = () => (
    <tr>
      <td colSpan={11} className="px-6 py-12 text-center">
        <div className="flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          <p className="text-sm text-gray-500">Loading bills...</p>
        </div>
      </td>
    </tr>
  );

  // Empty state component
  const TableEmptyState = () => (
    <tr>
      <td colSpan={11} className="px-6 py-12 text-center text-gray-400">
        <div className="flex flex-col items-center justify-center gap-2">
          <Receipt size={48} />
          <p>No Bills Found</p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:underline"
            >
              Clear filters to see all bills
            </button>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Head Bar - Changed to Add Bill / List */}
      <div className="mb-3 sm:mb-5 mt-5 sm:mt-0 flex-shrink-0">
        <HeadBar
          list="Billing"
          add=" Add Bill"
          active={activeTab === "add" ? "left" : "right"}
          onLeftClick={() => setActiveTab("add")}
          onRightClick={() => setActiveTab("list")}
        />
      </div>

      {/* ADD NEW BILL */}
      {activeTab === "add" && (
        <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-2xl p-4 sm:p-6 lg:p-10 overflow-auto min-h-0">
          <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10 border">
            <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-black text-white flex items-center justify-center text-lg sm:text-xl flex-shrink-0">
                <Plus />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold truncate">
                  Add New Transaction
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 truncate">
                  Create a new billing transaction
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Visit Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                  <div className="flex items-center gap-2">
                    <User className="w-3 h-3" />
                    Select Visit <span className="text-red-500">*</span>
                  </div>
                </label>
                <SearchableDropdown
                  options={visitOptions}
                  value={selectedVisit}
                  onChange={(option) => {
                    setSelectedVisit(option as VisitOption);
                    if ((option as VisitOption)?.metadata?.visitID) {
                      loadBillsByVisit((option as VisitOption).metadata!.visitID, false);
                    }
                  }}
                  placeholder={isLoadingVisits ? "Loading visits..." : "Search patient or visit..."}
                  emptyMessage="No visits available"
                />
                {isLoadingVisits && (
                  <p className="mt-1 text-xs text-gray-400 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Loading visits...
                  </p>
                )}
              </div>

              {/* Patient Info Card */}
              {selectedVisit && (
                <div className="bg-blue-50 rounded-xl p-4 sm:p-5 border border-blue-100">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      {(() => {
                        const patient = getPatientInfo(selectedVisit.metadata?.visitID || 0);
                        return patient ? (
                          <>
                            <p className="font-semibold text-gray-900">{patient.patientName}</p>
                            <p className="text-xs text-gray-500">MR No: {patient.mrNo} | Visit #{patient.visitID}</p>
                            {patient.complaint && (
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                Complaint: {patient.complaint}
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="font-medium text-gray-900">Visit #{selectedVisit.metadata?.visitID}</p>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {/* Existing Bills Warning */}
              {selectedVisit && visitBills.length > 0 && (
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                  <p className="text-sm font-medium text-amber-800 mb-2">
                    Existing bills for this visit:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {visitBills.map(bill => (
                      <span key={bill.billID} className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">
                        {bill.type}: Rs. {bill.totalAmount.toLocaleString()}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-amber-600 mt-2">
                    You can only add bill types not already present.
                  </p>
                </div>
              )}

              {/* Transaction Type Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                  Transaction Type <span className="text-red-500">*</span>
                </label>
                {selectedVisit && getAvailableTypes().length === 0 ? (
                  <div className="p-4 bg-red-50 rounded-xl border border-red-100 text-center">
                    <p className="text-sm text-red-600">
                      All bill types already exist for this visit. Cannot add more.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {transactionTypes.map((type) => {
                      const existingTypes = getExistingBillTypes();
                      const isDisabled = selectedVisit && existingTypes.includes(type.label);
                      const isSelected = transactionType === type.value;
                      
                      return (
                        <button
                          key={type.value}
                          onClick={() => !isDisabled && setTransactionType(type.value)}
                          disabled={!!isDisabled}
                          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all
                            ${isSelected 
                              ? "bg-black text-white shadow-lg" 
                              : isDisabled
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                        >
                          <type.icon className="w-4 h-4" />
                          <span>{type.label}</span>
                          {isDisabled && <span className="text-xs">(Exists)</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Amount Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Total Amount (Rs.) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    value={addFormTotalAmount || ""}
                    onChange={(e) => setAddFormTotalAmount(Number(e.target.value))}
                    placeholder="Enter total amount"
                    className="w-full px-4 py-3 rounded-xl border bg-white text-sm focus:ring-2 focus:ring-black outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Paid Amount (Rs.)</label>
                  <input
                    type="number"
                    value={addFormPaidAmount || ""}
                    onChange={(e) => setAddFormPaidAmount(Number(e.target.value))}
                    placeholder="Enter paid amount"
                    className="w-full px-4 py-3 rounded-xl border bg-white text-sm focus:ring-2 focus:ring-black outline-none"
                  />
                </div>
              </div>

              {/* Payment Mode & Remarks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Payment Mode</label>
                  <select
                    value={addFormPaymentMode}
                    onChange={(e) => setAddFormPaymentMode(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border bg-white text-sm focus:ring-2 focus:ring-black outline-none"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Online">Online</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Remarks</label>
                  <input
                    type="text"
                    value={addFormRemarks}
                    onChange={(e) => setAddFormRemarks(e.target.value)}
                    placeholder="Optional remarks"
                    className="w-full px-4 py-3 rounded-xl border bg-white text-sm focus:ring-2 focus:ring-black outline-none"
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="bg-black text-white p-4 sm:p-5 rounded-xl">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-white/70">Balance Amount</p>
                    <p className="text-2xl font-bold">
                      Rs. {(addFormTotalAmount - addFormPaidAmount).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white/70">Transaction Type</p>
                    <p className="text-lg font-semibold capitalize">
                      {transactionTypes.find(t => t.value === transactionType)?.label}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 pt-4">
                <button
                  onClick={() => {
                    resetAddForm();
                    setActiveTab("list");
                  }}
                  className="px-5 sm:px-6 py-3 rounded-xl text-gray-600 hover:bg-gray-100 text-sm sm:text-base w-full sm:w-auto"
                >
                  Cancel
                </button>
                <SaveButton
                  text="Add Transaction"
                  onClick={handleSaveAdd}
                  loading={isSaving}
                  disabled={!selectedVisit || addFormTotalAmount <= 0 || (selectedVisit && getAvailableTypes().length === 0)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UPDATE BILL */}
      {activeTab === "update" && (
        <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-2xl p-4 sm:p-6 lg:p-10 overflow-auto min-h-0">
          <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10 border">
            <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-black text-white flex items-center justify-center text-lg sm:text-xl flex-shrink-0">
                <CreditCard />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold truncate">
                  Update Billing
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 truncate">
                  Select a bill to update
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Visit Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                  <div className="flex items-center gap-2">
                    <User className="w-3 h-3" />
                    Select Visit <span className="text-red-500">*</span>
                  </div>
                </label>
                <SearchableDropdown
                  options={visitOptions}
                  value={selectedUpdateVisit}
                  onChange={(option) => {
                    setSelectedUpdateVisit(option as VisitOption);
                    setSelectedBill(null);
                    if ((option as VisitOption)?.metadata?.visitID) {
                      loadBillsByVisit((option as VisitOption).metadata!.visitID, true);
                    }
                  }}
                  placeholder={isLoadingVisits ? "Loading visits..." : "Search patient or visit..."}
                  emptyMessage="No visits available"
                />
              </div>

              {/* Patient Info Card */}
              {selectedUpdateVisit && (
                <div className="bg-blue-50 rounded-xl p-4 sm:p-5 border border-blue-100">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      {(() => {
                        const patient = getPatientInfo(selectedUpdateVisit.metadata?.visitID || 0);
                        return patient ? (
                          <>
                            <p className="font-semibold text-gray-900">{patient.patientName}</p>
                            <p className="text-xs text-gray-500">MR No: {patient.mrNo} | Visit #{patient.visitID}</p>
                          </>
                        ) : (
                          <p className="font-medium text-gray-900">Visit #{selectedUpdateVisit.metadata?.visitID}</p>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {/* Bills List for Selection */}
              {selectedUpdateVisit && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-3">
                    Select Bill to Update <span className="text-red-500">*</span>
                  </label>
                  
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2 p-8 bg-gray-50 rounded-xl">
                      <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                      <span className="text-sm text-gray-500">Loading bills...</span>
                    </div>
                  ) : visitBills.length === 0 ? (
                    <div className="p-4 bg-red-50 rounded-xl border border-red-100 text-center">
                      <p className="text-sm text-red-600">No bills found for this visit</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {visitBills.map((bill) => {
                        const typeInfo = transactionTypes.find(t => t.value === bill.type || t.label === bill.type);
                        const TypeIcon = typeInfo?.icon || MoreHorizontal;
                        const isSelected = selectedBill?.billID === bill.billID;
                        
                        return (
                          <button
                            key={bill.billID}
                            onClick={() => setSelectedBill(bill)}
                            className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-left
                              ${isSelected 
                                ? "bg-black text-white border-black" 
                                : "bg-white hover:bg-gray-50 border-gray-200"
                              }`}
                          >
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                              ${isSelected ? "bg-white/20" : "bg-gray-100"}`}>
                              <TypeIcon className={`w-5 h-5 ${isSelected ? "text-white" : "text-gray-600"}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium truncate">{bill.type}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${isSelected ? "bg-white/20" : "bg-gray-100 text-gray-600"}`}>
                                  Bill #{bill.billID}
                                </span>
                              </div>
                              <div className={`text-sm ${isSelected ? "text-white/70" : "text-gray-500"}`}>
                                Total: Rs. {bill.totalAmount.toLocaleString()} | 
                                Paid: Rs. {bill.paidAmount.toLocaleString()} | 
                                Balance: Rs. {bill.balance.toLocaleString()}
                              </div>
                            </div>
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                                <div className="w-2.5 h-2.5 rounded-full bg-black" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Selected Bill Details */}
              {selectedBill && (
                <div className="bg-gray-50 rounded-xl p-4 sm:p-5 border">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4">Update Amount</h4>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-xs text-gray-400 block mb-1">Current Total</span>
                      <span className="font-semibold text-gray-900">Rs. {selectedBill.totalAmount.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block mb-1">Type</span>
                      <span className="font-semibold text-gray-900">{selectedBill.type}</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                      New Total Amount (Rs.)
                    </label>
                    <input
                      type="number"
                      value={selectedBill.totalAmount || ""}
                      onChange={(e) => setSelectedBill({...selectedBill, totalAmount: Number(e.target.value)})}
                      placeholder="Enter new amount"
                      className="w-full px-4 py-3 rounded-xl border bg-white text-sm focus:ring-2 focus:ring-black outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 pt-4">
                <button
                  onClick={resetUpdateForm}
                  className="px-5 sm:px-6 py-3 rounded-xl text-gray-600 hover:bg-gray-100 text-sm sm:text-base w-full sm:w-auto"
                >
                  Cancel
                </button>
                <SaveButton
                  text="Update Billing"
                  onClick={handleSaveUpdate}
                  loading={isSaving}
                  disabled={!selectedBill}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BILL LIST */}
      {activeTab === "list" && (
        <div className="flex-1 bg-white rounded-2xl shadow-xl border flex flex-col min-h-0">
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 sm:py-5 bg-[#2B2C2B] text-white rounded-t-2xl flex-shrink-0">
            {/* Mobile: Stacked layout */}
            <div className="flex flex-col gap-3 sm:hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Receipt />
                  </div>
                  <div>
                    <p className="text-base font-semibold">Billing</p>
                    <p className="text-xs text-white/70">Patient bill list</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20">
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-sm flex-shrink-0">
                    <Receipt />
                  </div>
                  <p className="text-sm font-semibold">
                    {isLoadingBills ? "..." : filtered.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Desktop: Side by side layout */}
            <div className="hidden sm:flex sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Receipt />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-semibold truncate">Billing</p>
                  <p className="text-xs text-white/70 truncate">Patient bill list</p>
                </div>
              </div>

              <div className="flex items-center gap-4 flex-nowrap">
                <div className="flex items-center gap-3 px-5 py-2 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-sm flex-shrink-0">
                    <Receipt />
                  </div>
                  <div className="leading-tight">
                    <p className="text-xs text-white/60">Total</p>
                    <p className="text-sm font-semibold text-white">
                      {isLoadingBills ? "Loading..." : `${filtered.length} Bills`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="p-3 sm:p-4 border-b bg-gray-50 flex-shrink-0">
            {/* Mobile: Stacked filters */}
            <div className="flex flex-col gap-3 sm:hidden">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by patient name, MR no, or bill ID..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-white text-sm outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="relative filter-container">
                <button
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg border bg-white text-sm ${hasActiveFilters ? "border-black ring-1 ring-black" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <span>Filters</span>
                    {hasActiveFilters && (
                      <span className="bg-black text-white text-xs px-2 py-0.5 rounded-full">
                        {activeFilterCount}
                      </span>
                    )}
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showFilterDropdown ? "rotate-180" : ""}`} />
                </button>

                {showFilterDropdown && (
                  <div className="filter-dropdown absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border z-[100] overflow-y-auto" style={{ maxHeight: '60vh' }}>
                    {/* Date Filter */}
                    <div className="p-4 border-b">
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          Filter by Date
                        </div>
                      </label>
                      <input
                        type="date"
                        value={formatDateForInput(selectedDate)}
                        onChange={(e) => {
                          const newDate = e.target.value ? new Date(e.target.value) : new Date();
                          setSelectedDate(newDate);
                        }}
                        className="w-full px-3 py-2 rounded-lg border bg-white text-sm focus:ring-2 focus:ring-black outline-none"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Showing bills for {selectedDate.toLocaleDateString()}
                      </p>
                    </div>

                    {/* Sort Order */}
                    <div className="p-4 border-b">
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Sort Order</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSort("az")}
                          className={`flex-1 px-3 py-2 rounded-lg text-sm ${sort === "az" ? "bg-black text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                        >
                          A → Z
                        </button>
                        <button
                          onClick={() => setSort("za")}
                          className={`flex-1 px-3 py-2 rounded-lg text-sm ${sort === "za" ? "bg-black text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                        >
                          Z → A
                        </button>
                      </div>
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

            {/* Desktop: Side by side */}
            <div className="hidden sm:flex sm:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by patient name, MR no, or bill ID..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-white text-sm outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="relative filter-container">
                <button
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border bg-white text-sm hover:bg-gray-50 whitespace-nowrap ${hasActiveFilters ? "border-black ring-1 ring-black" : ""}`}
                >
                  <Filter className="w-4 h-4" />
                  <span>Filter</span>
                  {hasActiveFilters && (
                    <span className="bg-black text-white text-xs px-2 py-0.5 rounded-full">
                      {activeFilterCount}
                    </span>
                  )}
                  <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showFilterDropdown ? "rotate-180" : ""}`} />
                </button>

                {showFilterDropdown && (
                  <div className="filter-dropdown absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border z-[100] overflow-y-auto" style={{ maxHeight: '70vh' }}>
                    {/* Date Filter */}
                    <div className="p-4 border-b">
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          Filter by Date
                        </div>
                      </label>
                      <input
                        type="date"
                        value={formatDateForInput(selectedDate)}
                        onChange={(e) => {
                          const newDate = e.target.value ? new Date(e.target.value) : new Date();
                          setSelectedDate(newDate);
                        }}
                        className="w-full px-3 py-2 rounded-lg border bg-white text-sm focus:ring-2 focus:ring-black outline-none"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Showing bills for {selectedDate.toLocaleDateString()}
                      </p>
                    </div>

                    {/* Sort Order */}
                    <div className="p-4 border-b">
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Sort Order</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSort("az")}
                          className={`flex-1 px-3 py-2 rounded-lg text-sm ${sort === "az" ? "bg-black text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                        >
                          A → Z
                        </button>
                        <button
                          onClick={() => setSort("za")}
                          className={`flex-1 px-3 py-2 rounded-lg text-sm ${sort === "za" ? "bg-black text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                        >
                          Z → A
                        </button>
                      </div>
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
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left">Bill ID</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left">MR No</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left">Patient Name</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left">Type</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left">Visit No</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left">Visit Date</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left">Total</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left">Paid</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left">Balance</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-center">Action</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-right w-12"></th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {isLoadingBills ? (
                  <TableLoadingRow />
                ) : filtered.length > 0 ? (
                  filtered.map((bill, i) => {
                    const typeInfo = transactionTypes.find(t => t.value === bill.type || t.label === bill.type);
                    const TypeIcon = typeInfo?.icon || MoreHorizontal;
                    
                    return (
                      <tr key={bill.billID} className="hover:bg-gray-50">
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-500">{i + 1}</td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-700 font-mono text-xs">
                          #{bill.billID}
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-700">
                          <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            {bill.mrNo}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 font-medium text-gray-900">
                          {bill.patientName}
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            <TypeIcon className="w-3 h-3" />
                            {bill.type}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-700">
                          #{bill.visitNo}
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-500 text-xs">
                          {formatDate(bill.visitDate)}
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-700 font-medium">
                          Rs. {bill.totalAmount.toLocaleString()}
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-green-600">
                          Rs. {bill.paidAmount.toLocaleString()}
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          <span className={`font-medium ${bill.balance > 0 ? "text-red-600" : "text-green-600"}`}>
                            Rs. {bill.balance.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-2 lg:px-3 py-3 lg:py-4 text-center">
                          <EditButton
                            text="Update"
                            onClick={() => handleUpdateBill(bill)}
                          />
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-right">
                          <RowSelect
                            checked={selected.includes(bill.billID)}
                            onClick={() =>
                              setSelected((prev) =>
                                prev.includes(bill.billID)
                                  ? prev.filter((id) => id !== bill.billID)
                                  : [...prev, bill.billID],
                              )
                            }
                          />
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
          <div className="flex-1 overflow-y-auto md:hidden bg-gray-50 min-h-[560px]">
            {isLoadingBills ? (
              <div className="flex flex-col items-center justify-center gap-3 p-8">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                <p className="text-sm text-gray-500">Loading bills...</p>
              </div>
            ) : filtered.length > 0 ? (
              <div className="p-3 space-y-3">
                {filtered.map((bill, i) => (
                  <MobileBillingCard
                    key={bill.billID}
                    bill={bill}
                    index={i}
                    isSelected={selected.includes(bill.billID)}
                    onToggleSelect={() =>
                      setSelected((prev) =>
                        prev.includes(bill.billID)
                          ? prev.filter((id) => id !== bill.billID)
                          : [...prev, bill.billID],
                      )
                    }
                    onUpdate={() => handleUpdateBill(bill)}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400 text-sm">
                <div className="flex flex-col items-center justify-center gap-2">
                  <Receipt size={48} />
                  <p>No Bills Found</p>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Clear filters to see all bills
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}