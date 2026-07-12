"use client";

type DoctorRow = {
  id: number;
  username: string;
  isBlocked: boolean;
};

import doctorAddApi from "@/lib/api/Admin/Doctor/doctorAdd";
import doctorBlockApi from "@/lib/api/Admin/Doctor/doctorBlock";
import docotrListApi from "@/lib/api/Admin/Doctor/doctorList";
import doctorUnBlockApi from "@/lib/api/Admin/Doctor/doctorUnblock";
import doctorUpdateApi from "@/lib/api/Admin/Doctor/doctorUpdate";

import HeadBar from "@/Components/headbar";
import { useToast } from "@/Components/Toast/ToastContext";
import { useState, useEffect } from "react";
import SaveButton, { EditButton } from "@/Components/button"
import { Filter, ChevronDown, X, Loader2, Stethoscope, Users, Lock, Unlock, Shield, ShieldAlert } from "lucide-react";

type RowSelectProps = {
  checked: boolean;
  onClick: () => void;
};

type ToggleProps = {
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
};

/* ===== Premium toggle for block/unblock ===== */
function StatusToggle({ value, onChange, disabled }: ToggleProps) {
  return (
    <button
      onClick={() => !disabled && onChange(!value)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${
        value ? "bg-red-500" : "bg-green-500"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          value ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

/* ===== Block/Unblock Confirmation Modal ===== */
function BlockConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  username,
  isBlocking,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  username: string;
  isBlocking: boolean;
  isLoading: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-[420px] z-50 mx-4">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isBlocking ? "bg-red-100" : "bg-green-100"}`}>
            {isBlocking ? (
              <Lock className="w-6 h-6 text-red-600" />
            ) : (
              <Unlock className="w-6 h-6 text-green-600" />
            )}
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold">
              {isBlocking ? "Block Doctor" : "Unblock Doctor"}
            </h3>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to {isBlocking ? "block" : "unblock"}{" "}
          <span className="font-semibold">{username}</span>?
          <br className="hidden sm:block" />
          {isBlocking 
            ? "They will no longer be able to access the system." 
            : "They will regain access to the system."}
        </p>
        
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 cursor-pointer text-sm sm:text-base w-full sm:w-auto"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2.5 rounded-lg text-white text-sm sm:text-base w-full sm:w-auto ${
              isLoading 
                ? "opacity-50 cursor-not-allowed" 
                : isBlocking 
                  ? "bg-red-500 hover:bg-red-600" 
                  : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {isLoading ? "Processing..." : isBlocking ? "Block" : "Unblock"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===== Premium row selector ===== */
function RowSelect({ checked, onClick }: RowSelectProps) {
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

/* ===== Mobile Doctor Card Component ===== */
function MobileDoctorCard({
  item,
  index,
  isSelected,
  onToggleSelect,
  onEdit,
  onToggleBlock,
  selectedCount,
}: {
  item: DoctorRow;
  index: number;
  isSelected: boolean;
  onToggleSelect: () => void;
  onEdit: () => void;
  onToggleBlock: () => void;
  selectedCount: number;
}) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border p-4 space-y-3 ${item.isBlocked ? "border-red-200 bg-red-50/30" : ""}`}>
      {/* Header: Number + Name + Selector */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className={`flex-shrink-0 w-6 h-6 rounded-full text-xs font-medium flex items-center justify-center ${
            item.isBlocked ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"
          }`}>
            {index + 1}
          </span>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight break-words flex items-center gap-2">
              {item.username}
              {item.isBlocked && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-red-100 text-red-700">
                  <ShieldAlert className="w-3 h-3 mr-1" />
                  Blocked
                </span>
              )}
            </h3>
          </div>
        </div>
        <RowSelect checked={isSelected} onClick={onToggleSelect} />
      </div>

      {/* Status & Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Status:</span>
          <StatusToggle 
            value={item.isBlocked} 
            onChange={onToggleBlock}
            disabled={selectedCount > 0}
          />
          <span className={`text-xs font-medium ${item.isBlocked ? "text-red-600" : "text-green-600"}`}>
            {item.isBlocked ? "Blocked" : "Active"}
          </span>
        </div>
        
        <EditButton text="Edit" disabled={selectedCount > 0} onClick={onEdit} />
      </div>
    </div>
  );
}

export default function DoctorCrud() {
  const [activeTab, setActiveTab] = useState<"list" | "add">("add");
  const [selected, setSelected] = useState<number[]>([]);
  const [blockModal, setBlockModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DoctorRow | null>(null);
  const [isBlockingAction, setIsBlockingAction] = useState(false);

  // Search and sort
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"az" | "za">("az");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "blocked">("all");

  // Form states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { showToast } = useToast();

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);

  // Data states
  const [doctors, setDoctors] = useState<DoctorRow[]>([]);

  // Calculate active filter count
  const activeFilterCount = [
    sort !== "az" ? "sort" : null,
    statusFilter !== "all" ? "status" : null
  ].filter(Boolean).length;
  const hasActiveFilters = activeFilterCount > 0;

  // Filter and sort doctors
  const filtered = doctors
    .filter((d) => {
      const usernameLower = d.username?.toLowerCase() || "";
      const q = search.toLowerCase();
      const matchesSearch = usernameLower.includes(q);
      
      const matchesStatus = 
        statusFilter === "all" ? true :
        statusFilter === "active" ? !d.isBlocked :
        d.isBlocked;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const nameA = a.username || "";
      const nameB = b.username || "";
      return sort === "az"
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    });

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("error", "Authentication token missing");
      return;
    }

    setIsLoadingDoctors(true);
    try {
      const res = await docotrListApi(token);

      if (!res || !res.data) {
        showToast("error", "Failed to load doctors - invalid response");
        setDoctors([]);
        return;
      }

      if (res.data.length === 0) {
        showToast("info", "No doctors found");
      }

      const formatted: DoctorRow[] = res.data.map((d: any) => ({
        id: d.doctorID || d.id,
        username: d.username,
        isBlocked: d.isBlocked || d.status === "blocked" || false,
      }));

      setDoctors(formatted);
    } catch (error: any) {
      console.error("Error loading doctors:", error);
      showToast("error", error?.message || "Network error - Failed to load doctors");
      setDoctors([]);
    } finally {
      setIsLoadingDoctors(false);
    }
  };

  const handleSaveDoctor = async () => {
    if (!username.trim()) {
      showToast("error", "Username is required");
      return;
    }

    if (!selectedItem && !password) {
      showToast("error", "Password is required for new doctor");
      return;
    }

    if (!selectedItem && password !== confirmPassword) {
      showToast("error", "Passwords do not match");
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
        // Update - password is optional
        const updateData: any = { username };
        if (password) {
          updateData.password = password;
        }
        await doctorUpdateApi(updateData, token);
        showToast("success", "Doctor updated");
      } else {
        // Add new
        await doctorAddApi({ username, password }, token);
        showToast("success", "Doctor added");
      }

      resetForm();
      loadDoctors();
    } catch (error: any) {
      console.error("Error saving doctor:", error);
      showToast("error", error?.message || "Failed to save doctor");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleBlock = async () => {
    if (!selectedItem) return;

    const token = localStorage.getItem("token");
    if (!token) {
      showToast("error", "Authentication token missing");
      return;
    }

    setIsLoading(true);
    try {
      if (isBlockingAction) {
        // Block
        await doctorBlockApi({ username: selectedItem.username }, token);
        showToast("success", "Doctor blocked");
      } else {
        // Unblock
        await doctorUnBlockApi({ username: selectedItem.username }, token);
        showToast("success", "Doctor unblocked");
      }

      setBlockModal(false);
      setSelectedItem(null);
      loadDoctors();
    } catch (error: any) {
      console.error("Error toggling block status:", error);
      showToast("error", error?.message || "Failed to update status");
    } finally {
      setIsLoading(false);
    }
  };

  const openBlockModal = (item: DoctorRow) => {
    setSelectedItem(item);
    setIsBlockingAction(!item.isBlocked);
    setBlockModal(true);
  };

  const handleEditDoctor = (item: DoctorRow) => {
    setSelectedItem(item);
    setUsername(item.username);
    setPassword("");
    setConfirmPassword("");
    setActiveTab("add");
  };

  const resetForm = () => {
    setSelectedItem(null);
    setUsername("");
    setPassword("");
    setConfirmPassword("");
  };

  const clearFilters = () => {
    setSort("az");
    setStatusFilter("all");
    setSearch("");
  };

  // Loading row component for table
  const TableLoadingRow = () => (
    <tr>
      <td colSpan={6} className="px-6 py-12 text-center">
        <div className="flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          <p className="text-sm text-gray-500">Loading doctors...</p>
        </div>
      </td>
    </tr>
  );

  // Empty state component
  const TableEmptyState = () => (
    <tr>
      <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
        <div className="flex flex-col items-center justify-center gap-2">
          <Stethoscope size={48} />
          <p>No Doctors Found</p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:underline"
            >
              Clear filters to see all doctors
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
          list="Doctors"
          add=" Add Doctor"
          active={activeTab === "add" ? "left" : "right"}
          onLeftClick={() => {
    resetForm(); // Reset when clicking Add
    setActiveTab("add");
  }}
          onRightClick={() => setActiveTab("list")}
        />
      </div>

      {/* ADD DOCTOR */}
      {activeTab === "add" && (
        <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-2xl p-4 sm:p-6 lg:p-10 overflow-auto min-h-0">
          <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10 border">
            <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-black text-white flex items-center justify-center text-lg sm:text-xl flex-shrink-0">
                <Stethoscope />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold truncate">
                  {selectedItem ? "Update Doctor" : "Add Doctor"}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 truncate">
                  {selectedItem ? "Update doctor details" : "Create new doctor account"}
                </p>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={!!selectedItem}
                  className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl border bg-gray-50 focus:ring-2 focus:ring-black outline-none text-sm sm:text-base disabled:bg-gray-100 disabled:text-gray-500"
                  placeholder="Enter username"
                />
                {selectedItem && (
                  <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Password {selectedItem && "(Leave blank to keep current)"}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl border bg-gray-50 focus:ring-2 focus:ring-black outline-none text-sm sm:text-base"
                  placeholder={selectedItem ? "Enter new password" : "Enter password"}
                />
              </div>

              {!selectedItem && (
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl border bg-gray-50 focus:ring-2 focus:ring-black outline-none text-sm sm:text-base"
                    placeholder="Confirm password"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 mt-6 sm:mt-8">
              <button
                onClick={resetForm}
                className="px-5 sm:px-6 py-3 rounded-xl text-gray-600 hover:bg-gray-100 text-sm sm:text-base w-full sm:w-auto"
              >
                Cancel
              </button>
              <SaveButton
                text={selectedItem ? "Update Doctor" : "Save Doctor"}
                onClick={handleSaveDoctor}
                loading={isLoading}
                disabled={!username.trim() || (!selectedItem && (!password || password !== confirmPassword))}
              />
            </div>
          </div>
        </div>
      )}

      {/* DOCTOR LIST */}
      {activeTab === "list" && (
        <div className="flex-1 bg-white rounded-2xl shadow-xl border flex flex-col min-h-0">
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 sm:py-5 bg-[#2B2C2B] text-white rounded-t-2xl flex-shrink-0">
            {/* Mobile */}
            <div className="flex flex-col gap-3 sm:hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Stethoscope />
                  </div>
                  <div>
                    <p className="text-base font-semibold">Doctors</p>
                    <p className="text-xs text-white/70">Medical staff management</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20">
                  <Users className="w-4 h-4" />
                  <p className="text-sm font-semibold">
                    {isLoadingDoctors ? "..." : filtered.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Desktop */}
            <div className="hidden sm:flex sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Stethoscope />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-semibold truncate">Doctors</p>
                  <p className="text-xs text-white/70 truncate">Medical staff management</p>
                </div>
              </div>

              <div className="flex items-center gap-3 px-5 py-2 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20">
                <Users className="w-5 h-5" />
                <div className="leading-tight">
                  <p className="text-xs text-white/60">Total</p>
                  <p className="text-sm font-semibold text-white">
                    {isLoadingDoctors ? "Loading..." : `${filtered.length} Doctors`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="p-3 sm:p-4 border-b bg-gray-50 flex-shrink-0">
            <div className="flex flex-col gap-3 sm:hidden">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by username..."
                className="px-4 py-2.5 rounded-lg border bg-white text-sm outline-none focus:ring-2 focus:ring-black w-full"
              />
              
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="flex-1 px-4 py-2.5 rounded-lg border bg-white text-sm outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="blocked">Blocked</option>
                </select>
                
                <button
                  onClick={() => setSort(sort === "az" ? "za" : "az")}
                  className="px-4 py-2.5 rounded-lg border bg-white text-sm"
                >
                  {sort === "az" ? "A → Z" : "Z → A"}
                </button>
              </div>
            </div>

            <div className="hidden sm:flex sm:justify-between sm:items-center gap-4">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by username..."
                className="px-4 py-2.5 rounded-lg border bg-white text-sm outline-none focus:ring-2 focus:ring-black flex-1 max-w-md"
              />

              <div className="flex items-center gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-4 py-2.5 rounded-lg border bg-white text-sm outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="blocked">Blocked Only</option>
                </select>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Sort:</span>
                  <button
                    onClick={() => setSort("az")}
                    className={`px-3 py-2 rounded-lg text-sm ${sort === "az" ? "bg-black text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                  >
                    A → Z
                  </button>
                  <button
                    onClick={() => setSort("za")}
                    className={`px-3 py-2 rounded-lg text-sm ${sort === "za" ? "bg-black text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                  >
                    Z → A
                  </button>
                </div>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 text-sm"
                  >
                    <X className="w-4 h-4" />
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="flex-1 overflow-y-auto hidden md:block min-h-[400px]">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-100 text-xs uppercase text-gray-600">
                <tr>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left w-12">#</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left">Username</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left">Status</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left">Block/Unblock</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left">Action</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-right w-12"></th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {isLoadingDoctors ? (
                  <TableLoadingRow />
                ) : filtered.length > 0 ? (
                  filtered.map((item, i) => (
                    <tr key={item.id} className={`hover:bg-gray-50 ${item.isBlocked ? "bg-red-50/30" : ""}`}>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-500">{i + 1}</td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-800">{item.username}</span>
                          {item.isBlocked && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-red-100 text-red-700">
                              <ShieldAlert className="w-3 h-3 mr-1" />
                              Blocked
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs ${
                          item.isBlocked 
                            ? "bg-red-100 text-red-700" 
                            : "bg-green-100 text-green-700"
                        }`}>
                          {item.isBlocked ? (
                            <><Lock className="w-3 h-3 mr-1" /> Blocked</>
                          ) : (
                            <><Unlock className="w-3 h-3 mr-1" /> Active</>
                          )}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4">
                        <div className="flex items-center gap-3">
                          <StatusToggle 
                            value={item.isBlocked} 
                            onChange={() => openBlockModal(item)}
                            disabled={selected.length > 0}
                          />
                          <span className={`text-xs ${item.isBlocked ? "text-red-600" : "text-green-600"}`}>
                            {item.isBlocked ? "Blocked" : "Active"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4">
                        <EditButton
                          text="Edit"
                          disabled={selected.length > 0 || item.isBlocked}
                          onClick={() => handleEditDoctor(item)}
                        />
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-right">
                        <RowSelect
                          checked={selected.includes(item.id)}
                          onClick={() =>
                            setSelected((prev) =>
                              prev.includes(item.id)
                                ? prev.filter((id) => id !== item.id)
                                : [...prev, item.id],
                            )
                          }
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <TableEmptyState />
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="flex-1 overflow-y-auto md:hidden bg-gray-50 min-h-[560px]">
            {isLoadingDoctors ? (
              <div className="flex flex-col items-center justify-center gap-3 p-8">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                <p className="text-sm text-gray-500">Loading doctors...</p>
              </div>
            ) : filtered.length > 0 ? (
              <div className="p-3 space-y-3">
                {filtered.map((item, i) => (
                  <MobileDoctorCard
                    key={item.id}
                    item={item}
                    index={i}
                    isSelected={selected.includes(item.id)}
                    onToggleSelect={() =>
                      setSelected((prev) =>
                        prev.includes(item.id)
                          ? prev.filter((id) => id !== item.id)
                          : [...prev, item.id],
                      )
                    }
                    onEdit={() => handleEditDoctor(item)}
                    onToggleBlock={() => openBlockModal(item)}
                    selectedCount={selected.length}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400 text-sm">
                <div className="flex flex-col items-center justify-center gap-2">
                  <Stethoscope size={48} />
                  <p>No Doctors Found</p>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Clear filters to see all doctors
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BLOCK/UNBLOCK CONFIRMATION MODAL */}
      <BlockConfirmModal
        isOpen={blockModal}
        onClose={() => {
          setBlockModal(false);
          setSelectedItem(null);
        }}
        onConfirm={handleToggleBlock}
        username={selectedItem?.username || ""}
        isBlocking={isBlockingAction}
        isLoading={isLoading}
      />
    </div>
  );
}