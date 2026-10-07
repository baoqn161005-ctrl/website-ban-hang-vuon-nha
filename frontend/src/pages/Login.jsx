import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import * as authService from '../services/authService';
import AuthLayout from '../layouts/AuthLayout';

export default function Login() {
  const { signIn, notify } = useApp();
  const nav = useNavigate();
  const loc = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const u = await authService.login(email, password);

      signIn(u);

      nav(
        u.role === 'admin'
          ? '/admin'
          : loc.state?.from || '/',
        { replace: true }
      );
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <AuthLayout>

      <h2>ĐĂNG NHẬP</h2>

      <form onSubmit={submit}>

        {/* Email */}
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

        {/* Mật khẩu */}
        <div className="auth-field">
          <label>Mật khẩu</label>

          <div className="auth-input">
            <span>🔒</span>

            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                padding: '0 10px'
              }}
            >
              {showPassword ? '🙈' : '👁'}
            </button>
          </div>
        </div>
        
        {/* Thông báo lỗi đăng nhập */}
        {error && (
          <div className="auth-error">
            ❌ {error}
          </div>
        )}

        {/* Quên mật khẩu */}
        <div style={{
          textAlign: 'right',
          marginBottom: '18px'
        }}>
          <Link
            to="/forgot-password"
            className="auth-link"
          >
            Quên mật khẩu?
          </Link>
        </div>

        {/* Đăng nhập */}
        <button
          type="submit"
          className="auth-submit"
          disabled={loading}
        >
          {loading ? 'ĐANG ĐĂNG NHẬP...' : 'ĐĂNG NHẬP'}
        </button>

      </form>

      <div className="auth-bottom">
        Chưa có tài khoản?
        {' '}
        <Link
          to="/register"
          className="auth-link"
        >
          Đăng ký
        </Link>
      </div>

    </AuthLayout>
  );
}