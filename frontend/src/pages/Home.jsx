import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductList from '../components/ProductList';
import * as productService from '../services/productService';

export default function Home() {
  const [items, setItems] = useState([]);
  const [cats, setCats] = useState([]);

  useEffect(() => {
    productService
      .list({ per: 4 })
      .then(r => setItems(r.items))
      .catch(() => {});

    productService
      .categories()
      .then(setCats)
      .catch(() => {});
  }, []);

  return (
    <div className="home-page">

      {/* ================= HERO ================= */}

      <section className="home-hero">

        <div className="home-hero-overlay"></div>

        <div className="home-hero-content">

          {/* <div className="home-hero-brand">
            <img
              src="/images/logo_VuonNha.png"
              alt="Vườn Nhà"
            />
            <span>Vườn Nhà</span>
          </div> */}

          <h1>
            Mang thiên nhiên
            <br />
            vào ngôi nhà của bạn
          </h1>

          <p>
            Cây cảnh, chậu cây và dụng cụ trồng cây
            <br />
            giúp không gian sống xanh hơn mỗi ngày.
          </p>

          <div className="home-hero-actions">

            <Link
              className="home-btn home-btn-primary"
              to="/products"
            >
              Khám phá sản phẩm
            </Link>

            <Link
              className="home-btn home-btn-outline"
              to="/products"
            >
              Xem tất cả
            </Link>

          </div>

        </div>

      </section>


      {/* ================= GIỚI THIỆU ================= */}

      <section className="home-intro">

        <div className="home-intro-item">
          <div className="home-intro-icon">🌱</div>

          <div className="home-intro-content">
            <h3>Đa dạng lựa chọn</h3>
            <p>
              Cây cảnh, chậu cây và dụng cụ trồng cây
              cho mọi nhu cầu.
            </p>
          </div>
        </div>


        <div className="home-intro-item">
          <div className="home-intro-icon">🪴</div>

          <div className="home-intro-content">
            <h3>Góc xanh cho mọi nhà</h3>
            <p>
              Tạo một không gian xanh theo cách
              riêng của bạn.
            </p>
          </div>
        </div>


        <div className="home-intro-item">
          <div className="home-intro-icon">🛒</div>

          <div className="home-intro-content">
            <h3>Mua sắm thuận tiện</h3>
            <p>
              Chọn sản phẩm, thêm vào giỏ và
              đặt hàng dễ dàng.
            </p>
          </div>
        </div>

      </section>


      {/* ================= DANH MỤC ================= */}

      <section className="home-section">

        <div className="home-section-heading">

          <div>
            <span className="home-section-label">
              KHÁM PHÁ
            </span>

            <h2>Danh mục sản phẩm</h2>

            <p>
              Lựa chọn sản phẩm phù hợp với nhu cầu
              của bạn.
            </p>
          </div>

        </div>


        <div className="home-category-grid">

          {cats.map(c => (
            <Link
              key={c.id}
              to={`/products?cat=${c.id}`}
              className="home-category-card"
            >

              <div className="home-category-icon">
                <img
                  src={`/images/categories/${c.id}.jpg`}
                  alt={c.name}
                />
              </div>

              <div className="home-category-content">
                <h3>{c.name}</h3>
                <span>
                  Xem sản phẩm →
                </span>
              </div>

            </Link>
          ))}

        </div>

      </section>


      {/* ================= SẢN PHẨM MỚI ================= */}

      <section className="home-section home-products-section">

        <div className="home-section-heading home-products-heading">

          <div>
            <span className="home-section-label">
              GỢI Ý CHO BẠN
            </span>

            <h2>Sản phẩm mới</h2>

            <p>
              Những sản phẩm nổi bật đang có tại Vườn Nhà.
            </p>
          </div>

          <Link
            to="/products"
            className="home-view-all"
          >
            Xem tất cả →
          </Link>

        </div>


        <ProductList items={items} />

      </section>


      {/* ================= CTA ================= */}

      <section className="home-cta">

        <div>

          <h2>
            Sẵn sàng tạo không gian xanh?
          </h2>

          <p>
            Khám phá các sản phẩm dành cho khu vườn
            và ngôi nhà của bạn.
          </p>

          <Link
            to="/products"
            className="home-cta-btn"
          >
            Mua sắm ngay →
          </Link>

        </div>

      </section>

    </div>
  );
}