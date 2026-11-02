/** Reads text from a photo, fully in the browser (Tesseract). No server, no paid API. */
export async function readImage(file: File): Promise<string> {
  const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const max = 1800;
  const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * k);
  c.height = Math.round(bmp.height * k);
  const g = c.getContext('2d')!;
  g.drawImage(bmp, 0, 0, c.width, c.height);
  // grayscale + contrast boost helps phone photos of printed or handwritten text
  const im = g.getImageData(0, 0, c.width, c.height);
  const px = im.data;
  for (let i = 0; i < px.length; i += 4) {
    const y = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
    const v = Math.max(0, Math.min(255, (y - 128) * 1.5 + 138));
    px[i] = px[i + 1] = px[i + 2] = v;
  }
  g.putImageData(im, 0, 0);
  const T = (await import('tesseract.js')).default;
  const r = await T.recognize(c, 'eng');
  return r.data.text;
}

/** Small JPEG copy of the photo, used only if the rule-based reader needs the AI fallback. */
export async function imageToDataUrl(file: File): Promise<string> {
  const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const k = Math.min(1, 1280 / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * k);
  c.height = Math.round(bmp.height * k);
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', 0.8);
}
