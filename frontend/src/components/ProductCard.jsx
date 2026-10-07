import { Link } from 'react-router-dom';
import Thumb from './Thumb';
import Price, { StockLabel } from './Price';
import { useApp } from '../context/AppContext';

export default function ProductCard({ p }) {
  const { addToCart } = useApp();

  function handleAddToCart() {
    addToCart(p.id, 1);
  }

  return (
    <article className="product-card">
      <Link
        to={'/products/' + p.id}
        className="product-card-link"
      >
        <div className="product-card-image">
          <Thumb p={p} />
        </div>

        <div className="product-card-info">
          <h3 className="product-card-name">{p.name}</h3>

          <Price p={p} />

          <div className="product-card-stock">
            <StockLabel p={p} />
          </div>
        </div>
      </Link>

      <div className="product-card-action">
        <button
          type="button"
          className="product-card-btn"
          disabled={p.stock <= 0}
          onClick={handleAddToCart}
        >
          {p.stock > 0 ? '🛒 Thêm vào giỏ' : 'Hết hàng'}
        </button>
      </div>
    </article>
  );
}