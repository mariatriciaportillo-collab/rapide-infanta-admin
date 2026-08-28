import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '../login/actions'
import Link from 'next/link'
import { SidebarNav } from '@/components/SidebarNav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans print:bg-white print:h-auto">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 text-white flex flex-col fixed inset-y-0 left-0 print:hidden">
        <div className="p-6 border-b border-slate-700">
          <Link href="/" className="block">
            <img src="/rapide-wordmark-clean.png" alt="Rapidé" className="h-8 w-auto object-contain filter brightness-0 invert" />
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mt-1">Infanta</p>
          </Link>
        </div>
        
        <SidebarNav />
        
        <div className="p-4 border-t border-slate-700">
          <div className="mb-4 px-2">
            <p className="text-xs text-slate-400">Logged in as</p>
            <p className="text-sm font-medium truncate" title={user.email}>{user.email}</p>
          </div>
          <form action={logout}>
            <button className="w-full text-left px-3 py-2 rounded-md text-red-400 hover:bg-slate-700 hover:text-red-300 transition font-medium">
              Logout
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto print:ml-0 print:p-0 print:overflow-visible">
        <div className="max-w-6xl mx-auto print:max-w-full">
          {children}
        </div>
      </main>
    </div>
  )
}
