import { api } from './api';
export const list = () => api('/cart');
export const add = (productId, qty = 1) => api('/cart', { method: 'POST', body: { productId, qty } });
export const setQty = (productId, qty) => api('/cart/' + productId, { method: 'PUT', body: { qty } });
export const remove = productId => api('/cart/' + productId, { method: 'DELETE' });
