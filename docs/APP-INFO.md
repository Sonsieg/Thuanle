# Thuận Lê Studio

Tên hiển thị: **Thuận Lê Studio**  
Tên dự án Expo (slug): `thuan-le`  
Phiên bản: `1.0.0`  
Android application ID: `com.thuanlevan.studio`  
iOS bundle ID: `com.thuanlevan.studio`  
Android versionCode ban đầu: `1`  
iOS buildNumber ban đầu: `1`  
Deep-link scheme: `thuanle`  
Website: https://thuanlevan.vercel.app/studio

## Nội dung giới thiệu

Tagline: **Viết lời. Tìm hợp âm. Chơi giai điệu.**

Mô tả ngắn:

> Viết lời, tìm hợp âm, tạo giai điệu và chơi piano trong một phòng sáng tác.

Mô tả đầy đủ:

Thuận Lê Studio là phòng sáng tác giúp bạn ghi lại ý tưởng thành lời hát, hợp âm và giai điệu.

- Soạn lời tiếng Việt, đếm âm tiết và khám phá nhóm vần.
- Tìm hợp âm, thử vòng hòa âm và chuyển tông bài hát.
- Sắp xếp Intro, Verse, Chorus và các đoạn nhạc.
- Chọn nhịp, tốc độ, nhạc cụ và kiểu đệm.
- Chơi piano, chỉnh giai điệu trong piano roll hoặc ngân nga để ghi nốt.
- Lưu bản nháp trên thiết bị và xuất MIDI, WAV, PDF, PNG để tiếp tục sáng tác.

## Nhận diện

Màu nền: navy `#0A192F`.  
Màu chính: sky `#38BDF8`, ocean `#0284C7`.  
Màu sáng: ivory `#F1F5F9`.  
Biểu tượng: nốt nhạc kết hợp ngòi bút; dùng biểu tượng riêng, không có chữ ở kích thước icon.

Các file icon chính thức nằm trong `assets/brand/`; `app.json` tham chiếu trực tiếp đến các file này. Các icon Expo starter cũ không còn được dùng trong cấu hình phát hành.

## Trước khi đưa lên Google Play

Các nội dung trên là thông tin sản phẩm và bản nháp giới thiệu, chưa phải hồ sơ đã nộp lên cửa hàng. Email hỗ trợ, URL chính sách quyền riêng tư, biểu mẫu Data safety, độ tuổi và ảnh chụp màn hình cần được hoàn thiện bằng thông tin thực tế của chủ ứng dụng. Chưa tự đặt email hay URL chính sách chưa tồn tại.

Application ID là định danh ứng dụng khi cài đặt và cập nhật. Sau khi phát hành, tiếp tục dùng định danh này và cùng khóa ký cho các bản cập nhật. App dùng micro khi người dùng chọn thu ngân nga; bản nháp được lưu cục bộ, chia sẻ file do người dùng chọn ứng dụng nhận qua share sheet.


## Quyền Android

Bản phát hành giữ quyền micro cho tính năng thu ngân nga. Các quyền overlay (`SYSTEM_ALERT_WINDOW`) và truy cập bộ nhớ chung cũ (`READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE`) được chặn trong cấu hình; lưu bản nháp và xuất file dùng thư mục nội bộ của app cùng share sheet.
