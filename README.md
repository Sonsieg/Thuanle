# Thuan Le — Lyric & Groove Studio

Ứng dụng Expo SDK 58 tích hợp phần Lyric & Groove Sketchpad từ `../thuanlevan-main`.

## Chạy ứng dụng

```sh
npm install
npm start
```

Mở bằng Expo Go tương thích SDK 58 hoặc development build. `npm run ios`, `npm run android` và `npm run web` cũng được hỗ trợ. Khi sửa class Tailwind, chạy `npm run studio:css` (các lệnh khởi động npm tự chạy bước này).

## Bottom tabs

| Tab | Chức năng |
| --- | --- |
| Bản nháp | Chọn/tạo/đổi tên/xóa bản nháp, ý tưởng một chạm, sách hướng dẫn, xuất WAV/MIDI/PDF/PNG, giao diện sáng/tối |
| Lời & Hợp âm | Soạn lời tiếng Việt, nhóm vần/Bằng–Trắc/đếm tiếng, chèn hợp âm, gợi ý hợp âm, progression, quản lý/nhân đôi/sắp xếp đoạn và đổi hợp âm từng ô |
| Phối khí | Tông/chuyển tông, BPM, nhịp, mood, nhạc cụ, arpeggio/điệu đệm, trống/metronome/sustain, timeline và karaoke đồng bộ |
| Giai điệu | Tạo melody theo hòa âm, ngân nga thành nốt, scale snap, sửa nốt/thời lượng trong piano roll, chọn âm sắc và mute từng đoạn |
| Piano | Đàn C2–C6, chế độ solo/hợp âm, đổi quãng tám và ghi phím đàn vào piano roll |

Chọn bài và điều khiển phát/dừng/lặp hiện diện trên mọi tab. Các tab chia sẻ một phiên studio; việc chuyển tab không remount bộ xử lý nhạc. Có nút mũi tên để đổi thứ tự đoạn trên màn hình cảm ứng.

## Kiến trúc

Đây là bản tích hợp **hybrid bằng Expo DOM**, không phải bản viết lại toàn bộ giao diện bằng native views. Expo Router và thanh tab dùng React Native; studio chạy từ source đóng gói trong app bằng `use dom` và `react-native-webview`, không mở URL Vercel. Cách này giữ lại Tone.js/Web Audio, Pitchy, canvas piano roll/timeline, hòa âm và bộ kết xuất gốc.

- `src/app/_layout.tsx`: điều hướng Expo Router, native tabs và phiên studio dùng chung.
- `src/studio/components/`: các thành phần studio từ web, đã tách pane và điều chỉnh thao tác di động.
- `src/studio/utils/lyricGrooveEngine.ts`: logic âm nhạc, seed bài mẫu, phân tích lời, MIDI/WAV.
- `src/studio/nativeServices.ts`: lưu JSON tuần tự vào Documents, xin quyền micro, ghi/chia sẻ file qua Expo FileSystem và Sharing.
- `src/studio/utils/nativeBridge.ts`: truyền file theo từng chunk để giới hạn kích thước thông điệp qua bridge.
- `src/studio/generated/sampleAssets.ts`: 67 mẫu piano/guitar được nhúng dạng data URI để phát offline. File đã có sẵn; chỉ chạy `npm run studio:samples` khi muốn tạo lại từ `../thuanlevan-main/public/audio`. Có thể truyền thư mục khác qua `npm run studio:samples -- /path/to/audio`.
- `src/studio/studio.input.css`: nguồn CSS. `studio.css` là file đã biên dịch và được đóng gói cùng app.

Trên iOS/Android, bản nháp lưu tại `Documents/lyric-groove-drafts-v1.json`; file xuất lưu tại `Documents/Exports` và mở share sheet. Trên web, giữ IndexedDB/localStorage và tải file như source gốc. Dữ liệu trình duyệt của website không tự chuyển sang app do khác vùng lưu trữ.

Không cần kết nối tới website để dùng studio. Ngân nga cần cấp quyền micro; trên web hoặc dev server, WebView còn yêu cầu secure context phù hợp (HTTPS/localhost). Khi phát triển trên thiết bị qua IP LAN, dùng `npx expo start --tunnel` nếu WebView không cho truy cập micro. Kiểm tra lại tính năng này trong bản cài thực tế.

## Kiểm tra

```sh
npm run typecheck
npm run lint
npm run test:studio
npx expo export --platform ios --platform android --output-dir /tmp/thuan-le-studio-export
```

Bộ test gồm 24 bài từ logic web gốc, 2 bài kiểm tra bridge file (toàn vẹn byte khi chia chunk và dọn file dở khi lỗi), và 5 bài kiểm tra bootstrap Android (host OS, props và bridge chưa sẵn sàng). Export bundle xác nhận đóng gói source và tài nguyên cho hai nền tảng; chưa thay thế kiểm tra âm thanh, micro, bàn phím ảo, lưu dữ liệu sau khi đóng app và share sheet trên thiết bị thật.


## Khởi tạo DOM trên Android

`src/studio/domBootstrap.ts` tạo script chạy qua `injectedJavaScriptBeforeContentLoaded`. Script chuẩn bị host OS và initial props, đồng thời cung cấp `injectedObjectJson` nếu bridge Android chưa có dữ liệu. Không bỏ prop này: trong React Native WebView 14, nhánh tái chèn bridge ở `onPageStarted` chỉ chạy khi script trước nội dung không rỗng. Thiếu bước này có thể gây lỗi `Top OS ($$EXPO_DOM_HOST_OS) is not defined`.

Native layout chờ `onReady` từ DOM; nếu tải lỗi hoặc quá 60 giây sẽ hiện thông báo và nút tải lại. WebView container có `flex: 1` để tránh nội dung bị co về chiều cao 0 trên Android. Sau khi cập nhật phần bootstrap, dừng Metro và chạy `npm start -- --clear`, rồi đóng/mở lại app trên điện thoại.


## Màn hình dọc và ngang

- App cho phép xoay theo hệ thống (`orientation: default`); thanh tiêu đề có nút **Xoay ngang** và **Tự xoay** trên iOS/Android. Module được tải khi bấm nút để development build cũ thiếu module không làm trắng cả studio. Nếu dùng development build cũ, build lại app sau khi thêm `expo-screen-orientation`.
- Màn hình ngang thấp tự thu gọn tiêu đề và bottom tab, đưa phím piano lên trước phần chỉnh đoạn/hợp âm. Chọn đoạn nằm trong mục có thể thu gọn; các nút sắp xếp/nhân đôi vẫn có đủ bên trong.
- Phím đàn có vùng cuộn ngang riêng; vuốt trên cả phím trắng/đen không khóa cuộn. Piano roll giữ vùng vẽ riêng, xử lý pointer cancel và vẽ lại khi đổi kích thước.
- Giao diện tablet/màn rộng dùng hai cột cho lời và phân tích hòa âm; điện thoại dùng một cột. Safe area bao gồm cả cạnh trái/phải khi nằm ngang.
- Bản web có vùng cuộn nội dung riêng và dùng snapshot ổn định khi hydration, tránh lỗi nhãn tab khác nhau giữa server/client.

Đã xem trực tiếp bản web bằng Chrome responsive ở 390×844 và 844×390, từ đó sửa khoảng trống căn giữa, lỗi hydration và ưu tiên vị trí piano khi nằm ngang. Kiểm tra mã: 31/31 tests, TypeScript/lint, kiểm tra phiên bản dependency theo Expo SDK và export bundle iOS/Android/Web. Chưa xác nhận thao tác xoay bằng nút, micro và âm thanh trên Android thật.


## Chuyển công cụ thay vì cuộn qua tất cả

Mỗi bottom tab giờ có một thanh công cụ nhỏ. **Lời & Hợp âm** mặc định mở Soạn lời; Hợp âm, Soi vần và Đoạn nhạc là các mục riêng. **Phối khí** chia Âm sắc / Sân khấu / Kiểu rải / Điệu đệm. **Giai điệu** chia Piano roll / Thu & tạo / Đoạn nhạc; **Piano** chia Bàn phím / Chế độ / Đoạn nhạc.

Nút phát/dừng hiển thị trực tiếp, các tùy chọn phát/lặp nằm trong menu. Có ô chọn đoạn gần vùng làm việc; đổi tên/số ô và vòng hòa âm mẫu chỉ mở khi cần. Các vùng soạn vẫn được mount để giữ nội dung, con trỏ và trạng thái thu/phát khi đổi công cụ. Ở màn ngang đủ rộng, Soạn lời và Piano roll dùng hai cột: chọn bài/đoạn bên trái, vùng làm việc bên phải.


## Icon, thông tin ứng dụng và APK release

Tên hiển thị: **Thuận Lê Studio**, application ID `com.thuanlevan.studio`, phiên bản `1.0.0`. Bộ icon, adaptive icon, splash và favicon nằm trong `assets/brand/`.

```sh
npm run check:release
npx eas-cli@latest login
npx eas-cli@latest init
npm run build:apk
```

`release-apk` là profile APK release có ký để cài trực tiếp; `npm run build:aab` tạo AAB cho Google Play. Build cloud tự chạy bước tạo CSS và kiểm tra icon. Chưa có APK chỉ từ `expo export`; cần chạy build native và nhận link APK thành công từ Expo.

Xem hướng dẫn đầy đủ trong [docs/ANDROID-RELEASE.md](docs/ANDROID-RELEASE.md), thông tin giới thiệu trong [docs/APP-INFO.md](docs/APP-INFO.md) và prompt tạo hình bằng built-in ImageGen trong [docs/BRAND-PROMPTS.md](docs/BRAND-PROMPTS.md).
# Thuanle
