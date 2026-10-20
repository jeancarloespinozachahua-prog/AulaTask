import { Link, NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link className="brand" to="/" aria-label="Sistema de usuarios, inicio">
        <span className="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM20 8v6m3-3h-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="brand-copy">
          <strong>Usuarios</strong>
          <small>Panel de administración</small>
        </span>
      </Link>
      <div className="nav-links">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Registrar</NavLink>
        <NavLink to="/usuarios" className={({ isActive }) => isActive ? 'active' : ''}>Directorio</NavLink>
      </div>
    </nav>
  );
}
