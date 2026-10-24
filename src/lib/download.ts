/** Saves text as a file in the browser (no server involved). */
export function downloadFile(name: string, mime: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: `${mime};charset=utf-8` }));
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Opens the print dialog for an HTML document (choose "Save as PDF" there). Nothing leaves the browser.
 * The report opens in its own tab: phones print that reliably, while a hidden zero-size frame often prints nothing.
 * If the browser blocks the new tab, it falls back to the hidden frame. The report page also carries a screen-only hint
 * that the browser's own Print or Share menu can save it as a PDF.
 */
export function printHtml(html: string) {
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
  const w = window.open(url, '_blank');
  if (!w) { URL.revokeObjectURL(url); printInFrame(html); return; }
  let tries = 0;
  const wait = setInterval(() => {
    let ready = false;
    try { ready = w.location.href === url && w.document.readyState === 'complete'; } catch { /* not ours yet */ }
    if (w.closed || ++tries > 100) { clearInterval(wait); return; }
    if (!ready) return;
    clearInterval(wait);
    const go = () => { try { w.focus(); w.print(); } catch { /* the person can still use the browser's own Print or Share menu */ } };
    const fonts = w.document.fonts;
    if (fonts) fonts.ready.then(go, go); else go();
  }, 100);
  setTimeout(() => URL.revokeObjectURL(url), 10 * 60 * 1000);
}

function printInFrame(html: string) {
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
