
# 🧩 ĐỒ ÁN MÔN HỌC – HỆ THỐNG MICROSERVICES TRIỂN KHAI VỚI DOCKER & GITHUB ACTIONS

## 🧭 1. Giới thiệu dự án

Dự án này được xây dựng nhằm mô phỏng **kiến trúc hệ thống microservices** có thể mở rộng, gồm nhiều dịch vụ nhỏ giao tiếp với nhau thông qua **API Gateway**, sử dụng **Docker** để triển khai và **GitHub Actions** để thực hiện CI/CD tự động.

Mục tiêu:
- Hiểu rõ cách tổ chức hệ thống theo hướng microservice.
- Thực hiện triển khai dịch vụ trên Docker.
- Thiết lập CI/CD tự động thông qua GitHub Actions.
- Đáp ứng đầy đủ 10 tiêu chí đánh giá trong đề bài.

---

## 🏗️ 2. Kiến trúc hệ thống

### Tổng quan
Hệ thống gồm **4 dịch vụ chính** và các thành phần hỗ trợ:

| Thành phần | Mô tả chức năng |
|-------------|----------------|
| **Auth Service** | Xử lý xác thực người dùng, gồm các chức năng: đăng ký (`register`), đăng nhập (`login`), và truy cập trang tổng quan (`dashboard`). Sử dụng **JWT** để xác thực. |
| **Product Service** | Quản lý sản phẩm: tạo mới sản phẩm, lấy danh sách sản phẩm, tìm sản phẩm theo `id`, và gửi yêu cầu tạo đơn hàng đến Order Service. |
| **Order Service** | Tiếp nhận yêu cầu đặt hàng từ Product Service và lưu thông tin đơn hàng. |
| **API Gateway** | Làm nhiệm vụ định tuyến request từ client đến các service tương ứng. |

### Thành phần phụ trợ
- **MongoDB**: Lưu trữ dữ liệu người dùng, sản phẩm và đơn hàng.  
- **RabbitMQ**: Là message broker giúp các service giao tiếp bất đồng bộ.  
- **Docker**: Dùng để container hoá các service.  
- **GitHub Actions**: Dùng để kiểm thử (CI) và build image Docker tự động (CD).

---

## ⚙️ 3. Cấu trúc thư mục

````markdown
EProject-Phase-1/
│
├── .github/workflows/
│   ├── docker-build.yml        # Workflow build và push image Docker
│   └── test.yml                # Workflow test tự động (CI)
│
├── api-gateway/
│   ├── Dockerfile
│   ├── index.js
│   └── package.json
│
├── auth/
│   ├── src/
│   ├── Dockerfile
│   ├── .env
│   └── package.json
│
├── product/
│   ├── src/
│   ├── Dockerfile
│   ├── .env
│   └── package.json
│
├── order/
│   ├── src/
│   ├── Dockerfile
│   ├── .env
│   └── package.json
│
├── public/results/              # Hình ảnh test kết quả Postman & Docker
│   ├── auth-register.png
│   ├── auth-login.png
│   ├── products-get.png
│   ├── products-get-id.png
│   ├── docker-containers.png
│   └── ...
│
├── docker-compose.yml
├── .gitignore
└── README.md
````

---

## 🧩 4. Cách hoạt động hệ thống

Các service được liên kết thông qua **Docker network**.
API Gateway định tuyến đến từng service theo URL:

| Endpoint        | Dịch vụ đích                |
| --------------- | --------------------------- |
| `/auth/...`     | Auth Service (port 3000)    |
| `/products/...` | Product Service (port 3001) |
| `/orders/...`   | Order Service (port 3002)   |

Ví dụ:
`http://localhost:3003/auth/login` sẽ tự động được gateway định tuyến đến `auth` container.

---

## 🐳 5. Chạy dự án bằng Docker

### Yêu cầu

* Cài đặt **Docker Desktop**
* Đảm bảo các file `.env` tồn tại trong từng service.

### Cách chạy

```bash
docker-compose up --build
```

Sau khi build xong, các container sẽ tự động chạy:

* MongoDB: `localhost:27017`
* RabbitMQ: `localhost:15672` (UI quản lý)
* Auth: `localhost:3000`
* Product: `localhost:3001`
* Order: `localhost:3002`
* API Gateway: `localhost:3003`

### Minh chứng

Xem hình ảnh test trong thư mục:
📂 `public/results/` (ảnh Postman và Docker containers đang chạy).

---

## 🧪 6. Kiểm thử chức năng (POSTMAN)

Các API chính đã được test thành công:

| Service     | API                                                | Kết quả    |
| ----------- | -------------------------------------------------- | ---------- |
| **Auth**    | `/auth/register`, `/auth/login`, `/auth/dashboard` | Thành công |
| **Product** | `/products`, `/products/:id`, `/products/create`   | Thành công |
| **Order**   | `/orders` (nhận dữ liệu từ Product service)        | Thành công |

Ảnh minh chứng test:
`public/results/auth-register.png`, `products-get.png`, `products-post-order-1.png`, ...

---

## 🧱 7. Endpoint đặc biệt để chấm điểm

Đã thêm **endpoint `/id` (GET)** trong Product Service để hiển thị thông tin chi tiết sản phẩm theo `id`,
đáp ứng **mục số 8** trong bảng yêu cầu của đề thi.

---

## ⚙️ 8. Thiết lập CI/CD (GitHub Actions)

Hệ thống có hai workflow chính trong `.github/workflows/`:

### 🔹 1. `test.yml` – Continuous Integration (CI)

Tự động chạy khi có **push** hoặc **pull request**:

* Tạo file `.env` cho từng service.
* Cài dependencies.
* Chạy `npm test` cho các service `auth` và `product`.

### 🔹 2. `docker-build.yml` – Continuous Deployment (CD)

* Build image Docker của từng service.
* Có thể cấu hình để push lên **Docker Hub** hoặc deploy tự động.

Ví dụ cấu trúc `docker-build.yml`:

```yaml
name: Build Docker Images
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      - name: Build Docker images
        run: docker-compose build
```

---

## 🚀 9. Liên kết CI/CD với Docker

Khi commit & push code lên GitHub:

1. **GitHub Actions** sẽ tự động kích hoạt.
2. Workflow **test.yml** chạy kiểm thử.
3. Nếu thành công, workflow **docker-build.yml** sẽ build image Docker.
4. Có thể mở rộng để **push lên Docker Hub** (sử dụng secrets `DOCKER_USERNAME`, `DOCKER_PASSWORD`).

---

## 📊 10. Kết quả kiểm thử & đánh giá

* ✅ Hệ thống chạy ổn định trên Docker Desktop.
* ✅ Tất cả các chức năng đăng ký, đăng nhập, quản lý sản phẩm, tạo đơn hàng hoạt động tốt.
* ✅ CI/CD đã hoạt động, tự động test và build thành công.

Ảnh minh chứng:

* `public/results/docker-containers.png` → Tất cả container hoạt động.
* `public/results/*.png` → Kết quả test bằng Postman.

---

## 📚 11. Kết luận

Dự án đã hoàn thiện các yêu cầu:

* Xây dựng hệ thống microservices (Auth, Product, Order, API Gateway).
* Triển khai và kiểm thử thành công bằng Docker.
* Thiết lập CI/CD qua GitHub Actions.

Dự án thể hiện kiến thức tổng hợp về:

* Node.js, Express, MongoDB, RabbitMQ
* Docker & docker-compose
* GitHub Actions CI/CD
* Kiến trúc microservices và tích hợp API Gateway.

---

**📅 Sinh viên thực hiện:** *Trần Kim Trọng*
**📘 Môn học:** Lập trình dịch vụ



