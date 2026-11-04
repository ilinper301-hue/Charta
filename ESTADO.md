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
