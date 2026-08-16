export default function Dashboard() {
  return (
    <div>
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
  )
}
