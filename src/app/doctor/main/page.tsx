"use client";

import ConsultationAddApi from "@/lib/api/Doctor/PatientVisitInfo/ConsultationAdd";
import PatientHistoryListApi from "@/lib/api/Doctor/PatientVisitInfo/PatientHistory";
import PatientQueueListApi from "@/lib/api/Doctor/PatientVisitInfo/PatientQueue";
import PatientVisitDetailsListApi from "@/lib/api/Doctor/PatientVisitInfo/PatientVisitDetails";
import premorbidListApi from "@/lib/api/Admin/Premorbid/premorbidList";
import investigationListApi from "@/lib/api/Admin/Investigation/investigationList";
import diagnosisListApi from "@/lib/api/Admin/Diagnosis/diagnosisList";
import medicineListApi from "@/lib/api/Admin/Medecine/medicineList";
import dosageListApi from "@/lib/api/Admin/Dosage/dosageList";
import { useToast } from "@/Components/Toast/ToastContext";
import { SearchableDropdown, DropdownOption } from "@/Components/SearchableDropdown";

import { useState, useEffect, useCallback } from "react";

import {
  Loader2,
  User,
  Clock,
  Calendar,
  History,
  FileText,
  Stethoscope,
  ChevronRight,
  Save,
  Activity,
  Thermometer,
  Heart,
  Pill,
  CheckCircle,
  AlertCircle,
  ClipboardList,
  FlaskConical,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Waves,
  ArrowRight,
  XCircle,
  ChevronLeft
} from "lucide-react";



// Types
type QueueItem = {
  queueID: number;
  visitID: number;
  visitNo: number;
  visitDate: string;
  mrNo: string;
  patientName: string;
  phone: string;
  complaint: string;
};

type PatientVisit = {
  patientName: string;
  dob: string;
  gender: string;
  phone: string;
  maritalStatus: string;
  fatherName: string;
  husbandName: string;
  cnic: string;
  createdDate: string;
  mrNo: string;
  visitID: number;
  visitNo: number;
  visitDate: string;
  doctorUser: string;
  department: string;
  complaint: string;
  diagnosis: string | null;
  premorbids: string | null;
  investigations: string | null;
  nextVisitDate: string | null;
};

type Vital = {
  vitalID: number;
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

type HistoryItem = {
  visitID: number;
  visitDate: string;
  complaint: string;
  diagnosis: string | object;
  vitals: { temp: number; pulse: number; bp: string }[];
  medicines: { name: string; dosage: string; frequency: string; duration: string }[];
};

type MedicineEntry = {
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  route: string;
  instructions: string;
};

type StatusOption = DropdownOption & { metadata?: { status: string } };

// API Response types
type PremorbidItem = { premorbid: string; premorbidID: number };
type InvestigationItem = { testName: string; price: number; reportingTime: number; testID: number };
type DiagnosisItem = { diagnosis: string; diagnosisID: number };
type MedicineItem = { medicine: string; medicineID: number };

// Tag/Chip Component for multi-select
type TagItem = { id: number | string; label: string; value: string };

// Add this helper function
const getOptionValue = (option: DropdownOption): string => {
  return (option.metadata as { value?: string })?.value || option.label;
};

 const TagChip = ({ item, onRemove }: { item: TagItem; onRemove: () => void }) => (
    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#2B2C2B] text-white rounded-lg text-sm shadow-sm">
      {item.label}
      <button
        onClick={onRemove}
        className="ml-1 p-0.5 hover:bg-white/20 rounded transition-colors"
        type="button"
      >
        <XCircle className="w-3.5 h-3.5" />
      </button>
    </span>
  );


const StatCard = ({ label, value, unit, icon: Icon }: { label: string; value: string | number; unit?: string; icon: any }) => (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 hover:shadow-md hover:border-[#2B2C2B]/20 transition-all group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-[#2B2C2B] mt-1 group-hover:scale-105 transition-transform origin-left">
            {value}
            {unit && <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>}
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[#2B2C2B] flex items-center justify-center group-hover:scale-110 transition-transform">
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );

  // Simple Section Component
  const SimpleSection = ({ title, icon: Icon, children, color = "gray" }: { title: string; icon: any; children: React.ReactNode; color?: "gray" | "amber" | "emerald" | "rose" }) => {
    const colors = {
      gray: "from-gray-100 to-gray-50 border-gray-200",
      amber: "from-amber-50 to-amber-100/50 border-amber-200",
      emerald: "from-emerald-50 to-emerald-100/50 border-emerald-200",
      rose: "from-rose-50 to-rose-100/50 border-rose-200"
    };

    return (
      <div className={`bg-gradient-to-br ${colors[color]} rounded-2xl border p-4 sm:p-5`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#2B2C2B] shadow-lg flex items-center justify-center">
            <Icon className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-bold text-[#2B2C2B] text-lg">{title}</h3>
        </div>
        {children}
      </div>
    );
  };

  // Outside Main - fixed to accept props
const VitalsSection = ({ vitals }: { vitals: Vital[] | undefined }) => {
  if (!vitals || vitals.length === 0) return null;
  
  const vital = vitals[0];
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <StatCard
        key="temp"
        label="Temperature"
        value={vital.temperature}
        unit="°C"
        icon={Thermometer}
      />
      <StatCard
        key="pulse"
        label="Pulse"
        value={vital.pulse}
        unit="bpm"
        icon={Heart}
      />
      <StatCard
        key="bp"
        label="Blood Pressure"
        value={vital.bloodPressure}
        icon={Activity}
      />
      <StatCard
        key="oxy"
        label="Oxygen Sat"
        value={vital.oxygenSaturation || "--"}
        unit="%"
        icon={CheckCircle}
      />
    </div>
  );
};


export default function Main() {
  const { showToast } = useToast();

  // Doctor ID (should come from auth context/localStorage)
  const [doctorID, setDoctorID] = useState<string>("1");

  // Data states
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [selectedQueueItem, setSelectedQueueItem] = useState<QueueItem | null>(null);
  const [visitDetails, setVisitDetails] = useState<{ patientVisit: PatientVisit; vitals: Vital[] } | null>(null);
  const [patientHistory, setPatientHistory] = useState<HistoryItem[]>([]);

  // Dropdown data states
  const [premorbidList, setPremorbidList] = useState<PremorbidItem[]>([]);
  const [investigationList, setInvestigationList] = useState<InvestigationItem[]>([]);
  const [diagnosisList, setDiagnosisList] = useState<DiagnosisItem[]>([]);
  const [medicineList, setMedicineList] = useState<MedicineItem[]>([]);

  // View states - only one can be active
  const [activeView, setActiveView] = useState<"details" | "history" | "consultation">("details");

  // Queue panel collapsed state
  const [isQueueCollapsed, setIsQueueCollapsed] = useState(false);

  // Loading states
  const [isLoadingQueue, setIsLoadingQueue] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(false);

  // Consultation form state
  const [premorbids, setPremorbids] = useState<TagItem[]>([]);
  const [complaint, setComplaint] = useState<string>("");
  const [investigations, setInvestigations] = useState<TagItem[]>([]);
  const [diagnosis, setDiagnosis] = useState<TagItem[]>([]);
  const [nextVisitDate, setNextVisitDate] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<StatusOption | null>(null);
  const [medicines, setMedicines] = useState<MedicineEntry[]>([]);

  // Manual entry inputs
  const [diagnosisInput, setDiagnosisInput] = useState("");
  const [premorbidInput, setPremorbidInput] = useState("");
  const [investigationInput, setInvestigationInput] = useState("");
  const [medicineInput, setMedicineInput] = useState("");

  // Add with other dropdown states
const [dosageList, setDosageList] = useState<{dosageInstruction: string; dosageInstructionID: number}[]>([]);

// Add with other loading states
const [isLoadingDosage, setIsLoadingDosage] = useState(false);

  // Status options
  const statusOptions: StatusOption[] = [
    { id: "Waiting", name: "Waiting", label: "Waiting", metadata: { status: "Waiting" } },
    { id: "InProgress", name: "In Progress", label: "In Progress", metadata: { status: "InProgress" } },
    { id: "Done", name: "Done", label: "Done", metadata: { status: "Done" } },
  ];

  // Convert API data to dropdown options
  const premorbidOptions: DropdownOption[] = premorbidList.map(p => ({
    id: p.premorbidID,
    name: p.premorbid,
    label: p.premorbid,
    metadata: { value: p.premorbid }
  }));

  const investigationOptions: DropdownOption[] = investigationList.map(i => ({
    id: i.testID,
    name: i.testName,
    label: i.testName,
    metadata: { value: i.testName }
  }));

  const diagnosisOptions: DropdownOption[] = diagnosisList.map(d => ({
    id: d.diagnosisID,
    name: d.diagnosis,
    label: d.diagnosis,
    metadata: { value: d.diagnosis }
  }));

  const medicineOptions: DropdownOption[] = medicineList.map(m => ({
    id: m.medicineID,
    name: m.medicine,
    label: m.medicine,
    metadata: { value: m.medicine }
  }));

  // Load all dropdown data
  const loadDropdownData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setIsLoadingDropdowns(true);
    try {
      const [premorbidsRes, investigationsRes, diagnosisRes, medicinesRes] = await Promise.all([
        premorbidListApi(token),
        investigationListApi(token),
        diagnosisListApi(token),
        medicineListApi(token)
      ]);

      if (premorbidsRes?.data) setPremorbidList(premorbidsRes.data);
      if (investigationsRes?.data) setInvestigationList(investigationsRes.data);
      if (diagnosisRes?.data) setDiagnosisList(diagnosisRes.data);
      if (medicinesRes?.data) setMedicineList(medicinesRes.data);
    } catch (error) {
      console.error("Error loading dropdown data:", error);
    } finally {
      setIsLoadingDropdowns(false);
    }
  }, []);

const loadDosageList = useCallback(async () => {
  const token = localStorage.getItem("token");
  if (!token) return;

  setIsLoadingDosage(true);
  try {
    const res = await dosageListApi(token);
    if (res?.data) setDosageList(res.data);
  } catch (error) {
    console.error("Error loading dosage list:", error);
  } finally {
    setIsLoadingDosage(false);
  }
}, []);

  // Load queue on mount
  useEffect(() => {
  loadQueue();
  loadDropdownData();
  loadDosageList(); // Add this line
}, [doctorID, loadDropdownData, loadDosageList]);

const dosageOptions: DropdownOption[] = dosageList.map(d => ({
  id: d.dosageInstructionID,
  name: d.dosageInstruction,
  label: d.dosageInstruction,
  metadata: { value: d.dosageInstruction }
}));

  const loadQueue = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("error", "Authentication token missing");
      return;
    }

    setIsLoadingQueue(true);

    const doctorIDa = localStorage.getItem("doctorID")
    try {
      const res = await PatientQueueListApi(doctorIDa as any, token);

      if (!res || !Array.isArray(res)) {
        showToast("error", "Failed to load queue");
        setQueue([]);
        return;
      }

      setQueue(res);
    } catch (error: any) {
      console.error("Error loading queue:", error);
      showToast("error", error?.message || "Failed to load queue");
      setQueue([]);
    } finally {
      setIsLoadingQueue(false);
    }
  };

  const loadVisitDetails = async (visitID: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("error", "Authentication token missing");
      return;
    }

    setIsLoadingDetails(true);
    try {
      const res = await PatientVisitDetailsListApi(visitID as any, token);

      if (res && res.patientVisit && res.patientVisit.visitID === visitID) {
        setVisitDetails(res);
      } else {
        const found = Array.isArray(res) ? res.find((r: any) => r.patientVisit?.visitID === visitID) : null;
        if (found) {
          setVisitDetails(found);
        } else {
          showToast("error", "Visit details not found");
        }
      }
    } catch (error: any) {
      console.error("Error loading visit details:", error);
      showToast("error", error?.message || "Failed to load visit details");
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const loadPatientHistory = async (mrNo: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("error", "Authentication token missing");
      return;
    }

    setIsLoadingHistory(true);
    try {
      const res = await PatientHistoryListApi(mrNo, token);

      if (!res || !Array.isArray(res)) {
        showToast("error", "Failed to load patient history");
        setPatientHistory([]);
        return;
      }

      setPatientHistory(res);
    } catch (error: any) {
      console.error("Error loading history:", error);
      showToast("error", error?.message || "Failed to load patient history");
      setPatientHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSelectPatient = (item: QueueItem) => {
    setSelectedQueueItem(item);
    setComplaint(item.complaint || "");
    loadVisitDetails(item.visitID);
    setActiveView("details");
    resetConsultationForm();
  };

  const handleViewChange = (view: "details" | "history" | "consultation") => {
    if (view === "history" && selectedQueueItem) {
      loadPatientHistory(selectedQueueItem.mrNo);
    }
    if (view === "consultation") {
      if (!selectedQueueItem) {
        showToast("error", "Please select a patient first");
        return;
      }
      if (visitDetails?.patientVisit) {
        if (visitDetails.patientVisit.premorbids) {
          const premorbidItems = visitDetails.patientVisit.premorbids.split(',').map((p, idx) => ({
            id: `existing-${idx}`,
            label: p.trim(),
            value: p.trim()
          }));
          setPremorbids(premorbidItems);
        }
        if (visitDetails.patientVisit.diagnosis) {
          const diagnosisItems = visitDetails.patientVisit.diagnosis.split(',').map((d, idx) => ({
            id: `existing-${idx}`,
            label: d.trim(),
            value: d.trim()
          }));
          setDiagnosis(diagnosisItems);
        }
        if (visitDetails.patientVisit.investigations) {
          const investigationItems = visitDetails.patientVisit.investigations.split(',').map((i, idx) => ({
            id: `existing-${idx}`,
            label: i.trim(),
            value: i.trim()
          }));
          setInvestigations(investigationItems);
        }
        setComplaint(visitDetails.patientVisit.complaint || "");
        setNextVisitDate(visitDetails.patientVisit.nextVisitDate || "");
      }
    }
    setActiveView(view);
  };

  // Add from dropdown
  const handleAddPremorbid = (option: DropdownOption | null) => {
    if (!option) return;
 const newItem: TagItem = {
  id: option.id,
  label: option.label,
  value: getOptionValue(option)
};
    if (!premorbids.find(p => p.value === newItem.value)) {
      setPremorbids([...premorbids, newItem]);
    }
  };

  const handleAddDiagnosis = (option: DropdownOption | null) => {
    if (!option) return;
   const newItem: TagItem = {
  id: option.id,
  label: option.label,
  value: (option.metadata as { value?: string })?.value || option.label
};
    if (!diagnosis.find(d => d.value === newItem.value)) {
      setDiagnosis([...diagnosis, newItem]);
    }
  };

  const handleAddInvestigation = (option: DropdownOption | null) => {
    if (!option) return;
    const newItem: TagItem = {
  id: option.id,
  label: option.label,
  value: getOptionValue(option)
};
    if (!investigations.find(i => i.value === newItem.value)) {
      setInvestigations([...investigations, newItem]);
    }
  };

  // Add from manual input
  const handleAddCustomDiagnosis = () => {
    if (!diagnosisInput.trim()) return;
    const newItem: TagItem = {
      id: `custom-${Date.now()}`,
      label: diagnosisInput.trim(),
      value: diagnosisInput.trim()
    };
    if (!diagnosis.find(d => d.value === newItem.value)) {
      setDiagnosis([...diagnosis, newItem]);
      setDiagnosisInput("");
    }
  };

  const handleAddCustomPremorbid = () => {
    if (!premorbidInput.trim()) return;
    const newItem: TagItem = {
      id: `custom-${Date.now()}`,
      label: premorbidInput.trim(),
      value: premorbidInput.trim()
    };
    if (!premorbids.find(p => p.value === newItem.value)) {
      setPremorbids([...premorbids, newItem]);
      setPremorbidInput("");
    }
  };

  const handleAddCustomInvestigation = () => {
    if (!investigationInput.trim()) return;
    const newItem: TagItem = {
      id: `custom-${Date.now()}`,
      label: investigationInput.trim(),
      value: investigationInput.trim()
    };
    if (!investigations.find(i => i.value === newItem.value)) {
      setInvestigations([...investigations, newItem]);
      setInvestigationInput("");
    }
  };

  // Remove items
  const handleRemovePremorbid = (id: string | number) => {
    setPremorbids(premorbids.filter(p => p.id !== id));
  };

  const handleRemoveDiagnosis = (id: string | number) => {
    setDiagnosis(diagnosis.filter(d => d.id !== id));
  };

  const handleRemoveInvestigation = (id: string | number) => {
    setInvestigations(investigations.filter(i => i.id !== id));
  };

  // Medicines
  const handleAddMedicine = () => {
    if (!medicineInput.trim()) return;
    setMedicines([...medicines, {
      medicineName: medicineInput.trim(),
      dosage: "",
      frequency: "",
      duration: "",
      route: "",
      instructions: ""
    }]);
    setMedicineInput("");
  };

  const handleRemoveMedicine = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index: number, field: keyof MedicineEntry, value: string) => {
    setMedicines(medicines.map((med, i) => i === index ? { ...med, [field]: value } : med));
  };

  const handleSaveConsultation = async () => {
    if (!selectedQueueItem) return;

    const token = localStorage.getItem("token");
    if (!token) {
      showToast("error", "Authentication token missing");
      return;
    }

    if (!selectedStatus) {
      showToast("error", "Please select a status");
      return;
    }

    const validMedicines = medicines
      .filter(m => m.medicineName.trim())
      .map(m => ({ ...m, route: "" }));

    const premorbidsString = premorbids.map(p => p.value).join(", ");
    const diagnosisString = diagnosis.map(d => d.value).join(", ");
    const investigationsString = investigations.map(i => i.value).join(", ");

    setIsSaving(true);
    try {
      await ConsultationAddApi({
        visitID: selectedQueueItem.visitID,
        premorbids: premorbidsString,
        complaint,
        investigations: investigationsString,
        diagnosis: diagnosisString,
        nextVisitDate,
        status: selectedStatus.metadata?.status || "Waiting",
        medicines: validMedicines
      }, token);

      showToast("success", "Consultation saved successfully");
      loadQueue();
      setActiveView("details");
      resetConsultationForm();
    } catch (error: any) {
      console.error("Error saving consultation:", error);
      showToast("error", error?.message || "Failed to save consultation");
    } finally {
      setIsSaving(false);
    }
  };

  const resetConsultationForm = () => {
    setPremorbids([]);
    setComplaint("");
    setInvestigations([]);
    setDiagnosis([]);
    setNextVisitDate("");
    setSelectedStatus(null);
    setMedicines([]);
    setDiagnosisInput("");
    setPremorbidInput("");
    setInvestigationInput("");
    setMedicineInput("");
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  // Tag/Chip Component
 

  // Stat Card Component
  

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* Header */}
      <header className="bg-[#2B2C2B] text-white px-4 sm:px-6 py-4 flex-shrink-0 sticky top-0 z-30 shadow-xl">
        <div className="flex items-center justify-between max-w-[1600px] mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Doctor Dashboard</h1>
              <p className="text-sm text-white/60 flex items-center gap-2">
                <Waves className="w-3 h-3" />
                Patient Queue & Consultation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20">
              <Clock className="w-4 h-4 text-white/80" />
              <span className="text-sm font-semibold text-white">{queue.length} in Queue</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
              <User className="w-5 h-5 text-white/80" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden max-w-[1600px] mx-auto w-full">

        {/* LEFT PANEL - Main Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {!selectedQueueItem ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <div className="w-24 h-24 rounded-3xl bg-[#2B2C2B]/5 flex items-center justify-center mb-6 border-2 border-dashed border-[#2B2C2B]/20">
                <User className="w-12 h-12 text-[#2B2C2B]/30" />
              </div>
              <p className="text-xl font-medium text-[#2B2C2B]/60">Select a patient from the queue</p>
              <p className="text-sm text-gray-400 mt-2">Choose a patient to view details and start consultation</p>
            </div>
          ) : (
            <div className="space-y-6 max-w-5xl">
              {/* Patient Hero Card */}
              <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#2B2C2B]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-3xl bg-[#2B2C2B] shadow-xl flex items-center justify-center">
                      <User className="w-10 h-10 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-[#2B2C2B]">{selectedQueueItem.patientName}</h2>
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        <span className="px-3 py-1 rounded-full bg-[#2B2C2B] text-white text-sm font-medium font-mono">
                          MR: {selectedQueueItem.mrNo}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-gray-100 text-[#2B2C2B] text-sm font-medium border border-gray-200">
                          Visit #{selectedQueueItem.visitNo}
                        </span>
                        <span className="text-gray-500 text-sm flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDateTime(selectedQueueItem.visitDate).time}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tab Navigation */}
                  <div className="flex gap-2 bg-gray-100 p-1.5 rounded-2xl">
                    <button
                      onClick={() => handleViewChange("details")}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeView === "details"
                          ? "bg-[#2B2C2B] text-white shadow-lg"
                          : "text-gray-600 hover:text-[#2B2C2B]"
                        }`}
                      type="button"
                    >
                      <FileText className="w-4 h-4" />
                      Details
                    </button>
                    <button
                      onClick={() => handleViewChange("history")}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeView === "history"
                          ? "bg-[#2B2C2B] text-white shadow-lg"
                          : "text-gray-600 hover:text-[#2B2C2B]"
                        }`}
                      type="button"
                    >
                      <History className="w-4 h-4" />
                      History
                    </button>
                    <button
                      onClick={() => handleViewChange("consultation")}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeView === "consultation"
                          ? "bg-[#2B2C2B] text-white shadow-lg"
                          : "bg-white text-[#2B2C2B] hover:bg-gray-50 border border-gray-200"
                        }`}
                      type="button"
                    >
                      <Stethoscope className="w-4 h-4" />
                      Consult
                    </button>
                  </div>
                </div>
              </div>

              {/* DETAILS VIEW */}
              {activeView === "details" && (
                <div className="space-y-6">
                  {/* Vitals Grid - Fixed with stable keys */}
                  <VitalsSection vitals={visitDetails?.vitals} />

                  {/* Visit Info Sections */}
                  <SimpleSection title="Chief Complaint" icon={ClipboardList} color="amber">
                    <p className="text-[#2B2C2B] leading-relaxed bg-amber-50/50 rounded-xl p-4 border border-amber-100">
                      {visitDetails?.patientVisit?.complaint || "No complaint recorded"}
                    </p>
                  </SimpleSection>

                  <SimpleSection title="Diagnosis" icon={Stethoscope} color="gray">
                    <p className="text-[#2B2C2B] leading-relaxed bg-gray-50 rounded-xl p-4 border border-gray-200">
                      {visitDetails?.patientVisit?.diagnosis || "No diagnosis recorded"}
                    </p>
                  </SimpleSection>

                  <SimpleSection title="Premorbid Conditions" icon={History} color="gray">
                    <p className="text-[#2B2C2B] leading-relaxed bg-gray-50 rounded-xl p-4 border border-gray-200">
                      {visitDetails?.patientVisit?.premorbids || "No premorbid conditions recorded"}
                    </p>
                  </SimpleSection>
                </div>
              )}

              {/* HISTORY VIEW */}
              {activeView === "history" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-[#2B2C2B] flex items-center gap-2">
                      <History className="w-5 h-5" />
                      Patient History
                    </h3>
                  </div>

                  {isLoadingHistory ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-[#2B2C2B]" />
                    </div>
                  ) : patientHistory.length > 0 ? (
                    patientHistory.map((history, idx) => (
                      <div key={`history-${history.visitID}`} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow hover:border-[#2B2C2B]/20">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-[#2B2C2B] flex items-center justify-center">
                              <Calendar className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <p className="font-bold text-[#2B2C2B]">{formatDateTime(history.visitDate).date}</p>
                              <p className="text-sm text-gray-500">Visit #{history.visitID}</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                            <span className="text-xs font-semibold text-[#2B2C2B] uppercase">Complaint</span>
                            <p className="text-[#2B2C2B] mt-1">{history.complaint}</p>
                          </div>

                          {history.diagnosis && (
                            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                              <span className="text-xs font-semibold text-[#2B2C2B] uppercase">Diagnosis</span>
                              <p className="text-[#2B2C2B] mt-1">
                                {typeof history.diagnosis === 'string' ? history.diagnosis : JSON.stringify(history.diagnosis)}
                              </p>
                            </div>
                          )}

                          {history.medicines && history.medicines.length > 0 && (
                            <div className="mt-4">
                              <span className="text-xs font-semibold text-[#2B2C2B] uppercase flex items-center gap-1 mb-2">
                                <Pill className="w-3 h-3" /> Prescribed Medicines
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {history.medicines.map((med, midx) => (
                                  <span key={`med-${midx}`} className="px-3 py-1.5 bg-[#2B2C2B] text-white rounded-lg text-sm shadow-sm">
                                    {med.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                      <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No previous history found</p>
                    </div>
                  )}
                </div>
              )}

              {/* CONSULTATION FORM */}
              {activeView === "consultation" && (
                <div className="space-y-6">
                  <div className="bg-[#2B2C2B] rounded-2xl p-6 text-white shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20">
                        <Stethoscope className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">New Consultation</h3>
                        <p className="text-white/60 text-sm">Record diagnosis, medicines and investigations</p>
                      </div>
                    </div>
                  </div>

                  {/* Chief Complaint */}
                  <SimpleSection title="Chief Complaint" icon={ClipboardList} color="amber">
                    <textarea
                      value={complaint}
                      onChange={(e) => setComplaint(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:bg-white focus:ring-2 focus:ring-[#2B2C2B] outline-none resize-none text-[#2B2C2B]"
                      placeholder="Describe patient's complaint..."
                    />
                  </SimpleSection>

                  {/* Diagnosis */}
                  <SimpleSection title="Diagnosis" icon={Stethoscope} color="gray">
                    <div className="space-y-3">
                      {diagnosis.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {diagnosis.map((item) => (
                            <TagChip
                              key={item.id}
                              item={item}
                              onRemove={() => handleRemoveDiagnosis(item.id)}
                            />
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <SearchableDropdown
                            options={diagnosisOptions}
                            value={null}
                            onChange={handleAddDiagnosis}
                            placeholder="Select from list..."
                            emptyMessage={isLoadingDropdowns ? "Loading..." : "No matches found"}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={diagnosisInput}
                          onChange={(e) => setDiagnosisInput(e.target.value)}
                          placeholder="Or type custom diagnosis..."
                          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-[#2B2C2B] outline-none text-[#2B2C2B]"
                        />
                        <button
                          onClick={handleAddCustomDiagnosis}
                          disabled={!diagnosisInput.trim()}
                          className="px-4 py-3 bg-[#2B2C2B] text-white rounded-xl font-medium hover:bg-[#3a3b3a] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                          type="button"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </SimpleSection>

                  {/* Premorbid Conditions */}
                  <SimpleSection title="Premorbid Conditions" icon={History} color="gray">
                    <div className="space-y-3">
                      {premorbids.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {premorbids.map((item) => (
                            <TagChip
                              key={item.id}
                              item={item}
                              onRemove={() => handleRemovePremorbid(item.id)}
                            />
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <SearchableDropdown
                            options={premorbidOptions}
                            value={null}
                            onChange={handleAddPremorbid}
                            placeholder="Select from list..."
                            emptyMessage={isLoadingDropdowns ? "Loading..." : "No matches found"}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={premorbidInput}
                          onChange={(e) => setPremorbidInput(e.target.value)}
                          placeholder="Or type custom condition..."
                          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-[#2B2C2B] outline-none text-[#2B2C2B]"
                        />
                        <button
                          onClick={handleAddCustomPremorbid}
                          disabled={!premorbidInput.trim()}
                          className="px-4 py-3 bg-[#2B2C2B] text-white rounded-xl font-medium hover:bg-[#3a3b3a] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                          type="button"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </SimpleSection>

                  {/* Investigations */}
                  <SimpleSection title="Investigations" icon={FlaskConical} color="emerald">
                    <div className="space-y-3">
                      {investigations.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {investigations.map((item) => (
                            <TagChip
                              key={item.id}
                              item={item}
                              onRemove={() => handleRemoveInvestigation(item.id)}
                            />
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <SearchableDropdown
                            options={investigationOptions}
                            value={null}
                            onChange={handleAddInvestigation}
                            placeholder="Select from list..."
                            emptyMessage={isLoadingDropdowns ? "Loading..." : "No matches found"}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={investigationInput}
                          onChange={(e) => setInvestigationInput(e.target.value)}
                          placeholder="Or type custom investigation..."
                          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-[#2B2C2B] outline-none text-[#2B2C2B]"
                        />
                        <button
                          onClick={handleAddCustomInvestigation}
                          disabled={!investigationInput.trim()}
                          className="px-4 py-3 bg-[#2B2C2B] text-white rounded-xl font-medium hover:bg-[#3a3b3a] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                          type="button"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </SimpleSection>

                  {/* Medicines */}
                 {/* Medicines */}
<SimpleSection title="Prescribed Medicines" icon={Pill} color="rose">
  <div className="space-y-4">
    {medicines.length === 0 ? (
      <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
        <Pill className="w-10 h-10 text-gray-300 mx-auto mb-2" />
        <p className="text-gray-500 text-sm">No medicines added yet</p>
      </div>
    ) : (
      medicines.map((medicine, index) => (
        <div key={`medicine-${index}`} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-[#2B2C2B] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#2B2C2B] text-white text-xs flex items-center justify-center">
                {index + 1}
              </span>
              {medicine.medicineName}
            </span>
            <button
              onClick={() => handleRemoveMedicine(index)}
              className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
              type="button"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#2B2C2B] uppercase mb-2">Dosage</label>
              <input
                type="text"
                value={medicine.dosage}
                onChange={(e) => handleMedicineChange(index, "dosage", e.target.value)}
                placeholder="e.g., 500mg"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-[#2B2C2B] outline-none text-sm text-[#2B2C2B]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2B2C2B] uppercase mb-2">Frequency</label>
              <input
                type="text"
                value={medicine.frequency}
                onChange={(e) => handleMedicineChange(index, "frequency", e.target.value)}
                placeholder="e.g., 3 times daily"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-[#2B2C2B] outline-none text-sm text-[#2B2C2B]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2B2C2B] uppercase mb-2">Duration</label>
              <input
                type="text"
                value={medicine.duration}
                onChange={(e) => handleMedicineChange(index, "duration", e.target.value)}
                placeholder="e.g., 7 days"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-[#2B2C2B] outline-none text-sm text-[#2B2C2B]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2B2C2B] uppercase mb-2">Instructions</label>
              <div className="space-y-2">
                <SearchableDropdown
                  options={dosageOptions}
                  value={null}
                  onChange={(option) => {
                    if (option) {
                      handleMedicineChange(index, "instructions", option.label);
                    }
                  }}
                  placeholder="Select instruction..."
                  emptyMessage={isLoadingDosage ? "Loading..." : "No matches found"}
                />
                <input
                  type="text"
                  value={medicine.instructions}
                  onChange={(e) => handleMedicineChange(index, "instructions", e.target.value)}
                  placeholder="Or type custom instruction..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-[#2B2C2B] outline-none text-sm text-[#2B2C2B]"
                />
              </div>
            </div>
          </div>
        </div>
      ))
    )}

    <div className="flex gap-2">
      <div className="flex-1">
        <SearchableDropdown
          options={medicineOptions}
          value={null}
          onChange={(option) => {
            if (option) {
              setMedicines([...medicines, {
                medicineName: option.label,
                dosage: "",
                frequency: "",
                duration: "",
                route: "",
                instructions: ""
              }]);
            }
          }}
          placeholder="Select medicine from list..."
          emptyMessage={isLoadingDropdowns ? "Loading..." : "No matches found"}
        />
      </div>
    </div>
    <div className="flex gap-2">
      <input
        type="text"
        value={medicineInput}
        onChange={(e) => setMedicineInput(e.target.value)}
        placeholder="Or type custom medicine name..."
        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-[#2B2C2B] outline-none text-[#2B2C2B]"
      />
      <button
        onClick={handleAddMedicine}
        disabled={!medicineInput.trim()}
        className="px-4 py-3 bg-[#2B2C2B] text-white rounded-xl font-medium hover:bg-[#3a3b3a] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        type="button"
      >
        <Plus className="w-5 h-5" />
      </button>
    </div>
  </div>
</SimpleSection>

                  {/* Next Visit Date */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <label className="block text-sm font-semibold text-[#2B2C2B] mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Next Visit Date
                    </label>
                    <input
                      type="date"
                      value={nextVisitDate}
                      onChange={(e) => setNextVisitDate(e.target.value)}
                      className="px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-[#2B2C2B] outline-none text-[#2B2C2B]"
                    />
                  </div>

                  {/* Consultation Status */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <label className="block text-sm font-semibold text-[#2B2C2B] mb-3">
                      Consultation Status <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-3 flex-wrap">
                      {statusOptions.map((status) => (
                        <button
                          key={status.id}
                          onClick={() => setSelectedStatus(status)}
                          className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${selectedStatus?.id === status.id
                              ? "bg-[#2B2C2B] text-white shadow-lg"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          type="button"
                        >
                          {status.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={() => {
                        resetConsultationForm();
                        handleViewChange("details");
                      }}
                      className="flex-1 px-6 py-4 rounded-2xl text-[#2B2C2B] font-semibold hover:bg-gray-100 transition-colors border border-gray-200"
                      type="button"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveConsultation}
                      disabled={isSaving || !selectedStatus}
                      className={`flex-[2] flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-white font-bold text-lg transition-all ${isSaving || !selectedStatus
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-[#2B2C2B] hover:bg-[#3a3b3a] hover:shadow-xl"
                        }`}
                      type="button"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          Save Consultation
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Collapsible Queue Toggle Button */}
        <button
          onClick={() => setIsQueueCollapsed(!isQueueCollapsed)}
          className={`hidden lg:flex items-center justify-center w-8 h-12 bg-[#2B2C2B] text-white rounded-l-xl transition-all duration-300 hover:bg-[#3a3b3a] z-40 ${isQueueCollapsed ? 'fixed right-0 top-1/2 -translate-y-1/2' : ''}`}
          type="button"
          title={isQueueCollapsed ? "Expand Queue" : "Collapse Queue"}
        >
          {isQueueCollapsed ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>

        {/* RIGHT PANEL - Collapsible Queue */}
        <div className={`bg-[#2B2C2B] flex-shrink-0 flex flex-col shadow-2xl transition-all duration-300 ${isQueueCollapsed ? 'w-0 overflow-hidden opacity-0' : 'w-full lg:w-[300px]'}`}>
          {/* Queue Header */}
          <div className="p-5 border-b border-white/10 bg-[#2B2C2B] flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-white text-lg">Patient Queue</h2>
                  <p className="text-xs text-white/50">{queue.length} patients waiting</p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                <span className="text-sm font-bold text-white">{queue.length}</span>
              </div>
            </div>
          </div>

          {/* Queue List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-[#2B2C2B]">
            {isLoadingQueue ? (
              <div className="flex flex-col items-center justify-center gap-3 py-12">
                <Loader2 className="w-8 h-8 animate-spin text-white/60" />
                <p className="text-sm text-white/50">Loading queue...</p>
              </div>
            ) : queue.length > 0 ? (
              queue.map((item, index) => (
                <button
                  key={item.queueID}
                  onClick={() => handleSelectPatient(item)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 group relative overflow-hidden ${selectedQueueItem?.queueID === item.queueID ? "bg-white border-white shadow-2xl scale-[1.02]" : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"}`}
                  type="button"
                >
                  {selectedQueueItem?.queueID === item.queueID && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#2B2C2B]" />
                  )}

                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs font-bold w-6 h-6 rounded-lg flex items-center justify-center ${selectedQueueItem?.queueID === item.queueID ? "bg-[#2B2C2B] text-white" : "bg-white/10 text-white/70"}`}>
                          {index + 1}
                        </span>
                        <p className={`font-bold truncate ${selectedQueueItem?.queueID === item.queueID ? "text-[#2B2C2B]" : "text-white"}`}>
                          {item.patientName}
                        </p>
                      </div>

                      <div className={`flex items-center gap-2 text-xs mb-2 ${selectedQueueItem?.queueID === item.queueID ? "text-gray-500" : "text-white/50"}`}>
                        <span className="font-mono">MR: {item.mrNo}</span>
                        <span>•</span>
                        <span>Visit #{item.visitNo}</span>
                      </div>

                      <p className={`text-xs truncate ${selectedQueueItem?.queueID === item.queueID ? "text-gray-600" : "text-white/40"}`}>
                        {item.complaint || "No complaint"}
                      </p>
                    </div>

                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${selectedQueueItem?.queueID === item.queueID ? "bg-[#2B2C2B] text-white" : "bg-white/5 text-white/30 group-hover:bg-white/10 group-hover:text-white/50"}`}>
                      <ArrowRight className={`w-4 h-4 transition-transform ${selectedQueueItem?.queueID === item.queueID ? "rotate-0" : "-rotate-45"}`} />
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded-md ${selectedQueueItem?.queueID === item.queueID ? "bg-[#2B2C2B]/10 text-[#2B2C2B]" : "bg-white/5 text-white/40"}`}>
                      Waiting
                    </span>
                    <span className={`text-[10px] ${selectedQueueItem?.queueID === item.queueID ? "text-gray-400" : "text-white/30"}`}>
                      {formatDateTime(item.visitDate).time}
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-12 px-4">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-white/30" />
                </div>
                <p className="text-white/60 font-medium">No patients in queue</p>
                <p className="text-sm text-white/30 mt-1">Queue is empty</p>
              </div>
            )}
          </div>

          {/* Queue Footer */}
          <div className="p-4 border-t border-white/10 bg-[#2B2C2B] flex-shrink-0">
            <div className="flex items-center justify-between text-xs text-white/40">
              <span>Auto-refresh enabled</span>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}