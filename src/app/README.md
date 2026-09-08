# Progress trong `src/app/`

Tài liệu này ghi lại trạng thái hiện tại của các màn hình trong thư mục `src/app/` cho đến thời điểm này.

## Tổng quan

Phần `src/app/` hiện đang tập trung vào việc xây dựng giao diện chính của app gym theo phong cách mock UI/UX tĩnh. Các màn hình đã có layout rõ ràng, màu sắc và cấu trúc dữ liệu demo, nhưng chưa có kết nối backend hoặc lưu trữ dữ liệu thực tế.

## Trạng thái hiện tại

- ✅ `index.tsx` — màn hình Trang chủ đã hoàn thiện UI
- ✅ `calendar.tsx` — màn hình Lịch tập đã hoàn thiện UI
- ✅ `statistics.tsx` — màn hình Thống kê đã hoàn thiện UI
- ✅ `profile.tsx` — màn hình Cá nhân đã hoàn thiện UI
- ✅ `_layout.tsx` — tab navigation đã được cấu hình
- ⚠️ `explore.tsx` — vẫn đang là screen mẫu mặc định của Expo, chưa được tùy chỉnh theo app gym

## Mỗi file đang làm gì

### 1) `_layout.tsx`
- Cấu hình `Tabs` cho app
- Có 4 tab chính: Trang chủ, Lịch tập, Thống kê, Cá nhân
- Ẩn tab `explore` khỏi bottom navigation
- Thiết lập màu active/inactive và style tab bar

### 2) `index.tsx`
- Màn hình dashboard chính
- Hiển thị:
  - lời chào + avatar
  - thẻ membership / gói tập hiện tại
  - nút Check-in
  - chi nhánh hiện tại
  - thống kê tháng này
  - preview lịch tập trong tuần
- Dữ liệu đang là dữ liệu giả (hardcoded demo)

### 3) `calendar.tsx`
- Màn hình lịch tập theo tháng
- Có chức năng chuyển tháng trước/sau
- Hiển thị các ngày đã tập bằng vòng tròn màu nổi bật
- Có summary card cho tháng hiện tại
- Chưa có real workout data, đang dùng `WORKOUT_DAYS` tĩnh

### 4) `statistics.tsx`
- Màn hình thống kê tiến độ luyện tập
- Hiển thị:
  - số ngày tập
  - streak
  - tổng thời gian
  - biểu đồ theo tuần
  - mục tiêu tháng
  - achievement card
- Dữ liệu đang được mặc định bằng các con số mock

### 5) `profile.tsx`
- Màn hình cá nhân cơ bản
- Hiển thị avatar, tên, email, danh sách menu
- Mục menu hiện mới là UI static, chưa có hành vi click hay dữ liệu thực

### 6) `explore.tsx`
- Đây là màn hình template ban đầu của Expo
- Chưa được đổi thành chức năng riêng của app gym
- Có thể dùng như nơi để thử nghiệm hoặc thay thế sau này

## Đánh giá trạng thái hiện tại

Hiện tại, phần `src/app/` đã đi được khoảng 70–80% trong việc tạo giao diện chính của app. Các màn hình chính đã có mặt và đồng nhất về style, nhưng phần còn thiếu lớn nhất là:

- chưa có dữ liệu động từ API
- chưa có lưu trữ / local database
- chưa có logic check-in thật
- chưa có màn hình chi tiết buổi tập
- chưa có màn hình auth / login
- chưa tối ưu component hóa lại

## Kế hoạch tiếp theo

1. Tách UI thành reusable components
2. Xử lý dữ liệu thực từ model / API
3. Thêm màn hình chi tiết buổi tập
4. Xây dựng flow check-in và lưu lịch tập
5. Thay thế màn hình mẫu `explore.tsx` bằng tính năng thực tế
6. Hoàn thiện profile và settings

## Ghi chú

Toàn bộ mã trong `src/app/` hiện đang là dạng UI mock và có thể dùng để demo layout. Nếu cần tiếp tục phát triển, nên bắt đầu từ việc chuẩn hóa dữ liệu và tách component trước khi triển khai logic nghiệp vụ.
