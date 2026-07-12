"use client";

import { useState, useEffect, useRef } from "react";
import { Settings, X, LogOut, User, Lock, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import LogoutApi from "@/lib/api/Common/AuthLogout/logout";

type NavbarProps = {
  label: string;
}

export default function Navbar({ label }: NavbarProps) {
  const [settingModal, setSettingModal] = useState(false);
  const [resetPasswordModal, setResetPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setSettingModal(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setResetPasswordModal(false);
        setSettingModal(false);
      }
    };
    if (resetPasswordModal || settingModal) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [resetPasswordModal, settingModal]);

  const functionHandleLogout = async () => {
    const token = localStorage.getItem("token");
    try {
      setIsLoading(true);
      const result = await LogoutApi(token as string);
      if (result.message === "Logged out successfully") {
        localStorage.clear();
        router.push("/login");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    // Add your reset password logic here
    console.log("Resetting password...", { oldPassword, newPassword });
    setResetPasswordModal(false);
    setOldPassword("");
    setNewPassword("");
  };

  return (
    <>
      {/* ================= NAVBAR ================= */}
      <nav className="bg-white shadow-sm px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 border-b border-gray-200 sticky top-0 z-30">
        <div className="flex items-center justify-between gap-4">
          {/* Page Title */}
          <h1 className="text-base sm:text-lg font-semibold text-gray-800 truncate">
            {label}
          </h1>

          {/* Settings Dropdown */}
          <div className="relative shrink-0" ref={dropdownRef}>
            <button
              onClick={() => setSettingModal(!settingModal)}
              className={`
                flex items-center gap-1.5 sm:gap-2 
                px-2.5 sm:px-4 py-2 sm:py-2.5 
                rounded-lg sm:rounded-xl 
                bg-gray-100 hover:bg-gray-200 
                transition-all duration-200 
                active:scale-95 touch-manipulation
                ${settingModal ? "bg-gray-200 ring-2 ring-gray-300" : ""}
              `}
            >
              <Settings size={16} className="text-gray-600 shrink-0" />
              <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                Settings
              </span>
              <ChevronDown 
                size={14} 
                className={`text-gray-500 transition-transform duration-200 hidden sm:block ${settingModal ? "rotate-180" : ""}`} 
              />
            </button>

            {/* Settings Dropdown Menu */}
            {settingModal && (
              <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* User Info Header */}
                <div className="px-4 py-3 border-b border-gray-100 mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#2B2C2B] flex items-center justify-center">
                      <User size={14} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">Admin User</p>
                      <p className="text-xs text-gray-500 truncate">admin@paintstore.com</p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <button
                  onClick={() => {
                    setSettingModal(false);
                    setResetPasswordModal(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Lock size={16} className="text-gray-500 shrink-0" />
                  <span>Reset Password</span>
                </button>

                <div className="border-t border-gray-100 my-1" />

                <button
                  onClick={functionHandleLogout}
                  disabled={isLoading}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  <LogOut size={16} className="shrink-0" />
                  <span>{isLoading ? "Logging out..." : "Logout"}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ================= RESET PASSWORD MODAL ================= */}
      {resetPasswordModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setResetPasswordModal(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-[101] animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  Reset Password
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                  Secure your account with a new password
                </p>
              </div>
              <button
                onClick={() => setResetPasswordModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Form */}
            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter your current password"
                  className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-[#2B2C2B] focus:border-[#2B2C2B] outline-none transition-all text-sm sm:text-base placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                  className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-[#2B2C2B] focus:border-[#2B2C2B] outline-none transition-all text-sm sm:text-base placeholder:text-gray-400"
                />
                <p className="mt-1.5 text-xs text-gray-500">
                  Must be at least 8 characters with letters and numbers
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 p-4 sm:p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
              <button
                onClick={() => setResetPasswordModal(false)}
                className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button className="px-4 py-2.5 text-sm font-medium text-[#2B2C2B] hover:bg-[#2B2C2B]/5 rounded-lg transition-colors hidden sm:block">
                  Forgot password?
                </button>
                <button
                  onClick={handleResetPassword}
                  disabled={!oldPassword || !newPassword}
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg bg-[#2B2C2B] text-white font-medium hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-lg shadow-black/10"
                >
                  Update Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}