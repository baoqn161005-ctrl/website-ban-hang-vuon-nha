# Vườn Nhà

Website bán nông sản gồm React/Vite, Express và MySQL. Khách có thể xem sản phẩm, đăng ký/đăng nhập, quản lý giỏ hàng, đặt hàng và xem lịch sử đơn. Quản trị viên quản lý sản phẩm, danh mục và trạng thái đơn hàng.

## Chạy nhanh bằng Docker (khuyến nghị)

### Yêu cầu

- Docker Desktop (Windows/macOS) hoặc Docker Engine và Docker Compose plugin (Linux).
- Mở Docker Desktop và chờ Docker chạy xong.

### Cài đặt lần đầu

1. Mở terminal tại thư mục chứa file `docker-compose.yml`.
2. Tạo file cấu hình môi trường:

   ```powershell
   Copy-Item .env.example .env
   ```

   macOS/Linux:

   ```sh
   cp .env.example .env
   ```

3. Mở `.env`, đổi `DB_ROOT_PASSWORD`, `DB_PASSWORD`, `JWT_SECRET` (ít nhất 16 ký tự) và `ADMIN_PASSWORD`. Không chia sẻ hoặc commit file `.env`.
4. Khởi động và build ứng dụng:

   ```sh
   docker compose up --build -d
   ```

5. Mở [http://localhost:3000](http://localhost:3000). Đăng nhập quản trị với email và mật khẩu `ADMIN_EMAIL`/`ADMIN_PASSWORD` đã đặt trong `.env`.

Lần đầu, Docker tải MySQL, khởi tạo database và tạo tài khoản quản trị. Có thể mất một chút thời gian; xem tiến trình bằng `docker compose logs -f app`.

### Sử dụng hằng ngày

```sh
docker compose up -d       # bật ứng dụng
docker compose stop        # tạm dừng
docker compose start       # chạy lại sau khi tạm dừng
docker compose logs -f app # xem log ứng dụng
```

Sau khi sửa mã nguồn, chạy lại `docker compose up --build -d` để build phiên bản mới.

### Dữ liệu và cấu hình

- MySQL được lưu trong volume `mysql_data`; ảnh sản phẩm tải lên được lưu trong `uploads_data`. Restart hoặc build lại không xóa dữ liệu.
- Sao lưu database: `docker compose exec -T db sh -c 'exec mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE"' > backup.sql`.
- Khôi phục dữ liệu cần thực hiện riêng; tránh chạy `docker compose down -v` nếu muốn giữ database và ảnh, vì lệnh này xóa các volume.
- Muốn dùng cổng khác, đổi `APP_PORT` (ví dụ `8080`) rồi truy cập `http://localhost:8080` và cập nhật `BASE_URL` tương ứng.
- `BASE_URL` nên là địa chỉ website công khai khi triển khai lên máy chủ. Cấu hình ngân hàng, email SMTP và webhook là tùy chọn; xem chú thích trong `.env.example`.
- Để triển khai công khai, hãy dùng HTTPS qua reverse proxy và đặt mật khẩu mạnh, riêng tư cho database, admin và `JWT_SECRET`.

## Chạy thủ công để phát triển

Yêu cầu Node.js 18 trở lên và MySQL 5.7 trở lên (hoặc MySQL 8). Tạo database/user MySQL có quyền tạo bảng; cấu hình `backend/.env` theo `backend/.env.example` với `DB_HOST=localhost`, thông tin database và `JWT_SECRET` dài ít nhất 16 ký tự. Không dùng chung `.env` triển khai Docker cho chế độ này vì backend chạy ngoài Docker nên DB_HOST phải là `localhost`.

Terminal 1 — database và backend:

```sh
cd backend
npm install
npm run setup
npm run dev
```

Terminal 2 — frontend:

```sh
cd frontend
npm install
npm run dev
```

Mở [http://localhost:5173](http://localhost:5173). Vite chuyển tiếp `/api` và `/uploads` sang backend ở cổng 3000. `npm run setup` nạp schema và an toàn khi chạy lại; nó chỉ tạo admin nếu email đó chưa tồn tại.

## Dành cho nhà phát triển

- `frontend/src`: giao diện React; API client ở `frontend/src/services/api.js`.
- `backend/src/routes`, `controllers`, `services`: định tuyến và xử lý nghiệp vụ.
- `backend/src/config`: cấu hình ứng dụng, database, upload và mail.
- `database/vuon_nha.sql`: schema/seed ban đầu.
- Thêm biến môi trường mới vào cả `backend/.env.example` (chạy thủ công) và `.env.example`/`docker-compose.yml` (Docker) nếu cần.
- Ứng dụng production được build từ hai stage trong `Dockerfile`; backend phục vụ frontend và API tại cùng một cổng.

## Luồng thanh toán demo

Checkout tạo mã VietQR dựa trên số tiền và mã đơn. Admin xác nhận thanh toán trong trang quản trị. Tích hợp webhook SePay/Casso chỉ hoạt động khi cấu hình khóa/token tương ứng; xác nhận tự động và email không cần thiết cho demo cơ bản.
