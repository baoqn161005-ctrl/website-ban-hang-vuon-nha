import { useEffect, useState } from 'react';
import { getConfig } from '../services/api';

export default function Footer() {
  const [shop, setShop] = useState({});

  useEffect(() => {
    getConfig()
      .then(c => setShop(c.shop || {}))
      .catch(() => {});
  }, []);

  return (
    <footer className="site-footer">

      <div className="footer-container">

        {/* Cột 1 - Thông tin cửa hàng */}
        <div className="footer-col">

          <div className="footer-logo">
            <img
            src="/images/logo_VuonNha.png"
            alt="Vườn Nhà"
            className="auth-logo"
            />
            <span>Vườn Nhà</span>
          </div>

          <p className="footer-description">
            Cửa hàng cây cảnh và dụng cụ trồng cây,
            mang không gian xanh đến ngôi nhà của bạn.
          </p>

          <div className="footer-info">
            <p>
              <span>📍</span>
              <span>{shop.addr}</span>
            </p>

            <p>
              <span>📞</span>
              <a
                href={'tel:' + (shop.phone || '').replace(/\s/g, '')}
              >
                {shop.phone}
              </a>
            </p>

            <p>
              <span>✉️</span>
              <a href={'mailto:' + shop.email}>
                {shop.email}
              </a>
            </p>

            <p>
              <span>🕒</span>
              <span>{shop.hours}</span>
            </p>
          </div>

        </div>


        {/* Cột 2 - Chính sách */}
        <div className="footer-col">

          <h4>Chính sách</h4>

          <div className="footer-line"></div>

          <ul className="footer-policy">

            <li>
              <span>↻</span>
              <div>
                <b>Đổi trả</b>
                <p>
                  Trong 24 giờ nếu hàng hư hỏng,
                  dập nát.
                </p>
              </div>
            </li>

            <li>
              <span>🚚</span>
              <div>
                <b>Vận chuyển</b>
                <p>
                  Miễn phí đơn từ 300.000đ
                  trong nội thành.
                </p>
              </div>
            </li>

            <li>
              <span>💳</span>
              <div>
                <b>Thanh toán</b>
                <p>
                  COD hoặc chuyển khoản VietQR.
                </p>
              </div>
            </li>

            <li>
              <span>🔒</span>
              <div>
                <b>Bảo mật</b>
                <p>
                  Thông tin khách hàng được bảo mật.
                </p>
              </div>
            </li>

          </ul>

        </div>


        {/* Cột 3 - Bản đồ */}
        <div className="footer-col">

          <h4>Vị trí cửa hàng</h4>

          <div className="footer-line"></div>

          <div className="footer-map">

            {shop.addr && (
              <iframe
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Bản đồ Vườn Nhà"
                src={`https://www.google.com/maps?q=${encodeURIComponent(
                  shop.addr
                )}&output=embed`}
              />
            )}

          </div>

          <p className="footer-address">
            📍 {shop.addr}
          </p>

        </div>

      </div>


      {/* Copyright */}
      <div className="footer-bottom">

        <div className="footer-bottom-inner">

          <span>
            © {new Date().getFullYear()} Vườn Nhà
          </span>

          <span>
            Cửa hàng cây cảnh và dụng cụ trồng cây
          </span>

          <span>
            Bảo lưu mọi quyền.
          </span>

        </div>

      </div>

    </footer>
  );
}