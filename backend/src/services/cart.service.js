const { pool, tx } = require('../config/db'), { bad } = require('../utils/http');
exports.list = async uid => { // tự dọn: bỏ hàng đã hết, giảm số lượng vượt tồn kho
  await pool.query('DELETE c FROM cart_items c JOIN products p ON p.id=c.product_id WHERE c.user_id=? AND p.stock<=0', [uid]);
  await pool.query('UPDATE cart_items c JOIN products p ON p.id=c.product_id SET c.qty=LEAST(c.qty,p.stock) WHERE c.user_id=?', [uid]);
  return (await pool.query('SELECT p.id,p.name,p.price,p.old_price AS old,p.img,p.stock,c.qty FROM cart_items c JOIN products p ON p.id=c.product_id WHERE c.user_id=? ORDER BY c.added_at', [uid]))[0];
};
exports.add = async (uid, pid, qty) => {
  qty = Math.max(1, parseInt(qty) || 1);
  await tx(async c => {
    const [[p]] = await c.query('SELECT id,stock FROM products WHERE id=? FOR UPDATE', [+pid]);
    if (!p) throw bad('Sản phẩm không tồn tại', 404);
    const [[item]] = await c.query('SELECT qty FROM cart_items WHERE user_id=? AND product_id=? FOR UPDATE', [uid, p.id]);
    const n = (item ? item.qty : 0) + qty;
    if (n > p.stock) throw bad(`Chỉ còn ${p.stock} sản phẩm trong kho`, 409);
    await c.query('INSERT INTO cart_items (user_id,product_id,qty) VALUES (?,?,?) ON DUPLICATE KEY UPDATE qty=VALUES(qty)', [uid, p.id, n]);
  });
  return { ok: true };
};
exports.set = async (uid, pid, qty) => {
  qty = parseInt(qty); if (!(qty > 0)) return exports.remove(uid, pid);
  await tx(async c => {
    const [[p]] = await c.query('SELECT id,stock FROM products WHERE id=? FOR UPDATE', [+pid]);
    if (!p) throw bad('Sản phẩm không tồn tại', 404);
    if (qty > p.stock) throw bad(`Chỉ còn ${p.stock} sản phẩm trong kho`, 409);
    await c.query('UPDATE cart_items SET qty=? WHERE user_id=? AND product_id=?', [qty, uid, p.id]);
  });
  return { ok: true };
};
exports.remove = async (uid, pid) => { await pool.query('DELETE FROM cart_items WHERE user_id=? AND product_id=?', [uid, +pid]); return { ok: true }; };
