# 📖 Story Platform - Nền Tảng Đọc Truyện Cá Nhân & Quản Lý Nội Dung

Một nền tảng đọc truyện cá nhân hiện đại, tốc độ cao được xây dựng theo kiến trúc **Monorepo (Turborepo)** với **Next.js 15 App Router**, **Supabase Cloud**, **TailwindCSS v4**, **TypeScript Strict** và hệ thống đa ngôn ngữ **`next-intl`**.

---

## 🌟 Tính Năng Nổi Bật

### 📚 Web Reader (`apps/web`) - Dành cho Độc Giả
- **Trải nghiệm đọc linh hoạt**:
  - **Trình đọc Tiểu thuyết (`TextReader`)**: Tùy chỉnh cỡ chữ (14px - 28px), chọn phông chữ (Sans-serif, Serif, Monospace), đổi màu nền đọc (Sáng, Tối, Sepia).
  - **Trình đọc Manga (`MangaReader`)**: Đọc truyện tranh cuộn dọc chất lượng cao.
- **Tương tác & Cộng đồng**:
  - **Bình luận độc giả**: Cho phép viết, chỉnh sửa trực tiếp và xóa bình luận cá nhân.
  - **Đánh giá sao (1-5 ⭐)**: Chấm điểm truyện với thống kê điểm trung bình tự động.
  - **Đánh dấu truyện (Bookmark)**: Lưu các bộ truyện yêu thích.
  - **Tự động lưu lịch sử đọc**: Đồng bộ tiến trình đọc giữa LocalStorage và Database.
- **Tìm kiếm & Điều hướng**:
  - Tìm kiếm truyện realtime dạng popover modal (`Ctrl + K`).
  - Lọc truyện theo thể loại, loại truyện (Novel, Manga, Light Novel), trạng thái và sắp xếp.
- **Hệ thống Thông báo**:
  - Biểu tượng chuông thông báo trên Navbar với `unread badge`.
  - Nhận tin phát broadcast từ Admin, hỗ trợ đánh dấu đã đọc hoặc xóa thông báo.
- **Đa ngôn ngữ & Giao diện**:
  - Hỗ trợ 4 ngôn ngữ: Tiếng Việt (Vi), English (En), Français (Fr), 日本語 (Ja).
  - Dark/Light Theme mượt mà.

### 🛡️ Admin Portal (`apps/admin`) - Dành cho Quản Trị Viên
- **Bảo mật tuyệt đối**:
  - Khóa cứng độc quyền vai trò Quản trị viên tối cao (Super Admin / Owner).
  - Bảo vệ 100% Server Actions bằng xác thực `verifyAdmin()`.
  - HTTP Security Headers chuẩn OWASP (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`).
- **Quản lý Nội dung (CRUD)**:
  - Thêm, chỉnh sửa, xóa truyện; upload ảnh bìa lên Supabase Storage bucket.
  - Thêm, sửa, xóa chương truyện (Hỗ trợ nội dung Text & mảng ảnh Manga).
  - Gán danh mục thể loại cho từng bộ truyện.
- **Quản lý Độc giả**:
  - Xem danh sách và trang chi tiết từng độc giả (Email, Provider, Ngày tạo, Lần đăng nhập cuối, Thống kê bọokmark/lịch sử/bình luận).
  - Đặt lại mật khẩu trực tiếp cho độc giả mà không qua email confirmation.
  - Khóa tài khoản theo thời hạn (1 giờ, 24 giờ, 7 ngày, 30 ngày, Vĩnh viễn).
  - Xóa vĩnh viễn tài khoản độc giả khỏi Supabase Auth và Database.
- **Kiểm duyệt Bình luận**:
  - Duyệt (Approve), Từ chối (Reject) hoặc Xóa (Delete) bình luận gửi lên từ độc giả.
- **Thông báo & Phát tin (Broadcast Notification)**:
  - Gửi thông báo tới toàn bộ thiết bị độc giả, hỗ trợ sửa và xóa lịch sử phát tin.
- **Cấu hình Hệ thống**:
  - Cập nhật Tên trang web, Mô tả SEO, Tải ảnh Logo mới, Cài đặt link Facebook/Discord.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Monorepo Tool**: [Turborepo](https://turbo.build/)
- **Database & Auth**: [Supabase Cloud (PostgreSQL + Auth + Storage)](https://supabase.com/)
- **Styling**: [TailwindCSS v4](https://tailwindcss.com/)
- **Language**: TypeScript Strict Mode
- **Localization**: [next-intl](https://next-intl-docs.vercel.app/)
- **UI Components**: `@repo/ui` (Design System tối ưu, không sử dụng emoji)

---

## 📁 Cấu Trúc Dự Án (Monorepo Architecture)

```text
story-platform/
├── apps/
│   ├── web/               # Trang đọc truyện cho Độc giả (Port 3000)
│   └── admin/             # Trang quản trị dành cho Admin (Port 3001)
├── packages/
│   ├── ui/                # Thư viện UI Component dùng chung (Button, Card, Input, Modal, Icons...)
│   ├── supabase/          # Supabase Client, Server Helpers & SSR Middleware
│   ├── types/             # TypeScript Database Definitions & Data Models
│   └── i18n/              # Cấu hình đa ngôn ngữ & File Dịch (VI, EN, FR, JA)
├── supabase/
│   ├── migrations/        # SQL Schema & PostgreSQL Triggers
│   └── seed.sql           # Dữ liệu mẫu ban đầu (Genres, Settings)
├── turbo.json             # Cấu hình Turborepo Build Cache
└── package.json           # Root Dependencies & Scripts
```

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Chạy Local

### 1. Yêu cầu Tiền đề
- Node.js version >= 18.0.0
- npm version >= 10.0.0
- Tài khoản Supabase Cloud (hoặc Supabase CLI chạy local)

### 2. Cấu hình Biến Môi Trường (`.env`)

Tạo file `.env.local` ở thư mục gốc hoặc trong từng ứng dụng (`apps/web/.env.local` và `apps/admin/.env.local`):

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# Site Settings
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Cài đặt Dependencies

```bash
npm install
```

### 4. Chạy Môi Trường Development

Khởi động cả Web Reader và Admin Portal song song bằng Turborepo:

```bash
npm run dev
```

- **Web Reader**: [http://localhost:3000](http://localhost:3000)
- **Admin Portal**: [http://localhost:3001](http://localhost:3001)

### 5. Kiểm tra Typecheck & Build Sản Phẩm

```bash
# Kiểm tra TypeScript toàn bộ 6 packages
npm run typecheck

# Đóng gói Build Production
npm run build
```

---

## 🌐 Hướng Dẫn Deploy Lên Vercel (CI/CD)

1. Push mã nguồn lên repository GitHub của bạn:
   ```bash
   git init
   git add .
   git commit -m "Deploy production v1.0"
   git branch -M main
   git remote add origin https://github.com/ZeusEdom/project_R.git
   git push -u origin main
   ```

2. Đăng nhập Vercel và tạo **2 Project**:
   - **Project 1 (Web Reader)**: Root Directory chọn `apps/web`
   - **Project 2 (Admin Portal)**: Root Directory chọn `apps/admin`

3. Điền các biến môi trường `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, và `SUPABASE_SERVICE_ROLE_KEY` trên Vercel.

---

## 📜 Giấy Phép & Bản Quyền (License)

Dự án được phát triển và sở hữu bởi **ZeusEdom**. Tất cả quyền được bảo lưu.
