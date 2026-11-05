# Charta — Mapa del código

## Estructura del repositorio
```
CONTEXT.md            visión, decisiones, diseño, forma de trabajar
CODEMAP.md            este mapa
ESTADO.md             hoja de ruta con pasos marcables
ESQUEMA.md            esquema JSON v1 de ficha, actividad y ejercicio
INICIO_CHAT.md        mensaje para empezar un chat nuevo
LENGUA_1.md           guion de tipología de Lengua de 1.º (bloques, modelos, pauta Lamela, lotes)
motor/generador_fichas.py   motor de REFERENCIA (Python + ReportLab), ~2.700 líneas: diseño aprobado y reglas
motor/modelos_app.py  modelos SOLO de la app (bloque 8 problemas…): MODELOS_APP con titulo y color; tools/catalogo.py los añade tras los del motor
motor/metadatos.py    META: dificultad, minutos y etiquetas de cada modelo (también los de la app)
motor/modelos.py      catálogo MODELOS para la app (solo datos): menu(), por_defecto(), validar(), a_json()
tests/test_motor.py   regresión: genera todo y comprueba la aritmética
referencia/ficha_muestra.pdf  ficha de muestra de Iván (marco a imitar)
tests/test_nucleo.js  pruebas del núcleo JS (Node): `node tests/test_nucleo.js`
index.html            redirige a dist/ (GitHub Pages sirve la raíz)
package.json          solo "type": "module" para Node (sin dependencias)
src/index.html, estilos.css, app.js   app (verde oscuro): editores de actividad (modelo elegido + opciones), alumnos, impresión
src/ui/navegacion.js  cursos(), materias(c), bloques(c, m), modelos(c, m, b, tamano) (solo tipos registrados; `cabe`), miniatura(id) — sin DOM
src/ui/alumnos.js     leerAlumnos(texto) (pegar listas, Séneca), numVariantes(opción, páginas), MAX_ALUMNOS — sin DOM
src/ui/guardadas.js   crearGuardadas(almacén): recientes(), favoritos(), anotarReciente, alternarFavorito, esFavorito, quitar — sin nombres
src/ui/selector.js    abrirSelector({ actual, tamano, alElegir, alCerrar }): pantalla curso → materia → bloque → modelo
tests/test_ui.js      navegación: todos los tipos alcanzables, miniaturas limpias
src/nucleo/azar.js    mulberry32, mezclar(...ns) (semillas derivadas), crearAzar(s): entero, elegir, barajar, muestra, hijo
src/nucleo/tipos.js   registro: registrar(t), tipo(id), hayTipo, listaTipos
src/nucleo/ficha.js   modelo, porDefecto, validar, capitalizar, tituloModelo, tituloPagina, coloresPagina, generar(opciones, semilla)
src/nucleo/lector.js  erroresFicha(f), paginasVariante(f, v), letraVariante — sin dependencias (Tabula/Fori)
src/nucleo/catalogo.js  GENERADO por tools/catalogo.py (MODELOS + titulo + color); no editar
src/rep/index.js      16 representaciones en SVG: rep(nombre, n, {i, vacio, rango}) y plantilla() → {w, h, svg} (caja en puntos PDF, y hacia abajo, centrada como el motor); svgCompleto(), nombreNumero(). Anchuras de Andika incrustadas
tests/test_rep.js     pruebas de las representaciones · tools/comparar_rep.py: hoja motor vs JS en PNG
src/tipos/_problemas.js  problemas del bloque 8: NOMBRES, OBJETOS, SITUACIONES, generarProblemas(), dibujarProblemas() (tipos problemas.suma/resta/mixtos)
src/tipos/_trucos.js  fábrica trucoTipo({id, enunciado, filas, pool}) de los trucos de Calculi (bloque 12): filas con huecos, igualdades ciertas, sin repetir; tipos trucos.<clave>.js
src/render/fuentes.js  registro de letras: fuentePorId, fuenteDe(ficha), registrarFuenteUsuario, nombreFuente; anchuras en anchos_fredoka.js (GENERADO por tools/anchos_fuente.py)
src/ui/fuentes.js     letras subidas: validarArchivo, cssFuente, crearAlmacenFuentes (IndexedDB charta-fuentes), instalarCss
src/tipos/index.js    importa familia.<f>.js (cada uno, los tipos de su familia); src/tipos/<id>.js uno por tipo (p. ej. sumar.h20.js); _rep.js = fábrica común de rep.*
src/render/papel.js   lienzo Papel en coordenadas del MOTOR (pt, y hacia arriba): primitivas + port de caja, cuadrito, _marco, _celdas, _linea, T/B, _pintar, _n. TOP = H−M−76 (TOP_REP = H−M−90). Modo "solucion": huecos con la respuesta en rojo
src/render/hoja.js    hoja(pagina, {titulo, nombre, bn, modo}) → SVG A4 (encabezado + paneles, como el motor); hojas(ficha, {nombres, bn, modo}) → una por alumno
src/fuentes/          Andika recortada (WOFF); build.py la incrusta en base64
src/render/actividad.js  render(actividad, modo) → zona {x, y, w, h, svg} que encaja el panel (como panel() del motor); svgZona()
tests/test_tipos.js   pruebas comunes de todos los tipos (todas las opciones, completa/media, SVG limpio, un grupo "ej" por ejercicio, una respuesta por hueco) · `--full`
tests/comun.js        combinaciones(id), contador() (compartido por las pruebas)
tests/invariantes.js  INVARIANTES[id] (reúne tests/inv/<f>.js; ayudantes en tests/inv/_ayuda.js)(actividad, tamaño): reglas aritméticas de cada tipo (obligatoria al añadir un tipo) + comunes()
tests/test_invariantes.js  todas las combinaciones × semillas × variantes · `--full`
tests/test_doradas.js + doradas.json  fichas doradas (JSON + huella SVG); `--actualizar` solo si el cambio es intencionado (y subir `version` del tipo)
tools/comparar_tipo.py  motor vs JS de un tipo en A4 → /tmp/cmp_<id>_<tamaño>.png (`--media`, `--solucion`)
tools/ENCARGO_PORTAR.md  instrucciones para que un agente porte modelos del motor (fase 3; reutilizable para Lengua u otros cursos)
tools/build.py        src/ → dist/index.html (un solo archivo) + sw.js y manifest.webmanifest en la raíz; --js = solo el paquete
src/pwa/              sw.js (plantilla, __VERSION__), manifest.webmanifest, registro.js (registrarSW(avisar)), logo.svg (fuente del logo y los iconos) · paso 4.5
src/ui/tema.js        iniciarTema(botón): sistema/claro/oscuro en charta:tema → html[data-tema="oscuro"]; variables en estilos.css (como Tabula)
src/nube/config.js    firebaseConfig (proyecto compartido "mis-apps-educativas"), FIREBASE_SDK, RUTA_FICHAS · paso 5.1
src/nube/documento.js aDocumento(ficha, comp, uid), deDocumento(id, datos), mismaComposicion — ficha ⇄ documento, sin SDK
src/nube/nube.js      crearNube({cargar, almacen}): iniciar, entrar (Google), salir, listar, guardar, abrir, borrar; SDK del CDN solo si se usa (charta:nube = hubo sesión)
tests/test_nube.js    con un Firebase falso que aplica las reglas
src/ui/tabula.js      paso 5.2: leerTabula() (IndexedDB «tabula-data», solo lectura), gruposDeTabula(), leerEntrada(?desde, grupo, sesion, tarea, comp), urlVolver() → /tabula/?charta=…; contrato igual que tabula/js/charta.js
firestore.rules       reglas COMPLETAS del proyecto (copia de tabula/firestore.rules: mantener iguales)
sw.js, manifest.webmanifest   GENERADOS por build.py en la raíz (scope /Charta/); no editar
src/fori/diapositivas.js  paso 5.3: marcarPasos(svg, ej), diapositivas(ficha, {cajas, fuentes}), paqueteFori(), cssPasos(k, n); URL_FORI, CLAVE_FORI (contrato con fori/src/js/05f-charta.js)
tests/test_fori.js    pasos de la solución y diapositivas de todos los tipos · `--full`
tools/iconos.py       iconos/ desde src/pwa/logo.svg con rsvg-convert (normal, maskable al 80 %, favicon, apple-touch)
dist/index.html       la app construida (se sube al repositorio: la sirve Pages)
salida/               PDF generados por la línea de órdenes (se crea sola)
```

## Núcleo JS (fase 2)
- `generar(opciones, semilla)`: 1 actividad → `completa`, 2 → `media`. Semilla de la variante v: `v=0 ? semilla : mezclar(semilla, v)`; azar de la actividad i: `mezclar(semillaVariante, i+1)`. No pone `id`, `creada` ni `autor` (se añaden al guardar).
- Tipo nuevo: `src/tipos/<id>.js` con `registrar({id, version, generar(params, azar, {tamano}), dibujar(papel, actividad)})` y la forma de `datos`/`solucion` documentada arriba; añadirlo a `src/tipos/familia.<f>.js`; su regla, en `tests/inv/<f>.js`. `dibujar` es un port casi literal de la función del motor (mismas coordenadas); cada ejercicio en `p.ejercicio(id, …)` y cada hueco con su solución (`caja(…, null, fs, sol)`, `B(w, h, sol)`), en el orden de `solucion.huecos`. Enunciado de dos líneas: separadas por "\n".
- Comprobar: añadir su regla en `tests/invariantes.js`, `npm test` (todas las pruebas JS) y `python3 tools/comparar_tipo.py <id> [--media]` (mirar el PNG). Si se añade el tipo, `node tests/test_doradas.js --actualizar` (crea su dorada; las demás no deben cambiar).
- `build.py` solo admite las formas de import/export de su cabecera y **una declaración por `export const`** (falla con mensaje claro si hay otra). Tras cambiar `src/`: `python3 tools/build.py`.

## Motor: `motor/generador_fichas.py` (números de línea aproximados)
| Líneas | Sección |
|---|---|
| 1–48 | Importaciones, `_fuente()` (busca Andika; si no, Poppins), registro de fuentes `PB` (negrita), `PM` (media), `PR` (normal), `stroke()` |
| 49–475 | Dibujos de las 16 representaciones del número: dedos, dado, dominó, marco de diez, palotes, objetos (`shape()` l.185: `c` círculo, `s` estrella, `q` cuadrado, `t` triángulo), regletas, descomposición, letras, recta, bloques, cuadrícula, monedas, ábaco, D/U, atados |
| 476 | `CAT`: catálogo de representaciones (nombre, función, rango mínimo) |
| 503 | `OUT`: carpeta de salida por defecto (`salida/`); `M = 28` (margen) |
| 510 | `pick()`: elige números para lectura y dibujo |
| 526–625 | **Marco de página**: `PALETA`, `AZUL`, `COLOR`, `FAMILIA`, `_titulo()`, `_tarjetas()` · `_ACT`/`_lienzo()`/`_fin()` l.552 (modo actividad: usar el canvas dado y devolver la clave) · `color_familia()` · **`encabezado(titulo, nombre)`** l.569 (Nombre/Fecha/título) · **`panel(rect, num, lineas, color)`** l.586 (panel, número, enunciado y escalado; con `PARTE`=0.5 encaja solo la mitad superior) · `PARTE`, **`_n(filas)`** l.608 (filas que se dibujan: todas o la mitad) · `cabecera()` l.612 |
| 628 | `ficha_rep()` (familia `rep`) |
| 683 | `ficha_combinada()` (¿Qué número es?) |
| 730 | `ficha_suma()` (Suma y dibuja) |
| 766 | Bloque 2 **conteo** · `caja()` l.767 · `CONTEO` l.930 · `ficha_conteo()` l.946 |
| 958 | Bloque 3 **orden** · `_celdas()` l.977 (rejilla; respeta `_n`) · `ORDEN` l.1138 · `ficha_orden()` l.1151 |
| 1163 | Bloque 4 **valor** · `_linea()` l.1176 · `VALOR` l.1292 · `ficha_valor()` l.1301 |
| 1315 | Bloque 5 **sumar** · `_pintar()` l.1344 (rejilla de operaciones; respeta `_n`) · `SUMAR` l.1538 · `ficha_sumar()` l.1555 |
| 1568 | Bloque 6 **restar** · `RESTAR` l.1739 · `ficha_restar()` l.1754 |
| 1767 | Bloque 7 **juegos** · `JUEGOS` l.1942 · `ficha_juegos()` l.1951 |
| 1965 | Bloque 9 **geometría** · `GEOM` l.2164 · `ficha_geometria()` l.2175 |
| 2187 | Bloque 10 **medida** · `MEDIDA` l.2361 · `ficha_medida()` l.2372 |
| 2387 | Bloque 11 **estadística** · `ESTAD` l.2494 · `ficha_estadistica()` l.2501 |
| 2515 | **Actividades**: `_llamar()`, `titulo_modelo()`, **`actividad(cv, rect, params, rnd, num, color, tamano)`** l.2539 → clave |
| 2554 | **Compositor**: `color_modelo()`, `titulo_pagina()`, **`pagina(cv, acts, rnd, titulo, nombre, colores)`** l.2567 → claves (1 actividad: completa; 2: media página cada una; colores distintos si coinciden) |
| 2596 | **API única**: **`generar(spec)`** → `(pdf_bytes, clave)`; una página por alumno, `iguales`/`distintas`, `copias`, `semilla`, `titulo`, `color` |
| 2625 | Línea de órdenes (CLI) y ayuda |

## Patrón de cada familia (importante para la refactorización)
- **Actividad** (paso 1.2): `actividad()` pone el motor en modo actividad (`_ACT`); la `ficha_<familia>()` de siempre dibuja en el canvas dado, `cabecera()` dibuja solo el panel en `rect` (con recorte) y `_fin()` devuelve la clave sin guardar. La ficha de la línea de órdenes sale idéntica.
- **Media página**: mismo diseño y casi mismo tamaño, con la mitad de filas (`_n()`), como la ficha de muestra. Un modelo nuevo debe usar `_celdas()`/`_pintar()` o `_n(filas)` en sus bucles; la prueba avisa si algo se sale.
- Diccionario `FAMILIA = {clave: (TÍTULO, enunciado | lambda(modo), función, [rango_mín])}`.
- `ficha_<familia>(clave, R, seed, …, outdir)`: crea el canvas global `c`, llama a `cabecera()`, después a `fn(top, R, rnd, …)`, que dibuja en **coordenadas de página completa** (de `M` a `W-M` y de `top` a `M`), y **devuelve la clave** (se imprime por consola).
- Al escalar, `cabecera()` encaja ese área de página completa dentro del panel → base para convertir cada modelo en **actividad** que se dibuja en un rectángulo cualquiera (media página o página completa) con `c.saveState()` + `c.transform()`.

## Línea de órdenes
```
python3 motor/generador_fichas.py <familia> <clave> <máx> [opciones]
familias: rep, combinada, suma, conteo, orden, valor, sumar, restar, juegos, geometria (sin rango), medida, estadistica
comunes: --seed N · --color amarillo|rosa|azul|verde
```
Nueva (sobre `generar()`):
```
python3 motor/generador_fichas.py ficha sumar.h20:nivel=con restar.recta:rango=20 --alumnos "Ana,Luis" --distintas [--copias N] [--seed N] [--titulo ...] [--color rosa|rosa,azul] [--salida f.pdf]
python3 motor/generador_fichas.py modelos     (lista de modelos, rangos, tamaños y opciones)
```
Ejecutar sin argumentos para ver todas las claves y opciones.

## Catálogo actual (1.º, Matemáticas)
- **rep** (16): dedos, dado, domino, marco, palotes, objetos, regletas, descomp, letras, recta, bloques, cuadricula, monedas, abaco, du, atados · `--lectura`
- **combinada**, **suma**
- **conteo** (10): cuenta, anterior, falta, serie1, serie2, serie5, serie10, series, tabla, camino · `--huecos`, `--modo ambos|anterior|posterior`
- **orden** (8): mayor, signos, grupo, ordena1, ordena2, entre, ordinales, cantidad · `--n`, `--modo`, `--cerca`
- **valor** (6): agrupa, canje, descdu, dunum, pares, cifra · `--nivel completas|mezcla`, `--modo suma|clasifica`
- **sumar** (14): dibujos, recta, h10, h20, h100, vertical, dobles, comp10, comp20, hueco, decenas, encadenadas, piramide, tabla · `--nivel sin|con|mezcla`, `--modo dibujo|bloques`, `--huecos`
- **restar** (12): quita, recta, r10, r20, r100, vertical, mitades, faltan, hueco, decenas, encadenadas, familia · `--nivel`, `--modo dibujo|bloques`
- **juegos** (6): cuadrado, laberinto, une, cadena, oculto, colorea · `--nivel`, `--modo suma|resta|mezcla`, `--n`
- **geometria** (8): figuras, cuenta, cuerpos, rueda, lineas, posiciones, simetria, copia · `--modo tipo|cierre`, `--n`
- **medida** (8): dinero, precios, reloj, reloj2, calendario, tiempo, longitud, capacidad · `--modo centimos|cambio|punto|media|dias|meses|compara`, `--n` (mes del calendario)
- **estadistica** (4): pictograma, recuento, barras, patrones · `--modo dos|lee|hueco`
- Pendiente: **bloque 8, problemas** (aparcado por Iván).
