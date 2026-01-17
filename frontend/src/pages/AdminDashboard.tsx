import { Activity, BarChart3, RefreshCw, ShieldCheck, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { BinCard } from '../components/BinCard'
import { StatCard } from '../components/StatCard'
import { useData } from '../context/DataContext'
import { resetBin } from '../services/api'

export function AdminDashboard() {
  const { bins, leaderboard, logs, loading, error, refreshData } = useData()
  const [resetting, setResetting] = useState<string | null>(null)

  const totalUsage = logs.reduce((sum, log) => sum + log.wasteCount, 0)
  const activeBins = bins.filter((b) => b.status === 'active').length
  const fullBins = bins.filter((b) => b.status === 'full').length

  const handleResetBin = async (binId: string) => {
    if (!confirm('Are you sure you want to reset this bin? This will set fill level to 0.')) {
      return
    }

    setResetting(binId)
    try {
      await resetBin(parseInt(binId))
      await refreshData()
      alert('Bin reset successfully!')
    } catch (err) {
      alert('Failed to reset bin: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setResetting(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-600 font-semibold">Admin view</p>
          <h2 className="text-2xl font-semibold text-slate-900">System Control Panel</h2>
          <p className="text-sm text-slate-500">Monitor system health, bins, and user activity.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refreshData}
            disabled={loading}
            className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 hover:border-emerald-200 hover:text-emerald-600 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <div className="hidden md:flex items-center gap-2 rounded-full bg-emerald-50 text-emerald-700 px-3 py-2 text-sm font-semibold">
            <ShieldCheck className="h-4 w-4" />
            Admin Mode
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="Total Disposals"
          value={`${totalUsage}`}
          helper="All time"
          icon={<Activity className="h-6 w-6" />}
        />
        <StatCard
          label="Active Bins"
          value={`${activeBins}`}
          helper={`${bins.length} total`}
          icon={<BarChart3 className="h-6 w-6" />}
        />
        <StatCard
          label="Full Bins"
          value={`${fullBins}`}
          helper="Need emptying"
          icon={<Trash2 className="h-6 w-6" />}
        />
        <StatCard
          label="Registered Users"
          value={`${leaderboard.length}`}
          helper="Active students"
          icon={<ShieldCheck className="h-6 w-6" />}
        />
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white/90 shadow-card p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Smart Bin Management</h3>
            <p className="text-sm text-slate-500">Monitor fill levels and reset bins after emptying.</p>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
            Live sync
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {bins.map((bin) => (
            <div key={bin.id} className="space-y-2">
              <BinCard bin={bin} />
              <button
                onClick={() => handleResetBin(bin.id)}
                disabled={resetting === bin.id}
                className="w-full rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-50 transition"
              >
                {resetting === bin.id ? 'Resetting...' : 'Reset Bin'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white/90 shadow-card p-4">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent System Activity</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left">Timestamp</th>
                <th className="px-4 py-3 text-left">Waste Type</th>
                <th className="px-4 py-3 text-left">Count</th>
                <th className="px-4 py-3 text-left">Points</th>
              </tr>
            </thead>
            <tbody>
              {logs.slice(0, 10).map((log) => (
                <tr key={log.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(log.timestamp).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">{log.wasteType}</td>
                  <td className="px-4 py-3 text-slate-600">{log.wasteCount}</td>
                  <td className="px-4 py-3 text-emerald-700 font-semibold">{log.pointsEarned}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
