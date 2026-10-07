const svc = require('../services/product.service'), { wrap } = require('../utils/http');
exports.list = wrap(async (q, s) => s.json(await svc.list(q.query)));
exports.get = wrap(async (q, s) => s.json(await svc.get(q.params.id)));
exports.create = wrap(async (q, s) => s.json(await svc.create(q.body, q.file)));
exports.update = wrap(async (q, s) => s.json(await svc.update(q.params.id, q.body, q.file)));
exports.remove = wrap(async (q, s) => s.json(await svc.remove(q.params.id)));
