# GymTrack

GymTrack là ứng dụng quản lý phòng gym được xây dựng bằng Expo React Native và backend Express/TypeScript. Ứng dụng hiện đã có luồng đăng ký, đăng nhập, xác thực JWT và màn hình hồ sơ người dùng.

## Trạng thái hiện tại

### Đã làm được

- Khởi tạo mobile app bằng Expo SDK 57, Expo Router và TypeScript.
- Tạo backend Express chạy ở cổng `5000`.
- Kết nối PostgreSQL bằng Prisma 7 và `@prisma/adapter-pg`.
- Kiểm tra kết nối database bằng `backend/src/test-db.ts`.
- Đăng ký với họ tên, email, số điện thoại, ngày sinh, địa chỉ và mật khẩu.
- Hash mật khẩu bằng `bcryptjs` và đăng nhập bằng JWT thời hạn 7 ngày.
- Lưu JWT trên thiết bị bằng `expo-secure-store`.
- Gọi và cập nhật profile bằng header `Authorization: Bearer <token>`.
- Tự động xóa phiên khi token hết hạn hoặc API trả về `401`.
- Đăng xuất và xóa dữ liệu session cũ.
- Khi đổi tài khoản, profile được reset và tải lại theo token mới.
- Cập nhật chiều cao, cân nặng, khối lượng cơ, mỡ cơ thể, giới tính, ngày sinh, địa chỉ và số điện thoại.
- Tự tính tuổi từ ngày sinh, BMI và ước tính mỡ cơ thể.
- Đã tạo migration cho `address` và `muscleMass`.
- Backend build hiện tại đã chạy thành công.

### Chưa làm hoặc có thể phát triển tiếp

- Chưa có màn hình quản lý lịch tập hoàn chỉnh.
- Chưa có CRUD bài tập, lịch sử cân nặng và check-in dù model database đã có.
- `memberId` trên profile hiện vẫn là giá trị tạm trong UI.
- Chưa có chức năng đổi mật khẩu hoàn chỉnh ở backend.
- Chưa có phân quyền admin/member.
- Chưa validate định dạng email, số điện thoại và ngày sinh thật chặt ở cả client/backend.
- Ngày sinh hiện nhập thủ công theo định dạng `YYYY-MM-DD`.
- API URL đang viết trực tiếp trong một số file mobile, nên tách ra thành config chung.

## Công nghệ

### Mobile

- Expo SDK `57`
- React Native `0.86`
- React `19`
- Expo Router và TypeScript
- `expo-secure-store`
- FontAwesome React Native

### Backend

- Node.js, Express 5 và TypeScript
- Prisma 7 với PostgreSQL
- JWT với `jsonwebtoken`
- Mã hóa mật khẩu với `bcryptjs`

## Cấu trúc chính

```text
gymtrack/
├── src/                         # Expo mobile app
│   ├── app/                     # Các màn hình Expo Router
│   │   ├── index.tsx            # Trang chính
│   │   ├── login.tsx            # Đăng nhập
│   │   ├── register.tsx         # Đăng ký
│   │   ├── profile.tsx          # Hồ sơ và chỉ số cơ thể
│   │   ├── calendar.tsx         # Lịch
│   │   ├── notifications.tsx    # Thông báo
│   │   └── change-password.tsx  # UI đổi mật khẩu hiện có
│   ├── components/              # Component dùng chung
│   ├── constants/               # Theme/constants
│   └── hooks/                   # Custom hooks
├── backend/
│   ├── src/
│   │   ├── server.ts            # Khởi động Express
│   │   ├── controllers/         # Xử lý auth và user
│   │   ├── routes/              # Khai báo API
│   │   ├── middleware/          # JWT middleware
│   │   └── lib/prisma.ts        # Prisma client
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   └── migrations/          # Database migrations
│   └── .env                     # Cấu hình backend, không commit
├── assets/                      # Icon và hình ảnh
├── app.json                     # Expo config
└── package.json                 # Mobile scripts
```

## Cài đặt

### Yêu cầu

- Node.js theo Expo SDK 57: `22.13.x` hoặc mới hơn trong nhánh Node 22.
- PostgreSQL đang chạy local.
- Điện thoại và máy chạy backend phải cùng mạng Wi-Fi.

### Mobile

Từ thư mục gốc:

```bash
npm install
```

### Backend

```bash
cd backend
npm install
```

Tạo `backend/.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/gymtrack"
JWT_SECRET="replace-with-a-long-random-secret"
PORT=5000
```

Không commit file `.env` hoặc giá trị thật của `JWT_SECRET`.

Đồng bộ Prisma:

```bash
cd backend
npx prisma generate
npx prisma migrate dev
```

## Chạy project

Mở hai terminal riêng.

### Backend

```bash
cd backend
npm run dev
```

Backend mặc định chạy tại `http://localhost:5000`.

Kiểm tra server bằng `GET http://localhost:5000/api/health`. Kết quả mong đợi:

```json
{
  "status": "OK",
  "message": "Server is healthy"
}
```

### Mobile

Từ thư mục gốc:

```bash
npx expo start
```

Có thể mở bằng Expo Go, Android emulator, iOS simulator hoặc web.

## API hiện có

Base URL hiện dùng trên mobile:

```text
http://192.168.88.173:5000
```

Nếu IP máy thay đổi, cập nhật URL trong các file mobile đang gọi API.

### Đăng ký

```text
POST /api/auth/register
```

```json
{
  "fullName": "Nguyen Van A",
  "email": "user@example.com",
  "phone": "0900000000",
  "address": "TP. Ho Chi Minh",
  "dateOfBirth": "2000-01-02",
  "password": "password123"
}
```

### Đăng nhập

```text
POST /api/auth/login
```

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

JWT nằm trong `data.token`, thông tin user nằm trong `data.user`.

### Lấy profile

```text
GET /api/users/me
Authorization: Bearer <token>
```

### Cập nhật profile

```text
PUT /api/users/me
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "fullName": "Nguyen Van A",
  "phone": "0900000000",
  "address": "TP. Ho Chi Minh",
  "dateOfBirth": "2000-01-02",
  "gender": "MALE",
  "height": 175,
  "weight": 70,
  "muscleMass": 35.5,
  "bodyFat": 18
}
```

## Database hiện có

Model `User` lưu email, password hash, họ tên, số điện thoại, địa chỉ, ngày sinh, giới tính, chiều cao, cân nặng, khối lượng cơ, mỡ cơ thể và avatar URL.

Các model nền trong Prisma schema:

- `User`
- `WeightHistory`
- `Exercise`
- `Workout`
- `WorkoutExercise`
- `Branch`
- `CheckIn`
- `Membership`
- `Notification`

## Kiểm tra và build

Kiểm tra database:

```bash
cd backend
npx tsx src/test-db.ts
```

Build backend:

```bash
cd backend
npm run build
```

Lint mobile:

```bash
npx expo lint
```

## Debug nhanh

### `Invalid or expired token`

1. Kiểm tra backend đang chạy cổng `5000`.
2. Kiểm tra mobile gọi đúng IP LAN.
3. Kiểm tra login đã lưu token mới vào `gymtrack_token`.
4. Kiểm tra request profile có `Authorization: Bearer <token>`.
5. Logout trước khi đổi tài khoản.

### Profile vẫn hiện user cũ

- Kiểm tra token hiện tại trong SecureStore.
- Kiểm tra `GET /api/users/me` trả user theo JWT.
- Kiểm tra `useFocusEffect` trong `src/app/profile.tsx` đang fetch lại profile.
- Không dùng dữ liệu user cũ từ state hoặc hardcode trong UI.

### Điện thoại không kết nối backend

- Điện thoại và máy tính phải cùng Wi-Fi.
- Không dùng `localhost` trên điện thoại thật.
- Dùng `ipconfig` trên Windows để lấy IP LAN và cập nhật API URL.
- Kiểm tra Windows Firewall và cổng `5000`.

## Hướng phát triển tiếp theo

1. Tách `API_URL` thành file config dùng chung.
2. Thêm date picker thay cho nhập ngày sinh bằng text.
3. Hoàn thiện đổi mật khẩu ở backend.
4. Thêm validation schema bằng Zod hoặc thư viện tương tự.
5. Làm middleware xử lý lỗi tập trung.
6. Hoàn thiện lịch tập và CRUD bài tập.
7. Lưu lịch sử cân nặng và biểu đồ tiến bộ.
8. Thêm phân quyền admin/member.
9. Viết test cho auth, profile và database.
10. Thêm loading state và thông báo lỗi rõ ràng hơn trên mobile.

## Quy tắc cập nhật README

Sau mỗi tính năng mới, cập nhật các phần liên quan:

- **Trạng thái hiện tại**: ghi tính năng đã hoàn thành.
- **API hiện có**: thêm endpoint và body nếu có API mới.
- **Database hiện có**: ghi model hoặc field mới.
- **Chạy project**: cập nhật command nếu thay đổi cách chạy.
- **Hướng phát triển tiếp theo**: xóa việc đã xong và thêm việc mới.
