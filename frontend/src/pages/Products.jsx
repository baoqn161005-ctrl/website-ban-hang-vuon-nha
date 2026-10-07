import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import ProductList from '../components/ProductList';
import Pager from '../components/Pager';
import { useApp } from '../context/AppContext';
import * as productService from '../services/productService';

export default function Products() {
  const [sp, setSp] = useSearchParams();
  const { notify } = useApp();

  const q = sp.get('q') || '';
  const cat = sp.get('cat') || '0';
  const page = +sp.get('page') || 1;

  const [data, setData] = useState({
    items: [],
    pages: 1,
    page: 1
  });

  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lấy danh mục
  useEffect(() => {
    productService
      .categories()
      .then(setCats)
      .catch(() => {});
  }, []);

  // Lấy danh sách sản phẩm
  useEffect(() => {
    setLoading(true);

    productService
      .list({
        q,
        cat,
        page,
        per: 8
      })
      .then(setData)
      .catch(e => notify(e.message))
      .finally(() => setLoading(false));
  }, [q, cat, page]);

  // Thay đổi tìm kiếm / bộ lọc
  const change = patch => {
    const n = new URLSearchParams(sp);

    Object.entries(patch).forEach(([k, v]) => {
      if (v && v !== '0') {
        n.set(k, v);
      } else {
        n.delete(k);
      }
    });

    // Khi tìm kiếm hoặc đổi danh mục thì quay về trang 1
    if (!('page' in patch)) {
      n.delete('page');
    }

    setSp(n);
  };

  return (
    <div className="products-page">

      {/* Tiêu đề */}
      <section className="products-header">
        <div>
          <h1>Sản phẩm</h1>

          <p>
            Khám phá các sản phẩm cây cảnh, chậu cây và dụng cụ
            trồng cây tại Vườn Nhà.
          </p>
        </div>
      </section>

      {/* Tìm kiếm và lọc */}
      <section className="products-filter">
        <SearchBar
          q={q}
          cat={cat}
          cats={cats}
          onChange={change}
        />
      </section>

      {/* Thông tin kết quả */}
      <div className="products-result-bar">
        <div>
          <strong>
            {loading ? 'Đang tải...' : `${data.items.length} sản phẩm`}
          </strong>

          {q && (
            <span className="products-search-info">
              {' '}cho từ khóa "{q}"
            </span>
          )}
        </div>
      </div>

      {/* Danh sách sản phẩm */}
      {loading ? (
        <div className="products-loading">
          <div className="products-loading-spinner"></div>
          <p>Đang tải sản phẩm...</p>
        </div>
      ) : data.items.length > 0 ? (
        <ProductList items={data.items} />
      ) : (
        <div className="products-empty">
          <div className="products-empty-icon">🔍</div>

          <h3>Không tìm thấy sản phẩm</h3>

          <p>
            Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác.
          </p>

          <button
            className="products-reset-btn"
            onClick={() => setSp({})}
          >
            Xem tất cả sản phẩm
          </button>
        </div>
      )}

      {/* Phân trang */}
      {!loading && data.items.length > 0 && data.pages > 1 && (
        <div className="products-pagination">
          <Pager
            pages={data.pages}
            page={data.page}
            onChange={p => {
              change({ page: String(p) });
              window.scrollTo({
                top: 0,
                behavior: 'smooth'
              });
            }}
          />
        </div>
      )}

    </div>
  );
}