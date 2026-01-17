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
  logout: () => void
}

const DataContext = createContext<DataContextValue | undefined>(undefined)

const SESSION_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds
const STORAGE_KEY = 'baraqa_bin_user'
const SESSION_KEY = 'baraqa_bin_session'

// Load user from localStorage if session is valid
function loadUserFromStorage(): User | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const session = localStorage.getItem(SESSION_KEY)
    
    if (!stored || !session) return null
    
    const loginTime = parseInt(session, 10)
    const now = Date.now()
    
    // Check if session expired
    if (now - loginTime > SESSION_DURATION) {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(SESSION_KEY)
      return null
    }
    
    return JSON.parse(stored) as User
  } catch {
    return null
  }
}

// Save user to localStorage
function saveUserToStorage(user: User): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    localStorage.setItem(SESSION_KEY, Date.now().toString())
  } catch {
    console.error('Failed to save user to localStorage')
  }
}

// Clear user from localStorage
function clearUserFromStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(SESSION_KEY)
  } catch {
    console.error('Failed to clear user from localStorage')
  }
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<User | null>(() => loadUserFromStorage())
  const [bins, setBins] = useState<SmartBin[]>([])
  const [logs, setLogs] = useState<WasteLog[]>([])
  const [leaderboard, setLeaderboard] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Wrapper for setCurrentUser that also saves to localStorage
  const setCurrentUser = (user: User) => {
    setCurrentUserState(user)
    saveUserToStorage(user)
  }

  // Logout function
  const logout = () => {
    setCurrentUserState(null)
    setBins([])
    setLogs([])
    setLeaderboard([])
    clearUserFromStorage()
  }

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
        const updatedUser = {
          id: userData.user_id.toString(),
          fullName: userData.full_name,
          username: userData.username,
          rfidUid: currentUser.rfidUid,
          role: userData.role as 'admin' | 'user',
          currentPoints: userData.current_points,
          totalRecycled: userData.total_recycled_items,
          carbonSavedG: userData.carbon_saved_g,
          department: currentUser.department,
        }
        setCurrentUserState(updatedUser)
        saveUserToStorage(updatedUser)
      }

      // Process history
      if (historyRes.status === 'fulfilled' && historyRes.value.history) {
        const historyData = historyRes.value.history.map((log) => ({
          id: log.log_id.toString(),
          userId: log.user_id?.toString(),
          wasteType: log.waste_type,
          wasteCount: log.waste_count,
          pointsEarned: log.points_earned,
          imageUrl: log.image_url || undefined,
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

  // Auto-refresh every 30 seconds when user is logged in
  useEffect(() => {
    if (!currentUser) return

    const interval = setInterval(() => {
      refreshData()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [currentUser, refreshData])

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
    logout,
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
