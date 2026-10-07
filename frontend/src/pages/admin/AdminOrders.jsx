import { useCallback, useEffect, useState } from 'react';
import { PayTag } from '../Orders';
import { useApp } from '../../context/AppContext';
import { money } from '../../services/api';
import * as admin from '../../services/adminService';

export default function AdminOrders() {
  const { notify } = useApp();
  const [list, setList] = useState(null);

  const load = useCallback(() => {
    admin
      .orders()
      .then(setList)
      .catch(e => notify(e.message));
  }, [notify]);

  useEffect(() => {
    load();
  }, [load]);

  const run = async (fn, ok) => {
    try {
      await fn();
      notify(ok);
    } catch (e) {
      notify(e.message);
    }

    // Tải lại để đồng bộ thanh toán và tồn kho
    load();
  };

  if (!list) {
    return (
      <div className="admin-loading">
        Đang tải dữ liệu đơn hàng...
      </div>
    );
  }

  const pendingCount = list.filter(
    o => o.status === 'Chờ xác nhận'
  ).length;

  const paidCount = list.filter(
    o => o.pay_status === 'paid'
  ).length;

  return (
    <div className="admin-orders">

      {/* ================= TIÊU ĐỀ ================= */}

      <div className="admin-page-heading">

        <div>
          <h1>Quản lý đơn hàng</h1>
          <p>
            Theo dõi đơn hàng, thanh toán và cập nhật trạng thái đơn.
          </p>
        </div>

        <div className="order-summary">

          <div className="order-summary-item">
            <span>Tổng đơn hàng</span>
            <strong>{list.length}</strong>
          </div>

          <div className="order-summary-item pending">
            <span>Chờ xác nhận</span>
            <strong>{pendingCount}</strong>
          </div>

          <div className="order-summary-item paid">
            <span>Đã thanh toán</span>
            <strong>{paidCount}</strong>
          </div>

        </div>

      </div>


      {/* ================= DANH SÁCH ĐƠN ================= */}

      <div className="admin-order-list">

        <div className="admin-section-heading">

          <div>
            <h2>Danh sách đơn hàng</h2>
            <p>
              Xem thông tin khách hàng, sản phẩm và trạng thái thanh toán.
            </p>
          </div>

          <span className="product-count">
            {list.length} đơn hàng
          </span>

        </div>


        <div className="admin-order-table-wrapper">

          <table className="admin-order-table">

            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Sản phẩm</th>
                <th>Tổng tiền</th>
                <th>Thanh toán</th>
                <th>Trạng thái</th>
              </tr>
            </thead>

            <tbody>

              {list.map(o => {

                const isPaid = o.pay_status === 'paid';
                const isCancelled = o.status === 'Đã hủy';

                return (
                  <tr key={o.id}>

                    {/* ===== MÃ ĐƠN ===== */}

                    <td>
                      <div className="order-code">
                        <strong>#{o.id}</strong>

                        <small>
                          {new Date(o.date).toLocaleString('vi-VN')}
                        </small>
                      </div>
                    </td>


                    {/* ===== KHÁCH HÀNG ===== */}

                    <td>
                      <div className="order-customer">

                        <strong>{o.name}</strong>

                        <span>{o.phone}</span>

                        <small>{o.addr}</small>

                      </div>
                    </td>


                    {/* ===== SẢN PHẨM ===== */}

                    <td>
                      <div className="order-products">

                        {o.items.map((i, k) => (
                          <div
                            className="order-product-item"
                            key={k}
                          >
                            <span className="order-product-name">
                              {i.name}
                            </span>

                            <span className="order-product-qty">
                              ×{i.qty}
                            </span>
                          </div>
                        ))}

                      </div>
                    </td>


                    {/* ===== TỔNG TIỀN ===== */}

                    <td>
                      <strong className="order-total">
                        {money(o.total)}
                      </strong>
                    </td>


                    {/* ===== THANH TOÁN ===== */}

                    <td>

                      <div className="payment-info">

                        <span
                          className={
                            o.pay === 'cod'
                              ? 'payment-method cod'
                              : 'payment-method qr'
                          }
                        >
                          {o.pay === 'cod'
                            ? 'COD'
                            : 'VietQR'}
                        </span>

                        <div className="payment-status">
                          <PayTag o={o} />
                        </div>

                        {!isPaid && !isCancelled && (
                          <button
                            type="button"
                            className="confirm-payment-btn"
                            onClick={() =>
                              confirm(
                                'Xác nhận đã nhận đủ tiền cho đơn ' +
                                o.id +
                                '?'
                              ) &&
                              run(
                                () => admin.markPaid(o.id),
                                'Đã xác nhận thanh toán'
                              )
                            }
                          >
                            ✓ Xác nhận đã nhận tiền
                          </button>
                        )}

                      </div>

                    </td>


                    {/* ===== TRẠNG THÁI ===== */}

                    <td>

                      <select
                        className={
                          `order-status-select ${
                            isCancelled
                              ? 'cancelled'
                              : ''
                          }`
                        }
                        value={o.status}
                        disabled={isCancelled}
                        onChange={e =>
                          run(
                            () =>
                              admin.setStatus(
                                o.id,
                                e.target.value
                              ),
                            'Đã cập nhật trạng thái'
                          )
                        }
                      >
                        {admin.STATUS.map(s => (
                          <option key={s}>
                            {s}
                          </option>
                        ))}
                      </select>

                    </td>

                  </tr>
                );
              })}


              {!list.length && (
                <tr>
                  <td
                    colSpan="6"
                    className="empty-order-table"
                  >
                    <div className="empty-order">

                      <div className="empty-order-icon">
                        🛒
                      </div>

                      <strong>
                        Chưa có đơn hàng
                      </strong>

                      <span>
                        Hiện tại chưa có đơn hàng nào trong hệ thống.
                      </span>

                    </div>
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}