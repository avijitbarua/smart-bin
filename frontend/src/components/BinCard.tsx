import { Battery, MapPin, Wifi } from 'lucide-react'
import type { SmartBin } from '../types'

interface BinCardProps {
  bin: SmartBin
}

const levelColor = (value: number) => {
  if (value < 50) return 'bg-emerald-500'
  if (value < 80) return 'bg-amber-400'
  return 'bg-rose-500'
}

export function BinCard({ bin }: BinCardProps) {
  const barColor = levelColor(bin.currentFillLevel)
  const statusTone =
    bin.status === 'active'
      ? 'text-emerald-600 bg-emerald-50'
      : bin.status === 'full'
        ? 'text-rose-600 bg-rose-50'
        : 'text-amber-600 bg-amber-50'

  return (
    <div className="rounded-2xl border border-slate-100 bg-white/80 shadow-card p-4 space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-900">{bin.name}</p>
          <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
            <MapPin className="h-4 w-4" />
            {bin.location}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusTone}`}>
          {bin.status === 'active' && 'Active'}
          {bin.status === 'full' && 'Full'}
          {bin.status === 'maintenance' && 'Maintenance'}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Fill Level</span>
          <span className="font-semibold text-slate-900">{bin.currentFillLevel}%</span>
        </div>
        <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
          <div
            className={`${barColor} h-full transition-all duration-500`}
            style={{ width: `${bin.currentFillLevel}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <Wifi className="h-4 w-4 text-emerald-500" />
          <span>{bin.maxCapacity} L capacity</span>
        </div>
        <div className="flex items-center gap-2">
          <Battery className="h-4 w-4 text-slate-500" />
          <span className="font-semibold text-slate-900">{bin.batteryStatus}%</span>
        </div>
      </div>
    </div>
  )
}
