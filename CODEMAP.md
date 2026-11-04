# Charta — Mapa del código

## Estructura del repositorio
```
CONTEXT.md            visión, decisiones, diseño, forma de trabajar
CODEMAP.md            este mapa
ESTADO.md             hoja de ruta con pasos marcables
INICIO_CHAT.md        mensaje para empezar un chat nuevo
motor/generador_fichas.py   motor de fichas (Python + ReportLab), ~2.500 líneas
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
| 525–574 | **Marco de página**: `PALETA`, `AZUL`, `COLOR` (forzar color), `FAMILIA` (color por familia según el nombre del archivo), `_titulo()`, `_tarjetas()` (convierte las casillas en tarjetas blancas), **`cabecera(titulo, lineas)`**: dibuja Nombre/Fecha, título, panel y enunciado, y **escala el contenido** para que quepa en el panel |
| 580 | `ficha_rep()` (familia `rep`) |
| 615 | `ficha_combinada()` (¿Qué número es?) |
| 666 | `ficha_suma()` (Suma y dibuja) |
| 720 | Bloque 2 **conteo** · `caja()` l.721 (hueco gris o número) · `CONTEO` l.884 · `ficha_conteo()` l.900 |
| 913 | Bloque 3 **orden** · `_celdas()` l.932 (rejilla de casillas) · `_marco()` l.936 (tarjeta con número y etiqueta) · `ORDEN` l.1093 · `ficha_orden()` l.1106 |
| 1119 | Bloque 4 **valor** · `_linea()` l.1132 (fila centrada de textos y huecos) · `VALOR` l.1248 · `ficha_valor()` l.1257 |
| 1272 | Bloque 5 **sumar** · `T()`/`B()` l.1273 (texto / hueco para `_linea`) · `_pares_suma()` · `_pintar()` l.1301 (rejilla de operaciones) · `SUMAR` l.1495 · `ficha_sumar()` l.1512 |
| 1526 | Bloque 6 **restar** · `MENOS` (signo −) · `_pares_resta()` · `RESTAR` l.1697 · `ficha_restar()` l.1712 |
| 1726 | Bloque 7 **juegos** · `JUEGOS` l.1901 · `ficha_juegos()` l.1910 |
| 1925 | Bloque 9 **geometría** · `_chips()` l.1973 (opciones para rodear) · `GEOM` l.2124 · `ficha_geometria()` l.2135 |
| 2148 | Bloque 10 **medida** · `MEDIDA` l.2321 · `ficha_medida()` l.2332 |
| 2348 | Bloque 11 **estadística** · `ESTAD` l.2455 · `ficha_estadistica()` l.2462 |
| 2477 | Línea de órdenes (CLI) y ayuda |

## Patrón de cada familia (importante para la refactorización)
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
