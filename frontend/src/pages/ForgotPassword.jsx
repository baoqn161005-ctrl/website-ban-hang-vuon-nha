import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import * as authService from '../services/authService';
import AuthLayout from '../layouts/AuthLayout';

export default function ForgotPassword() {
  const { notify } = useApp();

  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();

    setBusy(true);

    try {
      const result = await authService.forgot(email);
      setMsg(result.message);
    } catch (err) {
      notify(err.message);
      setBusy(false);
    }
  }

  return (
    <AuthLayout>

      <h2>QUÊN MẬT KHẨU</h2>

      {!msg ? (
        <>
          <p style={{
            color: '#555',
            fontSize: '14px',
            lineHeight: '1.5',
            marginBottom: '20px'
          }}>
            Nhập email đã đăng ký, chúng tôi sẽ gửi
            liên kết đặt lại mật khẩu.
          </p>

          <form onSubmit={submit}>

            <div className="auth-field">
              <label>Email</label>

              <div className="auth-input">
                <span>✉</span>

                <input
                  type="email"
                  required
                  placeholder="Nhập email của bạn"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="auth-submit"
              disabled={busy}
            >
              {busy ? 'ĐANG GỬI...' : 'GỬI LIÊN KẾT'}
            </button>

          </form>

          <div className="auth-bottom">
            <Link
              to="/login"
              className="auth-link"
            >
              ← Quay lại đăng nhập
            </Link>
          </div>
        </>
      ) : (
        <div style={{
          textAlign: 'center',
          color: '#555',
          lineHeight: '1.6'
        }}>

          <p>{msg}</p>

          <Link
            to="/login"
            className="auth-link"
          >
            ← Quay lại đăng nhập
          </Link>

        </div>
      )}

    </AuthLayout>
  );
}