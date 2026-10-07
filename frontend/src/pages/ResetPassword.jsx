import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import * as authService from '../services/authService';
export default function ResetPassword() {
  const [sp] = useSearchParams(), token = sp.get('token') || '', { notify } = useApp(), nav = useNavigate();
  const [p1, setP1] = useState(''), [p2, setP2] = useState('');
  async function submit(e) {
    e.preventDefault();
    if (p1 !== p2) return notify('Mật khẩu nhập lại không khớp');
    try { await authService.reset(token, p1); notify('Đổi mật khẩu thành công!'); setTimeout(() => nav('/login'), 1200); } catch (err) { notify(err.message); }
  }
  return (
    <form className="box" onSubmit={submit} style={{ maxWidth: 400, margin: 'auto' }}>
      <h2>Đặt lại mật khẩu</h2>
      <input type="password" required minLength="6" placeholder="Mật khẩu mới (≥ 6 ký tự)" value={p1} onChange={e => setP1(e.target.value)} />
      <input type="password" required placeholder="Nhập lại mật khẩu mới" value={p2} onChange={e => setP2(e.target.value)} />
      <button className="btn">Đổi mật khẩu</button>
    </form>
  );
}
