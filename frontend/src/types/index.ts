export type UserRole = 'admin' | 'user'

export interface User {
  id: string
  fullName: string
  username: string
  rfidUid: string
  role: UserRole
  currentPoints: number
  totalRecycled: number
  carbonSavedG: number
  department: string
}

export type SmartBinStatus = 'active' | 'full' | 'maintenance'

export interface SmartBin {
  id: string
  name: string
  location: string
  maxCapacity: number
  currentFillLevel: number
  status: SmartBinStatus
  batteryStatus: number
}

export interface WasteLog {
  id: string
  userId?: string
  wasteType: string
  wasteCount: number
  pointsEarned: number
  imageUrl?: string
  timestamp: string
}
