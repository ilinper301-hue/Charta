# Charta — Estado y hoja de ruta

> Si Iván escribe "Continúa": seguir desde el primer paso sin marcar. Marcar `[x]` al terminar cada paso y anotar lo relevante en una línea.

## Análisis del sistema y de la interfaz (12-11-2026) → `PLAN-DISENO.md`
Sin cambios de código. El plan y el estado de sus fases están en **`PLAN-DISENO.md`** (se piden con «Ejecuta la fase N de `PLAN-DISENO.md`»; «Continúa» sigue con los pasos de contenidos de más abajo).
- **Sistema**: motor sólido (`npm test`: 151 tipos, 166 doradas, 0 errores, 5 min; `dist/` al día). Débil: `app.js` (565 líneas, sin pruebas de navegador) y documentación de 83 KB por chat.
- **Errores comprobados**: se pierde la ficha a medias al recargar o si Android cierra la app; Atrás de Android deja el selector encima del inicio; la nube rechaza fichas con más de 10 modelos distintos (regla `tipos ≤ 10`); «Mis frases» se copia en cada actividad (enlace a Tabula de hasta 48 KB); favoritas sin copia de seguridad.
- **Enlaces**: los contratos con Tabula y Fori coinciden hoy; el iframe de Tabula usa `globalThis.Charta` sin contrato escrito ni prueba; todo depende del mismo origen y de rutas fijas.
- **Interfaz** (capturas a 390 × 844, 768 × 1024 y 1180 × 820): Inicio y selector, bien (falta buscador de modelos). Diseño: la vista previa apila todas las hojas → 17 pantallas con 25 alumnos (36 con 2 páginas; 47 en tablet vertical, que usa el diseño de móvil), 12.800 nodos y 0,25 s por cada cambio; 6 acciones con el mismo peso; secciones siempre desplegadas; zonas táctiles de 26–32 px. Sin desbordamiento ni errores de consola.
- **Decisiones de Iván (12-11-2026)**: el borrador conserva los nombres (solo en el dispositivo); al crear ficha nueva se mantienen alumnos y variantes.
- **Fases**: 1 red de seguridad (borrador, Atrás, nube, prueba de navegador, adelgazar documentos) · 2 partir `app.js` · 3 piezas comunes · 4 diseño en móvil (vista previa de una hoja) · 5 tablet · 6 inicio y selector · 7 datos y contratos · 8 repaso.
- [x] **Fase 1 hecha (12-11-2026)**: borrador automático con los alumnos (`charta:borrador`, solo en el dispositivo; vuelve al recargar y con «Seguir con la última»; se borra al imprimir o con «Descartar borrador»), Atrás de Android cierra el selector (`src/ui/capas.js`), nube con `tipos` recortado a 10 y avisos claros, «Mis frases» una sola vez en la composición (enlace a Tabula de 36 KB → 4 KB; más de 6 KB va por `charta:aTabula`, Tabula ya lo lee), `tests/navegador.py` (33 comprobaciones) y `npm run test:rapido` (32 s). Historia cerrada → `HISTORIAL.md`.
- [x] **Fase 2 hecha (12-11-2026)**: `app.js` partido (608 → 131 líneas) en vistas de `src/ui/` (compositor, letras, fuentes, previa, lista de fichas, nube, enlaces) y rutas de Tabula y Fori en `src/rutas.js`; sin cambios visibles (mismo DOM y `localStorage` en un recorrido de 27 pasos; `npm test` y `tests/navegador.py` en verde). 
- [x] **Fase 3 hecha (12-11-2026)**: `src/ui/piezas.js` (hoja inferior, menú «⋯», `confirmar()` en vez de `confirm()`, pestañas con rol) y Ajustes en una hoja (`ajustes_vista.js`). Cabecera única: Inicio = marca + «⋯»; Diseño = ← + título + «⋯»; cuenta y tema solo en Ajustes. Controles de 44 px, texto de 12,5 px como mínimo, foco visible; `tests/navegador.py` lo audita (0 fallos) y `npm run test:rapido` en verde. 
- [x] **Fase 4 hecha (12-11-2026)**: Diseño con 25 alumnos en 1,8 pantallas y 1.272 nodos (antes 17,4 y 9.500). Vista previa de una hoja con paginador y «Ficha | Soluciones»; solo se genera si cambia el contenido; barra Ver ficha (pantalla completa) + Imprimir + «⋯»; título editable en la cabecera; Letras, Alumnos e Impresión plegadas con resumen; «⋯» en cada actividad; sin Favoritas/Recientes ni «Más acciones» en el diseño. `npm test` y `tests/navegador.py` en verde. 
- [x] **Fase 5 hecha (12-11-2026)**: tablet desde 700 px en dos columnas (`clamp(360px, 38vw, 420px)` + hoja). La columna de opciones se desplaza sola (`.col-cuerpo`) y la barra Imprimir queda al pie de la columna sin tapar nada; la vista previa llena la columna derecha con la hoja **entera** (A4 por `cqh`/`cqw`) y el paginador debajo; la página ya no se desplaza (768 × 1024: antes 22,8 pantallas). Sin «Ver ficha» en tablet. Inicio a 920 px con accesos en 4 columnas y «Mis fichas» en rejilla; selector con rejilla y migas hasta 1200 px. `tests/navegador.py` mide 700, 768, 820 × 1180, 1024 × 768 y 1180 (columnas, hoja entera, barra, sin desplazamiento, 699 = móvil) y audita 44 px a 1180; `npm test` y `tests/navegador.py` en verde.
- [x] **Fase 6 hecha (12-11-2026)**: Inicio con «Mis fichas» antes de los accesos rápidos, que van en una sola fila deslizable (miniatura + nombre); cada ficha lleva «⋯» (Abrir; Duplicar = copia en favoritas con otra semilla y «(copia)»; Quitar de la lista, y en la nube «Borrar de la nube» con confirmación: antes no había forma de borrar desde la interfaz). Ajustes a pantalla completa. Selector: buscador de modelos (nombre, descripción y etiquetas, sin tildes ni mayúsculas, dentro del curso y la materia elegidos; cada resultado indica su bloque) y recuerda el último curso y materia (`charta:ultimaRuta`: se abre en los bloques y las migas cambian curso o materia). `tests/navegador.py` (bloque «Fase 6») y `test_ui.js` (`buscar`, `duplicar`); `npm test` en verde. Siguiente: **fase 7** (Sonnet, esfuerzo medio) o 8.

## Resumen de lo hecho
- Motor de referencia en Python (Fase 1) con compositor de página y API `generar(spec)`; `tests/test_motor.py` en verde.
- Núcleo JSON + render HTML/SVG (`src/`, `tools/build.py` → `dist/index.html`) con plantilla A4 de impresión (Fase 2).
- 151 modelos/tipos de actividad hoy; `npm test`: 166 fichas doradas e invariantes, 0 errores (Fases 2–3 y 7).
- App PWA en verde oscuro: curso → materia → bloque → modelo, compositor, alumnos, variantes A/B, soluciones, favoritos y recientes (Fase 4).
- Pantalla de inicio, modo oscuro y rediseño visual; service worker sin conexión, icono y modo tableta.
- Selector de letra (Andika por defecto, Fredoka para Lengua) y accesibilidad: dificultad, tiempo y etiquetas por modelo; pictogramas abandonados.
- Fichas de varias páginas (1–10) con numeración seguida y «Mis frases» para las primeras letras.
- Nube: Firebase compartido con Google, fichas en `/apps/charta/fichas/{id}` sin nombres de alumnos.
- Tabula: listas de alumnos, «Crear ficha» y envío de fichas a Documentos; Fori: `?ficha={id}`, proyección y solución paso a paso.
- Bloque 8 de problemas, `problemas.barras` (Barri) y 8 trucos de cálculo mental de Calculi en 1.º.
- Matemáticas 1.º completa; Matemáticas 2.º: lotes 0–3a (catálogo por curso, hasta 999, tres cifras, saltos de 10 y 100, reloj con cuartos, dinero y compras).
- Lengua 1.º: lotes 0–5 (sílaba, letra, fono, palabra, orto, frase, escritura con pauta Lamela y letras de trazo, lectura) más «Leo y dibujo» y «Miro y escribo».
- Mapa de letras de Lengua 1.º con letras obligatorias (pulsación larga), válido en favoritas, nube, Tabula y Fori.
- `geometria.lineas` v2 con opciones en orden aleatorio.
Detalle de cada paso: `HISTORIAL.md`.

## Pendiente de Iván
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
  - [ ] Matemáticas 2.º · Lote 3: medida.
    - [x] 3a. Reloj con cuartos, tiempo, dinero hasta 500 € y compras (9-11-2026; detalle en HISTORIAL.md)
    - [ ] 3b. ✨ `medida.euros` (pagar con el menor número de billetes y monedas) y ✨ `medida.masa` (balanzas, kg y ½ kg). (Sonnet)
    - [ ] 3c. 🔧 `medida.longitud`: mide con la regla en centímetros reales (`Papel.mm()`) y ¿m o cm? (Opus)
  - [ ] Matemáticas 2.º · Lotes 4–6 (ver `MATES_2.md`).
  - [ ] Lengua 1.º · Lote 6 (con pictogramas): aparcado hasta decidir la Fase 6. Lote 4 · decidido: pauta de 5 mm. **Pendiente de Iván**: orden de las letras (más adelante); pictogramas aparcados. **Decisión de Iván (5-11-2026): la letra de las fichas de Lengua será Fredoka** (como Barri y Calculi; OFL, ya está en `fonts/` de Barri). Comprobar al diseñar: la «a» y la «g» que ve el alumno en las palabras de lectura, y la pauta de caligrafía (Fredoka no es letra de escritura a mano).

Límites conocidos de cada tipo: buscar «Límites» en `HISTORIAL.md`.

## Fase 8 · Opcional
- [ ] Publicar en Google Play (TWA).
