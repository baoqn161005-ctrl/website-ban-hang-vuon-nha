import { Link } from 'react-router-dom';
import Thumb from './Thumb';
import Price from './Price';
import { money } from '../services/api';

export default function CartItem({ item, onQty, onRemove }) {
  function decrease() {
    if (item.qty > 1) {
      onQty(item.id, item.qty - 1);
    }
  }

  function increase() {
    if (item.qty < item.stock) {
      onQty(item.id, item.qty + 1);
    }
  }

  function handleQtyChange(e) {
    let value = Number(e.target.value);

    if (!value || value < 1) {
      value = 1;
    }

    if (value > item.stock) {
      value = item.stock;
    }

    onQty(item.id, value);
  }

  return (
    <tr className="cart-item-row">

      {/* Sản phẩm */}
      <td>
        <div className="cart-product">
          <Link
            to={'/products/' + item.id}
            className="cart-product-image"
          >
            <Thumb p={item} size="sm" />
          </Link>

          <Link
            to={'/products/' + item.id}
            className="cart-product-name"
          >
            {item.name}
          </Link>
        </div>
      </td>

      {/* Đơn giá */}
      <td>
        <div className="cart-item-price">
          <Price p={item} />
        </div>
      </td>

      {/* Số lượng */}
      <td>
        <div className="cart-quantity">
          <button
            type="button"
            className="quantity-btn"
            onClick={decrease}
            disabled={item.qty <= 1}
          >
            −
          </button>

          <input
            type="number"
            min="1"
            max={item.stock}
            value={item.qty}
            onChange={handleQtyChange}
            className="quantity-input"
          />

          <button
            type="button"
            className="quantity-btn"
            onClick={increase}
            disabled={item.qty >= item.stock}
          >
            +
          </button>
        </div>
      </td>

      {/* Thành tiền */}
      <td>
        <strong className="cart-item-total">
          {money(item.price * item.qty)}
        </strong>
      </td>

      {/* Xóa */}
      <td>
        <button
          type="button"
          className="cart-remove-btn"
          onClick={() => onRemove(item.id)}
        >
          🗑 Xóa
        </button>
      </td>

    </tr>
  );
}