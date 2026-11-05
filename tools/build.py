"""Charta · src/ → dist/index.html (un solo archivo, sin dependencias).
Uso:  python3 tools/build.py            (escribe dist/index.html, y sw.js y manifest.webmanifest en la raíz)
      python3 tools/build.py --js       (solo el JS empaquetado, a la salida estándar; lo usan las pruebas)

Empaquetador mínimo de módulos ES: cada módulo va en una función y sus import/export se
reescriben a __req(). Formas admitidas (las únicas que usa src/):
  import "./x.js";   import { a, b as c } from "./x.js";   import X from "./x.js";
  export function f / export const a / export let / export class / export default expr;
  export { a, b } from "./x.js";
"""
import os, re, sys, json, posixpath

RAIZ = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
SRC = os.path.join(RAIZ, "src")
DIST = os.path.join(RAIZ, "dist")

IMP_NADA = re.compile(r'^import\s+"([^"]+)";?\s*$', re.M)
IMP_NOMBRES = re.compile(r'^import\s*\{([^}]*)\}\s*from\s*"([^"]+)";?\s*$', re.M)
IMP_DEFECTO = re.compile(r'^import\s+([A-Za-z_$][\w$]*)\s+from\s*"([^"]+)";?\s*$', re.M)
REEXP = re.compile(r'^export\s*\{([^}]*)\}\s*from\s*"([^"]+)";?\s*$', re.M)
EXP_DECL = re.compile(r'^export\s+(async\s+function\*?|function\*?|const|let|class)\s+([A-Za-z_$][\w$]*)', re.M)
EXP_DEF = re.compile(r'^export\s+default\s+', re.M)

def _resolver(desde, ruta):
    if not ruta.startswith("."): sys.exit(f"build: import no relativo «{ruta}» en {desde}")
    return posixpath.normpath(posixpath.join(posixpath.dirname(desde), ruta))

def _alias(lista):
    out = []
    for parte in filter(None, (x.strip() for x in lista.split(","))):
        a, _, b = parte.partition(" as ")
        out.append((a.strip(), (b or a).strip()))
    return out

def empaquetar(entrada="app.js"):
    modulos, pendientes = {}, [entrada]
    while pendientes:
        r = pendientes.pop()
        if r in modulos: continue
        p = os.path.join(SRC, r)
        if not os.path.isfile(p): sys.exit(f"build: no existe src/{r}")
        cod = open(p, encoding="utf-8").read()
        exps, n = [], [0]
        def req(ruta):
            d = _resolver(r, ruta); pendientes.append(d); return f'__req({json.dumps(d)})'
        def reexp(m):
            n[0] += 1; v = f"__r{n[0]}"
            for a, b in _alias(m.group(1)): exps.append(f"get {b}() {{ return {v}.{a}; }}")
            return f"const {v} = {req(m.group(2))};"
        cod = REEXP.sub(reexp, cod)
        cod = IMP_NADA.sub(lambda m: req(m.group(1)) + ";", cod)
        cod = IMP_NOMBRES.sub(lambda m: "const { " + ", ".join(a if a == b else f"{a}: {b}" for a, b in _alias(m.group(1))) + f" }} = {req(m.group(2))};", cod)
        cod = IMP_DEFECTO.sub(lambda m: f"const {m.group(1)} = {req(m.group(2))}.default;", cod)
        def decl(m):
            exps.append(f"get {m.group(2)}() {{ return {m.group(2)}; }}"); return f"{m.group(1)} {m.group(2)}"
        multi = re.search(r'^export\s+(const|let)\s+[A-Za-z_$][\w$]*\s*=[^;\n]*,\s*[A-Za-z_$][\w$]*\s*=(?![^;\n]*=>)', cod, re.M)
        if multi: sys.exit(f"build: una declaración por export en src/{r}: {multi.group(0)[:60]}…")
        cod = EXP_DECL.sub(decl, cod)
        if EXP_DEF.search(cod):
            cod = EXP_DEF.sub("const __default = ", cod, count=1); exps.append("get default() { return __default; }")
        resto = re.search(r'^\s*(import|export)\b.*$', cod, re.M)
        if resto: sys.exit(f"build: forma no admitida en src/{r}: {resto.group(0).strip()}")
        modulos[r] = f"(__exp) => {{\n{cod}\nObject.defineProperties(__exp, Object.getOwnPropertyDescriptors({{ {', '.join(exps)} }}));\n}}"
    cuerpo = ",\n".join(f"{json.dumps(k)}: {v}" for k, v in sorted(modulos.items()))
    return ("(() => {\n\"use strict\";\nconst __mods = {\n" + cuerpo + "\n};\nconst __cache = {};\n"
            "function __req(r) { if (!__cache[r]) { __cache[r] = {}; __mods[r](__cache[r]); } return __cache[r]; }\n"
            f"__req({json.dumps(entrada)});\n}})();\n")

def construir():
    html = open(os.path.join(SRC, "index.html"), encoding="utf-8").read()
    css = open(os.path.join(SRC, "estilos.css"), encoding="utf-8").read()
    # Fuentes incrustadas (sin conexión): url("fuentes/X.woff") → data:font/woff;base64,…
    def fuente(m):
        import base64
        ruta = os.path.join(SRC, m.group(1))
        if not os.path.isfile(ruta): sys.exit(f"build: no existe src/{m.group(1)}")
        return 'url("data:font/woff;base64,' + base64.b64encode(open(ruta, "rb").read()).decode() + '")'
    css = re.sub(r'url\("(fuentes/[^"]+\.woff)"\)', fuente, css)
    js = empaquetar("app.js").replace("</script", "<\\/script")
    html = html.replace('<link rel="stylesheet" href="estilos.css">', "<style>\n" + css + "</style>")
    html = html.replace('<script type="module" src="app.js"></script>', "<script>\n" + js + "</script>")
    if 'src="app.js"' in html or 'href="estilos.css"' in html: sys.exit("build: no se encontró el <link> o el <script> en src/index.html")
    os.makedirs(DIST, exist_ok=True)
    with open(os.path.join(DIST, "index.html"), "w", encoding="utf-8") as f: f.write(html)
    print(f"dist/index.html: {len(html.encode()) // 1024} KB")
    pwa(html)

def pwa(html):
    """Paso 4.5 · manifiesto y service worker en la raíz (scope /Charta/). Versión = huella de la app e iconos."""
    import hashlib, shutil
    h = hashlib.sha256(html.encode())
    man = os.path.join(SRC, "pwa", "manifest.webmanifest"); h.update(open(man, "rb").read())
    ico = os.path.join(RAIZ, "iconos")
    if not os.path.isdir(ico): sys.exit("build: faltan los iconos (python3 tools/iconos.py)")
    for n in sorted(os.listdir(ico)): h.update(n.encode() + open(os.path.join(ico, n), "rb").read())
    sw = open(os.path.join(SRC, "pwa", "sw.js"), encoding="utf-8").read()
    if "__VERSION__" not in sw: sys.exit("build: src/pwa/sw.js sin __VERSION__")
    version = h.hexdigest()[:12]
    with open(os.path.join(RAIZ, "sw.js"), "w", encoding="utf-8") as f: f.write(sw.replace("__VERSION__", version))
    shutil.copyfile(man, os.path.join(RAIZ, "manifest.webmanifest"))
    print(f"sw.js + manifest.webmanifest: versión {version}")

if __name__ == "__main__":
    if "--js" in sys.argv: sys.stdout.write(empaquetar("app.js"))
    else: construir()
