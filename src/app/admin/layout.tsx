"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/Components/navbar";
import SidebarAdmin from "@/Components/sidebarAdmin";
import { ToastProvider } from "@/Components/Toast/ToastContext";

export default function AdminLayOut({ children }: { children: React.ReactNode }) {
    const [sidebarExpanded, setSidebarExpanded] = useState(false);

    return (
        <ToastProvider>
            <div className="bg-white min-h-screen relative">
                {/* Sidebar - Fixed position with z-index */}
                <div
                    className="fixed inset-y-0 left-0 z-[100]"
                    onMouseEnter={() => setSidebarExpanded(true)}
                    onMouseLeave={() => setSidebarExpanded(false)}
                >
                    <SidebarAdmin expanded={sidebarExpanded} />
                </div>

                {/* Main Content Area - Pushes right when sidebar expands */}
                <div
                    className={`
            flex flex-col min-h-screen transition-all duration-300 ease-in-out
            ${sidebarExpanded ? 'lg:ml-56' : 'lg:ml-16'}
            ml-0
          `}
                >
                    {/* Navbar */}
                    <div className="sticky top-0 z-40">
                        <Navbar label="Admin Panel" />
                    </div>

                    {/* Main content */}
                    <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
                        {children}
                    </main>
                </div>
            </div>
        </ToastProvider>
    );
}