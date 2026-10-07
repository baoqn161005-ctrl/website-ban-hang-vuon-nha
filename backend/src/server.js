const app = require('./app'), { E } = require('./config'), orders = require('./services/order.service');
const port = E.PORT || 3000;
app.listen(port, () => console.log(`🌿 Backend Vườn Nhà chạy tại http://localhost:${port}`));
setInterval(orders.expireUnpaid, 5 * 60 * 1000); orders.expireUnpaid();
