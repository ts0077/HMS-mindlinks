"use client";

import PatientNewListApi from "@/lib/api/Common/patientinfo/patientNewList";
import patientInfoAddApi from "@/lib/api/Common/patientinfo/patientAdd";
import patientInfoUpdateApi from "@/lib/api/Common/patientinfo/patientUpdate";
import { useToast } from "@/Components/Toast/ToastContext";

import HeadBar from "@/Components/headbar";
import { useState, useEffect, useMemo } from "react";
import SaveButton, { EditButton } from "@/Components/button"
import { Filter, ChevronDown, X, Loader2, Users, UserPlus, Calendar, Phone, User, Heart, CreditCard } from "lucide-react";
import { SearchableDropdown, DropdownOption } from "@/Components/SearchableDropdown"

// Types
type GenderOption = DropdownOption & { value: string };
type MaritalStatusOption = DropdownOption & { value: string };

type PatientRow = {
  mrNo: number;
  patientName: string;
  dob: string;
  age?: number;
  gender: string;
  phone: string;
  maritalStatus: string;
  fatherName?: string;
  husbandName?: string;
  cnic?: string;
};

/* ===== Gender Dropdown Options ===== */
const genderOptions: GenderOption[] = [
  { id: 1, name: "Male", label: "Male", value: "Male" },
  { id: 2, name: "Female", label: "Female", value: "Female" },
  { id: 3, name: "Other", label: "Other", value: "Other" },
];

const maleMaritalStatusOptions: MaritalStatusOption[] = [
  { id: 1, name: "Single", label: "Single", value: "Single" },
  { id: 2, name: "Married", label: "Married", value: "Married" },
];

/* ===== Marital Status Options ===== */
const maritalStatusOptions: MaritalStatusOption[] = [
  { id: 1, name: "Single", label: "Single", value: "Single" },
  { id: 2, name: "Married", label: "Married", value: "Married" },
  { id: 3, name: "Divorced", label: "Divorced", value: "Divorced" },
  { id: 4, name: "Widowed", label: "Widowed", value: "Widowed" },
];

/* ===== Helper: Parse age input and calculate DOB ===== */
function parseAgeInput(input: string): { dob: Date | null; displayDate: string; isValid: boolean } {
  if (!input || input.trim() === "") {
    return { dob: null, displayDate: "", isValid: false };
  }

  const trimmed = input.trim();
  
  // Check if it's a date format (DD-MM-YYYY or DD/MM/YYYY)
  const dateRegex = /^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/;
  const dateMatch = trimmed.match(dateRegex);
  
  if (dateMatch) {
    const day = parseInt(dateMatch[1]);
    const month = parseInt(dateMatch[2]) - 1; // 0-indexed
    const year = parseInt(dateMatch[3]);
    const date = new Date(year, month, day);
    
    // Validate the date is reasonable (not in future, not too old)
    const now = new Date();
    const maxAge = 150;
    const minDate = new Date(now.getFullYear() - maxAge, now.getMonth(), now.getDate());
    
    if (date > now || date < minDate) {
      return { dob: null, displayDate: "Invalid date", isValid: false };
    }
    
    const displayStr = `${String(day).padStart(2, '0')}-${String(month + 1).padStart(2, '0')}-${year}`;
    return { dob: date, displayDate: displayStr, isValid: true };
  }
  
  // Check if it's an age input (number + optional unit)
  const ageRegex = /^(\d+)\s*(years?|yrs?|y|days?|d)?$/i;
  const ageMatch = trimmed.match(ageRegex);
  
  if (ageMatch) {
    const value = parseInt(ageMatch[1]);
    const unit = (ageMatch[2] || "years").toLowerCase();
    
    const now = new Date();
    let calculatedDate: Date;
    
    if (unit.startsWith("d")) {
      calculatedDate = new Date(now.getTime() - value * 24 * 60 * 60 * 1000);
    } else {
      calculatedDate = new Date(now.getFullYear() - value, 0, 1); // January 1st
    }
    
    const maxAge = 150;
    const minDate = new Date(now.getFullYear() - maxAge, 0, 1);
    
    if (calculatedDate > now || calculatedDate < minDate) {
      return { dob: null, displayDate: "Invalid age", isValid: false };
    }
    
    const day = calculatedDate.getDate();
    const month = calculatedDate.getMonth() + 1;
    const year = calculatedDate.getFullYear();
    const displayStr = `${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}-${year}`;
    
    return { dob: calculatedDate, displayDate: displayStr, isValid: true };
  }
  
  return { dob: null, displayDate: "Invalid format", isValid: false };
}

/* ===== Helper: Calculate detailed age from DOB ===== */
function calculateDetailedAge(dobString: string): string {
  if (!dobString) return "-";
  
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return "-";
  
  const now = new Date();
  
  let years = now.getFullYear() - dob.getFullYear();
  let months = now.getMonth() - dob.getMonth();
  let days = now.getDate() - dob.getDate();
  
  // Adjust if days is negative
  if (days < 0) {
    months--;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }
  
  // Adjust if months is negative
  if (months < 0) {
    years--;
    months += 12;
  }
  
  const parts: string[] = [];
  
  if (years > 0) parts.push(`${years} year${years !== 1 ? 's' : ''}`);
  if (months > 0) parts.push(`${months} month${months !== 1 ? 's' : ''}`);
  if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
  
  if (parts.length === 0) return "0 days";
  
  return parts.join(', ');
}

/* ===== Helper: Auto-capitalize patient name (Title Case) ===== */
function toTitleCase(input: string): string {
  return input
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/* ===== Mobile Patient Card Component ===== */
function MobilePatientCard({ patient, index, onEdit }: { patient: PatientRow; index: number; onEdit: () => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs font-medium flex items-center justify-center">
            {index + 1}
          </span>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight break-words">{patient.patientName}</h3>
            <p className="text-xs text-gray-500">MR: {patient.mrNo}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          patient.gender === "Female" ? "bg-pink-100 text-pink-700" : patient.gender === "Male" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
        }`}>
          {patient.gender}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-gray-50 rounded-lg p-2">
          <span className="text-gray-400 block mb-0.5">Age</span>
          <span className="font-medium text-gray-700">{calculateDetailedAge(patient.dob)}</span>
        </div>
        <div className="bg-blue-50 rounded-lg p-2">
          <span className="text-blue-400 block mb-0.5">Phone</span>
          <span className="font-medium text-blue-700">{patient.phone}</span>
        </div>
      </div>

      {expanded && (
        <div className="grid grid-cols-2 gap-2 text-xs animate-in slide-in-from-top-2 duration-200">
          <div className="bg-purple-50 rounded-lg p-2">
            <span className="text-purple-400 block mb-0.5">DOB</span>
            <span className="font-medium text-purple-700">{new Date(patient.dob).toLocaleDateString('en-GB')}</span>
          </div>
          <div className="bg-green-50 rounded-lg p-2">
            <span className="text-green-400 block mb-0.5">Marital Status</span>
            <span className="font-medium text-green-700">{patient.maritalStatus}</span>
          </div>
          {patient.fatherName?.trim() && (
            <div className="bg-orange-50 rounded-lg p-2 col-span-2">
              <span className="text-orange-400 block mb-0.5">Father's Name</span>
              <span className="font-medium text-orange-700">{patient.fatherName}</span>
            </div>
          )}
          {patient.husbandName?.trim() && (
            <div className="bg-pink-50 rounded-lg p-2 col-span-2">
              <span className="text-pink-400 block mb-0.5">Husband's Name</span>
              <span className="font-medium text-pink-700">{patient.husbandName}</span>
            </div>
          )}
          {patient.cnic?.trim() && (
            <div className="bg-yellow-50 rounded-lg p-2 col-span-2">
              <span className="text-yellow-600 block mb-0.5">CNIC</span>
              <span className="font-medium text-yellow-800">{patient.cnic}</span>
            </div>
          )}
        </div>
      )}

      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-center gap-1 py-2 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
        {expanded ? (<>Show Less<ChevronDown className="w-4 h-4 rotate-180" /></>) : (<>Show More<ChevronDown className="w-4 h-4" /></>)}
      </button>

      <div className="flex gap-2 pt-1">
        <EditButton text="Edit" onClick={onEdit} />
      </div>
    </div>
  );
}

export default function PatientInfo() {
  const [activeTab, setActiveTab] = useState<"list" | "add">("add");
  const [selectedPatient, setSelectedPatient] = useState<PatientRow | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"az" | "za">("az");
  const [selectedGenderFilter, setSelectedGenderFilter] = useState<GenderOption | null>(null);
  const [selectedMaritalFilter, setSelectedMaritalFilter] = useState<MaritalStatusOption | null>(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  
  // Form states
  const [patientName, setPatientName] = useState("");
  const [dobInput, setDobInput] = useState("");
  const [calculatedDob, setCalculatedDob] = useState<Date | null>(null);
  const [calculatedDobDisplay, setCalculatedDobDisplay] = useState("");
  const [gender, setGender] = useState("");
  const [selectedGender, setSelectedGender] = useState<GenderOption | null>(null);
  const [phone, setPhone] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [selectedMarital, setSelectedMarital] = useState<MaritalStatusOption | null>(null);
  const [fatherName, setFatherName] = useState("");
  const [husbandName, setHusbandName] = useState("");
  const [cnic, setCnic] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const { showToast } = useToast();

  // CONDITIONAL LOGIC: Only show Husband's Name for Female + Married
  const showHusbandName = gender === "Female" && maritalStatus === "Married";
  const showFatherName = !showHusbandName;

  const activeFilterCount = [selectedGenderFilter, selectedMaritalFilter, sort !== "az" ? "sort" : null].filter(Boolean).length;
  const hasActiveFilters = activeFilterCount > 0;

  const filtered = useMemo(() => {
    return patients
      .filter((p) => {
        const q = search.toLowerCase();
        const matchesSearch = p.patientName?.toLowerCase().includes(q) || 
                             p.phone?.toLowerCase().includes(q) || 
                             p.cnic?.toLowerCase().includes(q) || 
                             p.mrNo?.toString().includes(q);
        const matchesGender = selectedGenderFilter ? p.gender === selectedGenderFilter.value : true;
        const matchesMarital = selectedMaritalFilter ? p.maritalStatus === selectedMaritalFilter.value : true;
        return matchesSearch && matchesGender && matchesMarital;
      })
      .sort((a, b) => sort === "az" ? a.patientName.localeCompare(b.patientName) : b.patientName.localeCompare(a.patientName));
  }, [patients, search, selectedGenderFilter, selectedMaritalFilter, sort]);

  useEffect(() => { loadPatients(); }, []);

 useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    
    // Check if the click is inside any element that has an ID starting with your listboxId pattern
    // or any element with role related to dropdown
    const isInDropdown = !!(
      target.closest('.filter-dropdown') ||
      target.closest('[role="listbox"]') ||
      target.closest('[role="combobox"]') ||
      target.closest('[role="option"]') ||
      // Check if target is within a div that has shadow-xl (your dropdown styling)
      target.closest('div.shadow-xl') ||
      // Check if the active element is the search input
      document.activeElement?.getAttribute('role') === 'combobox'
    );
    
    if (isInDropdown) {
      return;
    }
    
    if (target.closest('.filter-container')) {
      return;
    }
    
    setShowFilterDropdown(false);
  };
  
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);

  const handleDobInputChange = (value: string) => {
    setDobInput(value);
    const result = parseAgeInput(value);
    setCalculatedDob(result.dob);
    setCalculatedDobDisplay(result.displayDate);
  };

  // AUTO-CAPITALIZE: Converts "afzal ali khan" → "Afzal Ali Khan"
  const handlePatientNameChange = (value: string) => {
    setPatientName(toTitleCase(value));
  };

  const handleFatherNameChange = (value: string) => {
  setFatherName(toTitleCase(value));
};

const handleHusbandNameChange = (value: string) => {
  setHusbandName(toTitleCase(value));
};

  const loadPatients = async () => {
    const token = localStorage.getItem("token");
    if (!token) { showToast("error", "Authentication token missing"); return; }
    
    setIsLoadingPatients(true);
    try {
      const res = await PatientNewListApi(token);
      if (!res?.data) { showToast("error", "Failed to load patients"); setPatients([]); return; }
      
      const formatted: PatientRow[] = res.data.map((p: any) => ({
        mrNo: p.mrNo, patientName: p.patientName, dob: p.dob, gender: p.gender,
        phone: p.phone, maritalStatus: p.maritalStatus,
        fatherName: p.fatherName, husbandName: p.husbandName, cnic: p.cnic,
      }));
      setPatients(formatted);
    } catch (error: any) {
      showToast("error", error?.message || "Failed to load patients");
      setPatients([]);
    } finally { setIsLoadingPatients(false); }
  };

  const handleSavePatient = async () => {
    if (!patientName || !calculatedDob || !gender || !phone || !maritalStatus) {
      showToast("error", "Please fill all required fields"); return;
    }
    
    const token = localStorage.getItem("token");
    if (!token) { showToast("error", "Authentication token missing"); return; }

    setIsLoading(true);
    try {
     const payload = {
  patientName, 
  dob: calculatedDob, 
  gender, 
  phone, 
  maritalStatus,
  fatherName: showFatherName ? (fatherName.trim() || " ") : " ",
  husbandName: showHusbandName ? (husbandName.trim() || " ") : " ",
  cnic: cnic.trim() || " ",
  mrNo: selectedPatient?.mrNo
};

      if (selectedPatient) {
        await patientInfoUpdateApi(payload as any, token);
        showToast("success", "Patient updated successfully");
      } else {
        await patientInfoAddApi(payload as any, token);
        showToast("success", "Patient added successfully");
      }
      
      resetForm();
      loadPatients();
    } catch (error: any) {
      showToast("error", error?.message || "Failed to save patient");
    } finally { setIsLoading(false); }
  };

  const handleEditPatient = (patient: PatientRow) => {
    setSelectedPatient(patient);
    setPatientName(patient.patientName);
    
    const dobDate = new Date(patient.dob);
    const dobStr = `${String(dobDate.getDate()).padStart(2, '0')}-${String(dobDate.getMonth() + 1).padStart(2, '0')}-${dobDate.getFullYear()}`;
    setDobInput(dobStr);
    setCalculatedDob(dobDate);
    setCalculatedDobDisplay(dobStr);
    
    setGender(patient.gender);
    setSelectedGender(genderOptions.find(g => g.value === patient.gender) || null);
    setPhone(patient.phone);
    setMaritalStatus(patient.maritalStatus);
    setSelectedMarital(maritalStatusOptions.find(m => m.value === patient.maritalStatus) || null);
    setFatherName(patient.fatherName || "");
    setHusbandName(patient.husbandName || "");
    setCnic(patient.cnic || "");
    setActiveTab("add");
  };

  const resetForm = () => {
    setSelectedPatient(null); setPatientName(""); setDobInput(""); setCalculatedDob(null);
    setCalculatedDobDisplay(""); setGender(""); setSelectedGender(null); setPhone("");
    setMaritalStatus(""); setSelectedMarital(null); setFatherName(""); setHusbandName(""); setCnic("");
  };

  const clearFilters = () => {
    setSelectedGenderFilter(null); setSelectedMaritalFilter(null); setSort("az"); setSearch("");
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="mb-3 sm:mb-5 mt-5 sm:mt-0 flex-shrink-0">
        <HeadBar list="Patients" add=" Add Patient" active={activeTab === "add" ? "left" : "right"} 
                 onLeftClick={() => setActiveTab("add")} onRightClick={() => setActiveTab("list")} />
      </div>

      {activeTab === "add" && (
        <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-2xl p-4 sm:p-6 lg:p-10 overflow-auto min-h-0">
          <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10 border">
            <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-black text-white flex items-center justify-center text-lg sm:text-xl flex-shrink-0">
                <UserPlus />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold truncate">{selectedPatient ? "Update Patient" : "Add Patient"}</h2>
                <p className="text-xs sm:text-sm text-gray-500 truncate">{selectedPatient ? `MR No: ${selectedPatient.mrNo}` : "Register new patient information"}</p>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {/* Patient Name with Auto-capitalization */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Patient Name <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 font-normal ml-2">(e.g., Afzal Ali Khan)</span>
                </label>
                <div className="relative">
      
                  <input value={patientName} onChange={(e) => handlePatientNameChange(e.target.value)}
                         className="w-full pl-10 pr-4 sm:px-5 py-3 sm:py-4 rounded-xl border bg-gray-50 focus:ring-2 focus:ring-black outline-none text-sm sm:text-base"
                         placeholder="Enter patient full name" />
                </div>
              </div>

              {/* Age/DOB with Detailed Display */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Age / Date of Birth <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 font-normal ml-2">(e.g., "25", "60 years", "15 days", or "23-06-2001")</span>
                </label>
                <div className="relative">
                
                  <input value={dobInput} onChange={(e) => handleDobInputChange(e.target.value)}
                         className={`w-full pl-10 pr-4 sm:px-5 py-3 sm:py-4 rounded-xl border bg-gray-50 focus:ring-2 outline-none text-sm sm:text-base ${
                           calculatedDobDisplay?.includes("Invalid") ? "border-red-300 focus:ring-red-200" : 
                           calculatedDob ? "border-green-300 focus:ring-green-200" : "focus:ring-black"
                         }`} placeholder="Enter age (60) or date (23-06-2001)" />
                </div>
                
                {calculatedDobDisplay && (
                  <div className={`mt-2 px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${
                    calculatedDobDisplay.includes("Invalid") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"
                  }`}>
                    <Calendar className="w-4 h-4" />
                    {calculatedDobDisplay.includes("Invalid") ? (
                      <span>{calculatedDobDisplay}</span>
                    ) : (
                      <span>
                        Calculated DOB: <strong>{calculatedDobDisplay}</strong>
                        {calculatedDob && <span className="ml-2 text-green-600">({calculateDetailedAge(calculatedDob.toISOString())})</span>}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Gender and Marital Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Gender <span className="text-red-500">*</span></label>
                  <SearchableDropdown options={genderOptions} value={selectedGender}
                    onChange={(option) => {
                      const g = option as GenderOption;
                      setSelectedGender(g); setGender(g.value);
                      setFatherName(""); setHusbandName("");
                    }} placeholder="Select Gender" emptyMessage="No options found" />
                </div>
               <div>
  <label className="block mb-2 text-sm font-medium text-gray-700">
    Marital Status <span className="text-red-500">*</span>
  </label>
  <SearchableDropdown
    options={gender === "Male" ? maleMaritalStatusOptions : maritalStatusOptions}
    value={selectedMarital}
    onChange={(option) => {
      const m = option as MaritalStatusOption;
      setSelectedMarital(m);
      setMaritalStatus(m.value);
      setFatherName("");
      setHusbandName("");
    }}
    placeholder="Select Marital Status"
    emptyMessage="No options found"
  />
</div>
              </div>

              {/* Phone */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Phone Number <span className="text-red-500">*</span></label>
                <div className="relative">
                
                  <input value={phone} onChange={(e) => setPhone(e.target.value)}
                         className="w-full pl-10 pr-4 sm:px-5 py-3 sm:py-4 rounded-xl border bg-gray-50 focus:ring-2 focus:ring-black outline-none text-sm sm:text-base"
                         placeholder="Enter phone number" />
                </div>
              </div>

              {/* CONDITIONAL FIELD: Only ONE shows at a time */}
              {showHusbandName && (
                <div className="animate-in slide-in-from-top-2 duration-200">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    <span className="flex items-center gap-2"><Heart className="w-4 h-4 text-pink-500" />Husband's Name</span>
                  </label>
                  <div className="relative">
                  
                    <input value={husbandName}  onChange={(e) => handleHusbandNameChange(e.target.value)}
                           className="w-full pl-10 pr-4 sm:px-5 py-3 sm:py-4 rounded-xl border bg-pink-50 focus:ring-2 focus:ring-pink-200 outline-none text-sm sm:text-base"
                           placeholder="Enter husband's name" />
                  </div>
                </div>
              )}

              {showFatherName && (
                <div className="animate-in slide-in-from-top-2 duration-200">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    <span className="flex items-center gap-2"><User className="w-4 h-4 text-orange-500" />Father's Name</span>
                  </label>
                  <div className="relative">
                 
                    <input value={fatherName} onChange={(e) => handleFatherNameChange(e.target.value)}
                           className="w-full pl-10 pr-4 sm:px-5 py-3 sm:py-4 rounded-xl border bg-orange-50 focus:ring-2 focus:ring-orange-200 outline-none text-sm sm:text-base"
                           placeholder="Enter father's name" />
                  </div>
                </div>
              )}

              {/* CNIC */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">CNIC</label>
                <div className="relative">
                
                  <input value={cnic} onChange={(e) => setCnic(e.target.value)}
                         className="w-full pl-10 pr-4 sm:px-5 py-3 sm:py-4 rounded-xl border bg-gray-50 focus:ring-2 focus:ring-black outline-none text-sm sm:text-base"
                         placeholder="Enter CNIC number (optional)" />
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 mt-6 sm:mt-8">
              <button onClick={resetForm} className="px-5 sm:px-6 py-3 rounded-xl text-gray-600 hover:bg-gray-100 text-sm sm:text-base w-full sm:w-auto">Cancel</button>
              <SaveButton text={selectedPatient ? "Update Patient" : "Save Patient"} onClick={handleSavePatient} loading={isLoading}
                          disabled={!patientName || !calculatedDob || !gender || !phone || !maritalStatus} />
            </div>
          </div>
        </div>
      )}

      {/* PATIENT LIST */}
      {activeTab === "list" && (
        <div className="flex-1 bg-white rounded-2xl shadow-xl border flex flex-col min-h-0">
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 sm:py-5 bg-[#2B2C2B] text-white rounded-t-2xl flex-shrink-0">
            <div className="flex flex-col gap-3 sm:hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0"><Users /></div>
                  <div><p className="text-base font-semibold">Patients</p><p className="text-xs text-white/70">Patient registry</p></div>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20">
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-sm flex-shrink-0"><Users /></div>
                  <p className="text-sm font-semibold">{isLoadingPatients ? "..." : filtered.length}</p>
                </div>
              </div>
            </div>

            <div className="hidden sm:flex sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0"><Users /></div>
                <div className="min-w-0"><p className="text-lg font-semibold truncate">Patients</p><p className="text-xs text-white/70 truncate">Patient registry</p></div>
              </div>
              <div className="flex items-center gap-3 px-5 py-2 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-sm flex-shrink-0"><Users /></div>
                <div className="leading-tight"><p className="text-xs text-white/60">Total</p><p className="text-sm font-semibold text-white">{isLoadingPatients ? "Loading..." : `${filtered.length} Patients`}</p></div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="p-3 sm:p-4 border-b bg-gray-50 flex-shrink-0">
            <div className="flex flex-col gap-3 sm:hidden">
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, phone, CNIC or MR No..."
                     className="px-4 py-2.5 rounded-lg border bg-white text-sm outline-none focus:ring-2 focus:ring-black w-full" />
              <div className="relative filter-container">
                <button onClick={() => setShowFilterDropdown(!showFilterDropdown)} className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg border bg-white text-sm ${hasActiveFilters ? "border-black ring-1 ring-black" : ""}`}>
                  <div className="flex items-center gap-2"><Filter className="w-4 h-4" /><span>Filters</span>{hasActiveFilters && <span className="bg-black text-white text-xs px-2 py-0.5 rounded-full">{activeFilterCount}</span>}</div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showFilterDropdown ? "rotate-180" : ""}`} />
                </button>
                {showFilterDropdown && (
                  <div className="filter-dropdown absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border z-[100] overflow-y-auto" style={{ maxHeight: '60vh' }}>
                    <div className="p-4 border-b">
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Filter by Gender</label>
                      <SearchableDropdown options={genderOptions} value={selectedGenderFilter} onChange={(o) => setSelectedGenderFilter(o as GenderOption)} placeholder="Select gender..." emptyMessage="No options found" />
                    </div>
                    <div className="p-4 border-b">
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Filter by Marital Status</label>
                      <SearchableDropdown options={maritalStatusOptions} value={selectedMaritalFilter} onChange={(o) => setSelectedMaritalFilter(o as MaritalStatusOption)} placeholder="Select status..." emptyMessage="No options found" />
                    </div>
                    <div className="p-4 border-b">
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Sort Order</label>
                      <div className="flex gap-2">
                        <button onClick={() => setSort("az")} className={`flex-1 px-3 py-2 rounded-lg text-sm ${sort === "az" ? "bg-black text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>A → Z</button>
                        <button onClick={() => setSort("za")} className={`flex-1 px-3 py-2 rounded-lg text-sm ${sort === "za" ? "bg-black text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>Z → A</button>
                      </div>
                    </div>
                    {hasActiveFilters && (
                      <div className="p-4">
                        <button onClick={clearFilters} className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 text-sm"><X className="w-4 h-4" />Clear All Filters</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="hidden sm:flex sm:justify-between">
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, phone, CNIC or MR No..."
                     className="px-4 py-2.5 rounded-lg border bg-white text-sm outline-none focus:ring-2 focus:ring-black flex-1 max-w-md" />
              <div className="relative filter-container">
                <button onClick={() => setShowFilterDropdown(!showFilterDropdown)} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border bg-white text-sm hover:bg-gray-50 whitespace-nowrap ${hasActiveFilters ? "border-black ring-1 ring-black" : ""}`}>
                  <Filter className="w-4 h-4" /><span>Filter</span>{hasActiveFilters && <span className="bg-black text-white text-xs px-2 py-0.5 rounded-full">{activeFilterCount}</span>}
                  <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showFilterDropdown ? "rotate-180" : ""}`} />
                </button>
                {showFilterDropdown && (
                  <div className="filter-dropdown absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border z-[100] overflow-y-auto" style={{ maxHeight: '70vh' }}>
                    <div className="p-4 border-b">
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Filter by Gender</label>
                      <SearchableDropdown options={genderOptions} value={selectedGenderFilter} onChange={(o) => setSelectedGenderFilter(o as GenderOption)} placeholder="Select gender..." emptyMessage="No options found" />
                    </div>
                    <div className="p-4 border-b">
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Filter by Marital Status</label>
                      <SearchableDropdown options={maritalStatusOptions} value={selectedMaritalFilter} onChange={(o) => setSelectedMaritalFilter(o as MaritalStatusOption)} placeholder="Select status..." emptyMessage="No options found" />
                    </div>
                    <div className="p-4 border-b">
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Sort Order</label>
                      <div className="flex gap-2">
                        <button onClick={() => setSort("az")} className={`flex-1 px-3 py-2 rounded-lg text-sm ${sort === "az" ? "bg-black text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>A → Z</button>
                        <button onClick={() => setSort("za")} className={`flex-1 px-3 py-2 rounded-lg text-sm ${sort === "za" ? "bg-black text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>Z → A</button>
                      </div>
                    </div>
                    {hasActiveFilters && (
                      <div className="p-4">
                        <button onClick={clearFilters} className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 text-sm"><X className="w-4 h-4" />Clear All Filters</button>
                      </div>
                    )}
                  </div>
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
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left">MR No</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left">Patient Name</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left">Age</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left">Gender</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left">Phone</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left">Marital Status</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoadingPatients ? (
                  <tr><td colSpan={8} className="px-6 py-12 text-center"><div className="flex flex-col items-center justify-center gap-3"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /><p className="text-sm text-gray-500">Loading patients...</p></div></td></tr>
                ) : filtered.length > 0 ? (
                  filtered.map((patient, i) => (
                    <tr key={patient.mrNo} className="hover:bg-gray-50">
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-500">{i + 1}</td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 font-mono text-xs text-gray-600">{patient.mrNo}</td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 font-medium text-gray-800">{patient.patientName}</td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-700">{patient.dob}</td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 text-xs rounded-full ${patient.gender === "Female" ? "bg-pink-100 text-pink-700" : patient.gender === "Male" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}>{patient.gender}</span>
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-700">{patient.phone}</td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-700"><span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">{patient.maritalStatus}</span></td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4"><EditButton text="Edit" onClick={() => handleEditPatient(patient)} /></td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-400"><div className="flex flex-col items-center justify-center gap-2"><Users size={48} /><p>No Patients Found</p>{hasActiveFilters && <button onClick={clearFilters} className="text-sm text-blue-600 hover:underline">Clear filters to see all patients</button>}</div></td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="flex-1 overflow-y-auto md:hidden bg-gray-50 min-h-[560px]">
            {isLoadingPatients ? (
              <div className="flex flex-col items-center justify-center gap-3 p-8"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /><p className="text-sm text-gray-500">Loading patients...</p></div>
            ) : filtered.length > 0 ? (
              <div className="p-3 space-y-3">{filtered.map((patient, i) => <MobilePatientCard key={patient.mrNo} patient={patient} index={i} onEdit={() => handleEditPatient(patient)} />)}</div>
            ) : (
              <div className="p-8 text-center text-gray-400 text-sm"><div className="flex flex-col items-center justify-center gap-2"><Users size={48} /><p>No Patients Found</p>{hasActiveFilters && <button onClick={clearFilters} className="text-sm text-blue-600 hover:underline">Clear filters to see all patients</button>}</div></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}