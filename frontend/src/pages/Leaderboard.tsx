import { Crown, Medal, TrendingUp } from 'lucide-react'
import { useData } from '../context/DataContext'

const medalColors = ['bg-amber-100 text-amber-700', 'bg-slate-100 text-slate-700', 'bg-amber-50 text-amber-600']

export function Leaderboard() {
  const { leaderboard } = useData()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-600 font-semibold">Leaderboard</p>
          <h2 className="text-2xl font-semibold text-slate-900">Top recyclers</h2>
          <p className="text-sm text-slate-500">Students ranked by lifetime points.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 rounded-full bg-emerald-50 text-emerald-700 px-3 py-2 text-sm font-semibold">
          <TrendingUp className="h-4 w-4" />
          Weekly challenge live
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white/90 shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left">Rank</th>
              <th className="px-4 py-3 text-left">Student</th>
              <th className="px-4 py-3 text-left">Department</th>
              <th className="px-4 py-3 text-left">Points</th>
              <th className="px-4 py-3 text-left">Total Items</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((user, index) => {
              const color = medalColors[index] || 'bg-slate-100 text-slate-700'
              return (
                <tr key={user.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    {index < 3 ? (
                      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${color}`}>
                        {index === 0 && <Crown className="h-4 w-4" />}
                        {index === 1 && <Medal className="h-4 w-4" />}
                        {index === 2 && <Medal className="h-4 w-4" />}
                        #{index + 1}
                      </span>
                    ) : (
                      <span className="text-slate-500 font-semibold">#{index + 1}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{user.fullName}</td>
                  <td className="px-4 py-3 text-slate-600">{user.department}</td>
                  <td className="px-4 py-3 text-emerald-700 font-semibold">{user.currentPoints.toLocaleString()}</td>
                  <td className="px-4 py-3 text-slate-600">{user.totalRecycled}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
