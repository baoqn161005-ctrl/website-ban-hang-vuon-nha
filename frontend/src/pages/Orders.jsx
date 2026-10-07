import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { money } from '../services/api';
import * as orderService from '../services/orderService';

export function PayTag({ o }) {
  if (o.pay_status === 'paid') {
    return (
      <span className="order-payment-tag paid">
        Đã thanh toán
      </span>
    );
  }

  if (o.pay === 'cod' || o.status === 'Đã hủy') {
    return null;
  }

  return (
    <span className="order-payment-tag unpaid">
      Chưa thanh toán
    </span>
  );
}

export default function Orders() {
  const { user, notify } = useApp();
  const [list, setList] = useState(null);

  const load = useCallback(() => {
    return orderService
      .mine()
      .then(setList)
      .catch(e => notify(e.message));
  }, [notify]);

  useEffect(() => {
    if (user) {
      load();
    }
  }, [user, load]);

  async function cancel(id) {
    try {
      await orderService.cancel(id);
      await load();
    } catch (e) {
      notify(e.message);
    }
  }

  // Chưa đăng nhập
  if (!user) {
    return (
      <div className="orders-page">
        <div className="orders-header">
          <h1>Đơn hàng của tôi</h1>
          <p>
            Đăng nhập để xem và theo dõi các đơn hàng của bạn.
          </p>
        </div>

        <div className="orders-login-box">
          <div className="orders-empty-icon">📦</div>

          <h3>Bạn chưa đăng nhập</h3>

          <p>
            Vui lòng đăng nhập để xem lịch sử đơn hàng.
          </p>

          <Link
            to="/login"
            state={{ from: '/orders' }}
            className="orders-primary-btn"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  // Loading
  if (!list) {
    return (
      <div className="orders-page">
        <div className="orders-header">
          <h1>Đơn hàng của tôi</h1>
          <p>Đang tải thông tin đơn hàng...</p>
        </div>

        <div className="orders-loading">
          <div className="orders-loading-spinner"></div>
          <p>Đang tải đơn hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-header">
        <div>
          <h1>Đơn hàng của tôi</h1>
          <p>
            Theo dõi các đơn hàng bạn đã đặt tại Vườn Nhà.
          </p>
        </div>

        <span className="orders-count">
          {list.length} đơn hàng
        </span>
      </div>

      {list.length > 0 ? (
        <div className="orders-list">
          {list.map(o => (
            <div className="order-card" key={o.id}>

              {/* Header đơn hàng */}
              <div className="order-card-header">
                <div>
                  <div className="order-code">
                    Đơn hàng #{o.id}
                  </div>

                  <div className="order-date">
                    {new Date(o.date).toLocaleString('vi-VN')}
                  </div>
                </div>

                <div className="order-header-right">
                  <strong className="order-total">
                    {money(o.total)}
                  </strong>

                  <span className="order-status-tag">
                    {o.status}
                  </span>

                  <PayTag o={o} />
                </div>
              </div>

              {/* Thông tin giao hàng */}
              <div className="order-info">
                <div className="order-info-item">
                  <span className="order-info-label">
                    Người nhận
                  </span>
                  <strong>{o.name}</strong>
                </div>

                <div className="order-info-item">
                  <span className="order-info-label">
                    Số điện thoại
                  </span>
                  <strong>{o.phone}</strong>
                </div>

                <div className="order-info-item order-address">
                  <span className="order-info-label">
                    Địa chỉ giao hàng
                  </span>
                  <strong>{o.addr}</strong>
                </div>

                <div className="order-info-item">
                  <span className="order-info-label">
                    Thanh toán
                  </span>
                  <strong>
                    {o.pay === 'cod' ? 'COD' : 'VietQR'}
                  </strong>
                </div>
              </div>

              {/* Sản phẩm */}
              <div className="order-products">
                <h3>Sản phẩm</h3>

                <div className="order-product-list">
                  {o.items.map((item, index) => (
                    <div
                      className="order-product"
                      key={index}
                    >
                      <div className="order-product-name">
                        <span>{item.name}</span>
                        <span className="order-product-qty">
                          × {item.qty}
                        </span>
                      </div>

                      <strong>
                        {money(item.price * item.qty)}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              {o.status === 'Chờ xác nhận' &&
                o.pay_status !== 'paid' && (
                  <div className="order-card-footer">
                    <button
                      className="order-cancel-btn"
                      onClick={() => cancel(o.id)}
                    >
                      Hủy đơn
                    </button>
                  </div>
                )}
            </div>
          ))}
        </div>
      ) : (
        <div className="orders-empty">
          <div className="orders-empty-icon">📦</div>

          <h3>Chưa có đơn hàng</h3>

          <p>
            Bạn chưa đặt đơn hàng nào.
          </p>

          <Link
            to="/products"
            className="orders-primary-btn"
          >
            Xem sản phẩm
          </Link>
        </div>
      )}
    </div>
  );
}