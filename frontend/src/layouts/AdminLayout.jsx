import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function AdminLayout() {
  const { user, signOut } = useApp();
  const nav = useNavigate();

  // Chỉ cho tài khoản admin vào trang quản trị
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  function handleLogout() {
    signOut();
    nav('/login');
  }

  return (
    <div className="admin-layout">

      {/* ===== SIDEBAR ===== */}
      <aside className="admin-sidebar">

        <div className="admin-brand">
          <img
            src="/images/logo_VuonNha.png"
            alt="Vườn Nhà"
            className="admin-logo"
          />
          <div>
            <div className="admin-brand-title">VƯỜN NHÀ</div>
            <div className="admin-brand-subtitle">QUẢN TRỊ</div>
          </div>
        </div>

        <div className="admin-menu-title">
          MENU QUẢN LÝ
        </div>

        <nav className="admin-sidebar-nav">

          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `admin-menu-item ${isActive ? 'active' : ''}`
            }
          >
            <span className="admin-menu-icon">📊</span>
            <span>Tổng quan</span>
          </NavLink>

          <NavLink
            to="/admin/products"
            className={({ isActive }) =>
              `admin-menu-item ${isActive ? 'active' : ''}`
            }
          >
            <span className="admin-menu-icon">📦</span>
            <span>Sản phẩm</span>
          </NavLink>

          <NavLink
            to="/admin/categories"
            className={({ isActive }) =>
              `admin-menu-item ${isActive ? 'active' : ''}`
            }
          >
            <span className="admin-menu-icon">🗂️</span>
            <span>Danh mục</span>
          </NavLink>

          <NavLink
            to="/admin/orders"
            className={({ isActive }) =>
              `admin-menu-item ${isActive ? 'active' : ''}`
            }
          >
            <span className="admin-menu-icon">🛒</span>
            <span>Đơn hàng</span>
          </NavLink>

        </nav>

        <div className="admin-sidebar-bottom">

          <NavLink to="/" className="admin-bottom-item">
            <span>🏠</span>
            <span>Xem cửa hàng</span>
          </NavLink>

          <button
            type="button"
            className="admin-bottom-item admin-logout"
            onClick={handleLogout}
          >
            <span>↪</span>
            <span>Đăng xuất</span>
          </button>

        </div>

      </aside>


      {/* ===== KHU VỰC BÊN PHẢI ===== */}
      <div className="admin-main-area">

        {/* HEADER ADMIN */}
        <header className="admin-topbar">

          <div className="admin-page-title">
            <span>Trang quản trị</span>
          </div>

          <div className="admin-user">

            <div className="admin-user-avatar">
              👤
            </div>

            <div className="admin-user-info">
              <strong>{user.name}</strong>
              <span>Quản trị viên</span>
            </div>

          </div>

        </header>


        {/* NỘI DUNG TỪNG TRANG */}
        <main className="admin-content">
          <Outlet />
        </main>

      </div>

    </div>
  );
}