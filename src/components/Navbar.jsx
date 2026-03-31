import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import logo from '../assets/logo.png'

export default function Navbar({ user, rol }) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <Link to="/clientes" className="navbar-brand">
        <div className="logo-icon">
          <img src={logo} alt="Logo" className="logo-img" />
        </div>
        <span>Sagitarium Gym</span>
      </Link>
      <div className="navbar-right">
        {user && (
          <div className="navbar-user">
            <span>{user.email}</span>
            <span className="role-badge">{rol || 'empleado'}</span>
          </div>
        )}
        <button
          id="logout-btn"
          className="btn btn-ghost btn-sm"
          onClick={handleLogout}
          title="Cerrar sesión"
        >
          ⬅ Salir
        </button>
      </div>
    </nav>
  )
}
