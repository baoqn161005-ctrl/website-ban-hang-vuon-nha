exports.requireRole = role => (q, s, n) => q.user && q.user.role === role ? n() : s.status(403).json({ error: 'Không có quyền truy cập' });
