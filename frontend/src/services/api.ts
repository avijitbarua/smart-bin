/**
 * API Service for BARAQA_BIN Frontend
 * Handles all communication with Flask backend
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'


class ApiError extends Error {
  statusCode?: number

  constructor(message: string, statusCode?: number) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
  }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new ApiError(data.error || data.message || 'Request failed', response.status)
    }

    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(error instanceof Error ? error.message : 'Network error')
  }
}

// ═════════════════════════════════════════════════════════════════
// Authentication API
// ═════════════════════════════════════════════════════════════════

export async function login(username: string, password: string) {
  return fetchApi<{
    status: string
    user: {
      user_id: number
      full_name: string
      username: string
      role: string
      current_points: number
    }
  }>('/api/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

export async function register(data: {
  full_name: string
  username: string
  password: string
  rfid_uid: string
}) {
  return fetchApi<{
    status: string
    message: string
    user_id: number
  }>('/api/register', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// ═════════════════════════════════════════════════════════════════
// User API
// ═════════════════════════════════════════════════════════════════

export async function getUserStats(userId: number) {
  return fetchApi<{
    status: string
    user: {
      user_id: number
      full_name: string
      username: string
      current_points: number
      total_recycled_items: number
      carbon_saved_g: number
      role: string
    }
  }>(`/api/user/${userId}/stats`)
}

export async function getUserHistory(userId: number, limit: number = 10) {
  return fetchApi<{
    status: string
    history: Array<{
      log_id: number
      user_id: number
      waste_type: string
      waste_count: number
      points_earned: number
      image_url?: string
      timestamp: string
    }>
  }>(`/api/user/${userId}/history?limit=${limit}`)
}

// ═════════════════════════════════════════════════════════════════
// Leaderboard API
// ═════════════════════════════════════════════════════════════════

export async function getLeaderboard(limit: number = 10) {
  return fetchApi<{
    status: string
    leaderboard: Array<{
      user_id: number
      full_name: string
      username: string
      current_points: number
      total_recycled_items: number
      carbon_saved_g: number
      role: string
    }>
  }>(`/api/leaderboard?limit=${limit}`)
}

// ═════════════════════════════════════════════════════════════════
// Admin API
// ═════════════════════════════════════════════════════════════════

export async function getAllBins() {
  return fetchApi<{
    status: string
    bins: Array<{
      bin_id: number
      bin_name: string
      max_capacity: number
      current_fill_level: number
      status: string
      created_at: string
    }>
  }>('/api/admin/bins')
}

export async function resetBin(binId: number) {
  return fetchApi<{
    status: string
    message: string
  }>('/api/admin/reset-bin', {
    method: 'POST',
    body: JSON.stringify({ bin_id: binId }),
  })
}

export async function getAdminRecentLogs(limit: number = 20) {
  return fetchApi<{
    status: string
    logs: Array<{
      log_id: number
      user_id: number
      user_name: string
      waste_type: string
      waste_count: number
      points_earned: number
      image_url?: string
      timestamp: string
    }>
  }>(`/api/admin/recent-logs?limit=${limit}`)
}

// ═════════════════════════════════════════════════════════════════
// Utility Functions
// ═════════════════════════════════════════════════════════════════

export function getApiBaseUrl(): string {
  return API_BASE_URL
}

export { ApiError }
