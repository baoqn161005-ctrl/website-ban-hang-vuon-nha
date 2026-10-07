const crypto = require('crypto');
const sha = x => crypto.createHash('sha256').update(String(x)).digest('hex');
module.exports = {
  sha,
  bad: (m, status = 400) => Object.assign(new Error(m), { status }),
  wrap: f => (q, s, n) => f(q, s, n).catch(n),
  same: (a, b) => crypto.timingSafeEqual(Buffer.from(sha(a)), Buffer.from(sha(b))),
  escH: s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
};
