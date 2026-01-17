import { Navigate, Route, Routes } from 'react-router-dom'
import { useData } from './context/DataContext'
import { DashboardLayout } from './layouts/DashboardLayout'
import { AdminDashboard } from './pages/AdminDashboard'
import { BinStatus } from './pages/BinStatus'
import { History } from './pages/History'
import { Leaderboard } from './pages/Leaderboard'
import { Login } from './pages/Login'
import { StudentDashboard } from './pages/StudentDashboard'
import { UserHistory } from './pages/UserHistory'

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { isAdmin } = useData()
  
  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />
  }
  
  return <>{children}</>
}

function App() {
  const { isAdmin, currentUser } = useData()

  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Routes>
      <Route path="*" element={<Login />} />
    </Routes>
  }

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <DashboardLayout>
            {isAdmin ? <AdminDashboard /> : <StudentDashboard />}
          </DashboardLayout>
        }
      />
      <Route
        path="/leaderboard"
        element={
          <DashboardLayout>
            <Leaderboard />
          </DashboardLayout>
        }
      />
      <Route
        path="/history"
        element={
          <DashboardLayout>
            <History />
          </DashboardLayout>
        }
      />
      <Route
        path="/bins"
        element={
          <DashboardLayout>
            <BinStatus />
          </DashboardLayout>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <DashboardLayout>
              <AdminDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/user/:userId/history"
        element={
          <ProtectedRoute adminOnly>
            <DashboardLayout>
              <UserHistory />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
