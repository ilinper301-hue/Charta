# Charta — Mapa del código

## Estructura del repositorio
```
CONTEXT.md            visión, decisiones, diseño, forma de trabajar
CODEMAP.md            este mapa
ESTADO.md             hoja de ruta con pasos marcables
INICIO_CHAT.md        mensaje para empezar un chat nuevo
motor/generador_fichas.py   motor de fichas (Python + ReportLab), ~2.500 líneas
motor/modelos.py      catálogo MODELOS para la app (solo datos): menu(), por_defecto(), validar(), a_json()
tests/test_motor.py   regresión: genera todo y comprueba la aritmética
referencia/ficha_muestra.pdf  ficha de muestra de Iván (marco a imitar)
app/                  (vacía) aquí irá la PWA
salida/               PDF generados por la línea de órdenes (se crea sola)
```

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
| 2554 | Línea de órdenes (CLI) y ayuda |

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
