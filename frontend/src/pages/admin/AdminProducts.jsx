import { useCallback, useEffect, useState } from 'react';
import ProductForm from '../../components/admin/ProductForm';
import Pager from '../../components/Pager';
import Thumb from '../../components/Thumb';
import Price from '../../components/Price';
import { useApp } from '../../context/AppContext';
import * as productService from '../../services/productService';
import * as admin from '../../services/adminService';

export default function AdminProducts() {
  const { notify } = useApp();

  const [cats, setCats] = useState([]);
  const [data, setData] = useState({
    items: [],
    pages: 1,
    page: 1
  });
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [totalProducts, setTotalProducts] = useState(0);

  const load = useCallback(() => {
  productService
    .list({ per: 10, page })
    .then(setData)
    .catch(e => notify(e.message));

    admin.stats()
      .then(s => setTotalProducts(s.products))
      .catch(() => {});
  }, [page, notify]);

  useEffect(() => {
    productService
      .categories()
      .then(setCats)
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function del(id) {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;

    try {
      await admin.deleteProduct(id);
      notify('Đã xóa sản phẩm');
      load();
    } catch (e) {
      notify(e.message);
    }
  }

  const saved = () => {
    setEditing(null);
    load();
  };

  function editProduct(product) {
    setEditing(product);

    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }, 50);
  }

  return (
    <div className="admin-products">

      {/* ===== TIÊU ĐỀ ===== */}
      <div className="admin-page-heading">

        <div>
          <h1>Quản lý sản phẩm</h1>
          <p>Quản lý thông tin và tồn kho các sản phẩm của Vườn Nhà.</p>
        </div>

        <div className="product-total">
          <span>Tổng sản phẩm</span>
          <strong>{totalProducts}</strong>
        </div>

      </div>


      {/* ===== FORM ===== */}
      <div className="admin-product-form-box">

        <div className="admin-section-heading">

          <div>
            <h2>
              {editing
                ? '✏️ Chỉnh sửa sản phẩm'
                : '➕ Thêm sản phẩm mới'}
            </h2>

            <p>
              {editing
                ? 'Cập nhật thông tin sản phẩm đang chọn.'
                : 'Nhập thông tin để thêm sản phẩm vào cửa hàng.'}
            </p>
          </div>

        </div>

        <ProductForm
          key={editing ? editing.id : 'new'}
          cats={cats}
          initial={editing}
          onSaved={saved}
          onCancel={() => setEditing(null)}
        />

      </div>


      {/* ===== DANH SÁCH ===== */}
      <div className="admin-product-list">

        <div className="admin-section-heading product-list-heading">

          <div>
            <h2>Danh sách sản phẩm</h2>
            <p>
              Các sản phẩm hiện đang được quản lý trong hệ thống.
            </p>
          </div>

          <span className="product-count">
            {totalProducts} sản phẩm
          </span>

        </div>


        <div className="admin-table-wrapper">

          <table className="admin-table">

            <thead>
              <tr>
                <th>Ảnh</th>
                <th>Sản phẩm</th>
                <th>Danh mục</th>
                <th>Giá</th>
                <th>Tồn kho</th>
                <th className="action-column">Hành động</th>
              </tr>
            </thead>

            <tbody>

              {data.items.length === 0 ? (

                <tr>
                  <td colSpan="6" className="empty-table">
                    Chưa có sản phẩm nào.
                  </td>
                </tr>

              ) : (

                data.items.map(p => {

                  const category =
                    cats.find(c => c.id === p.cat);

                  return (
                    <tr key={p.id}>

                      {/* Ảnh */}
                      <td>
                        <div className="admin-product-image">
                          <Thumb
                            p={p}
                            size="sm"
                          />
                        </div>
                      </td>


                      {/* Tên */}
                      <td>
                        <div className="admin-product-name">
                          <strong>{p.name}</strong>
                          <span>ID: #{p.id}</span>
                        </div>
                      </td>


                      {/* Danh mục */}
                      <td>
                        <span className="category-badge">
                          {category?.name || '-'}
                        </span>
                      </td>


                      {/* Giá */}
                      <td>
                        <div className="admin-product-price">
                          <Price p={p} />
                        </div>
                      </td>


                      {/* Tồn kho */}
                      <td>

                        {p.stock <= 5 ? (

                          <span className="stock-warning">
                            {p.stock}
                          </span>

                        ) : (

                          <span className="stock-normal">
                            {p.stock}
                          </span>

                        )}

                        {p.stock <= 5 && (
                          <small className="stock-label">
                            Sắp hết
                          </small>
                        )}

                      </td>


                      {/* Hành động */}
                      <td>

                        <div className="product-actions">

                          <button
                            type="button"
                            className="admin-action-btn edit"
                            onClick={() => editProduct(p)}
                          >
                            ✏️ Sửa
                          </button>

                          <button
                            type="button"
                            className="admin-action-btn delete"
                            onClick={() => del(p.id)}
                          >
                            🗑️ Xóa
                          </button>

                        </div>

                      </td>

                    </tr>
                  );
                })

              )}

            </tbody>

          </table>

        </div>


        {/* Phân trang */}
        <div className="admin-pagination">
          <Pager
            pages={data.pages}
            page={data.page}
            onChange={setPage}
          />
        </div>

      </div>

    </div>
  );
}