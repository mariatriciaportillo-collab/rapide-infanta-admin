'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Car, User, Settings, Calculator, Wrench, Box, ChevronDown, ChevronRight, Briefcase, Search, ShoppingCart, Receipt, CreditCard, Package, Truck, ClipboardList, Archive, BarChart2, History as HistoryIcon, TrendingUp, MinusCircle, DollarSign, Clock, Shield, Building2 } from 'lucide-react'

export function SidebarNav() {
  const pathname = usePathname()
  
  // Active states for parent menus
  const isOperationsActive = ['/quotations', '/estimate', '/quick-sale', '/invoice', '/payments'].some(route => pathname?.startsWith(route))
  const isCustomerAccountsActive = ['/customers', '/vehicles'].some(route => pathname?.startsWith(route))
  const isProductsActive = ['/labor-lookup', '/labor-charges', '/parts', '/packages'].some(route => pathname?.startsWith(route))
  const isInventoryActive = ['/inventory', '/stock-adjustments', '/outside-purchases', '/purchase-orders', '/suppliers'].some(route => pathname?.startsWith(route))
  const isReportsActive = pathname?.startsWith('/reports')
  const isAdminActive = pathname?.startsWith('/admin')
  
  const [operationsOpen, setOperationsOpen] = useState(isOperationsActive)
  const [customersOpen, setCustomersOpen] = useState(isCustomerAccountsActive)
  const [productsOpen, setProductsOpen] = useState(isProductsActive)
  const [inventoryOpen, setInventoryOpen] = useState(isInventoryActive)
  const [reportsOpen, setReportsOpen] = useState(isReportsActive)
  const [adminOpen, setAdminOpen] = useState(isAdminActive)

  // Auto-expand if active route changes
  useEffect(() => {
    if (isOperationsActive) setOperationsOpen(true)
    if (isCustomerAccountsActive) setCustomersOpen(true)
    if (isProductsActive) setProductsOpen(true)
    if (isInventoryActive) setInventoryOpen(true)
  }, [pathname, isOperationsActive, isCustomerAccountsActive, isProductsActive, isInventoryActive])

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
            <Link 
              href="/service-history" 
              className={`px-3 py-2 rounded-md transition font-medium text-sm flex items-center gap-2
                ${pathname?.startsWith('/service-history') ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
            >
              <HistoryIcon size={16} />
              Service History
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
              href="/labor-lookup" 
              className={`px-3 py-2 rounded-md transition font-medium text-sm flex items-center gap-2
                ${pathname?.startsWith('/labor-lookup') ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
            >
              <Search size={16} />
              Labor Lookup
            </Link>
            <Link 
              href="/labor-charges" 
              className={`px-3 py-2 rounded-md transition font-medium text-sm flex items-center gap-2
                ${pathname?.startsWith('/labor-charges') ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
            >
              <Wrench size={16} />
              Labor Charges
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

      {/* INVENTORY & PURCHASING */}
      <div className="mt-2">
        <button 
          onClick={() => setInventoryOpen(!inventoryOpen)}
          className={`w-full px-3 py-2 rounded-md transition font-medium flex justify-between items-center
            ${isInventoryActive && !inventoryOpen ? 'text-white font-semibold' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
        >
          <div className="flex items-center gap-2">
            <Archive size={18} />
            Inventory & Purchasing
          </div>
          {inventoryOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        
        {inventoryOpen && (
          <div className="ml-4 flex flex-col gap-1 mt-1 border-l border-slate-700 pl-2">
            <Link 
              href="/inventory" 
              className={`px-3 py-2 rounded-md transition font-medium text-sm flex items-center gap-2
                ${pathname?.startsWith('/inventory') ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
            >
              <ClipboardList size={16} />
              Inventory
            </Link>
            <Link 
              href="/stock-adjustments" 
              className={`px-3 py-2 rounded-md transition font-medium text-sm flex items-center gap-2
                ${pathname?.startsWith('/stock-adjustments') ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
            >
              <Settings size={16} />
              Stock Adjustments
            </Link>
            <Link 
              href="/outside-purchases" 
              className={`px-3 py-2 rounded-md transition font-medium text-sm flex items-center gap-2
                ${pathname?.startsWith('/outside-purchases') ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
            >
              <ShoppingCart size={16} />
              Outside Purchase
            </Link>
            <Link 
              href="/purchase-orders" 
              className={`px-3 py-2 rounded-md transition font-medium text-sm flex items-center gap-2
                ${pathname?.startsWith('/purchase-orders') ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
            >
              <Receipt size={16} />
              Purchase Orders
            </Link>
            <Link 
              href="/suppliers" 
              className={`px-3 py-2 rounded-md transition font-medium text-sm flex items-center gap-2
                ${pathname?.startsWith('/suppliers') ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
            >
              <Truck size={16} />
              Suppliers
            </Link>
          </div>
        )}
      </div>
      {/* REPORTS */}
      <div className="mt-2">
        <button 
          onClick={() => setReportsOpen(!reportsOpen)}
          className={`w-full px-3 py-2 rounded-md transition font-medium flex justify-between items-center
            ${isReportsActive && !reportsOpen ? 'text-white font-semibold' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
        >
          <div className="flex items-center gap-2">
            <BarChart2 size={18} />
            Reports
          </div>
          {reportsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        
        {reportsOpen && (
          <div className="ml-4 flex flex-col gap-1 mt-1 border-l border-slate-700 pl-2">
            <Link href="/reports/sales" className={`px-3 py-2 rounded-md transition font-medium text-sm flex items-center gap-2 ${pathname?.startsWith('/reports/sales') ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}><TrendingUp size={16} /> Sales & Revenue</Link>
            <Link href="/reports/invoices" className={`px-3 py-2 rounded-md transition font-medium text-sm flex items-center gap-2 ${pathname?.startsWith('/reports/invoices') ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}><Receipt size={16} /> Invoices</Link>
            <Link href="/reports/payments" className={`px-3 py-2 rounded-md transition font-medium text-sm flex items-center gap-2 ${pathname?.startsWith('/reports/payments') ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}><CreditCard size={16} /> Payments & Collections</Link>
            <Link href="/reports/expenses" className={`px-3 py-2 rounded-md transition font-medium text-sm flex items-center gap-2 ${pathname?.startsWith('/reports/expenses') ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}><MinusCircle size={16} /> Expenses</Link>
            <Link href="/reports/profit-loss" className={`px-3 py-2 rounded-md transition font-medium text-sm flex items-center gap-2 ${pathname?.startsWith('/reports/profit-loss') ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}><DollarSign size={16} /> Profit & Loss</Link>
            <Link href="/reports/labor-sales" className={`px-3 py-2 rounded-md transition font-medium text-sm flex items-center gap-2 ${pathname?.startsWith('/reports/labor-sales') ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}><Wrench size={16} /> Labor Sales</Link>
            <Link href="/reports/parts-materials" className={`px-3 py-2 rounded-md transition font-medium text-sm flex items-center gap-2 ${pathname?.startsWith('/reports/parts-materials') ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}><Package size={16} /> Parts & Materials</Link>
            <Link href="/reports/package-sales" className={`px-3 py-2 rounded-md transition font-medium text-sm flex items-center gap-2 ${pathname?.startsWith('/reports/package-sales') ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}><Box size={16} /> Package Sales</Link>
            <Link href="/reports/inventory" className={`px-3 py-2 rounded-md transition font-medium text-sm flex items-center gap-2 ${pathname?.startsWith('/reports/inventory') ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}><Archive size={16} /> Inventory</Link>
            <Link href="/reports/service-due" className={`px-3 py-2 rounded-md transition font-medium text-sm flex items-center gap-2 ${pathname?.startsWith('/reports/service-due') ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}><Clock size={16} /> Service Due</Link>
          </div>
        )}
      </div>

      {/* ADMINISTRATION */}
      <div className="mt-2 mb-8">
        <button 
          onClick={() => setAdminOpen(!adminOpen)}
          className={`w-full px-3 py-2 rounded-md transition font-medium flex justify-between items-center
            ${isAdminActive && !adminOpen ? 'text-white font-semibold' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
        >
          <div className="flex items-center gap-2">
            <Settings size={18} />
            Administration
          </div>
          {adminOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        
        {adminOpen && (
          <div className="ml-4 flex flex-col gap-1 mt-1 border-l border-slate-700 pl-2">
            <Link href="/admin/employees" className={`px-3 py-2 rounded-md transition font-medium text-sm flex items-center gap-2 ${pathname?.startsWith('/admin/employees') ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}><Users size={16} /> Employees</Link>
            <Link href="/admin/service-intervals" className={`px-3 py-2 rounded-md transition font-medium text-sm flex items-center gap-2 ${pathname?.startsWith('/admin/service-intervals') ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}><Clock size={16} /> Service Interval Settings</Link>
            <Link href="/admin/users" className={`px-3 py-2 rounded-md transition font-medium text-sm flex items-center gap-2 ${pathname?.startsWith('/admin/users') ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}><Shield size={16} /> Users & Access</Link>
            <Link href="/admin/branch" className={`px-3 py-2 rounded-md transition font-medium text-sm flex items-center gap-2 ${pathname?.startsWith('/admin/branch') ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}><Building2 size={16} /> Branch Settings</Link>
          </div>
        )}
      </div>
    </nav>
  )
}
