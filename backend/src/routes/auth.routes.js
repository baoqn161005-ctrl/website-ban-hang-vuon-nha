const r = require('express').Router(), c = require('../controllers/auth.controller'), { limit } = require('../middleware/auth.middleware');
r.post('/auth/register', c.register);
r.post('/auth/login', limit, c.login);
r.post('/auth/forgot', limit, c.forgot);
r.post('/auth/reset', limit, c.reset);
module.exports = r;
