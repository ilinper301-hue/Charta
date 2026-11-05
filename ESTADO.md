# Charta — Estado y hoja de ruta

> Si Iván escribe "Continúa": seguir desde el primer paso sin marcar. Marcar `[x]` al terminar cada paso y anotar lo relevante en una línea.

## Hecho (antes de Charta)
- [x] Motor con unos 75 modelos de Matemáticas de 1.º (bloques 1–7 y 9–11) y marco de la ficha de muestra.
- [x] Prueba de regresión `tests/test_motor.py` (0 errores; la versión completa comprueba unas 24.000 operaciones).

## Fase 0 · Preparación (Iván)
- [x] Crear el repositorio `ilinper301-hue/Charta` y subir el paquete inicial.
- [x] Activar GitHub Pages (Iván, desde Settings → Pages: rama main, carpeta raíz). Claude no puede hacerlo desde su conexión.
- [x] Añadir `Andika-Regular.ttf` y `Andika-Bold.ttf` (Google Fonts) a `motor/`.
- [x] Conectar el repositorio para que Claude suba los cambios directamente a main.

## Fase 1 · Motor de actividades combinables (motor de referencia en Python)
- [x] 1.1 Tabla `MODELOS`: id, curso, materia, bloque, nombre visible, descripción corta, opciones (tipo, valores, valor por defecto), rango mínimo y tamaños admitidos (`completa`, `media`). La app montará sus menús a partir de esta tabla.
  - Hecho en `motor/modelos.py` (solo datos, sin ReportLab): 94 modelos, `menu()`, `por_defecto()`, `validar()`, `a_json()`. La prueba comprueba que cubre el motor y genera cada opción. `tamanos` es provisional: revisar en 1.2.
- [x] 1.2 Convertir cada modelo en **actividad**: `actividad(c, rect, params, rnd) -> clave`, que dibuje dentro de un rectángulo (reutilizando el escalado de `cabecera()`). Mantener idéntico el diseño de cada actividad.
  - Hecho: `actividad(cv, rect, params, rnd, num, color, tamano)`. Media página = mismo diseño con la mitad de filas (no encogido: al 41 % no se leía). 82 modelos admiten media; solo completa: tablas, camino, laberinto, une, colorea, copia, calendario, pictograma, barras, cuenta figuras, recuento y la opción «clasificar» de pares. Ficha de línea de órdenes idéntica (comprobado píxel a píxel).
- [x] 1.3 Compositor de página: cabecera (Nombre con o sin nombre impreso, Fecha, título) + 1 o 2 actividades, cada una con su panel de color y su número (1, 2…), como en `referencia/ficha_muestra.pdf`.
  - Hecho: `pagina(cv, acts, rnd, titulo, nombre, colores)`. Título por defecto «X y y». Si dos paneles salen del mismo color, el segundo pasa al siguiente de la paleta. Error claro si un modelo de solo página completa va en una hoja de dos.
- [x] 1.4 API única `generar(spec) -> (pdf_bytes, clave)`. `spec`: actividades con sus parámetros, alumnos (lista o vacía), variaciones (`iguales` o `distintas`: semilla por alumno), color y título. Un PDF con una página por alumno.
  - Hecho: `generar(spec)`. Sin alumnos, `copias` páginas con nombre en blanco. Semilla de cada página = semilla×1000003 (+ nº de alumno si `distintas`): reproducible. Clave: `{"titulo", "variaciones", "paginas": [{"alumno", "claves"}]}`.
- [x] 1.5 Mantener la línea de órdenes actual sobre la nueva API; ampliar `tests/test_motor.py` (combinaciones, nombres, variaciones). Ejecutar `--full`.
  - Hecho: órdenes nuevas `ficha` (sobre `generar()`) y `modelos`; las antiguas siguen igual. `--full`: 6.326 fichas, 29.505 operaciones, 0 errores. **Fase 1 cerrada.**

> **5-11-2026: cambio de arquitectura** (ver CONTEXT.md): ficha = JSON; núcleo y renderizado en JavaScript; sin Pyodide. La fase 1 queda como **motor de referencia** en Python.

## Fase 2 · Núcleo JSON y renderizado HTML (corte vertical)
- [x] 2.1 Estructura `src/` + `tools/build.py` → `dist/index.html` (como sus otras apps; mirar Lectori/Tabula). Registro de tipos, PRNG con semilla (p. ej. mulberry32), `generar(opciones, semilla)` según ESQUEMA.md. Pruebas en Node.
  - Hecho: `src/nucleo/` (azar mulberry32, registro de tipos, `generar()`/`validar()` portados del motor, `lector.js` sin dependencias para Tabula/Fori), catálogo generado (`tools/catalogo.py`), tipo de muestra `sumar.h20` (solo datos), app mínima y `build.py` (empaquetador propio, sin dependencias). `node tests/test_nucleo.js`: 10 pruebas OK; comprobado en Chrome sin errores. La raíz redirige a `dist/`.
- [x] 2.2 Componentes SVG de las 16 representaciones del número, copiando el dibujo de `motor/` (comparar con sus PDF).
  - Hecho: `src/rep/index.js` (`rep`, `plantilla`, `svgCompleto`, `nombreNumero`; opción `rango` para la recta, 30 o 100). Comparado con el motor (`tools/comparar_rep.py`): iguales salvo antialiasing. `node tests/test_rep.js`: 12 pruebas OK (puntos, marco por filas, palotes, ábaco ≤ 9…).
- [x] 2.3 Primeros 8 tipos, uno por cada patrón de dibujo: rep.dado, rep.marco, conteo.serie1, orden.signos, sumar.h20, sumar.vertical, restar.recta, medida.reloj (completa y media).
  - Hecho: `src/render/papel.js` (lienzo en coordenadas del motor) y `render(actividad, modo)` (`papel` / `solucion`, respuestas en rojo); cada tipo = `generar` + `dibujar`; `_rep.js` sirve para las 16 rep.*. `node tests/test_tipos.js --full`: 8 tipos, 4.400 fichas OK. Comparados con el motor (`tools/comparar_tipo.py`): misma maqueta. Media de orden.signos y medida.reloj genera solo lo que se dibuja (mantiene la proporción de iguales / en punto–y media).
- [x] 2.4 Plantilla A4 (`@media print`): cabecera (nombre o línea en blanco), Fecha, título y 1–2 paneles; un alumno por página; solucionario en pantalla. Opción blanco y negro.
  - Hecho: `src/render/hoja.js` (`hoja()`, `hojas()`: port de encabezado/panel/pagina; alumno i → variante i % N). App: 1–2 actividades, alumnos, iguales/distintas, B/N, título, Imprimir (solo las fichas; el solucionario nunca se imprime), Otra variante, Ver soluciones. Andika recortada a WOFF (13 KB c/u, `src/fuentes/`) e incrustada por build.py. Probado en Chrome: PDF de 3 páginas A4 sin errores. Arreglado build.py: `export const A = …, B = …` perdía B (ahora da error).
- [x] 2.5 Fichas doradas e invariantes aritméticas (reutilizar las reglas de `tests/test_motor.py`).
  - Hecho: `tests/invariantes.js` (una regla por tipo: solución sacada de los datos, rangos, sin negativos, niveles sin/con/mezcla, nº de ejercicios, repeticiones; obligatoria para cada tipo nuevo) y `test_invariantes.js` (`--full`: 157.000 ejercicios, 0 errores). `test_doradas.js` + `doradas.json`: 12 casos (JSON + huella del SVG papel/solución; `--actualizar` solo si el cambio es intencionado). Comprobado que detectan errores a propósito. `npm test` ejecuta todo.
- [x] 2.6 Iván lo prueba en su Android: rapidez, Imprimir → Guardar como PDF y parecido con el PDF de referencia. **Decidir** si el aspecto vale.
  - Hecho: Iván da el visto bueno (5-11-2026). **Fase 2 cerrada.**

## Fase 3 · Resto de tipos
- [x] Portar los 86 modelos restantes por lotes (delegar en Sonnet: motor Python + PDF de referencia como modelo), con sus pruebas.
  - Estructura: `src/tipos/familia.<f>.js` registra los tipos de cada familia; reglas en `tests/inv/<f>.js`; `--solo <prefijo>` en test_tipos/test_invariantes.
  - [x] rep (14 + 2): con la fábrica `_rep.js`.
  - [x] combinada, suma · conteo · orden · valor · sumar · restar · juegos · geometria · medida · estadistica (7 agentes Sonnet en paralelo con `tools/ENCARGO_PORTAR.md`; cada tipo comparado con el motor en PNG).
  - Resultado: **94 tipos**. `test_tipos --full`: 50.520 fichas; `test_invariantes --full`: 1,47 millones de ejercicios; 98 fichas doradas. 0 errores. Hoja de contactos de todas las medias revisada.
  - Decisiones: el azar del dibujo (posiciones, desvíos) va en `datos` (dibujo determinista). Donde el alumno rodea, une, colorea o dibuja: `huecos: []` y la respuesta en campos propios de `solucion` (`rodea`, `une`, `correcta`…), marcada en rojo con trazo. `generar()` devuelve la ficha normalizada a JSON (sin −0). En media se conserva la proporción de cada tipo.
  - **Pendiente de Iván**: pirámide: máximo 3 huecos (con 4 no tenía solución única; decidido el 5-11-2026). Sumas y restas de decenas: desde rango 100 (con 30 solo había 3 operaciones; decidido el 5-11-2026). **Fase 3 cerrada.**
  - Rangos de 10 en 10, del 10 al 100 (`RANGOS` en motor/modelos.py; decidido el 5-11-2026). `pares()` ya no repite operaciones si quedan libres del mismo tipo (con/sin llevada: marca `.lleva` en el grupo). `--full`: 114.880 fichas y 3,4 millones de ejercicios, 0 errores.

## Fase 4 · App completa (PWA, verde oscuro)
- [x] 4.1 Flujo: curso → materia → bloque → modelo (tarjetas con miniatura) → opciones (en lenguaje de maestro, desde `MODELOS`).
  - Hecho: selector a pantalla completa (`src/ui/selector.js`; lógica sin DOM en `src/ui/navegacion.js`): migas, Atrás, niveles de una sola opción saltados solos; miniatura = la actividad con opciones por defecto. La primera vez la app abre el selector; después recuerda el último modelo (`charta:ultimoModelo`). En la 2.ª actividad, los de solo página completa salen desactivados, y las opciones que no caben en media también. «Rango» → «Números: hasta el N». `node tests/test_ui.js` (en `npm test`); probado en Chrome móvil sin errores.
- [x] 4.2 Compositor: añadir, ordenar y quitar actividades; vista previa.
  - Hecho: en `iniciar()` (app.js): `recolocar()` renumera y pone ↑ Subir / ↓ Bajar / Quitar (se puede quitar cualquiera); al reordenar se conservan las opciones y se recalculan título y colores; botón «Vista previa ↓». Solo la actividad 1 se recuerda como último modelo. Probado en Chrome móvil sin errores.
- [x] 4.3 Alumnos (escribir o pegar; después desde Tabula); fichas iguales o variantes A/B…; impresión de todas.
  - Hecho: `src/ui/alumnos.js` (`leerAlumnos`: uno por línea, comas en una línea, listas numeradas, columnas de hoja de cálculo y «Apellidos, Nombre» de Séneca → «Nombre Apellidos»; máx. 30; `numVariantes`). Sin alumnos: «Copias» (1–30) con línea en blanco (`hojas(…, {copias})`). Fichas: iguales · 2 (A/B) o 3 (A/B/C) alternas · una distinta por ficha; solucionario por variante. Recuento en vivo. Nombres nunca guardados. Pruebas en `test_ui.js`; probado en Chrome (imprime todas las páginas).
- [x] 4.4 "Otra variante", "Ver soluciones", favoritos o recientes.
  - Hecho: `src/ui/guardadas.js` (`crearGuardadas(almacén)`: `charta:favoritos` máx. 30, con semilla → misma ficha; `charta:recientes` máx. 8, se anotan al imprimir, sin repetir la misma composición). Solo se guardan actividades, opciones, semilla, título, variantes y B/N (`limpiar()`): nunca nombres. Botón ☆/★ Favorita; tarjeta con pestañas Favoritas/Recientes (abrir, quitar). «Ver soluciones» baja al solucionario. Pruebas en `test_ui.js`; probado en Chrome.
- [x] 4.5 Service worker (scope `/Charta/`, sin conexión), prefijo `charta:`, icono, manifiesto, modo tableta.
  - Hecho: `sw.js` y `manifest.webmanifest` en la raíz (los escribe build.py desde `src/pwa/`; versión = huella de la app → se actualiza solo). Caché primero, solo cachés `charta-*` (mismo origen que las otras apps); `?ficha=…` funciona sin conexión. Aviso «Hay una versión nueva · Actualizar» (no recarga solo). Iconos (hoja con dos paneles sobre verde, normal y maskable) con `tools/iconos.py`. Tableta (≥ 900 px): opciones a la izquierda y vista previa fija a la derecha. Probado en Chrome: manifiesto sin errores, recarga sin conexión y aviso de versión. **Pendiente de Iván**: instalarla en el Android (Chrome → Instalar app) y probar sin datos. **Fase 4 cerrada.**
- [x] 4.6 (petición de Iván) Modo oscuro y diseño en la línea de Tabula: fondo crema, títulos con serifa, verde como único acento, cabecera con logotipo y botón de tema (automático · claro · oscuro, `charta:tema`). El papel de la vista previa sigue blanco. Logo: el que eligió Iván (C crema con tres hojas en abanico), pasado a vector con los colores de la app, en `src/pwa/logo.svg`; los iconos salen de él (`tools/iconos.py`).

## Fase 5 · Tabula y Fori
- [x] 5.1 Firebase compartido + Google; guardar en `/apps/charta/fichas/{id}` (sin nombres de alumnos).
  - Hecho: `src/nube/` (config de Tabula, SDK 12.19.0 del CDN cargado solo si se usa la nube; sesión propia `charta`). Botón «☁ Entrar» en la cabecera, «☁ Guardar en la nube» (no repite la misma ficha; sin conexión queda pendiente y se sube sola) y pestaña «☁ En la nube» (abrir, borrar). `?ficha={id}` abre una ficha guardada. Documento: ficha como texto JSON + composición (ver ESQUEMA.md); lector `fichaDeDocumento()` para Tabula/Fori. Reglas: bloque Charta añadido a `tabula/firestore.rules` (copia en `firestore.rules`). SW: SDK en caché `charta-sdk`. `node tests/test_nube.js` (Firebase falso); probado en Chrome sin errores (sin acceso real a Firebase desde el contenedor). **Pendiente de Iván**: pegar `firestore.rules` en Firebase → Firestore → Reglas → Publicar, y probar Entrar + Guardar en el Android.
- [x] 5.2 Tabula: listas de alumnos, botón "Crear ficha", referencia por id en documentos, vínculo a sesión o tarea.
  - Hecho: Charta lee grupos y alumnado del IndexedDB de Tabula (mismo origen, solo lectura, sin conexión; nunca crea su base): selector «Grupo de Tabula» (`?grupo=` lo preselecciona). «↗ Enviar a Tabula» vuelve a `/tabula/?charta=…` con id (si hay sesión en la nube) y composición, sin nombres. `?comp=` abre una composición. Raíz: la redirección a `dist/` conserva los parámetros. Tabula (`js/charta.js`): documento de tipo «Ficha de Charta» (abrir/imprimir → Charta con el grupo), vinculado a sesión (`documentoIds`) o tarea (`documentoIds`, nuevo); botones «Crear ficha» en Documentos, Grupos, sesión y tarea. Reglas de Firestore sin cambios. Pruebas: `test_ui.js` y `tabula/tests/charta.test.mjs`; ida y vuelta probada en Chrome sin errores. **Pendiente de Iván**: probarlo en el Android.
- [x] 5.3 Fori: `?ficha={id}`, modo proyección ejercicio a ejercicio, solución paso a paso, capa de anotaciones.
  - Hecho: `src/fori/diapositivas.js` (diapositivas 1600×900: actividad entera + un ejercicio por página recortado con getBBox; pasos = rachas de marcas rojas, `class="cs pK"`). Botón «▶ Proyectar en Fori»: deja el paquete en `localStorage["charta:aFori"]` y abre `/Fori/?charta=1` (variante A, sin nombres). Fori (`src/js/05f-charta.js`): cada diapositiva es una página (fondo = ficha, tinta encima = anotaciones; se guarda en la pizarra y en lecciones) con barra **Solución** − k/n + Todo (oculta en modo libre). `?ficha=ID` o `?comp=` en Fori → Charta (`&a=fori`) → vuelta. Arreglado de paso: orden.mayor, orden.cantidad y valor.pares (rodear) no marcaban la solución; ahora rodean en rojo (versión 2, doradas actualizadas). `node tests/test_fori.js` (`--full`: 31.770 diapositivas OK); ida y vuelta probada en Chrome sin errores. **Pendiente de Iván**: probarlo en la PDI y confirmar que Fori abre en `/Fori/`.

## Fase 6 · Accesibilidad y metadatos propios
- [x] Dificultad, tiempo estimado y etiquetas por modelo (sin LOMLOE: decisión de Iván, 5-11-2026).
  - Hecho: `motor/metadatos.py` (`META`: dificultad 1–3, minutos y etiquetas de los 94 modelos; `tools/catalogo.py` los vuelca a `catalogo.js` como `metadatos`). `metadatosDe(ids)` en `ficha.js` (dificultad = la mayor, minutos = suma, media página ≈ la mitad, etiquetas sin repetir); la app los pone en `ficha.metadatos` (no en `generar()` por defecto: las doradas no cambian). Selector: «●○○ · 8 min» en cada tarjeta. `npm test` y `test_motor.py` OK. Los valores son una primera estimación: Iván puede ajustarlos en `META`.
- [x] Tamaños grandes y lectura fácil (los pictogramas siguen pendientes, a decidir con Iván).
  - Hecho: casillas «Letra grande» y «Lectura fácil» (ficha.presentacion.letraGrande / lecturaFacil, solo si se marcan: las doradas no cambian). `hoja()` con `grande` (cabecera y enunciado mayores, enunciado partido por palabras) y `facil` (además una frase por línea); el dibujo de la actividad no cambia. Se guardan en favoritos/recientes. `estiloLectura(ficha)`. Probado en los 94 modelos (`test_ui.js`) y con una muestra en PNG. `npm test` OK.
- [ ] Pictogramas (decidir con Iván: de dónde salen y dónde se ponen).

## Fase 7 · Ampliación de contenidos
- [x] Bloque 8: problemas (con plantillas de nombres y objetos).
  - Hecho: 3 modelos propios de la app (`motor/modelos_app.py`, no entran en `modelos.MODELOS` para no tocar `test_motor.py`): `problemas.suma` (juntar, añadir), `problemas.resta` (quitar, comparar, faltar) y `problemas.mixtos`. Opciones: números hasta 10–100 (20 por defecto), situaciones, llevadas. 4 problemas por página (2 en media): enunciado + «Operación: [a] [±] [b] = [ ]» + «Respuesta: [ ] objeto». Todas las cantidades y el resultado ≥ 2 (el plural siempre es correcto); 24 nombres y 20 objetos con su género. `src/tipos/_problemas.js` (núcleo común), invariantes en `tests/inv/problemas.js`. 97 tipos; `npm test` OK. **Ampliable**: más situaciones (igualar, cambio con incógnita), problemas de dos pasos y plantillas por contexto (escuela, parque…).
- [ ] Barri (modelo de barras) y Calculi (estrategias) como tipos.
- [ ] Otros cursos de Matemáticas (2.º a 6.º) y Lengua.

## Fase 8 · Opcional
- [ ] Publicar en Google Play (TWA).
