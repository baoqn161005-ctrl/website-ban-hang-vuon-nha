// npm run setup: nạp database/vuon_nha.sql rồi tạo tài khoản admin (chạy lại an toàn)
require('dotenv').config();
const fs = require('fs'), path = require('path'), mysql = require('mysql2/promise'), bcrypt = require('bcryptjs');
(async () => {
  const e = process.env, name = (e.DB_NAME || 'vuon_nha').replace(/[^\w]/g, '');
  const c = await mysql.createConnection({ host: e.DB_HOST || 'localhost', user: e.DB_USER || 'root', password: e.DB_PASSWORD || '', multipleStatements: true });
  const sql = fs.readFileSync(path.join(__dirname, '../../database/vuon_nha.sql'), 'utf8').replace(/vuon_nha/g, name);
  await c.query(sql);
  const em = (e.ADMIN_EMAIL || 'admin@vuonnha.vn').toLowerCase();
  const [u] = await c.query('SELECT id FROM users WHERE email=?', [em]);
  if (!u.length) await c.query("INSERT INTO users (name,email,password_hash,role) VALUES ('Quản trị viên',?,?,'admin')", [em, await bcrypt.hash(e.ADMIN_PASSWORD || 'admin123', 10)]);
  console.log(`✔ Database "${name}" sẵn sàng. Admin: ${em}`);
  await c.end();
})().catch(x => { console.error('✖ Lỗi:', x.message); process.exit(1); });
