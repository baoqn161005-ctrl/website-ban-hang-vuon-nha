import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import * as authService from '../services/authService';
import AuthLayout from '../layouts/AuthLayout';

export default function Register() {
  const { signIn, notify } = useApp();
  const nav = useNavigate();

  const [f, setF] = useState({
    name: '',
    email: '',
    password: '',
    password2: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = k => e => {
    setF({
      ...f,
      [k]: e.target.value
    });
  };

  async function submit(e) {
    e.preventDefault();

    if (f.password !== f.password2) {
      notify('Mật khẩu nhập lại không khớp');
      return;
    }

    setLoading(true);

    try {
      const u = await authService.register(
        f.name,
        f.email,
        f.password
      );

      signIn(u);

      nav('/', { replace: true });
    } catch (err) {
      notify(err.message);
      setLoading(false);
    }
  }

  return (
    <AuthLayout>

      <h2>ĐĂNG KÝ TÀI KHOẢN</h2>

      <form onSubmit={submit}>

        {/* Họ tên */}
        <div className="auth-field">
          <label>Họ tên</label>

          <div className="auth-input">
            <span>👤</span>

            <input
              type="text"
              required
              placeholder="Nhập họ tên của bạn"
              value={f.name}
              onChange={set('name')}
            />
          </div>
        </div>

        {/* Email */}
        <div className="auth-field">
          <label>Email</label>

          <div className="auth-input">
            <span>✉</span>

            <input
              type="email"
              required
              placeholder="Nhập email của bạn"
              value={f.email}
              onChange={set('email')}
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
              minLength="6"
              placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
              value={f.password}
              onChange={set('password')}
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

        {/* Nhập lại mật khẩu */}
        <div className="auth-field">
          <label>Nhập lại mật khẩu</label>

          <div className="auth-input">
            <span>🔒</span>

            <input
              type={showPassword2 ? 'text' : 'password'}
              required
              placeholder="Nhập lại mật khẩu"
              value={f.password2}
              onChange={set('password2')}
            />

            <button
              type="button"
              onClick={() => setShowPassword2(!showPassword2)}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                padding: '0 10px'
              }}
            >
              {showPassword2 ? '🙈' : '👁'}
            </button>
          </div>
        </div>

        {/* Nút đăng ký */}
        <button
          type="submit"
          className="auth-submit"
          disabled={loading}
        >
          {loading ? 'ĐANG ĐĂNG KÝ...' : 'ĐĂNG KÝ'}
        </button>

      </form>

      <div className="auth-bottom">
        Đã có tài khoản?
        {' '}

        <Link
          to="/login"
          className="auth-link"
        >
          Đăng nhập
        </Link>
      </div>

    </AuthLayout>
  );
}