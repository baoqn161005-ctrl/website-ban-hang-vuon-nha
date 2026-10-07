const crypto = require('crypto');
const { pool, tx } = require('../config/db'), { STATUS, PAY_TIMEOUT } = require('../config'), { bad } = require('../utils/http');
const COLS = 'id,name,phone,address AS addr,pay,total,status,payment_status AS pay_status,created_at AS date';
const restock = (c, id) => c.query('UPDATE products p JOIN order_items i ON i.product_id=p.id SET p.stock=p.stock+i.qty WHERE i.order_id=?', [id]);
async function withItems(os) {
  if (!os.length) return os;
  const [it] = await pool.query('SELECT order_id,name,price,qty FROM order_items WHERE order_id IN (?)', [os.map(o => o.id)]);
  return os.map(o => ({ ...o, items: it.filter(i => i.order_id === o.id) }));
}

// Đặt hàng từ GIỎ HÀNG trên server: trừ kho, tạo đơn, xóa giỏ — trong một giao dịch
exports.create = async (uid, { name, phone, addr, pay }) => {
  if (!String(name || '').trim() || !/^[0-9]{9,11}$/.test(phone || '') || !String(addr || '').trim() || !['vietqr', 'cod'].includes(pay)) throw bad('Thông tin đơn hàng không hợp lệ');
  const [rows] = await pool.query('SELECT p.id,p.name,p.price,c.qty FROM cart_items c JOIN products p ON p.id=c.product_id WHERE c.user_id=? ORDER BY p.id', [uid]);
  if (!rows.length) throw bad('Giỏ hàng trống');
  const total = rows.reduce((t, r) => t + r.price * r.qty, 0);
  // Keep the DH + 8 digit format used in bank transfer descriptions. Retry a
  // collision; the unique primary key remains the final concurrency guard.
  for (let attempt = 0; attempt < 5; attempt++) {
    const id = 'DH' + String(crypto.randomInt(0, 100000000)).padStart(8, '0');
    try {
      await tx(async c => {
        for (const r of rows) {
          const [u] = await c.query('UPDATE products SET stock=stock-? WHERE id=? AND stock>=?', [r.qty, r.id, r.qty]);
          if (!u.affectedRows) { const [[x]] = await c.query('SELECT stock FROM products WHERE id=?', [r.id]); throw bad(`"${r.name}" chỉ còn ${x ? x.stock : 0} sản phẩm trong kho`, 409); }
        }
        await c.query('INSERT INTO orders (id,user_id,name,phone,address,pay,total,status) VALUES (?,?,?,?,?,?,?,?)', [id, uid, name.trim(), phone, addr.trim(), pay, total, STATUS[0]]);
        await c.query('INSERT INTO order_items (order_id,product_id,name,price,qty) VALUES ?', [rows.map(r => [id, r.id, r.name, r.price, r.qty])]);
        await c.query('DELETE FROM cart_items WHERE user_id=?', [uid]);
      });
      return { id, total };
    } catch (error) {
      if (error.code !== 'ER_DUP_ENTRY' || attempt === 4) throw error;
    }
  }
};
exports.mine = async uid => withItems((await pool.query(`SELECT ${COLS} FROM orders WHERE user_id=? ORDER BY created_at DESC, id DESC`, [uid]))[0]);
exports.get = async (uid, id) => {
  const orders = (await pool.query(`SELECT ${COLS} FROM orders WHERE user_id=? AND id=?`, [uid, id]))[0];
  if (!orders.length) throw bad('Không tìm thấy đơn hàng', 404);
  return (await withItems(orders))[0];
};
exports.paymentStatus = async (uid, id) => {
  const [[o]] = await pool.query('SELECT payment_status,status FROM orders WHERE id=? AND user_id=?', [id, uid]);
  if (!o) throw bad('Không tìm thấy đơn hàng', 404); return { paid: o.payment_status === 'paid', status: o.status };
};
exports.cancel = async (uid, id) => {
  await tx(async c => {
    const [[o]] = await c.query('SELECT status,payment_status FROM orders WHERE id=? AND user_id=? FOR UPDATE', [id, uid]);
    if (!o || o.status !== STATUS[0]) throw bad('Không thể hủy đơn này');
    if (o.payment_status === 'paid') throw bad('Đơn đã thanh toán, vui lòng liên hệ cửa hàng để được hoàn tiền');
    await c.query('UPDATE orders SET status=? WHERE id=?', [STATUS[3], id]); await restock(c, id);
  });
  return { ok: true };
};

// ----- Quản trị -----
exports.adminList = async () => withItems((await pool.query(`SELECT ${COLS} FROM orders ORDER BY created_at DESC, id DESC`))[0]);
exports.setStatus = async (id, st) => {
  if (!STATUS.includes(st)) throw bad('Trạng thái không hợp lệ');
  await tx(async c => {
    const [[o]] = await c.query('SELECT status,pay FROM orders WHERE id=? FOR UPDATE', [id]);
    if (!o) throw bad('Không tìm thấy đơn hàng', 404);
    if (o.status === STATUS[3] && st !== STATUS[3]) throw bad('Đơn đã hủy không thể mở lại');
    if (st === STATUS[3] && o.status !== STATUS[3]) await restock(c, id);
    const paid = st === STATUS[2] && o.pay === 'cod' ? ", payment_status='paid', paid_at=NOW()" : '';
    await c.query(`UPDATE orders SET status=?${paid} WHERE id=?`, [st, id]);
  });
  return { ok: true };
};
exports.markPaid = async id => {
  const [r] = await pool.query("UPDATE orders SET payment_status='paid', paid_at=NOW() WHERE id=? AND payment_status='unpaid' AND status<>?", [id, STATUS[3]]);
  if (!r.affectedRows) throw bad('Không thể xác nhận đơn này'); return { ok: true };
};
exports.stats = async () => (await pool.query(`SELECT
  (SELECT COUNT(*) FROM products) products, (SELECT COUNT(*) FROM categories) categories, (SELECT COUNT(*) FROM orders) orders,
  (SELECT COUNT(*) FROM orders WHERE status=?) pending, (SELECT COUNT(*) FROM products WHERE stock<=5) low,
  (SELECT COALESCE(SUM(total),0) FROM orders WHERE status=?) revenue`, [STATUS[0], STATUS[2]]))[0][0];

// ----- Webhook ngân hàng: tự xác nhận thanh toán -----
exports.onPayment = async (provider, txId, amount, content) => {
  if (txId === undefined || txId === null || txId === '') throw bad('Thiếu id giao dịch');
  amount = Math.round(+amount) || 0;
  const text = String(content || ''), m = text.toUpperCase().match(/DH\d{8}/);
  await tx(async c => {
    const [ins] = await c.query('INSERT IGNORE INTO bank_transactions (provider,tx_id,amount,content,note) VALUES (?,?,?,?,?)', [provider, String(txId), amount, text.slice(0, 500), '']);
    if (!ins.affectedRows) return; // đã xử lý trước đó
    let orderId = null, note = 'Không tìm thấy mã đơn trong nội dung';
    if (m) {
      const [[o]] = await c.query('SELECT total,status,payment_status FROM orders WHERE id=? FOR UPDATE', [m[0]]);
      if (!o) note = 'Mã đơn không tồn tại';
      else {
        orderId = m[0];
        if (o.payment_status === 'paid') note = 'Đơn đã thanh toán trước đó (có thể khách chuyển trùng)';
        else if (o.status === STATUS[3]) note = 'Đơn đã hủy - cần xử lý/hoàn tiền thủ công';
        else if (amount < o.total) note = `Thiếu tiền: nhận ${amount}, cần ${o.total}`;
        else { await c.query("UPDATE orders SET payment_status='paid', paid_at=NOW() WHERE id=?", [orderId]); note = amount > o.total ? 'Đã thanh toán (thừa tiền)' : 'Đã thanh toán tự động'; }
      }
    }
    await c.query('UPDATE bank_transactions SET order_id=?, note=? WHERE id=?', [orderId, note, ins.insertId]);
    console.log(`💰 [${provider}] ${amount}đ "${text.slice(0, 60)}" → ${orderId || '-'}: ${note}`);
  });
};
exports.expireUnpaid = async () => { // tự hủy đơn VietQR quá hạn và trả kho
  if (!PAY_TIMEOUT) return;
  try {
    const [os] = await pool.query("SELECT id FROM orders WHERE pay='vietqr' AND payment_status='unpaid' AND status=? AND created_at < NOW() - INTERVAL ? MINUTE", [STATUS[0], PAY_TIMEOUT]);
    for (const o of os) await tx(async c => {
      const [[r]] = await c.query('SELECT status,payment_status FROM orders WHERE id=? FOR UPDATE', [o.id]);
      if (r.status === STATUS[0] && r.payment_status === 'unpaid') { await c.query('UPDATE orders SET status=? WHERE id=?', [STATUS[3], o.id]); await restock(c, o.id); console.log('⏱ Hủy đơn quá hạn:', o.id); }
    });
  } catch (e) { console.error('expireUnpaid:', e.message); }
};
