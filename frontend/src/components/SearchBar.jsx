import { useEffect, useRef, useState } from 'react';

export default function SearchBar({ q, cat, cats, onChange }) {
  const [value, setValue] = useState(q);
  const timer = useRef(null);

  useEffect(() => {
    setValue(q);
  }, [q]);

  useEffect(() => {
    return () => clearTimeout(timer.current);
  }, []);

  function handleSearch(e) {
    const val = e.target.value;
    setValue(val);

    clearTimeout(timer.current);

    timer.current = setTimeout(() => {
      onChange({ q: val });
    }, 300);
  }

  function handleCategory(e) {
    onChange({ cat: e.target.value });
  }

  function handleClear() {
    setValue('');
    clearTimeout(timer.current);
    onChange({ q: '' });
  }

  return (
    <div className="search-filter-box">
      <div className="search-filter-row">

        {/* Ô tìm kiếm */}
        <div className="search-input-wrapper">
          <span className="search-icon">⌕</span>

          <input
            type="text"
            value={value}
            onChange={handleSearch}
            placeholder="Tìm kiếm sản phẩm..."
            className="search-input"
          />

          {value && (
            <button
              type="button"
              className="search-clear"
              onClick={handleClear}
              aria-label="Xóa tìm kiếm"
            >
              ×
            </button>
          )}
        </div>

        {/* Chọn danh mục */}
        <div className="category-select-wrapper">
          <span className="category-icon">☰</span>

          <select
            value={cat}
            onChange={handleCategory}
            className="category-select"
          >
            <option value="0">Tất cả danh mục</option>

            {cats.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

      </div>
    </div>
  );
}