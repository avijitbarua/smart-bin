import { Zap } from 'lucide-react'
import { BinCard } from '../components/BinCard'
import { useData } from '../context/DataContext'

export function BinStatus() {
  const { bins } = useData()
  const active = bins.filter((b) => b.status === 'active').length
  const full = bins.filter((b) => b.status === 'full').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-600 font-semibold">Smart bins</p>
          <h2 className="text-2xl font-semibold text-slate-900">Live bin monitoring</h2>
          <p className="text-sm text-slate-500">Capacity, status, and battery health.</p>
        </div>
        <div className="hidden md:inline-flex items-center gap-2 rounded-full bg-emerald-50 text-emerald-700 px-3 py-2 text-sm font-semibold">
          <Zap className="h-4 w-4" />
          IoT network synced
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white/90 shadow-card p-4">
          <p className="text-sm text-slate-500">Active bins</p>
          <p className="text-3xl font-semibold text-slate-900">{active}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white/90 shadow-card p-4">
          <p className="text-sm text-slate-500">Full bins</p>
          <p className="text-3xl font-semibold text-rose-600">{full}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white/90 shadow-card p-4">
          <p className="text-sm text-slate-500">Total network</p>
          <p className="text-3xl font-semibold text-slate-900">{bins.length}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {bins.map((bin) => (
          <BinCard key={bin.id} bin={bin} />
        ))}
      </div>
    </div>
  )
}
