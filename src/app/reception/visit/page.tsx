"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/Components/Toast/ToastContext";
import PatientNewListApi from "@/lib/api/Common/patientinfo/patientNewList";
import patientInfoAddApi from "@/lib/api/Common/patientinfo/patientAdd";
import VisitAddApi from "@/lib/api/Common/Visit/visitAdd";
import BillingTransactionAddApi from "@/lib/api/Common/Billing/BillingAdd";
import docotrListApi from "@/lib/api/Admin/Doctor/doctorList";
import HeadBar from "@/Components/headbar";
import { SearchableDropdown, DropdownOption } from "@/Components/SearchableDropdown";
import SaveButton from "@/Components/button";
import {
    UserPlus,
    Users,
    Stethoscope,
    CreditCard,
    ChevronRight,
    ChevronLeft,
    Check,
    Calendar,
    Phone,
    User,
    Heart,
    Activity,
    DollarSign,
    FileText,
    Loader2,
    Search,
    AlertCircle,
    Building2,
    ClipboardList
} from "lucide-react";

// Types
type PatientOption = DropdownOption & {
    mrNo: number;
    patientName: string;
    dob: string;
    gender: string;
    phone: string;
    maritalStatus: string;
};

type DoctorOption = DropdownOption & {
    username: string;
    status: string;
    doctorID: number;
};

type GenderOption = DropdownOption & { value: string };
type MaritalStatusOption = DropdownOption & { value: string };

const genderOptions: GenderOption[] = [
    { id: 1, name: "Male", label: "Male", value: "Male" },
    { id: 2, name: "Female", label: "Female", value: "Female" },
    { id: 3, name: "Other", label: "Other", value: "Other" },
];

const maleMaritalStatusOptions: MaritalStatusOption[] = [
    { id: 1, name: "Single", label: "Single", value: "Single" },
    { id: 2, name: "Married", label: "Married", value: "Married" },
];

const femaleMaritalStatusOptions: MaritalStatusOption[] = [
    { id: 1, name: "Single", label: "Single", value: "Single" },
    { id: 2, name: "Married", label: "Married", value: "Married" },
    { id: 3, name: "Divorced", label: "Divorced", value: "Divorced" },
    { id: 4, name: "Widowed", label: "Widowed", value: "Widowed" },
];

type PaymentTypeOption = {
  id: number;
  name: string;
  label: string;
  value: string;
};

const paymentTypes: PaymentTypeOption[] = [
  { id: 1, name: "Consultation", label: "Consultation", value: "Doctor fee" },
];

type PaymentModeOption = {
  id: number;
  name: string;
  label: string;
  value: string;
};

// Update the paymentModes array to use the proper type
const paymentModes: PaymentModeOption[] = [
  { id: 1, name: "Cash", label: "Cash", value: "Cash" },
  { id: 2, name: "Card", label: "Card", value: "Card" },
  { id: 3, name: "Bank Transfer", label: "Bank Transfer", value: "Bank Transfer" },
  { id: 4, name: "Insurance", label: "Insurance", value: "Insurance" },
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
        const month = parseInt(dateMatch[2]) - 1;
        const year = parseInt(dateMatch[3]);
        const date = new Date(year, month, day);

        const now = new Date();
        const maxAge = 150;
        const minDate = new Date(now.getFullYear() - maxAge, now.getMonth(), now.getDate());

        if (date > now || date < minDate) {
            return { dob: null, displayDate: "Invalid date", isValid: false };
        }

        const displayStr = `${String(day).padStart(2, '0')}-${String(month + 1).padStart(2, '0')}-${year}`;
        return { dob: date, displayDate: displayStr, isValid: true };
    }

    // Check if it's an age input
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
            calculatedDate = new Date(now.getFullYear() - value, 0, 1);
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

/* ===== Helper: Auto-capitalize (Title Case) ===== */
function toTitleCase(input: string): string {
    return input
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/* ===== Stepper Component ===== */
function Stepper({ currentStep, steps }: { currentStep: number; steps: string[] }) {
    return (
        <div className="w-full py-6">
            <div className="flex items-center justify-between relative">
                {/* Progress Line Background */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 rounded-full" />

                {/* Active Progress Line */}
                <div
                    className="absolute top-1/2 left-0 h-1 bg-black -translate-y-1/2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                />

                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isCompleted = currentStep > stepNumber;
                    const isCurrent = currentStep === stepNumber;
                    const isPending = currentStep < stepNumber;

                    return (
                        <div key={index} className="relative flex flex-col items-center z-10">
                            {/* Step Circle */}
                            <div
                                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-sm sm:text-base font-semibold transition-all duration-300 border-2
                  ${isCompleted ? "bg-black text-white border-black" : ""}
                  ${isCurrent ? "bg-black text-white border-black scale-110 shadow-lg shadow-black/20" : ""}
                  ${isPending ? "bg-white text-gray-400 border-gray-300" : ""}
                `}
                            >
                                {isCompleted ? (
                                    <Check className="w-5 h-5 sm:w-6 sm:h-6" />
                                ) : (
                                    stepNumber
                                )}
                            </div>

                            {/* Step Label */}
                            <span className={`mt-2 text-xs sm:text-sm font-medium transition-colors duration-300
                ${isCompleted || isCurrent ? "text-black" : "text-gray-400"}
              `}>
                                {step}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* ===== Main Component ===== */
export default function Visit() {
    const [activeTab, setActiveTab] = useState<"list" | "add">("add");
    const [currentStep, setCurrentStep] = useState(1);
    const { showToast } = useToast();

    // Data states
    const [patients, setPatients] = useState<PatientOption[]>([]);
    const [doctors, setDoctors] = useState<DoctorOption[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingPatients, setIsLoadingPatients] = useState(false);
    const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);

    // Form states
    const [patientSelectionMode, setPatientSelectionMode] = useState<"new" | "existing">("new");
    const [selectedExistingPatient, setSelectedExistingPatient] = useState<PatientOption | null>(null);

    // New patient form
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

    // Visit/Vital signs form
    const [selectedDoctor, setSelectedDoctor] = useState<DoctorOption | null>(null);
    const [complaint, setComplaint] = useState("");
    const [vitalSigns, setVitalSigns] = useState({
        bloodPressure: "",
        pulse: "",
        temperature: "",
        respiratoryRate: "",
        oxygenSaturation: "",
        weight: "",
        height: "",
    });

    // Payment form
    const [payment, setPayment] = useState({
        totalAmount: "",
        paidAmount: "",
        type: "",
        paymentMode: "",
        remarks: "",
    });
  const [selectedPaymentType, setSelectedPaymentType] = useState<PaymentTypeOption | null>(null);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<PaymentModeOption | null>(null);

    const steps = ["Patient Info", "Vital Signs & Doctor", "Payment"];

    // Conditional display
    const showHusbandName = gender === "Female" && maritalStatus === "Married";
    const showFatherName = !showHusbandName;

    // Get available marital status options based on gender
    const getMaritalStatusOptions = () => {
        if (!gender) return [];
        if (gender === "Male") return maleMaritalStatusOptions;
        return femaleMaritalStatusOptions;
    };

    useEffect(() => {
        if (activeTab === "add") {
            loadPatients();
            loadDoctors();
        }
    }, [activeTab]);

    const loadPatients = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        setIsLoadingPatients(true);
        try {
            const res = await PatientNewListApi(token);
            if (res?.data) {
                const formatted: PatientOption[] = res.data.map((p: any) => ({
                    id: p.mrNo,
                    name: `${p.patientName} (MR: ${p.mrNo})`,
                    label: p.patientName,
                    value: p.mrNo.toString(),
                    mrNo: p.mrNo,
                    patientName: p.patientName,
                    dob: p.dob,
                    gender: p.gender,
                    phone: p.phone,
                    maritalStatus: p.maritalStatus,
                }));
                setPatients(formatted);
            }
        } catch (error) {
            console.error("Failed to load patients");
        } finally {
            setIsLoadingPatients(false);
        }
    };

    const loadDoctors = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        setIsLoadingDoctors(true);
        try {
            const res = await docotrListApi(token);
            if (res?.data) {
                const formatted: DoctorOption[] = res.data
                    .filter((d: any) => d.status === "Ok")
                    .map((d: any, index: number) => ({
                        id: index,
                        name: d.username,
                        label: d.username,
                        value: d.username,
                        username: d.username,
                        status: d.status,
                        doctorID: d.doctorID || index + 1, // Fallback if doctorID not in response
                    }));
                setDoctors(formatted);
            }
        } catch (error) {
            console.error("Failed to load doctors");
        } finally {
            setIsLoadingDoctors(false);
        }
    };

    const handleDobInputChange = (value: string) => {
        setDobInput(value);
        const result = parseAgeInput(value);
        setCalculatedDob(result.dob);
        setCalculatedDobDisplay(result.displayDate);
    };

    const handlePatientNameChange = (value: string) => {
        setPatientName(toTitleCase(value));
    };

    const handleFatherNameChange = (value: string) => {
        setFatherName(toTitleCase(value));
    };

    const handleHusbandNameChange = (value: string) => {
        setHusbandName(toTitleCase(value));
    };

    const handleGenderChange = (option: GenderOption) => {
        setSelectedGender(option);
        setGender(option.value);
        // Reset marital status when gender changes
        setSelectedMarital(null);
        setMaritalStatus("");
        setFatherName("");
        setHusbandName("");
    };

    const handleNextStep = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            showToast("error", "Authentication token missing");
            return;
        }

        // Step 1 Validation & API Call
        if (currentStep === 1) {
            if (patientSelectionMode === "existing") {
                if (!selectedExistingPatient) {
                    showToast("error", "Please select a patient from the list");
                    return;
                }
                // Store MR_NO and proceed
                localStorage.setItem("currentVisitMrNo", selectedExistingPatient.mrNo.toString());
            } else {
                // New patient - validate and call API
                if (!patientName || !calculatedDob || !gender || !phone || !maritalStatus) {
                    showToast("error", "Please fill all required fields");
                    return;
                }

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
                    };

                    const res = await patientInfoAddApi(payload as any, token);
                    if (res?.mrNo || res?.data?.mrNo) {
                        const newMrNo = res?.mrNo || res?.data?.mrNo;
                        localStorage.setItem("currentVisitMrNo", newMrNo.toString());
                        showToast("success", "Patient added successfully");
                    } else {
                        showToast("error", "Failed to get MR number from response");
                        setIsLoading(false);
                        return;
                    }
                } catch (error: any) {
                    showToast("error", error?.message || "Failed to add patient");
                    setIsLoading(false);
                    return;
                } finally {
                    setIsLoading(false);
                }
            }
            setCurrentStep(2);
        }

        // Step 2 Validation & API Call (Visit Add)
       // Step 2 Validation & API Call (Visit Add)
else if (currentStep === 2) {
    if (!selectedDoctor) {
        showToast("error", "Please select a doctor");
        return;
    }

    const mrNo = localStorage.getItem("currentVisitMrNo");
    if (!mrNo) {
        showToast("error", "MR number not found");
        return;
    }

    setIsLoading(true);
    try {
        const visitPayload = {
            mrNo: mrNo,
            doctorID: selectedDoctor.username || "",
            department: "General",
            complaint: complaint.trim() || "",  // ✅ Empty string if not provided
            vitals: {
                temperature: parseFloat(vitalSigns.temperature) || 0,        // ✅ 0 if empty
                pulse: parseInt(vitalSigns.pulse) || 0,                    // ✅ 0 if empty
                bloodPressure: vitalSigns.bloodPressure || "",               // ✅ Empty string if empty
                respiratoryRate: parseInt(vitalSigns.respiratoryRate) || 0,  // ✅ 0 if empty
                oxygenSaturation: parseInt(vitalSigns.oxygenSaturation) || 0,  // ✅ 0 if empty
                weight: parseFloat(vitalSigns.weight) || 0,                // ✅ 0 if empty
                height: parseFloat(vitalSigns.height) || 0,                // ✅ 0 if empty
            },
        };

        const res = await VisitAddApi(visitPayload, token);
        if (res?.visitID || res?.data?.visitID) {
            const visitId = res?.visitID || res?.data?.visitID;
            localStorage.setItem("currentVisitId", visitId.toString());
            showToast("success", "Visit created successfully");
            setCurrentStep(3);
        } else {
            showToast("error", "Failed to get Visit ID from response");
        }
    } catch (error: any) {
        showToast("error", error?.message || "Failed to create visit");
    } finally {
        setIsLoading(false);
    }
}
    };

    const handleSave = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            showToast("error", "Authentication token missing");
            return;
        }

        const visitId = localStorage.getItem("currentVisitId");
        if (!visitId) {
            showToast("error", "Visit ID not found");
            return;
        }

        if (!payment.totalAmount || !payment.paidAmount || !payment.type || !payment.paymentMode) {
            showToast("error", "Please fill all payment details");
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                visitID: parseInt(visitId),
                totalAmount: parseFloat(payment.totalAmount),
                paidAmount: parseFloat(payment.paidAmount),
                type: payment.type,
                paymentMode: payment.paymentMode,
                remarks: payment.remarks || " ",
            };

            await BillingTransactionAddApi(payload, token);
            showToast("success", "Payment processed successfully! Visit completed.");

            // Reset and go back to step 1
            resetForm();
            setCurrentStep(1);
        } catch (error: any) {
            showToast("error", error?.message || "Failed to process payment");
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        // Clear local storage
        localStorage.removeItem("currentVisitMrNo");
        localStorage.removeItem("currentVisitId");

        // Reset all states
        setPatientSelectionMode("new");
        setSelectedExistingPatient(null);
        setPatientName("");
        setDobInput("");
        setCalculatedDob(null);
        setCalculatedDobDisplay("");
        setGender("");
        setSelectedGender(null);
        setPhone("");
        setMaritalStatus("");
        setSelectedMarital(null);
        setFatherName("");
        setHusbandName("");
        setCnic("");
        setSelectedDoctor(null);
        setComplaint("");
        setVitalSigns({
            bloodPressure: "",
            pulse: "",
            temperature: "",
            respiratoryRate: "",
            oxygenSaturation: "",
            weight: "",
            height: "",
        });
        setPayment({
            totalAmount: "",
            paidAmount: "",
            type: "",
            paymentMode: "",
            remarks: "",
        });
        setSelectedPaymentType(null);
        setSelectedPaymentMode(null);
    };

    const handlePreviousStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    /* ===== LIST VIEW ===== */
    if (activeTab === "list") {
        return (
            <div className="flex flex-col h-full min-h-0">
                <div className="mb-3 sm:mb-5 mt-5 sm:mt-0 flex-shrink-0">
                    {/* <HeadBar
                        list="Visits"
                        add="New Visit"
                        active={activeTab === "add" ? "left" : "right"}
                        onLeftClick={() => setActiveTab("add")}
                        onRightClick={() => setActiveTab("list")}
                    /> */}
                </div>

                <div className="flex-1 bg-white rounded-2xl shadow-xl border flex flex-col items-center justify-center min-h-[400px]">
                    <div className="text-center space-y-4 p-8">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                            <FileText className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">Coming Soon</h3>
                        <p className="text-gray-500 max-w-sm">
                            Visit listing feature is under development. You can create new visits using the "New Visit" tab.
                        </p>
                        <button
                            onClick={() => setActiveTab("add")}
                            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            Create New Visit
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    /* ===== ADD VIEW ===== */
    return (
        <div className="flex flex-col h-full min-h-0">
            <div className="mb-3 sm:mb-5 mt-5 sm:mt-0 flex-shrink-0">
                <HeadBar
                    list="Visits"
                    add="New Visit"
                    active={activeTab === "add" ? "left" : "right"}
                    onLeftClick={() => setActiveTab("add")}
                    onRightClick={() => setActiveTab("list")}
                />
            </div>

            <div className="flex-1 bg-gray-50 rounded-2xl p-4 sm:p-6 lg:p-8 overflow-auto min-h-0">
                <div className="max-w-4xl mx-auto">
                    {/* Header Card */}
                    <div className="bg-white rounded-2xl shadow-sm border p-4 sm:p-6 mb-6">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center">
                                <Stethoscope className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">New Visit</h2>
                                <p className="text-sm text-gray-500">Create a new patient visit in 3 simple steps</p>
                            </div>
                        </div>
                    </div>

                    {/* Stepper */}
                    <div className="bg-white rounded-2xl shadow-sm border p-4 sm:p-6 mb-6">
                        <Stepper currentStep={currentStep} steps={steps} />
                    </div>

                    {/* Step Content */}
                    <div className="bg-white rounded-2xl shadow-xl border overflow-hidden">
                        {/* Step 1: Patient Information */}
                        {currentStep === 1 && (
                            <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                                        <UserPlus className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Patient Information</h3>
                                        <p className="text-sm text-gray-500">Select existing patient or add new</p>
                                    </div>
                                </div>

                                {/* Selection Mode Toggle */}
                                <div className="grid grid-cols-2 gap-4 p-1 bg-gray-100 rounded-xl">
                                    <button
                                        onClick={() => setPatientSelectionMode("new")}
                                        className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all
                      ${patientSelectionMode === "new"
                                                ? "bg-white text-black shadow-sm"
                                                : "text-gray-600 hover:text-gray-900"
                                            }`}
                                    >
                                        <UserPlus className="w-4 h-4" />
                                        New Patient
                                    </button>
                                    <button
                                        onClick={() => setPatientSelectionMode("existing")}
                                        className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all
                      ${patientSelectionMode === "existing"
                                                ? "bg-white text-black shadow-sm"
                                                : "text-gray-600 hover:text-gray-900"
                                            }`}
                                    >
                                        <Search className="w-4 h-4" />
                                        Existing Patient
                                    </button>
                                </div>

                                {/* Existing Patient Selection */}
                                {patientSelectionMode === "existing" && (
                                    <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Select Patient <span className="text-red-500">*</span>
                                        </label>
                                        <SearchableDropdown
                                            options={patients}
                                            value={selectedExistingPatient}
                                            onChange={(option) => setSelectedExistingPatient(option as PatientOption)}
                                            placeholder="Search patient by name or MR number..."
                                            emptyMessage="No patients found"
                                        />
                                        {selectedExistingPatient && (
                                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-gray-500">MR No:</span>
                                                        <span className="ml-2 font-medium text-gray-900">{selectedExistingPatient.mrNo}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Phone:</span>
                                                        <span className="ml-2 font-medium text-gray-900">{selectedExistingPatient.phone}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Gender:</span>
                                                        <span className="ml-2 font-medium text-gray-900">{selectedExistingPatient.gender}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Marital Status:</span>
                                                        <span className="ml-2 font-medium text-gray-900">{selectedExistingPatient.maritalStatus}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* New Patient Form */}
                                {patientSelectionMode === "new" && (
                                    <div className="space-y-5 animate-in slide-in-from-top-2 duration-200">
                                        {/* Patient Name */}
                                        <div>
                                            <label className="block mb-2 text-sm font-medium text-gray-700">
                                                Patient Name <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    value={patientName}
                                                    onChange={(e) => handlePatientNameChange(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-3 rounded-xl border bg-gray-50 focus:ring-2 focus:ring-black outline-none"
                                                    placeholder="Enter patient full name"
                                                />
                                            </div>
                                        </div>

                                        {/* Age/DOB */}
                                        <div>
                                            <label className="block mb-2 text-sm font-medium text-gray-700">
                                                Age / Date of Birth <span className="text-red-500">*</span>
                                                <span className="text-xs text-gray-500 font-normal ml-2">(e.g., "25", "60 years", "15 days", or "23-06-2001")</span>
                                            </label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    value={dobInput}
                                                    onChange={(e) => handleDobInputChange(e.target.value)}
                                                    className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-gray-50 focus:ring-2 outline-none
                            ${calculatedDobDisplay?.includes("Invalid") ? "border-red-300 focus:ring-red-200" :
                                                            calculatedDob ? "border-green-300 focus:ring-green-200" : "focus:ring-black"
                                                        }`}
                                                    placeholder="Enter age (60) or date (23-06-2001)"
                                                />
                                            </div>
                                            {calculatedDobDisplay && (
                                                <div className={`mt-2 px-4 py-2 rounded-lg text-sm flex items-center gap-2
                          ${calculatedDobDisplay.includes("Invalid") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}
                        `}>
                                                    <Calendar className="w-4 h-4" />
                                                    {calculatedDobDisplay.includes("Invalid") ? (
                                                        <span>{calculatedDobDisplay}</span>
                                                    ) : (
                                                        <span>Calculated DOB: <strong>{calculatedDobDisplay}</strong></span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Gender & Marital Status */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block mb-2 text-sm font-medium text-gray-700">
                                                    Gender <span className="text-red-500">*</span>
                                                </label>
                                                <SearchableDropdown
                                                    options={genderOptions}
                                                    value={selectedGender}
                                                    onChange={(option) => handleGenderChange(option as GenderOption)}
                                                    placeholder="Select Gender"
                                                    emptyMessage="No options found"
                                                />
                                            </div>
                                            <div>
                                                <label className="block mb-2 text-sm font-medium text-gray-700">
                                                    Marital Status <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <SearchableDropdown
                                                        options={getMaritalStatusOptions()}
                                                        value={selectedMarital}
                                                        onChange={(option) => {
                                                            const m = option as MaritalStatusOption;
                                                            setSelectedMarital(m);
                                                            setMaritalStatus(m.value);
                                                            setFatherName("");
                                                            setHusbandName("");
                                                        }}
                                                        placeholder={gender ? "Select Marital Status" : "Select Gender First"}
                                                        emptyMessage="No options found"
                                                    />
                                                    {!gender && (
                                                        <div className="absolute inset-0 bg-gray-100/50 cursor-not-allowed rounded-xl" title="Please select gender first" />
                                                    )}
                                                </div>
                                                {!gender && (
                                                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3" />
                                                        Please select gender first
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Phone */}
                                        <div>
                                            <label className="block mb-2 text-sm font-medium text-gray-700">
                                                Phone Number <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-3 rounded-xl border bg-gray-50 focus:ring-2 focus:ring-black outline-none"
                                                    placeholder="Enter phone number"
                                                />
                                            </div>
                                        </div>

                                        {/* Conditional Fields */}
                                        {showHusbandName && (
                                            <div className="animate-in slide-in-from-top-2 duration-200">
                                                <label className="block mb-2 text-sm font-medium text-gray-700">
                                                    <span className="flex items-center gap-2">
                                                        <Heart className="w-4 h-4 text-pink-500" />
                                                        Husband's Name
                                                    </span>
                                                </label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <input
                                                        value={husbandName}
                                                        onChange={(e) => handleHusbandNameChange(e.target.value)}
                                                        className="w-full pl-10 pr-4 py-3 rounded-xl border bg-pink-50 focus:ring-2 focus:ring-pink-200 outline-none"
                                                        placeholder="Enter husband's name"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {showFatherName && (
                                            <div className="animate-in slide-in-from-top-2 duration-200">
                                                <label className="block mb-2 text-sm font-medium text-gray-700">
                                                    <span className="flex items-center gap-2">
                                                        <User className="w-4 h-4 text-orange-500" />
                                                        Father's Name
                                                    </span>
                                                </label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <input
                                                        value={fatherName}
                                                        onChange={(e) => handleFatherNameChange(e.target.value)}
                                                        className="w-full pl-10 pr-4 py-3 rounded-xl border bg-orange-50 focus:ring-2 focus:ring-orange-200 outline-none"
                                                        placeholder="Enter father's name"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* CNIC */}
                                        <div>
                                            <label className="block mb-2 text-sm font-medium text-gray-700">CNIC</label>
                                            <div className="relative">
                                                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    value={cnic}
                                                    onChange={(e) => setCnic(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-3 rounded-xl border bg-gray-50 focus:ring-2 focus:ring-black outline-none"
                                                    placeholder="Enter CNIC number (optional)"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 2: Vital Signs & Doctor */}
                        {currentStep === 2 && (
                            <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                                        <Activity className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Vital Signs & Doctor</h3>
                                        <p className="text-sm text-gray-500">Select doctor, enter complaint and record vital signs</p>
                                    </div>
                                </div>

                                {/* Doctor Selection */}
                                <div className="p-4 bg-gray-50 rounded-xl border">
                                    <label className="block mb-3 text-sm font-medium text-gray-700">
                                        <span className="flex items-center gap-2">
                                            <Stethoscope className="w-4 h-4" />
                                            Select Doctor <span className="text-red-500">*</span>
                                        </span>
                                    </label>
                                    <SearchableDropdown
                                        options={doctors}
                                        value={selectedDoctor}
                                        onChange={(option) => setSelectedDoctor(option as DoctorOption)}
                                        placeholder="Search and select doctor..."
                                        emptyMessage="No doctors available"
                                    />
                                    {isLoadingDoctors && (
                                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                            Loading doctors...
                                        </p>
                                    )}
                                </div>

                                {/* Department Display (Hardcoded) */}
                                <div className="p-4 bg-gray-50 rounded-xl border">
                                    <label className="block mb-2 text-sm font-medium text-gray-700">
                                        <span className="flex items-center gap-2">
                                            <Building2 className="w-4 h-4" />
                                            Department
                                        </span>
                                    </label>
                                    <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-lg border">
                                        <span className="px-3 py-1 bg-black text-white text-xs font-medium rounded-md">General</span>
                                        <span className="text-sm text-gray-500">Default department for all visits</span>
                                    </div>
                                </div>

                                {/* Complaint Input */}
                                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                                    <label className="block mb-2 text-sm font-medium text-gray-700">
                                        <span className="flex items-center gap-2">
                                            <ClipboardList className="w-4 h-4 text-amber-600" />
                                            Patient Complaint 
                                        </span>
                                    </label>
                                    <textarea
                                        value={complaint}
                                        onChange={(e) => setComplaint(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border bg-white focus:ring-2 focus:ring-amber-200 outline-none resize-none h-24"
                                        placeholder="Enter patient's primary complaint or reason for visit..."
                                    />
                                </div>

                                {/* MR Number Display */}
                                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                                            <Users className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Current Patient MR No</p>
                                            <p className="text-lg font-semibold text-gray-900">
                                                {localStorage.getItem("currentVisitMrNo") || "N/A"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Vital Signs Grid */}
                                <div>
                                    <label className="block mb-3 text-sm font-medium text-gray-700">
                                        <span className="flex items-center gap-2">
                                            <Activity className="w-4 h-4" />
                                            Vital Signs <span className="text-red-500">*</span>
                                        </span>
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                       
                                            {[
    { key: "bloodPressure", label: "Blood Pressure", placeholder: "120/80", unit: "mmHg", required: false },  // ✅ Changed to false
    { key: "pulse", label: "Pulse Rate", placeholder: "72", unit: "bpm", required: false },  // ✅ Changed to false
    { key: "temperature", label: "Temperature", placeholder: "98.6", unit: "°F", required: false },  // ✅ Changed to false
    { key: "respiratoryRate", label: "Respiratory Rate", placeholder: "16", unit: "/min", required: false },
    { key: "oxygenSaturation", label: "Oxygen Saturation", placeholder: "98", unit: "%", required: false },
    { key: "weight", label: "Weight", placeholder: "70", unit: "kg", required: false },
    { key: "height", label: "Height", placeholder: "170", unit: "cm", required: false },
].map((field) => (
                                            <div key={field.key} className="relative">
                                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                                    {field.label} {field.required && <span className="text-red-500">*</span>}
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={field.key === "bloodPressure" ? "text" : "number"}
                                                        value={vitalSigns[field.key as keyof typeof vitalSigns]}
                                                        onChange={(e) => setVitalSigns(prev => ({ ...prev, [field.key]: e.target.value }))}
                                                        className={`w-full px-3 py-2 pr-12 rounded-lg border bg-white focus:ring-2 outline-none text-sm
                              ${field.required ? "focus:ring-black" : "focus:ring-gray-200"}
                            `}
                                                        placeholder={field.placeholder}
                                                    />
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                                                        {field.unit}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Payment */}
                        {currentStep === 3 && (
                            <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                                        <CreditCard className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Payment</h3>
                                        <p className="text-sm text-gray-500">Process billing and payment</p>
                                    </div>
                                </div>

                                {/* Visit ID Display */}
                                <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Visit ID</p>
                                            <p className="text-lg font-semibold text-gray-900">
                                                {localStorage.getItem("currentVisitId") || "N/A"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Form */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-700">
                                            Payment Type <span className="text-red-500">*</span>
                                        </label>
                                        <SearchableDropdown
                                            options={paymentTypes}
                                            value={selectedPaymentType}
                                            onChange={(option) => {
                                                setSelectedPaymentType(option);
                                                setPayment(prev => ({ ...prev, type: option?.value || "" }));
                                            }}
                                            placeholder="Select type"
                                            emptyMessage="No options"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-700">
                                            Payment Mode <span className="text-red-500">*</span>
                                        </label>
                                        <SearchableDropdown
                                            options={paymentModes}
                                            value={selectedPaymentMode} 
                                            onChange={(option) => {
                                                setSelectedPaymentMode(option);
                                                setPayment(prev => ({ ...prev, paymentMode: option?.value || "" }));
                                            }}
                                            placeholder="Select mode"
                                            emptyMessage="No options"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-700">
                                            Total Amount <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="number"
                                                value={payment.totalAmount}
                                                onChange={(e) => setPayment(prev => ({ ...prev, totalAmount: e.target.value }))}
                                                className="w-full pl-10 pr-4 py-3 rounded-xl border bg-gray-50 focus:ring-2 focus:ring-black outline-none"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-700">
                                            Paid Amount <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="number"
                                                value={payment.paidAmount}
                                                onChange={(e) => setPayment(prev => ({ ...prev, paidAmount: e.target.value }))}
                                                className="w-full pl-10 pr-4 py-3 rounded-xl border bg-gray-50 focus:ring-2 focus:ring-black outline-none"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Remarks */}
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700">Remarks</label>
                                    <textarea
                                        value={payment.remarks}
                                        onChange={(e) => setPayment(prev => ({ ...prev, remarks: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-xl border bg-gray-50 focus:ring-2 focus:ring-black outline-none resize-none h-24"
                                        placeholder="Enter any additional notes..."
                                    />
                                </div>

                                {/* Summary */}
                                <div className="p-4 bg-gray-50 rounded-xl border">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Payment Summary</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Total Amount:</span>
                                            <span className="font-medium">${payment.totalAmount || "0.00"}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Paid Amount:</span>
                                            <span className="font-medium text-green-600">${payment.paidAmount || "0.00"}</span>
                                        </div>
                                        <div className="border-t pt-2 flex justify-between">
                                            <span className="text-gray-500">Balance:</span>
                                            <span className="font-semibold">
                                                ${(parseFloat(payment.totalAmount || "0") - parseFloat(payment.paidAmount || "0")).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="p-4 sm:p-6 lg:p-8 border-t bg-gray-50 flex flex-col-reverse sm:flex-row justify-between gap-3">
                            <button
                                onClick={currentStep === 1 ? () => resetForm() : handlePreviousStep}
                                className="px-6 py-3 rounded-xl text-gray-600 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                            >
                                {currentStep === 1 ? (
                                    <>Cancel</>
                                ) : (
                                    <><ChevronLeft className="w-4 h-4" /> Previous</>
                                )}
                            </button>

                            {currentStep < 3 ? (
                                <SaveButton
                                    text="Next Step"
                                    onClick={handleNextStep}
                                    loading={isLoading}
                                    disabled={
                                        currentStep === 1
                                            ? patientSelectionMode === "new"
                                                ? !patientName || !calculatedDob || !gender || !phone || !maritalStatus
                                                : !selectedExistingPatient
                                            : currentStep === 2
    ? !selectedDoctor  // ✅ Only doctor is required now
    : false
                                    }
                                />
                            ) : (
                                <SaveButton
                                    text="Complete & Save"
                                    onClick={handleSave}
                                    loading={isLoading}
                                    disabled={!payment.totalAmount || !payment.paidAmount || !payment.type || !payment.paymentMode}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}