const multer = require('multer');
exports.notFound = (q, s) => s.status(404).json({ error: 'API không tồn tại' });
exports.errorHandler = (e, q, s, n) => {
  let st = e.status || (e instanceof multer.MulterError ? 400 : e.code === 'ER_ROW_IS_REFERENCED_2' || e.code === 'ER_DUP_ENTRY' ? 409 : 500), m = st < 500 ? e.message : 'Lỗi máy chủ';
  if (e.code === 'ER_ROW_IS_REFERENCED_2') m = 'Danh mục đang có sản phẩm, không thể xóa';
  if (e.code === 'ER_DUP_ENTRY') m = 'Dữ liệu đã tồn tại';
  if (e.code === 'LIMIT_FILE_SIZE') m = 'Ảnh tối đa 3MB';
  if (st === 500) console.error(e);
  s.status(st).json({ error: m });
};
