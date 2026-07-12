"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react"
import { CheckCircle, XCircle, X, AlertCircle, Info } from "lucide-react"

type ToastType = "success" | "error" | "info" | "warning"

type Toast = {
  id: number
  type: ToastType
  message: string
  duration?: number
}

type ToastContextType = {
  showToast: (type: ToastType, message: string, duration?: number) => void
  dismissToast: (id: number) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

const toastConfig = {
  success: {
    bg: "bg-emerald-500",
    icon: CheckCircle,
    iconColor: "text-emerald-100",
  },
  error: {
    bg: "bg-red-500",
    icon: XCircle,
    iconColor: "text-red-100",
  },
  warning: {
    bg: "bg-amber-500",
    icon: AlertCircle,
    iconColor: "text-amber-100",
  },
  info: {
    bg: "bg-blue-500",
    icon: Info,
    iconColor: "text-blue-100",
  },
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback((type: ToastType, message: string, duration = 4000) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, type, message, duration }])
  }, [])

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}

      {/* Toast Container - Responsive positioning */}
      <div className="fixed top-0 left-0 right-0 sm:top-4 sm:right-4 sm:left-auto z-[9999] flex flex-col gap-2 sm:gap-3 w-full sm:w-full sm:max-w-sm pointer-events-none p-4 sm:p-0">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onDismiss={dismissToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ 
  toast, 
  onDismiss 
}: { 
  toast: Toast
  onDismiss: (id: number) => void 
}) {
  const [progress, setProgress] = useState(100)
  const [isPaused, setIsPaused] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  const config = toastConfig[toast.type]
  const Icon = config.icon
  const duration = toast.duration || 4000

  useEffect(() => {
    if (isPaused) return

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(interval)
          handleExit()
          return 0
        }
        return prev - (100 / (duration / 50))
      })
    }, 50)

    return () => clearInterval(interval)
  }, [isPaused, duration])

  const handleExit = () => {
    setIsExiting(true)
    setTimeout(() => onDismiss(toast.id), 300)
  }

  const handleDismiss = () => {
    setProgress(0)
    handleExit()
  }

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      className={`
        pointer-events-auto relative overflow-hidden rounded-lg shadow-xl
        transform transition-all duration-300 ease-out
        ${isExiting ? "translate-x-full opacity-0 sm:translate-x-full" : "translate-x-0 opacity-100"}
        animate-in slide-in-from-right-full fade-in duration-300
        ${config.bg}
        w-full sm:w-auto
      `}
    >
      <div className="flex items-start gap-3 p-3 sm:p-4 pr-8 sm:pr-8">
        <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${config.iconColor}`} />
        
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium leading-relaxed break-words">
            {toast.message}
          </p>
        </div>

        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1.5 sm:p-1 rounded-md text-white/70 hover:text-white hover:bg-white/20 transition-colors min-w-[32px] min-h-[32px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
          aria-label="Dismiss toast"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
        <div
          className="h-full bg-white/40 transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used inside ToastProvider")
  return ctx
}

// Optional: Hook for easier usage
export function useToastActions() {
  const { showToast } = useToast()
  
  return {
    success: (message: string, duration?: number) => showToast("success", message, duration),
    error: (message: string, duration?: number) => showToast("error", message, duration),
    info: (message: string, duration?: number) => showToast("info", message, duration),
    warning: (message: string, duration?: number) => showToast("warning", message, duration),
  }
}