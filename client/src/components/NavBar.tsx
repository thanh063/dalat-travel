import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function NavBar() {
  const { user, logout } = useAuth();

  return (
    <div className="navbar bg-base-100 shadow-sm">
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost text-xl">Đà Lạt Travel</Link>
        <NavLink to="/places" className="btn btn-ghost">Địa điểm</NavLink>

        {user?.role === 'ADMIN' && (
          <div className="dropdown dropdown-hover">
            <div tabIndex={0} role="button" className="btn btn-ghost">Admin</div>
            <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
              <li><NavLink to="/admin/dashboard">Dashboard</NavLink></li>
              <li><NavLink to="/admin/places">Quản lý địa điểm</NavLink></li>
            </ul>
          </div>
        )}
      </div>

      <div className="flex-none gap-2">
        {user ? (
          <div className="flex items-center gap-2">
            <span className="badge badge-outline">{user.role}</span>
            <span>{user.fullName}</span>
            <button className="btn btn-sm" onClick={logout}>Đăng xuất</button>
          </div>
        ) : (
          <div className="flex gap-2">
            <NavLink to="/login" className="btn btn-sm">Đăng nhập</NavLink>
            <NavLink to="/register" className="btn btn-sm btn-primary">Đăng ký</NavLink>
          </div>
        )}
      </div>
    </div>
  );
}
