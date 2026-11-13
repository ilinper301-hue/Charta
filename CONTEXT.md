# Charta — Contexto del proyecto

> Leer primero. Junto con CODEMAP.md y ESTADO.md basta para trabajar sin abrir el motor entero.

## Qué es
**Charta** ("hoja de papel", en latín) es la app definitiva de Iván para **crear fichas educativas personalizadas e imprimibles (PDF)**.
- Autor: Iván Manuel Liñán Peregrina, maestro tutor de Primaria (Andalucía), CEIP Emilio Carmona. Este curso, 1.º (unos 20 alumnos, nunca más de 30).
- Hoy: Matemáticas de 1.º (unos 75 modelos ya programados en Python).
- Futuro: **todos los cursos de Primaria** y **varias materias (mínimo Matemáticas y Lengua)**.
- Funciona **sin consumo de tokens y sin conexión**, en **Android (PWA instalable desde Chrome) y en el navegador**. Iván **no tiene ordenador**: todo debe funcionar desde el móvil o la tableta.

## Requisitos de Iván
1. Elegir **curso → materia → contenido → modelo → detalles** y generar la ficha.
2. **Otra variante**: la misma ficha con otros números (semilla).
3. **Nombre de los alumnos**: impreso en cada ficha o línea en blanco (opción).
4. **Variaciones**: todas iguales o una distinta para cada alumno, en un único PDF.
5. **Combinar varias actividades en una misma ficha** (como la ficha de muestra: actividad 1 + actividad 2, cada una en su panel de color).
6. Clave de respuestas **solo en pantalla**, nunca en el PDF.
7. Muchas opciones, pero **interfaz intuitiva**.

## Decisiones tomadas
- **App aparte, conectada a Tabula** (no módulo dentro). Motivos: peso del motor, riesgo de romper el cuaderno y chats más pequeños (menos tokens).
  - Integración prevista: mismo proyecto de Firebase e inicio de sesión con Google que sus otras apps; botón "Crear ficha" en Tabula que abre Charta con el grupo elegido; Charta lee las listas de alumnos de Tabula; la ficha (JSON) se guarda en Firestore y Tabula la referencia por id.
- **Arquitectura (decidida el 5-11-2026, sustituye a "Pyodide + ReportLab")**: la ficha es **datos** (JSON con `schemaVersion`, ver ESQUEMA.md). Motivo: Tabula y Fori deben leerla sin motor, y Fori necesita verla en HTML vectorial, ejercicio a ejercicio y con la solución paso a paso, cosa imposible con un PDF de ReportLab.
  - **Núcleo y renderizado en JavaScript** (módulos ES, sin dependencias): `generar(opciones, semilla) → JSON` y plantillas HTML/SVG (A4 con `@media print`; pantalla para Fori; solucionario). El PDF sale de **imprimir desde el navegador** (Chrome Android: Guardar como PDF).
  - **Sin Pyodide**: si el dibujo es HTML/JS, el único beneficio de Pyodide era reutilizar el Python, pero ese código mezcla datos y dibujo y habría que reescribirlo igual. En JS: carga instantánea (sin 10–20 MB), un solo lenguaje y Tabula y Fori pueden importar el mismo módulo de lectura.
  - **El motor Python (`motor/`) queda como referencia**: diseño aprobado (sus PDF son el modelo visual que hay que imitar), reglas aritméticas y catálogo `MODELOS`. Se mantiene y sigue probándose, pero no va en la app.
  - Tipos de ejercicio = módulos independientes en un registro (ids iguales a los de `MODELOS`). Semilla: mismas opciones + semilla = misma ficha.
  - Pruebas con **Node** en el contenedor de Claude: fichas doradas (opciones + semilla → JSON esperado) e invariantes aritméticas.
- **Ecosistema** (Lectori, Barri, Calculi para el alumnado; Fori pizarra; Tabula cuaderno docente; Charta fichas). Todas en ilinper301-hue.github.io → **mismo origen**: prefijo `charta:` en localStorage/IndexedDB y service worker con scope `/Charta/`. Un único proyecto de Firebase (Google): datos en `/apps/charta/…`, usuarios en `/usuarios/{uid}`. Estilo basado en Lectori. Flujo: `src/` → `python3 tools/build.py` → `dist/index.html`.
  - **Tabula**: Charta guarda la ficha en `/apps/charta/fichas/{id}`; Tabula la referencia por id en documentos para imprimir y la vincula a sesión, tarea o actividad evaluable. Futuro: resultados por alumno.
  - **Fori**: abre `?ficha={id}`; modo proyección (un ejercicio cada vez, solución paso a paso, corrección en gran grupo); anotaciones en capa aparte.
- **Sin pictogramas** (5-11-2026, abandonados; quizá más adelante). Si una ficha necesita un dibujo que Charta no hace, sale un recuadro con un mensaje pequeño («Pega aquí el dibujo») y Iván pega la imagen encima a mano.
- **Sin metadatos LOMLOE** (saberes, criterios): la normativa cambia a menudo; quizá en el futuro. Solo metadatos propios opcionales (dificultad, minutos, etiquetas).
- **Impresión**: a color (paneles pastel, aprobados) con opción de **blanco y negro / ahorro de tinta**.
- **Privacidad**: la ficha se genera e imprime en el dispositivo. Los nombres de los alumnos solo se usan al imprimir: nunca se guardan en el JSON ni en Firestore. Excepción (12-11-2026): el **borrador** de la ficha en curso guarda los nombres en el `localStorage` del dispositivo (nunca en JSON, nube, favoritas, URL, Tabula ni Fori).
- **Alojamiento**: GitHub Pages, repositorio `ilinper301-hue/Charta`, como sus otras apps (Barri: ilinper301-hue.github.io/Barri/, Lectori: ilinper301-hue.github.io/Educacion/). Publicación en Google Play opcional en el futuro (TWA, sin reescribir).

## Diseño
- **Interfaz de la app**: profesional y minimalista (en la línea de Lectori, Barri, Calculi y Tabula). **Color principal: verde oscuro**.
  - Paleta (5-11-2026, la del logo de Iván: verde azulado): primario `#1E524E`, primario oscuro `#153E3C`, C del logo `#419A88`, menta `#B8F3E1`; fondo crema `#FAF9F5` como Tabula. Variables en `src/estilos.css`.
- **Ficha (PDF)**: marco de la ficha de muestra (`referencia/ficha_muestra.pdf`), ya implementado en `cabecera()`:
  - "Nombre:" y "Fecha:" con líneas arriba; título centrado en azul `#1F4E79`, en minúsculas con inicial mayúscula.
  - Panel pastel con borde fino (amarillo, rosa, azul o verde) y enunciado numerado en un círculo azul.
  - Casillas en tarjetas blancas con borde gris claro. Huecos para escribir: gris claro, esquinas redondeadas.
  - Letra **Andika** (`Andika-Regular.ttf` y `Andika-Bold.ttf`, licencia OFL, se pueden incluir en la app). Si falta, Poppins.
  - A4 vertical, una página por ficha; sin respuestas impresas ni explicaciones teóricas.
- El diseño de cada actividad ya está aprobado por Iván: **no cambiarlo** sin que lo pida.
  - Cambios pedidos por Iván después (la app manda; el motor Python no se actualiza): sumas y restas en la recta sin el salto dibujado en la ficha (daba la respuesta); solo el punto de partida, y el salto en rojo en soluciones (5-11-2026).

## Reglas de corrección matemática
- Dedos: máx. 10; del 1 al 4 se levantan índice a meñique con el pulgar plegado.
- Dado: 1–6 un dado; 7–12 dos. Dominó: suma de las mitades, máx. 12.
- Marco de diez 2×5, se rellena por filas. Palotes en grupos de 5 con tachado. Regletas: barras de 10 + resto. Ábaco: máx. 9 cuentas por varilla.
- Número en letras con tildes correctas (dieciséis, veintidós…).
- Ningún resultado supera el rango ni es negativo. Sin llevadas salvo que se pida.

## Forma de trabajar (ahorro de tokens)
- Iván se queda sin cuota pronto: **respuestas breves y por partes**, en español de España, tuteando.
- No pedir confirmación para cosas pequeñas: implementarlas y probarlas.
- Leer CONTEXT.md, CODEMAP.md y ESTADO.md antes de nada (`HISTORIAL.md` no: solo para buscar el detalle de un paso cerrado). **No abrir el motor entero** (unas 2.500 líneas): ir a la sección concreta con el número de línea de CODEMAP.md.
- Tras cada cambio: las pruebas de lo tocado (`node tests/…` para la app; `npm run test:rapido` para cambios de interfaz, 30 s; `python3 tests/navegador.py` si se toca `app.js` o la interfaz; `python3 tests/test_motor.py` si se toca el motor de referencia) y, al cerrar una fase, la completa (`npm test`).
- Entregar **solo los archivos que cambien**. No renderizar muestras salvo cambios de diseño o petición expresa (y entonces una imagen a baja resolución).
- Si Iván escribe **"Continúa"**: leer ESTADO.md y retomar desde el primer paso sin marcar.
- Actualizar ESTADO.md al terminar cada paso.
- **Delegar** en Sonnet o Haiku (subagentes) las tareas largas y mecánicas para ahorrar tokens; lo que necesita el contexto del chat, hacerlo directamente.
- **Avisar** a Iván cuando el chat se alargue demasiado y convenga abrir uno nuevo (con INICIO_CHAT.md), y decirle el **nivel de esfuerzo recomendado** para el siguiente paso.

## Ecosistema
Antes de tocar algo que una app lea o deje para otra (alumnado, resultados, enlaces entre apps), lee `ECOSISTEMA.md`: es el contrato común de las seis apps.
