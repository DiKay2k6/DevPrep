# DevPrep — Nền tảng Ôn luyện Phỏng vấn CNTT Toàn diện

**DevPrep** là ứng dụng web Full-Stack (MERN) hỗ trợ sinh viên năm cuối và kỹ sư phần mềm (`Intern`, `Fresher`, `Junior`, `Middle`) ôn luyện phỏng vấn theo lộ trình cá nhân hóa: kết hợp đọc tài liệu lý thuyết chuyên sâu, thực hành 3 định dạng bài tập (MCQ, Dự đoán Output, Viết Code trực tiếp trên Monaco Editor), thi thử tính giờ và phân tích lỗ hổng kiến thức bằng thuật toán thuần túy (không sử dụng AI/LLM).

---

## Tính năng chính

- **Cá nhân hóa lộ trình & Bộ kỹ năng mục tiêu (`selectedSkills`):**
  - Tự động lọc và đề xuất bài học (`Article`) và câu hỏi (`Question`) theo Cấp độ mục tiêu (`Intern`, `Fresher`, `Junior`, `Middle`) kết hợp nhóm kỹ năng công nghệ (`JavaScript`, `ReactJS`, `Tailwind CSS`, `Node.js`, `Python`, `Java`, `MongoDB`, `SQL`, `Git`...) thông qua truy vấn `$in` tận dụng Multikey & Compound Index trên MongoDB.
- **Kho Tài liệu Kỹ thuật (`Study Hub`):**
  - Render tài liệu Markdown (`react-markdown`), tự động trích xuất Mục lục (`H2`/`H3` Table of Contents) kèm cuộn mượt, nút sao chép nhanh đoạn code và lưu trạng thái bài viết đã hoàn thành trên MongoDB.
- **Không gian Luyện tập 3 định dạng (`Practice Workspace`):**
  - **Trắc nghiệm (MCQ):** Hỗ trợ chọn một/nhiều đáp án và hiển thị giải thích chi tiết sau khi nộp bài.
  - **Dự đoán Output (`Fill-in-the-blank`):** Chuẩn hóa chuỗi kết quả đầu vào và đối chiếu với danh sách đáp án chấp nhận.
  - **Thực hành Viết Code (`Coding`):** Tích hợp `@monaco-editor/react` (JavaScript, Python, Java, C++), lưu nháp tự động theo câu hỏi/ngôn ngữ và gửi qua Express Sandbox Proxy tới **Piston API** (có giới hạn timeout & rate limit).
- **Phòng Thi thử (`Mock Test Simulator`):**
  - Đề thi sát hạch theo cấp độ/chuyên ngành, đồng hồ đếm ngược, đánh dấu câu phân vân, tự lưu nháp phiên thi trên `localStorage`, tự động nộp khi hết giờ và tổng kết điểm theo từng định dạng bài tập.
- **Phân tích Lỗ hổng Kiến thức & Ôn tập Ngắt quãng (`Analytics & Spaced Repetition`):**
  - Dùng **MongoDB Aggregation Pipeline** tổng hợp tỷ lệ chính xác theo từng nhãn kỹ năng (`tag`) và từng hình thức bài tập, trực quan hóa bằng biểu đồ **Recharts**, tự động gợi ý bài học lý thuyết cho các chủ đề dưới `65%`.
  - Tích hợp hàng đợi **Spaced Repetition** theo chu kỳ `1 → 3 → 7 → 14 ngày` cho các câu làm sai hoặc được đánh dấu ôn lại.
- **Đóng góp & Kiểm duyệt nội dung (`RBAC`):**
  - Người dùng đã đăng nhập có thể đóng góp câu hỏi mới (`pending`), tài khoản Quản trị viên (`role: admin`) truy cập màn hình kiểm duyệt để phê duyệt (`approved`) hoặc từ chối (`rejected`).

---

## Công nghệ sử dụng (Tech Stack)

### Frontend (`client/`)
- **Core:** React 18, Vite 5, JavaScript (ES6+), React Router DOM v6
- **UI & Visualization:** Tailwind CSS, Lucide React, Recharts
- **Chuyên dụng:** `@monaco-editor/react` (Code Editor), `react-markdown` (Tài liệu kỹ thuật)
- **Networking:** Axios (Interceptor tự động đính kèm Bearer Access Token & hàng đợi Refresh Token)

### Backend (`server/`)
- **Core:** Node.js, ExpressJS (RESTful API `/api/v1`)
- **Database:** MongoDB & Mongoose ODM
- **Bảo mật & Validation:** `jsonwebtoken` (JWT Access/Refresh), `bcryptjs`, `zod`, `helmet`, `cors`, `express-rate-limit`
- **Code Execution Sandbox:** Piston API (`PISTON_API_URL`) qua Backend Proxy với `AbortController` timeout

---

## Kiến trúc & Thiết kế kỹ thuật

- **Phân tầng Backend (Separation of Concerns):** `routes/` → `middlewares/` → `controllers/` → `services/` → `models/` (tách biệt logic nghiệp vụ và truy vấn Mongoose khỏi Controller/Router).
- **Polymorphic Question Schema:** Collection `questions` quản lý thống nhất 3 định dạng (`mcq`, `fill_blank`, `coding`) thông qua trường `payload` linh hoạt và Compound Index `{ status: 1, level: 1, category: 1, tags: 1 }`.
- **Strategy Pattern cho bộ chấm điểm (`server/src/services/grading/`):** Tách riêng 3 chiến lược chấm điểm `mcq.strategy.js`, `fillBlank.strategy.js` và `coding.strategy.js`.
- **Chống lộ đáp án (Anti-Cheating Projection):** API lấy danh sách/chi tiết câu hỏi và phiên thi thử luôn loại bỏ `payload.correctOptionIds`, `payload.acceptedAnswers`, `explanation` và ẩn chi tiết `testCases` có `isHidden: true` trước khi trả về Client.
- **Cô lập thực thi Code:** Tuyệt đối không dùng `eval()`, `new Function()` hay `child_process` trên Express Server; mọi yêu cầu chạy/nộp code đều đi qua `sandboxLimiter` và timeout `SANDBOX_TIMEOUT_MS`.

---

## Cấu trúc thư mục

```text
DevPrep/
├── client/                         # Frontend React + Vite + Tailwind CSS
│   └── src/
│       ├── api/                    # Axios client & các module gọi REST API
│       ├── components/             # Navbar, MegaMenu, SkillPicker, MarkdownRenderer, Toast...
│       ├── data/                   # Danh mục track/kỹ năng chuẩn hóa & dữ liệu seed tham chiếu
│       ├── features/               # Các màn hình theo tính năng: tracks, auth, study-hub,
│       │                           # practice, mock-test, analytics, admin
│       ├── layouts/                # LandingLayout, MainLayout, AuthLayout, ReaderLayout, WorkspaceSplitLayout
│       └── utils/                  # storage.js, markdownToc.js, cn.js
└── server/                         # Backend Node.js + Express + MongoDB
    ├── .env.example                # Mẫu biến môi trường cho Backend
    └── src/
        ├── config/                 # env.js, db.js
        ├── controllers/            # Điều phối HTTP Request/Response
        ├── middlewares/            # auth.middleware.js, validateRequest.js, rateLimiter.js, errorHandler.js
        ├── models/                 # User, Article, Question, Submission, MockTest, ReviewQueue
        ├── routes/                 # Định tuyến /api/v1/*
        ├── services/               # Nghiệp vụ & MongoDB Aggregation + grading/ (Strategy Pattern)
        └── seed.js                 # Script khởi tạo dữ liệu mẫu vào MongoDB
```

---

## Hướng dẫn cài đặt & chạy cục bộ

### 1. Yêu cầu môi trường
- **Node.js** `>= 18` và **npm**
- **MongoDB** đang chạy cục bộ (`mongodb://127.0.0.1:27017`) hoặc chuỗi kết nối **MongoDB Atlas**

### 2. Cài đặt dependencies
Chạy lần lượt cho cả Backend và Frontend từ thư mục gốc `DevPrep/`:

```bash
npm --prefix server install
npm --prefix client install
```

### 3. Cấu hình biến môi trường Backend
Sao chép file mẫu `server/.env.example` thành `server/.env` và điều chỉnh thông số nếu cần:

```bash
cp server/.env.example server/.env
```

Nội dung `server/.env.example`:

```env
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/devprep
JWT_ACCESS_SECRET=devprep_access_secret_key_change_in_production_2026
JWT_REFRESH_SECRET=devprep_refresh_secret_key_change_in_production_2026
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
PISTON_API_URL=https://emkc.org/api/v2/piston/execute
SANDBOX_TIMEOUT_MS=4000
```

> **Lưu ý Frontend:** Mặc định `client/src/api/axiosClient.js` trỏ tới `http://localhost:5001/api/v1`. Nếu đổi cổng Backend hoặc deploy, cấu hình biến `VITE_API_BASE_URL` trong `client/.env`.

### 4. Nạp dữ liệu mẫu (Seed Database)
Lệnh sau sẽ làm sạch dữ liệu cũ và nạp sẵn 2 tài khoản mẫu, toàn bộ bài viết Study Hub, câu hỏi 4 cấp độ, lịch sử nộp bài, hàng đợi Spaced Repetition và 1 kết quả thi thử mẫu:

```bash
npm --prefix server run seed
```

### 5. Khởi chạy ứng dụng
Mở 2 terminal riêng biệt:

```bash
# Terminal 1: Khởi chạy Backend API (cổng 5001)
npm --prefix server run dev

# Terminal 2: Khởi chạy Frontend Vite (cổng 5173)
npm --prefix client run dev
```

Truy cập trình duyệt tại: `http://localhost:5173`

---

## Tài khoản Demo có sẵn (sau khi chạy `seed`)

| Vai trò | Email | Mật khẩu | Quyền hạn |
| :--- | :--- | :--- | :--- |
| **User** | `demo@devprep.vn` | `DevPrep@2026` | Luyện tập, thi thử, đóng góp câu hỏi, xem dashboard cá nhân |
| **Admin** | `admin@devprep.vn` | `Admin@2026` | Toàn bộ quyền User + Kiểm duyệt câu hỏi tại `/admin` |

---

## Danh sách REST API chính (`/api/v1`)

| Nhóm | Endpoint | Mô tả | Xác thực |
| :--- | :--- | :--- | :--- |
| **System** | `GET /api/v1/health` | Kiểm tra trạng thái hoạt động của API Server | Công khai |
| **Auth** | `POST /api/v1/auth/register` | Đăng ký tài khoản mới | Công khai |
| **Auth** | `POST /api/v1/auth/login` | Đăng nhập, cấp Access & Refresh Token | Công khai |
| **Auth** | `POST /api/v1/auth/refresh-token` | Làm mới Access Token (`/refresh` tương đương) | Công khai |
| **Auth** | `GET /api/v1/auth/me` | Lấy thông tin người dùng hiện tại | JWT |
| **Users** | `PUT /api/v1/users/profile` | Cập nhật hồ sơ, `targetLevel`, `selectedSkills` | JWT |
| **Articles** | `GET /api/v1/articles` | Danh sách bài viết (lọc theo level, category, tags/skills) | Tùy chọn JWT |
| **Articles** | `GET /api/v1/articles/:slug` | Chi tiết bài viết kèm trạng thái hoàn thành | Tùy chọn JWT |
| **Articles** | `POST /api/v1/articles/:articleId/complete` | Đánh dấu / bỏ đánh dấu hoàn thành bài viết | JWT |
| **Questions** | `GET /api/v1/questions` | Danh sách câu hỏi `approved` (đã ẩn đáp án) | Tùy chọn JWT |
| **Questions** | `GET /api/v1/questions/:questionId` | Chi tiết câu hỏi (ẩn đáp án & hidden test cases) | Tùy chọn JWT |
| **Questions** | `POST /api/v1/questions` | Đóng góp câu hỏi mới (mặc định `pending` nếu là user) | JWT |
| **Practice** | `POST /api/v1/practice/run-code` | Chạy thử code với sample test cases qua Piston Proxy | Tùy chọn JWT |
| **Practice** | `POST /api/v1/practice/submit` | Nộp bài (MCQ / Fill-blank / Coding) & lưu Submission | Tùy chọn JWT |
| **Analytics** | `GET /api/v1/practice/analytics` | Thống kê lỗ hổng kiến thức & hàng đợi Spaced Repetition | Tùy chọn JWT |
| **Analytics** | `POST /api/v1/practice/review-queue/bookmark` | Ghim / gỡ câu hỏi khỏi hàng đợi ôn tập | JWT |
| **Analytics** | `PATCH /api/v1/practice/review-queue/:reviewId/advance` | Tăng chu kỳ ôn tập `1 → 3 → 7 → 14` ngày | JWT |
| **Mock Test** | `GET /api/v1/practice/mock-tests/templates` | Danh sách bộ đề thi thử mẫu | Tùy chọn JWT |
| **Mock Test** | `GET /api/v1/practice/mock-tests/session/:templateId` | Tải phiên đề thi thử (đã ẩn đáp án) | Tùy chọn JWT |
| **Mock Test** | `POST /api/v1/practice/mock-tests/submit` | Chấm điểm & lưu kết quả bài thi thử | Tùy chọn JWT |
| **Mock Test** | `GET /api/v1/practice/mock-tests/latest` | Lấy kết quả bài thi thử gần nhất | Tùy chọn JWT |
| **Admin** | `GET /api/v1/admin/questions` | Danh sách câu hỏi phục vụ kiểm duyệt | Admin (`RBAC`) |
| **Admin** | `PATCH /api/v1/admin/questions/:questionId/status` | Phê duyệt (`approved`) hoặc từ chối (`rejected`) câu hỏi | Admin (`RBAC`) |

---

## Lộ trình hoàn thiện tiếp theo (Giai đoạn 5)
- Nâng cấp test harness chạy và đối chiếu output từng test case (public & hidden) độc lập trên Piston API trong `coding.strategy.js`.
- Bổ sung bộ kiểm thử tự động (Unit & Integration Tests) cho Auth/RBAC, Anti-Cheating Projection và Grading Engine.
- Cấu hình triển khai thực tế (Frontend trên Vercel/Netlify, Backend trên Render/Railway, Database trên MongoDB Atlas).
