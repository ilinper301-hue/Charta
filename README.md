# Charta

Fichas educativas personalizadas e imprimibles (PDF), sin conexión y sin gastar tokens, para **Android (PWA) y navegador**. Hoy: Matemáticas de 1.º y 2.º (en curso) y Lengua de 1.º; 151 modelos de actividad.

Elegir curso → materia → bloque → modelo, combinar hasta 2 actividades por página (1–10 páginas), alumnos con nombre o línea en blanco, variantes A/B, soluciones solo en pantalla, favoritas, copia de seguridad, nube (Firebase compartido) y enlaces con Tabula (cuaderno docente) y Fori (pizarra digital).

## Documentos
| Archivo | Para qué |
|---|---|
| [CONTEXT.md](CONTEXT.md) | visión, decisiones, diseño y forma de trabajar (leer primero) |
| [CODEMAP.md](CODEMAP.md) | mapa del código |
| [ESQUEMA.md](ESQUEMA.md) | esquema JSON de la ficha, API pública `globalThis.Charta`, copia de seguridad y enlaces |
| [ESTADO.md](ESTADO.md) | hoja de ruta y pendientes (`HISTORIAL.md`: detalle de lo cerrado) |
| [PLAN-DISENO.md](PLAN-DISENO.md) | análisis de la interfaz y plan de mejora por fases (todas hechas) |
| [LENGUA_1.md](LENGUA_1.md), [MATES_2.md](MATES_2.md) | guiones de contenidos por curso |

## Trabajar con el código
Sin dependencias de ejecución. Hace falta Node (módulos ES), Python 3 y, para la prueba de navegador, Playwright con Chrome.
```
python3 tools/build.py            # src/ → dist/index.html (+ sw.js y manifest.webmanifest)
npm run test:rapido               # 30 s: cambios de interfaz
npm test                          # todo (≈5 min): 151 tipos, 166 fichas doradas, copia, contratos
python3 tests/navegador.py [dir]  # Chrome a 390–1180 px: navegación, Atrás, tamaños táctiles, contraste claro/oscuro, nombres accesibles
python3 tests/test_motor.py       # motor de referencia en Python
```
La app se publica en GitHub Pages desde `dist/` (`index.html` de la raíz redirige). Tras cambiar `src/`, volver a ejecutar `build.py` y subir `dist/`, `sw.js` y `manifest.webmanifest`.

## Accesibilidad (fase 8)
Texto con contraste AA en claro y oscuro (la prueba de navegador lo mide en Inicio, selector, Diseño, Ajustes, menús, avisos y confirmaciones), zonas táctiles de 44 px, foco visible, hojas y menús modales con nombre, Escape y Atrás para cerrar, y avisos con `role="status"` / `"alert"`.

## Motor de referencia (Python)
`motor/` no va en la app: guarda el diseño aprobado. Ejemplo:
```
python3 motor/generador_fichas.py ficha sumar.h20:nivel=con --alumnos "Ana,Luis" --distintas
```
