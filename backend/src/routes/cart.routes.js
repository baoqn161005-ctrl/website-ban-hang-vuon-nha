const r = require('express').Router(), c = require('../controllers/cart.controller'), { auth } = require('../middleware/auth.middleware');
r.get('/cart', auth, c.list);
r.post('/cart', auth, c.add);
r.put('/cart/:productId', auth, c.set);
r.delete('/cart/:productId', auth, c.remove);
module.exports = r;
