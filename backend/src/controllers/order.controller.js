const svc = require('../services/order.service'), { wrap, same } = require('../utils/http'), { E } = require('../config');
exports.create = wrap(async (q, s) => s.json(await svc.create(q.user.id, q.body)));
exports.mine = wrap(async (q, s) => s.json(await svc.mine(q.user.id)));
exports.get = wrap(async (q, s) => s.json(await svc.get(q.user.id, q.params.id)));
exports.payment = wrap(async (q, s) => s.json(await svc.paymentStatus(q.user.id, q.params.id)));
exports.cancel = wrap(async (q, s) => s.json(await svc.cancel(q.user.id, q.params.id)));
exports.adminList = wrap(async (q, s) => s.json(await svc.adminList()));
exports.stats = wrap(async (q, s) => s.json(await svc.stats()));
exports.setStatus = wrap(async (q, s) => s.json(await svc.setStatus(q.params.id, q.body.status)));
exports.markPaid = wrap(async (q, s) => s.json(await svc.markPaid(q.params.id)));

exports.sepay = wrap(async (q, s) => { // SePay: Authorization: Apikey <SEPAY_API_KEY>
  if (!E.SEPAY_API_KEY || !same(q.headers.authorization || '', 'Apikey ' + E.SEPAY_API_KEY)) return s.status(401).json({ success: false });
  const b = q.body || {};
  if (b.transferType === 'in') await svc.onPayment('sepay', b.id, b.transferAmount, `${b.code || ''} ${b.content || ''}`);
  s.json({ success: true });
});
exports.casso = wrap(async (q, s) => { // Casso (Webhook): header secure-token
  if (!E.CASSO_SECURE_TOKEN || !same(q.headers['secure-token'] || '', E.CASSO_SECURE_TOKEN)) return s.status(401).json({ success: false });
  const d = q.body && q.body.data;
  for (const t of Array.isArray(d) ? d : d ? [d] : []) if (+t.amount > 0) await svc.onPayment('casso', t.id ?? t.tid, t.amount, t.description);
  s.json({ error: 0, success: true });
});
