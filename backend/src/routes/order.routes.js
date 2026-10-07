const r = require('express').Router(), c = require('../controllers/order.controller');
const { auth } = require('../middleware/auth.middleware'), { requireRole } = require('../middleware/role.middleware');
const admin = [auth, requireRole('admin')];
r.post('/orders', auth, c.create);
r.get('/orders', auth, c.mine);
r.get('/orders/admin/all', ...admin, c.adminList);
r.get('/orders/admin/stats', ...admin, c.stats);
r.get('/orders/:id', auth, c.get);
r.get('/orders/:id/payment', auth, c.payment);
r.post('/orders/:id/cancel', auth, c.cancel);
r.put('/orders/:id/status', ...admin, c.setStatus);
r.put('/orders/:id/paid', ...admin, c.markPaid);
r.post('/webhook/sepay', c.sepay);   // SePay gọi vào đây
r.post('/webhook/casso', c.casso);   // Casso gọi vào đây
module.exports = r;
