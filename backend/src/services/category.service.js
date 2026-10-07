const { pool } = require('../config/db'), { bad } = require('../utils/http');
const name = b => { const n = String(b.name || '').trim(); if (!n) throw bad('Thiếu tên danh mục'); return n; };
exports.list = async () => (await pool.query('SELECT id,name FROM categories ORDER BY id'))[0];
exports.create = async b => { const n = name(b); const [r] = await pool.query('INSERT INTO categories (name) VALUES (?)', [n]); return { id: r.insertId, name: n }; };
exports.update = async (id, b) => { await pool.query('UPDATE categories SET name=? WHERE id=?', [name(b), +id]); return { ok: true }; };
exports.remove = async id => { await pool.query('DELETE FROM categories WHERE id=?', [+id]); return { ok: true }; };
