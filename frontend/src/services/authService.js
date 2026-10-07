import { api } from './api';
export const getUser = () => { try { return JSON.parse(localStorage.getItem('vn_user')); } catch { return null; } };
const save = r => { localStorage.setItem('vn_token', r.token); localStorage.setItem('vn_user', JSON.stringify(r.user)); return r.user; };
export const login = async (email, password) => save(await api('/auth/login', { method: 'POST', body: { email, password } }));
export const register = async (name, email, password) => save(await api('/auth/register', { method: 'POST', body: { name, email, password } }));
export const logout = () => { localStorage.removeItem('vn_token'); localStorage.removeItem('vn_user'); };
export const forgot = email => api('/auth/forgot', { method: 'POST', body: { email } });
export const reset = (token, password) => api('/auth/reset', { method: 'POST', body: { token, password } });
