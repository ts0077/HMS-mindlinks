'use client'

import { useRouter } from "next/navigation"
import AdminLoginApi from "@/lib/api/Admin/Auth/AdminLogin"
import DoctorLoginApi from "@/lib/api/Doctor/Auth/DoctorLogin"
import ReceptionLoginApi from "@/lib/api/Reception/Auth/ReceptionLogin"
import { useState } from "react"
import { useToast } from "@/Components/Toast/ToastContext"
import { User, Stethoscope, ClipboardList } from "lucide-react"

type UserType = 'admin' | 'doctor' | 'reception'

export default function Login() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<UserType>('admin')

  const { showToast } = useToast()

  const handleLogin = async () => {
    if (username === "" || password === "") {
      showToast("error", "Please enter username and password")
      return
    }

    setIsLoading(true)

    try {
      let result

      switch (activeTab) {
        case 'admin':
          result = await AdminLoginApi(username, password)
          if (result.success === true) {
            localStorage.setItem("token", result.data.token.token)
            showToast("success", "Admin Login Successful")
            router.push("/admin")
          }
          break

        case 'doctor':
          result = await DoctorLoginApi(username, password)
          if (result.success === true) {
            localStorage.setItem("token", result.data.token.token)
            localStorage.setItem("doctorID", result.data.username)

            showToast("success", "Doctor Login Successful")
            router.push("/doctor")
          }
          break

        case 'reception':
          result = await ReceptionLoginApi(username, password)
          if (result.success === true) {
            localStorage.setItem("token", result.data.token.token)
            showToast("success", "Reception Login Successful")
            router.push("/reception")
          }
          break
      }
    } catch (error: any) {
      showToast("error", error?.message || "Login Failed")
    } finally {
      setIsLoading(false)
    }
  }

  const tabs = [
    { id: 'admin' as UserType, label: 'Admin', icon: User },
    { id: 'doctor' as UserType, label: 'Doctor', icon: Stethoscope },
    { id: 'reception' as UserType, label: 'Reception', icon: ClipboardList },
  ]

  return (
    <div className="min-h-screen bg-[#0b0b0b] flex items-center justify-center p-4">

      {/* Glass Card */}
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex-1 flex items-center justify-center gap-2 py-4 px-2 text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-white/10 text-white border-b-2 border-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>

        <div className="p-7">

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-xl font-bold shadow">
              🏥
            </div>
            <h2 className="text-white text-2xl font-semibold mt-3">
              HMS
            </h2>
            <p className="text-gray-400 text-sm">
              Sign in as {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </p>
          </div>

          {/* Inputs */}
          <div className="space-y-5">
            <div>
              <label className="text-xs text-gray-400">Username</label>
              <input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="mt-1 w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-gray-400 outline-none border border-white/10 focus:border-white focus:ring-2 focus:ring-white/30 transition"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400">Password</label>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="mt-1 w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-gray-400 outline-none border border-white/10 focus:border-white focus:ring-2 focus:ring-white/30 transition"
              />
            </div>
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className={`
              mt-8 w-full py-3 rounded-xl font-semibold transition shadow-lg flex items-center justify-center gap-2
              ${isLoading
                ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                : 'bg-white text-black hover:bg-gray-200'
              }
            `}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              `Sign In as ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`
            )}
          </button>

          {/* Forgot */}
          <div className="mt-5 text-center">
            <span className="text-sm text-gray-400">
              Forgot password?
            </span>{" "}
            <span className="text-sm text-white underline cursor-pointer hover:text-gray-200">
              Reset Now
            </span>
          </div>

        </div>

      </div>

    </div>
  )
}