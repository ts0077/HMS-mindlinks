'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Squares2X2Icon,
  CubeIcon,
  ShoppingCartIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline"
import { 
  ArrowRightLeft, 
  Boxes, 
  Building2Icon, 
  Calculator, 
  ListOrderedIcon, 
  Package, 
  ReceiptRussianRuble, 
  ReceiptText,
  FolderOpen,
  AlertTriangle,
  Key,
  Landmark,
  Scale,
  Users, 
  UserCog,
  Stethoscope,
  ClipboardList,
  Microscope,
  Pill,
  Clock
} from "lucide-react"
import LogoutApi from "@/lib/api/Common/AuthLogout/logout"

type SidebarProps = {
  expanded?: boolean;
}

export default function SidebarAdmin({ expanded = false }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen])

  // Route definitions - must match actual hrefs in sublinks
  const itemRoutes = [
    "/admin/receptionist" ,
    "/admin/doctor",
    "/admin/premorbid",
    "/admin/investigation",
    "/admin/diagnosis",
    "/admin/medecine",
    "/admin/dosage"
  ]

  const purchaseRoutes = [
    "/admin/purchasearea/orders", 
    "/admin/purchasearea/suppliers",
    "/admin/purchasearea/purchasereturn",
    "/admin/purchasearea/suppliers/registration",
    "/admin/purchasearea/suppliers/invoices"
  ]
  
  const reportsRoutes = ["/admin/reports/RemainingStock"]
  const expenseRoute = ["/admin/expenses"]
  const tokensRoute = ["/admin/tokens"]

  const isItemActive = itemRoutes.some(r => pathname.startsWith(r))
  const isPurchaseActive = purchaseRoutes.some(r => pathname.startsWith(r))
  const isReportsActive = reportsRoutes.some(r => pathname.startsWith(r))
  const isExpenseActive = expenseRoute.some(r => pathname.startsWith(r))
  const isTokenActive = tokensRoute.some(r => pathname.startsWith(r))

  const [itemOpen, setItemOpen] = useState(isItemActive)
  const [purchaseOpen, setPurchaseOpen] = useState(isPurchaseActive)
  const [reportsOpen, setReportsOpen] = useState(isReportsActive)
  
  const supplierRoutes = [
    "/admin/purchasearea/suppliers/registration",
    "/admin/purchasearea/suppliers/invoices",
  ]

  const isSupplierActive = supplierRoutes.some(r => pathname.startsWith(r))
  const [supplierOpen, setSupplierOpen] = useState(isSupplierActive)

  useEffect(() => {
    setItemOpen(isItemActive)
    setPurchaseOpen(isPurchaseActive)
    setSupplierOpen(isSupplierActive)
    setReportsOpen(isReportsActive)
  }, [pathname, isItemActive, isPurchaseActive, isSupplierActive, isReportsActive])

  const functionLogout = async () => {
    const token = localStorage.getItem("token")
    try {
      const result = await LogoutApi(token as string)
      if (result.message === "Logged out successfully") {
        router.push("/login")
        localStorage.clear()
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleSwitchToCustomer = () => {
    router.push("/Customer")
  }

  const NavigationContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <>
      <div className={`flex flex-col items-center gap-3 py-6 border-b border-white/10 ${isMobile ? 'block' : 'hidden lg:flex'}`}>
        <img 
          src="/pngtree-house-and-city-paint-logo-png-image_5442163.webp" 
          className="w-10 h-10 rounded-full bg-white" 
          alt="HMS"
        />
        <span className={`font-semibold ${isMobile || expanded ? 'block' : 'hidden'}`}>
          HMS
        </span>
      </div>

      <nav className={`flex-1 mt-6 px-2 space-y-1 ${isMobile ? 'overflow-y-auto' : ''}`}>
        <NavLink 
          href="/admin" 
          label="Dashboard" 
          icon={<Squares2X2Icon className="w-5 h-5" />} 
          pathname={pathname} 
          isMobile={isMobile}
          expanded={expanded}
          exact={true}
        />

        <Toggle
          icon={<CubeIcon className="w-5 h-5" />}
          label="Code"
          open={itemOpen}
          active={isItemActive}
          isMobile={isMobile}
          expanded={expanded}
          onClick={() => {
            setItemOpen(!itemOpen)
            setPurchaseOpen(false)
          }}
        >
          <SubLink 
            href="/admin/receptionist" 
            label="Receptionist" 
            icon={<UserCog  size={14} />} 
            pathname={pathname} 
            isMobile={isMobile} 
            expanded={expanded} 
          />
          <SubLink 
            href="/admin/doctor" 
            label="Doctor" 
            icon={<Stethoscope size={14} />} 
            pathname={pathname} 
            isMobile={isMobile} 
            expanded={expanded} 
          />
          <SubLink 
            href="/admin/premorbid" 
            label="Premorbid" 
            icon={<ClipboardList size={14} />} 
            pathname={pathname} 
            isMobile={isMobile} 
            expanded={expanded} 
          />
          <SubLink 
            href="/admin/investigation" 
            label="Investigation" 
            icon={<Microscope size={14} />} 
            pathname={pathname} 
            isMobile={isMobile} 
            expanded={expanded} 
          />
          <SubLink 
            href="/admin/diagnosis" 
            label="Daignosis" 
            icon={<Stethoscope size={14}/>} 
            pathname={pathname} 
            isMobile={isMobile} 
            expanded={expanded} 
          />
          <SubLink 
            href="/admin/medecine" 
            label="Medecine" 
            icon={<Pill size={14} />} 
            pathname={pathname} 
            isMobile={isMobile} 
            expanded={expanded} 
          />
          <SubLink 
            href="/admin/dosage" 
            label="Dosage" 
            icon={<Clock size={14} />} 
            pathname={pathname} 
            isMobile={isMobile} 
            expanded={expanded} 
          />
        </Toggle>

        <Toggle
          icon={<ShoppingCartIcon className="w-5 h-5" />}
          label="Purchase Area"
          open={purchaseOpen}
          active={isPurchaseActive}
          isMobile={isMobile}
          expanded={expanded}
          onClick={() => {
            setPurchaseOpen(!purchaseOpen)
            setItemOpen(false)
          }}
        >
          <Toggle
            icon={<Building2Icon size={14} />}
            label="Ledger"
            open={supplierOpen}
            active={isSupplierActive}
            isMobile={isMobile}
            expanded={expanded}
            nested={true}
            onClick={() => setSupplierOpen(!supplierOpen)}
          >
            <SubLink
              href="/admin/purchasearea/suppliers/registration"
              label="Registration"
              pathname={pathname}
              isMobile={isMobile}
              expanded={expanded}
              nested={true}
            />
            <SubLink
              href="/admin/purchasearea/suppliers/invoices"
              label="Invoices"
              pathname={pathname}
              isMobile={isMobile}
              expanded={expanded}
              nested={true}
            />
          </Toggle>
          <SubLink
            icon={<ListOrderedIcon size={14} />}
            href="/admin/purchasearea/orders"
            label="Orders"
            pathname={pathname}
            isMobile={isMobile}
            expanded={expanded}
          />
          <SubLink
            icon={<ReceiptRussianRuble size={14} />}
            href="/admin/purchasearea/purchasereturn"
            label="Purchase Return"
            pathname={pathname}
            isMobile={isMobile}
            expanded={expanded}
          />
        </Toggle>

        <NavLink 
          href="/admin/expenses" 
          label="Expenses" 
          icon={<ReceiptText className="w-5 h-5" />} 
          pathname={pathname} 
          isMobile={isMobile}
          expanded={expanded}
        />
        
        <NavLink 
          href="/admin/accounting" 
          label="Accounting" 
          icon={<Calculator className="w-5 h-5" />} 
          pathname={pathname} 
          isMobile={isMobile}
          expanded={expanded}
        />

        <Toggle
          icon={<ListOrderedIcon className="w-5 h-5" />}
          label="Reports"
          open={reportsOpen}
          active={isReportsActive}
          isMobile={isMobile}
          expanded={expanded}
          onClick={() => {
            setReportsOpen(!reportsOpen)
            setItemOpen(false)
            setPurchaseOpen(false)
          }}
        >
          <SubLink
            href="/admin/reports/RemainingStock"
            label="Remaining Stock" 
            icon={<AlertTriangle size={14} />}
            pathname={pathname}
            isMobile={isMobile}
            expanded={expanded}
          />
        </Toggle>

        <NavLink 
          href="/admin/tokens" 
          label="Tokens" 
          icon={<Key className="w-5 h-5" />} 
          pathname={pathname} 
          isMobile={isMobile}
          expanded={expanded}
        />
      </nav>

      <div className="border-t border-white/10 p-4 space-y-2 mt-auto">
        <button
          onClick={handleSwitchToCustomer}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-blue-400 hover:text-blue-300 hover:bg-white/5 transition-all duration-200 group/switch"
        >
          <ArrowRightLeft className="w-5 h-5 shrink-0 transition-transform group-hover/switch:rotate-180 duration-300" />
          <span className={`${isMobile || expanded ? 'block' : 'hidden'} whitespace-nowrap text-sm font-medium`}>
            Switch to Customer
          </span>
        </button>

        <button 
          onClick={functionLogout} 
          className="flex items-center gap-3 text-red-400 hover:text-red-500 w-full px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5 shrink-0" />
          <span className={`${isMobile || expanded ? 'block' : 'hidden'} whitespace-nowrap text-sm font-medium`}>
            Logout
          </span>
        </button>
      </div>
    </>
  )

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#2B2C2B] z-[60] flex items-center justify-between px-4 shadow-lg">
        <div className="flex items-center gap-3">
          <img 
            src="/pngtree-house-and-city-paint-logo-png-image_5442163.webp" 
            className="w-8 h-8 rounded-full bg-white" 
            alt="HMS"
          />
          <span className="text-white font-semibold">HMS</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          {mobileMenuOpen ? (
            <XMarkIcon className="w-6 h-6" />
          ) : (
            <Bars3Icon className="w-6 h-6" />
          )}
        </button>
      </div>

      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[70]"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside 
        className={`
          lg:hidden fixed inset-y-0 left-0 z-[80] w-72 bg-[#2B2C2B] text-white flex flex-col shadow-2xl
          transform transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10 h-16">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6" />
            <span className="text-white font-semibold">Admin Panel</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <NavigationContent isMobile={true} />
      </aside>

      <aside 
        className={`
          hidden lg:flex flex-col shadow-2xl overflow-y-auto no-scrollbar fixed inset-y-0 left-0 bg-[#2B2C2B] text-white
          transition-all duration-300 ease-in-out z-50
          ${expanded ? 'w-56' : 'w-16'}
        `}
      >
        <NavigationContent isMobile={false} />
      </aside>
    </>
  )
}

function NavLink({ href, icon, label, pathname, isMobile, expanded, exact = false }: any) {
const normalizedPath = pathname.toLowerCase().replace(/\/+$/, ''); // Remove trailing slashes
const normalizedHref = href.toLowerCase().replace(/\/+$/, '');
const active = exact 
  ? normalizedPath === normalizedHref
  : normalizedPath === normalizedHref || normalizedPath.startsWith(normalizedHref + '/')
    
  return (
    <Link 
      href={href} 
      className={`
        relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
        ${active ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/10 hover:text-white"}
        ${isMobile ? 'w-full' : ''}
      `}
    >
      <span className={`${active ? "text-white" : "text-gray-400"} transition-colors`}>
        {icon}
      </span>
      <span className={`${isMobile || expanded ? 'block' : 'hidden'} whitespace-nowrap`}>
        {label}
      </span>
      {active && <span className="absolute left-0 top-0 h-full w-1 bg-white rounded-r" />}
    </Link>
  )
}

function Toggle({ icon, label, open, active, onClick, children, isMobile, expanded, nested = false }: any) {
  return (
    <div>
      <button
        onClick={onClick}
        className={`
          relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
          ${active ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/10 hover:text-white"}
          ${nested ? 'text-sm' : ''}
        `}
      >
        <span className={`${active ? "text-white" : "text-gray-400"} transition-colors`}>
          {icon}
        </span>
        <span className={`${isMobile || expanded ? 'block flex-1 text-left' : 'hidden'} whitespace-nowrap`}>
          {label}
        </span>
        <span className={`${isMobile || expanded ? 'block' : 'hidden'} transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          ⌄
        </span>
        {active && <span className="absolute left-0 top-0 h-full w-1 bg-white rounded-r" />}
      </button>

      {open && (
        <div className={`${isMobile || expanded ? (nested ? 'ml-2' : 'ml-4') : 'hidden'} mt-1 space-y-1 border-l border-white/10 pl-3`}>
          {children}
        </div>
      )}
    </div>
  )
}

function SubLink({ href, label, icon, pathname, isMobile, expanded, nested = false }: any) {
  const active = pathname === href || pathname.startsWith(href + '/')
  return (
    <Link 
      href={href} 
      className={`
        relative flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-all duration-200
        ${active ? "bg-white/10 text-white font-medium" : "text-gray-400 hover:text-white hover:bg-white/10"}
        ${nested ? 'text-xs' : ''}
      `}
    >
      {icon && <span className={`${active ? "text-white" : "text-gray-500"}`}>{icon}</span>}
      <span className={`${isMobile || expanded ? 'block' : 'hidden'} whitespace-nowrap`}>
        {label}
      </span>
      {active && <span className="absolute left-0 top-0 h-full w-1 bg-white rounded-r" />}
    </Link>
  )
}