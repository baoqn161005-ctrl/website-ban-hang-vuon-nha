// Gọi API backend. Token đăng nhập lưu trong localStorage.
export const getToken = () => localStorage.getItem('vn_token');
export const money = n => Number(n).toLocaleString('vi-VN') + 'đ';
export const pct = p => (p.old > p.price ? Math.round(((p.old - p.price) / p.old) * 100) : 0);

export async function api(path, { method = 'GET', body } = {}) {
  const fd = body instanceof FormData, t = getToken();
  let r;
  try {
    r = await fetch('/api' + path, {
      method, body: body && !fd ? JSON.stringify(body) : body,
      headers: { ...(body && !fd ? { 'Content-Type': 'application/json' } : {}), ...(t ? { Authorization: 'Bearer ' + t } : {}) }
    });
  } catch { throw new Error('Không kết nối được máy chủ. Hãy chạy backend (npm start trong thư mục backend).'); }
  const d = await r.json().catch(() => ({}));
  if (!r.ok) {
    if (r.status === 401 && t) { // token hết hạn
      localStorage.removeItem('vn_token'); localStorage.removeItem('vn_user'); window.dispatchEvent(new Event('vn-logout'));
    }
    throw Object.assign(new Error(d.error || 'Lỗi ' + r.status), { status: r.status });
  }
  return d;
}
export const getConfig = () => api('/config');
