export default function getCroppedImg(imageSrc, pixelCrop, format = 'image/jpeg') {
  if (!imageSrc || !pixelCrop) {
    return Promise.reject(new Error('이미지 소스와 크롭 정보가 필요합니다.'));
  }

  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = imageSrc;
    image.onload = () => {
      // 크롭 좌표가 이미지 경계 내에 있는지 확인
      const validX = Math.max(0, Math.min(pixelCrop.x, image.width - 1));
      const validY = Math.max(0, Math.min(pixelCrop.y, image.height - 1));
      const validWidth = Math.max(1, Math.min(pixelCrop.width, image.width - validX));
      const validHeight = Math.max(1, Math.min(pixelCrop.height, image.height - validY));

      const canvas = document.createElement('canvas');
      canvas.width = validWidth;
      canvas.height = validHeight;
      const ctx = canvas.getContext('2d');

      ctx.drawImage(
        image,
        validX,
        validY,
        validWidth,
        validHeight,
        0,
        0,
        validWidth,
        validHeight
      );

      resolve(canvas.toDataURL(format));
    };
    image.onerror = (error) => reject(error);
  });
}