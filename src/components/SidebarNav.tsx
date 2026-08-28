'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { 
  LayoutDashboard, 
  FileText, 
  Users, User, 
  Wrench, 
  Box, 
  Archive,
  ChevronDown,
  ChevronRight,
  Settings,
  Car,
  ClipboardList,
  Search,
  ShoppingCart,
  Truck,
  Package,
  Receipt,
  CreditCard,
  History,
  BarChart2,
  TrendingUp,
  MinusCircle,
  DollarSign,
  Clock,
  Shield,
  Building2
} from 'lucide-react'

type Section = 'operations' | 'customers' | 'products' | 'inventory' | 'reports' | 'admin' | null

export function SidebarNav() {
  const pathname = usePathname()
  
  const isOperationsActive = ['/quotations', '/estimate', '/quick-sale', '/invoice', '/payments'].some(route => pathname?.startsWith(route))
  const isCustomerAccountsActive = ['/customers', '/vehicles', '/service-history'].some(route => pathname?.startsWith(route))
  const isProductsActive = ['/labor-lookup', '/labor-charges', '/parts', '/packages'].some(route => pathname?.startsWith(route))
  const isInventoryActive = ['/inventory', '/stock-adjustments', '/outside-purchases', '/purchase-orders', '/suppliers'].some(route => pathname?.startsWith(route))
  const isReportsActive = pathname?.startsWith('/reports')
  const isAdminActive = pathname?.startsWith('/admin')
  
  const [openSection, setOpenSection] = useState<Section>(null)

  // Auto-expand if active route changes
  useEffect(() => {
    if (isOperationsActive) setOpenSection('operations')
    else if (isCustomerAccountsActive) setOpenSection('customers')
    else if (isProductsActive) setOpenSection('products')
    else if (isInventoryActive) setOpenSection('inventory')
    else if (isReportsActive) setOpenSection('reports')
    else if (isAdminActive) setOpenSection('admin')
    else setOpenSection(null)
  }, [pathname, isOperationsActive, isCustomerAccountsActive, isProductsActive, isInventoryActive, isReportsActive, isAdminActive])

  const toggleSection = (section: Section) => {
    setOpenSection(prev => prev === section ? null : section)
  }

  return (
    <nav className="flex-1 py-4 flex flex-col gap-1 px-2">
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
          onClick={() => toggleSection('operations')}
          className={`w-full px-3 py-2 rounded-md transition font-medium flex justify-between items-center whitespace-nowrap
            ${isOperationsActive && openSection !== 'operations' ? 'text-white font-semibold' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
        >
          <div className="flex items-center gap-2">
            <FileText size={18} />
            Operations
          </div>
          {openSection === 'operations' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        
        {openSection === 'operations' && (
          <div className="ml-4 flex flex-col gap-1 mt-1 border-l border-slate-700 pl-2">
            <Link 
              href="/quotations" 
              className={`px-3 py-2 rounded-md transition font-medium text-sm flex items-center gap-2
                ${pathname?.startsWith('/quotations') ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
            >
              <FileText size={16} />
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
          onClick={() => toggleSection('customers')}
          className={`w-full px-3 py-2 rounded-md transition font-medium flex justify-between items-center whitespace-nowrap
            ${isCustomerAccountsActive && openSection !== 'customers' ? 'text-white font-semibold' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
        >
          <div className="flex items-center gap-2">
            <Users size={18} />
            Customer Accounts
          </div>
          {openSection === 'customers' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        
        {openSection === 'customers' && (
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
              <History size={16} />
              Service History
            </Link>
          </div>
        )}
      </div>

      {/* PRODUCTS & SERVICES */}
      <div className="mt-2">
        <button 
          onClick={() => toggleSection('products')}
          className={`w-full px-3 py-2 rounded-md transition font-medium flex justify-between items-center whitespace-nowrap
            ${isProductsActive && openSection !== 'products' ? 'text-white font-semibold' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
        >
          <div className="flex items-center gap-2">
            <Box size={18} />
            Products & Services
          </div>
          {openSection === 'products' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        
        {openSection === 'products' && (
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
          onClick={() => toggleSection('inventory')}
          className={`w-full px-2 py-2 rounded-md transition font-medium flex justify-between items-center whitespace-nowrap
            ${isInventoryActive && openSection !== 'inventory' ? 'text-white font-semibold' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
        >
          <div className="flex items-center gap-2">
            <Archive size={18} className="shrink-0" />
            <span className="truncate">Inventory & Purchasing</span>
          </div>
          {openSection === 'inventory' ? <ChevronDown size={16} className="shrink-0" /> : <ChevronRight size={16} className="shrink-0" />}
        </button>
        
        {openSection === 'inventory' && (
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
          onClick={() => toggleSection('reports')}
          className={`w-full px-3 py-2 rounded-md transition font-medium flex justify-between items-center whitespace-nowrap
            ${isReportsActive && openSection !== 'reports' ? 'text-white font-semibold' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
        >
          <div className="flex items-center gap-2">
            <BarChart2 size={18} />
            Reports
          </div>
          {openSection === 'reports' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        
        {openSection === 'reports' && (
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
          onClick={() => toggleSection('admin')}
          className={`w-full px-3 py-2 rounded-md transition font-medium flex justify-between items-center whitespace-nowrap
            ${isAdminActive && openSection !== 'admin' ? 'text-white font-semibold' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
        >
          <div className="flex items-center gap-2">
            <Settings size={18} />
            Administration
          </div>
          {openSection === 'admin' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        
        {openSection === 'admin' && (
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
