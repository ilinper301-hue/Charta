// Charta · miniatura de la hoja 1 para Documentos de Tabula (paso 5.4). SVG → imagen JPEG pequeña (data URL).
// La hoja se dibuja SIN nombre de alumno: la miniatura nunca lleva nombres.
export const CLAVE_A_TABULA = "charta:aTabula";   // localStorage (mismo origen): { v:1, titulo, miniatura?, comp? }
export const ANCHO_MINIATURA = 220;

/** SVG (texto) → data URL JPEG de `ancho` px de ancho; null si el navegador no puede (sin DOM, error…). */
export function miniaturaDeSvg(svg, ancho = ANCHO_MINIATURA, calidad = 0.72) {
  return new Promise((ok) => {
    try {
      if (typeof document === "undefined" || typeof Image === "undefined") return ok(null);
      const img = new Image();
      const fin = (v) => ok(v);
      img.onload = () => {
        try {
          const r = img.naturalHeight / img.naturalWidth || 1.414;
          const c = document.createElement("canvas");
          c.width = ancho; c.height = Math.round(ancho * r);
          const g = c.getContext("2d");
          g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height);
          g.drawImage(img, 0, 0, c.width, c.height);
          fin(c.toDataURL("image/jpeg", calidad));
        } catch { fin(null); }
      };
      img.onerror = () => fin(null);
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    } catch { ok(null); }
  });
}

/** Deja la miniatura (y, si el enlace sería largo, la composición: fase 1, R4) para que Tabula la recoja (mismo origen).
 *  Sin composición, si no cabe en el almacén, se omite sin error; con composición devuelve false si no se ha podido dejar. */
export function dejarParaTabula(titulo, miniatura, almacen = globalThis.localStorage, comp = null) {
  const t = String(titulo || "").slice(0, 200);
  try {
    if (!miniatura && !comp) { almacen?.removeItem(CLAVE_A_TABULA); return false; }
    almacen.setItem(CLAVE_A_TABULA, JSON.stringify({ v: 1, titulo: t, ...(miniatura && { miniatura }), ...(comp && { comp }) }));
    return true;
  } catch {
    if (!comp || !miniatura) return false;
    try { almacen.setItem(CLAVE_A_TABULA, JSON.stringify({ v: 1, titulo: t, comp })); return true; } catch { return false; }   // sin miniatura sí cabe
  }
}
