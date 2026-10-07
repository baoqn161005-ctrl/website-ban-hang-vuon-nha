const jwt = require('jsonwebtoken'), { SECRET } = require('../config');
exports.auth = (q, s, n) => {
  try { q.user = jwt.verify((q.headers.authorization || '').slice(7), SECRET); } catch { return s.status(401).json({ error: 'Vui lòng đăng nhập' }); }
  n();
};
const tries = new Map(); // giới hạn: 10 lần / 15 phút / IP / đường dẫn
exports.limit = (q, s, n) => {
  const k = q.ip + q.path, t = Date.now(), a = (tries.get(k) || []).filter(x => t - x < 9e5);
  if (a.length >= 10) return s.status(429).json({ error: 'Thử quá nhiều lần, vui lòng đợi 15 phút' });
  a.push(t); tries.set(k, a); n();
};
