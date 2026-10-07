const { pool } = require('../config/db'), { bad } = require('../utils/http');
const COLS = 'p.id,p.name,p.price,p.old_price AS old,p.category_id AS cat,p.img,p.description,p.stock';
exports.list = async qs => {
  const per = Math.min(Math.max(+qs.per || 8, 1), 50), w = [], a = [];
  if (qs.q) { w.push('p.name LIKE ?'); a.push('%' + qs.q + '%'); }
  if (+qs.cat) { w.push('p.category_id=?'); a.push(+qs.cat); }
  const W = w.length ? 'WHERE ' + w.join(' AND ') : '';
  const [[{ n }]] = await pool.query(`SELECT COUNT(*) n FROM products p ${W}`, a);
  const pages = Math.max(1, Math.ceil(n / per)), page = Math.min(Math.max(+qs.page || 1, 1), pages);
  const [items] = await pool.query(`SELECT ${COLS} FROM products p ${W} ORDER BY p.id DESC LIMIT ? OFFSET ?`, [...a, per, (page - 1) * per]);
  return { items, total: n, pages, page };
};
exports.get = async id => {
  const [[p]] = await pool.query(`SELECT ${COLS} FROM products p WHERE p.id=?`, [+id]);
  if (!p) throw bad('Không tìm thấy sản phẩm', 404); return p;
};
const data = (b, file, existing = '') => {
  const price = Math.round(+b.price), old = Math.round(+b.old_price) || 0, stock = Math.max(0, parseInt(b.stock) || 0);
  if (!String(b.name || '').trim() || !(price >= 0) || !+b.category_id) throw bad('Thiếu tên, giá hoặc danh mục');
  const img = file ? '/uploads/' + file.filename : String(b.img_url || '').trim() || existing;
  return [b.name.trim(), price, old > price ? old : 0, +b.category_id, img, b.description || '', stock];
};
exports.create = async (b, file) => {
  const [r] = await pool.query('INSERT INTO products (name,price,old_price,category_id,img,description,stock) VALUES (?,?,?,?,?,?,?)', data(b, file)); return { id: r.insertId };
};
exports.update = async (id, b, file) => {
  const [[p]] = await pool.query('SELECT img FROM products WHERE id=?', [+id]); if (!p) throw bad('Không tìm thấy sản phẩm', 404);
  await pool.query('UPDATE products SET name=?,price=?,old_price=?,category_id=?,img=?,description=?,stock=? WHERE id=?', [...data(b, file, p.img), +id]); return { ok: true };
};
exports.remove = async id => { await pool.query('DELETE FROM products WHERE id=?', [+id]); return { ok: true }; };
