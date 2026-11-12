# Plan de mejora de Charta: sistema e interfaz

Análisis hecho el 12-11-2026 sobre el commit `05fc76f` (versión `86b9b09413d0`), sin cambiar código.
Interfaz medida en capturas reales con Chrome sin cabeza a **390 × 844** (móvil), **768 × 1024** (tablet vertical)
y **1180 × 820** (tablet horizontal), tema claro y oscuro, con 25 alumnos ficticios.
Cada fase es un chat independiente. Al terminar una fase: márcala aquí como hecha y resume en `ESTADO.md`.

---

## Parte A · El sistema

### A1. Arquitectura (qué hay)

- **Sin dependencias y en un solo archivo**: `src/` (módulos ES) → `tools/build.py` → `dist/index.html`
  (1,2 MB; ≈ 0,3 MB comprimido). `dist/` coincide con `src/` (reconstruido y comparado: sin diferencias).
- **Capas bien separadas**: `nucleo/` (ficha = JSON, azar con semilla) → `tipos/` (151 tipos, 185 archivos,
  8.700 líneas) → `render/` (SVG A4) → `ui/` (lógica sin DOM, probada en Node) → `app.js` (DOM).
- **Punto débil**: `src/app.js` (565 líneas, 38 KB). Su función `iniciar()` ocupa 430 líneas y mezcla compositor,
  mapa de letras, letras subidas, nube, Tabula, Fori, guardadas e inicio. Es el único código sin pruebas
  automáticas y el que tocarán todas las fases de interfaz.
- El **catálogo** (`catalogo.js`, 192 KB, 16 % de la app) sigue saliendo de Python (`motor/modelos*.py` →
  `tools/catalogo.py`): para añadir un modelo hacen falta los dos lenguajes.

### A2. Datos (dónde vive cada cosa)

| Dato | Dónde | Observación |
|---|---|---|
| Favoritas (30) y recientes (8) | `localStorage` `charta:favoritos` / `charta:recientes` | Solo en el dispositivo: **sin copia ni exportación** |
| Ajustes, letras de la clase, «Mis frases», usos | `localStorage` `charta:*` (13 claves en total) | El origen se comparte con todas las apps (cuota común de ≈ 5 MB) |
| Letras subidas | IndexedDB `charta-fuentes` | Solo en el dispositivo (correcto) |
| Fichas en la nube | Firestore `/apps/charta/fichas/{id}` | Ficha como texto + composición; solo el autor |
| Nombres de alumnos | Memoria | Comprobado: tras escribirlos no queda nada guardado |
| **Ficha que se está componiendo** | **Memoria** | **Se pierde al recargar** (ver R1) |

Hay **tres listas distintas** de «mis fichas» (favoritas, recientes, nube) que no se sincronizan entre sí.

### A3. Enlaces con Tabula y Fori

| Enlace | Mecanismo | Estado |
|---|---|---|
| Charta lee grupos de Tabula | IndexedDB `tabula-data` → `cols` (y `tabula:v1:*`) | Coincide con `tabula/js/store.js` hoy; depende de un detalle interno de Tabula |
| Charta → Tabula | `/tabula/?charta=B64` + miniatura en `charta:aTabula` | Coincide con `tabula/js/charta.js` (`v: 1`) |
| Tabula → Charta | `../Charta/?desde=tabula…`, `?ficha=`, `?comp=` | Coincide |
| **Tabula dibuja fichas** | iframe oculto de `Charta/dist/` que usa `globalThis.Charta.generar/hojas` | Funciona, pero **no está en `ESQUEMA.md`**: es una API pública sin contrato |
| Charta → Fori | paquete en `charta:aFori` + `/Fori/?charta=1` | Coincide con `fori/src/js/05f-charta.js` |
| Reglas de Firestore | `firestore.rules` copiado en Charta y Tabula | Iguales salvo un comentario; se mantienen a mano |

Todo depende de que las apps estén en el **mismo origen** y en rutas fijas escritas en el código (`/tabula/`, `/Fori/`,
`../Charta/`). Ninguna prueba comprueba los contratos entre repositorios.

### A4. Rendimiento (medido)

| Medida | Resultado |
|---|---|
| Carga con CPU 4 veces más lenta (móvil medio) | 1,0 s hasta poder usarla |
| Repintar con 25 alumnos (CPU ×4) | 0,2–0,25 s **en cada cambio de cualquier opción** |
| Nodos en pantalla: 1 hoja / 25 hojas / 2 páginas × 25 | 1.100 / 9.500 / 12.800 |
| SVG de 10 páginas × 30 alumnos | 4,7 MB metidos de golpe en la página |
| `generar()` de 5 páginas de escritura × 30 variantes | 1,9 s en un ordenador rápido (varios segundos en el móvil, con la pantalla bloqueada) |
| Ficha mayor posible (10 páginas × 30 variantes) | 443 KB de JSON (límite de la nube: 879 KB) |

La causa común: `pintar()` vuelve a generar y a dibujar **todas** las hojas de **todos** los alumnos, y además el
solucionario aunque esté oculto, con cada cambio.

### A5. Pruebas

- Muy bien cubierto el motor: 12 pruebas en Node (`npm test`: 151 tipos, 2,2 millones de ejercicios, 166 fichas
  doradas, **0 errores**, 5 min 4 s) y `test_motor.py` (0 errores).
- **Nada prueba la app en un navegador**: los flujos de `app.js` solo están «probados a mano en Chrome».
  Tabula ya tiene `tests/desbordamiento.py` (Playwright); Charta no.
- 5 minutos por pasada completa es caro para cambios de interfaz (no hay modo rápido en `npm test`).

### A6. Riesgos y errores encontrados (por gravedad)

- **R1 · Se pierde la ficha a medias.** Solo se guarda al imprimir o marcar favorita. Si Android cierra la app
  (por ejemplo, al ir a copiar la lista de alumnos a otra app) o se recarga, vuelve al inicio con el último
  modelo y sin título, páginas ni opciones. Comprobado.
- **R2 · El botón Atrás de Android con el selector abierto** vuelve al inicio pero deja el selector encima
  (queda una pantalla incoherente). Desde Inicio → Crear ficha, Atrás sale de la app. Comprobado.
- **R3 · Las fichas con más de 10 modelos distintos no se guardan en la nube**: la regla de Firestore exige
  `tipos.size() <= 10` y una ficha admite 10 páginas × 2 actividades. El aviso que sale («revisa las reglas») despista.
- **R4 · «Mis frases» se copia en cada actividad** (`params.misFrases`). Con 60 frases, el enlace a Tabula mide
  2,5 KB con una actividad y **48 KB con 20**: un enlace así puede fallar (los servidores suelen cortar hacia
  los 8 KB; sin comprobar en GitHub Pages). También engorda favoritas y nube.
- **R5 · Favoritas sin copia.** Borrar los datos de Chrome o cambiar de móvil las pierde.
- **R6 · Dependencia del mismo origen y de GitHub** (la cuenta ya estuvo suspendida): leer grupos, enviar a Tabula,
  proyectar en Fori y el iframe de Tabula dejan de funcionar si una app se muda sola. Rutas fijas en 3 archivos.
- **R7 · Contratos sin red**: la API `globalThis.Charta` que usa Tabula no está documentada ni probada; un
  cambio en `generar()` u `hojas()` rompería Tabula sin que ninguna prueba avise.
- R8 · `confirm()` nativo para cerrar sesión y borrar de la nube; tocar «☁ Nombre» en la cabecera es cerrar sesión.
- R9 · El paquete para Fori va en `localStorage` con las letras incrustadas (tamaño sin medir; cuota compartida).

### A7. Deuda técnica

- `app.js` monolítico (A1) y listas de guardadas pintadas dos veces (en `app.js` y en `inicio_vista.js`).
- `build.py` es un empaquetador propio por expresiones regulares (solo admite ciertas formas de `import`/`export`).
- `dist/index.html` (1,2 MB) se sube en cada cambio: el repositorio crece rápido.
- Catálogo dependiente de Python (A1) y motor de referencia ya desfasado (94 modelos frente a 151 tipos).
- **Documentación cara**: `CONTEXT` + `ESTADO` + `ESQUEMA` + `CODEMAP` suman 83 KB que cada chat lee al empezar
  (`ESTADO.md` solo, 46 KB, casi todo historia ya cerrada). Los documentos del proyecto de Claude están
  desfasados respecto al repositorio (les faltaban los pasos del 9 al 12 de noviembre).
- `README.md` aún describe el flujo de Python.

---

## Parte B · La interfaz

### B1. Diagnóstico por pantalla (móvil, 390 × 844)

| Pantalla | Alto | Controles (en la 1.ª vista) | Problema principal |
|---|---|---|---|
| Inicio, primera vez | 1,0 pantallas | 12 (12) | Correcta. «Mis fichas» vacía ocupa sitio |
| Inicio con datos | 1,3 | 14 (10) | Los 4 accesos rápidos (miniaturas 2 × 2) ocupan media pantalla y bajan «Mis fichas» del pliegue |
| Ajustes (en Inicio) | 1,6 | 18 | Se abren al final de la página; «Entrar» y «tema» repetidos (también en la cabecera) |
| Selector · contenido | 1,1 | 16 | 12 bloques en lista: bien. Migas de 28 px |
| Selector · modelos | hasta 14 por bloque | 19 | **Sin buscador** (151 modelos); las miniaturas no se leen a ese tamaño |
| Diseño, 1 actividad | 2,7 | 24 (12) | La vista previa está al final; «Vista previa ↓» solo desplaza |
| Diseño, 2 actividades + 25 alumnos | **17,4** | 32 (15) | Se apilan las 25 hojas; la tarjeta Favoritas/Recientes se cuela arriba |
| Diseño, 2 páginas + 25 alumnos | **35,8** | 40 (20) | Lo mismo, el doble |
| Diseño, Lengua (Letras) | 19,4 | **61** (38) | 27 teclas + 3 atajos + un párrafo de ayuda fijo |
| Soluciones | +1 por variante | — | Otra tarjeta más; en tablet horizontal empuja la vista previa hacia abajo |

**Tablet vertical (768 px)**: usa el diseño de móvil estirado (el de dos columnas empieza en 900 px): desplegables de
740 px de ancho y **22,8–47,4 pantallas** de alto. Es el peor caso.
**Tablet horizontal (1180 px)**: dos columnas, 2,4–3,1 pantallas. La barra «Imprimir» flota y **tapa** los controles
de la columna izquierda; la columna de opciones es estrecha y obliga a desplazar dentro de ella.

Sin desplazamiento horizontal a 360, 390, 768 ni 1180 px. Sin errores de consola en ningún flujo. Modo oscuro correcto.

### B2. Problemas comunes

1. **La vista previa no es una vista previa**: es la lista de todas las hojas. Es la causa de las 17–47 pantallas,
   de los 12.800 nodos y de la lentitud (A4).
2. **Seis acciones con el mismo peso** en «Más acciones» (Otra variante, Favorita, Ver soluciones, Guardar en la
   nube, Enviar a Tabula, Proyectar en Fori), todas con borde, lejos del pulgar y antes de ver la ficha.
3. **Todo desplegado siempre**: Alumnos, Impresión (3 interruptores, letra, subir letra, título) y Letras, aunque
   casi nunca se cambien.
4. **Lo mismo en dos sitios**: Favoritas/Recientes (Inicio y Diseño), cuenta y tema (cabecera y Ajustes).
5. **Zonas táctiles pequeñas**: 5–18 controles por pantalla por debajo de 40 px (cabecera 32, pestañas 30, migas 28,
   «↑ Subir / ↓ Bajar / Quitar» 26, «✕»).
6. **Texto menor de 12,5 px** en 8–72 elementos por pantalla (etiquetas de hoja y de actividad, ayudas).
7. **Accesibilidad**: el selector es un diálogo sin nombre y el foco se escapa de él con el tabulador; las pestañas
   no son pestañas para un lector de pantalla; solo hay una regla de foco visible.
8. Al crear una ficha nueva se conservan alumnos y variantes de la anterior. **Decidido (12-11-2026): se mantiene así.** Queda por decidir solo el solucionario abierto (propuesta: se cierra).

### B3. Reglas de diseño (valen para todas las fases)

- **Una acción principal por pantalla** (Imprimir). El resto, en un menú «⋯» o en una hoja inferior.
- **La vista previa enseña una hoja** con paginador («‹ Ana · A · 1 de 25 ›»); las demás se dibujan al pedirlas.
- **Cabecera única**: atrás + título de la ficha + «⋯». Cuenta, tema y ajustes, solo en Ajustes.
- **Cada cosa en un solo sitio**: mis fichas en Inicio; cuenta en Ajustes.
- **Lo que casi no se cambia, plegado** con un resumen en una línea («25 alumnos · A y B», «Color · Andika»).
- **Zonas táctiles de 44 px** como mínimo y texto de 12,5 px como mínimo.
- Tablet desde 700 px: dos columnas con la hoja como protagonista.
- Ningún ancho (360, 390, 768, 1180) puede desbordar; Atrás de Android cierra siempre la capa de arriba.
- No se toca el diseño de las fichas impresas ni el JSON (las doradas no cambian).

---

## Parte C · Fases

### Fase 1 · Red de seguridad — *Opus, esfuerzo alto* · ✅ hecha (12-11-2026)

> Resultado: `src/ui/borrador.js` (R1), `src/ui/capas.js` + selector (R2), `src/nube/documento.js` (R3: `tipos` ≤ 10 y
> comprobación previa de los límites de las reglas → avisos claros), «Mis frases» en `composicion.misFrases` (R4; las
> antiguas se leen igual; enlace a Tabula > 6 KB → `compLocal` + `charta:aTabula`; Tabula actualizada:
> `js/charta.js` `compDeCharta`, `combine-model.js` reparte las frases), `tests/navegador.py`, `npm run test:rapido`,
> `HISTORIAL.md`. Límites: Tabula → Charta sigue abriendo con `?comp=` en la URL (sin límite de tamaño propio);
> el borrador es uno solo (Crear ficha lo sustituye).

Primero lo que puede hacer perder trabajo; después, la prueba que protege las fases siguientes.

- **Borrador automático** (R1): guardar la composición en curso (`charta:borrador`) en cada cambio y recuperarla
  al abrir («Seguir con la última» la usa). **Decidido (12-11-2026): el borrador conserva los nombres** de los
  alumnos. Límites: solo en `localStorage` de este dispositivo; los nombres **nunca** van al JSON de la ficha, a
  la nube, a favoritas/recientes, a la URL ni a Tabula/Fori (el borrador guarda aparte `{ composicion, alumnos }`
  y la composición sigue pasando por `limpiar()`). Se borra al imprimir o con «Descartar borrador», y se avisa
  en Ajustes de que guarda los nombres en el dispositivo. Prueba: ninguna otra clave ni salida contiene nombres.
- **Atrás de Android por capas** (R2): el selector (y después hojas y menús) apunta una entrada de historial y se
  cierra con Atrás.
- **Nube** (R3): `tipos` se recorta a 10 al guardar (sin tocar las reglas) y el aviso de error distingue el motivo.
- **«Mis frases» una sola vez** (R4): en la composición y no en cada actividad (leyendo también el formato
  actual); si el enlace a Tabula pasa de 6 KB, la composición viaja por `charta:aTabula` como la miniatura.
- **Prueba de navegador** `tests/navegador.py` (Playwright, como `tabula/tests/desbordamiento.py`): recorre
  Inicio → selector → Diseño → 2 actividades → 25 alumnos → imprimir → recargar; falla si hay errores de consola,
  desbordamiento a 360/390/768/1180 o se pierde el borrador; guarda capturas si se le pide.
- `npm run test:rapido` (sin `--full`, menos de 1 minuto) para los cambios de interfaz.
- **Adelgazar la documentación**: pasar lo ya cerrado de `ESTADO.md` a `HISTORIAL.md` (que no se lee al empezar)
  y poner al día los documentos del proyecto de Claude.

### Fase 2 · Partir `app.js` — *Sonnet, esfuerzo medio (mecánico; lo protege la prueba de la fase 1)* · ✅ hecha (12-11-2026)

> Resultado: `app.js` 608 → 131 líneas (director: `iniciar()` crea las vistas y las conecta con un `ctx` compartido). Nuevos en `src/ui/`: `compositor.js` (actividades, páginas, composición, abrir guardada, borrador), `editor_actividad.js`, `letras_vista.js` (mapa de letras y «Mis frases»), `fuentes_vista.js`, `previa.js` (alumnos, vista previa, imprimir), `lista_fichas.js` (ayudantes comunes con Inicio y tarjeta de Diseño), `nube_vista.js`, `enlaces.js` (Tabula y Fori), `preferencias.js`, `dom.js`; y `src/rutas.js` (R6: `URL_FORI`, `URL_TABULA`). Comprobado: `tests/navegador.py` y `npm test` en verde, y mismo DOM y mismo `localStorage` que antes en un recorrido de 27 pasos (Inicio, Lengua con letras y «Mis frases», letra, alumnos, variantes, soluciones, favoritas, recientes, ajustes). Límites: la lógica de elegir pestaña de «Mis fichas» sigue siendo distinta en Inicio y en Diseño (se unificará con la fase 3 o 6); la nube con sesión real no se prueba en navegador (solo `test_nube.js`).

Sin cambiar nada visible ni ningún id. `iniciar()` queda como director y el resto pasa a `src/ui/`:
`compositor.js`, `letras_vista.js`, `fuentes_vista.js`, `nube_vista.js`, `enlaces.js` (Tabula y Fori) y
`lista_fichas.js` (una sola forma de pintar favoritas, recientes y nube, compartida con Inicio).
Rutas de Tabula y Fori en un único `src/rutas.js` (R6).

### Fase 3 · Piezas comunes — *Opus, esfuerzo alto* · ✅ hecha (12-11-2026)

> Resultado: `src/ui/piezas.js` (`abrirHoja`, `abrirMenu`, `confirmar`, `modal`, pestañas con rol; todas son capas: Escape,
> Atrás y tocar fuera cierran; resto inerte, Tab dentro y foco devuelto) y `src/ui/ajustes_vista.js` (Ajustes en hoja:
> cuenta, tema, letra y B/N por defecto, borrador). Cabecera única: Inicio = marca + «⋯» (Ajustes, Grupos de Tabula,
> Pizarra Fori; desaparece el pie de Inicio); Diseño = ← + título de la ficha + «⋯» (Nueva ficha, Ajustes); selector =
> ← + título + ✕, diálogo modal con nombre. Cuenta y tema solo en Ajustes; `confirm()` sustituido (R8). Escala de 44 px
> (`--alto`), texto mínimo 12,5 px (`--txt-min`), foco visible en todos los fondos, migas con zona de 44 px, mapa de letras
> `auto-fill` de 44 px. Botones: `.primario`, `.fantasma`, `.sutil`, `.peligro`, `.icono`. Arreglado en `capas.js`: una capa
> abierta al cerrar otra (menú → Ajustes) se cerraba en la misma vuelta. `tests/navegador.py` amplía la prueba (menú,
> Ajustes, confirmar, pestañas, selector y auditoría de 44 px / 12,5 px a 390 y 768 en Inicio, Ajustes, selector, Diseño y
> Lengua: 0 fallos). Límites: «Más acciones» sigue igual (fase 4); el título de la cabecera aún no se edita (fase 4);
> la nube con sesión real (cerrar sesión, borrar) no se prueba en navegador.


- `src/ui/piezas.js`: `abrirHoja()` (hoja inferior), `abrirMenu()` («⋯») y `confirmar()` (sustituye a `confirm()`,
  R8), accesibles: nombre, foco atrapado, Escape y Atrás.
- Cabecera única en Inicio, selector y Diseño. Cuenta y tema salen de la cabecera.
- Escala táctil (44 px), tamaño mínimo de texto, foco visible, pestañas con su rol.
- Variantes de botón claras: principal, fantasma (sin borde) y con borde solo donde haga falta.

### Fase 4 · Pantalla de diseño en móvil — *Opus, esfuerzo alto (la más importante)* · ✅ hecha (12-11-2026)

> Resultado: con 2 actividades y 25 alumnos, **1,8 pantallas y 1.272 nodos** (antes 17,4 y 9.500). `src/ui/previa.js` dibuja solo la
> hoja visible (paginador «‹ Ana · A · 1 de 25 ›» con desplegable para saltar, flechas del teclado y deslizar el dedo) y
> «Ficha | Soluciones» dentro de la vista previa (el solucionario solo se dibuja si se mira); repinta con 120 ms de retardo y
> **solo genera si cambian actividades, nº de variantes o semilla** (`claveGeneracion`; título, color, letra, lectura, nombres
> y copias solo redibujan; `conPresentacion` = generar con ellos, probado). `render/hoja.js`: `listaHojas` + `dibujarHoja`
> (`hojas()` igual: doradas sin cambios). Barra: Ver ficha (vista previa a pantalla completa, la hoja entera, con Imprimir) +
> Imprimir + «⋯» (Otra variante, Favorita, Guardar en la nube, Enviar a Tabula, Proyectar en Fori); los estados van en un
> aviso breve (`avisar()` en `piezas.js`). Fuera del diseño Favoritas/Recientes y «Más acciones». Título editable en la
> cabecera (vacío = automático, como sugerencia). Letras, Alumnos e Impresión plegadas (`details`) con resumen; ayuda de
> Letras tras «¿Cómo funciona?». Cada actividad: «Cambiar» + «⋯» (Subir, Bajar, Quitar). Pruebas: `tests/navegador.py`
> (paginador, soluciones, Ver ficha, «⋯», medidas) y `test_ui.js` (`previa_datos.js`). Límites: el error de generación sale
> en la vista previa y en un aviso; «Quitar página» sigue como botón en la cabecera de cada página.

- **Vista previa de una hoja con paginador**, dibujando solo la visible (al imprimir se generan todas, como hoy).
  Conmutador «Ficha | Soluciones» dentro de la vista previa en vez de una tarjeta aparte. Repintado con un
  pequeño retardo y sin regenerar si solo cambian nombres, copias o blanco y negro.
- Barra inferior: «Ver ficha» (abre la vista previa a pantalla completa) + **Imprimir** + «⋯» con Otra variante,
  Favorita, Guardar en la nube, Enviar a Tabula y Proyectar en Fori. Desaparece «Más acciones».
- Fuera del Diseño la tarjeta Favoritas/Recientes. Título de la ficha editable en la cabecera.
- Alumnos, Impresión y Letras plegadas con resumen; la ayuda de Letras, tras un «¿Cómo funciona?».
- En cada actividad: «Cambiar» y «⋯» (Subir, Bajar, Quitar).
- Objetivo medible: Diseño con 25 alumnos en **menos de 4 pantallas** y menos de 2.500 nodos.

### Fase 5 · Tablet — *Sonnet, esfuerzo medio* · ✅ hecha (12-11-2026)

> Resultado: desde 700 px, `main` mide el alto de la pantalla (`100dvh − 56 px`) y no se desplaza: columna de opciones de 360–420 px
> con scroll propio (`.col-cuerpo`, nuevo en `index.html`; en móvil es `display: contents`) y barra Imprimir/«⋯» al pie de la
> columna; la vista previa ocupa el resto con la hoja entera (`container-type: size`, ancho `min(100cqw, 100cqh × 210/297)`) y
> el paginador debajo. 768 × 1024: 1 pantalla (antes 22,8); sin «Ver ficha». Inicio (920 px, accesos en 4 columnas, lista
> de fichas en rejilla) y selector (rejilla y migas hasta 1200 px, tarjetas de modelo desde 168 px). `tests/navegador.py`:
> bloque «Fase 5» (700, 768, 820 × 1180, 1024 × 768, 1180 y 699/390 como móvil). Límites: a 768 vertical la hoja mide ≈ 366 px de
> ancho (se ve entera, pero pequeña; «Ver ficha» no existe allí); el solucionario sigue una hoja por vez.

Dos columnas desde 700 px (opciones de ancho fijo, 360–400 px; la hoja ocupa el resto y se ve entera), barra de
imprimir que no tape nada, selector y rejilla de Inicio aprovechando el ancho, y campos con ancho máximo.

### Fase 6 · Inicio y selector — *Sonnet, esfuerzo medio*

- Inicio: accesos rápidos en una fila compacta; «Mis fichas» visible sin desplazar, con «⋯» por fila
  (Abrir, Duplicar, Quitar); Ajustes como pantalla propia (letra, blanco y negro, tema, cuenta, copia).
- Selector: **buscador de modelos** por nombre y etiquetas, recordar el último curso y materia, migas de 44 px.
- Crear ficha nueva mantiene alumnos y variantes (decidido); no cambiar ese comportamiento.

### Fase 7 · Datos y contratos — *Sonnet, esfuerzo medio*

- **Copia de seguridad** (R5): exportar e importar favoritas, recientes y ajustes en un archivo; con sesión
  iniciada, ofrecer subir las favoritas a la nube.
- Contrato de `globalThis.Charta` escrito en `ESQUEMA.md` y prueba que lo fija (R7); prueba cruzada con
  `tabula/js/charta.js` y `fori/src/js/05f-charta.js` clonando esos repositorios.
- Medir y limitar el paquete de Fori (R9). Catálogo sin espacios (192 KB → menos de la mitad).

### Fase 8 · Repaso final — *Sonnet, esfuerzo bajo*

Modo oscuro, lector de pantalla y teclado en hojas y menús nuevos, borrar CSS sin uso, `README.md` y `CODEMAP.md`
al día, capturas de antes y después.

---

## Cómo pedir cada fase

Abrir un chat nuevo en el proyecto y escribir: «Ejecuta la fase N de `PLAN-DISENO.md`». Publicar al terminar cada
fase (no a medias) y enviar capturas de antes y después a 390 px (y a 768 px desde la fase 5).
Las fases 1 a 4 van en ese orden; 5, 6 y 7 pueden intercambiarse. La ampliación de contenidos (lotes de
`ESTADO.md`) puede seguir en paralelo: no toca los mismos archivos salvo `app.js` durante la fase 2.
