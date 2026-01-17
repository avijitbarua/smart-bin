import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string
  helper?: string
  icon: ReactNode
}

export function StatCard({ label, value, helper, icon }: StatCardProps) {
  return (
    <div className="rounded-2xl bg-white/90 backdrop-blur border border-slate-100 shadow-card px-4 py-5 flex items-start gap-3">
      <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-sm text-slate-500">{label}</span>
        <span className="text-2xl font-semibold text-slate-900">{value}</span>
        {helper && <span className="text-xs text-emerald-600 mt-1">{helper}</span>}
      </div>
    </div>
  )
}
