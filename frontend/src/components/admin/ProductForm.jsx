import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import * as admin from '../../services/adminService';
import { NOIMG } from '../Thumb';

// Form thêm/sửa sản phẩm (có tải ảnh thật từ máy hoặc dán URL)
export default function ProductForm({ cats, initial, onSaved, onCancel }) {
  const { notify } = useApp();
  const [f, setF] = useState({ name: initial?.name || '', price: initial?.price ?? '', old: initial?.old || '', stock: initial?.stock ?? '',
    cat: initial?.cat || cats[0]?.id || '', desc: initial?.description || '', url: initial?.img || '' });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(initial?.img || '');
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const pick = e => { const x = e.target.files[0]; setFile(x || null); if (x) setPreview(URL.createObjectURL(x)); };

  async function submit(e) {
    e.preventDefault();
    const fd = new FormData();
    fd.append('name', f.name); fd.append('price', f.price); fd.append('old_price', f.old || 0); fd.append('stock', f.stock || 0);
    fd.append('category_id', f.cat); fd.append('description', f.desc); fd.append('img_url', f.url);
    if (file) fd.append('image', file);
    try { await admin.saveProduct(initial?.id, fd); notify('Đã lưu sản phẩm'); onSaved(); } catch (err) { notify(err.message); }
  }
  return (
    <form className="box" onSubmit={submit}>
      <h3 style={{ margin: 0 }}>{initial ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h3>
      {!cats.length && <p>⚠️ Hãy tạo danh mục trước.</p>}
      <div className="row">
        <input required placeholder="Tên sản phẩm" value={f.name} onChange={set('name')} />
        <input required type="number" min="0" placeholder="Giá bán (VNĐ)" value={f.price} onChange={set('price')} />
        <input type="number" min="0" placeholder="Giá gốc (nếu khuyến mãi)" value={f.old} onChange={set('old')} />
        <input required type="number" min="0" placeholder="Tồn kho" value={f.stock} onChange={set('stock')} />
        <select required value={f.cat} onChange={set('cat')}>{cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
      </div>
      <div className="row" style={{ alignItems: 'center' }}>
        <label>📷 Ảnh thật (≤ 3MB): <input type="file" accept="image/*" onChange={pick} /></label>
        <input placeholder="hoặc dán URL ảnh https://..." value={f.url} onChange={e => { set('url')(e); setPreview(e.target.value); }} style={{ flex: 1 }} />
        {preview && <img src={preview} alt="xem trước" style={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 6 }} onError={e => { e.currentTarget.src = NOIMG; }} />}
      </div>
      <textarea placeholder="Mô tả" value={f.desc} onChange={set('desc')} />
      <div className="row"><button className="btn">Lưu sản phẩm</button>{initial && <button type="button" className="btn gray" onClick={onCancel}>Hủy sửa</button>}</div>
    </form>
  );
}
