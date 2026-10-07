const express = require('express'), path = require('path'), fs = require('fs');
const { E } = require('./config'), { UPLOAD_DIR } = require('./config/upload');
const { notFound, errorHandler } = require('./middleware/error.middleware');
const app = express(); app.use(express.json());

app.get('/api/config', (q, s) => s.json({
  shop: { addr: E.SHOP_ADDR, phone: E.SHOP_PHONE, email: E.SHOP_EMAIL, hours: E.SHOP_HOURS },
  bank: { id: E.BANK_ID, no: E.BANK_NO, name: E.BANK_NAME }
}));
['auth', 'product', 'category', 'cart', 'order'].forEach(n => app.use('/api', require(`./routes/${n}.routes`)));
app.use('/api', notFound);
app.use('/uploads', express.static(UPLOAD_DIR));

// Nếu đã build frontend (frontend/dist) thì backend phục vụ luôn, chạy 1 cổng duy nhất
const dist = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(dist)) { app.use(express.static(dist)); app.get('*', (q, s) => s.sendFile(path.join(dist, 'index.html'))); }

app.use(errorHandler);
module.exports = app;
