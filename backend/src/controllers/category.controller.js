const svc = require('../services/category.service'), { wrap } = require('../utils/http');
exports.list = wrap(async (q, s) => s.json(await svc.list()));
exports.create = wrap(async (q, s) => s.json(await svc.create(q.body)));
exports.update = wrap(async (q, s) => s.json(await svc.update(q.params.id, q.body)));
exports.remove = wrap(async (q, s) => s.json(await svc.remove(q.params.id)));
