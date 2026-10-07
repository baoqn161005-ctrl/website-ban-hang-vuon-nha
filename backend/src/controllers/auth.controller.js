const svc = require('../services/auth.service'), { wrap } = require('../utils/http');
exports.register = wrap(async (q, s) => s.json(await svc.register(q.body)));
exports.login = wrap(async (q, s) => s.json(await svc.login(q.body)));
exports.forgot = wrap(async (q, s) => s.json(await svc.forgot(q.body.email)));
exports.reset = wrap(async (q, s) => s.json(await svc.reset(q.body)));
