/**
 * Client-side image compressor utility
 * Compresses phone/desktop photos to lightweight JPEG base64 DataURLs
 * Ideal for fast uploads, mobile networks, and lightweight storage.
 */
export async function compressImageFile(
  file: File,
  maxWidth = 1000,
  quality = 0.8
): Promise<string> {
  // Validate file type
  if (!file.type || !file.type.startsWith('image/')) {
    throw new Error('Định dạng tệp không hợp lệ. Vui lòng chọn tệp hình ảnh (JPEG, PNG, WebP).');
  }

  // Reject files exceeding 10MB to prevent memory exhaustion
  const MAX_RAW_SIZE = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_RAW_SIZE) {
    throw new Error('Kích thước ảnh quá lớn (tối đa 10MB). Vui lòng chọn ảnh nhẹ hơn.');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataString = event.target?.result as string;
      if (!dataString) {
        reject(new Error('Không thể đọc dữ liệu tệp ảnh.'));
        return;
      }

      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataString);
          return;
        }

        // Draw image on canvas and export as optimized JPEG
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Không thể xử lý dữ liệu tệp ảnh.'));
      img.src = dataString;
    };
    reader.onerror = () => reject(new Error('Lỗi khi đọc tệp ảnh từ thiết bị.'));
    reader.readAsDataURL(file);
  });
}
