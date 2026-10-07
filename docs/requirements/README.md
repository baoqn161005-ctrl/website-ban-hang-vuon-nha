# Yêu cầu hệ thống – Website bán nông sản "Vườn Nhà"

## Tác nhân
- **Khách hàng**: xem/tìm sản phẩm, giỏ hàng, đặt hàng, thanh toán, theo dõi đơn.
- **Quản trị viên**: quản lý sản phẩm, danh mục, tồn kho, đơn hàng.

## Chức năng – Khách hàng
1. Đăng ký / đăng nhập / quên mật khẩu qua email
2. Xem danh sách sản phẩm, tìm kiếm, lọc theo danh mục, phân trang
3. Xem chi tiết sản phẩm (giá khuyến mãi, % giảm, tồn kho)
4. Giỏ hàng: thêm, sửa số lượng, xóa
5. Đặt hàng, thanh toán VietQR (tự xác nhận qua SePay/Casso) hoặc COD
6. Xem lịch sử, chi tiết đơn hàng; hủy đơn khi chưa xử lý

## Chức năng – Quản trị viên
1. Tổng quan: số sản phẩm, đơn hàng, doanh thu, hàng sắp hết
2. CRUD sản phẩm (tải ảnh, giá gốc/giá bán, tồn kho)
3. CRUD danh mục
4. Quản lý đơn: đổi trạng thái, xác nhận đã nhận tiền

## Yêu cầu phi chức năng
Mật khẩu băm bcrypt; JWT; phân quyền theo vai trò; chống bán vượt tồn kho (giao dịch DB);
chống xử lý trùng webhook (khóa UNIQUE); giới hạn số lần đăng nhập.
