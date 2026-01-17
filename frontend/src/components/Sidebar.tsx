import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  BadgeCheck,
  History,
  LayoutDashboard,
  ShieldCheck,
  Trash2,
  Trophy,
} from 'lucide-react'
import { useData } from '../context/DataContext'

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'user'] },
  { label: 'Leaderboard', path: '/leaderboard', icon: Trophy, roles: ['admin', 'user'] },
  { label: 'History', path: '/history', icon: History, roles: ['admin', 'user'] },
  { label: 'Bin Status', path: '/bins', icon: Trash2, roles: ['admin', 'user'] },
  { label: 'Admin Panel', path: '/admin', icon: ShieldCheck, roles: ['admin'] },
]

export function Sidebar() {
  const location = useLocation()
  const { isAdmin } = useData()
  const [open, setOpen] = useState(true)

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(isAdmin ? 'admin' : 'user'),
  )

  return (
    <aside
      className={`relative h-full transition-[width] duration-300 bg-white/90 backdrop-blur border-r border-slate-200 shadow-sm ${open ? 'w-64' : 'w-20'} hidden md:flex flex-col`}
    >
      <div className="flex items-center justify-between px-4 py-5 border-b border-slate-100">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-semibold">
            BB
          </div>
          {open && (
            <div className="flex flex-col leading-tight">
              <span className="text-xs text-slate-500">Smart Waste</span>
              <span className="text-base font-semibold text-slate-900">BARAQA_BIN</span>
            </div>
          )}
        </Link>
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="hidden rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-emerald-200 hover:text-emerald-600 md:inline-flex"
          aria-label="Toggle sidebar"
        >
          <BadgeCheck className={`h-4 w-4 transition ${open ? 'rotate-0' : '-rotate-90'}`} />
        </button>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1">
        {filteredNavItems.map(({ label, path, icon: Icon }) => {
          const active = location.pathname === path
          return (
            <Link
              key={path}
              to={path}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                active
                  ? 'bg-emerald-50 text-emerald-700 shadow-soft'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-emerald-700'
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? 'text-emerald-600' : 'text-slate-400 group-hover:text-emerald-600'}`} />
              {open && <span>{label}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="px-4 pb-6">
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/80 p-3 text-sm text-emerald-700">
          <p className="font-semibold">Eco Impact</p>
          <p className="text-xs text-emerald-800/80 mt-1">Keep bins under 50% to reduce overflow.</p>
        </div>
      </div>
    </aside>
  )
}
