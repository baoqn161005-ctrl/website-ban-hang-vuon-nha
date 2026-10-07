import { api } from './api';
export const list = (params = {}) => api('/products?' + new URLSearchParams(Object.entries(params).filter(([, v]) => v !== '' && v != null)));
export const get = id => api('/products/' + id);
export const categories = () => api('/categories');
