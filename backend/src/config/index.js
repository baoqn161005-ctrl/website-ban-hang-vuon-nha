require('dotenv').config();
const E = process.env;
if (!E.JWT_SECRET || E.JWT_SECRET.length < 16) { console.error('✖ Hãy đặt JWT_SECRET (>= 16 ký tự) trong file .env'); process.exit(1); }
module.exports = {
  E, SECRET: E.JWT_SECRET,
  STATUS: ['Chờ xác nhận', 'Đang giao', 'Hoàn thành', 'Đã hủy'],
  BASE: (E.BASE_URL || 'http://localhost:5173').replace(/\/$/, ''),
  PAY_TIMEOUT: E.PAY_TIMEOUT_MIN === undefined || E.PAY_TIMEOUT_MIN === '' ? 60 : +E.PAY_TIMEOUT_MIN
};
