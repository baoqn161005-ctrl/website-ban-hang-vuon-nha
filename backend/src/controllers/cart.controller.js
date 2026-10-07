const svc = require('../services/cart.service'), { wrap } = require('../utils/http');
exports.list = wrap(async (q, s) => s.json(await svc.list(q.user.id)));
exports.add = wrap(async (q, s) => s.json(await svc.add(q.user.id, q.body.productId, q.body.qty)));
exports.set = wrap(async (q, s) => s.json(await svc.set(q.user.id, q.params.productId, q.body.qty)));
exports.remove = wrap(async (q, s) => s.json(await svc.remove(q.user.id, q.params.productId)));
