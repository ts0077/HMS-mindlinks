"use client";

type RowSelectprops = {
  checked: boolean;
  onClick: () => void;
};

type Toggleprops = {
  value: boolean;
  onChange: React.Dispatch<React.SetStateAction<boolean>>;
};

type InvestigationRow = {
  id: number;
  testName: string;
  price: number;
  reportingTime: number;
};

import investigationAddApi from "@/lib/api/Admin/Investigation/investigationAdd";
import investigationListApi from "@/lib/api/Admin/Investigation/investigationList";
import investigationUpdateApi from "@/lib/api/Admin/Investigation/investigationUpdate";
import investigationDeleteApi from "@/lib/api/Admin/Investigation/investigationDelete";
import { useToast } from "@/Components/Toast/ToastContext";

import HeadBar from "@/Components/headbar";
import { useState, useEffect } from "react";
import SaveButton, { EditButton } from "@/Components/button"
import { Filter, ChevronDown, X, Loader2, FlaskConical, Microscope } from "lucide-react";

/* ===== Premium toggle ===== */
function Toggle({ value, onChange }: Toggleprops) {
  return (
    <div
      onClick={() => onChange(!value)}
      className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition
      ${value ? "bg-black" : "bg-gray-300"}`}
    >
      <div
        className={`w-6 h-6 bg-white rounded-full shadow-md transform transition
        ${value ? "translate-x-6" : ""}`}
      />
    </div>
  );
}

/* ===== Premium row selector ===== */
function RowSelect({ checked, onClick }: RowSelectprops) {
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

/* ===== Mobile Investigation Card Component ===== */
function MobileInvestigationCard({
  item,
  index,
  isSelected,
  onToggleSelect,
  onEdit,
  onDelete,
  selectedCount,
}: {
  item: InvestigationRow;
  index: number;
  isSelected: boolean;
  onToggleSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  selectedCount: number;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 space-y-3">
      {/* Header: Number + Name + Selector */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs font-medium flex items-center justify-center">
            {index + 1}
          </span>
          <h3 className="font-semibold text-gray-900 text-sm leading-tight break-words">
            {item.testName}
          </h3>
        </div>
        <RowSelect checked={isSelected} onClick={onToggleSelect} />
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-gray-50 rounded-lg p-2">
          <span className="text-gray-400 block mb-0.5">Price</span>
          <span className="font-medium text-gray-700">Rs. {item.price.toLocaleString()}</span>
        </div>
        <div className="bg-blue-50 rounded-lg p-2">
          <span className="text-blue-400 block mb-0.5">Reporting Time</span>
          <span className="font-medium text-blue-700">{item.reportingTime} hrs</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <EditButton text="Edit" disabled={selectedCount > 0} onClick={onEdit} />
        <button
          onClick={onDelete}
          className="flex-1 px-3 py-2 text-xs rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default function Investigation() {
  const [activeTab, setActiveTab] = useState<"list" | "add">("add");
  const [selected, setSelected] = useState<number[]>([]);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteMode, setDeleteMode] = useState<"single" | "bulk">("single");
  const [selectedItem, setSelectedItem] = useState<InvestigationRow | null>(null);

  // Search and sort
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"az" | "za">("az");

  // Filter states
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Form states
  const [testName, setTestName] = useState("");
  const [price, setPrice] = useState<string>("");
  const [reportingTime, setReportingTime] = useState<string>("");
  const { showToast } = useToast();

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  const [investigations, setInvestigations] = useState<InvestigationRow[]>([]);

  // Calculate active filter count
  const activeFilterCount = [
    sort !== "az" ? "sort" : null
  ].filter(Boolean).length;

  const hasActiveFilters = activeFilterCount > 0 || search !== "";

  // Filter and sort investigations
  const filtered = investigations
    .filter((i) => {
      const testNameLower = i.testName?.toLowerCase() || "";
      const q = search.toLowerCase();
      return testNameLower.includes(q);
    })
    .sort((a, b) => {
      const nameA = a.testName || "";
      const nameB = b.testName || "";
      return sort === "az"
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    });

  useEffect(() => {
    loadInvestigations();
  }, []);

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

  const loadInvestigations = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("error", "Authentication token missing");
      return;
    }

    setIsLoadingItems(true);
    try {
      const res = await investigationListApi(token);

      if (!res || !res.data) {
        showToast("error", "Failed to load investigations - invalid response");
        setInvestigations([]);
        return;
      }

      if (res.data.length === 0) {
        showToast("info", "No investigations found");
      }

      const formatted: InvestigationRow[] = res.data.map((i: any) => ({
        id: i.testID,
        testName: i.testName,
        price: Number(i.price),
        reportingTime: Number(i.reportingTime),
      }));

      setInvestigations(formatted);
    } catch (error: any) {
      console.error("Error loading investigations:", error);
      showToast("error", error?.message || "Network error - Failed to load investigations");
      setInvestigations([]);
    } finally {
      setIsLoadingItems(false);
    }
  };

  const handleSaveInvestigation = async () => {
    if (!testName.trim()) {
      showToast("error", "Test name is required");
      return;
    }

    if (!price || isNaN(Number(price)) || Number(price) < 0) {
      showToast("error", "Valid price is required");
      return;
    }

    if (!reportingTime || isNaN(Number(reportingTime)) || Number(reportingTime) < 0) {
      showToast("error", "Valid reporting time is required");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      showToast("error", "Authentication token missing");
      return;
    }

    setIsLoading(true);
    try {
      if (selectedItem) {
        await investigationUpdateApi(
          {
            testID: selectedItem.id,
            testName: testName.trim(),
            price: Number(price),
            reportingTime: Number(reportingTime)
          },
          token
        );
        showToast("success", "Investigation updated");
      } else {
        await investigationAddApi(
          {
            testName: testName.trim(),
            price: Number(price),
            reportingTime: Number(reportingTime)
          },
          token
        );
        showToast("success", "Investigation added");
      }

      resetForm();
      loadInvestigations();
    } catch (error: any) {
      console.error("Error saving investigation:", error);
      showToast("error", error?.message || "Failed to save investigation");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteInvestigation = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("error", "Authentication token missing");
      return;
    }

    setIsLoading(true);
    try {
      if (deleteMode === "single" && selectedItem) {
        await investigationDeleteApi(selectedItem.id, token);
      }

      if (deleteMode === "bulk") {
        await Promise.all(
          selected.map((id) => investigationDeleteApi(id, token))
        );
      }

      showToast("success", "Investigation(s) deleted");

      setDeleteModal(false);
      setSelectedItem(null);
      setSelected([]);

      loadInvestigations();
    } catch (error: any) {
      console.error("Error deleting investigations:", error);
      showToast("error", error?.message || "Failed to delete investigations");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditInvestigation = (item: InvestigationRow) => {
    setSelectedItem(item);
    setTestName(item.testName);
    setPrice(item.price.toString());
    setReportingTime(item.reportingTime.toString());
    setActiveTab("add");
  };

  const resetForm = () => {
    setSelectedItem(null);
    setTestName("");
    setPrice("");
    setReportingTime("");
  };

  const clearFilters = () => {
    setSort("az");
    setSearch("");
  };

  // Loading row component for table
  const TableLoadingRow = () => (
    <tr>
      <td colSpan={6} className="px-6 py-12 text-center">
        <div className="flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          <p className="text-sm text-gray-500">Loading investigations...</p>
        </div>
      </td>
    </tr>
  );

  // Empty state component
  const TableEmptyState = () => (
    <tr>
      <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
        <div className="flex flex-col items-center justify-center gap-2">
          <FlaskConical size={48} />
          <p>No Investigations Found</p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:underline"
            >
              Clear filters to see all investigations
            </button>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Head Bar */}
      <div className="mb-3 sm:mb-5 mt-5 sm:mt-0 flex-shrink-0">
        <HeadBar
          list="Investigations"
          add=" Add Investigation"
          active={activeTab === "add" ? "left" : "right"}
        onLeftClick={() => {
    resetForm(); // Reset when clicking Add
    setActiveTab("add");
  }}
          onRightClick={() => setActiveTab("list")}
        />
      </div>

      {/* ADD INVESTIGATION */}
      {activeTab === "add" && (
        <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-2xl p-4 sm:p-6 lg:p-10 overflow-auto min-h-0">
          <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10 border">
            <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-black text-white flex items-center justify-center text-lg sm:text-xl flex-shrink-0">
                <Microscope/>
              </div>
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold truncate">
                  {selectedItem ? "Update Investigation" : "Add Investigation"}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 truncate">
                  Define a lab test or investigation
                </p>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Test Name</label>
                <input
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl border bg-gray-50 focus:ring-2 focus:ring-black outline-none text-sm sm:text-base"
                  placeholder="Enter test name"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Price (Rs.)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl border bg-gray-50 focus:ring-2 focus:ring-black outline-none text-sm sm:text-base"
                    placeholder="Enter price"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Reporting Time (Hours)</label>
                  <input
                    type="number"
                    value={reportingTime}
                    onChange={(e) => setReportingTime(e.target.value)}
                    className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl border bg-gray-50 focus:ring-2 focus:ring-black outline-none text-sm sm:text-base"
                    placeholder="Enter hours"
                    min="0"
                  />
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
                text={selectedItem ? "Update Investigation" : "Save Investigation"}
                onClick={handleSaveInvestigation}
                loading={isLoading}
                disabled={!testName.trim() || !price || !reportingTime}
              />
            </div>
          </div>
        </div>
      )}

      {/* INVESTIGATION LIST */}
      {activeTab === "list" && (
        <div className="flex-1 bg-white rounded-2xl shadow-xl border flex flex-col min-h-0">
          {/* Header - Fixed Layout */}
          <div className="px-4 sm:px-6 py-4 sm:py-5 bg-[#2B2C2B] text-white rounded-t-2xl flex-shrink-0">
            {/* Mobile: Stacked layout */}
            <div className="flex flex-col gap-3 sm:hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Microscope/>
                  </div>
                  <div>
                    <p className="text-base font-semibold">Investigations</p>
                    <p className="text-xs text-white/70">Lab tests list</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20">
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-sm flex-shrink-0">
                    <FlaskConical/>
                  </div>
                  <p className="text-sm font-semibold">
                    {isLoadingItems ? "..." : filtered.length}
                  </p>
                </div>
              </div>

              {selected.length > 0 && (
                <button
                  onClick={() => {
                    setDeleteMode("bulk");
                    setDeleteModal(true);
                  }}
                  className="w-full px-4 py-2.5 rounded-lg bg-red-500 text-white text-sm hover:bg-red-600 cursor-pointer"
                >
                  Delete Selected ({selected.length})
                </button>
              )}
            </div>

            {/* Desktop: Side by side layout */}
            <div className="hidden sm:flex sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Microscope/>
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-semibold truncate">Investigations</p>
                  <p className="text-xs text-white/70 truncate">Lab tests list</p>
                </div>
              </div>

              <div className="flex items-center gap-4 flex-nowrap">
                {selected.length > 0 && (
                  <button
                    onClick={() => {
                      setDeleteMode("bulk");
                      setDeleteModal(true);
                    }}
                    className="px-4 py-2 rounded-lg bg-red-500 text-white text-xs hover:bg-red-600 cursor-pointer whitespace-nowrap"
                  >
                    Delete Selected ({selected.length})
                  </button>
                )}

                <div className="flex items-center gap-3 px-5 py-2 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-sm flex-shrink-0">
                    <FlaskConical/>
                  </div>
                  <div className="leading-tight">
                    <p className="text-xs text-white/60">Total</p>
                    <p className="text-sm font-semibold text-white">
                      {isLoadingItems ? "Loading..." : `${filtered.length} Tests`}
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
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search test name..."
                className="px-4 py-2.5 rounded-lg border bg-white text-sm outline-none focus:ring-2 focus:ring-black w-full"
              />

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
                        {activeFilterCount + (search ? 1 : 0)}
                      </span>
                    )}
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showFilterDropdown ? "rotate-180" : ""}`} />
                </button>

                {showFilterDropdown && (
                  <div className="filter-dropdown absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border z-[100] overflow-y-auto" style={{ maxHeight: '60vh' }}>
                    <div className="p-4 border-b">
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Sort Order</label>
                      <div className="flex gap-2">
                        <button onClick={() => setSort("az")} className={`flex-1 px-3 py-2 rounded-lg text-sm ${sort === "az" ? "bg-black text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>A → Z</button>
                        <button onClick={() => setSort("za")} className={`flex-1 px-3 py-2 rounded-lg text-sm ${sort === "za" ? "bg-black text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>Z → A</button>
                      </div>
                    </div>
                    {hasActiveFilters && (
                      <div className="p-4">
                        <button onClick={clearFilters} className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 text-sm">
                          <X className="w-4 h-4" />Clear All Filters
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Desktop: Side by side */}
            <div className="hidden sm:flex sm:justify-between">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search test name..."
                className="px-4 py-2.5 rounded-lg border bg-white text-sm outline-none focus:ring-2 focus:ring-black flex-1 max-w-md"
              />

              <div className="relative filter-container">
                <button onClick={() => setShowFilterDropdown(!showFilterDropdown)} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border bg-white text-sm hover:bg-gray-50 whitespace-nowrap ${hasActiveFilters ? "border-black ring-1 ring-black" : ""}`}>
                  <Filter className="w-4 h-4" />
                  <span>Filter</span>
                  {hasActiveFilters && <span className="bg-black text-white text-xs px-2 py-0.5 rounded-full">{activeFilterCount + (search ? 1 : 0)}</span>}
                  <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showFilterDropdown ? "rotate-180" : ""}`} />
                </button>

                {showFilterDropdown && (
                  <div className="filter-dropdown absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border z-[100] overflow-y-auto" style={{ maxHeight: '70vh' }}>
                    <div className="p-4 border-b">
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Sort Order</label>
                      <div className="flex gap-2">
                        <button onClick={() => setSort("az")} className={`flex-1 px-3 py-2 rounded-lg text-sm ${sort === "az" ? "bg-black text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>A → Z</button>
                        <button onClick={() => setSort("za")} className={`flex-1 px-3 py-2 rounded-lg text-sm ${sort === "za" ? "bg-black text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>Z → A</button>
                      </div>
                    </div>
                    {hasActiveFilters && (
                      <div className="p-4">
                        <button onClick={clearFilters} className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 text-sm">
                          <X className="w-4 h-4" />Clear All Filters
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
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left">Test Name</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left">Price</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left">Reporting Time</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left">Action</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-right w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoadingItems ? <TableLoadingRow /> : filtered.length > 0 ? filtered.map((item, i) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-500">{i + 1}</td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4 font-medium text-gray-800">{item.testName}</td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-700">Rs. {item.price.toLocaleString()}</td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-700"><span className="inline-flex items-center px-2.5 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">{item.reportingTime} hrs</span></td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4">
                      <div className="flex gap-2">
                        <EditButton text="Edit" disabled={selected.length > 0} onClick={() => handleEditInvestigation(item)} />
                        <button onClick={() => { setDeleteMode("single"); setSelectedItem(item); setDeleteModal(true); }} className="px-3 lg:px-4 py-1.5 text-xs rounded-lg bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer">Delete</button>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4 text-right">
                      <RowSelect checked={selected.includes(item.id)} onClick={() => setSelected((prev) => prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id])} />
                    </td>
                  </tr>
                )) : <TableEmptyState />}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="flex-1 overflow-y-auto md:hidden bg-gray-50 min-h-[560px]">
            {isLoadingItems ? (
              <div className="flex flex-col items-center justify-center gap-3 p-8">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                <p className="text-sm text-gray-500">Loading investigations...</p>
              </div>
            ) : filtered.length > 0 ? (
              <div className="p-3 space-y-3">
                {filtered.map((item, i) => (
                  <MobileInvestigationCard key={item.id} item={item} index={i} isSelected={selected.includes(item.id)} onToggleSelect={() => setSelected((prev) => prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id])} onEdit={() => handleEditInvestigation(item)} onDelete={() => { setDeleteMode("single"); setSelectedItem(item); setDeleteModal(true); }} selectedCount={selected.length} />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400 text-sm">
                <div className="flex flex-col items-center justify-center gap-2">
                  <FlaskConical size={48} />
                  <p>No Investigations Found</p>
                  {hasActiveFilters && <button onClick={clearFilters} className="text-sm text-blue-600 hover:underline">Clear filters to see all investigations</button>}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-[420px] z-50 mx-4">
            <h3 className="text-lg sm:text-xl font-bold mb-3">{deleteMode === "bulk" ? "Delete Investigations" : "Delete Investigation"}</h3>
            <p className="text-sm text-gray-600 mb-6">
              {deleteMode === "bulk" ? `Are you sure you want to delete ${selected.length} investigations?` : <>Are you sure you want to delete <span className="font-semibold">{selectedItem?.testName}</span>?</>}<br className="hidden sm:block" />This action cannot be undone.
            </p>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
              <button onClick={() => setDeleteModal(false)} className="px-5 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 cursor-pointer text-sm sm:text-base w-full sm:w-auto">Cancel</button>
              <button onClick={handleDeleteInvestigation} disabled={isLoading} className={`px-5 py-2.5 rounded-lg text-white text-sm sm:text-base w-full sm:w-auto ${isLoading ? "bg-red-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"}`}>{isLoading ? "Deleting..." : "Delete"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}