const bcrypt = require('bcryptjs'), jwt = require('jsonwebtoken'), crypto = require('crypto');
const { pool, tx } = require('../config/db'), { SECRET, BASE } = require('../config'), { sendMail } = require('../config/mailer');
const { bad, sha, escH } = require('../utils/http');
const sign = u => ({ token: jwt.sign({ id: u.id, name: u.name, role: u.role }, SECRET, { expiresIn: '7d' }), user: { id: u.id, name: u.name, role: u.role } });

exports.register = async ({ name, email, password }) => {
  const em = String(email || '').trim().toLowerCase();
  if (!String(name || '').trim() || !/^\S+@\S+\.\S+$/.test(em) || String(password || '').length < 6) throw bad('Họ tên, email hợp lệ và mật khẩu ≥ 6 ký tự là bắt buộc');
  try {
    const [r] = await pool.query("INSERT INTO users (name,email,password_hash,role) VALUES (?,?,?,'user')", [name.trim(), em, await bcrypt.hash(password, 10)]);
    return sign({ id: r.insertId, name: name.trim(), role: 'user' });
  } catch (x) { throw x.code === 'ER_DUP_ENTRY' ? bad('Email đã tồn tại', 409) : x; }
};
exports.login = async ({ email, password }) => {
  const [[u]] = await pool.query('SELECT * FROM users WHERE email=?', [String(email || '').trim().toLowerCase()]);
  if (!u || !(await bcrypt.compare(String(password || ''), u.password_hash))) throw bad('Sai email hoặc mật khẩu', 401);
  return sign(u);
};
// Luôn trả cùng một thông báo để không lộ email nào đã đăng ký
exports.forgot = async email => {
  const msg = { ok: true, message: 'Nếu email tồn tại trong hệ thống, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu. Vui lòng kiểm tra hộp thư (cả mục Spam).' };
  const em = String(email || '').trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(em)) return msg;
  const [[u]] = await pool.query('SELECT id,name FROM users WHERE email=?', [em]);
  if (u) {
    const raw = crypto.randomBytes(32).toString('hex');
    await pool.query('DELETE FROM password_resets WHERE user_id=? OR expires_at<NOW()', [u.id]);
    await pool.query('INSERT INTO password_resets (user_id,token_hash,expires_at) VALUES (?,?,NOW() + INTERVAL 30 MINUTE)', [u.id, sha(raw)]);
    const link = `${BASE}/reset-password?token=${raw}`;
    sendMail(em, 'Đặt lại mật khẩu - Vườn Nhà',
      `<p>Xin chào ${escH(u.name)},</p><p>Bấm vào liên kết dưới đây để đặt lại mật khẩu (hiệu lực 30 phút):</p><p><a href="${link}">${link}</a></p><p>Nếu không phải bạn yêu cầu, hãy bỏ qua email này.</p>`,
      `Xin chào ${u.name},\nĐặt lại mật khẩu (hiệu lực 30 phút): ${link}\nNếu không phải bạn yêu cầu, hãy bỏ qua email này.`
    ).catch(x => console.error('✖ Gửi email lỗi:', x.message)); // không await: tránh lộ email tồn tại qua thời gian phản hồi
  }
  return msg;
};
exports.reset = async ({ token, password }) => {
  if (String(password || '').length < 6) throw bad('Mật khẩu tối thiểu 6 ký tự');
  await tx(async c => {
    const [[r]] = await c.query('SELECT user_id FROM password_resets WHERE token_hash=? AND expires_at>NOW() FOR UPDATE', [sha(token || '')]);
    if (!r) throw bad('Liên kết không hợp lệ hoặc đã hết hạn');
    await c.query('UPDATE users SET password_hash=? WHERE id=?', [await bcrypt.hash(password, 10), r.user_id]);
    await c.query('DELETE FROM password_resets WHERE user_id=?', [r.user_id]);
  });
  return { ok: true };
};
