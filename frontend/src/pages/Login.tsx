import { LogIn, ShieldCheck } from 'lucide-react'
import type { FormEvent } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/api'
import { useData } from '../context/DataContext'

export function Login() {
  const navigate = useNavigate()
  const { setCurrentUser } = useData()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const username = formData.get('username') as string
    const password = formData.get('password') as string

    try {
      const response = await login(username, password)
      
      if (response.status === 'success' && response.user) {
        // Update current user in context
        setCurrentUser({
          id: response.user.user_id.toString(),
          fullName: response.user.full_name,
          username: response.user.username,
          rfidUid: '',
          role: response.user.role as 'admin' | 'user',
          currentPoints: response.user.current_points,
          totalRecycled: 0,
          carbonSavedG: 0,
          department: '',
        })
        
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-slate-50 px-4">
      <div className="relative max-w-md w-full">
        <div className="absolute inset-0 -z-10 blur-3xl bg-gradient-to-br from-emerald-200/40 to-emerald-500/30 opacity-60 rounded-3xl" />
        <div className="rounded-3xl border border-emerald-100 bg-white/90 backdrop-blur shadow-card p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-600 font-semibold">BARAQA_BIN</p>
              <h1 className="text-2xl font-semibold text-slate-900">Smart Waste Management</h1>
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            Sign in to track recycling impact, monitor smart bins, and climb the leaderboard.
          </p>

          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Username</label>
              <input
                required
                type="text"
                name="username"
                placeholder="Enter username"
                disabled={loading}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:opacity-50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Password</label>
              <input
                required
                type="password"
                name="password"
                placeholder="••••••••"
                disabled={loading}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:opacity-50"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-white font-semibold shadow-soft hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogIn className="h-5 w-5" />
              {loading ? 'Signing in...' : 'Continue'}
            </button>
          </form>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>RFID-enabled access ready.</span>
            <span className="font-semibold text-emerald-600">Eco-first campus</span>
          </div>
        </div>
      </div>
    </div>
  )
}
