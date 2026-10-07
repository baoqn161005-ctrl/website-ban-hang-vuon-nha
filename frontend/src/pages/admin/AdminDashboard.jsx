import { useEffect, useState } from 'react';
import { money } from '../../services/api';
import * as admin from '../../services/adminService';

export default function AdminDashboard() {
  const [s, setS] = useState(null);

  useEffect(() => {
    admin.stats()
      .then(setS)
      .catch(() => {});
  }, []);

  if (!s) {
    return (
      <div className="admin-loading">
        Đang tải dữ liệu quản trị...
      </div>
    );
  }

  return (
    <div className="dashboard">

      {/* Tiêu đề */}
      <div className="dashboard-header">
        <div>
          <h1>Tổng quan</h1>
          <p>Chào mừng bạn đến với trang quản trị Vườn Nhà.</p>
        </div>
      </div>


      {/* Các thẻ thống kê */}
      <div className="dashboard-stats">

        {/* Sản phẩm */}
        <div className="dashboard-card">
          <div className="dashboard-card-icon green">
            📦
          </div>

          <div className="dashboard-card-info">
            <span>Tổng sản phẩm</span>
            <strong>{s.products}</strong>
          </div>
        </div>


        {/* Danh mục */}
        <div className="dashboard-card">
          <div className="dashboard-card-icon blue">
            🗂️
          </div>

          <div className="dashboard-card-info">
            <span>Tổng danh mục</span>
            <strong>{s.categories}</strong>
          </div>
        </div>


        {/* Sản phẩm sắp hết */}
        <div className="dashboard-card">
          <div className="dashboard-card-icon orange">
            ⚠️
          </div>

          <div className="dashboard-card-info">
            <span>Sắp hết hàng</span>
            <strong className={s.low > 0 ? 'danger-text' : ''}>
              {s.low}
            </strong>
            <small>Sản phẩm có số lượng ≤ 5</small>
          </div>
        </div>


        {/* Đơn hàng */}
        <div className="dashboard-card">
          <div className="dashboard-card-icon purple">
            🛒
          </div>

          <div className="dashboard-card-info">
            <span>Tổng đơn hàng</span>
            <strong>{s.orders}</strong>
            <small>{s.pending} đơn chờ xác nhận</small>
          </div>
        </div>


        {/* Doanh thu */}
        <div className="dashboard-card revenue-card">
          <div className="dashboard-card-icon green">
            💰
          </div>

          <div className="dashboard-card-info">
            <span>Doanh thu</span>
            <strong>{money(s.revenue)}</strong>
            <small>Đơn hàng đã hoàn thành</small>
          </div>
        </div>

      </div>


      {/* Thông tin nhanh */}
      <div className="dashboard-section">

        <div className="dashboard-section-title">
          <h2>Thông tin nhanh</h2>
        </div>

        <div className="dashboard-quick-grid">

          <div className="dashboard-quick-box">
            <span className="quick-icon">📦</span>
            <div>
              <strong>{s.products}</strong>
              <p>Sản phẩm đang quản lý</p>
            </div>
          </div>

          <div className="dashboard-quick-box">
            <span className="quick-icon">⚠️</span>
            <div>
              <strong className={s.low > 0 ? 'danger-text' : ''}>
                {s.low}
              </strong>
              <p>Sản phẩm cần kiểm tra tồn kho</p>
            </div>
          </div>

          <div className="dashboard-quick-box">
            <span className="quick-icon">🛒</span>
            <div>
              <strong>{s.pending}</strong>
              <p>Đơn hàng đang chờ xác nhận</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}