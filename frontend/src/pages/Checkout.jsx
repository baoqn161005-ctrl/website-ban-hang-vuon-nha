import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getConfig, money } from '../services/api';
import * as cartService from '../services/cartService';
import * as orderService from '../services/orderService';

export default function Checkout() {
  const { user, refreshCart, notify } = useApp();
  const nav = useNavigate();

  const [lines, setLines] = useState(null);
  const [bank, setBank] = useState(null);
  const [order, setOrder] = useState(null);
  const [state, setState] = useState('waiting');
  const [errors, setErrors] = useState({});

  const [f, setF] = useState({
    name: user?.name || '',
    phone: '',
    addr: '',
    pay: 'vietqr'
  });

  const set = key => event => {
    setF(prev => ({
      ...prev,
      [key]: event.target.value
    }));
  };

  useEffect(() => {
    if (!user) return;

    cartService
      .list()
      .then(list => {
        if (list.length) {
          setLines(list);
        } else {
          nav('/cart');
        }
      })
      .catch(e => notify(e.message));

    getConfig()
      .then(config => setBank(config.bank))
      .catch(() => {});
  }, [user, nav, notify]);

  // Theo dõi trạng thái thanh toán VietQR
  useEffect(() => {
    if (!order) return;

    const startTime = Date.now();

    const interval = setInterval(async () => {
      try {
        const result = await orderService.paymentStatus(order.id);

        if (result.paid) {
          setState('paid');
          clearInterval(interval);

          setTimeout(() => {
            nav('/orders');
          }, 1800);
        } else if (result.status === 'Đã hủy') {
          setState('cancelled');
          clearInterval(interval);
        }
      } catch {
        // Thử lại ở lần tiếp theo
      }

      // Tối đa theo dõi 1 giờ
      if (Date.now() - startTime > 3600000) {
        clearInterval(interval);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [order, nav]);

  async function submit(event) {
  event.preventDefault();

  const newErrors = {};

  // Kiểm tra họ tên
  if (!f.name.trim()) {
    newErrors.name = 'Vui lòng nhập họ và tên';
  }

  // Kiểm tra số điện thoại
  if (!f.phone.trim()) {
    newErrors.phone = 'Vui lòng nhập số điện thoại';
  } else if (!/^[0-9]{9,11}$/.test(f.phone.trim())) {
    newErrors.phone = 'Số điện thoại không hợp lệ';
  }

  // Kiểm tra địa chỉ
  if (!f.addr.trim()) {
    newErrors.addr = 'Vui lòng nhập địa chỉ giao hàng';
  }

  // Nếu có lỗi thì dừng lại
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  // Không còn lỗi
  setErrors({});

  try {
    const createdOrder = await orderService.create(f);

    await refreshCart();

    if (f.pay === 'cod') {
      nav('/orders');
      return;
    }

    setOrder(createdOrder);
  } catch (error) {
    notify(error.message);
  }
}

  // Chưa đăng nhập
  if (!user) {
    return (
      <div className="checkout-page">
        <div className="checkout-header">
          <h1>Đặt hàng & Thanh toán</h1>
          <p>Đăng nhập để tiếp tục đặt hàng.</p>
        </div>

        <div className="checkout-login-box">
          <div className="checkout-empty-icon">🔐</div>

          <h3>Bạn chưa đăng nhập</h3>

          <p>
            Vui lòng đăng nhập để tiếp tục thanh toán.
          </p>

          <Link
            to="/login"
            state={{ from: '/checkout' }}
            className="checkout-primary-btn"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  // Đang tải giỏ hàng
  if (!lines) {
    return (
      <div className="checkout-page">
        <div className="checkout-header">
          <h1>Đặt hàng & Thanh toán</h1>
          <p>Đang chuẩn bị thông tin đơn hàng...</p>
        </div>

        <div className="checkout-loading">
          <div className="checkout-loading-spinner"></div>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  // Tính tổng tiền
  const total = lines.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  // Màn hình VietQR
  if (order && bank) {
    const url =
      `https://img.vietqr.io/image/` +
      `${bank.id}-${bank.no}-compact2.png` +
      `?amount=${order.total}` +
      `&addInfo=${encodeURIComponent(order.id)}` +
      `&accountName=${encodeURIComponent(bank.name)}`;

    return (
      <div className="checkout-page">
        <div className="payment-box">

          <div className="payment-icon">💳</div>

          <h1>Thanh toán VietQR</h1>

          <p className="payment-description">
            Quét mã QR bằng ứng dụng ngân hàng để thanh toán.
          </p>

          <div className="payment-amount">
            <span>Số tiền thanh toán</span>
            <strong>{money(order.total)}</strong>
          </div>

          <div className="payment-content">
            <span>Nội dung chuyển khoản</span>
            <strong>{order.id}</strong>
          </div>

          <div className="payment-qr">
            <img
              src={url}
              alt="Mã QR thanh toán VietQR"
            />
          </div>

          <div className={`payment-status ${state}`}>
            {state === 'paid' && (
              <>
                <span>✓</span>
                Đã nhận thanh toán! Đang chuyển trang...
              </>
            )}

            {state === 'cancelled' && (
              <>
                <span>!</span>
                Đơn hàng đã bị hủy do quá hạn thanh toán.
              </>
            )}

            {state === 'waiting' && (
              <>
                <span>⏳</span>
                Đang chờ thanh toán. Admin sẽ xác nhận giao dịch trong bản demo.
              </>
            )}
          </div>

          <Link
            className="checkout-secondary-btn"
            to="/orders"
          >
            Xem đơn hàng của tôi
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">

      <div className="checkout-header">
        <h1>Đặt hàng & Thanh toán</h1>
        <p>
          Nhập thông tin giao hàng và kiểm tra đơn hàng
          trước khi xác nhận.
        </p>
      </div>

      <form
        className="checkout-content"
        onSubmit={submit}
      >

        {/* Thông tin giao hàng */}
        <section className="checkout-form-box">
          <div className="checkout-section-title">
            <h2>Thông tin giao hàng</h2>
            <p>Vui lòng nhập chính xác thông tin nhận hàng.</p>
          </div>

          <div className="checkout-form">

            <div className="checkout-field">
              <label htmlFor="name">
                Họ và tên
              </label>

              <input
                id="name"
                placeholder="Nhập họ và tên"
                value={f.name}
                onChange={e => {
                  set('name')(e);
                  setErrors(prev => ({ ...prev, name: '' }));
                }}
              />

              {errors.name && (
                <small className="checkout-field-error">
                  ⚠ {errors.name}
                </small>
              )}
            </div>

            <div className="checkout-field">
              <label htmlFor="phone">
                Số điện thoại
              </label>

              <input
                id="phone"
                type="tel"
                placeholder="Nhập số điện thoại"
                value={f.phone}
                onChange={e => {
                  set('phone')(e);
                  setErrors(prev => ({ ...prev, phone: '' }));
                }}
              />

              {errors.phone ? (
                <small className="checkout-field-error">
                  ⚠ {errors.phone}
                </small>
              ) : (
                <small>
                  Số điện thoại gồm 9–11 chữ số.
                </small>
              )}
            </div>

            <div className="checkout-field">
              <label htmlFor="addr">
                Địa chỉ giao hàng
              </label>

              <textarea
                id="addr"
                rows="4"
                placeholder="Nhập địa chỉ nhận hàng"
                value={f.addr}
                onChange={e => {
                  set('addr')(e);
                  setErrors(prev => ({ ...prev, addr: '' }));
                }}
              />

              {errors.addr && (
                <small className="checkout-field-error">
                  ⚠ {errors.addr}
                </small>
              )}
            </div>

            <div className="checkout-field">
              <label>
                Phương thức thanh toán
              </label>

              <div className="payment-methods">

                <label
                  className={
                    f.pay === 'vietqr'
                      ? 'payment-method selected'
                      : 'payment-method'
                  }
                >
                  <input
                    type="radio"
                    name="pay"
                    value="vietqr"
                    checked={f.pay === 'vietqr'}
                    onChange={set('pay')}
                  />

                  <div>
                    <strong>Chuyển khoản VietQR</strong>
                    <span>
                      Thanh toán bằng ứng dụng ngân hàng.
                    </span>
                  </div>
                </label>

                <label
                  className={
                    f.pay === 'cod'
                      ? 'payment-method selected'
                      : 'payment-method'
                  }
                >
                  <input
                    type="radio"
                    name="pay"
                    value="cod"
                    checked={f.pay === 'cod'}
                    onChange={set('pay')}
                  />

                  <div>
                    <strong>Thanh toán khi nhận hàng</strong>
                    <span>Thanh toán bằng tiền mặt khi nhận hàng.</span>
                  </div>
                </label>

              </div>
            </div>
          </div>
        </section>

        {/* Tóm tắt đơn hàng */}
        <aside className="checkout-summary">

          <h2>Đơn hàng của bạn</h2>

          <div className="checkout-products">
            {lines.map(item => (
              <div
                className="checkout-product"
                key={item.id}
              >
                <div>
                  <span className="checkout-product-name">
                    {item.name}
                  </span>

                  <span className="checkout-product-qty">
                    × {item.qty}
                  </span>
                </div>

                <strong>
                  {money(item.price * item.qty)}
                </strong>
              </div>
            ))}
          </div>

          <div className="checkout-divider"></div>

          <div className="checkout-total">
            <span>Tổng cộng</span>
            <strong>{money(total)}</strong>
          </div>

          <button
            type="submit"
            className="checkout-submit-btn"
          >
            Xác nhận đặt hàng
          </button>

          <Link
            to="/cart"
            className="checkout-back-btn"
          >
            ← Quay lại giỏ hàng
          </Link>

        </aside>

      </form>
    </div>
  );
}
