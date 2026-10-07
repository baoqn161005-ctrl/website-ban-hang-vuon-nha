import { useCallback, useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import * as productService from '../../services/productService';
import * as admin from '../../services/adminService';

export default function AdminCategories() {
  const { notify } = useApp();

  const [cats, setCats] = useState([]);
  const [name, setName] = useState('');

  const load = useCallback(() => {
    productService
      .categories()
      .then(setCats)
      .catch(e => notify(e.message));
  }, [notify]);

  useEffect(() => {
    load();
  }, [load]);

  const run = async fn => {
    try {
      await fn();
      load();
    } catch (e) {
      notify(e.message);
    }
  };

  const add = e => {
    e.preventDefault();

    if (!name.trim()) {
      notify('Vui lòng nhập tên danh mục');
      return;
    }

    run(async () => {
      await admin.saveCategory(null, name.trim());
      setName('');
      notify('Đã thêm danh mục');
    });
  };

  const rename = c => {
    const n = prompt('Tên danh mục mới:', c.name);

    if (n && n.trim()) {
      run(() =>
        admin.saveCategory(c.id, n.trim())
      );
    }
  };

  const del = c => {
    if (!confirm(`Bạn có chắc muốn xóa danh mục "${c.name}"?`)) {
      return;
    }

    run(() =>
      admin.deleteCategory(c.id)
    );
  };

  return (
    <div className="admin-categories">

      {/* ===== TIÊU ĐỀ ===== */}
      <div className="admin-page-heading">

        <div>
          <h1>Quản lý danh mục</h1>
          <p>
            Quản lý các danh mục sản phẩm của cửa hàng Vườn Nhà.
          </p>
        </div>

        <div className="category-total">
          <span>Tổng danh mục</span>
          <strong>{cats.length}</strong>
        </div>

      </div>


      {/* ===== THÊM DANH MỤC ===== */}
      <div className="category-add-box">

        <div className="admin-section-heading">

          <div>
            <h2>➕ Thêm danh mục</h2>
            <p>
              Tạo danh mục mới để phân loại sản phẩm.
            </p>
          </div>

        </div>

        <form
          className="category-add-form"
          onSubmit={add}
        >

          <div className="category-input-wrapper">

            <span className="category-input-icon">
              🗂️
            </span>

            <input
              type="text"
              required
              placeholder="Nhập tên danh mục..."
              value={name}
              onChange={e => setName(e.target.value)}
            />

          </div>

          <button
            type="submit"
            className="category-add-btn"
          >
            + Thêm danh mục
          </button>

        </form>

      </div>


      {/* ===== DANH SÁCH DANH MỤC ===== */}
      <div className="category-list-box">

        <div className="admin-section-heading">

          <div>
            <h2>Danh sách danh mục</h2>
            <p>
              Các danh mục hiện có trong hệ thống.
            </p>
          </div>

          <span className="product-count">
            {cats.length} danh mục
          </span>

        </div>


        <div className="admin-category-table-wrapper">

          <table className="admin-category-table">

            <thead>
              <tr>
                <th>ID</th>
                <th>Tên danh mục</th>
                <th className="category-action-column">
                  Hành động
                </th>
              </tr>
            </thead>

            <tbody>

              {cats.length === 0 ? (

                <tr>
                  <td
                    colSpan="3"
                    className="empty-category-table"
                  >
                    Chưa có danh mục nào.
                  </td>
                </tr>

              ) : (

                cats.map(c => (
                  <tr key={c.id}>

                    <td>
                      <span className="category-id">
                        #{c.id}
                      </span>
                    </td>

                    <td>
                      <div className="category-name">
                        <span className="category-list-icon">
                          🌿
                        </span>

                        <strong>{c.name}</strong>
                      </div>
                    </td>

                    <td>

                      <div className="category-actions">

                        <button
                          type="button"
                          className="admin-action-btn edit"
                          onClick={() => rename(c)}
                        >
                          ✏️ Sửa
                        </button>

                        <button
                          type="button"
                          className="admin-action-btn delete"
                          onClick={() => del(c)}
                        >
                          🗑️ Xóa
                        </button>

                      </div>

                    </td>

                  </tr>
                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}