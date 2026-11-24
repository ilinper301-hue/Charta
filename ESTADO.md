# Charta — Estado y hoja de ruta

> Si Iván escribe "Continúa": seguir desde el primer paso sin marcar. Marcar `[x]` al terminar cada paso y anotar lo relevante en una línea.

## Análisis del sistema y de la interfaz (12-11-2026) → `PLAN-DISENO.md`
Sin cambios de código. El plan y el estado de sus fases están en **`PLAN-DISENO.md`** (se piden con «Ejecuta la fase N de `PLAN-DISENO.md`»; «Continúa» sigue con los pasos de contenidos de más abajo).
- **Fases 1–8 hechas (12 y 13-11-2026)**: borrador automático, Atrás de Android, nube con `tipos` ≤ 10, `app.js` partido en `src/ui/`, piezas comunes (hoja inferior, menú «⋯», `confirmar()`), diseño en móvil con vista previa de una hoja, tablet en dos columnas, inicio y selector con buscador, copia de seguridad, contrato de `globalThis.Charta`, paquete de Fori compacto, contraste AA en claro y oscuro. Detalle de cada fase en `HISTORIAL.md` y `PLAN-DISENO.md`. **El plan de diseño está completo.**

## Resumen de lo hecho
- Motor de referencia en Python (Fase 1) con compositor de página y API `generar(spec)`; `tests/test_motor.py` en verde.
- Núcleo JSON + render HTML/SVG (`src/`, `tools/build.py` → `dist/index.html`) con plantilla A4 de impresión (Fase 2).
- 173 modelos/tipos de actividad hoy; `npm test`: 198 fichas doradas e invariantes, 0 errores.
- App PWA en verde oscuro: curso → materia → bloque → modelo, compositor, alumnos, variantes A/B, soluciones, favoritos y recientes (Fase 4).
- Pantalla de inicio, modo oscuro y rediseño visual; service worker sin conexión, icono y modo tableta.
- Selector de letra (Andika por defecto, Fredoka para Lengua) y accesibilidad: dificultad, tiempo y etiquetas por modelo; pictogramas abandonados.
- Fichas de varias páginas (1–10) con numeración seguida y «Mis frases» para las primeras letras.
- Nube: Firebase compartido con Google, fichas en `/apps/charta/fichas/{id}` sin nombres de alumnos.
- Tabula: listas de alumnos, «Crear ficha» y envío de fichas a Documentos; Fori: `?ficha={id}`, proyección y solución paso a paso.
- Bloque 8 de problemas, `problemas.barras` (Barri) y 8 trucos de cálculo mental de Calculi en 1.º.
- Matemáticas 1.º completa; Matemáticas 2.º completa: lotes 0–6 (catálogo por curso, hasta 999, tres cifras, medida, geometría y estadística, problemas y trucos, multiplicar y repartir).
- Matemáticas 3.º: lote 0 (catálogo de 3.º, números hasta 9999, romanos hasta 100).
- Lengua 1.º: lotes 0–5 (sílaba, letra, fono, palabra, orto, frase, escritura con pauta Lamela y letras de trazo, lectura) más «Leo y dibujo» y «Miro y escribo».
- Letra Escolar_G (ligada) en las fichas de caligrafía de Lengua 1.º: opción `grafia`, contornos en `src/lengua/escolar.js` (generado por `tools/escolar.py` desde `referencia/fuentes/Escolar_G.ttf`), sin punto de inicio ni flechas (22-11-2026).
- Mapa de letras de Lengua 1.º con letras obligatorias (pulsación larga), válido en favoritas, nube, Tabula y Fori.
- `geometria.lineas` v2 con opciones en orden aleatorio.
Detalle de cada paso: `HISTORIAL.md`.

## Pendiente de Iván
- Probar en el Android (Espacio, paso 2): «Mayor o menor» en página completa y en media, con Impresión → «Ejercicios: Más grandes» y «Más ejercicios en la hoja» (21 y 9 parejas): ¿se ve bien el tamaño?, ¿os sirve para elegir según el alumnado? Tabula aún no conoce la opción (sus fichas salen con «Más grandes»).
- Comprobar que las fichas nuevas salen en blanco y negro (si alguna vez quieres color: en la ficha, Impresión → quitar «Blanco y negro», o en Ajustes para siempre).
- Probar en el Android (3.º, lote 2): «Millares, centenas…» de valor posicional (Descomposición, «El número» y «El valor de la cifra» con 4 cifras, «Los canjes»); «Sumas en vertical» y «Restas en vertical» con 4 columnas (¿se leen las casillas de llevada sobre UM, C y D?, ¿cabe la prueba de la resta?); «Sumas/Restas de centenas y millares»; recta de 100 en 100 y de 1000 en 1000; ✨ «Redondea» y ✨ «Estima» (¿vale redondear 4350 a 4400?, ¿se entiende el «≈»?).
- Probar en el Android (3.º, lote 1): Crear ficha → 3.º → Matemáticas: «Sumas hasta 9999», «Sumas con hueco», «Restas hasta 9999», «Restas con hueco» y «Familias de operaciones» con llevadas; mirar que las operaciones de cuatro cifras caben y se leen (la letra se reduce un poco en las más largas); revisar también «Problemas», «Series» y «Ordena» con millares.
- Probar en el Android (3.º, lote 0): Crear ficha → 3.º → Matemáticas → bloque 1: «Los bloques de base diez» (¿se reconoce el cubo de mil?), «El ábaco», «Millares, centenas, decenas y unidades», «El número en letras», «La recta numérica» (de 1, 10 o 100 en 100), «La descomposición», «¿Qué número es?» y «Los números romanos» (¿os sirve la tabla de símbolos arriba?).
- Probar en el Android la letra **Escolar (ligada)** (22-11-2026, opción «Grafía» en Repasa y escribe la letra, Copia palabras, Copia la frase, Escribe una frase y Miro y escribo): imprimir y mirar en papel si los rabos de una fila tocan las astas de la siguiente y si la «L» roza la etiqueta en «Escribe una frase»; en «Miro y escribo» las casillas salen pequeñas y las mayúsculas de Escolar son casi de imprenta. Comprobar que la licencia de Escolar_G (© Antonio Herrera Infantes) permite usarla en una app pública.
- Probar en el Android (lote 6, 2.º): bloque «Multiplicar y repartir»: ¿vale escribir «3 grupos de 4» como 3 × 4 (o lo preferís al revés)? En «Problemas de multiplicar» y «Reparte», ¿cabe el texto en la tarjeta? En «Grupos iguales» con 5 grupos, ¿se leen bien los 5 sumandos?
- Probar en el Android (lote 5, 2.º): «Problemas de dos operaciones» (¿cabe bien la fila de las dos operaciones?), «Problemas de compras» y en «Problemas de sumar/restar» la situación «Variadas, también las nuevas»; trucos de 2.º (los encadenados van en 2 columnas); «Problemas de dos operaciones» con barra dibujada y en blanco (3 por página, 1 en media): ¿se entiende la parte que se quita (borde discontinuo y «−n»)?
- Probar en el Android (lote 4, 2.º): «Lados y vértices»; «Sigue el camino» en sus 3 tareas (¿se entiende la S y la L? ¿cabe dibujar el camino con el dedo o el lápiz?); «El gráfico de barras» con escala de 2 en 2 o de 5 en 5 y «¿Cuántos más?».
- Probar en el Android (lote 3c, 2.º): «Mide longitudes» → «Mide con la regla»: imprimir **al 100 %** (sin «Ajustar a la página») y medir una tira con la regla; «¿Metros o centímetros?»: ¿sobra o falta algún objeto?
- Probar en el Android (lote 3b, 2.º): «Paga con billetes y monedas» (¿se entiende escribir 0 en los que no se usan?) y «¿Cuánto pesa?» (balanza nivelada con <, > o =); decir si algo cambia.
- Probar en el Android (fase 8): activar el tema oscuro en Ajustes y mirar que se lea bien (botón «Imprimir» pulsado, avisos de error, buscador del selector); decir si algo molesta.
- Probar en el Android (fase 7): Ajustes → «Guardar copia» (¿dónde queda el archivo?), borrar una favorita y «Cargar copia…»; con sesión iniciada, «Subir mis favoritas a la nube» (necesita las reglas de Firestore publicadas); proyectar en Fori una ficha larga (si sale el aviso de «demasiado grande», decir cuál era).
- Pirámide: máximo 3 huecos (con 4 no hay solución única); sumas y restas de decenas desde rango 100 (decidido 5-11-2026).
- Instalar la PWA en el Android (Chrome → Instalar app) y probar sin datos; probar el rediseño y la pantalla de inicio instalada y decir si quiere ajustes.
- Pegar `firestore.rules` en Firebase → Firestore → Reglas → Publicar, y probar Entrar + Guardar en el Android.
- Probar en el Android la integración con Tabula y Enviar a Tabula → Documentos.
- Probar Fori en la PDI y confirmar que abre en `/Fori/`.
- Revisar el léxico `datos/lexico_1.tsv`: `frec` casi toda a 1, pocas palabras con x y ninguna con w.
- Corregir en `datos/lexico_1.tsv` «dorme», «juga», «cerra» y «maulla»; faltan agua, mar, miel, bebé.
- Probar las fichas de Lengua (lote 2) en el Android.
- Imprimir `referencia/prueba_pauta.pdf` al 100 %: regla de 10 cm, cuerpo de 5 mm y 15 mm de base a base; decir si valen las formas de a, l, g, el paso y el gris del repaso.
- Revisar el alfabeto de trazo (`node tools/prueba_alfabeto.js`): sentido de la tilde, flechas junto a la tilde, punto de i/j, 1 sin base.
- Imprimir y probar en el Android la pauta con las fichas.
- Revisar secuencias (orden único), adivinanzas (una respuesta clara) y lista de fluidez («té», «azada») de lectura.
- Revisar `datos/frases_1.tsv` (etapa l con frases flojas) y después ejecutar `python3 tools/frases.py`.
- Orden de las letras (más adelante); pictogramas aparcados.
- Probar en el Android (fase 6): en Inicio, «⋯» de una ficha (Abrir, Duplicar, Quitar), accesos rápidos en fila, «⋯» → Ajustes a pantalla completa, y en Crear ficha el buscador de modelos y que se abra en el último curso y materia; decir si algo molesta. (Fase 5, en la tablet: dos columnas con la hoja entera.)
- Probar en el Android (fase 4): «Ver ficha», pasar hojas con el dedo, «Soluciones», «⋯» de la barra (favorita, nube, Tabula, Fori), editar el título en la cabecera y «⋯» de una actividad; decir si algo molesta.
- Probar en el Android (fase 3): «⋯» de la cabecera → Ajustes (entrar con Google, tema), Atrás cierra el menú y la hoja; en Diseño, «⋯» → Nueva ficha; borrar una ficha de la nube pregunta con la ventana nueva.
- Probar en el Android (fase 2, sin cambios visibles): iniciar sesión, «Guardar en la nube», «Enviar a Tabula», «Proyectar en Fori» y abrir una ficha de la nube; si algo falla, avisar.
- Probar en el Android (fase 1): componer una ficha con alumnos, cerrar la app desde multitarea y volver → «Seguir con la última» la recupera; Atrás con el selector abierto lo cierra.

## Espacio en la ficha (23-11-2026) · en curso
Iván: «las fichas dejan mucho blanco». Medido en las 175 fichas (por defecto, completa y media):
- **Marco**: márgenes de 12 mm + cabecera + franja del enunciado (57 pt) + separación de 12 pt → la actividad usa el 64 % de la hoja (completa) y el 51 % (dos medias); en media, escala 0,82 (limita el alto) y ≈ 15 mm vacíos a cada lado.
- **Tarjetas**: su alto sale de repartir la página en filas fijas (`p.celdas(TOP, cols, rows)`), no del contenido. «Mayor o menor»: tarjeta de 134 pt para 80 de contenido; en media, `_n()` redondea abajo (2 filas de 2,5) → hueco al final.
- **Sueltas**: `conteo.tabla` y `conteo.camino` con rango 10 (92 % y 71 % vacío), `lectura.texto` y `sumar.tabla` (⅓ vacío), `juegos.colorea`.
- **Letra**: 87 de 320 combinaciones con texto < 9 pt impreso (etiquetas «RODEA EL MAYOR» 7,8 pt; `problemas.dospasos` 3,3 pt).
Pasos (cambian las doradas: `--actualizar` y subir `version` de los tipos tocados; Iván revisa en papel):
- [x] Blanco y negro por defecto (`preferencias.bnDefecto`: activado salvo `charta:bnDefecto` = "0"; `tests/navegador.py` ajustado).
- [x] 1 · Marco compacto (23-11-2026; hecho: márgenes 22/18, cabecera y franja recortadas, `escalaPanel` 46, doradas actualizadas, `test:rapido` en verde; falta que Iván lo mire en papel y mida la pauta/regla al 100 %). (Sonnet, medio). Probado en una copia: `PANEL = { x: 22, y: 18, w: W − 44, h: H − 84 − 18, gap: 8 }`; en `escalaPanel` 57 → 46; en `hoja.js` Nombre/Fecha a H − 36 (líneas a H − 38, Fecha en x 380 hasta 573, nombre hasta 352), título a H − 68, franja `yT − 36` y `yB + 10`, círculo `(x + 22, yT − 19, r 10)`, enunciado en x + 40. Resultado: escala 0,82 → 0,90 en media (+21 % de superficie) y 0,917 → 0,965 en completa. Márgenes de 7,8 mm (`@page margin: 0`): comprobar que la pauta y la regla siguen midiendo bien (`tests/test_pauta.js`) y los renglones de `filasDe` caben.
- [x] 2 · Rejilla elástica + opción «Cantidad» (23-11-2026): `p.rejilla`, `filasRejilla`/`cuantosRejilla` en `papel.js`; `opciones.cantidad` ("grandes" | "mas") → `ctx.cantidad` en `generar()` del tipo y `ficha.cantidad`; selector «Ejercicios» en Impresión (solo si alguna actividad lo admite; se guarda en favoritas, borrador y nube). Piloto `orden.mayor` v3: 15/6 → 21/9 con «Más ejercicios»; con «Más grandes» las tarjetas llenan el panel y las cajas crecen. 203 doradas, `test:rapido` y `navegador.py` en verde. Detalle en HISTORIAL.md.
- [ ] 3 · Resto de tipos con `p.celdas`/`p.pintar` (≈ 85) por familias (Sonnet, medio; 4–5 lotes). **Lote 1 hecho (24-11-2026)**: `orden.signos`, `.entre`, `.redondea` (15/6 → 21/9), `.grupo` (10/4 → 12/6) y `.cantidad` (8/4 → 10/4); `orden.estima` omitido (no gana nada). **Lote 2 hecho (24-11-2026)**: `conteo.anterior` (15/6 → 21/9), `.cuenta` (12/6 → 15/9), `.falta` (16/8 → 20/10) y `.serie1/2/5/10/series` (8/4 → 10/5); `serie1` usa el dibujo de `series`; `conteo.tabla` y `.camino` quedan para el paso 5. **Trucos (24-11-2026, petición de Iván: «Sumar 9» con mucho hueco entre filas)**: fábrica `_trucos.js` con rejilla elástica y «Cantidad» (los 18 `trucos.*`; «Sumar 9» 18/9 → 33/15 con «Más ejercicios»; con «Más grandes» la operación crece hasta ×1,3 si cabe). **`palabra.cuenta` (24-11-2026, petición de Iván)**: 2 columnas, 20/10 palabras por defecto (antes 10/5), 24/12 con «Más ejercicios»; «Casillas y número» sigue en 1 columna. Candidatos a 2 columnas (una palabra por fila): `fono.inicial/posicion/silabas/larga/quita`, `letra.busca`, `silaba.separa/ordena/falta/junta`, `palabra.letras/plural/contrarios`; dudosos: `frase.*`, `palabra.intrusa`, `silaba.tabla`. **Lengua a 2 columnas (24-11-2026)**: `fono.inicial/posicion/silabas/larga/quita`, `letra.busca`, `silaba.separa/ordena/falta/junta`, `palabra.letras/plural/contrarios` (10/5 → 20/10 por defecto; 24/12 plural y contrarios; 16/8 quita; `conTope()` en `_lengua.js` si el banco no da para el doble); `unir()` de junta y contrarios sigue en 1 columna (8/4). Pendiente en papel: `fono.larga` (palabras largas a ≈ 11 pt), `fono.quita` (3 líneas), cajas de las apiladas (≈ 21 pt), `letra.busca` a ≈ 16–18 pt. **`sumar.*` y `restar.*` (24-11-2026)**: 16 de 18 con `_elastica.js` (`pintarEl`, `cuantos`; h10/h20/h100/hueco/r10/r20/r100/hueco/decenas 24/12 → 33/15; encadenadas 16/8 → 22/10; comp10, comp20, dobles, mitades, faltan, pirámide); con «Más grandes» el contenido por semilla no cambia y la operación crece hasta ×1,3. Sin cambio: `sumar.vertical`, `restar.vertical`, `sumar.dibujos`, `restar.quita`, `restar.familia` (no ganan nada). El tipo sin «Cantidad» de referencia en tests es ahora `sumar.vertical`. **`valor.*`, `juegos.*`, `geometria.*` (24-11-2026)**: convertidos `valor.descdu/dunum/pares/canje/cifra/agrupa` (1.º), `juegos.oculto/cuadrado`, `geometria.lados/rueda`; omitidos por estar ya en su mínimo legible: `geometria.cuerpos/figuras/lineas/posiciones/simetria/copia`. Quedan ≈ 14 tipos (medida, multiplicar, frase, lectura, orto, letra/palabra/silaba restantes, `unir()`…) ( sumar, restar, valor, geometría, medida, multiplicar, Lengua…). Receta (como `orden.mayor`): `cantidad: true`, subir `version`, en `generar` `cnt = cuantosRejilla(ctx, cols, MIN_ALTO, [completa, media])`, en `dibujar` `p.rejilla(TOP, cols, Math.ceil(n / cols))` y tamaños que crecen con `ch`/`cw`; un caso «más ejercicios» en `test_doradas.js`. `p.pintar` necesita su versión elástica.
- [ ] 4 · Letra mínima de 9 pt impresa (etiquetas de tarjeta, rótulos de las representaciones). (Sonnet, medio)
- [ ] 5 · Sueltas: tabla de números y camino con rango 10, Lee y responde, Tabla de sumar, Colorea y descubre. (Sonnet, medio)

## Fase 7 · Ampliación de contenidos (en curso)
- [ ] Otros cursos de Matemáticas (2.º a 6.º) y Lengua.
  - [x] Matemáticas 2.º · Lotes 0–6 completos (8 a 22-11-2026; guion en `MATES_2.md`, detalle en HISTORIAL.md). Último: lote 6, multiplicar y repartir (bloque 13: `multiplicar.grupos`, `.filas`, `.tablas`, `.problemas`, `.reparto`; «3 grupos de 4» = 3 × 4).
  - [ ] Matemáticas 3.º (guion **aprobado** en `MATES_3.md`, 23-11-2026: hasta 9999 por defecto y **sin punto de millares**, romanos hasta 100, multiplicar por una cifra, caja española con resto, con pensamiento computacional).
    - [x] Lote 0 (23-11-2026): catálogo de 3.º (`motor/modelos_3.py`, rangos 1000…9999), bloques con cubo de mil, ábaco de 4 varillas, UM/C/D/U, letras hasta 9999, recta de 1, 10 o 100 en 100, descomposición de 4 cifras, «¿Qué número es?» (2000–9999) y ✨ `rep.romanos` (hasta 100). 198 doradas. Detalle en HISTORIAL.md.
    - [x] Lote 1 (23-11-2026): ♻ reutilizados hasta 9999 (conteo, orden, sumar/restar con hueco, familia, tabla, pirámide, juegos, problemas, 2 trucos; geometría, calendario y patrones con sus rangos). Detalle en HISTORIAL.md.
    - [x] Lote 2 (23-11-2026): valor posicional con millares (descdu, dunum, cifra, canje, pares), sumas y restas en vertical de cuatro cifras (UM, C, D, U; tres sumandos y prueba), centenas y millares redondos, recta y encadenadas (saltos 10, 100 y 1000), `orden.signos` con cuatro cifras y ✨ `orden.redondea` y `orden.estima` (175 modelos). Detalle en HISTORIAL.md.
    - [ ] Lote 3: multiplicar. (Sonnet)
    - [ ] Lote 4: dividir (la caja con Opus).
    - [ ] Lote 5: fracciones. (Opus)
    - [ ] Lote 6: medida. (Sonnet)
    - [ ] Lote 7: geometría y estadística. (Sonnet)
    - [ ] Lote 8: trucos de 3.º y pensamiento computacional. (Sonnet)
  - [ ] Lengua 1.º · Lote 6 (con pictogramas): aparcado hasta decidir la Fase 6. Lote 4 · decidido: pauta de 5 mm. **Pendiente de Iván**: orden de las letras (más adelante); pictogramas aparcados. **Decisión de Iván (5-11-2026): la letra de las fichas de Lengua será Fredoka** (como Barri y Calculi; OFL, ya está en `fonts/` de Barri). Comprobar al diseñar: la «a» y la «g» que ve el alumno en las palabras de lectura, y la pauta de caligrafía (Fredoka no es letra de escritura a mano).

Límites conocidos de cada tipo: buscar «Límites» en `HISTORIAL.md`.

## Más adelante · Opcional
- [ ] Publicar en Google Play (TWA).
