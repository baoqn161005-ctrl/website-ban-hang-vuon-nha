const r = require('express').Router(), c = require('../controllers/product.controller');
const { auth } = require('../middleware/auth.middleware'), { requireRole } = require('../middleware/role.middleware'), { upload } = require('../config/upload');
const admin = [auth, requireRole('admin')];
r.get('/products', c.list);
r.get('/products/:id', c.get);
r.post('/products', ...admin, upload.single('image'), c.create);
r.put('/products/:id', ...admin, upload.single('image'), c.update);
r.delete('/products/:id', ...admin, c.remove);
module.exports = r;
