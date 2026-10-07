import { money, pct } from '../services/api';

export default function Price({ p }) {
  const discount = pct(p);

  return (
    <div className="product-price">
      <span className="price">{money(p.price)}</span>

      {discount > 0 && (
        <div className="price-discount">
          <s className="old-price">{money(p.old)}</s>
          <span className="discount-badge">-{discount}%</span>
        </div>
      )}
    </div>
  );
}

export function StockLabel({ p }) {
  if (p.stock <= 0) {
    return <span className="stock-label stock-out">Hết hàng</span>;
  }

  if (p.stock <= 5) {
    return (
      <span className="stock-label stock-low">
        Chỉ còn {p.stock} sản phẩm
      </span>
    );
  }

  return (
    <span className="stock-label stock-in">
      Còn {p.stock} sản phẩm
    </span>
  );
}