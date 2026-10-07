const r = require('express').Router(), c = require('../controllers/category.controller');
const { auth } = require('../middleware/auth.middleware'), { requireRole } = require('../middleware/role.middleware');
const admin = [auth, requireRole('admin')];
r.get('/categories', c.list);
r.post('/categories', ...admin, c.create);
r.put('/categories/:id', ...admin, c.update);
r.delete('/categories/:id', ...admin, c.remove);
module.exports = r;
