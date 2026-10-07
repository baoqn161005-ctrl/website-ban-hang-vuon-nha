import { api } from './api';
export const create = info => api('/orders', { method: 'POST', body: info });
export const mine = () => api('/orders');
export const get = id => api(`/orders/${id}`);
export const cancel = id => api(`/orders/${id}/cancel`, { method: 'POST' });
export const paymentStatus = id => api(`/orders/${id}/payment`);
