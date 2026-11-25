# Build Android release

## APK cài trực tiếp

Chạy trong thư mục dự án:

```sh
npm install
npm run check:release
npx eas-cli@latest login
npx eas-cli@latest init
npm run build:apk
```

- `login`: đăng nhập tài khoản Expo của bạn trên terminal.
- `init`: tạo hoặc liên kết dự án Expo; CLI ghi `extra.eas.projectId` thật vào cấu hình. Không tự điền UUID hoặc owner giả.
- Khi CLI hỏi Android keystore lần đầu, chọn tạo khóa mới nếu đây là lần phát hành đầu tiên. Nếu đã có APK phát hành với cùng application ID, dùng lại khóa ký cũ.
- Profile `release-apk` tạo APK release có ký, `developmentClient: false`, dùng được độc lập với Metro/Expo Go.
- Sau khi build thành công, terminal hiển thị đường dẫn tải APK trên Expo. Mở link trên Android để tải và cài. Đây là bước người dùng tự thực hiện; không cần gửi mật khẩu hoặc khóa ký vào cuộc trò chuyện.
- `autoIncrement: true` tăng versionCode cho bản build. Cấu hình dùng versionCode cục bộ; lưu lại thay đổi cấu hình sau mỗi lần build.

Chưa có file APK chỉ từ việc cấu hình EAS hoặc chạy `expo export`: phải hoàn thành bước build native để có APK.

## AAB cho Google Play

```sh
npm run build:aab
```

Profile `production` tạo Android App Bundle để tải lên Google Play Console. Đây là lệnh build; chưa tự submit lên cửa hàng. AAB không dùng để cài trực tiếp như APK.

## Kiểm tra sau khi cài APK

1. Mở app lần đầu và khởi động lại khi đã tắt Metro: phải thấy studio, icon và màn khởi động mới.
2. Xoay dọc/ngang; đổi tất cả bottom tab và các mục công cụ bên trong.
3. Tạo một bản nháp, sửa lời, đóng/mở lại app để kiểm tra lưu cục bộ.
4. Thử phát piano, nhịp đệm và cả bài; thử thu ngân nga khi cấp quyền và khi từ chối quyền micro.
5. Xuất/chia sẻ một file MIDI, WAV, PDF, PNG.
6. Bật chế độ máy bay rồi mở lại để kiểm tra tài nguyên và mẫu âm thanh đã được đóng gói.

## Khóa ký và cập nhật

Dùng `npx eas-cli@latest credentials -p android` để quản lý và sao lưu keystore theo tài khoản của bạn. Giữ khóa ký và thông tin mật khẩu ở nơi riêng an toàn; không commit vào Git. APK và AAB phát hành phải dùng đúng định danh `com.thuanlevan.studio`.

## Build cloud tự chuẩn bị CSS

`eas-build-post-install` chạy `studio:css` và kiểm tra assets sau khi cài dependencies. Samples âm thanh đã có trong source, không cần truy cập dự án web bên cạnh trên máy build.

## Tài liệu

- https://docs.expo.dev/build-reference/apk/
- https://docs.expo.dev/build/eas-json/
- https://docs.expo.dev/build/setup/


## Nguồn npm cho máy build

Dự án có `.npmrc` trỏ tới `https://registry.npmjs.org/`. Các URL tarball trong lockfile cũng dùng npm công khai, giữ nguyên phiên bản và integrity, để máy build EAS không cần truy cập registry nội bộ `10.1.15.50`. Không đưa thông tin đăng nhập registry nội bộ vào project.
