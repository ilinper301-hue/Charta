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

## Fase 7 · Ampliación de contenidos (en curso)
- [ ] Otros cursos de Matemáticas (2.º a 6.º) y Lengua.
  - [x] Matemáticas 2.º · Lotes 0–6 completos (8 a 22-11-2026; guion en `MATES_2.md`, detalle en HISTORIAL.md). Último: lote 6, multiplicar y repartir (bloque 13: `multiplicar.grupos`, `.filas`, `.tablas`, `.problemas`, `.reparto`; «3 grupos de 4» = 3 × 4).
  - [ ] Matemáticas 3.º (guion **aprobado** en `MATES_3.md`, 23-11-2026: hasta 9999 por defecto y **sin punto de millares**, romanos hasta 100, multiplicar por una cifra, caja española con resto, con pensamiento computacional).
    - [x] Lote 0 (23-11-2026): catálogo de 3.º (`motor/modelos_3.py`, rangos 1000…9999), bloques con cubo de mil, ábaco de 4 varillas, UM/C/D/U, letras hasta 9999, recta de 1, 10 o 100 en 100, descomposición de 4 cifras, «¿Qué número es?» (2000–9999) y ✨ `rep.romanos` (hasta 100). 198 doradas. Detalle en HISTORIAL.md.
    - [ ] Lote 1: ♻ reutilizados hasta 9999. (Sonnet)
    - [ ] Lote 2: valor posicional, sumas y restas de cuatro cifras, redondeo y estimación. (Sonnet)
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
