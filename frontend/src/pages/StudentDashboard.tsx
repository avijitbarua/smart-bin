import { ArrowUpRight, Leaf, Recycle, RefreshCw, Sparkles } from 'lucide-react'
import { BinCard } from '../components/BinCard'
import { StatCard } from '../components/StatCard'
import { useData } from '../context/DataContext'

export function StudentDashboard() {
  const { currentUser, logs, bins, loading, error, refreshData } = useData()

  if (!currentUser) {
    return <div className="text-center py-10 text-slate-500">Loading user data...</div>
  }

  const totalItems = logs.reduce((sum, log) => sum + log.wasteCount, 0)
  const carbonSavedKg = (currentUser.carbonSavedG / 1000).toFixed(2)

  const recentLogs = [...logs]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5)

  const impactByType = logs.reduce<Record<string, number>>((acc, log) => {
    acc[log.wasteType] = (acc[log.wasteType] || 0) + log.pointsEarned
    return acc
  }, {})

  const impactEntries = Object.entries(impactByType)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-600 font-semibold">Student view</p>
          <h2 className="text-2xl font-semibold text-slate-900">Welcome back, {currentUser.fullName.split(' ')[0]}</h2>
          <p className="text-sm text-slate-500">Track your recycling streak and see bin health in real time.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refreshData}
            disabled={loading}
            className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 hover:border-emerald-200 hover:text-emerald-600 disabled:opacity-50"
            aria-label="Refresh data"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <div className="hidden md:flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-3 py-2 text-sm text-emerald-700 shadow-soft">
            <Sparkles className="h-4 w-4" />
            Green streak active
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Current Points"
          value={`${currentUser.currentPoints.toLocaleString()} pts`}
          helper="+120 pts this week"
          icon={<Sparkles className="h-6 w-6" />}
        />
        <StatCard
          label="Total Items Recycled"
          value={`${totalItems} items`}
          helper="Keep a 5-day streak"
          icon={<Recycle className="h-6 w-6" />}
        />
        <StatCard
          label="Carbon Saved"
          value={`${carbonSavedKg} kg`}
          helper="Equivalent to 42 trees"
          icon={<Leaf className="h-6 w-6" />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white/90 shadow-card p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
              <p className="text-sm text-slate-500">Last 5 items recycled</p>
            </div>
            <button className="text-sm text-emerald-700 font-semibold inline-flex items-center gap-1">
              View all
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-100 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 text-left">Waste Type</th>
                  <th className="px-4 py-3 text-left">Count</th>
                  <th className="px-4 py-3 text-left">Points</th>
                  <th className="px-4 py-3 text-left">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.map((log) => (
                  <tr key={log.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-900">{log.wasteType}</td>
                    <td className="px-4 py-3 text-slate-600">{log.wasteCount}</td>
                    <td className="px-4 py-3 text-emerald-700 font-semibold">{log.pointsEarned}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(log.timestamp).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-card p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm uppercase tracking-wide text-white/80">Impact</p>
              <h3 className="text-xl font-semibold">Points by Waste Type</h3>
              <p className="text-sm text-white/80">Your contributions across materials</p>
            </div>
            <div className="rounded-xl bg-white/15 px-3 py-2 text-xs font-semibold">Live</div>
          </div>

          <div className="mt-6 space-y-3">
            {impactEntries.map(([type, points]) => (
              <div key={type} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold">{type}</span>
                  <span className="text-white/80">{points} pts</span>
                </div>
                <div className="h-2 rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-white"
                    style={{ width: `${Math.min(points / 2, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl bg-white/10 p-3 text-sm">
            <p className="font-semibold">Eco Tip</p>
            <p className="text-white/85">
              Rinse plastic bottles before recycling to improve processing efficiency.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white/90 shadow-card p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Nearby Smart Bins</h3>
            <p className="text-sm text-slate-500">Live levels and battery health</p>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
            IoT sync active
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {bins.map((bin) => (
            <BinCard key={bin.id} bin={bin} />
          ))}
        </div>
      </div>
    </div>
  )
}
