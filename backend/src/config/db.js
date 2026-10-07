require('dotenv').config();
const mysql = require('mysql2/promise'), E = process.env;
const pool = mysql.createPool({ host: E.DB_HOST || 'localhost', user: E.DB_USER || 'root', password: E.DB_PASSWORD || '',
  database: E.DB_NAME || 'vuon_nha', charset: 'utf8mb4', waitForConnections: true, connectionLimit: 10 });
async function tx(fn) { // chạy fn trong một giao dịch
  const c = await pool.getConnection();
  try { await c.beginTransaction(); const r = await fn(c); await c.commit(); return r; }
  catch (e) { await c.rollback(); throw e; } finally { c.release(); }
}
module.exports = { pool, tx };
