/** Saves text as a file in the browser (no server involved). */
export function downloadFile(name: string, mime: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: `${mime};charset=utf-8` }));
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Opens the print dialog for an HTML document (choose "Save as PDF" there). Nothing leaves the browser. */
export function printHtml(html: string) {
  const f = document.createElement('iframe');
  f.setAttribute('aria-hidden', 'true');
  f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0';
  f.onload = () => {
    const w = f.contentWindow;
    if (!w) return;
    const go = () => { w.focus(); w.print(); };
    const fonts = f.contentDocument?.fonts;
    if (fonts) fonts.ready.then(go, go); else go();
    setTimeout(() => f.remove(), 120000);
  };
  f.srcdoc = html;
  document.body.appendChild(f);
}
