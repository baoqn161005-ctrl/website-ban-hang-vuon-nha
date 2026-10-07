import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CartItem from '../components/CartItem';
import { useApp } from '../context/AppContext';
import { money } from '../services/api';
import * as cartService from '../services/cartService';

export default function Cart() {
  const { user, refreshCart, notify } = useApp();
  const [lines, setLines] = useState(null);

  const load = useCallback(async () => {
    try {
      setLines(await cartService.list());
      await refreshCart();
    } catch (e) {
      notify(e.message);
    }
  }, [refreshCart, notify]);

  useEffect(() => {
    if (user) {
      load();
    }
  }, [user, load]);

  // Chưa đăng nhập
  if (!user) {
    return (
      <div className="cart-page">
        <div className="cart-header">
          <h1>Giỏ hàng</h1>
          <p>Đăng nhập để xem và quản lý các sản phẩm trong giỏ hàng.</p>
        </div>

        <div className="cart-login-box">
          <div className="cart-empty-icon">🛒</div>

          <h3>Bạn chưa đăng nhập</h3>

          <p>
            Vui lòng đăng nhập để xem giỏ hàng và tiếp tục mua sắm.
          </p>

          <Link to="/login" className="cart-primary-btn">
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  // Đang tải
  if (!lines) {
    return (
      <div className="cart-page">
        <div className="cart-header">
          <h1>Giỏ hàng</h1>
          <p>Đang tải thông tin giỏ hàng...</p>
        </div>

        <div className="cart-loading">
          <div className="cart-loading-spinner"></div>
          <p>Đang tải giỏ hàng...</p>
        </div>
      </div>
    );
  }

  const act = fn => async (...args) => {
    try {
      await fn(...args);
    } catch (e) {
      notify(e.message);
    }

    await load();
  };

  const onQty = act((id, qty) => cartService.setQty(id, qty));
  const onRemove = act(id => cartService.remove(id));

  const total = lines.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  // Giỏ hàng trống
  if (!lines.length) {
    return (
      <div className="cart-page">
        <div className="cart-header">
          <h1>Giỏ hàng</h1>
          <p>Kiểm tra các sản phẩm bạn đã chọn trước khi đặt hàng.</p>
        </div>

        <div className="cart-empty">
          <div className="cart-empty-icon">🛒</div>

          <h3>Giỏ hàng đang trống</h3>

          <p>
            Bạn chưa có sản phẩm nào trong giỏ hàng.
          </p>

          <Link to="/products" className="cart-primary-btn">
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-header">
        <div>
          <h1>Giỏ hàng</h1>
          <p>
            Kiểm tra các sản phẩm bạn đã chọn trước khi đặt hàng.
          </p>
        </div>

        <span className="cart-item-count">
          {lines.length} sản phẩm
        </span>
      </div>

      <div className="cart-content">

        {/* Danh sách sản phẩm */}
        <section className="cart-list-box">
          <div className="cart-section-title">
            <h2>Sản phẩm đã chọn</h2>
          </div>

          <div className="tbl cart-table-wrapper">
            <table className="cart-table">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Đơn giá</th>
                  <th>Số lượng</th>
                  <th>Thành tiền</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {lines.map(item => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onQty={onQty}
                    onRemove={onRemove}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="cart-continue">
            <Link to="/products" className="cart-outline-btn">
              ← Tiếp tục mua sắm
            </Link>
          </div>
        </section>

        {/* Tổng tiền */}
        <aside className="cart-summary">
          <h2>Tóm tắt đơn hàng</h2>

          <div className="cart-summary-row">
            <span>Tạm tính</span>
            <strong>{money(total)}</strong>
          </div>

          <div className="cart-summary-row">
            <span>Phí vận chuyển</span>
            <span>Thanh toán khi đặt hàng</span>
          </div>

          <div className="cart-summary-divider"></div>

          <div className="cart-total-row">
            <span>Tổng cộng</span>
            <strong>{money(total)}</strong>
          </div>

          <Link to="/checkout" className="cart-checkout-btn">
            Tiến hành đặt hàng
          </Link>
        </aside>

      </div>
    </div>
  );
}