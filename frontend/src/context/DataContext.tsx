import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { getAllBins, getLeaderboard, getUserHistory, getUserStats } from '../services/api'
import type { SmartBin, User, WasteLog } from '../types'

interface DataContextValue {
  currentUser: User | null
  bins: SmartBin[]
  logs: WasteLog[]
  leaderboard: User[]
  loading: boolean
  error: string | null
  isAdmin: boolean
  refreshData: () => Promise<void>
  setCurrentUser: (user: User) => void
}

const DataContext = createContext<DataContextValue | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [bins, setBins] = useState<SmartBin[]>([])
  const [logs, setLogs] = useState<WasteLog[]>([])
  const [leaderboard, setLeaderboard] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshData = useCallback(async () => {
    if (!currentUser) return // Skip if user not logged in

    setLoading(true)
    setError(null)

    try {
      // Fetch all data in parallel
      const [statsRes, historyRes, leaderboardRes, binsRes] = await Promise.allSettled([
        getUserStats(currentUser.id ? parseInt(currentUser.id) : 1),
        getUserHistory(currentUser.id ? parseInt(currentUser.id) : 1, 10),
        getLeaderboard(10),
        getAllBins(),
      ])

      // Process user stats
      if (statsRes.status === 'fulfilled' && statsRes.value.user) {
        const userData = statsRes.value.user
        setCurrentUser({
          id: userData.user_id.toString(),
          fullName: userData.full_name,
          username: userData.username,
          rfidUid: currentUser.rfidUid,
          role: userData.role as 'admin' | 'user',
          currentPoints: userData.current_points,
          totalRecycled: userData.total_recycled_items,
          carbonSavedG: userData.carbon_saved_g,
          department: currentUser.department,
        })
      }

      // Process history
      if (historyRes.status === 'fulfilled' && historyRes.value.history) {
        const historyData = historyRes.value.history.map((log) => ({
          id: log.log_id.toString(),
          wasteType: log.waste_type,
          wasteCount: log.waste_count,
          pointsEarned: log.points_earned,
          timestamp: log.timestamp,
        }))
        setLogs(historyData)
      }

      // Process leaderboard
      if (leaderboardRes.status === 'fulfilled' && leaderboardRes.value.leaderboard) {
        const leaderboardData = leaderboardRes.value.leaderboard.map((user) => ({
          id: user.user_id.toString(),
          fullName: user.full_name,
          username: user.username,
          rfidUid: '',
          role: user.role as 'admin' | 'user',
          currentPoints: user.current_points,
          totalRecycled: user.total_recycled_items,
          carbonSavedG: user.carbon_saved_g,
          department: '',
        }))
        setLeaderboard(leaderboardData)
      }

      // Process bins
      if (binsRes.status === 'fulfilled' && binsRes.value.bins) {
        const binsData = binsRes.value.bins.map((bin) => ({
          id: bin.bin_id.toString(),
          name: bin.bin_name,
          location: 'Campus Location',
          maxCapacity: bin.max_capacity,
          currentFillLevel: Math.round((bin.current_fill_level / bin.max_capacity) * 100),
          status: bin.status as 'active' | 'full' | 'maintenance',
          batteryStatus: 85, // Mock battery status
        }))
        setBins(binsData)
      }
    } catch (err) {
      console.error('Error fetching data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }, [currentUser?.id, currentUser?.rfidUid, currentUser?.department])

  // Load data on mount and when user changes
  useEffect(() => {
    refreshData()
  }, [refreshData])

  const value: DataContextValue = {
    currentUser,
    bins,
    logs,
    leaderboard,
    loading,
    error,
    isAdmin: currentUser?.role === 'admin' || false,
    refreshData,
    setCurrentUser,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) {
    throw new Error('useData must be used within DataProvider')
  }
  return ctx
}
