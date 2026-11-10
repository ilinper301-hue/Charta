# Charta · Matemáticas de 2.º — Guion de tipología de fichas

> Guion **aprobado** por Iván (8-11-2026). Hechos: lotes 0, 1, 2, 2b y 3a (ver ESTADO.md).
> Decisiones de Iván (8-11-2026): **sí** multiplicar (bloque 13); reloj **con y cuarto y menos cuarto**; rangos **de 100 en 100** hasta el 999; **redondear a la decena** en 2.º.
> Base: los 106 tipos de Matemáticas de 1.º. Currículo andaluz (Orden de 30-5-2023, primer ciclo): números hasta el **999**, suma y resta, ordinales, euros (monedas de 1 y 2 € y billetes de 5 a 100 €), metro, kilo y litro, reloj, figuras planas, simetría, croquis, patrones, signos =, ≠, <, >, pictogramas y barras. La multiplicación no está en el primer ciclo andaluz, pero Iván la incluye (bloque 13).

## Leyenda
- **C / M**: admite página completa / media página.
- ♻ **Reutiliza** un tipo de 1.º tal cual: solo cambian los rangos y los valores por defecto.
- 🔧 **Amplía** un tipo de 1.º (centenas, tres cifras, más opciones). Las fichas de 1.º no cambian.
- ✨ **Nuevo**.
- 📦 Necesita un dibujo que Charta no hace: va el recuadro «Pega aquí el dibujo» (regla de la Fase 6).

## Opciones comunes de 2.º
- **Números: hasta el N**: 100, 200, 300… 900 y 999 (de 100 en 100, como en 1.º de 10 en 10). Por defecto, 100 en el primer bloque de cada tema; 999 en los de tres cifras.
- **Llevadas**: sin · con · mezcladas (en tres cifras, además: «llevada en las unidades», «en las decenas», «en las dos»).
- Comunes de Charta: tamaño (C/M), color, letra grande, lectura fácil, variantes A/B/C.

---

## Bloque 1 · Los números hasta el 999
- 🔧 `rep.bloques` · **Bloques de base diez** (C/M): añadir la **placa de cien**. Leer y dibujar números de tres cifras.
- 🔧 `rep.abaco` · **El ábaco** (C/M): tres varillas (C, D, U), máx. 9 cuentas por varilla.
- 🔧 `rep.du` → **Centenas, decenas y unidades** (C/M): tabla C | D | U.
- 🔧 `rep.letras` · **El número en letras** (C/M): hasta novecientos noventa y nueve (quinientos, setecientos, novecientos; tildes y «y» correctas).
- 🔧 `rep.recta` · **La recta numérica** (C/M): tramos de 0–1000 marcados de 100 en 100 y tramos de 10 en 10 (p. ej. 340–350).
- 🔧 `rep.descomp` · **Descomponer** (C/M): 345 = 300 + 40 + 5 y 3 C + 4 D + 5 U, en los dos sentidos.
- 🔧 `combinada` · **¿Qué número es?** (C/M): con bloques, ábaco, C/D/U y letras.
- ♻ Resto de `rep.*` (dedos, dado, marco…): siguen en 1.º; en 2.º solo entran como **repaso** (hasta 100).

## Bloque 2 · Contar y series
- ♻ `conteo.anterior`, `conteo.falta`, `conteo.serie2`, `serie5`, `serie10`, `series`, `conteo.camino` hasta 999.
- 🔧 Series: opción **hacia atrás** (descendentes) y salto de **100** (`conteo.serie100` ✨, o salto como opción de `series`).
- 🔧 `conteo.tabla` · **La tabla de números** (C): tabla de 100 que empieza donde se diga (301–400, 701–800…).

## Bloque 3 · Orden y comparación
- ♻ `orden.mayor`, `orden.ordena1`, `orden.ordena2`, `orden.entre`, `orden.grupo` hasta 999.
- 🔧 `orden.signos` · **Compara** (C/M): tres cifras y opción **=, ≠** además de <, >.
- 🔧 `orden.ordinales` · **Los ordinales** (C/M): hasta el **29.º** (vigésimo noveno), como pide el currículo andaluz.
- ✨ `orden.redondea` · **Redondea a la decena** (C/M): en la recta, rodear la decena más cercana y escribirla (34 → 30; las de 5, hacia arriba).

## Bloque 4 · Valor posicional
- 🔧 `valor.descdu`, `valor.dunum`, `valor.cifra`: con **centenas** («¿Cuánto vale el 4 en 345?» → 40).
- 🔧 `valor.canje` · **Canjea** (C/M): 10 decenas = 1 centena; 1 centena = 10 decenas = 100 unidades.
- 🔧 `valor.agrupa` (C/M): agrupar de 10 en 10 y de 100 en 100.
- ♻ `valor.pares` · **Pares e impares** hasta 999.

## Bloque 5 · Sumar
- ♻ `sumar.h100`, `sumar.hueco`, `sumar.piramide`, `sumar.tabla` con números mayores.
- 🔧 `sumar.vertical` · **Sumas en vertical** (C/M): **tres cifras**, llevadas en U, en D o en las dos; opción **tres sumandos**; casillas C/D/U y la casilla pequeña de la llevada.
- 🔧 `sumar.decenas` · **Sumas de decenas y centenas** (C/M): 40 + 30, 300 + 400, 250 + 30.
- 🔧 `sumar.encadenadas` (C/M): tres o cuatro sumandos.
- 🔧 `sumar.recta` (C/M): saltos de 10 y de 100.
- 🔧 `sumar.dobles` · **Dobles y mitades** (C/M): hasta 100 (dobles de decenas: 30 + 30).

## Bloque 6 · Restar
- ♻ `restar.r100`, `restar.hueco`, `restar.familia` (la familia de la suma y la resta) con números mayores.
- 🔧 `restar.vertical` · **Restas en vertical** (C/M): **tres cifras**, con llevadas; opción **prueba de la resta** (debajo, la suma que la comprueba).
- 🔧 `restar.decenas` (C/M): decenas y centenas (700 − 300, 450 − 20).
- 🔧 `restar.recta`, `restar.encadenadas` (C/M): saltos de 10 y de 100.

## Bloque 7 · Juegos numéricos
- ♻ Los 6 de 1.º (cuadrado, laberinto, une, cadena, oculto, colorea) con sumas y restas hasta 999 (por defecto hasta 100).

## Bloque 8 · Problemas
- ♻ `problemas.suma`, `.resta`, `.mixtos`, `.barras` hasta 999 (por defecto hasta 100).
- ✨ `problemas.dospasos` · **Problemas de dos operaciones** (C/M): «Tenía 45, me dan 20 y gasto 30». Dos líneas de operación y la respuesta. Con barra opcional (Barri).
- ✨ Situaciones nuevas en los de una operación: **igualar** («¿cuántos le faltan para tener los mismos?») y cambio con incógnita al principio.
- ✨ `problemas.dinero` · **Problemas de compras** (C/M): precios en euros, «¿cuánto pago?», «¿cuánto me devuelven?».

## Bloque 9 · Geometría
- ♻ `geometria.figuras`, `cuerpos`, `lineas`, `posiciones`, `simetria`, `copia` (copia en cuadrícula más grande).
- ✨ `geometria.lados` · **Lados y vértices** (C/M): contar lados y vértices de polígonos dibujados (triángulo, cuadrado, rectángulo, pentágono, hexágono).
- ✨ `geometria.itinerario` · **Sigue el camino** (C): cuadrícula con salida; instrucciones con flechas («→ 3, ↑ 2»): dibujar el camino o escribir dónde se llega. Y al revés: escribir las flechas de un camino dibujado.

## Bloque 10 · Medida
- 🔧 `medida.dinero` (hecho, 3a): contar dinero hasta 200–500 € con billetes de 50 y 100 €.
- ✨ `medida.euros` · **Monedas y billetes** (C/M): monedas de 1 y 2 € y billetes de 5, 10, 20, 50 y 100 € dibujados (sin imitar los reales: rectángulos con el valor y un color). Contar cuánto dinero hay; pagar una cantidad con el menor número de billetes y monedas.
- 🔧 `medida.precios` (C/M): precios en euros enteros hasta 100 €.
- 🔧 `medida.reloj`, `medida.reloj2` · **El reloj** (C/M): opción **y cuarto / menos cuarto** (decidido por Iván). Analógico ↔ digital.
- 🔧 `medida.tiempo` · **Equivalencias de tiempo** (C/M): 1 hora = 60 minutos, 1 día = 24 horas, 1 semana = 7 días, 1 año = 12 meses; antes/después de una hora.
- ♻ `medida.calendario` (C).
- 🔧 `medida.longitud` · **Mide con la regla** (C/M): segmentos de medida exacta en **centímetros reales** (como la pauta de Lengua: `Papel.mm()`); y **m o cm**: ¿con qué medirías…?
- ✨ `medida.masa` · **¿Cuánto pesa?** (C/M): balanzas con pesas de 1 kg y ½ kg; pesa más / menos / igual. Objetos 📦 o solo rótulos («una sandía»).
- ♻ `medida.capacidad` (C/M): litro y medio litro.

## Bloque 11 · Estadística y patrones
- ♻ `estadistica.pictograma`, `recuento`, `patrones`.
- 🔧 `estadistica.barras` (C): escala de 2 en 2 o de 5 en 5; preguntas de comparar («¿cuántos más…?»).

## Bloque 12 · Trucos de cálculo mental
- ♻ Los 8 de 1.º que sirvan con números mayores (`masmenos10`, `sumar9`, `orden`…).
- ✨ Trucos de 2.º (fábrica `_trucos.js`; **comprobar con la lista de 2.º de Calculi**): ±100, completar a la centena, sumar y restar 9, 11, 19 y 21 (compensar), dobles de decenas, sumar descomponiendo en decenas y unidades.

## Bloque 13 · Multiplicar (decidido por Iván: sí)
- ✨ `multiplicar.grupos` · **Grupos iguales** (C/M): 3 grupos de 4 puntos → 4 + 4 + 4 = 12 → 3 × 4 = 12.
- ✨ `multiplicar.filas` · **Filas y columnas** (C/M): matrices de puntos.
- ✨ `multiplicar.tablas` · **Las tablas** (C/M): del 2, 3, 4, 5 y 10 (elegir cuáles).
- ✨ `multiplicar.problemas` (C/M) y ✨ `multiplicar.reparto` · **Reparte** (C/M): repartir en partes iguales (mitad, tercio), sin el signo ÷.

---

## Cómo encaja en la app (Lote 0)
- **Un modelo puede estar en varios cursos** con sus propios rangos: en el catálogo, `cursos: {1: {rangos, rango}, 2: {rangos, rango}}` (1.º hasta 100; 2.º de 100 a 999). Los ♻ no cambian de id: las fichas guardadas, Tabula y Fori siguen igual. `ficha.curso` = el curso elegido en el selector.
- Los 🔧 conservan su id y suben `tipoVersion` solo si cambia algo de 1.º (no debería: lo nuevo va en opciones nuevas o en rangos > 100).
- Los ✨ son tipos nuevos con su id, regla en `tests/inv/` y dorada.
- Declaración de los modelos de 2.º en `motor/modelos_2.py` (como `modelos_app.py`).

## Lotes propuestos
0. Catálogo por curso + número en letras hasta 999 + representaciones con centenas (placa, ábaco de 3 varillas, C/D/U, recta hasta 1000). (Opus)
1. ♻ Reutilizados con rangos hasta 999: comprobar que cada generador escala (invariantes con rangos grandes). (Sonnet)
2. 🔧 Valor posicional, sumas y restas de tres cifras. (Sonnet + revisión en PNG)
3. Medida: euros, reloj con cuartos, regla en cm, tiempo y masa. (Sonnet; la regla, Opus)
4. Geometría y estadística nuevas (lados y vértices, itinerarios, barras con escala). (Sonnet)
5. Problemas de dos pasos, de compras y trucos de 2.º. (Sonnet)
6. Multiplicar y repartir. (Sonnet)

## Decidido (8-11-2026)
- Multiplicar: sí (bloque 13). Reloj: con y cuarto y menos cuarto. Rangos: de 100 en 100 hasta el 999 (por defecto 100). Redondear a la decena: sí, en 2.º.
