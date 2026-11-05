# Encargo: portar modelos del motor Python a tipos JS (Fase 3 de Charta)

Repositorio en `/home/claude/charta` (sin dependencias; Node 22, Python 3). Varios agentes trabajan **a la vez** en familias distintas.

## Lee primero (solo esto)
- `CODEMAP.md`: sección «Núcleo JS (fase 2)» y la tabla del motor (números de línea de cada familia).
- `ESQUEMA.md` (forma de actividad y ejercicio).
- Ejemplos ya portados: `src/tipos/sumar.h20.js`, `src/tipos/sumar.vertical.js`, `src/tipos/conteo.serie1.js`, `src/tipos/orden.signos.js`, `src/tipos/medida.reloj.js`, `src/tipos/restar.recta.js`.
- `src/render/papel.js` (primitivas: `celdas`, `pintar`, `linea`, `marco`, `caja`, `cuadrito`, `T`, `B`, `rep`, `plantilla`, `text`, `circle`, `path`…).
- `tests/invariantes.js` y `tests/inv/_ayuda.js` (cómo se escriben las reglas).
- Del motor `motor/generador_fichas.py`: **solo las funciones de tus modelos** (busca con grep `def _x_...` y el diccionario de la familia; no lo abras entero, son 2.700 líneas).
- Opciones de cada modelo: `node -e 'import("./src/nucleo/ficha.js").then(({modelo})=>console.log(JSON.stringify(modelo("<id>"),null,1)))'`.

## Qué hacer por cada modelo `<id>`
1. `src/tipos/<id>.js`: `registrar({id, version: 1, generar(params, azar, {tamano}), dibujar(p, act)})`. Cabecera de comentario con la forma de `datos` y `solucion` (como los ejemplos).
   - `generar`: port fiel de la lógica del motor (mismas reglas, mismos números de ejercicios en completa y media; media = mitad de filas). Usa solo el `azar` recibido (`entero`, `elegir`, `barajar`, `muestra`). Error con «necesita» en el mensaje si la combinación de opciones no es posible (como el motor).
   - `dibujar`: port casi literal del dibujo del motor (mismas coordenadas). Cada ejercicio dentro de `p.ejercicio(e.id, …)`; cada hueco con su solución (`B(w,h,sol)`, `p.caja(…, sol)`, `p.cuadrito(…, sol)`) en el orden de `solucion.huecos`. Si el alumno dibuja/une/colorea sin hueco escrito, `huecos: []`.
   - Comparte ayudantes con export entre tus archivos si hace falta (p. ej. importar `pares` de `sumar.h20.js`). **No cambies** archivos de tipos ya existentes salvo para exportar un ayudante.
2. Añade `import "./<id>.js";` en `src/tipos/familia.<familia>.js` (antes: `node --check src/tipos/<id>.js`).
3. Su regla en `tests/inv/<familia>.js` (`export default { "<id>"(act, tam) { … } }`): la solución se deduce de los datos, nada supera el rango ni es negativo, niveles sin/con/mezcla, nº de ejercicios por tamaño, sin repetidos si el motor lo garantiza. Reglas de CONTEXT.md: dedos ≤10, dado/dominó ≤12, ábaco ≤9 por varilla, sin llevadas salvo que se pida.
4. Pruebas (con tu prefijo): `node tests/test_tipos.js --solo <familia>.` y `node tests/test_invariantes.js --solo <familia>.` → 0 fallos.
5. Comparación visual: `python3 tools/comparar_tipo.py <id> --salida /tmp/<familia>` (y `--media` si admite media) y **mira el PNG** con Read (`/tmp/<familia>/cmp_<id>_<tamaño>.png`; izquierda motor, derecha JS; los números difieren). Debe verse la misma maqueta. Corrige hasta que coincida.

## Reglas
- Toca **solo**: tus `src/tipos/<id>.js`, `src/tipos/familia.<tuya>.js`, `tests/inv/<tuya>.js`. Nada más: ni `tests/doradas.json`, ni ESTADO/CODEMAP, ni el motor, ni `papel.js` (si de verdad falta una primitiva, añádela como función en tu propio archivo).
- No hagas commits ni push.
- Si una prueba falla por un archivo de **otra** familia (otro agente trabajando), espera 30 s y repite; no lo toques.
- Al terminar: `node tests/test_tipos.js --solo <familia>.` y `--full` de test_invariantes con tu prefijo.
- Informe final **breve** (máx. 10 líneas): tipos portados, fichas comprobadas, diferencias con el motor que no hayas podido resolver o decisiones dudosas.
