import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { admin, logout } = useAuth();

  return (
    <div>
      <nav className="navbar navbar-expand navbar-dark bg-dark px-3">
        <span className="navbar-brand">CONECTOR</span>
        <div className="navbar-nav me-auto">
          <NavLink to="/barrios" className="nav-link">Barrios</NavLink>
          <NavLink to="/asociaciones" className="nav-link">Asociaciones DNI</NavLink>
        </div>
        <div className="d-flex align-items-center gap-3">
          <span className="text-white-50 small">{admin?.email}</span>
          <button className="btn btn-outline-light btn-sm" onClick={logout}>Salir</button>
        </div>
      </nav>
      <div className="container py-4">
        <Outlet />
      </div>
    </div>
  );
}
