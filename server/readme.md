# Những kiến thức đạt được trong quá trình làm dự án

## 1. Những packages cần thiết

### Nhóm trợ dev thuận tiện

1. Morgan: Logger trên terminal
2. Nodemon: lắng nghe và reload máy chủ (không cần nếu dùng tsx, node bản mới)
3. Tsx (typescript excute): hỗ trợ auto compile typescript code và tích hợp
   giống nodemon
4. Http status codes: cung cấp các thông tin có sẵn về http status code

### Server core

1. Express: framework chính hỗ trợ phát triển routing cho máy chủ
2. Compression: hỗ trợ nén dữ liệu trong quá trình truyền
3. Helmet: bảo mật cho máy chủ
4. PM2: hỗ trợ quản lý máy chủ trong môi trường production
5. Winston: hệ thống logger file, hỗ trợ nhiều mức độ log
6. Winston daily rotate file: logge file theo ngày, tuần, tháng, năm
7. Json web token: token hỗ trợ xác thực và phân quyền
8. Mongoose, mongodb: cơ sở dữ liệu NoSQL

### Nhóm công cụ phát triển

1. Cron: tạo luồng child_process và xử lý tác vụ lập lịch đã lập
2. Dotenv: ẩn thông tin nhạy cảm trong source code
3. Joi: validate dữ liệu trước khi xử lý
4. Joi extract type: lấy type của schema đã tạo trong typescript
5. Lodash: công cụ tương tác object, array
6. UUID: tạo uuid ngẫu nhiên cho hệ thống.

## 2. Cấu trúc dự án

![project_structure](/images/code.png)

## 3. Mô hình dự án

### 3.1. Xác thực người dùng

Xử dụng xác thực dựa tên JsonWebToken, bao gồm xử lý các trưởng hợp sau:

1. Người dùng đăng ký:
    - Kiểm tra thông tin đã tồn tại?
    - Mã hóa mật khẩu
    - Lưu thông tin người dùng vào cơ sở dữ liệu
    - Trả về thông tin người dùng đã đăng ký
    - Tạo token cho người dùng
    - Gửi token cho người dùng

# Những kiến thức mới:

- Conditional type: Kiểu linh động dựa trên biến
- Các thuộc tính trong joi như when, alternative, try, joi types, joi type
  strict

# Todo:

- Xây dựng API tạo sản phẩm
- Xây dựng API xóa sản phẩm
- Xây dựng CronJob để clean sản phẩm nếu trong quá trình tạo hoặc xóa bị lỗi
- Xây dựng API update sản phẩm
- API lấy sản phẩm của shop
- API lấy sản phẩm nháp của shop
- API lấy sản phẩm đang bán của shop
- findOneProduct api
