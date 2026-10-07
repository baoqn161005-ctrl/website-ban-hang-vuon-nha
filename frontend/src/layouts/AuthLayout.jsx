import '../styles/auth.css';

export default function AuthLayout({ children }) {
  return (
    <div className="auth-page">
      <div className="auth-overlay"></div>

      <div className="auth-container">

        {/* Bên trái: Logo và thông tin Vườn Nhà */}
        <div className="auth-brand">

          <img
            src="/images/logo_VuonNha.png"
            alt="Vườn Nhà"
            className="auth-logo"
          />

          <h1>VƯỜN NHÀ</h1>

          <p>
            CỬA HÀNG CÂY CẢNH VÀ
            <br />
            DỤNG CỤ TRỒNG CÂY
          </p>

        </div>

        {/* Bên phải: Nội dung Login/Register/Forgot Password */}
        <div className="auth-form-area">
          {children}
        </div>

      </div>
    </div>
  );
}