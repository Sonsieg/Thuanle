# Prompt và nguồn bộ nhận diện

Công cụ: built-in ImageGen, không dùng CLI/API fallback. Các ảnh đã chọn được sao chép vào `assets/brand/`. PNG master được Expo xử lý thành kích thước icon nền tảng khi build.

## app-icon.png

Edit target: ảnh concept nốt nhạc/ngòi bút ban đầu. Prompt:

> Turn the reference logo into the final square app icon for Thuận Lê Studio. Preserve the exact musical note, fountain pen nib and five sound-wave bars design. Replace transparency with a completely opaque uniform deep navy #0A192F background extending to every edge. Clean ALL stray pixels and artifacts. Flat crisp sky cyan #38BDF8 note and ivory #F1F5F9 nib and bars, no gradients or shading. Center the symbol and make it occupy approximately 68 percent of the image width and height. Square exactly 1024x1024. Sharp square canvas edges, NO rounded corner mask, no border, no text, no mockup, no shadow.

## logo-transparent.png / adaptive-foreground.png / splash-logo.png

Edit target: app-icon.png. `transparent_background: true`. Prompt:

> Use case: background-extraction. Extract ONLY the cyan musical note with ivory pen nib and five ivory bars from this image. Remove every navy background pixel, replacing the entire background with genuine transparency. The extracted note must be solid and perfectly clean, smooth flat vector-like silhouette with NO blue speckles or leftover background anywhere. Keep every part of the cyan silhouette and ivory interior intact. Center the extracted note with equal generous transparent padding such that the visible mark occupies only the central 58 percent of the square canvas. Production Android adaptive foreground icon, no text, no shadows, no texture.

