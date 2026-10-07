const nodemailer = require('nodemailer'), { E } = require('./index');
const mailer = E.SMTP_HOST ? nodemailer.createTransport({ host: E.SMTP_HOST, port: +E.SMTP_PORT || 587, secure: +E.SMTP_PORT === 465,
  auth: E.SMTP_USER ? { user: E.SMTP_USER, pass: E.SMTP_PASS } : undefined }) : null;
exports.sendMail = async (to, subject, html, text) => {
  if (!mailer) { console.log(`\n[MAIL - chưa cấu hình SMTP] Tới: ${to}\n${subject}\n${text}\n`); return; }
  await mailer.sendMail({ from: E.MAIL_FROM || E.SMTP_USER, to, subject, html, text });
};
