# Charta — Esquema JSON v1 (borrador)

> La ficha es **datos**. Charta la genera; Tabula y Fori solo la leen (sin motor).
> Cambios incompatibles → subir `schemaVersion`. Campos nuevos opcionales → no hace falta.

## Ficha
```json
{
  "schemaVersion": 1,
  "app": "charta",
  "id": "f_8Kq2…",                 // lo pone Firestore al guardar (/apps/charta/fichas/{id})
  "titulo": "Sumas hasta 20 y restas en la recta",
  "curso": 1, "area": "matematicas",
  "creada": "2026-11-05T10:00:00Z", "autor": "uid de Firebase",
  "semilla": 1234,
  "variantes": 1,                  // 1 = todas iguales; N = N variantes (A, B, C…)
  "metadatos": {                    // opcionales; sin códigos LOMLOE (decisión de Iván)
    "dificultad": 1,                // 1 refuerzo · 2 estándar · 3 ampliación
    "minutos": 15, "etiquetas": ["suma", "llevadas"]
  },
  "presentacion": { "color": true, "lecturaFacil": false, "pictogramas": false },
  "paginas": [                       // variante A; las demás en "variantesDatos" si variantes > 1
    { "actividades": [ /* Actividad */ ] }
  ],
  "variantesDatos": []               // [{ "semilla": …, "paginas": [...] }, …]
}
```
- **Sin datos de alumnos.** Los nombres solo se usan en el dispositivo al imprimir (cabecera con nombre o línea en blanco) y nunca se guardan.

## Actividad
```json
{
  "n": 1,
  "tipo": "sumar.h20", "tipoVersion": 1,   // id del registro de tipos (= id de MODELOS)
  "params": { "rango": 20, "nivel": "con" },
  "tamano": "media",                        // "completa" | "media"
  "color": "azul",                          // amarillo | rosa | azul | verde
  "enunciado": "Calcula y escribe el resultado en el cuadro gris.",
  "ejemplo": null,                          // ejercicio resuelto opcional, como en la muestra
  "ejercicios": [ /* Ejercicio */ ]
}
```

## Ejercicio
```json
{
  "id": "a1e3",
  "datos": { "a": 7, "b": 8, "op": "+" },        // lo que necesita el renderizado del tipo
  "solucion": { "huecos": [15] },                 // respuestas, en el orden de los huecos
  "pasos": ["7 + 3 = 10", "10 + 5 = 15"]          // opcional: solución paso a paso (Fori)
}
```
- `datos` y `solucion` los define cada tipo; su forma va documentada en el módulo del tipo.
- Cada tipo es un módulo con: `id`, `version`, `generar(params, rnd) → {enunciado, ejercicios}`
  y `render(actividad, modo)` con modos `papel` (A4), `pantalla` (Fori, un ejercicio cada vez) y `solucion`.

## Representaciones del número
Componentes SVG reutilizables (dedos, dado, dominó, marco de diez, palotes, objetos, regletas,
descomposición, letras, recta, bloques, cuadrícula, monedas, ábaco, D/U, atados):
`{"rep": "marco", "n": 7}` dentro de `datos`. También servirán a Barri, Calculi y Fori.

## Documento en Firestore (paso 5.1)
`/apps/charta/fichas/{id}` (id = el del documento; la ficha lleva `id`, `autor` y `creada` al leerla):
```json
{ "schemaVersion": 1, "app": "charta", "autor": "uid", "titulo": "…", "creada": "2026-11-05T10:00:00Z",
  "tipos": ["sumar.h20"], "variantes": 2,
  "ficha": "{…JSON de la ficha…}",      // texto: Firestore no admite listas dentro de listas
  "composicion": "{…}" }                // actividades + opciones, semilla, título, variaciones, B/N (para reabrirla en Charta)
```
- Leer (Tabula, Fori): `fichaDeDocumento(datos, id)` de `src/nucleo/lector.js` → ficha comprobada con `erroresFicha()`.
- Reglas: bloque «Charta» de `firestore.rules` (copia de `tabula/firestore.rules`): solo el autor (Google) lee, cambia y borra; campos y tamaños fijos (ficha ≤ 900.000 caracteres; 30 variantes ≈ 110 KB).

## Enlace con Tabula por URL (paso 5.2)
- Tabula → Charta: `../Charta/?desde=tabula[&grupo=G][&sesion=S][&tarea=T]` (crear) · `?ficha=ID` o `?comp=B64[&grupo=G]` (abrir). Charta lee la lista del grupo en el almacén de Tabula: los nombres nunca van en la URL.
- Fori (paso 5.3): Charta → `/fori/?charta=1` con `localStorage["charta:aFori"]` = `{ "v": 1, "app": "charta", "titulo", "diapositivas": [{ "etq", "svg", "n" }] }` (SVG 1600×900 con la solución; paso K = `class="cs pK"`; `/*PASOS*/` en su `<style>` ← `cssPasos(k, n)`). Fori → Charta: `../Charta/?ficha=ID|comp=B64&a=fori`. `pasos` de cada ejercicio sigue siendo opcional: Fori corrige con las marcas de la solución.
- Charta → Tabula: `/tabula/?charta=B64` con `{ "v": 1, "id"?, "titulo", "tipos", "comp", "grupo"?, "sesion"?, "tarea"? }` (B64 = base64url de JSON UTF-8, sin «=»).
- En Tabula, documento `{ tipo: "charta", charta: { id?, tipos, comp }, groupId, … }`; sesiones y tareas lo enlazan en `documentoIds`.
