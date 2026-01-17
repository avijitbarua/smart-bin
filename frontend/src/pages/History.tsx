import { Calendar, ExternalLink, Image as ImageIcon, Package } from 'lucide-react'
import { useData } from '../context/DataContext'

export function History() {
  const { logs, isAdmin } = useData()
  const sorted = [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-600 font-semibold">
          {isAdmin ? 'Admin' : 'My'} History
        </p>
        <h2 className="text-2xl font-semibold text-slate-900">Recycling timeline</h2>
        <p className="text-sm text-slate-500">Complete log of waste disposals with images.</p>
      </div>

      <div className="grid gap-4">
        {sorted.map((log) => (
          <div
            key={log.id}
            className="rounded-2xl border border-slate-100 bg-white/90 shadow-card p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start gap-4">
              {/* Image Preview */}
              <div className="flex-shrink-0">
                {log.imageUrl ? (
                  <div className="w-24 h-24 rounded-xl bg-emerald-50 border border-emerald-100 overflow-hidden">
                    <img
                      src={log.imageUrl}
                      alt={log.wasteType}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement
                        target.style.display = 'none'
                        const parent = target.parentElement
                        if (parent) {
                          parent.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="h-8 w-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg></div>'
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                    <Package className="h-8 w-8 text-slate-400" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{log.wasteType}</h3>
                    <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(log.timestamp).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-600">+{log.pointsEarned}</div>
                    <div className="text-xs text-slate-500">points</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50">
                    <Package className="h-4 w-4 text-slate-500" />
                    <span className="font-medium text-slate-700">{log.wasteCount} items</span>
                  </div>
                  <a
                    href="#"
                    className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Details
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}

        {sorted.length === 0 && (
          <div className="rounded-2xl border border-slate-100 bg-white/90 shadow-card p-12 text-center">
            <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No history yet</h3>
            <p className="text-sm text-slate-500">
              Start recycling to see your impact here!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
