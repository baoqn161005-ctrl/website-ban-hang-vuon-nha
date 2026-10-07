import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Header() {
  const { user, signOut, cartCount } = useApp();
  const nav = useNavigate();

  function handleLogout(e) {
    e.preventDefault();
    signOut();
    nav('/');
  }

  return (
    <header className="site-header">

      {/* Logo */}
      <Link className="header-logo" to="/">
        <img
            src="/images/logo_VuonNha.png"
            alt="Vườn Nhà"
            className="auth-logo"
          />
        <span>Vườn Nhà</span>
      </Link>

      {/* Menu */}
      <nav className="header-nav">

        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? 'header-link active' : 'header-link'
          }
        >
          Trang chủ
        </NavLink>

        <NavLink
          to="/products"
          className={({ isActive }) =>
            isActive ? 'header-link active' : 'header-link'
          }
        >
          Sản phẩm
        </NavLink>

        {/* Giỏ hàng */}
        <NavLink
          to="/cart"
          className={({ isActive }) =>
            isActive
              ? 'header-link cart-link active'
              : 'header-link cart-link'
          }
        >
          <span className="cart-icon">🛒</span>
          <span>Giỏ hàng</span>

          {cartCount > 0 && (
            <span className="cart-badge">
              {cartCount}
            </span>
          )}
        </NavLink>

        <NavLink
          to="/orders"
          className={({ isActive }) =>
            isActive ? 'header-link active' : 'header-link'
          }
        >
          Đơn hàng
        </NavLink>

        {user?.role === 'admin' && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              isActive
                ? 'header-link admin-link active'
                : 'header-link admin-link'
            }
          >
            ⚙ Quản trị
          </NavLink>
        )}

      </nav>

      {/* Khu vực tài khoản */}
      <div className="header-account">

        {user ? (
          <>
            <span className="user-info">
              <span className="user-icon">👤</span>
              <span className="user-name">
                {user.name}
              </span>
            </span>

            <a
              href="#"
              className="logout-btn"
              onClick={handleLogout}
            >
              Thoát
            </a>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="login-btn"
            >
              Đăng nhập
            </Link>

            <Link
              to="/register"
              className="register-btn"
            >
              Đăng ký
            </Link>
          </>
        )}

      </div>

    </header>
  );
}