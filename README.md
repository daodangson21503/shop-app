# 🏠 ShopGiaDung — Hệ thống bán hàng gia dụng

Dự án học tập xây dựng hệ thống e-commerce hoàn chỉnh từ code đến production, áp dụng đầy đủ quy trình DevOps thực tế.

---

## 🏗️ Kiến trúc hệ thống

```
[Browser]
    ↓ HTTP
[Nginx - Reverse Proxy]
    ↓                    ↓
[Vue3 SPA]        [Express API]
                       ↓
                 [PostgreSQL]

Monitoring:
[Prometheus] ← [Node Exporter] [cAdvisor] [Backend /metrics]
[Loki] ← [Promtail] ← [Docker Container Logs]
[Grafana] ← [Prometheus + Loki]

CI/CD:
[GitHub] → [GitHub Actions] → [Docker Hub]
[GitHub] → [Jenkins] → [Docker Hub]
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vue 3, Vite, Pinia, Ant Design Vue |
| Backend | Node.js, Express.js, JWT |
| Database | PostgreSQL 16 |
| Infrastructure | Docker, Docker Compose, Nginx |
| CI/CD | GitHub Actions, Jenkins |
| Monitoring | Prometheus, Grafana, Node Exporter, cAdvisor |
| Logging | Loki, Promtail, Grafana |

---

## ✨ Tính năng

### Khách hàng
- Xem danh sách sản phẩm theo danh mục
- Tìm kiếm sản phẩm
- Xem chi tiết sản phẩm
- Thêm vào giỏ hàng
- Đặt hàng (COD)

### Admin
- Đăng nhập bảo mật (JWT + bcrypt)
- CRUD sản phẩm
- Xem và cập nhật trạng thái đơn hàng

---

## 📦 Cách chạy local

### Yêu cầu
- Docker Desktop
- Git

### Chạy toàn bộ hệ thống

```bash
git clone https://github.com/daodangson21503/shop-app.git
cd shop-app

# Tạo file .env
cp .env.example .env

# Khởi động toàn bộ hệ thống
docker compose up -d --build
```

### Truy cập

| Địa chỉ | Mô tả |
|---|---|
| http://localhost | Website bán hàng |
| http://localhost/admin/login | Trang quản trị |
| http://localhost:9090 | Prometheus |
| http://localhost:3001 | Grafana |
| http://localhost:8080 | Jenkins |

### Tài khoản demo
- Admin: `admin@shop.com` / `admin123`
- Grafana: `admin` / `admin123`

---

## 🗄️ Database Schema

```
users ──────────── orders ──────────── order_items
                                            │
categories ───── products ─────────────────┘
```

### Bảng chính
- `users` — tài khoản (admin/customer)
- `categories` — danh mục sản phẩm
- `products` — sản phẩm
- `orders` — đơn hàng
- `order_items` — chi tiết đơn hàng

---

## 🔌 API Endpoints

### Auth
```
POST /api/auth/login
POST /api/auth/register
```

### Products
```
GET    /api/products
GET    /api/products/:slug
POST   /api/products        (admin)
PUT    /api/products/:id    (admin)
DELETE /api/products/:id    (admin)
```

### Orders
```
POST   /api/orders
GET    /api/orders          (admin)
PATCH  /api/orders/:id/status (admin)
```

---

## 🚀 CI/CD Pipeline

### GitHub Actions
```
Push code → Build & Test → Docker Build → Push Docker Hub
```

### Jenkins
```
Push code → Jenkins Pipeline → Docker Build → Push Docker Hub
```

---

## 📊 Monitoring & Logging

### Prometheus targets
- Node Exporter (CPU, RAM, Disk)
- cAdvisor (Container metrics)
- Backend API (Request duration, count)

### Grafana Dashboards
- Node Exporter Full
- CPU Usage per Container
- Memory Usage per Container

### Logging
- Promtail thu thập log từ tất cả container
- Đẩy lên Loki
- Xem realtime qua Grafana Explore

---

## 📁 Cấu trúc thư mục

```
shop-app/
├── backend/              # Node.js Express API
│   ├── src/
│   │   ├── config/       # DB, Logger
│   │   ├── middlewares/  # Auth, Error handling
│   │   ├── modules/      # Auth, Products, Orders
│   │   └── routes/
│   └── Dockerfile
├── frontend/             # Vue 3 SPA
│   ├── src/
│   │   ├── api/          # Axios instance
│   │   ├── stores/       # Pinia stores
│   │   ├── views/        # Pages
│   │   └── router/
│   └── Dockerfile
├── db/                   # SQL scripts
├── nginx/                # Reverse proxy config
├── monitoring/           # Prometheus, Promtail config
├── jenkins/              # Jenkins Dockerfile
├── docker-compose.yml
└── Jenkinsfile
```

---

## 👤 Tác giả

Dao Dang Son  
GitHub: [@daodangson21503](https://github.com/daodangson21503)