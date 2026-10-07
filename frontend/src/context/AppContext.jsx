import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authService from '../services/authService';
import * as cartService from '../services/cartService';
import { getToken } from '../services/api';

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

export function AppProvider({ children }) {
  const nav = useNavigate();
  const [user, setUser] = useState(authService.getUser());
  const [cartCount, setCartCount] = useState(0);
  const [toast, setToast] = useState('');

  const notify = useCallback(m => { setToast(m); clearTimeout(window._tt); window._tt = setTimeout(() => setToast(''), 2200); }, []);
  const refreshCart = useCallback(async () => {
    if (!getToken()) return setCartCount(0);
    try { setCartCount((await cartService.list()).reduce((s, i) => s + i.qty, 0)); } catch { setCartCount(0); }
  }, []);
  useEffect(() => { refreshCart(); }, [user, refreshCart]);
  useEffect(() => { const f = () => setUser(null); window.addEventListener('vn-logout', f); return () => window.removeEventListener('vn-logout', f); }, []);

  const signIn = u => setUser(u);
  const signOut = () => { authService.logout(); setUser(null); };
  const addToCart = async (id, qty = 1) => {
    if (!getToken()) { notify('Vui lòng đăng nhập để mua hàng'); nav('/login', { state: { from: window.location.pathname } }); return; }
    try { await cartService.add(id, qty); await refreshCart(); notify('Đã thêm vào giỏ hàng!'); } catch (e) { notify(e.message); }
  };

  return (
    <Ctx.Provider value={{ user, signIn, signOut, cartCount, refreshCart, notify, addToCart }}>
      {children}
      {toast && <div id="toast" style={{ display: 'block' }}>{toast}</div>}
    </Ctx.Provider>
  );
}
