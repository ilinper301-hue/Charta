# Charta

Fichas educativas personalizadas e imprimibles, sin conexión, para Android y navegador.

- Contexto y decisiones: [CONTEXT.md](CONTEXT.md)
- Mapa del código: [CODEMAP.md](CODEMAP.md)
- Hoja de ruta: [ESTADO.md](ESTADO.md)

Generar una ficha desde la línea de órdenes:
```
python3 motor/generador_fichas.py sumar h20 20 --nivel mezcla
```
Prueba de regresión: `python3 tests/test_motor.py` (`--full` para la completa).

App (JavaScript): `python3 tools/build.py` → `dist/index.html`. Pruebas: `node tests/test_nucleo.js`.
