"use client";

import { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import PatientHistoryListApi from "@/lib/api/Doctor/PatientVisitInfo/PatientHistory";
import PatientVisitDetailsListApi from "@/lib/api/Doctor/PatientVisitInfo/PatientVisitDetails";
import {
    Printer,
    Download,
    Eye,
    FileText,
    Calendar,
    User,
    Phone,
    Stethoscope,
    Pill,
    Activity,
    Thermometer,
    Heart,
    Droplets,
    Wind,
    Gauge,
    Weight,
    ChevronDown,
    X,
    Building2,
    Receipt,
    Search
} from "lucide-react";

// ==================== TYPES ====================

interface Vital {
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
}

interface Medicine {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
}

interface Visit {
    visitID: number;
    visitDate: string;
    complaint: string;
    diagnosis: string | object;
    vitals: {
        temp: number;
        pulse: number;
        bp: string;
    }[];
    medicines: Medicine[];
}

interface PatientVisit {
    patientVisit: {
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
    vitals: Vital[];
}


const formatAge = (dob: string | Date) => {
    if (!dob) return "N/A";

    const birthDate = new Date(dob);
    const today = new Date();

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    // Adjust days
    if (days < 0) {
        months--;
        const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        days += prevMonth.getDate();
    }

    // Adjust months
    if (months < 0) {
        years--;
        months += 12;
    }

    // ===== FORMATTING LOGIC =====
    if (years > 0) {
        return `${years} Year${years > 1 ? "s" : ""}`;
    }

    if (months > 0) {
        if (days > 0) {
            return `${months} Month${months > 1 ? "s" : ""} ${days} Day${days > 1 ? "s" : ""}`;
        }
        return `${months} Month${months > 1 ? "s" : ""}`;
    }

    return `${days} Day${days !== 1 ? "s" : ""}`;
};


// ==================== PDF GENERATORS ====================

// Design 1: Classic Clinical Layout (30% left, 70% right)
const generatePrescriptionPDF1 = (visit: PatientVisit, visits: Visit[]) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;

    const primary: [number, number, number] = [0, 102, 153]; // Deep Medical Blue
    const accent: [number, number, number] = [0, 153, 136]; // Teal
    const light: [number, number, number] = [248, 250, 252];
    const textGray: [number, number, number] = [90, 90, 90];

    const patientInfo = visit.patientVisit;
    const currentVisit = visits.find(v => v.visitID === patientInfo.visitID);

    // ===== TOP BRAND STRIP =====
    doc.setFillColor(...primary);
    doc.rect(0, 0, pageWidth, 30, "F");

  



    // ===== PATIENT CARD =====
    doc.setFillColor(...light);
    doc.roundedRect(margin, 35, pageWidth - margin * 2, 32, 4, 4, "F");

    doc.setDrawColor(220);
    doc.roundedRect(margin, 35, pageWidth - margin * 2, 32, 4, 4);

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.text(patientInfo.patientName.toUpperCase(), margin + 6, 46);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textGray);
    doc.text(`${patientInfo.gender}`, margin + 6, 54);
    doc.text(`Phone: ${patientInfo.phone || "N/A"}`, margin + 6, 60);

    const rightX = pageWidth - margin - 5;
    doc.text(`Date: ${formatDate(patientInfo.visitDate)}`, rightX, 46, { align: "right" });
    doc.text(`Visit No: ${patientInfo.visitNo}`, rightX, 54, { align: "right" });
    doc.text(`MR#: ${patientInfo.mrNo}`, rightX, 60, { align: "right" });

    // ===== VITALS STRIP =====
    let yPos = 75;

    doc.setFillColor(235, 245, 255);
    doc.roundedRect(margin, yPos, pageWidth - margin * 2, 12, 3, 3, "F");

    doc.setFontSize(9);
    doc.setTextColor(...primary);
    doc.setFont("helvetica", "bold");
    doc.text("Vitals", margin + 5, yPos + 8);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(0);

    const vital = visit.vitals[0];
    if (vital) {
        let x = margin + 17;
        const arr = [
            `Temp ${vital.temperature}°F`,
            `BP ${vital.bloodPressure}`,
            `Pulse ${vital.pulse}`,
            `SpO2 ${vital.oxygenSaturation}%`,
            `Weight ${vital.weight}`,
            `Height ${vital.height}`
        ];

        arr.forEach(v => {
            doc.text(v, x, yPos + 8);
            x += 22;
        });
    }

    // ===== MAIN LAYOUT =====
    yPos += 30;
    const splitX = pageWidth * 0.35;

    doc.setDrawColor(230);
    doc.line(splitX, yPos - 5, splitX, 280);

    // ===== LEFT SIDE =====
    let leftY = yPos;

    const sectionTitle = (title: string, y: number) => {
        doc.setFillColor(...accent);
        doc.rect(margin, y - 6, 3, 10, "F");

        doc.setFontSize(11);
        doc.setTextColor(...primary);
        doc.setFont("helvetica", "bold");
        doc.text(title, margin + 6, y);
    };

    sectionTitle("Clinical Information", leftY);
    leftY += 12;

    // Complaint
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text("Complaint", margin, leftY);

    leftY += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    const complaintLines = doc.splitTextToSize(patientInfo.complaint || "—", splitX - margin - 10);
    doc.text(complaintLines, margin, leftY);

    leftY += complaintLines.length * 4 + 10;

    // Diagnosis
    doc.setFont("helvetica", "bold");
    doc.text("Diagnosis", margin, leftY);

    leftY += 6;
    doc.setFont("helvetica", "normal");

    const diagnosisArray = patientInfo.diagnosis
        ? String(patientInfo.diagnosis).split(',').map(d => d.trim()).filter(Boolean)
        : [];

    diagnosisArray.length
        ? diagnosisArray.forEach((d, i) => doc.text(`• ${d}`, margin, leftY + i * 5))
        : doc.text("—", margin, leftY);

    leftY += (diagnosisArray.length || 1) * 5 + 10;

    // Investigations
    doc.setFont("helvetica", "bold");
    doc.text("Investigations", margin, leftY);

    leftY += 6;
    doc.setFont("helvetica", "normal");

    const invArray = patientInfo.investigations
        ? String(patientInfo.investigations).split(',').map(i => i.trim()).filter(Boolean)
        : [];

    invArray.length
        ? invArray.forEach((i, idx) => doc.text(`• ${i}`, margin, leftY + idx * 5))
        : doc.text("—", margin, leftY);

    // ===== RIGHT SIDE =====
    let medY = yPos;

    doc.setFontSize(13);
    doc.setTextColor(...primary);
    doc.setFont("helvetica", "bold");
    doc.text("Medications", splitX + 10, medY);

    medY += 12;

    if (currentVisit && currentVisit.medicines.length > 0) {
        currentVisit.medicines.forEach((med) => {

            // Card style medication
            doc.setFillColor(250, 250, 250);
            doc.roundedRect(splitX + 8, medY - 6, pageWidth - splitX - margin - 8, 16, 3, 3, "F");

            // Left accent bar
            doc.setFillColor(...accent);
            doc.rect(splitX + 8, medY - 6, 3, 16, "F");

            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(0);
            doc.text(`${med.name} (${med.dosage}mg)`, splitX + 14, medY);

            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(...textGray);
            doc.text(`Take ${med.frequency} for ${med.duration}`, splitX + 14, medY + 6);

            medY += 20;
        });
    } else {
        doc.setFontSize(9);
        doc.text("No medications prescribed", splitX + 10, medY);
    }



    return doc;
};

// Design 2: Modern Minimalist Layout
// Design 2: Modern Minimalist Layout
const generatePrescriptionPDF2 = (visit: PatientVisit, visits: Visit[]) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;

    const primaryColor: [number, number, number] = [41, 128, 185]; // Blue
    const lightGray: [number, number, number] = [245, 245, 245];
    const darkGray: [number, number, number] = [80, 80, 80];

    const patientInfo = visit.patientVisit;
    const currentVisit = visits.find(v => v.visitID === patientInfo.visitID);

    // ===== HEADER =====
    doc.setFontSize(24);
    doc.setTextColor(...primaryColor);
    doc.setFont("helvetica", "bold");
    doc.text("PRESCRIPTION", margin, 25);

    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(1);
    doc.line(margin, 28, pageWidth - margin, 28);

   // ===== PATIENT BOX =====
doc.setFillColor(...lightGray);
doc.roundedRect(margin, 35, pageWidth - (margin * 2), 24, 3, 3, "F");

doc.setFontSize(10);
doc.setTextColor(...darkGray);

// ===== LEFT SIDE =====

// Patient Name
doc.setFont("helvetica", "normal");
doc.text("Patient Name:", margin + 5, 45);

doc.setFont("helvetica", "bold");
doc.text(`${patientInfo.patientName}`, margin + 30, 45);

// Gender + Age
doc.setFont("helvetica", "normal");
doc.text("Gender / Age:", margin + 5, 52);

doc.setFont("helvetica", "bold");
doc.text(
    `${patientInfo.gender} / ${formatAge(patientInfo.dob)}`,
    margin + 30,
    52
);


// ===== RIGHT SIDE =====
const rightX = pageWidth - margin - 5;

// Date (aligned with Patient Name row)
doc.setFont("helvetica", "bold");
doc.text(`${formatDate(patientInfo.visitDate)}`, rightX, 45, { align: "right" });


// ===== MR# + Visit No (aligned with Gender/Age row) =====
const yLine = 52;

// ===== MR# + Visit No (Visit first, MR after) =====
const gap = 6;

// ===== MR# (RIGHT MOST) =====
doc.setFont("helvetica", "bold");
const mrValue = `${patientInfo.mrNo}`;
doc.text(mrValue, rightX, yLine, { align: "right" });

doc.setFont("helvetica", "normal");
const mrLabel = "MR#:";
const mrLabelWidth = doc.getTextWidth(mrLabel);
const mrValueWidth = doc.getTextWidth(mrValue);

doc.text(
    mrLabel,
    rightX - mrValueWidth - mrLabelWidth - 2,
    yLine
);

// ===== Visit No (LEFT of MR#) =====
const mrBlockStart = rightX - mrValueWidth - mrLabelWidth - gap;

doc.setFont("helvetica", "bold");
const visitValue = `${patientInfo.visitNo}`;
const visitValueWidth = doc.getTextWidth(visitValue);

doc.text(
    visitValue,
    mrBlockStart - visitValueWidth,
    yLine
);

doc.setFont("helvetica", "normal");
const visitLabel = "Visit No:";
const visitLabelWidth = doc.getTextWidth(visitLabel);

doc.text(
    visitLabel,
    mrBlockStart - visitValueWidth - visitLabelWidth - 2,
    yLine
);

    // ===== VITALS =====
    let yPos = 67;

    doc.setFontSize(10);
    doc.setTextColor(...primaryColor);
    doc.setFont("helvetica", "bold");
    doc.text("Vitals", margin, yPos);

    yPos += 8;

    doc.setTextColor(0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    const vital = visit.vitals[0];
    if (vital) {
        let currentX = margin;

        const vitalsArr = [
            `Temp: ${vital.temperature}°F`,
            `BP: ${vital.bloodPressure}`,
            `Pulse: ${vital.pulse}`,
            `SpO2: ${vital.oxygenSaturation}%`,
            `Wt: ${vital.weight}kg`,
            `Ht: ${vital.height}cm`,
        ];

        vitalsArr.forEach(v => {
            doc.text(v, currentX, yPos);
            currentX += 30;
        });
    }

    // ===== DIVIDER =====
    yPos += 10;
    doc.setDrawColor(180);
    doc.line(margin, yPos, pageWidth - margin, yPos);

    // ===== COLUMNS =====
    yPos += 10;
    const splitX = pageWidth * 0.35;

    doc.setDrawColor(220);
    doc.line(splitX, yPos - 5, splitX, 280);

    // ===== LEFT SIDE =====
    let leftY = yPos;

    const drawSectionHeader = (text: string, y: number) => {
        doc.setFillColor(230, 240, 255);
        doc.rect(margin, y - 5, splitX - margin - 5, 8, "F");

        doc.setFontSize(10);
        doc.setTextColor(...primaryColor);
        doc.setFont("helvetica", "bold");
        doc.text(text, margin + 2, y);
    };

    drawSectionHeader("CLINICAL INFORMATION", leftY);
    leftY += 13;

    // Complaint
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text("Complaint", margin, leftY);

    leftY += 6;
    doc.setFont("helvetica", "normal");

    const complaintLines = doc.splitTextToSize(patientInfo.complaint || "—", splitX - margin - 10);
    doc.text(complaintLines, margin, leftY);

    leftY += (complaintLines.length * 4) + 10;

    // Diagnosis
    doc.setFont("helvetica", "bold");
    doc.text("Diagnosis", margin, leftY);

    leftY += 6;
    doc.setFont("helvetica", "normal");

    const diagnosisArray = patientInfo.diagnosis
        ? String(patientInfo.diagnosis).split(',').map(d => d.trim()).filter(d => d)
        : [];

    if (diagnosisArray.length > 0) {
        diagnosisArray.forEach((d, i) => {
            doc.text(`• ${d}`, margin, leftY + (i * 5));
        });
        leftY += diagnosisArray.length * 5;
    } else {
        doc.text("—", margin, leftY);
        leftY += 5;
    }

    leftY += 5;

    // Investigations
    doc.setFont("helvetica", "bold");
    doc.text("Investigations", margin, leftY);

    leftY += 6;
    doc.setFont("helvetica", "normal");

    const investigationsArray = patientInfo.investigations
        ? String(patientInfo.investigations).split(',').map(i => i.trim()).filter(i => i)
        : [];

    if (investigationsArray.length > 0) {
        investigationsArray.forEach((inv, i) => {
            doc.text(`• ${inv}`, margin, leftY + (i * 5));
        });
    } else {
        doc.text("—", margin, leftY);
    }

    // ===== RIGHT SIDE =====
    let medY = yPos;

    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.setFont("helvetica", "bold");
    doc.text("MEDICATIONS", splitX + 10, medY);

    medY += 12;

    if (currentVisit && currentVisit.medicines.length > 0) {
        currentVisit.medicines.forEach((med) => {

            // Medicine Name
            doc.setFontSize(11);
            doc.setTextColor(0);
            doc.setFont("helvetica", "bold");
            doc.text(`${med.name} (${med.dosage})`, splitX + 10, medY);

            // Instructions
            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(...darkGray);
            doc.text(`Take ${med.frequency} for ${med.duration}`, splitX + 10, medY + 6);

            medY += 16;
        });
    } else {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text("No medications prescribed", splitX + 10, medY);
    }

    return doc;
};

// Bill Design: Modern Professional
const generateBillPDF = (visit: PatientVisit, visits: Visit[]) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;

    const patientInfo = visit.patientVisit;

    // Hospital Header
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("CITY GENERAL HOSPITAL", pageWidth / 2, 20, { align: "center" });

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("123 Healthcare Avenue, Medical District", pageWidth / 2, 26, { align: "center" });
    doc.text("Phone: (021) 1234-5678 | Email: info@cityhospital.com", pageWidth / 2, 31, { align: "center" });

    // Line
    doc.setLineWidth(0.5);
    doc.line(margin, 35, pageWidth - margin, 35);

    // Invoice Title
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("PATIENT BILL / INVOICE", margin, 45);

    doc.setFontSize(10);
    doc.text(`Bill #: BILL-${patientInfo.visitID}-${new Date().getFullYear()}`, pageWidth - margin, 45, { align: "right" });
    doc.text(`Date: ${formatDate(new Date().toISOString())}`, pageWidth - margin, 50, { align: "right" });

    // Patient & Visit Info Box
    doc.setFillColor(250, 250, 250);
    doc.rect(margin, 55, pageWidth - (margin * 2), 30, "F");
    doc.setDrawColor(200);
    doc.rect(margin, 55, pageWidth - (margin * 2), 30);

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("BILLED TO:", margin + 5, 63);
    doc.text("VISIT DETAILS:", margin + 100, 63);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Name: ${patientInfo.patientName}`, margin + 5, 70);
    doc.text(`MR Number: ${patientInfo.mrNo}`, margin + 5, 75);
    doc.text(`Contact: ${patientInfo.phone || "N/A"}`, margin + 5, 80);

    doc.text(`Visit ID: ${patientInfo.visitID}`, margin + 100, 70);
    doc.text(`Visit Date: ${formatDate(patientInfo.visitDate)}`, margin + 100, 75);
    doc.text(`Department: ${patientInfo.department}`, margin + 100, 80);
    doc.text(`Doctor: ${patientInfo.doctorUser}`, margin + 100, 85);

    // Charges Table
    const tableY = 95;

    const charges = [
        ["Consultation Fee", "Dr. " + patientInfo.doctorUser, "1", "500.00", "500.00"],
        ["Registration Fee", "Patient Registration", "1", "200.00", "200.00"],
        ["Vital Check", "Nursing Services", "1", "100.00", "100.00"],
    ];

    if (patientInfo.investigations) {
        charges.push(["Investigations", patientInfo.investigations, "—", "—", "As per lab"]);
    }

    autoTable(doc, {
        startY: tableY,
        margin: { left: margin, right: margin },
        head: [["Description", "Details", "Qty", "Unit Price", "Amount"]],
        body: charges,
        theme: "grid",
        headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontSize: 9 },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
            0: { cellWidth: 50 },
            1: { cellWidth: 60 },
            2: { cellWidth: 20, halign: "center" },
            3: { cellWidth: 30, halign: "right" },
            4: { cellWidth: 30, halign: "right" }
        }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 5;

    // Totals
    const totalsX = pageWidth - margin - 80;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Subtotal:", totalsX, finalY);
    doc.text("800.00", pageWidth - margin, finalY, { align: "right" });

    doc.text("Tax (0%):", totalsX, finalY + 5);
    doc.text("0.00", pageWidth - margin, finalY + 5, { align: "right" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("TOTAL:", totalsX, finalY + 12);
    doc.text("Rs. 800.00", pageWidth - margin, finalY + 12, { align: "right" });

    // Payment Status
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, finalY + 20, pageWidth - (margin * 2), 12, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Payment Status: UNPAID", margin + 5, finalY + 28);
    doc.text("Payment Method: Cash/Card", pageWidth - margin, finalY + 28, { align: "right" });

    // Footer
    const footerY = pageHeight - 20;
    doc.setLineWidth(0.3);
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("This is a computer generated bill and does not require signature.", margin, footerY);
    doc.text("For queries, please contact our billing department.", margin, footerY + 4);

    return doc;
};

// ==================== HELPERS ====================

const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
};

// ==================== MAIN COMPONENT ====================

export default function PatientPrescriptionSystem() {
    const [activeTab, setActiveTab] = useState<"list" | "detail">("list");
    const [selectedVisit, setSelectedVisit] = useState<PatientVisit | null>(null);
    const [visits, setVisits] = useState<Visit[]>([]);
    const [loading, setLoading] = useState(false);
    const [viewModal, setViewModal] = useState(false);
    const [viewType, setViewType] = useState<"prescription1" | "prescription2" | "bill">("prescription1");
    const [mrNo, setMrNo] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [token, setToken] = useState("");

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
            setToken(storedToken);
        }
    }, []);

    const loadPatientHistory = async (mrNumber: string, authToken: string) => {
        setLoading(true);
        try {
            const data = await PatientHistoryListApi(mrNumber, authToken);
            setVisits(data);
        } catch (error) {
            console.error("Error loading history:", error);
            setVisits([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchInput.trim()) return;

        const storedToken = localStorage.getItem("token");
        if (!storedToken) {
            alert("Please login first");
            return;
        }

        setMrNo(searchInput.trim());
        setToken(storedToken);
        await loadPatientHistory(searchInput.trim(), storedToken);
    };

    const handleVisitClick = async (visitID: number) => {
        setLoading(true);
        try {
            const data = await PatientVisitDetailsListApi(visitID.toString(), token);
            setSelectedVisit(data);
            setActiveTab("detail");
        } catch (error) {
            console.error("Error loading visit details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = (type: "prescription1" | "prescription2" | "bill") => {
        if (!selectedVisit) return;

        let doc;
        if (type === "prescription1") {
            doc = generatePrescriptionPDF1(selectedVisit, visits);
        } else if (type === "prescription2") {
            doc = generatePrescriptionPDF2(selectedVisit, visits);
        } else {
            doc = generateBillPDF(selectedVisit, visits);
        }

        doc.autoPrint();
        window.open(doc.output("bloburl"), "_blank");
    };

    const handleDownload = (type: "prescription1" | "prescription2" | "bill") => {
        if (!selectedVisit) return;

        let doc;
        let filename;
        if (type === "prescription1") {
            doc = generatePrescriptionPDF1(selectedVisit, visits);
            filename = `Prescription_Classic_${selectedVisit.patientVisit.mrNo}.pdf`;
        } else if (type === "prescription2") {
            doc = generatePrescriptionPDF2(selectedVisit, visits);
            filename = `Prescription_Modern_${selectedVisit.patientVisit.mrNo}.pdf`;
        } else {
            doc = generateBillPDF(selectedVisit, visits);
            filename = `Bill_${selectedVisit.patientVisit.mrNo}.pdf`;
        }

        doc.save(filename);
    };

    const openViewModal = (type: "prescription1" | "prescription2" | "bill") => {
        setViewType(type);
        setViewModal(true);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Stethoscope className="w-8 h-8 text-black" />
                        Patient Prescription System
                    </h1>
                    <p className="text-gray-500 mt-1">Manage patient visits, prescriptions, and billing</p>
                </div>

                {/* Navigation Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab("list")}
                        className={`px-6 py-3 rounded-xl font-medium transition-all ${activeTab === "list"
                            ? "bg-black text-white shadow-lg"
                            : "bg-white text-gray-700 hover:bg-gray-100 border"
                            }`}
                    >
                        Visit History
                    </button>
                    <button
                        onClick={() => setActiveTab("detail")}
                        disabled={!selectedVisit}
                        className={`px-6 py-3 rounded-xl font-medium transition-all ${activeTab === "detail"
                            ? "bg-black text-white shadow-lg"
                            : "bg-white text-gray-700 hover:bg-gray-100 border disabled:opacity-50 disabled:cursor-not-allowed"
                            }`}
                    >
                        Visit Details
                    </button>
                </div>

                {/* Visit List Tab */}
                {activeTab === "list" && (
                    <div className="bg-white rounded-2xl shadow-xl border overflow-hidden">
                        {/* Search Header */}
                        <div className="bg-gray-900 text-white px-6 py-6">
                            <h2 className="text-xl font-semibold mb-4">Patient Visit History</h2>

                            {/* Search Box */}
                            <div className="flex gap-3 max-w-md">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        placeholder="Enter MR Number..."
                                        className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                                    />
                                    {searchInput && (
                                        <button
                                            onClick={() => {
                                                setSearchInput("");
                                                setMrNo("");
                                                setVisits([]);
                                            }}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                <button
                                    onClick={handleSearch}
                                    disabled={!searchInput.trim() || loading}
                                    className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                            Loading...
                                        </>
                                    ) : (
                                        <>
                                            <Search className="w-4 h-4" />
                                            Search
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Current MR Display */}
                            {mrNo && (
                                <div className="mt-4 flex items-center gap-2 text-sm text-gray-300">
                                    <span>Showing results for:</span>
                                    <span className="px-3 py-1 bg-white/10 rounded-full font-medium text-white">MR No: {mrNo}</span>
                                    <span className="text-gray-400">({visits.length} visits)</span>
                                </div>
                            )}
                        </div>

                        <div className="p-6">
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
                                </div>
                            ) : visits.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                    <p>No visits found for this patient</p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {visits.map((visit, index) => (
                                        <div
                                            key={visit.visitID}
                                            onClick={() => handleVisitClick(visit.visitID)}
                                            className="group bg-gray-50 rounded-xl p-5 border-2 border-transparent hover:border-black hover:shadow-lg transition-all cursor-pointer"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center font-bold text-lg">
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900 group-hover:text-black transition-colors">
                                                            Visit #{visit.visitID}
                                                        </h3>
                                                        <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                                            <Calendar className="w-4 h-4" />
                                                            {formatDate(visit.visitDate)}
                                                        </p>
                                                        <p className="text-sm text-gray-600 mt-2 line-clamp-1">
                                                            <span className="font-medium">Complaint:</span> {visit.complaint}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                                                        {visit.medicines.length} Medicines
                                                    </span>
                                                    <ChevronDown className="w-5 h-5 text-gray-400 mt-2 ml-auto group-hover:translate-x-1 transition-transform" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Visit Detail Tab */}
                {activeTab === "detail" && selectedVisit && (
                    <div className="space-y-6">
                        {/* Patient Info Card */}
                        <div className="bg-white rounded-2xl shadow-xl border overflow-hidden">
                            <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-6 py-5">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
                                            <User className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold">{selectedVisit.patientVisit.patientName}</h2>
                                            <p className="text-gray-300 flex items-center gap-4 mt-1">
                                                <span>MR: {selectedVisit.patientVisit.mrNo}</span>
                                                <span>•</span>
                                                <span>{calculateAge(selectedVisit.patientVisit.dob)} years</span>
                                                <span>•</span>
                                                <span>{selectedVisit.patientVisit.gender}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => openViewModal("prescription1")}
                                            className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors"
                                        >
                                            <Eye className="w-4 h-4" />
                                            View Classic Rx
                                        </button>
                                        <button
                                            onClick={() => openViewModal("prescription2")}
                                            className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors border border-white/30"
                                        >
                                            <Eye className="w-4 h-4" />
                                            View Modern Rx
                                        </button>
                                        <button
                                            onClick={() => openViewModal("bill")}
                                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                                        >
                                            <Receipt className="w-4 h-4" />
                                            View Bill
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Contact</p>
                                        <p className="text-sm font-medium flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-gray-400" />
                                            {selectedVisit.patientVisit.phone || "N/A"}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Doctor</p>
                                        <p className="text-sm font-medium flex items-center gap-2">
                                            <Stethoscope className="w-4 h-4 text-gray-400" />
                                            {selectedVisit.patientVisit.doctorUser}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Department</p>
                                        <p className="text-sm font-medium flex items-center gap-2">
                                            <Building2 className="w-4 h-4 text-gray-400" />
                                            {selectedVisit.patientVisit.department}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Visit Date</p>
                                        <p className="text-sm font-medium flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            {formatDate(selectedVisit.patientVisit.visitDate)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Vitals & Clinical Info */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Vitals */}
                            <div className="bg-white rounded-2xl shadow-xl border p-6">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-red-500" />
                                    Vital Signs
                                </h3>
                                {selectedVisit.vitals.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-red-50 rounded-xl p-4 text-center">
                                            <Thermometer className="w-6 h-6 text-red-500 mx-auto mb-2" />
                                            <p className="text-2xl font-bold text-gray-900">{selectedVisit.vitals[0].temperature}°F</p>
                                            <p className="text-xs text-gray-500">Temperature</p>
                                        </div>
                                        <div className="bg-pink-50 rounded-xl p-4 text-center">
                                            <Heart className="w-6 h-6 text-pink-500 mx-auto mb-2" />
                                            <p className="text-2xl font-bold text-gray-900">{selectedVisit.vitals[0].pulse}</p>
                                            <p className="text-xs text-gray-500">Pulse (bpm)</p>
                                        </div>
                                        <div className="bg-blue-50 rounded-xl p-4 text-center">
                                            <Gauge className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                                            <p className="text-xl font-bold text-gray-900">{selectedVisit.vitals[0].bloodPressure}</p>
                                            <p className="text-xs text-gray-500">Blood Pressure</p>
                                        </div>
                                        <div className="bg-cyan-50 rounded-xl p-4 text-center">
                                            <Wind className="w-6 h-6 text-cyan-500 mx-auto mb-2" />
                                            <p className="text-2xl font-bold text-gray-900">{selectedVisit.vitals[0].respiratoryRate}</p>
                                            <p className="text-xs text-gray-500">Resp. Rate</p>
                                        </div>
                                        <div className="bg-green-50 rounded-xl p-4 text-center">
                                            <Droplets className="w-6 h-6 text-green-500 mx-auto mb-2" />
                                            <p className="text-2xl font-bold text-gray-900">{selectedVisit.vitals[0].oxygenSaturation}%</p>
                                            <p className="text-xs text-gray-500">SpO2</p>
                                        </div>
                                        <div className="bg-purple-50 rounded-xl p-4 text-center">
                                            <Weight className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                                            <p className="text-2xl font-bold text-gray-900">{selectedVisit.vitals[0].weight}</p>
                                            <p className="text-xs text-gray-500">Weight (kg)</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center py-8">No vitals recorded</p>
                                )}
                            </div>

                            {/* Clinical Notes */}
                            <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl border p-6">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-blue-500" />
                                    Clinical Information
                                </h3>
                                <div className="space-y-4">
                                    <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4 rounded-r-xl">
                                        <p className="text-xs text-yellow-800 uppercase font-bold mb-1">Chief Complaint</p>
                                        <p className="text-gray-800">{selectedVisit.patientVisit.complaint || "Not recorded"}</p>
                                    </div>
                                    <div className="border-l-4 border-green-400 bg-green-50 p-4 rounded-r-xl">
                                        <p className="text-xs text-green-800 uppercase font-bold mb-1">Diagnosis</p>
                                        <p className="text-gray-800">{String(selectedVisit.patientVisit.diagnosis) || "Not recorded"}</p>
                                    </div>
                                    <div className="border-l-4 border-purple-400 bg-purple-50 p-4 rounded-r-xl">
                                        <p className="text-xs text-purple-800 uppercase font-bold mb-1">Investigations</p>
                                        <p className="text-gray-800">{selectedVisit.patientVisit.investigations || "None ordered"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Medications */}
                        <div className="bg-white rounded-2xl shadow-xl border p-6">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Pill className="w-5 h-5 text-green-500" />
                                Prescribed Medications
                            </h3>
                            {(() => {
                                const currentVisit = visits.find(v => v.visitID === selectedVisit.patientVisit.visitID);
                                return currentVisit && currentVisit.medicines.length > 0 ? (
                                    <div className="grid gap-3">
                                        {currentVisit.medicines.map((med, idx) => (
                                            <div key={idx} className="flex items-center gap-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
                                                <div className="w-10 h-10 bg-black text-white rounded-lg flex items-center justify-center font-bold">
                                                    {idx + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-900">{med.name}</h4>
                                                    <p className="text-sm text-gray-500">{med.dosage}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium text-gray-700">{med.frequency}</p>
                                                    <p className="text-xs text-gray-500">for {med.duration}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center py-8">No medications prescribed</p>
                                );
                            })()}
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Prescription 1 Actions */}
                            <div className="bg-white rounded-2xl shadow-lg border p-5">
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    Classic Prescription
                                </h4>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handlePrint("prescription1")}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                                    >
                                        <Printer className="w-4 h-4" />
                                        Print
                                    </button>
                                    <button
                                        onClick={() => handleDownload("prescription1")}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download
                                    </button>
                                </div>
                            </div>

                            {/* Prescription 2 Actions */}
                            <div className="bg-white rounded-2xl shadow-lg border p-5">
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    Modern Prescription
                                </h4>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handlePrint("prescription2")}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                                    >
                                        <Printer className="w-4 h-4" />
                                        Print
                                    </button>
                                    <button
                                        onClick={() => handleDownload("prescription2")}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download
                                    </button>
                                </div>
                            </div>

                            {/* Bill Actions */}
                            <div className="bg-white rounded-2xl shadow-lg border p-5">
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <Receipt className="w-5 h-5" />
                                    Patient Bill
                                </h4>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handlePrint("bill")}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        <Printer className="w-4 h-4" />
                                        Print
                                    </button>
                                    <button
                                        onClick={() => handleDownload("bill")}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* View Modal */}
                {viewModal && selectedVisit && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                            <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
                                <h3 className="text-lg font-bold">
                                    {viewType === "prescription1" && "Classic Prescription Preview"}
                                    {viewType === "prescription2" && "Modern Prescription Preview"}
                                    {viewType === "bill" && "Patient Bill Preview"}
                                </h3>
                                <button
                                    onClick={() => setViewModal(false)}
                                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 overflow-auto max-h-[calc(90vh-140px)] bg-gray-100">
                                <div className="bg-white shadow-lg mx-auto" style={{ width: "210mm", minHeight: "297mm", padding: "20mm" }}>
                                    {viewType === "prescription1" && (
                                        <div className="font-serif">
                                            <div className="text-center border-b-2 border-black pb-4 mb-6">
                                                <h1 className="text-2xl font-bold">MEDICAL PRESCRIPTION</h1>
                                            </div>

                                            <div className="bg-gray-100 p-4 rounded mb-6">
                                                <p className="text-xs text-gray-500 uppercase font-bold mb-2">Patient Information</p>
                                                <div className="grid grid-cols-4 gap-4 text-sm">
                                                    <div><span className="font-semibold">Name:</span> {selectedVisit.patientVisit.patientName}</div>
                                                    <div><span className="font-semibold">MR No:</span> {selectedVisit.patientVisit.mrNo}</div>
                                                    <div><span className="font-semibold">Age/Sex:</span> {calculateAge(selectedVisit.patientVisit.dob)}Y / {selectedVisit.patientVisit.gender}</div>
                                                    <div><span className="font-semibold">Date:</span> {formatDate(selectedVisit.patientVisit.visitDate)}</div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-6">
                                                <div className="col-span-1 space-y-4">
                                                    <div>
                                                        <h3 className="font-bold border-b border-black mb-2">VITAL SIGNS</h3>
                                                        {selectedVisit.vitals[0] && (
                                                            <div className="text-sm space-y-1">
                                                                <p>Temperature: {selectedVisit.vitals[0].temperature}°F</p>
                                                                <p>Pulse: {selectedVisit.vitals[0].pulse} bpm</p>
                                                                <p>BP: {selectedVisit.vitals[0].bloodPressure}</p>
                                                                <p>SpO2: {selectedVisit.vitals[0].oxygenSaturation}%</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold border-b border-black mb-2">COMPLAINT</h3>
                                                        <p className="text-sm">{selectedVisit.patientVisit.complaint}</p>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold border-b border-black mb-2">DIAGNOSIS</h3>
                                                        <p className="text-sm">{String(selectedVisit.patientVisit.diagnosis)}</p>
                                                    </div>
                                                </div>
                                                <div className="col-span-2">
                                                    <h3 className="text-2xl font-bold mb-4">℞</h3>
                                                    {(() => {
                                                        const currentVisit = visits.find(v => v.visitID === selectedVisit.patientVisit.visitID);
                                                        return currentVisit?.medicines.map((med, idx) => (
                                                            <div key={idx} className="mb-4 pb-4 border-b border-gray-200">
                                                                <p className="font-bold">{idx + 1}. {med.name} ({med.dosage})</p>
                                                                <p className="text-sm text-gray-600 ml-4">{med.frequency} for {med.duration}</p>
                                                            </div>
                                                        ));
                                                    })()}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {viewType === "prescription2" && (
                                        <div className="font-sans">
                                            <div className="flex justify-between items-start mb-8">
                                                <div>
                                                    <h1 className="text-3xl font-bold">PRESCRIPTION</h1>
                                                </div>
                                                <div className="text-right text-sm text-gray-600">
                                                    <p>{formatDate(selectedVisit.patientVisit.visitDate)}</p>
                                                    <p>MR#: {selectedVisit.patientVisit.mrNo}</p>
                                                </div>
                                            </div>

                                            <div className="border-2 border-black p-4 mb-6">
                                                <h2 className="text-xl font-bold">{selectedVisit.patientVisit.patientName}</h2>
                                                <p className="text-gray-600">{calculateAge(selectedVisit.patientVisit.dob)} years • {selectedVisit.patientVisit.gender} • {selectedVisit.patientVisit.phone}</p>
                                                <p className="text-gray-600">Dr. {selectedVisit.patientVisit.doctorUser} • {selectedVisit.patientVisit.department}</p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-8">
                                                <div>
                                                    <h3 className="font-bold text-lg mb-4">Clinical Notes</h3>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <p className="text-xs uppercase text-gray-500 font-bold">Complaint</p>
                                                            <p className="text-sm">{selectedVisit.patientVisit.complaint}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs uppercase text-gray-500 font-bold">Diagnosis</p>
                                                            <p className="text-sm">{String(selectedVisit.patientVisit.diagnosis)}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg mb-4">Medications</h3>
                                                    {(() => {
                                                        const currentVisit = visits.find(v => v.visitID === selectedVisit.patientVisit.visitID);
                                                        return currentVisit?.medicines.map((med, idx) => (
                                                            <div key={idx} className="border border-gray-300 p-3 mb-3 rounded">
                                                                <p className="font-bold">{med.name}</p>
                                                                <p className="text-xs text-gray-600">{med.dosage} • {med.frequency} • {med.duration}</p>
                                                            </div>
                                                        ));
                                                    })()}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {viewType === "bill" && (
                                        <div className="font-sans">
                                            <div className="text-center border-b-2 border-black pb-4 mb-6">
                                                <h1 className="text-2xl font-bold">CITY GENERAL HOSPITAL</h1>
                                                <p className="text-sm text-gray-600">123 Healthcare Avenue, Medical District</p>
                                                <p className="text-sm text-gray-600">Phone: (021) 1234-5678</p>
                                            </div>

                                            <div className="flex justify-between mb-6">
                                                <h2 className="text-xl font-bold">PATIENT BILL</h2>
                                                <div className="text-right">
                                                    <p className="text-sm">Bill #: BILL-{selectedVisit.patientVisit.visitID}</p>
                                                    <p className="text-sm">{formatDate(new Date().toISOString())}</p>
                                                </div>
                                            </div>

                                            <div className="bg-gray-100 p-4 mb-6 grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs uppercase font-bold text-gray-600">Billed To</p>
                                                    <p className="font-semibold">{selectedVisit.patientVisit.patientName}</p>
                                                    <p className="text-sm">MR: {selectedVisit.patientVisit.mrNo}</p>
                                                    <p className="text-sm">{selectedVisit.patientVisit.phone}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs uppercase font-bold text-gray-600">Visit Details</p>
                                                    <p className="text-sm">Visit ID: {selectedVisit.patientVisit.visitID}</p>
                                                    <p className="text-sm">Date: {formatDate(selectedVisit.patientVisit.visitDate)}</p>
                                                    <p className="text-sm">Doctor: {selectedVisit.patientVisit.doctorUser}</p>
                                                </div>
                                            </div>

                                            <table className="w-full border-collapse border border-gray-400 mb-6">
                                                <thead>
                                                    <tr className="bg-black text-white">
                                                        <th className="border border-gray-400 p-2 text-left">Description</th>
                                                        <th className="border border-gray-400 p-2 text-left">Details</th>
                                                        <th className="border border-gray-400 p-2 text-center">Qty</th>
                                                        <th className="border border-gray-400 p-2 text-right">Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td className="border border-gray-400 p-2">Consultation Fee</td>
                                                        <td className="border border-gray-400 p-2">Dr. {selectedVisit.patientVisit.doctorUser}</td>
                                                        <td className="border border-gray-400 p-2 text-center">1</td>
                                                        <td className="border border-gray-400 p-2 text-right">500.00</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="border border-gray-400 p-2">Registration Fee</td>
                                                        <td className="border border-gray-400 p-2">Patient Registration</td>
                                                        <td className="border border-gray-400 p-2 text-center">1</td>
                                                        <td className="border border-gray-400 p-2 text-right">200.00</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="border border-gray-400 p-2">Vital Check</td>
                                                        <td className="border border-gray-400 p-2">Nursing Services</td>
                                                        <td className="border border-gray-400 p-2 text-center">1</td>
                                                        <td className="border border-gray-400 p-2 text-right">100.00</td>
                                                    </tr>
                                                </tbody>
                                            </table>

                                            <div className="flex justify-end">
                                                <div className="w-64">
                                                    <div className="flex justify-between py-2 border-b">
                                                        <span>Subtotal</span>
                                                        <span>800.00</span>
                                                    </div>
                                                    <div className="flex justify-between py-2 border-b">
                                                        <span>Tax</span>
                                                        <span>0.00</span>
                                                    </div>
                                                    <div className="flex justify-between py-2 font-bold text-lg">
                                                        <span>TOTAL</span>
                                                        <span>Rs. 800.00</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-8 p-4 bg-gray-100">
                                                <p className="text-sm font-semibold">Payment Status: <span className="text-red-600">UNPAID</span></p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
                                <button
                                    onClick={() => setViewModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => {
                                        handleDownload(viewType);
                                        setViewModal(false);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                                >
                                    <Download className="w-4 h-4" />
                                    Download PDF
                                </button>
                                <button
                                    onClick={() => {
                                        handlePrint(viewType);
                                        setViewModal(false);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                                >
                                    <Printer className="w-4 h-4" />
                                    Print
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}