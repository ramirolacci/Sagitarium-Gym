import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabase'
import Login from './pages/Login'
import Clientes from './pages/Clientes'

function ProtectedRoute({ children, user }) {
  if (user === undefined) {
    return (
      <div className="loading-page">
        <span className="spinner" style={{ borderTopColor: 'var(--accent)', width: 28, height: 28 }}></span>
        <span>Verificando sesión...</span>
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const [user, setUser] = useState(undefined)
  const [rol, setRol] = useState('')

  useEffect(() => {
    // Fallback: if Supabase doesn't reply in 3s (e.g. bad credentials), show login
    const timeout = setTimeout(() => {
      setUser(prev => prev === undefined ? null : prev)
    }, 3000)

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        clearTimeout(timeout)
        setUser(session?.user ?? null)
        setRol(session?.user?.user_metadata?.rol ?? 'empleado')
      })
      .catch(() => {
        clearTimeout(timeout)
        setUser(null)
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setRol(session?.user?.user_metadata?.rol ?? 'empleado')
    })

    return () => {
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/clientes" replace /> : <Login />}
        />
        <Route
          path="/clientes"
          element={
            <ProtectedRoute user={user}>
              <Clientes user={user} rol={rol} />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/clientes" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
