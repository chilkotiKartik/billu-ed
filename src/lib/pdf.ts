/** Turns the on-screen A3 sheet SVG into an A3 landscape PDF, in the browser. */
export async function sheetToPdf(svg: SVGSVGElement, name: string, paper: 'A1' | 'A3' = 'A3') {
  const xml = new XMLSerializer().serializeToString(svg);
  const url = URL.createObjectURL(new Blob([xml], { type: 'image/svg+xml;charset=utf-8' }));
  const img = new Image();
  await new Promise<void>((ok, no) => {
    img.onload = () => ok();
    img.onerror = () => no(new Error('Could not render sheet'));
    img.src = url;
  });
  const c = document.createElement('canvas');
  const [pw, ph] = paper === 'A1' ? [841, 594] : [420, 297];
  c.width = pw * 4;
  c.height = ph * 4;
  const g = c.getContext('2d')!;
  g.fillStyle = '#fff';
  g.fillRect(0, 0, c.width, c.height);
  g.drawImage(img, 0, 0, c.width, c.height);
  URL.revokeObjectURL(url);
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: paper === 'A1' ? 'a1' : 'a3' });
  pdf.addImage(c.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, pw, ph);
  pdf.save(`${name}.pdf`);
}
