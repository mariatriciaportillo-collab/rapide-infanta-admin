import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from './login/actions'

export default async function Dashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 text-white flex flex-col fixed inset-y-0 left-0">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            RAPIDÉ
            <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block -translate-y-2"></span>
          </h1>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mt-1">Infanta</p>
        </div>
        
        <nav className="flex-1 py-4 flex flex-col gap-1 px-3">
          <a href="#" className="px-3 py-2 rounded-md bg-slate-700/50 text-white font-medium">Dashboard</a>
          <a href="#" className="px-3 py-2 rounded-md text-slate-300 hover:bg-slate-700 hover:text-white transition font-medium">Labor Lookup</a>
          <a href="#" className="px-3 py-2 rounded-md text-slate-300 hover:bg-slate-700 hover:text-white transition font-medium">Labor</a>
          <a href="#" className="px-3 py-2 rounded-md text-slate-300 hover:bg-slate-700 hover:text-white transition font-medium">Customers</a>
          <a href="#" className="px-3 py-2 rounded-md text-slate-300 hover:bg-slate-700 hover:text-white transition font-medium">Quotations</a>
          <a href="#" className="px-3 py-2 rounded-md text-slate-300 hover:bg-slate-700 hover:text-white transition font-medium">Inventory & Packages</a>
        </nav>
        
        <div className="p-4 border-t border-slate-700">
          <div className="mb-4 px-2">
            <p className="text-xs text-slate-400">Logged in as</p>
            <p className="text-sm font-medium truncate">{user.email}</p>
          </div>
          <form action={logout}>
            <button className="w-full text-left px-3 py-2 rounded-md text-red-400 hover:bg-slate-700 hover:text-red-300 transition font-medium">
              Logout
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-4xl">
          <h2 className="text-3xl font-bold text-slate-800 mb-6">Dashboard</h2>
          
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Welcome to Rapide Infanta Admin</h3>
            <p className="text-slate-600">
              This is the new cleanly structured application. Select a module from the sidebar to begin.
            </p>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                <p className="text-sm font-semibold text-slate-500 uppercase">Total Quotations</p>
                <p className="text-2xl font-bold mt-1">0</p>
              </div>
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                <p className="text-sm font-semibold text-slate-500 uppercase">Customers</p>
                <p className="text-2xl font-bold mt-1">0</p>
              </div>
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                <p className="text-sm font-semibold text-slate-500 uppercase">Active Labor Items</p>
                <p className="text-2xl font-bold mt-1">0</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
