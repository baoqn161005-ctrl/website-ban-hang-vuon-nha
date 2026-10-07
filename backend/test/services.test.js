const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
process.env.JWT_SECRET = 'unit-test-secret-at-least-16';

const calls = [];
let query;
const pool = { query: (...args) => { calls.push(args); return query(...args); } };
const tx = async fn => fn({ query: (...args) => { calls.push(args); return query(...args); } });
const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === '../config/db' && parent.filename.includes('services\\')) return { pool, tx };
  if (request === '../config' && parent.filename.includes('services\\')) return {
    SECRET: 'unit-test-secret-at-least-16', BASE: 'http://localhost',
    STATUS: ['Chờ xác nhận', 'Đang giao', 'Hoàn thành', 'Đã hủy'], PAY_TIMEOUT: 60
  };
  return originalLoad.call(this, request, parent, isMain);
};
const cart = require('../src/services/cart.service');
const order = require('../src/services/order.service');
const product = require('../src/services/product.service');
const category = require('../src/services/category.service');
const auth = require('../src/services/auth.service');
const { requireRole } = require('../src/middleware/role.middleware');
const { auth: authenticate } = require('../src/middleware/auth.middleware');
const jwt = require('jsonwebtoken');
beforeEach(() => { calls.length = 0; query = async () => [[], []]; });

test('cart add defaults invalid quantity to one and persists cumulative quantity', async () => {
  query = async sql => sql.startsWith('SELECT id,stock') ? [[{ id: 7, stock: 5 }]] : sql.startsWith('SELECT qty') ? [[{ qty: 2 }]] : [{ affectedRows: 1 }];
  assert.deepEqual(await cart.add(3, 7, 'bad'), { ok: true });
  assert.equal(calls.at(-1)[1][2], 3);
  assert.match(calls[0][0], /FOR UPDATE/);
});

test('cart add rejects missing products', async () => {
  query = async () => [[]];
  await assert.rejects(cart.add(3, 404, 1), { status: 404, message: 'Sản phẩm không tồn tại' });
});

test('cart add rejects quantity beyond available stock', async () => {
  query = async sql => sql.startsWith('SELECT id,stock') ? [[{ id: 7, stock: 2 }]] : [[{ qty: 2 }]];
  await assert.rejects(cart.add(3, 7, 1), { status: 409 });
});

test('cart set removes zero quantity and enforces stock ceiling', async () => {
  assert.deepEqual(await cart.set(3, 7, 0), { ok: true });
  assert.match(calls[0][0], /^DELETE/);
  calls.length = 0;
  query = async () => [[{ id: 7, stock: 2 }]];
  await assert.rejects(cart.set(3, 7, 3), { status: 409 });
});

test('cart list prunes sold out items, clamps quantities, then lists rows', async () => {
  query = async sql => sql.startsWith('SELECT p.id') ? [[{ id: 7, qty: 2 }]] : [{ affectedRows: 1 }];
  assert.deepEqual(await cart.list(3), [{ id: 7, qty: 2 }]);
  assert.match(calls[0][0], /^DELETE/);
  assert.match(calls[1][0], /^UPDATE/);
});

test('order creation validates checkout data before reading cart', async () => {
  await assert.rejects(order.create(3, { name: '', phone: '12', addr: '', pay: 'cash' }), { status: 400 });
  assert.equal(calls.length, 0);
});

test('order creation rejects an empty cart', async () => {
  query = async () => [[]];
  await assert.rejects(order.create(3, { name: 'A', phone: '0912345678', addr: 'Hà Nội', pay: 'cod' }), /Giỏ hàng trống/);
});

test('order creation reserves stock and atomically writes order/items and clears cart', async () => {
  query = async sql => {
    if (sql.startsWith('SELECT p.id')) return [[{ id: 7, name: 'Rau', price: 15000, qty: 2 }]];
    if (sql.startsWith('UPDATE products')) return [{ affectedRows: 1 }];
    return [{ affectedRows: 1 }];
  };
  const result = await order.create(3, { name: ' An ', phone: '0912345678', addr: ' Nhà ', pay: 'cod' });
  assert.match(result.id, /^DH\d{8}$/);
  assert.equal(result.total, 30000);
  assert.ok(calls.some(([sql]) => sql.startsWith('UPDATE products SET stock=stock-?')));
  assert.ok(calls.some(([sql]) => sql.startsWith('INSERT INTO order_items')));
  assert.ok(calls.some(([sql]) => sql.startsWith('DELETE FROM cart_items')));
});

test('order creation retries an order code collision without changing transfer code format', async () => {
  let orderInserts = 0;
  query = async sql => {
    if (sql.startsWith('SELECT p.id')) return [[{ id: 7, name: 'Rau', price: 1000, qty: 1 }]];
    if (sql.startsWith('UPDATE products')) return [{ affectedRows: 1 }];
    if (sql.startsWith('INSERT INTO orders') && orderInserts++ === 0) {
      const e = new Error('duplicate order id'); e.code = 'ER_DUP_ENTRY'; throw e;
    }
    return [{ affectedRows: 1 }];
  };
  const result = await order.create(3, { name: 'An', phone: '0912345678', addr: 'HN', pay: 'vietqr' });
  assert.match(result.id, /^DH\d{8}$/);
  assert.equal(orderInserts, 2);
});

test('order creation rejects stock race before writing order', async () => {
  query = async sql => sql.startsWith('SELECT p.id') ? [[{ id: 7, name: 'Rau', price: 1000, qty: 2 }]] : sql.startsWith('UPDATE products') ? [{ affectedRows: 0 }] : [[{ stock: 1 }]];
  await assert.rejects(order.create(3, { name: 'An', phone: '0912345678', addr: 'HN', pay: 'cod' }), { status: 409 });
  assert.equal(calls.some(([sql]) => sql.startsWith('INSERT INTO orders')), false);
});

test('customer cannot cancel paid or non-pending orders', async t => {
  query = async () => [[{ status: 'Chờ xác nhận', payment_status: 'paid' }]];
  await assert.rejects(order.cancel(3, 'DH00000001'), /đã thanh toán/);
  query = async () => [[{ status: 'Đang giao', payment_status: 'unpaid' }]];
  await assert.rejects(order.cancel(3, 'DH00000001'), /Không thể hủy/);
});

test('canceling a pending unpaid order changes status and restocks its items', async () => {
  query = async sql => sql.startsWith('SELECT status,payment_status') ? [[{ status: 'Chờ xác nhận', payment_status: 'unpaid' }]] : [{ affectedRows: 1 }];
  assert.deepEqual(await order.cancel(3, 'DH00000001'), { ok: true });
  assert.ok(calls.some(([sql]) => sql.startsWith('UPDATE products p JOIN order_items')));
});

test('admin rejects invalid status and cannot reopen canceled orders', async () => {
  await assert.rejects(order.setStatus('DH00000001', 'unknown'), /Trạng thái không hợp lệ/);
  query = async () => [[{ status: 'Đã hủy', pay: 'cod' }]];
  await assert.rejects(order.setStatus('DH00000001', 'Chờ xác nhận'), /không thể mở lại/);
});

test('admin completion marks COD paid and cancellation restocks', async () => {
  query = async sql => sql.startsWith('SELECT status,pay') ? [[{ status: 'Đang giao', pay: 'cod' }]] : [{ affectedRows: 1 }];
  await order.setStatus('DH00000001', 'Hoàn thành');
  assert.ok(calls.some(([sql]) => sql.includes("payment_status='paid'")));
  calls.length = 0;
  query = async sql => sql.startsWith('SELECT status,pay') ? [[{ status: 'Đang giao', pay: 'vietqr' }]] : [{ affectedRows: 1 }];
  await order.setStatus('DH00000001', 'Đã hủy');
  assert.ok(calls.some(([sql]) => sql.startsWith('UPDATE products p JOIN order_items')));
});

test('repeating an admin cancellation does not restock the same order twice', async () => {
  query = async sql => sql.startsWith('SELECT status,pay') ? [[{ status: 'Đã hủy', pay: 'cod' }]] : [{ affectedRows: 1 }];
  await order.setStatus('DH00000001', 'Đã hủy');
  assert.equal(calls.some(([sql]) => sql.startsWith('UPDATE products p JOIN order_items')), false);
});

test('admin payment confirmation rejects canceled orders and duplicate payment', async () => {
  query = async () => [{ affectedRows: 0 }];
  await assert.rejects(order.markPaid('DH00000001'), /Không thể xác nhận/);
});

test('order history and payment status are restricted to the requesting customer', async () => {
  query = async sql => sql.startsWith('SELECT id,name') ? [[{ id: 'DH00000001' }]] : sql.startsWith('SELECT order_id') ? [[{ order_id: 'DH00000001', qty: 1 }]] : [[{ payment_status: 'paid', status: 'Hoàn thành' }]];
  const mine = await order.mine(3);
  assert.equal(mine[0].items[0].qty, 1);
  assert.deepEqual(await order.paymentStatus(3, 'DH00000001'), { paid: true, status: 'Hoàn thành' });
  assert.ok(calls[0][0].includes('WHERE user_id=?'));
  assert.deepEqual(calls[0][1], [3]);
});

test('customer can get only their own order and gets 404 for another customer order', async () => {
  query = async sql => sql.startsWith('SELECT id,name') ? [[{ id: 'DH00000001' }]] : [[{ order_id: 'DH00000001', qty: 2 }]];
  const result = await order.get(3, 'DH00000001');
  assert.equal(result.items[0].qty, 2);
  assert.deepEqual(calls[0][1], [3, 'DH00000001']);
  query = async () => [[]];
  await assert.rejects(order.get(4, 'DH00000001'), { status: 404 });
});

test('payment webhook is idempotent and only pays matching orders with sufficient amount', async () => {
  query = async sql => {
    if (sql.startsWith('INSERT IGNORE')) return [{ affectedRows: 1, insertId: 8 }];
    if (sql.startsWith('SELECT total')) return [[{ total: 20000, status: 'Chờ xác nhận', payment_status: 'unpaid' }]];
    return [{ affectedRows: 1 }];
  };
  await order.onPayment('sepay', 'tx1', 19000, 'DH12345678');
  assert.equal(calls.some(([sql]) => sql.startsWith('UPDATE orders SET payment_status')), false);
  calls.length = 0;
  query = async sql => sql.startsWith('INSERT IGNORE') ? [{ affectedRows: 0 }] : [[], []];
  await order.onPayment('sepay', 'tx1', 25000, 'DH12345678');
  assert.equal(calls.length, 1);
});

test('product list clamps pagination and combines search and category filters', async () => {
  query = async sql => sql.startsWith('SELECT COUNT') ? [[{ n: 1 }]] : [[{ id: 2 }]];
  const result = await product.list({ q: 'rau', cat: '4', per: '500', page: '9' });
  assert.deepEqual(result, { items: [{ id: 2 }], total: 1, pages: 1, page: 1 });
  assert.match(calls[0][0], /p\.name LIKE \? AND p\.category_id=\?/);
  assert.deepEqual(calls[0][1], ['%rau%', 4]);
  assert.deepEqual(calls[1][1], ['%rau%', 4, 50, 0]);
});

test('product create validates required fields and normalizes old price and stock', async () => {
  await assert.rejects(product.create({ name: '', price: 2, category_id: 1 }), /Thiếu tên/);
  let values;
  query = async (_sql, params) => { values = params; return [{ insertId: 9 }]; };
  assert.deepEqual(await product.create({ name: ' Rau ', price: '100', old_price: '80', category_id: '2', stock: '-4' }), { id: 9 });
  assert.deepEqual(values, ['Rau', 100, 0, 2, '', '', 0]);
});

test('product detail returns not found and delete uses numeric id', async () => {
  query = async () => [[]];
  await assert.rejects(product.get('999'), { status: 404 });
  query = async () => [{ affectedRows: 1 }];
  await product.remove('9');
  assert.deepEqual(calls.at(-1)[1], [9]);
});

test('category CRUD trims names and rejects blank values', async () => {
  await assert.rejects(category.create({ name: '  ' }), /Thiếu tên/);
  query = async () => [{ insertId: 5 }];
  assert.deepEqual(await category.create({ name: '  Cây cảnh  ' }), { id: 5, name: 'Cây cảnh' });
  assert.deepEqual(calls.at(-1)[1], ['Cây cảnh']);
});

test('admin role middleware allows admin and blocks customers or anonymous users', () => {
  let nextCount = 0;
  const next = () => { nextCount += 1; };
  const responseFor = () => ({ statusCode: 0, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } });
  const middleware = requireRole('admin');
  middleware({ user: { role: 'admin' } }, responseFor(), next);
  assert.equal(nextCount, 1);
  const customerResponse = responseFor();
  middleware({ user: { role: 'user' } }, customerResponse, next);
  assert.equal(customerResponse.statusCode, 403);
  const anonymousResponse = responseFor();
  middleware({}, anonymousResponse, next);
  assert.equal(anonymousResponse.statusCode, 403);
});

test('JWT middleware accepts valid token and rejects invalid or missing token', () => {
  const responseFor = () => ({ statusCode: 0, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } });
  const user = { id: 2, role: 'user' };
  let nextCount = 0;
  authenticate({ headers: { authorization: 'Bearer ' + jwt.sign(user, process.env.JWT_SECRET) } }, responseFor(), () => { nextCount += 1; });
  assert.equal(nextCount, 1);
  for (const authorization of ['', 'Bearer invalid']) {
    const response = responseFor();
    authenticate({ headers: { authorization } }, response, () => { nextCount += 1; });
    assert.equal(response.statusCode, 401);
  }
});

test('registration normalizes email and rejects invalid credentials before database access', async () => {
  await assert.rejects(auth.register({ name: ' ', email: 'x', password: '123' }), /Họ tên/);
  assert.equal(calls.length, 0);
  query = async (_sql, params) => [{ insertId: 42, params }];
  const result = await auth.register({ name: ' An ', email: ' AN@EXAMPLE.COM ', password: 'secret1' });
  assert.equal(result.user.id, 42);
  assert.equal(result.user.name, 'An');
  assert.equal(calls[0][1][1], 'an@example.com');
  assert.equal(result.user.role, 'user');
});

test('login gives the same unauthorized response for missing user and wrong password', async () => {
  query = async () => [[]];
  await assert.rejects(auth.login({ email: 'missing@example.com', password: 'secret1' }), { status: 401, message: 'Sai email hoặc mật khẩu' });
  query = async () => [[{ id: 1, email: 'a@b.co', password_hash: '$2a$10$bad', name: 'A', role: 'user' }]];
  await assert.rejects(auth.login({ email: 'a@b.co', password: 'wrong' }), { status: 401, message: 'Sai email hoặc mật khẩu' });
});

test('forgot password keeps response generic and skips database for invalid email', async () => {
  const response = await auth.forgot('not-an-email');
  assert.equal(response.ok, true);
  assert.equal(calls.length, 0);
});

test('password reset rejects short password and expired or unknown token', async () => {
  await assert.rejects(auth.reset({ token: 'x', password: '123' }), /tối thiểu 6/);
  query = async () => [[]];
  await assert.rejects(auth.reset({ token: 'x', password: 'secret1' }), /không hợp lệ hoặc đã hết hạn/);
});
