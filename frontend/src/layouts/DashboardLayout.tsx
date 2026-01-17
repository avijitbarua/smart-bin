import { Menu, Search, UserRound } from 'lucide-react'
import type { ReactNode } from 'react'
import { Sidebar } from '../components/Sidebar'
import { useData } from '../context/DataContext'

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { currentUser } = useData()

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-20 backdrop-blur bg-white/80 border-b border-slate-100">
          <div className="flex items-center justify-between px-4 md:px-8 py-4">
            <div className="flex items-center gap-3">
              <button className="md:hidden rounded-lg border border-slate-200 p-2 text-slate-600" aria-label="Open navigation">
                <Menu className="h-5 w-5" />
              </button>
              <div className="relative hidden md:block">
                <input
                  type="text"
                  placeholder="Search bins, users, activity..."
                  className="w-72 rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">{currentUser?.fullName || 'User'}</p>
                <p className="text-xs text-slate-500">{currentUser?.department || 'Loading...'}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-semibold">
                <UserRound className="h-5 w-5" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 md:px-8 py-6 md:py-8 bg-gradient-to-b from-white to-slate-50/60">
          <div className="mx-auto max-w-6xl space-y-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
