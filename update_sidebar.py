import re

with open('src/components/SidebarNav.tsx', 'r') as f:
    content = f.read()

# Add states for new sections
if "const [reportsOpen, setReportsOpen] = useState(false)" not in content:
    state_pattern = r"const \[inventoryOpen, setInventoryOpen\] = useState\(false\)"
    state_repl = r"const [inventoryOpen, setInventoryOpen] = useState(false)\n  const [reportsOpen, setReportsOpen] = useState(false)\n  const [adminOpen, setAdminOpen] = useState(false)"
    content = re.sub(state_pattern, state_repl, content)

# Add active checks
if "const isReportsActive =" not in content:
    active_pattern = r"const isInventoryActive = pathname\?\.startsWith\('/inventory'\) \|\|[\s\S]*?pathname\?\.startsWith\('/suppliers'\)"
    active_repl = r"""const isInventoryActive = pathname?.startsWith('/inventory') || pathname?.startsWith('/stock-adjustments') || pathname?.startsWith('/outside-purchases') || pathname?.startsWith('/purchase-orders') || pathname?.startsWith('/suppliers')
  const isReportsActive = pathname?.startsWith('/reports')
  const isAdminActive = pathname?.startsWith('/admin')"""
    content = re.sub(active_pattern, active_repl, content)

# Add History to Customer Accounts
if "Service History" not in content:
    cust_pattern = r"(<Car size=\{16\} \/>\n\s+Vehicles\n\s+<\/Link>\n\s+<\/div>)"
    cust_repl = r"""<Car size={16} />
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
          </div>"""
    content = re.sub(cust_pattern, cust_repl, content)

# Remove mb-8 from Inventory
content = content.replace('<div className="mt-2 mb-8">', '<div className="mt-2">')

# Add Reports & Admin to end
new_sections = """      {/* REPORTS */}
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
      </div>"""

if "REPORTS" not in content:
    content = content.replace("    </nav>\n  )", new_sections + "\n    </nav>\n  )")

# Add missing lucide icons
icons_to_add = ["BarChart2", "History", "TrendingUp", "MinusCircle", "DollarSign", "Clock", "Shield", "Building2"]
for icon in icons_to_add:
    if icon not in content:
        content = content.replace("import { ", f"import {{ {icon}, ")

with open('src/components/SidebarNav.tsx', 'w') as f:
    f.write(content)
