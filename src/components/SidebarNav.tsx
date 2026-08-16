'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight, Settings, Calculator, ShoppingCart, Receipt, CreditCard, LayoutDashboard, Briefcase, Users, User, Car, Wrench, Package, Box } from 'lucide-react'

export function SidebarNav() {
  const pathname = usePathname()
  
  // Active states for parent menus
  const isOperationsActive = ['/quotations', '/estimate', '/quick-sale', '/invoice', '/payments'].some(route => pathname?.startsWith(route))
  const isCustomerAccountsActive = ['/customers', '/vehicles'].some(route => pathname?.startsWith(route))
  const isProductsActive = ['/labor', '/parts', '/packages'].some(route => pathname?.startsWith(route))
  
  const [operationsOpen, setOperationsOpen] = useState(isOperationsActive)
  const [customersOpen, setCustomersOpen] = useState(isCustomerAccountsActive)
  const [productsOpen, setProductsOpen] = useState(isProductsActive)

  // Auto-expand if active route changes
  useEffect(() => {
    if (isOperationsActive) setOperationsOpen(true)
    if (isCustomerAccountsActive) setCustomersOpen(true)
    if (isProductsActive) setProductsOpen(true)
  }, [pathname, isOperationsActive, isCustomerAccountsActive, isProductsActive])

  return (
    <nav className="flex-1 py-4 flex flex-col gap-1 px-3">
      <Link 
        href="/" 
        className={`px-3 py-2 rounded-md transition font-medium flex items-center gap-2
          ${pathname === '/' ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
      >
        <LayoutDashboard size={18} />
        Dashboard
      </Link>

      {/* OPERATIONS */}
      <div className="mt-2">
        <button 
          onClick={() => setOperationsOpen(!operationsOpen)}
          className={`w-full px-3 py-2 rounded-md transition font-medium flex justify-between items-center
            ${isOperationsActive && !operationsOpen ? 'text-white font-semibold' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
        >
          <div className="flex items-center gap-2">
            <Briefcase size={18} />
            Operations
          </div>
          {operationsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        
        {operationsOpen && (
          <div className="ml-4 flex flex-col gap-1 mt-1 border-l border-slate-700 pl-2">
            <Link 
              href="/quotations" 
              className={`px-3 py-2 rounded-md transition font-medium text-sm flex items-center gap-2
                ${pathname?.startsWith('/quotations') ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
            >
              <Calculator size={16} />
              Quotation
            </Link>
            <Link 
              href="/estimate" 
              className={`px-3 py-2 rounded-md transition font-medium text-sm flex items-center gap-2
                ${pathname?.startsWith('/estimate') ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
            >
              <Settings size={16} />
              Estimate
            </Link>
            <Link 
              href="/quick-sale" 
              className={`px-3 py-2 rounded-md transition font-medium text-sm flex items-center gap-2
                ${pathname?.startsWith('/quick-sale') ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
            >
              <ShoppingCart size={16} />
              Quick Sale
            </Link>
            <Link 
              href="/invoice" 
              className={`px-3 py-2 rounded-md transition font-medium text-sm flex items-center gap-2
                ${pathname?.startsWith('/invoice') ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
            >
              <Receipt size={16} />
              Invoice
            </Link>
            <Link 
              href="/payments" 
              className={`px-3 py-2 rounded-md transition font-medium text-sm flex items-center gap-2
                ${pathname?.startsWith('/payments') ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
            >
              <CreditCard size={16} />
              Payments
            </Link>
          </div>
        )}
      </div>

      {/* CUSTOMER ACCOUNTS */}
      <div className="mt-2">
        <button 
          onClick={() => setCustomersOpen(!customersOpen)}
          className={`w-full px-3 py-2 rounded-md transition font-medium flex justify-between items-center
            ${isCustomerAccountsActive && !customersOpen ? 'text-white font-semibold' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
        >
          <div className="flex items-center gap-2">
            <Users size={18} />
            Customer Accounts
          </div>
          {customersOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        
        {customersOpen && (
          <div className="ml-4 flex flex-col gap-1 mt-1 border-l border-slate-700 pl-2">
            <Link 
              href="/customers" 
              className={`px-3 py-2 rounded-md transition font-medium text-sm flex items-center gap-2
                ${pathname?.startsWith('/customers') ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
            >
              <User size={16} />
              Customers
            </Link>
            <Link 
              href="/vehicles" 
              className={`px-3 py-2 rounded-md transition font-medium text-sm flex items-center gap-2
                ${pathname?.startsWith('/vehicles') ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
            >
              <Car size={16} />
              Vehicles
            </Link>
          </div>
        )}
      </div>

      {/* PRODUCTS & SERVICES */}
      <div className="mt-2">
        <button 
          onClick={() => setProductsOpen(!productsOpen)}
          className={`w-full px-3 py-2 rounded-md transition font-medium flex justify-between items-center
            ${isProductsActive && !productsOpen ? 'text-white font-semibold' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
        >
          <div className="flex items-center gap-2">
            <Box size={18} />
            Products & Services
          </div>
          {productsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        
        {productsOpen && (
          <div className="ml-4 flex flex-col gap-1 mt-1 border-l border-slate-700 pl-2">
            <Link 
              href="/labor" 
              className={`px-3 py-2 rounded-md transition font-medium text-sm flex items-center gap-2
                ${pathname?.startsWith('/labor') ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
            >
              <Wrench size={16} />
              Labor
            </Link>
            <Link 
              href="/parts" 
              className={`px-3 py-2 rounded-md transition font-medium text-sm flex items-center gap-2
                ${pathname?.startsWith('/parts') ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
            >
              <Package size={16} />
              Parts & Materials
            </Link>
            <Link 
              href="/packages" 
              className={`px-3 py-2 rounded-md transition font-medium text-sm flex items-center gap-2
                ${pathname?.startsWith('/packages') ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
            >
              <Box size={16} />
              Packages
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
