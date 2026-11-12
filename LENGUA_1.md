# Charta · Lengua de 1.º — Guion de tipología de fichas

> Guion aprobado antes de programar (como se hizo con Matemáticas). Lote 0 hecho (5-11-2026): catálogo por materia, léxico, reglas y ayudantes de dibujo (ver CODEMAP.md). Ningún modelo programado todavía.
> Decisiones de Iván (5-11-2026): letra **Fredoka**; el alumnado escribe en **imprenta (script)** con **pauta doble (Lamela)**; sin LOMLOE (solo dificultad, minutos y etiquetas); todo en el dispositivo, sin conexión y sin tokens. El orden de las letras y los pictogramas, **pendientes**.

## Leyenda
- **C / M**: admite página completa / media página.
- ⚙ **Se genera solo**, con el léxico y las reglas de la app (sílabas, género, plural, rimas, campos léxicos).
- 📚 Sale de un **banco** escrito una sola vez (textos, adivinanzas, contrarios). Va dentro de la app: no gasta tokens al usarse.
- 🖼 **Necesita pictogramas o dibujos** (Fase 6, pendiente). Si el modelo tiene versión sin dibujo, se dice.
- ✍ **Necesita pauta de caligrafía** (Lamela) y letras de repasar.

---

## 1. La letra Fredoka y la caligrafía

### Comprobado en Fredoka
- La **«a»** y la **«g»** son de **un piso** (como las que escribe a mano el alumnado): buenas para leer. La «ñ», las tildes y la «ü» están.
- **Problema**: la **«I» mayúscula** y la **«l» minúscula** son el mismo palo («Isla» se lee «lsla»). Solución: las palabras salen en minúscula por defecto. Las que empiezan por «I» mayúscula no entran en los modelos de lectura (sí en los de mayúsculas, donde se ven por parejas «I – i»).
- La «b», la «d», la «p» y la «q» son simétricas, como en cualquier letra escolar. Se usan a propósito como distractoras (opción «Letras que se confunden»).

### Pauta de caligrafía: propuesta
Fredoka es letra de imprenta, pero es un **contorno** (al repasarla saldría un doble trazo) y no encaja con las líneas de una pauta. Por eso:
1. **Pauta Lamela dibujada en SVG** (`src/lengua/pauta.js`): renglones de dos líneas (la de abajo, más marcada, es la base; la de arriba marca el cuerpo de la letra). Las astas y los rabos ocupan el espacio entre renglones, con una línea fina opcional. Tamaños de cuerpo: **5 mm** (por defecto), 4 mm y 3,5 mm. Medidas reales en el papel (comprobarlas imprimiendo).
2. **Letras de trazo propias** (`src/lengua/trazos.js`): un alfabeto de una sola línea (minúsculas, mayúsculas, ñ, tildes y números) dibujado con las formas de Fredoka (a y g de un piso), en unidades de la pauta (cuerpo = 1, asta = 0,8, rabo = 0,8). Así encaja exactamente en la pauta y se puede pintar como:
   - **Modelo**: negro, con un **punto verde de inicio** y **flechas numeradas** con el orden de los trazos.
   - **Repaso**: gris claro o punteado (opción).
   - Espacio para que escriba el alumno.
3. Fredoka sigue en los enunciados y en las palabras de lectura. Las letras de trazo solo van dentro de la pauta.

---

## 2. Opciones comunes (en lenguaje de maestro)
- **Letras**: «Todas» · «Hasta la …» (cuando Iván pase el orden: solo palabras con las letras ya vistas, como «Números: hasta el N» en Matemáticas) · «Con la letra nueva» (todas las palabras llevan la última letra vista).
- **Tipo de sílabas**: «Directas (ma, pe)» · «Con inversas (al, en)» · «Con trabadas (pla, bra)» · «Con mixtas (con, sol)».
- **Largo de las palabras**: 1 · 2 · 3 · 4 sílabas · variadas.
- **Letra**: minúscula · mayúscula inicial · MAYÚSCULAS.
- Comunes de Charta: tamaño (C/M), color, letra grande, lectura fácil, variantes A/B/C.

---

## 3. Bloques y modelos

### Bloque 1 · Conciencia fonológica
- **`fono.silabas` · Cuenta las sílabas** (C/M) ⚙ · 🖼 opcional
  Palabra (o dibujo) y casillas: el alumno colorea una por cada palmada o escribe el número.
  Opciones: sílabas 1–4 · respuesta: colorear casillas / escribir el número · con dibujo (cuando haya pictogramas).
  Corrección: número de sílabas (casillas coloreadas en rojo).
- **`fono.inicial` · ¿Por qué suena?** (C/M) ⚙ · 🖼 opcional
  Palabra con la primera letra en hueco (o dibujo) y tres letras para rodear.
  Opciones: posición: principio / final · letras: vocales / consonantes / todas.
  Corrección: la letra rodeada.
- **`fono.posicion` · ¿Dónde está el sonido?** (C/M) ⚙
  Palabra y tres casillas (principio, en medio, al final): marca dónde está la letra pedida.
  Corrección: la casilla marcada.
- **`fono.rimas` · Une las que riman** (C) ⚙ · 🖼 opcional
  Dos columnas de palabras: une las que terminan igual (gato – pato).
  Opciones: rima: última sílaba / desde la vocal fuerte · nº de parejas 4–6.
  Corrección: líneas de unión.
- **`fono.quita` · Quita una sílaba** (C/M) ⚙
  «Si a ca-sa le quito ca, queda ___». Opciones: quitar la primera / la última sílaba.
  Corrección: la sílaba o palabra que queda.
- **`fono.larga` · La palabra más larga** (C/M) ⚙
  Grupos de tres palabras: rodea la que tiene más (o menos) sílabas.
  Corrección: la palabra rodeada.

### Bloque 2 · Letras y sonidos
- **`letra.busca` · Rodea la letra** (C/M) ⚙
  Filas de letras sueltas con la letra pedida mezclada.
  Opciones: letra (una o «la nueva») · distractoras: al azar / letras que se confunden (b-d-p-q, m-n, u-n) · minúscula/mayúscula.
  Corrección: las letras rodeadas.
- **`letra.enpalabras` · Rodea la letra en las palabras** (C/M) ⚙
  Lista de palabras; rodea la letra pedida en cada una (y cuántas veces sale).
  Corrección: letras rodeadas y número.
- **`letra.falta` · Pon la letra que falta** (C/M) ⚙
  m_sa, _ato… con tres letras para elegir o sin ayuda.
  Opciones: con / sin letras para elegir · hueco: primera / cualquier letra.
  Corrección: la letra.
- **`letra.vocales` · Completa las vocales** (C/M) ⚙
  p_l_t_ → pelota. Opciones: faltan todas / una / al azar.
  Corrección: las vocales.
- **`letra.parejas` · Mayúscula y minúscula** (C) ⚙
  Une cada mayúscula con su minúscula (o escribe la que falta).
  Opciones: unir / escribir · letras: vistas / todas.
  Corrección: líneas o letras.
- **`letra.abecedario` · Antes y después** (C/M) ⚙
  Como `conteo.anterior`, con el abecedario (con ñ): la letra de antes, la de después o las dos.
  Corrección: las letras.

### Bloque 3 · Sílabas
- **`silaba.tabla` · Lee las sílabas** (C) ⚙
  Tabla de lectura (ma me mi mo mu, am em…), filas mezcladas.
  Opciones: letra · tipo de sílabas · ordenadas / mezcladas.
  Corrección: no hay respuesta escrita (lectura en voz alta). Sirve para Fori.
- **`silaba.junta` · Junta las sílabas** (C/M) ⚙
  ca + sa = ___ (o une columnas de sílabas para formar palabras).
  Opciones: escribir / unir · 2–3 sílabas.
  Corrección: la palabra.
- **`silaba.separa` · Separa en sílabas** (C/M) ⚙
  pelota → [pe] [lo] [ta], una casilla por sílaba (o con rayas).
  Opciones: casillas / rayas · sílabas 2–4 · tipo de sílabas.
  Corrección: las sílabas.
- **`silaba.ordena` · Ordena las sílabas** (C/M) ⚙
  ta · pe · lo → pelota. Corrección: la palabra.
- **`silaba.falta` · Pon la sílaba que falta** (C/M) ⚙
  pe__ta, con tres sílabas para elegir o sin ayuda.
  Corrección: la sílaba.

### Bloque 4 · Palabras
- **`palabra.intrusa` · La que no es del grupo** (C/M) ⚙
  Grupos de cuatro palabras de un campo léxico con una intrusa: rodéala.
  Opciones: campos (animales, comida, ropa, casa, escuela, cuerpo, juguetes, transportes, familia, naturaleza, colores).
  Corrección: la palabra rodeada.
- **`palabra.clasifica` · Cada palabra en su caja** (C) ⚙
  Banco de palabras y dos o tres cajas con el nombre del grupo.
  Corrección: las palabras de cada caja.
- **`palabra.letras` · Ordena las letras** (C/M) ⚙
  o · g · t · a → gato. Opciones: 3–5 letras · con la primera letra marcada.
  Corrección: la palabra.
- **`palabra.cuenta` · ¿Cuántas letras?** (C/M) ⚙
  Palabra y hueco para el número (o casillas, una por letra).
  Corrección: el número.
- **`palabra.articulo` · el, la, los, las** (C/M) ⚙
  Pon el artículo: ___ gato. Opciones: el/la · un/una · con plurales.
  Corrección: el artículo.
- **`palabra.plural` · Uno y muchos** (C/M) ⚙
  gato → gatos, flor → flores. Opciones: solo -s / -s y -es · al revés (de muchos a uno).
  Corrección: la palabra.
- **`palabra.contrarios` · Los contrarios** (C/M) 📚
  Une o escribe el contrario (grande – pequeño). Banco de unos 40 pares.
  Corrección: líneas o palabra.
- **`palabra.sopa` · Sopa de letras** (C) ⚙
  6–8 palabras de un campo léxico; horizontal y vertical (opción diagonal).
  Corrección: palabras rodeadas.
- **`palabra.dibuja` · Leo y dibujo** (C/M) ⚙ — añadido el 12-11-2026 a petición de Iván. Palabra y recuadro vacío para dibujar lo que dice (no necesita pictogramas). Opciones: sílabas 1–3 · tipo de sílabas · letra. Corrección: ninguna (dibujo libre).
- **`palabra.dibujo` · Une la palabra con su dibujo** (C/M) 🖼 (Fase 6)
- **`palabra.crucigrama` · Crucigrama con dibujos** (C) 🖼 (Fase 6)

### Bloque 5 · Frases
- **`frase.ordena` · Ordena la frase** (C/M) ⚙
  come · gato · el → El gato come. Plantillas con concordancia (artículo + nombre + verbo + complemento).
  Opciones: 3–5 palabras · con la primera palabra marcada (mayúscula).
  Corrección: la frase.
- **`frase.separa` · Separa las palabras** (C/M) ⚙
  elgatocome → el / gato / come (con rayas o reescribiendo).
  Corrección: rayas en su sitio.
- **`frase.completa` · Completa la frase** (C/M) ⚙
  El ___ ladra. (perro · mesa · luna). Corrección: la palabra.
- **`frase.verdad` · ¿Sí o no?** (C/M) ⚙
  El pez nada. → Sí. La vaca vuela. → No. Pequeña base de datos de lo que hace cada animal o cosa.
  Corrección: Sí / No rodeado.
- **`frase.puntua` · Mayúscula y punto** (C/M) ⚙
  la niña salta → La niña salta. (rodear lo que falta o escribirla bien).
  Corrección: la frase bien escrita.
- **`frase.dibujo` · Lee y rodea el dibujo** (C/M) 🖼 (Fase 6)

### Bloque 6 · Ortografía básica
- **`orto.elige` · Elige la letra** (C/M) ⚙
  ca_po (m/n), pe_o (r/rr), _eso (qu/c)… Una regla por ficha o mezcladas.
  Opciones (regla): m antes de p y b · r / rr · c / qu · g / gu · c / z · mezcladas.
  Corrección: la letra.
- **`orto.mayuscula` · Nombres con mayúscula** (C/M) ⚙
  Rodea las palabras que llevan mayúscula (nombres de personas, mascotas, pueblos) o escríbelas bien.
  Corrección: palabras rodeadas o reescritas.

### Bloque 7 · Comprensión lectora
- **`lectura.texto` · Lee y responde** (C; M solo nivel 1) ⚙
  Texto breve hecho con plantillas (personaje, mascota, lugar, color, comida, acción) y preguntas automáticas: elegir entre tres, sí/no y completar.
  Opciones: nivel 1 (2 frases) · 2 (4 frases) · 3 (cuento corto) · tipo de preguntas.
  Corrección: respuestas de cada pregunta.
- **`lectura.ordena` · Ordena la historia** (C/M) 📚
  Tres o cuatro frases de una secuencia (rutinas, recetas, cuentos): numéralas.
  Corrección: el orden.
- **`lectura.instrucciones` · Lee y colorea** (C/M) ⚙
  «Colorea de rojo la estrella grande.» Con las figuras que ya dibuja Charta (círculo, estrella, cuadrado, triángulo): **no necesita pictogramas**. Con dibujos de objetos, cuando haya pictogramas 🖼.
  Corrección: figuras coloreadas en la solución.
- **`lectura.adivinanza` · Adivinanzas** (C/M) 📚 · 🖼 opcional
  Adivinanza corta y respuesta escrita (o rodear el dibujo, Fase 6).
  Corrección: la respuesta.
- **`lectura.fluidez` · Lectura rápida** (C) ⚙
  Lista de palabras o frases numeradas para leer en un minuto, con casilla de palabras leídas.
  Corrección: no hay; en pantalla, el total de palabras. Útil en Fori.

### Bloque 8 · Escritura y caligrafía ✍ (todo con pauta Lamela)
- **`escritura.trazos` · Trazos** (C/M) ✍
  Grafomotricidad: líneas, ondas, bucles, puentes, zigzag (punto de inicio y repaso).
  Opciones: tipo de trazo · tamaño de pauta. Corrección: no hay.
- **`escritura.letra` · Repasa y escribe la letra** (C/M) ✍
  Modelo con flechas, filas de repaso y filas libres.
  Opciones: letra · minúscula / mayúscula / las dos · repaso gris / punteado · filas de repaso 1–3.
  Corrección: no hay (modelo en pantalla).
- **`escritura.palabras` · Copia palabras** (C/M) ✍ ⚙
  Palabras con la letra o sílaba trabajada: modelo + repaso + copia.
  Corrección: no hay.
- **`escritura.frase` · Copia la frase** (C/M) ✍ ⚙
  Frase de las plantillas, con mayúscula y punto. Corrección: no hay.
- **`escritura.dictado` · Hoja de dictado** (C/M) ✍ ⚙
  Renglones numerados; la maestra dicta. **La lista dictada solo sale en pantalla** (solucionario y Fori).
  Opciones: palabras / frases · número 5–10 · letras vistas.
  Corrección: la lista.
- **`escritura.libre` · Escribe una frase** (C/M) ✍
  «Escribe qué hace…» con la frase empezada. Corrección: abierta (ejemplo en pantalla).
- **`escritura.ordena` · Miro y escribo** (C/M) ✍ ⚙ — añadido el 12-11-2026 a petición de Iván. Tarjeta con **espacio en blanco** para el dibujo (Iván lo pega), letras desordenadas en casillas y un renglón de pauta Lamela de cuatro líneas. Opciones: letras 3–6 · tipo de sílabas · minúscula/MAYÚSCULA · pauta. Corrección: la palabra, solo en pantalla.
- **`escritura.nombre` · Escribe el nombre del dibujo** (C/M) ✍ 🖼 (Fase 6)

**Total**: 47 modelos; 43 se pueden hacer ya y 4 esperan a los pictogramas (otros 4 tendrán además versión con dibujo).

---

## 4. Qué se genera en el dispositivo (sin conexión ni tokens)
- **Léxico** (`datos/lexico_1.tsv` → `src/lengua/lexico.js`, generado en la compilación): unas 1.200 palabras de 1.º con género, categoría (nombre, verbo, adjetivo), campos léxicos, «se puede dibujar» y frecuencia. Lo redacto una vez (con Sonnet) e Iván puede revisarlo y añadir palabras.
- **Reglas en JS**: silabeo (el español es regular: se prueba contra una lista hecha a mano), tipo de sílaba, letras de cada palabra, rima, plural, artículo, reglas de ortografía (m/p/b, r/rr, c/qu, g/gu, c/z), filtro de letras vistas.
- **Plantillas**: frases con concordancia, textos de comprensión con preguntas, frases «¿sí o no?».
- **Bancos fijos**: contrarios, secuencias para ordenar, adivinanzas.
- **Invariantes** (como en Matemáticas, obligatorias por tipo): cada palabra está en el léxico; el silabeo coincide con la lista de control; se respetan las letras vistas, el tipo de sílaba y el número de sílabas; concordancia de género y número; solución única (una sola letra o sílaba válida en cada hueco); sin repetir palabras en una ficha.

## 5. Encaje técnico
- Declaración en `motor/modelos_lengua.py` (como `modelos_app.py`): `materia: "lengua"`, sin rango numérico (como geometría) y bloques propios de la materia (hoy `BLOQUES` es único: hay que separarlo por materia en `tools/catalogo.py` y en el selector).
- Familias nuevas: `fono`, `letra`, `silaba`, `palabra`, `frase`, `orto`, `lectura`, `escritura` (no chocan con las de Matemáticas).
- **Fredoka por defecto en Lengua** (letra por materia; el selector de letra sigue funcionando).
- Soluciones como en la Fase 3: huecos con texto; `rodea`, `une` y `colorea` en campos propios de `solucion`; los de lectura en voz alta o escritura libre, sin huecos.

---

## 6. Orden de construcción por lotes
| Lote | Contenido | Quién |
|---|---|---|
| 0 | Materia Lengua en el catálogo (bloques por materia, sin rango, Fredoka por defecto); léxico, silabeo y reglas con sus pruebas; ayudantes de dibujo (palabra con huecos, casillas de sílabas, rodear, unir). | Opus (diseño) + Sonnet (léxico) |
| 1 | Sílabas y letras: `silaba.*` (5) y `letra.*` (6). | Sonnet |
| 2 | Palabras, ortografía y fonología sin dibujos: `palabra.*` (8), `orto.*` (2), `fono.*` (6, versión escrita). | Sonnet |
| 3 | Frases: `frase.*` (5). | Sonnet |
| 4 | Pauta Lamela y letras de trazo (prueba impresa de Iván: medidas en mm) y `escritura.*` (6). | Opus (pauta y 3 letras de muestra) + Sonnet (resto del alfabeto) |
| 5 | Comprensión: `lectura.*` (5). | Sonnet |
| 6 | Con pictogramas (cuando se decida la Fase 6): los 4 modelos solo 🖼 y la versión con dibujo de `fono.*`. | — |

Al cerrar cada lote: `npm test`, hoja de contactos de las medias y prueba de Iván en el Android.

## 7. Decidido y pendiente de Iván
- **Tamaño de pauta**: 5 mm por defecto (decidido el 5-11-2026); 4 y 3,5 mm como opciones.
- **Orden de las letras** de su método: lo pasará más adelante. Hasta entonces, «Letras: todas».
- **Pictogramas**: aparcados (Fase 6). Los modelos 🖼 quedan fuera de los lotes 0–5.
