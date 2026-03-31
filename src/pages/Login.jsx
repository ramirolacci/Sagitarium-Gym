import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import logo from '../assets/logo.png'

export default function Login() {
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: usuario,
      password,
    })

    if (authError) {
      setError('Usuario o contraseña incorrectos.')
      setLoading(false)
      return
    }

    navigate('/clientes')
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-big">
            <img src={logo} alt="Sagitarium Gym" className="logo-img" />
          </div>
          <h1>Sagitarium Gym</h1>
          <p>Sistema de Gestión</p>
        </div>

        {error && (
          <div className="error-msg">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Usuario</label>
            <input
              id="login-email"
              type="text"
              className="form-input"
              placeholder="Ingresa tu usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary login-btn"
            disabled={loading}
          >
            {loading ? <><span className="spinner"></span> Ingresando...</> : '→ Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  )
}
