# Charta — Estado y hoja de ruta

> Si Iván escribe "Continúa": seguir desde el primer paso sin marcar. Marcar `[x]` al terminar cada paso y anotar lo relevante en una línea.

## Hecho (antes de Charta)
- [x] Motor con unos 75 modelos de Matemáticas de 1.º (bloques 1–7 y 9–11) y marco de la ficha de muestra.
- [x] Prueba de regresión `tests/test_motor.py` (0 errores; la versión completa comprueba unas 24.000 operaciones).

## Fase 0 · Preparación (Iván)
- [x] Crear el repositorio `ilinper301-hue/Charta` y subir el paquete inicial.
- [ ] Activar GitHub Pages (Iván, desde Settings → Pages: rama main, carpeta raíz). Claude no puede hacerlo desde su conexión.
- [ ] Añadir `Andika-Regular.ttf` y `Andika-Bold.ttf` (Google Fonts) a `motor/`.
- [x] Conectar el repositorio para que Claude suba los cambios directamente a main.

## Fase 1 · Motor de actividades combinables
- [ ] 1.1 Tabla `MODELOS`: id, curso, materia, bloque, nombre visible, descripción corta, opciones (tipo, valores, valor por defecto), rango mínimo y tamaños admitidos (`completa`, `media`). La app montará sus menús a partir de esta tabla.
- [ ] 1.2 Convertir cada modelo en **actividad**: `actividad(c, rect, params, rnd) -> clave`, que dibuje dentro de un rectángulo (reutilizando el escalado de `cabecera()`). Mantener idéntico el diseño de cada actividad.
- [ ] 1.3 Compositor de página: cabecera (Nombre con o sin nombre impreso, Fecha, título) + 1 o 2 actividades, cada una con su panel de color y su número (1, 2…), como en `referencia/ficha_muestra.pdf`.
- [ ] 1.4 API única `generar(spec) -> (pdf_bytes, clave)`. `spec`: actividades con sus parámetros, alumnos (lista o vacía), variaciones (`iguales` o `distintas`: semilla por alumno), color y título. Un PDF con una página por alumno.
- [ ] 1.5 Mantener la línea de órdenes actual sobre la nueva API; ampliar `tests/test_motor.py` (combinaciones, nombres, variaciones). Ejecutar `--full`.

## Fase 2 · Prototipo en Android (medir Pyodide)
- [ ] 2.1 `app/index.html` mínimo: carga Pyodide + ReportLab + motor, un selector de modelo, botón Generar, vista previa del PDF, Descargar/Compartir.
- [ ] 2.2 Iván lo prueba en su Android: tiempo de la primera carga, de las siguientes y de cada ficha. **Decidir**: seguir con Pyodide o plan B en JavaScript.
- [ ] 2.3 Service worker: funcionamiento sin conexión y caché de Pyodide.

## Fase 3 · App completa (PWA, verde oscuro)
- [ ] 3.1 Flujo: curso → materia → bloque → modelo (tarjetas con miniatura) → opciones (solo las válidas, en lenguaje de maestro).
- [ ] 3.2 Compositor: añadir, ordenar y quitar actividades de una ficha; vista previa.
- [ ] 3.3 Alumnos: escribir o pegar la lista (y después importarla de Tabula); fichas iguales o distintas; un PDF con todas.
- [ ] 3.4 "Otra variante", "Ver soluciones" en pantalla, favoritos o recientes.
- [ ] 3.5 Icono, nombre y manifiesto para instalar desde Chrome; modo tableta horizontal.

## Fase 4 · Integración con Tabula
- [ ] 4.1 Firebase compartido + inicio de sesión con Google.
- [ ] 4.2 Leer los grupos y alumnos de Tabula.
- [ ] 4.3 Botón "Crear ficha" en Tabula (enlace con parámetros) y guardar el PDF en sus documentos.

## Fase 5 · Ampliación de contenidos
- [ ] Bloque 8: problemas (con plantillas de nombres y objetos).
- [ ] Otros cursos de Matemáticas (2.º a 6.º).
- [ ] Lengua (bancos de palabras y sílabas como datos aparte).

## Fase 6 · Opcional
- [ ] Publicar en Google Play (TWA).
