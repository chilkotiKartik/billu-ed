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
  const px = paper === 'A1' ? 5 : 8; // pixels per mm: sharp when printed or zoomed (A1 ≈ 4200 × 2970, under phone canvas limits)
  c.width = pw * px;
  c.height = ph * px;
  const g = c.getContext('2d')!;
  g.fillStyle = '#fff';
  g.fillRect(0, 0, c.width, c.height);
  g.drawImage(img, 0, 0, c.width, c.height);
  URL.revokeObjectURL(url);
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: paper === 'A1' ? 'a1' : 'a3' });
  // PNG keeps thin lines and small letters crisp (JPEG smears them)
  pdf.addImage(c.toDataURL('image/png'), 'PNG', 0, 0, pw, ph, undefined, 'FAST');
  pdf.save(`${name}.pdf`);
}
