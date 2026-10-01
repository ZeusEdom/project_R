# Story Platform - Digital Publishing & Reader System

Story Platform là giải pháp xuất bản và đọc truyện kỹ thuật số tốc độ cao, được thiết kế theo kiến trúc **Monorepo (Turborepo)** kết hợp **Next.js 15 App Router**, **Supabase Cloud**, **TailwindCSS v4**, **TypeScript Strict** và hệ thống đa ngôn ngữ **`next-intl`**.

---

## 1. Tổng Quan Kiến Trúc (Architecture Overview)

Hệ thống bao gồm hai ứng dụng độc lập và bốn gói thư viện dùng chung được quản lý tập trung:

```text
story-platform/
├── apps/
│   ├── web/               # Ứng dụng Reader dành cho độc giả (Port 3000)
│   └── admin/             # Ứng dụng Portal dành cho Quản trị viên (Port 3001)
├── packages/
│   ├── ui/                # Thư viện giao diện dùng chung (Design System)
│   ├── supabase/          # Supabase SSR Client, Service Client & Middleware
│   ├── types/             # Định nghĩa dữ liệu TypeScript Database Schema
│   └── i18n/              # Cấu hình đa ngôn ngữ & tệp dịch (VI, EN, FR, JA)
├── supabase/
│   ├── migrations/        # Cấu hình Database Schema & Triggers PostgreSQL
│   └── seed.sql           # Dữ liệu khởi tạo hệ thống (Genres, Site Settings)
├── turbo.json             # Cấu hình Turborepo Pipeline & Caching
└── package.json           # Quản lý phụ thuộc cấp cao nhất
```

---

## 2. Tính Năng Chi Tiết (Feature Specifications)

### 2.1. Web Reader App (`apps/web`)
- **Trình đọc nội dung đa dạng**:
  - **Trình đọc Tiểu thuyết (`TextReader`)**: Cho phép tùy chỉnh cỡ chữ (14px - 28px), phông chữ (Sans-serif, Serif, Monospace) và màu nền đọc (Sáng, Tối, Sepia).
  - **Trình đọc Truyện tranh (`MangaReader`)**: Đọc truyện tranh cuộn dọc tối ưu hóa tải ảnh.
- **Tương tác độc giả**:
  - **Khung bình luận trực tiếp**: Độc giả có thể viết bình luận, chỉnh sửa và xóa bình luận của chính mình.
  - **Đánh giá sao (1 - 5 Stars)**: Chấm điểm bộ truyện và cập nhật điểm trung bình theo thời gian thực.
  - **Đánh dấu (Bookmark)**: Lưu các bộ truyện yêu thích vào danh sách cá nhân.
  - **Lịch sử đọc (Reading History)**: Đồng bộ tiến trình đọc giữa LocalStorage và cơ sở dữ liệu.
- **Hệ thống Tìm kiếm & Thông báo**:
  - Tìm kiếm truyện theo thời gian thực dạng Modal (`Ctrl + K`).
  - Lọc truyện theo thể loại, định dạng (Novel, Manga, Light Novel), trạng thái và tiêu chí sắp xếp.
  - Chuông thông báo hiển thị tin tức broadcast từ Quản trị viên, hỗ trợ đánh dấu đã đọc hoặc xóa thông báo.
- **Bản địa hóa & Giao diện**:
  - Hỗ trợ 4 ngôn ngữ: Tiếng Việt (`vi`), English (`en`), Français (`fr`), 日本語 (`ja`).
  - Chế độ giao diện Tối / Sáng (Dark / Light Mode).

### 2.2. Admin Portal (`apps/admin`)
- **Kiểm soát truy cập & Bảo mật**:
  - Phân quyền Quản trị viên tối cao (Owner) cố định cho tài khoản hệ thống.
  - Xác thực 100% Server Actions thông qua hàm `verifyAdmin()`.
  - Cấu hình HTTP Security Headers tiêu chuẩn OWASP (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`).
- **Quản lý Nội dung (CMS)**:
  - Thêm, sửa, xóa truyện; tải ảnh bìa lên Supabase Storage bucket.
  - Thêm, sửa, xóa chương truyện (Hỗ trợ định dạng Văn bản và mảng ảnh Manga).
  - Phân loại danh mục thể loại cho từng bộ truyện.
- **Quản lý Độc giả**:
  - Danh sách và trang chi tiết độc giả (Email, Nhà cung cấp xác thực, Ngày tạo, Lần đăng nhập cuối, Thống kê cá nhân).
  - Đặt lại mật khẩu trực tiếp cho độc giả.
  - Khóa tài khoản theo thời hạn (1 giờ, 24 giờ, 7 ngày, 30 ngày, Vĩnh viễn).
  - Xóa vĩnh viễn tài khoản khỏi Supabase Auth và cơ sở dữ liệu.
- **Kiểm duyệt & Phát tin**:
  - Kiểm duyệt bình luận: Duyệt (Approve), Từ chối (Reject), hoặc Xóa (Delete).
  - Phát tin thông báo (Broadcast Notification) tới toàn bộ độc giả, cho phép chỉnh sửa và xóa nhật ký thông báo.
- **Cấu hình Hệ thống**:
  - Thay đổi tên nền tảng, mô tả SEO, tải logo mới và liên kết mạng xã hội.

---

## 3. Danh Mục Công Nghệ (Tech Stack)

- **Framework**: Next.js 15 (App Router, Server Actions)
- **Monorepo Build System**: Turborepo
- **Database & Auth**: Supabase Cloud (PostgreSQL, Auth Admin API, Storage)
- **Styling Engine**: TailwindCSS v4
- **Language**: TypeScript Strict Mode
- **Internationalization**: next-intl
- **Shared Components**: `@repo/ui`

---

## 4. Cấu Hình & Chạy Ứng Dụng (Setup & Local Development)

### 4.1. Khởi tạo Biến Môi Trường

Tạo tệp `.env.local` tại thư mục gốc hoặc trong từng ứng dụng (`apps/web/.env.local` và `apps/admin/.env.local`):

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4.2. Lệnh Thao Tác

```bash
# Cài đặt toàn bộ dependencies trong Monorepo
npm install

# Khởi chạy môi trường phát triển (Web: 3000, Admin: 3001)
npm run dev

# Kiểm tra tĩnh TypeScript (Strict Typecheck cho 6 packages)
npm run typecheck

# Đóng gói sản phẩm (Production Build)
npm run build
```

---

## 5. Quy Trình Triển Khai (Deployment Workflow)

### 5.1. GitHub Repository
Mã nguồn được quản lý tại: [https://github.com/ZeusEdom/project_R](https://github.com/ZeusEdom/project_R)

### 5.2. Triển khai trên Vercel
1. Nhập repository `ZeusEdom/project_R` vào Vercel.
2. Tạo ứng dụng **Web Reader**: Cấu hình Root Directory là `apps/web`.
3. Tạo ứng dụng **Admin Portal**: Cấu hình Root Directory là `apps/admin`.
4. Điền các biến môi trường `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, và `SUPABASE_SERVICE_ROLE_KEY`.
5. Kích hoạt tính năng Tự động Triển khai (Automatic CI/CD Deployment) khi có commit mới trên nhánh `main`.
