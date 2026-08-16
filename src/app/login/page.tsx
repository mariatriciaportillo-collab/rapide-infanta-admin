import { login } from './actions'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md border-t-4 border-yellow-400">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">RAPIDÉ</h1>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mt-1">Infanta</p>
          <h2 className="text-xl font-medium text-slate-700 mt-6">Admin Login</h2>
        </div>

        <form action={login} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition"
              placeholder="admin@rapide.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition"
            />
          </div>

          {searchParams?.error && (
            <div className="text-red-500 text-sm font-medium text-center bg-red-50 py-2 rounded">
              {searchParams.error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-slate-800 text-white font-semibold py-2.5 rounded-md hover:bg-slate-700 transition active:scale-[0.98]"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  )
}
