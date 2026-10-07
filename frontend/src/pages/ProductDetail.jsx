import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Thumb from '../components/Thumb';
import Price, { StockLabel } from '../components/Price';
import { useApp } from '../context/AppContext';
import { money, pct } from '../services/api';
import * as productService from '../services/productService';

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useApp();

  const [p, setP] = useState(null);
  const [cat, setCat] = useState('');
  const [qty, setQty] = useState(1);
  const [err, setErr] = useState('');

  useEffect(() => {
    setP(null);
    setErr('');

    productService
      .get(id)
      .then(product => {
        setP(product);

        return productService.categories().then(categories => {
          const category = categories.find(
            c => c.id === product.cat
          );

          setCat(category?.name || '');
        });
      })
      .catch(e => {
        setErr(e.message);
      });
  }, [id]);

  // Lỗi
  if (err) {
    return (
      <div className="product-detail-page">
        <div className="product-detail-error">
          <div className="product-detail-error-icon">⚠</div>

          <h2>Không thể tải sản phẩm</h2>

          <p>{err}</p>

          <Link
            to="/products"
            className="product-detail-primary-btn"
          >
            ← Về danh sách sản phẩm
          </Link>
        </div>
      </div>
    );
  }

  // Loading
  if (!p) {
    return (
      <div className="product-detail-page">
        <div className="product-detail-loading">
          <div className="product-detail-spinner"></div>
          <p>Đang tải thông tin sản phẩm...</p>
        </div>
      </div>
    );
  }

  const discount = pct(p);
  const saving =
    discount > 0 ? money(p.old - p.price) : null;

  function increaseQty() {
    setQty(current => Math.min(current + 1, p.stock));
  }

  function decreaseQty() {
    setQty(current => Math.max(current - 1, 1));
  }

  function handleQtyChange(e) {
    const value = Number(e.target.value);

    if (!value || value < 1) {
      setQty(1);
      return;
    }

    setQty(Math.min(value, p.stock));
  }

  function handleAddToCart() {
    addToCart(p.id, qty);
  }

  return (
    <div className="product-detail-page">

      {/* Breadcrumb */}
      <div className="product-breadcrumb">
        <Link to="/">Trang chủ</Link>
        <span>›</span>
        <Link to="/products">Sản phẩm</Link>

        {cat && (
          <>
            <span>›</span>
            <span>{cat}</span>
          </>
        )}
      </div>

      {/* Chi tiết */}
      <div className="product-detail-card">

        {/* Hình ảnh */}
        <div className="product-detail-image">
          <Thumb p={p} size="lg" />
        </div>

        {/* Thông tin */}
        <div className="product-detail-info">

          {cat && (
            <span className="product-detail-category">
              {cat}
            </span>
          )}

          <h1>{p.name}</h1>

          <div className="product-detail-price">
            <Price p={p} />

            {discount > 0 && (
              <div className="product-detail-discount">
                <span className="product-detail-old-price">
                  {money(p.old)}
                </span>

                <span className="product-detail-discount-tag">
                  -{discount}%
                </span>
              </div>
            )}
          </div>

          {saving && (
            <div className="product-detail-saving">
              Tiết kiệm <strong>{saving}</strong> khi mua sản phẩm này.
            </div>
          )}

          <div className="product-detail-divider"></div>

          <div className="product-detail-description">
            <h3>Mô tả sản phẩm</h3>

            <p>
              {p.description || 'Chưa có mô tả cho sản phẩm này.'}
            </p>
          </div>

          <div className="product-detail-stock">
            <span className="product-detail-label">
              Tình trạng
            </span>

            <StockLabel p={p} />
          </div>

          {p.stock > 0 ? (
            <div className="product-detail-purchase">

              <div className="product-detail-quantity">
                <span className="product-detail-label">
                  Số lượng
                </span>

                <div className="quantity-control">
                  <button
                    type="button"
                    onClick={decreaseQty}
                    disabled={qty <= 1}
                  >
                    −
                  </button>

                  <input
                    type="number"
                    min="1"
                    max={p.stock}
                    value={qty}
                    onChange={handleQtyChange}
                  />

                  <button
                    type="button"
                    onClick={increaseQty}
                    disabled={qty >= p.stock}
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                type="button"
                className="product-detail-cart-btn"
                onClick={handleAddToCart}
              >
                🛒 Thêm vào giỏ hàng
              </button>

            </div>
          ) : (
            <div className="product-detail-out">
              <strong>Sản phẩm hiện đã hết hàng</strong>
              <span>Vui lòng quay lại sau.</span>
            </div>
          )}

          <Link
            to="/products"
            className="product-detail-back-btn"
          >
            ← Tiếp tục xem sản phẩm
          </Link>

        </div>
      </div>
    </div>
  );
}