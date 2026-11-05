// GENERADO por tools/catalogo.py desde motor/modelos.py. No editar a mano.
export const CATALOGO = {
 "cursos": {
  "1": "1.º de Primaria"
 },
 "materias": {
  "matematicas": "Matemáticas",
  "lengua": "Lengua"
 },
 "bloques": {
  "matematicas": {
   "1": "Los números y sus representaciones",
   "2": "Contar y series",
   "3": "Orden y comparación",
   "4": "Valor posicional",
   "5": "Sumar",
   "6": "Restar",
   "7": "Juegos numéricos",
   "8": "Problemas",
   "9": "Geometría",
   "10": "Medida",
   "11": "Estadística y patrones",
   "12": "Trucos de cálculo mental"
  },
  "lengua": {
   "1": "Conciencia fonológica",
   "2": "Letras y sonidos",
   "3": "Sílabas",
   "4": "Palabras",
   "5": "Frases",
   "6": "Ortografía básica",
   "7": "Comprensión lectora",
   "8": "Escritura y caligrafía"
  }
 },
 "fuentes": {
  "lengua": "fredoka"
 },
 "modelos": [
  {
   "id": "rep.dedos",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 1,
   "familia": "rep",
   "clave": "dedos",
   "nombre": "Los dedos",
   "descripcion": "Leer y dibujar números con los dedos de las manos.",
   "opciones": [
    {
     "id": "lectura",
     "etiqueta": "Solo leer (sin la fila de dibujar)",
     "tipo": "si_no",
     "defecto": false
    }
   ],
   "rangos": [
    10
   ],
   "rango": 10,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "LOS DEDOS",
   "color": "azul",
   "metadatos": {
    "dificultad": 1,
    "minutos": 8,
    "etiquetas": [
     "números",
     "representación",
     "dedos"
    ]
   }
  },
  {
   "id": "rep.dado",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 1,
   "familia": "rep",
   "clave": "dado",
   "nombre": "El dado",
   "descripcion": "Leer y dibujar números con puntos de uno o dos dados.",
   "opciones": [
    {
     "id": "lectura",
     "etiqueta": "Solo leer (sin la fila de dibujar)",
     "tipo": "si_no",
     "defecto": false
    }
   ],
   "rangos": [
    10,
    20
   ],
   "rango": 10,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "EL DADO",
   "color": "azul",
   "metadatos": {
    "dificultad": 1,
    "minutos": 8,
    "etiquetas": [
     "números",
     "representación",
     "dado",
     "puntos"
    ]
   }
  },
  {
   "id": "rep.domino",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 1,
   "familia": "rep",
   "clave": "domino",
   "nombre": "El dominó",
   "descripcion": "Leer y dibujar números como fichas de dominó.",
   "opciones": [
    {
     "id": "lectura",
     "etiqueta": "Solo leer (sin la fila de dibujar)",
     "tipo": "si_no",
     "defecto": false
    }
   ],
   "rangos": [
    10,
    20
   ],
   "rango": 10,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "EL DOMINÓ",
   "color": "azul",
   "metadatos": {
    "dificultad": 1,
    "minutos": 10,
    "etiquetas": [
     "números",
     "representación",
     "dominó",
     "puntos"
    ]
   }
  },
  {
   "id": "rep.marco",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 1,
   "familia": "rep",
   "clave": "marco",
   "nombre": "El marco de diez",
   "descripcion": "Leer y rellenar marcos de diez.",
   "opciones": [
    {
     "id": "lectura",
     "etiqueta": "Solo leer (sin la fila de dibujar)",
     "tipo": "si_no",
     "defecto": false
    }
   ],
   "rangos": [
    10,
    20,
    30,
    40
   ],
   "rango": 10,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "EL MARCO DE DIEZ",
   "color": "azul",
   "metadatos": {
    "dificultad": 1,
    "minutos": 8,
    "etiquetas": [
     "números",
     "representación",
     "marco",
     "decenas"
    ]
   }
  },
  {
   "id": "rep.palotes",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 1,
   "familia": "rep",
   "clave": "palotes",
   "nombre": "Los palotes",
   "descripcion": "Contar y dibujar palotes en grupos de cinco.",
   "opciones": [
    {
     "id": "lectura",
     "etiqueta": "Solo leer (sin la fila de dibujar)",
     "tipo": "si_no",
     "defecto": false
    }
   ],
   "rangos": [
    10,
    20,
    30
   ],
   "rango": 10,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "LOS PALOTES",
   "color": "azul",
   "metadatos": {
    "dificultad": 1,
    "minutos": 8,
    "etiquetas": [
     "números",
     "representación",
     "palotes",
     "contar"
    ]
   }
  },
  {
   "id": "rep.objetos",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 1,
   "familia": "rep",
   "clave": "objetos",
   "nombre": "Los objetos",
   "descripcion": "Contar y dibujar colecciones de objetos.",
   "opciones": [
    {
     "id": "lectura",
     "etiqueta": "Solo leer (sin la fila de dibujar)",
     "tipo": "si_no",
     "defecto": false
    }
   ],
   "rangos": [
    10,
    20,
    30
   ],
   "rango": 10,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "LOS OBJETOS",
   "color": "azul",
   "metadatos": {
    "dificultad": 1,
    "minutos": 8,
    "etiquetas": [
     "números",
     "representación",
     "contar objetos"
    ]
   }
  },
  {
   "id": "rep.regletas",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 1,
   "familia": "rep",
   "clave": "regletas",
   "nombre": "Las regletas",
   "descripcion": "Leer y dibujar números con regletas.",
   "opciones": [
    {
     "id": "lectura",
     "etiqueta": "Solo leer (sin la fila de dibujar)",
     "tipo": "si_no",
     "defecto": false
    }
   ],
   "rangos": [
    10,
    20,
    30
   ],
   "rango": 10,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "LAS REGLETAS",
   "color": "azul",
   "metadatos": {
    "dificultad": 2,
    "minutos": 10,
    "etiquetas": [
     "números",
     "representación",
     "regletas",
     "decenas"
    ]
   }
  },
  {
   "id": "rep.descomp",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 1,
   "familia": "rep",
   "clave": "descomp",
   "nombre": "La descomposición",
   "descripcion": "Descomponer números en sumas.",
   "opciones": [
    {
     "id": "lectura",
     "etiqueta": "Solo leer (sin la fila de dibujar)",
     "tipo": "si_no",
     "defecto": false
    }
   ],
   "rangos": [
    10,
    20,
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    100
   ],
   "rango": 10,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "LA DESCOMPOSICIÓN",
   "color": "azul",
   "metadatos": {
    "dificultad": 2,
    "minutos": 12,
    "etiquetas": [
     "números",
     "representación",
     "descomposición",
     "decenas unidades"
    ]
   }
  },
  {
   "id": "rep.letras",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 1,
   "familia": "rep",
   "clave": "letras",
   "nombre": "El número en letras",
   "descripcion": "Pasar de número a letras y al revés.",
   "opciones": [
    {
     "id": "lectura",
     "etiqueta": "Solo leer (sin la fila de dibujar)",
     "tipo": "si_no",
     "defecto": false
    }
   ],
   "rangos": [
    10,
    20,
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    100
   ],
   "rango": 10,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "EL NÚMERO EN LETRAS",
   "color": "azul",
   "metadatos": {
    "dificultad": 2,
    "minutos": 12,
    "etiquetas": [
     "números",
     "representación",
     "escritura",
     "letras"
    ]
   }
  },
  {
   "id": "rep.recta",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 1,
   "familia": "rep",
   "clave": "recta",
   "nombre": "La recta numérica",
   "descripcion": "Leer y marcar números en la recta.",
   "opciones": [
    {
     "id": "lectura",
     "etiqueta": "Solo leer (sin la fila de dibujar)",
     "tipo": "si_no",
     "defecto": false
    }
   ],
   "rangos": [
    10,
    20,
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    100
   ],
   "rango": 10,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "LA RECTA NUMÉRICA",
   "color": "azul",
   "metadatos": {
    "dificultad": 2,
    "minutos": 10,
    "etiquetas": [
     "números",
     "representación",
     "recta numérica"
    ]
   }
  },
  {
   "id": "rep.bloques",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 1,
   "familia": "rep",
   "clave": "bloques",
   "nombre": "Los bloques de base diez",
   "descripcion": "Leer y dibujar números con barras y cubos.",
   "opciones": [
    {
     "id": "lectura",
     "etiqueta": "Solo leer (sin la fila de dibujar)",
     "tipo": "si_no",
     "defecto": false
    }
   ],
   "rangos": [
    10,
    20,
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    100
   ],
   "rango": 10,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "LOS BLOQUES DE BASE DIEZ",
   "color": "azul",
   "metadatos": {
    "dificultad": 2,
    "minutos": 12,
    "etiquetas": [
     "números",
     "representación",
     "bloques",
     "decenas unidades"
    ]
   }
  },
  {
   "id": "rep.cuadricula",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 1,
   "familia": "rep",
   "clave": "cuadricula",
   "nombre": "La cuadrícula de 100",
   "descripcion": "Leer y colorear números en la cuadrícula.",
   "opciones": [
    {
     "id": "lectura",
     "etiqueta": "Solo leer (sin la fila de dibujar)",
     "tipo": "si_no",
     "defecto": false
    }
   ],
   "rangos": [
    10,
    20,
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    100
   ],
   "rango": 10,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "LA CUADRÍCULA DE 100",
   "color": "azul",
   "metadatos": {
    "dificultad": 2,
    "minutos": 10,
    "etiquetas": [
     "números",
     "representación",
     "cuadrícula cien"
    ]
   }
  },
  {
   "id": "rep.monedas",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 1,
   "familia": "rep",
   "clave": "monedas",
   "nombre": "Las monedas",
   "descripcion": "Leer y dibujar cantidades con monedas.",
   "opciones": [
    {
     "id": "lectura",
     "etiqueta": "Solo leer (sin la fila de dibujar)",
     "tipo": "si_no",
     "defecto": false
    }
   ],
   "rangos": [
    10,
    20,
    30,
    40,
    50,
    60,
    70
   ],
   "rango": 10,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "LAS MONEDAS",
   "color": "azul",
   "metadatos": {
    "dificultad": 2,
    "minutos": 12,
    "etiquetas": [
     "números",
     "representación",
     "monedas",
     "dinero"
    ]
   }
  },
  {
   "id": "rep.abaco",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 1,
   "familia": "rep",
   "clave": "abaco",
   "nombre": "El ábaco",
   "descripcion": "Leer y dibujar números en el ábaco.",
   "opciones": [
    {
     "id": "lectura",
     "etiqueta": "Solo leer (sin la fila de dibujar)",
     "tipo": "si_no",
     "defecto": false
    }
   ],
   "rangos": [
    10,
    20,
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    100
   ],
   "rango": 10,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "EL ÁBACO",
   "color": "azul",
   "metadatos": {
    "dificultad": 2,
    "minutos": 12,
    "etiquetas": [
     "números",
     "representación",
     "ábaco",
     "decenas unidades"
    ]
   }
  },
  {
   "id": "rep.du",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 1,
   "familia": "rep",
   "clave": "du",
   "nombre": "Las decenas y unidades",
   "descripcion": "Leer y completar decenas y unidades.",
   "opciones": [
    {
     "id": "lectura",
     "etiqueta": "Solo leer (sin la fila de dibujar)",
     "tipo": "si_no",
     "defecto": false
    }
   ],
   "rangos": [
    10,
    20,
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    100
   ],
   "rango": 10,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "LAS DECENAS Y UNIDADES",
   "color": "azul",
   "metadatos": {
    "dificultad": 2,
    "minutos": 10,
    "etiquetas": [
     "números",
     "representación",
     "decenas unidades"
    ]
   }
  },
  {
   "id": "rep.atados",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 1,
   "familia": "rep",
   "clave": "atados",
   "nombre": "Los palitos y atados",
   "descripcion": "Leer y dibujar números con atados de diez.",
   "opciones": [
    {
     "id": "lectura",
     "etiqueta": "Solo leer (sin la fila de dibujar)",
     "tipo": "si_no",
     "defecto": false
    }
   ],
   "rangos": [
    10,
    20,
    30,
    40,
    50,
    60,
    70
   ],
   "rango": 10,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "LOS PALITOS Y ATADOS",
   "color": "azul",
   "metadatos": {
    "dificultad": 2,
    "minutos": 12,
    "etiquetas": [
     "números",
     "representación",
     "decenas",
     "atados"
    ]
   }
  },
  {
   "id": "combinada.combinada",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 1,
   "familia": "combinada",
   "clave": "combinada",
   "nombre": "¿Qué número es?",
   "descripcion": "Cada casilla, una representación distinta: escribir el número.",
   "opciones": [],
   "rangos": [
    20,
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    100
   ],
   "rango": 20,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "¿QUÉ NÚMERO ES?",
   "color": "verde",
   "metadatos": {
    "dificultad": 3,
    "minutos": 20,
    "etiquetas": [
     "números",
     "representación",
     "repaso",
     "mezcla"
    ]
   }
  },
  {
   "id": "suma.suma",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 1,
   "familia": "suma",
   "clave": "suma",
   "nombre": "Suma y dibuja",
   "descripcion": "Sumar dos representaciones y dibujar el resultado.",
   "opciones": [],
   "rangos": [
    20,
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    100
   ],
   "rango": 20,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "SUMA Y DIBUJA",
   "color": "rosa",
   "metadatos": {
    "dificultad": 1,
    "minutos": 10,
    "etiquetas": [
     "sumar",
     "dibujos",
     "representación"
    ]
   }
  },
  {
   "id": "conteo.cuenta",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 2,
   "familia": "conteo",
   "clave": "cuenta",
   "nombre": "Cuenta y escribe",
   "descripcion": "Contar dibujos y escribir el número.",
   "opciones": [],
   "rangos": [
    10,
    20,
    30
   ],
   "rango": 10,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "CUENTA Y ESCRIBE",
   "color": "amarillo",
   "metadatos": {
    "dificultad": 1,
    "minutos": 8,
    "etiquetas": [
     "contar",
     "números"
    ]
   }
  },
  {
   "id": "conteo.anterior",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 2,
   "familia": "conteo",
   "clave": "anterior",
   "nombre": "Anterior y posterior",
   "descripcion": "Escribir el número de antes y el de después.",
   "opciones": [
    {
     "id": "modo",
     "etiqueta": "Qué se escribe",
     "tipo": "opcion",
     "defecto": null,
     "valores": [
      {
       "valor": null,
       "etiqueta": "Anterior y posterior"
      },
      {
       "valor": "anterior",
       "etiqueta": "Solo el anterior"
      },
      {
       "valor": "posterior",
       "etiqueta": "Solo el posterior"
      }
     ]
    }
   ],
   "rangos": [
    10,
    20,
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    100
   ],
   "rango": 10,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "ANTERIOR Y POSTERIOR",
   "color": "amarillo",
   "metadatos": {
    "dificultad": 1,
    "minutos": 8,
    "etiquetas": [
     "contar",
     "anterior",
     "posterior",
     "orden"
    ]
   }
  },
  {
   "id": "conteo.falta",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 2,
   "familia": "conteo",
   "clave": "falta",
   "nombre": "El número que falta",
   "descripcion": "Completar el número que falta en una fila.",
   "opciones": [
    {
     "id": "huecos",
     "etiqueta": "Cuadros vacíos",
     "tipo": "numero",
     "min": 1,
     "max": 3,
     "defecto": 1
    }
   ],
   "rangos": [
    10,
    20,
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    100
   ],
   "rango": 10,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "EL NÚMERO QUE FALTA",
   "color": "amarillo",
   "metadatos": {
    "dificultad": 1,
    "minutos": 8,
    "etiquetas": [
     "contar",
     "series",
     "número que falta"
    ]
   }
  },
  {
   "id": "conteo.serie1",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 2,
   "familia": "conteo",
   "clave": "serie1",
   "nombre": "Series de 1 en 1",
   "descripcion": "Completar series de uno en uno.",
   "opciones": [
    {
     "id": "huecos",
     "etiqueta": "Cuadros vacíos",
     "tipo": "numero",
     "min": 1,
     "max": 4,
     "defecto": 3
    }
   ],
   "rangos": [
    10,
    20,
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    100
   ],
   "rango": 10,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "SERIES DE 1 EN 1",
   "color": "amarillo",
   "metadatos": {
    "dificultad": 1,
    "minutos": 8,
    "etiquetas": [
     "contar",
     "series",
     "de 1 en 1"
    ]
   }
  },
  {
   "id": "conteo.serie2",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 2,
   "familia": "conteo",
   "clave": "serie2",
   "nombre": "Series de 2 en 2",
   "descripcion": "Completar series de dos en dos.",
   "opciones": [
    {
     "id": "huecos",
     "etiqueta": "Cuadros vacíos",
     "tipo": "numero",
     "min": 1,
     "max": 4,
     "defecto": 3
    }
   ],
   "rangos": [
    10,
    20,
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    100
   ],
   "rango": 10,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "SERIES DE 2 EN 2",
   "color": "amarillo",
   "metadatos": {
    "dificultad": 2,
    "minutos": 10,
    "etiquetas": [
     "contar",
     "series",
     "de 2 en 2",
     "pares"
    ]
   }
  },
  {
   "id": "conteo.serie5",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 2,
   "familia": "conteo",
   "clave": "serie5",
   "nombre": "Series de 5 en 5",
   "descripcion": "Completar series de cinco en cinco.",
   "opciones": [
    {
     "id": "huecos",
     "etiqueta": "Cuadros vacíos",
     "tipo": "numero",
     "min": 1,
     "max": 4,
     "defecto": 3
    }
   ],
   "rangos": [
    10,
    20,
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    100
   ],
   "rango": 10,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "SERIES DE 5 EN 5",
   "color": "amarillo",
   "metadatos": {
    "dificultad": 2,
    "minutos": 10,
    "etiquetas": [
     "contar",
     "series",
     "de 5 en 5"
    ]
   }
  },
  {
   "id": "conteo.serie10",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 2,
   "familia": "conteo",
   "clave": "serie10",
   "nombre": "Series de 10 en 10",
   "descripcion": "Completar series de diez en diez.",
   "opciones": [
    {
     "id": "huecos",
     "etiqueta": "Cuadros vacíos",
     "tipo": "numero",
     "min": 1,
     "max": 4,
     "defecto": 3
    }
   ],
   "rangos": [
    20,
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    100
   ],
   "rango": 20,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "SERIES DE 10 EN 10",
   "color": "amarillo",
   "metadatos": {
    "dificultad": 2,
    "minutos": 10,
    "etiquetas": [
     "contar",
     "series",
     "de 10 en 10",
     "decenas"
    ]
   }
  },
  {
   "id": "conteo.series",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 2,
   "familia": "conteo",
   "clave": "series",
   "nombre": "Series mixtas",
   "descripcion": "Series con saltos distintos: descubrir el salto y completar.",
   "opciones": [
    {
     "id": "huecos",
     "etiqueta": "Cuadros vacíos",
     "tipo": "numero",
     "min": 1,
     "max": 4,
     "defecto": 3
    }
   ],
   "rangos": [
    10,
    20,
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    100
   ],
   "rango": 10,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "SERIES MIXTAS",
   "color": "amarillo",
   "metadatos": {
    "dificultad": 3,
    "minutos": 12,
    "etiquetas": [
     "contar",
     "series",
     "mezcla"
    ]
   }
  },
  {
   "id": "conteo.tabla",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 2,
   "familia": "conteo",
   "clave": "tabla",
   "nombre": "La tabla de números",
   "descripcion": "Completar los números que faltan en la tabla.",
   "opciones": [
    {
     "id": "huecos",
     "etiqueta": "Cuadros vacíos",
     "tipo": "numero",
     "min": 3,
     "max": 30,
     "defecto": null
    }
   ],
   "rangos": [
    10,
    20,
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    100
   ],
   "rango": 10,
   "tamanos": [
    "completa"
   ],
   "titulo": "LA TABLA DE NÚMEROS",
   "color": "amarillo",
   "metadatos": {
    "dificultad": 2,
    "minutos": 12,
    "etiquetas": [
     "contar",
     "tabla del cien",
     "series"
    ]
   }
  },
  {
   "id": "conteo.camino",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 2,
   "familia": "conteo",
   "clave": "camino",
   "nombre": "El camino de números",
   "descripcion": "Seguir las flechas y completar los números.",
   "opciones": [
    {
     "id": "huecos",
     "etiqueta": "Cuadros vacíos",
     "tipo": "numero",
     "min": 3,
     "max": 20,
     "defecto": null
    }
   ],
   "rangos": [
    10,
    20,
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    100
   ],
   "rango": 10,
   "tamanos": [
    "completa"
   ],
   "titulo": "EL CAMINO DE NÚMEROS",
   "color": "amarillo",
   "metadatos": {
    "dificultad": 2,
    "minutos": 12,
    "etiquetas": [
     "contar",
     "series",
     "camino"
    ]
   }
  },
  {
   "id": "orden.mayor",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 3,
   "familia": "orden",
   "clave": "mayor",
   "nombre": "Mayor o menor",
   "descripcion": "Rodear el número mayor o el menor de cada pareja.",
   "opciones": [
    {
     "id": "modo",
     "etiqueta": "Qué se rodea",
     "tipo": "opcion",
     "defecto": null,
     "valores": [
      {
       "valor": null,
       "etiqueta": "Mezclado"
      },
      {
       "valor": "mayor",
       "etiqueta": "Solo el mayor"
      },
      {
       "valor": "menor",
       "etiqueta": "Solo el menor"
      }
     ]
    },
    {
     "id": "cerca",
     "etiqueta": "Números de la misma decena (más difícil, desde 20)",
     "tipo": "si_no",
     "defecto": false
    }
   ],
   "rangos": [
    10,
    20,
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    100
   ],
   "rango": 10,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "MAYOR O MENOR",
   "color": "verde",
   "metadatos": {
    "dificultad": 1,
    "minutos": 8,
    "etiquetas": [
     "orden",
     "comparar",
     "mayor",
     "menor"
    ]
   }
  },
  {
   "id": "orden.signos",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 3,
   "familia": "orden",
   "clave": "signos",
   "nombre": "Los signos < > =",
   "descripcion": "Escribir el signo entre dos números.",
   "opciones": [
    {
     "id": "modo",
     "etiqueta": "Parejas iguales",
     "tipo": "opcion",
     "defecto": null,
     "valores": [
      {
       "valor": null,
       "etiqueta": "Con algunas iguales (=)"
      },
      {
       "valor": "sin",
       "etiqueta": "Sin iguales"
      }
     ]
    },
    {
     "id": "cerca",
     "etiqueta": "Números de la misma decena (más difícil, desde 20)",
     "tipo": "si_no",
     "defecto": false
    }
   ],
   "rangos": [
    10,
    20,
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    100
   ],
   "rango": 10,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "LOS SIGNOS < > =",
   "color": "verde",
   "metadatos": {
    "dificultad": 2,
    "minutos": 10,
    "etiquetas": [
     "orden",
     "comparar",
     "signos"
    ]
   }
  },
  {
   "id": "orden.grupo",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 3,
   "familia": "orden",
   "clave": "grupo",
   "nombre": "El mayor y el menor",
   "descripcion": "Escribir el mayor y el menor de cada grupo.",
   "opciones": [
    {
     "id": "n",
     "etiqueta": "Números por grupo",
     "tipo": "numero",
     "min": 3,
     "max": 5,
     "defecto": 4
    },
    {
     "id": "cerca",
     "etiqueta": "Números de la misma decena (más difícil, desde 20)",
     "tipo": "si_no",
     "defecto": false
    }
   ],
   "rangos": [
    10,
    20,
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    100
   ],
   "rango": 10,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "EL MAYOR Y EL MENOR",
   "color": "verde",
   "metadatos": {
    "dificultad": 2,
    "minutos": 10,
    "etiquetas": [
     "orden",
     "comparar",
     "mayor",
     "menor"
    ]
   }
  },
  {
   "id": "orden.ordena1",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 3,
   "familia": "orden",
   "clave": "ordena1",
   "nombre": "Ordena de menor a mayor",
   "descripcion": "Ordenar números de menor a mayor.",
   "opciones": [
    {
     "id": "n",
     "etiqueta": "Números por grupo",
     "tipo": "numero",
     "min": 3,
     "max": 5,
     "defecto": 4
    },
    {
     "id": "cerca",
     "etiqueta": "Números de la misma decena (más difícil, desde 20)",
     "tipo": "si_no",
     "defecto": false
    }
   ],
   "rangos": [
    10,
    20,
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    100
   ],
   "rango": 10,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "ORDENA DE MENOR A MAYOR",
   "color": "verde",
   "metadatos": {
    "dificultad": 2,
    "minutos": 12,
    "etiquetas": [
     "orden",
     "ordenar",
     "menor a mayor"
    ]
   }
  },
  {
   "id": "orden.ordena2",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 3,
   "familia": "orden",
   "clave": "ordena2",
   "nombre": "Ordena de mayor a menor",
   "descripcion": "Ordenar números de mayor a menor.",
   "opciones": [
    {
     "id": "n",
     "etiqueta": "Números por grupo",
     "tipo": "numero",
     "min": 3,
     "max": 5,
     "defecto": 4
    },
    {
     "id": "cerca",
     "etiqueta": "Números de la misma decena (más difícil, desde 20)",
     "tipo": "si_no",
     "defecto": false
    }
   ],
   "rangos": [
    10,
    20,
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    100
   ],
   "rango": 10,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "ORDENA DE MAYOR A MENOR",
   "color": "verde",
   "metadatos": {
    "dificultad": 2,
    "minutos": 12,
    "etiquetas": [
     "orden",
     "ordenar",
     "mayor a menor"
    ]
   }
  },
  {
   "id": "orden.entre",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 3,
   "familia": "orden",
   "clave": "entre",
   "nombre": "Un número entre dos",
   "descripcion": "Escribir un número que esté entre otros dos.",
   "opciones": [],
   "rangos": [
    10,
    20,
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    100
   ],
   "rango": 10,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "UN NÚMERO ENTRE DOS",
   "color": "verde",
   "metadatos": {
    "dificultad": 3,
    "minutos": 10,
    "etiquetas": [
     "orden",
     "número entre dos"
    ]
   }
  },
  {
   "id": "orden.ordinales",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 3,
   "familia": "orden",
   "clave": "ordinales",
   "nombre": "Los ordinales",
   "descripcion": "Primero, segundo, tercero…: colorear o decir el lugar.",
   "opciones": [
    {
     "id": "modo",
     "etiqueta": "Tarea",
     "tipo": "opcion",
     "defecto": null,
     "valores": [
      {
       "valor": null,
       "etiqueta": "Mezclado"
      },
      {
       "valor": "colorea",
       "etiqueta": "Colorear el que se pide"
      },
      {
       "valor": "lugar",
       "etiqueta": "Decir el lugar"
      }
     ]
    }
   ],
   "rangos": [
    10,
    20,
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    100
   ],
   "rango": 10,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "LOS ORDINALES",
   "color": "verde",
   "metadatos": {
    "dificultad": 2,
    "minutos": 10,
    "etiquetas": [
     "orden",
     "ordinales",
     "primero",
     "segundo"
    ]
   }
  },
  {
   "id": "orden.cantidad",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 3,
   "familia": "orden",
   "clave": "cantidad",
   "nombre": "Más, menos o igual",
   "descripcion": "Comparar dos grupos de dibujos.",
   "opciones": [
    {
     "id": "modo",
     "etiqueta": "Qué se rodea",
     "tipo": "opcion",
     "defecto": null,
     "valores": [
      {
       "valor": null,
       "etiqueta": "Mezclado"
      },
      {
       "valor": "mayor",
       "etiqueta": "Solo el que tiene más"
      },
      {
       "valor": "menor",
       "etiqueta": "Solo el que tiene menos"
      }
     ]
    }
   ],
   "rangos": [
    10,
    20
   ],
   "rango": 10,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "MÁS, MENOS O IGUAL",
   "color": "verde",
   "metadatos": {
    "dificultad": 1,
    "minutos": 8,
    "etiquetas": [
     "orden",
     "comparar",
     "más menos igual",
     "cantidad"
    ]
   }
  },
  {
   "id": "valor.agrupa",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 4,
   "familia": "valor",
   "clave": "agrupa",
   "nombre": "Agrupa en decenas",
   "descripcion": "Rodear grupos de 10 y escribir decenas y unidades.",
   "opciones": [],
   "rangos": [
    20,
    30,
    40,
    50
   ],
   "rango": 20,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "AGRUPA EN DECENAS",
   "color": "rosa",
   "metadatos": {
    "dificultad": 2,
    "minutos": 12,
    "etiquetas": [
     "valor posicional",
     "decenas",
     "agrupar"
    ]
   }
  },
  {
   "id": "valor.canje",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 4,
   "familia": "valor",
   "clave": "canje",
   "nombre": "Los canjes",
   "descripcion": "Cambiar unidades por decenas.",
   "opciones": [
    {
     "id": "nivel",
     "etiqueta": "Números",
     "tipo": "opcion",
     "defecto": null,
     "valores": [
      {
       "valor": null,
       "etiqueta": "Decenas completas y otros"
      },
      {
       "valor": "completas",
       "etiqueta": "Solo decenas completas"
      }
     ]
    }
   ],
   "rangos": [
    20,
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    100
   ],
   "rango": 20,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "LOS CANJES",
   "color": "rosa",
   "metadatos": {
    "dificultad": 3,
    "minutos": 12,
    "etiquetas": [
     "valor posicional",
     "canje",
     "decenas unidades"
    ]
   }
  },
  {
   "id": "valor.descdu",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 4,
   "familia": "valor",
   "clave": "descdu",
   "nombre": "Descomposición en D y U",
   "descripcion": "Descomponer números en decenas y unidades.",
   "opciones": [
    {
     "id": "modo",
     "etiqueta": "Forma",
     "tipo": "opcion",
     "defecto": null,
     "valores": [
      {
       "valor": null,
       "etiqueta": "Decenas y unidades (4 D + 3 U)"
      },
      {
       "valor": "suma",
       "etiqueta": "Suma (40 + 3)"
      }
     ]
    },
    {
     "id": "nivel",
     "etiqueta": "Números",
     "tipo": "opcion",
     "defecto": null,
     "valores": [
      {
       "valor": null,
       "etiqueta": "Decenas completas y otros"
      },
      {
       "valor": "completas",
       "etiqueta": "Solo decenas completas"
      }
     ]
    }
   ],
   "rangos": [
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    100
   ],
   "rango": 30,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "DESCOMPOSICIÓN EN D Y U",
   "color": "rosa",
   "metadatos": {
    "dificultad": 2,
    "minutos": 12,
    "etiquetas": [
     "valor posicional",
     "descomposición",
     "decenas unidades"
    ]
   }
  },
  {
   "id": "valor.dunum",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 4,
   "familia": "valor",
   "clave": "dunum",
   "nombre": "Decenas, unidades y número",
   "descripcion": "Pasar de decenas y unidades al número y al revés.",
   "opciones": [
    {
     "id": "nivel",
     "etiqueta": "Números",
     "tipo": "opcion",
     "defecto": null,
     "valores": [
      {
       "valor": null,
       "etiqueta": "Decenas completas y otros"
      },
      {
       "valor": "completas",
       "etiqueta": "Solo decenas completas"
      }
     ]
    }
   ],
   "rangos": [
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    100
   ],
   "rango": 30,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "DECENAS, UNIDADES Y NÚMERO",
   "color": "rosa",
   "metadatos": {
    "dificultad": 2,
    "minutos": 12,
    "etiquetas": [
     "valor posicional",
     "decenas unidades"
    ]
   }
  },
  {
   "id": "valor.pares",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 4,
   "familia": "valor",
   "clave": "pares",
   "nombre": "Pares e impares",
   "descripcion": "Distinguir números pares e impares.",
   "opciones": [
    {
     "id": "modo",
     "etiqueta": "Tarea",
     "tipo": "opcion",
     "defecto": null,
     "valores": [
      {
       "valor": null,
       "etiqueta": "Contar puntos y rodear"
      },
      {
       "valor": "clasifica",
       "etiqueta": "Clasificar en dos columnas",
       "tamanos": [
        "completa"
       ]
      }
     ]
    }
   ],
   "rangos": [
    10,
    20
   ],
   "rango": 10,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "PARES E IMPARES",
   "color": "rosa",
   "metadatos": {
    "dificultad": 1,
    "minutos": 8,
    "etiquetas": [
     "valor",
     "pares",
     "impares"
    ]
   }
  },
  {
   "id": "valor.cifra",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 4,
   "familia": "valor",
   "clave": "cifra",
   "nombre": "El valor de la cifra",
   "descripcion": "Escribir cuánto vale cada cifra.",
   "opciones": [],
   "rangos": [
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    100
   ],
   "rango": 30,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "EL VALOR DE LA CIFRA",
   "color": "rosa",
   "metadatos": {
    "dificultad": 3,
    "minutos": 12,
    "etiquetas": [
     "valor posicional",
     "cifra"
    ]
   }
  },
  {
   "id": "sumar.dibujos",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 5,
   "familia": "sumar",
   "clave": "dibujos",
   "nombre": "Suma con dibujos",
   "descripcion": "Contar dos grupos de dibujos y escribir el total.",
   "opciones": [],
   "rangos": [
    10,
    20
   ],
   "rango": 10,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "SUMA CON DIBUJOS",
   "color": "azul",
   "metadatos": {
    "dificultad": 1,
    "minutos": 8,
    "etiquetas": [
     "sumar",
     "dibujos"
    ]
   }
  },
  {
   "id": "sumar.recta",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 5,
   "familia": "sumar",
   "clave": "recta",
   "nombre": "Suma en la recta numérica",
   "descripcion": "Sumar dando saltos en la recta.",
   "opciones": [],
   "rangos": [
    10,
    20,
    30
   ],
   "rango": 10,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "SUMA EN LA RECTA NUMÉRICA",
   "color": "azul",
   "metadatos": {
    "dificultad": 1,
    "minutos": 10,
    "etiquetas": [
     "sumar",
     "recta numérica"
    ]
   }
  },
  {
   "id": "sumar.h10",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 5,
   "familia": "sumar",
   "clave": "h10",
   "nombre": "Sumas hasta 10",
   "descripcion": "Sumas horizontales con resultado hasta 10.",
   "opciones": [],
   "rangos": [
    10
   ],
   "rango": 10,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "SUMAS HASTA 10",
   "color": "azul",
   "metadatos": {
    "dificultad": 1,
    "minutos": 10,
    "etiquetas": [
     "sumar",
     "hasta 10",
     "cálculo"
    ]
   }
  },
  {
   "id": "sumar.h20",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 5,
   "familia": "sumar",
   "clave": "h20",
   "nombre": "Sumas hasta 20",
   "descripcion": "Sumas horizontales con resultado hasta 20.",
   "opciones": [
    {
     "id": "nivel",
     "etiqueta": "Llevadas",
     "tipo": "opcion",
     "defecto": null,
     "valores": [
      {
       "valor": null,
       "etiqueta": "Sin llevadas"
      },
      {
       "valor": "con",
       "etiqueta": "Con llevadas"
      },
      {
       "valor": "mezcla",
       "etiqueta": "Mezcladas"
      }
     ]
    }
   ],
   "rangos": [
    20
   ],
   "rango": 20,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "SUMAS HASTA 20",
   "color": "azul",
   "metadatos": {
    "dificultad": 2,
    "minutos": 12,
    "etiquetas": [
     "sumar",
     "hasta 20",
     "cálculo",
     "llevadas"
    ]
   }
  },
  {
   "id": "sumar.h100",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 5,
   "familia": "sumar",
   "clave": "h100",
   "nombre": "Sumas hasta 100",
   "descripcion": "Sumas horizontales de números de dos cifras.",
   "opciones": [
    {
     "id": "nivel",
     "etiqueta": "Llevadas",
     "tipo": "opcion",
     "defecto": null,
     "valores": [
      {
       "valor": null,
       "etiqueta": "Sin llevadas"
      },
      {
       "valor": "con",
       "etiqueta": "Con llevadas"
      },
      {
       "valor": "mezcla",
       "etiqueta": "Mezcladas"
      }
     ]
    }
   ],
   "rangos": [
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    100
   ],
   "rango": 30,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "SUMAS HASTA 100",
   "color": "azul",
   "metadatos": {
    "dificultad": 3,
    "minutos": 15,
    "etiquetas": [
     "sumar",
     "hasta 100",
     "cálculo",
     "llevadas"
    ]
   }
  },
  {
   "id": "sumar.vertical",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 5,
   "familia": "sumar",
   "clave": "vertical",
   "nombre": "Sumas en vertical",
   "descripcion": "Sumas colocadas en columna (D y U).",
   "opciones": [
    {
     "id": "nivel",
     "etiqueta": "Llevadas",
     "tipo": "opcion",
     "defecto": null,
     "valores": [
      {
       "valor": null,
       "etiqueta": "Sin llevadas"
      },
      {
       "valor": "con",
       "etiqueta": "Con llevadas"
      },
      {
       "valor": "mezcla",
       "etiqueta": "Mezcladas"
      }
     ]
    }
   ],
   "rangos": [
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    100
   ],
   "rango": 30,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "SUMAS EN VERTICAL",
   "color": "azul",
   "metadatos": {
    "dificultad": 3,
    "minutos": 15,
    "etiquetas": [
     "sumar",
     "vertical",
     "algoritmo",
     "llevadas"
    ]
   }
  },
  {
   "id": "sumar.dobles",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 5,
   "familia": "sumar",
   "clave": "dobles",
   "nombre": "Los dobles",
   "descripcion": "Calcular el doble de un número.",
   "opciones": [
    {
     "id": "modo",
     "etiqueta": "Presentación",
     "tipo": "opcion",
     "defecto": null,
     "valores": [
      {
       "valor": null,
       "etiqueta": "Solo números"
      },
      {
       "valor": "dibujo",
       "etiqueta": "Con dibujos"
      }
     ]
    }
   ],
   "rangos": [
    10,
    20
   ],
   "rango": 10,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "LOS DOBLES",
   "color": "azul",
   "metadatos": {
    "dificultad": 2,
    "minutos": 8,
    "etiquetas": [
     "sumar",
     "dobles",
     "cálculo mental"
    ]
   }
  },
  {
   "id": "sumar.comp10",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 5,
   "familia": "sumar",
   "clave": "comp10",
   "nombre": "Completa hasta 10",
   "descripcion": "Lo que falta para llegar a 10.",
   "opciones": [],
   "rangos": [
    10
   ],
   "rango": 10,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "COMPLETA HASTA 10",
   "color": "azul",
   "metadatos": {
    "dificultad": 1,
    "minutos": 8,
    "etiquetas": [
     "sumar",
     "completar hasta 10",
     "cálculo mental"
    ]
   }
  },
  {
   "id": "sumar.comp20",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 5,
   "familia": "sumar",
   "clave": "comp20",
   "nombre": "Completa hasta la decena",
   "descripcion": "Lo que falta para llegar a la decena siguiente.",
   "opciones": [],
   "rangos": [
    20,
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    100
   ],
   "rango": 20,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "COMPLETA HASTA LA DECENA",
   "color": "azul",
   "metadatos": {
    "dificultad": 2,
    "minutos": 10,
    "etiquetas": [
     "sumar",
     "completar hasta la decena",
     "cálculo mental"
    ]
   }
  },
  {
   "id": "sumar.hueco",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 5,
   "familia": "sumar",
   "clave": "hueco",
   "nombre": "Sumas con hueco",
   "descripcion": "Sumas con un sumando desconocido.",
   "opciones": [
    {
     "id": "nivel",
     "etiqueta": "Llevadas",
     "tipo": "opcion",
     "defecto": null,
     "valores": [
      {
       "valor": null,
       "etiqueta": "Sin llevadas"
      },
      {
       "valor": "con",
       "etiqueta": "Con llevadas"
      },
      {
       "valor": "mezcla",
       "etiqueta": "Mezcladas"
      }
     ]
    }
   ],
   "rangos": [
    10,
    20,
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    100
   ],
   "rango": 10,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "SUMAS CON HUECO",
   "color": "azul",
   "metadatos": {
    "dificultad": 3,
    "minutos": 12,
    "etiquetas": [
     "sumar",
     "hueco cálculo"
    ]
   }
  },
  {
   "id": "sumar.decenas",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 5,
   "familia": "sumar",
   "clave": "decenas",
   "nombre": "Sumas de decenas",
   "descripcion": "Sumar decenas completas (20 + 30).",
   "opciones": [
    {
     "id": "modo",
     "etiqueta": "Presentación",
     "tipo": "opcion",
     "defecto": null,
     "valores": [
      {
       "valor": null,
       "etiqueta": "Solo números"
      },
      {
       "valor": "bloques",
       "etiqueta": "Con bloques de base diez"
      }
     ]
    }
   ],
   "rangos": [
    100
   ],
   "rango": 100,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "SUMAS DE DECENAS",
   "color": "azul",
   "metadatos": {
    "dificultad": 2,
    "minutos": 10,
    "etiquetas": [
     "sumar",
     "decenas",
     "cálculo mental"
    ]
   }
  },
  {
   "id": "sumar.encadenadas",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 5,
   "familia": "sumar",
   "clave": "encadenadas",
   "nombre": "Sumas encadenadas",
   "descripcion": "Sumar tres números seguidos.",
   "opciones": [],
   "rangos": [
    10,
    20
   ],
   "rango": 10,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "SUMAS ENCADENADAS",
   "color": "azul",
   "metadatos": {
    "dificultad": 3,
    "minutos": 12,
    "etiquetas": [
     "sumar",
     "encadenadas",
     "cálculo"
    ]
   }
  },
  {
   "id": "sumar.piramide",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 5,
   "familia": "sumar",
   "clave": "piramide",
   "nombre": "Pirámides de sumas",
   "descripcion": "Cada casilla es la suma de las dos de abajo.",
   "opciones": [
    {
     "id": "huecos",
     "etiqueta": "Cuadros vacíos",
     "tipo": "numero",
     "min": 1,
     "max": 3,
     "defecto": 3
    }
   ],
   "rangos": [
    10,
    20,
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    100
   ],
   "rango": 10,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "PIRÁMIDES DE SUMAS",
   "color": "azul",
   "metadatos": {
    "dificultad": 3,
    "minutos": 15,
    "etiquetas": [
     "sumar",
     "pirámide",
     "cálculo"
    ]
   }
  },
  {
   "id": "sumar.tabla",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 5,
   "familia": "sumar",
   "clave": "tabla",
   "nombre": "Tabla de sumar",
   "descripcion": "Completar una tabla de doble entrada.",
   "opciones": [
    {
     "id": "huecos",
     "etiqueta": "Cuadros vacíos",
     "tipo": "numero",
     "min": 1,
     "max": 36,
     "defecto": null
    }
   ],
   "rangos": [
    10,
    20,
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    100
   ],
   "rango": 10,
   "tamanos": [
    "completa"
   ],
   "titulo": "TABLA DE SUMAR",
   "color": "azul",
   "metadatos": {
    "dificultad": 2,
    "minutos": 12,
    "etiquetas": [
     "sumar",
     "tabla",
     "cálculo"
    ]
   }
  },
  {
   "id": "restar.quita",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 6,
   "familia": "restar",
   "clave": "quita",
   "nombre": "Resta con dibujos",
   "descripcion": "Tachar dibujos y contar los que quedan.",
   "opciones": [],
   "rangos": [
    10,
    20
   ],
   "rango": 10,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "RESTA CON DIBUJOS",
   "color": "verde",
   "metadatos": {
    "dificultad": 1,
    "minutos": 8,
    "etiquetas": [
     "restar",
     "dibujos"
    ]
   }
  },
  {
   "id": "restar.recta",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 6,
   "familia": "restar",
   "clave": "recta",
   "nombre": "Resta en la recta numérica",
   "descripcion": "Restar dando saltos hacia atrás.",
   "opciones": [],
   "rangos": [
    10,
    20,
    30
   ],
   "rango": 10,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "RESTA EN LA RECTA NUMÉRICA",
   "color": "verde",
   "metadatos": {
    "dificultad": 1,
    "minutos": 10,
    "etiquetas": [
     "restar",
     "recta numérica"
    ]
   }
  },
  {
   "id": "restar.r10",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 6,
   "familia": "restar",
   "clave": "r10",
   "nombre": "Restas hasta 10",
   "descripcion": "Restas horizontales hasta 10.",
   "opciones": [],
   "rangos": [
    10
   ],
   "rango": 10,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "RESTAS HASTA 10",
   "color": "verde",
   "metadatos": {
    "dificultad": 1,
    "minutos": 10,
    "etiquetas": [
     "restar",
     "hasta 10",
     "cálculo"
    ]
   }
  },
  {
   "id": "restar.r20",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 6,
   "familia": "restar",
   "clave": "r20",
   "nombre": "Restas hasta 20",
   "descripcion": "Restas horizontales hasta 20.",
   "opciones": [
    {
     "id": "nivel",
     "etiqueta": "Llevadas",
     "tipo": "opcion",
     "defecto": null,
     "valores": [
      {
       "valor": null,
       "etiqueta": "Sin llevadas"
      },
      {
       "valor": "con",
       "etiqueta": "Con llevadas"
      },
      {
       "valor": "mezcla",
       "etiqueta": "Mezcladas"
      }
     ]
    }
   ],
   "rangos": [
    20
   ],
   "rango": 20,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "RESTAS HASTA 20",
   "color": "verde",
   "metadatos": {
    "dificultad": 2,
    "minutos": 12,
    "etiquetas": [
     "restar",
     "hasta 20",
     "cálculo",
     "llevadas"
    ]
   }
  },
  {
   "id": "restar.r100",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 6,
   "familia": "restar",
   "clave": "r100",
   "nombre": "Restas hasta 100",
   "descripcion": "Restas horizontales de números de dos cifras.",
   "opciones": [
    {
     "id": "nivel",
     "etiqueta": "Llevadas",
     "tipo": "opcion",
     "defecto": null,
     "valores": [
      {
       "valor": null,
       "etiqueta": "Sin llevadas"
      },
      {
       "valor": "con",
       "etiqueta": "Con llevadas"
      },
      {
       "valor": "mezcla",
       "etiqueta": "Mezcladas"
      }
     ]
    }
   ],
   "rangos": [
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    100
   ],
   "rango": 30,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "RESTAS HASTA 100",
   "color": "verde",
   "metadatos": {
    "dificultad": 3,
    "minutos": 15,
    "etiquetas": [
     "restar",
     "hasta 100",
     "cálculo",
     "llevadas"
    ]
   }
  },
  {
   "id": "restar.vertical",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 6,
   "familia": "restar",
   "clave": "vertical",
   "nombre": "Restas en vertical",
   "descripcion": "Restas colocadas en columna (D y U).",
   "opciones": [
    {
     "id": "nivel",
     "etiqueta": "Llevadas",
     "tipo": "opcion",
     "defecto": null,
     "valores": [
      {
       "valor": null,
       "etiqueta": "Sin llevadas"
      },
      {
       "valor": "con",
       "etiqueta": "Con llevadas"
      },
      {
       "valor": "mezcla",
       "etiqueta": "Mezcladas"
      }
     ]
    }
   ],
   "rangos": [
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    100
   ],
   "rango": 30,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "RESTAS EN VERTICAL",
   "color": "verde",
   "metadatos": {
    "dificultad": 3,
    "minutos": 15,
    "etiquetas": [
     "restar",
     "vertical",
     "algoritmo",
     "llevadas"
    ]
   }
  },
  {
   "id": "restar.mitades",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 6,
   "familia": "restar",
   "clave": "mitades",
   "nombre": "Las mitades",
   "descripcion": "Calcular la mitad de un número par.",
   "opciones": [
    {
     "id": "modo",
     "etiqueta": "Presentación",
     "tipo": "opcion",
     "defecto": null,
     "valores": [
      {
       "valor": null,
       "etiqueta": "Solo números"
      },
      {
       "valor": "dibujo",
       "etiqueta": "Con dibujos"
      }
     ]
    }
   ],
   "rangos": [
    10,
    20
   ],
   "rango": 10,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "LAS MITADES",
   "color": "verde",
   "metadatos": {
    "dificultad": 2,
    "minutos": 8,
    "etiquetas": [
     "restar",
     "mitades",
     "cálculo mental"
    ]
   }
  },
  {
   "id": "restar.faltan",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 6,
   "familia": "restar",
   "clave": "faltan",
   "nombre": "¿Cuánto falta?",
   "descripcion": "Lo que falta para llegar a un número.",
   "opciones": [],
   "rangos": [
    10,
    20,
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    100
   ],
   "rango": 10,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "¿CUÁNTO FALTA?",
   "color": "verde",
   "metadatos": {
    "dificultad": 2,
    "minutos": 10,
    "etiquetas": [
     "restar",
     "cuánto falta",
     "cálculo mental"
    ]
   }
  },
  {
   "id": "restar.hueco",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 6,
   "familia": "restar",
   "clave": "hueco",
   "nombre": "Restas con hueco",
   "descripcion": "Restas con un término desconocido.",
   "opciones": [
    {
     "id": "nivel",
     "etiqueta": "Llevadas",
     "tipo": "opcion",
     "defecto": null,
     "valores": [
      {
       "valor": null,
       "etiqueta": "Sin llevadas"
      },
      {
       "valor": "con",
       "etiqueta": "Con llevadas"
      },
      {
       "valor": "mezcla",
       "etiqueta": "Mezcladas"
      }
     ]
    }
   ],
   "rangos": [
    10,
    20,
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    100
   ],
   "rango": 10,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "RESTAS CON HUECO",
   "color": "verde",
   "metadatos": {
    "dificultad": 3,
    "minutos": 12,
    "etiquetas": [
     "restar",
     "hueco cálculo"
    ]
   }
  },
  {
   "id": "restar.decenas",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 6,
   "familia": "restar",
   "clave": "decenas",
   "nombre": "Restas de decenas",
   "descripcion": "Restar decenas completas (50 − 20).",
   "opciones": [
    {
     "id": "modo",
     "etiqueta": "Presentación",
     "tipo": "opcion",
     "defecto": null,
     "valores": [
      {
       "valor": null,
       "etiqueta": "Solo números"
      },
      {
       "valor": "bloques",
       "etiqueta": "Con bloques de base diez"
      }
     ]
    }
   ],
   "rangos": [
    100
   ],
   "rango": 100,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "RESTAS DE DECENAS",
   "color": "verde",
   "metadatos": {
    "dificultad": 2,
    "minutos": 10,
    "etiquetas": [
     "restar",
     "decenas",
     "cálculo mental"
    ]
   }
  },
  {
   "id": "restar.encadenadas",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 6,
   "familia": "restar",
   "clave": "encadenadas",
   "nombre": "Restas encadenadas",
   "descripcion": "Restar dos números seguidos.",
   "opciones": [],
   "rangos": [
    10,
    20
   ],
   "rango": 10,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "RESTAS ENCADENADAS",
   "color": "verde",
   "metadatos": {
    "dificultad": 3,
    "minutos": 12,
    "etiquetas": [
     "restar",
     "encadenadas",
     "cálculo"
    ]
   }
  },
  {
   "id": "restar.familia",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 6,
   "familia": "restar",
   "clave": "familia",
   "nombre": "Familias de operaciones",
   "descripcion": "Usar una suma para completar dos restas.",
   "opciones": [
    {
     "id": "nivel",
     "etiqueta": "Llevadas",
     "tipo": "opcion",
     "defecto": null,
     "valores": [
      {
       "valor": null,
       "etiqueta": "Sin llevadas"
      },
      {
       "valor": "con",
       "etiqueta": "Con llevadas"
      },
      {
       "valor": "mezcla",
       "etiqueta": "Mezcladas"
      }
     ]
    }
   ],
   "rangos": [
    10,
    20,
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    100
   ],
   "rango": 10,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "FAMILIAS DE OPERACIONES",
   "color": "verde",
   "metadatos": {
    "dificultad": 3,
    "minutos": 12,
    "etiquetas": [
     "sumar",
     "restar",
     "familia de operaciones"
    ]
   }
  },
  {
   "id": "juegos.cuadrado",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 7,
   "familia": "juegos",
   "clave": "cuadrado",
   "nombre": "Cuadrados mágicos",
   "descripcion": "Completar un cuadrado mágico 3 × 3.",
   "opciones": [
    {
     "id": "n",
     "etiqueta": "Casillas vacías",
     "tipo": "numero",
     "min": 3,
     "max": 5,
     "defecto": 4
    }
   ],
   "rangos": [
    10,
    20,
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    100
   ],
   "rango": 10,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "CUADRADOS MÁGICOS",
   "color": "amarillo",
   "metadatos": {
    "dificultad": 3,
    "minutos": 15,
    "etiquetas": [
     "juego",
     "cuadrado mágico",
     "sumar"
    ]
   }
  },
  {
   "id": "juegos.laberinto",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 7,
   "familia": "juegos",
   "clave": "laberinto",
   "nombre": "Laberinto de números",
   "descripcion": "Seguir una serie desde la salida hasta la meta.",
   "opciones": [
    {
     "id": "n",
     "etiqueta": "Salto",
     "tipo": "opcion",
     "defecto": null,
     "valores": [
      {
       "valor": null,
       "etiqueta": "De 1 en 1"
      },
      {
       "valor": 2,
       "etiqueta": "De 2 en 2"
      },
      {
       "valor": 5,
       "etiqueta": "De 5 en 5"
      },
      {
       "valor": 10,
       "etiqueta": "De 10 en 10"
      }
     ]
    }
   ],
   "rangos": [
    10,
    20,
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    100
   ],
   "rango": 10,
   "tamanos": [
    "completa"
   ],
   "titulo": "LABERINTO DE NÚMEROS",
   "color": "amarillo",
   "metadatos": {
    "dificultad": 2,
    "minutos": 12,
    "etiquetas": [
     "juego",
     "laberinto",
     "cálculo"
    ]
   }
  },
  {
   "id": "juegos.une",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 7,
   "familia": "juegos",
   "clave": "une",
   "nombre": "Une operaciones y resultados",
   "descripcion": "Unir con flechas cada operación con su resultado.",
   "opciones": [
    {
     "id": "modo",
     "etiqueta": "Operaciones",
     "tipo": "opcion",
     "defecto": null,
     "valores": [
      {
       "valor": null,
       "etiqueta": "Sumas y restas"
      },
      {
       "valor": "suma",
       "etiqueta": "Solo sumas"
      },
      {
       "valor": "resta",
       "etiqueta": "Solo restas"
      }
     ]
    },
    {
     "id": "nivel",
     "etiqueta": "Llevadas",
     "tipo": "opcion",
     "defecto": null,
     "valores": [
      {
       "valor": null,
       "etiqueta": "Sin llevadas"
      },
      {
       "valor": "con",
       "etiqueta": "Con llevadas"
      },
      {
       "valor": "mezcla",
       "etiqueta": "Mezcladas"
      }
     ]
    }
   ],
   "rangos": [
    10,
    20,
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    100
   ],
   "rango": 10,
   "tamanos": [
    "completa"
   ],
   "titulo": "UNE OPERACIONES Y RESULTADOS",
   "color": "amarillo",
   "metadatos": {
    "dificultad": 2,
    "minutos": 10,
    "etiquetas": [
     "juego",
     "unir operaciones resultados"
    ]
   }
  },
  {
   "id": "juegos.cadena",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 7,
   "familia": "juegos",
   "clave": "cadena",
   "nombre": "Cadenas de números",
   "descripcion": "Seguir una cadena de operaciones.",
   "opciones": [],
   "rangos": [
    10,
    20,
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    100
   ],
   "rango": 10,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "CADENAS DE NÚMEROS",
   "color": "amarillo",
   "metadatos": {
    "dificultad": 2,
    "minutos": 12,
    "etiquetas": [
     "juego",
     "cadena",
     "cálculo"
    ]
   }
  },
  {
   "id": "juegos.oculto",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 7,
   "familia": "juegos",
   "clave": "oculto",
   "nombre": "El número oculto",
   "descripcion": "Adivinar un número a partir de pistas.",
   "opciones": [],
   "rangos": [
    10,
    20,
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    100
   ],
   "rango": 10,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "EL NÚMERO OCULTO",
   "color": "amarillo",
   "metadatos": {
    "dificultad": 3,
    "minutos": 12,
    "etiquetas": [
     "juego",
     "número oculto",
     "razonamiento"
    ]
   }
  },
  {
   "id": "juegos.colorea",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 7,
   "familia": "juegos",
   "clave": "colorea",
   "nombre": "Colorea y descubre",
   "descripcion": "Resolver y colorear para descubrir un dibujo.",
   "opciones": [
    {
     "id": "modo",
     "etiqueta": "Operaciones",
     "tipo": "opcion",
     "defecto": null,
     "valores": [
      {
       "valor": null,
       "etiqueta": "Sumas"
      },
      {
       "valor": "resta",
       "etiqueta": "Restas"
      }
     ]
    },
    {
     "id": "nivel",
     "etiqueta": "Llevadas",
     "tipo": "opcion",
     "defecto": null,
     "valores": [
      {
       "valor": null,
       "etiqueta": "Sin llevadas"
      },
      {
       "valor": "con",
       "etiqueta": "Con llevadas"
      },
      {
       "valor": "mezcla",
       "etiqueta": "Mezcladas"
      }
     ]
    },
    {
     "id": "n",
     "etiqueta": "Dibujo",
     "tipo": "opcion",
     "defecto": null,
     "valores": [
      {
       "valor": null,
       "etiqueta": "Al azar"
      },
      {
       "valor": 1,
       "etiqueta": "Corazón"
      },
      {
       "valor": 2,
       "etiqueta": "Casa"
      },
      {
       "valor": 3,
       "etiqueta": "Árbol"
      },
      {
       "valor": 4,
       "etiqueta": "Diamante"
      }
     ]
    }
   ],
   "rangos": [
    10,
    20,
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    100
   ],
   "rango": 10,
   "tamanos": [
    "completa"
   ],
   "titulo": "COLOREA Y DESCUBRE",
   "color": "amarillo",
   "metadatos": {
    "dificultad": 2,
    "minutos": 15,
    "etiquetas": [
     "juego",
     "colorear",
     "cálculo"
    ]
   }
  },
  {
   "id": "geometria.figuras",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 9,
   "familia": "geometria",
   "clave": "figuras",
   "nombre": "Las figuras planas",
   "descripcion": "Reconocer círculo, cuadrado, triángulo y rectángulo.",
   "opciones": [],
   "rangos": [],
   "rango": null,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "LAS FIGURAS PLANAS",
   "color": "rosa",
   "metadatos": {
    "dificultad": 1,
    "minutos": 8,
    "etiquetas": [
     "geometría",
     "figuras planas"
    ]
   }
  },
  {
   "id": "geometria.cuenta",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 9,
   "familia": "geometria",
   "clave": "cuenta",
   "nombre": "Cuenta las figuras",
   "descripcion": "Contar cuántas figuras hay de cada clase.",
   "opciones": [],
   "rangos": [],
   "rango": null,
   "tamanos": [
    "completa"
   ],
   "titulo": "CUENTA LAS FIGURAS",
   "color": "rosa",
   "metadatos": {
    "dificultad": 2,
    "minutos": 10,
    "etiquetas": [
     "geometría",
     "figuras",
     "contar"
    ]
   }
  },
  {
   "id": "geometria.cuerpos",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 9,
   "familia": "geometria",
   "clave": "cuerpos",
   "nombre": "Los cuerpos geométricos",
   "descripcion": "Reconocer esfera, cubo, cilindro, cono…",
   "opciones": [],
   "rangos": [],
   "rango": null,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "LOS CUERPOS GEOMÉTRICOS",
   "color": "rosa",
   "metadatos": {
    "dificultad": 2,
    "minutos": 10,
    "etiquetas": [
     "geometría",
     "cuerpos geométricos"
    ]
   }
  },
  {
   "id": "geometria.rueda",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 9,
   "familia": "geometria",
   "clave": "rueda",
   "nombre": "¿Rueda o no rueda?",
   "descripcion": "Clasificar cuerpos que ruedan y que no.",
   "opciones": [],
   "rangos": [],
   "rango": null,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "¿RUEDA O NO RUEDA?",
   "color": "rosa",
   "metadatos": {
    "dificultad": 1,
    "minutos": 8,
    "etiquetas": [
     "geometría",
     "cuerpos",
     "rueda"
    ]
   }
  },
  {
   "id": "geometria.lineas",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 9,
   "familia": "geometria",
   "clave": "lineas",
   "nombre": "Las líneas",
   "descripcion": "Recta, curva y quebrada, o abierta y cerrada.",
   "opciones": [
    {
     "id": "modo",
     "etiqueta": "Tipo",
     "tipo": "opcion",
     "defecto": null,
     "valores": [
      {
       "valor": null,
       "etiqueta": "Recta, curva o quebrada"
      },
      {
       "valor": "cierre",
       "etiqueta": "Abierta o cerrada"
      }
     ]
    }
   ],
   "rangos": [],
   "rango": null,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "LAS LÍNEAS",
   "color": "rosa",
   "metadatos": {
    "dificultad": 1,
    "minutos": 8,
    "etiquetas": [
     "geometría",
     "líneas",
     "rectas curvas"
    ]
   }
  },
  {
   "id": "geometria.posiciones",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 9,
   "familia": "geometria",
   "clave": "posiciones",
   "nombre": "Encima, debajo, izquierda y derecha",
   "descripcion": "Situar un objeto respecto a otro.",
   "opciones": [],
   "rangos": [],
   "rango": null,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "ENCIMA, DEBAJO, IZQUIERDA Y DERECHA",
   "color": "rosa",
   "metadatos": {
    "dificultad": 2,
    "minutos": 10,
    "etiquetas": [
     "geometría",
     "posiciones",
     "espacio",
     "lateralidad"
    ]
   }
  },
  {
   "id": "geometria.simetria",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 9,
   "familia": "geometria",
   "clave": "simetria",
   "nombre": "La simetría",
   "descripcion": "Completar la mitad simétrica de un dibujo.",
   "opciones": [
    {
     "id": "n",
     "etiqueta": "Tamaño del dibujo",
     "tipo": "numero",
     "min": 3,
     "max": 5,
     "defecto": 4
    }
   ],
   "rangos": [],
   "rango": null,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "LA SIMETRÍA",
   "color": "rosa",
   "metadatos": {
    "dificultad": 3,
    "minutos": 12,
    "etiquetas": [
     "geometría",
     "simetría"
    ]
   }
  },
  {
   "id": "geometria.copia",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 9,
   "familia": "geometria",
   "clave": "copia",
   "nombre": "Copia el dibujo",
   "descripcion": "Copiar un dibujo en la cuadrícula.",
   "opciones": [],
   "rangos": [],
   "rango": null,
   "tamanos": [
    "completa"
   ],
   "titulo": "COPIA EL DIBUJO",
   "color": "rosa",
   "metadatos": {
    "dificultad": 2,
    "minutos": 12,
    "etiquetas": [
     "geometría",
     "copiar",
     "dibujo",
     "cuadrícula"
    ]
   }
  },
  {
   "id": "medida.dinero",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 10,
   "familia": "medida",
   "clave": "dinero",
   "nombre": "Cuenta el dinero",
   "descripcion": "Contar monedas y billetes.",
   "opciones": [
    {
     "id": "modo",
     "etiqueta": "Unidad",
     "tipo": "opcion",
     "defecto": null,
     "valores": [
      {
       "valor": null,
       "etiqueta": "Euros"
      },
      {
       "valor": "centimos",
       "etiqueta": "Céntimos"
      }
     ]
    }
   ],
   "rangos": [
    10,
    20,
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    100
   ],
   "rango": 20,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "CUENTA EL DINERO",
   "color": "azul",
   "metadatos": {
    "dificultad": 2,
    "minutos": 12,
    "etiquetas": [
     "medida",
     "dinero",
     "monedas",
     "euros"
    ]
   }
  },
  {
   "id": "medida.precios",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 10,
   "familia": "medida",
   "clave": "precios",
   "nombre": "Las compras",
   "descripcion": "Calcular el total de una compra o la vuelta.",
   "opciones": [
    {
     "id": "modo",
     "etiqueta": "Tarea",
     "tipo": "opcion",
     "defecto": null,
     "valores": [
      {
       "valor": null,
       "etiqueta": "Total de la compra"
      },
      {
       "valor": "cambio",
       "etiqueta": "La vuelta"
      }
     ]
    }
   ],
   "rangos": [
    10,
    20
   ],
   "rango": 20,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "LAS COMPRAS",
   "color": "azul",
   "metadatos": {
    "dificultad": 3,
    "minutos": 12,
    "etiquetas": [
     "medida",
     "dinero",
     "compras",
     "precios"
    ]
   }
  },
  {
   "id": "medida.reloj",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 10,
   "familia": "medida",
   "clave": "reloj",
   "nombre": "Los relojes",
   "descripcion": "Leer la hora en relojes de agujas.",
   "opciones": [
    {
     "id": "modo",
     "etiqueta": "Horas",
     "tipo": "opcion",
     "defecto": null,
     "valores": [
      {
       "valor": null,
       "etiqueta": "En punto e y media"
      },
      {
       "valor": "punto",
       "etiqueta": "Solo en punto"
      },
      {
       "valor": "media",
       "etiqueta": "Solo y media"
      }
     ]
    }
   ],
   "rangos": [],
   "rango": null,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "LOS RELOJES",
   "color": "azul",
   "metadatos": {
    "dificultad": 2,
    "minutos": 10,
    "etiquetas": [
     "medida",
     "reloj",
     "hora"
    ]
   }
  },
  {
   "id": "medida.reloj2",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 10,
   "familia": "medida",
   "clave": "reloj2",
   "nombre": "Dibuja las agujas",
   "descripcion": "Dibujar las agujas para marcar una hora.",
   "opciones": [
    {
     "id": "modo",
     "etiqueta": "Horas",
     "tipo": "opcion",
     "defecto": null,
     "valores": [
      {
       "valor": null,
       "etiqueta": "En punto e y media"
      },
      {
       "valor": "punto",
       "etiqueta": "Solo en punto"
      },
      {
       "valor": "media",
       "etiqueta": "Solo y media"
      }
     ]
    }
   ],
   "rangos": [],
   "rango": null,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "DIBUJA LAS AGUJAS",
   "color": "azul",
   "metadatos": {
    "dificultad": 3,
    "minutos": 12,
    "etiquetas": [
     "medida",
     "reloj",
     "hora",
     "agujas"
    ]
   }
  },
  {
   "id": "medida.calendario",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 10,
   "familia": "medida",
   "clave": "calendario",
   "nombre": "El calendario",
   "descripcion": "Leer un calendario mensual y contestar.",
   "opciones": [
    {
     "id": "n",
     "etiqueta": "Mes",
     "tipo": "opcion",
     "defecto": null,
     "valores": [
      {
       "valor": null,
       "etiqueta": "Al azar"
      },
      {
       "valor": 1,
       "etiqueta": "Enero"
      },
      {
       "valor": 2,
       "etiqueta": "Febrero"
      },
      {
       "valor": 3,
       "etiqueta": "Marzo"
      },
      {
       "valor": 4,
       "etiqueta": "Abril"
      },
      {
       "valor": 5,
       "etiqueta": "Mayo"
      },
      {
       "valor": 6,
       "etiqueta": "Junio"
      },
      {
       "valor": 7,
       "etiqueta": "Julio"
      },
      {
       "valor": 8,
       "etiqueta": "Agosto"
      },
      {
       "valor": 9,
       "etiqueta": "Septiembre"
      },
      {
       "valor": 10,
       "etiqueta": "Octubre"
      },
      {
       "valor": 11,
       "etiqueta": "Noviembre"
      },
      {
       "valor": 12,
       "etiqueta": "Diciembre"
      }
     ]
    }
   ],
   "rangos": [],
   "rango": null,
   "tamanos": [
    "completa"
   ],
   "titulo": "EL CALENDARIO",
   "color": "azul",
   "metadatos": {
    "dificultad": 2,
    "minutos": 10,
    "etiquetas": [
     "medida",
     "calendario",
     "tiempo"
    ]
   }
  },
  {
   "id": "medida.tiempo",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 10,
   "familia": "medida",
   "clave": "tiempo",
   "nombre": "Días y meses",
   "descripcion": "Orden de los días de la semana o de los meses.",
   "opciones": [
    {
     "id": "modo",
     "etiqueta": "Tema",
     "tipo": "opcion",
     "defecto": null,
     "valores": [
      {
       "valor": null,
       "etiqueta": "Días de la semana"
      },
      {
       "valor": "meses",
       "etiqueta": "Meses del año"
      }
     ]
    }
   ],
   "rangos": [],
   "rango": null,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": {
    "_": "LOS DÍAS DE LA SEMANA",
    "meses": "LOS MESES DEL AÑO"
   },
   "color": "azul",
   "metadatos": {
    "dificultad": 2,
    "minutos": 10,
    "etiquetas": [
     "medida",
     "tiempo",
     "días",
     "meses"
    ]
   }
  },
  {
   "id": "medida.longitud",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 10,
   "familia": "medida",
   "clave": "longitud",
   "nombre": "Mide con cubitos",
   "descripcion": "Medir longitudes con cubitos.",
   "opciones": [
    {
     "id": "modo",
     "etiqueta": "Tarea",
     "tipo": "opcion",
     "defecto": null,
     "valores": [
      {
       "valor": null,
       "etiqueta": "Medir y escribir"
      },
      {
       "valor": "compara",
       "etiqueta": "Medir y rodear el más largo"
      }
     ]
    }
   ],
   "rangos": [],
   "rango": null,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "MIDE CON CUBITOS",
   "color": "azul",
   "metadatos": {
    "dificultad": 1,
    "minutos": 8,
    "etiquetas": [
     "medida",
     "longitud",
     "comparar"
    ]
   }
  },
  {
   "id": "medida.capacidad",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 10,
   "familia": "medida",
   "clave": "capacidad",
   "nombre": "¿Cuánto líquido hay?",
   "descripcion": "Ordenar vasos según el líquido.",
   "opciones": [],
   "rangos": [],
   "rango": null,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "¿CUÁNTO LÍQUIDO HAY?",
   "color": "azul",
   "metadatos": {
    "dificultad": 1,
    "minutos": 8,
    "etiquetas": [
     "medida",
     "capacidad",
     "líquido"
    ]
   }
  },
  {
   "id": "estadistica.pictograma",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 11,
   "familia": "estadistica",
   "clave": "pictograma",
   "nombre": "El pictograma",
   "descripcion": "Leer un pictograma y contestar.",
   "opciones": [
    {
     "id": "modo",
     "etiqueta": "Valor del dibujo",
     "tipo": "opcion",
     "defecto": null,
     "valores": [
      {
       "valor": null,
       "etiqueta": "Cada dibujo vale 1"
      },
      {
       "valor": "dos",
       "etiqueta": "Cada dibujo vale 2"
      }
     ]
    }
   ],
   "rangos": [
    10
   ],
   "rango": 10,
   "tamanos": [
    "completa"
   ],
   "titulo": "EL PICTOGRAMA",
   "color": "verde",
   "metadatos": {
    "dificultad": 2,
    "minutos": 12,
    "etiquetas": [
     "estadística",
     "pictograma",
     "datos"
    ]
   }
  },
  {
   "id": "estadistica.recuento",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 11,
   "familia": "estadistica",
   "clave": "recuento",
   "nombre": "Cuenta y anota",
   "descripcion": "Contar con palotes y escribir el número.",
   "opciones": [],
   "rangos": [
    10,
    20,
    30
   ],
   "rango": 10,
   "tamanos": [
    "completa"
   ],
   "titulo": "CUENTA Y ANOTA",
   "color": "verde",
   "metadatos": {
    "dificultad": 1,
    "minutos": 10,
    "etiquetas": [
     "estadística",
     "recuento",
     "datos",
     "contar"
    ]
   }
  },
  {
   "id": "estadistica.barras",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 11,
   "familia": "estadistica",
   "clave": "barras",
   "nombre": "El gráfico de barras",
   "descripcion": "Hacer o leer un gráfico de barras.",
   "opciones": [
    {
     "id": "modo",
     "etiqueta": "Tarea",
     "tipo": "opcion",
     "defecto": null,
     "valores": [
      {
       "valor": null,
       "etiqueta": "Colorear el gráfico"
      },
      {
       "valor": "lee",
       "etiqueta": "Leer el gráfico"
      }
     ]
    }
   ],
   "rangos": [
    10
   ],
   "rango": 10,
   "tamanos": [
    "completa"
   ],
   "titulo": "EL GRÁFICO DE BARRAS",
   "color": "verde",
   "metadatos": {
    "dificultad": 2,
    "minutos": 12,
    "etiquetas": [
     "estadística",
     "gráfico de barras",
     "datos"
    ]
   }
  },
  {
   "id": "estadistica.patrones",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 11,
   "familia": "estadistica",
   "clave": "patrones",
   "nombre": "Los patrones",
   "descripcion": "Continuar o completar series de figuras.",
   "opciones": [
    {
     "id": "modo",
     "etiqueta": "Tarea",
     "tipo": "opcion",
     "defecto": null,
     "valores": [
      {
       "valor": null,
       "etiqueta": "Continuar la serie"
      },
      {
       "valor": "hueco",
       "etiqueta": "Completar huecos"
      }
     ]
    }
   ],
   "rangos": [],
   "rango": null,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "LOS PATRONES",
   "color": "verde",
   "metadatos": {
    "dificultad": 2,
    "minutos": 10,
    "etiquetas": [
     "patrones",
     "series",
     "razonamiento"
    ]
   }
  },
  {
   "id": "problemas.suma",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 8,
   "familia": "problemas",
   "clave": "suma",
   "nombre": "Problemas de sumar",
   "descripcion": "Problemas de una operación: juntar o añadir. Nombres y objetos distintos en cada uno.",
   "opciones": [
    {
     "id": "situacion",
     "etiqueta": "Situaciones",
     "tipo": "opcion",
     "defecto": null,
     "valores": [
      {
       "valor": null,
       "etiqueta": "Variadas"
      },
      {
       "valor": "juntar",
       "etiqueta": "Juntar dos cantidades"
      },
      {
       "valor": "anadir",
       "etiqueta": "Añadir a lo que hay"
      }
     ]
    },
    {
     "id": "nivel",
     "etiqueta": "Llevadas",
     "tipo": "opcion",
     "defecto": null,
     "valores": [
      {
       "valor": null,
       "etiqueta": "Sin llevadas"
      },
      {
       "valor": "con",
       "etiqueta": "Con llevadas"
      },
      {
       "valor": "mezcla",
       "etiqueta": "Mezcladas"
      }
     ]
    }
   ],
   "rangos": [
    10,
    20,
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    100
   ],
   "rango": 20,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "PROBLEMAS DE SUMAR",
   "color": "amarillo",
   "metadatos": {
    "dificultad": 2,
    "minutos": 15,
    "etiquetas": [
     "problemas",
     "sumar",
     "texto",
     "razonamiento"
    ]
   }
  },
  {
   "id": "problemas.resta",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 8,
   "familia": "problemas",
   "clave": "resta",
   "nombre": "Problemas de restar",
   "descripcion": "Problemas de una operación: quitar, comparar o cuántos faltan.",
   "opciones": [
    {
     "id": "situacion",
     "etiqueta": "Situaciones",
     "tipo": "opcion",
     "defecto": null,
     "valores": [
      {
       "valor": null,
       "etiqueta": "Variadas"
      },
      {
       "valor": "quitar",
       "etiqueta": "Quitar o regalar"
      },
      {
       "valor": "comparar",
       "etiqueta": "Comparar (cuántos más o menos)"
      },
      {
       "valor": "faltar",
       "etiqueta": "Cuántos faltan"
      }
     ]
    },
    {
     "id": "nivel",
     "etiqueta": "Llevadas",
     "tipo": "opcion",
     "defecto": null,
     "valores": [
      {
       "valor": null,
       "etiqueta": "Sin llevadas"
      },
      {
       "valor": "con",
       "etiqueta": "Con llevadas"
      },
      {
       "valor": "mezcla",
       "etiqueta": "Mezcladas"
      }
     ]
    }
   ],
   "rangos": [
    10,
    20,
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    100
   ],
   "rango": 20,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "PROBLEMAS DE RESTAR",
   "color": "rosa",
   "metadatos": {
    "dificultad": 3,
    "minutos": 15,
    "etiquetas": [
     "problemas",
     "restar",
     "texto",
     "razonamiento"
    ]
   }
  },
  {
   "id": "problemas.mixtos",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 8,
   "familia": "problemas",
   "clave": "mixtos",
   "nombre": "Problemas de sumar y restar",
   "descripcion": "Problemas mezclados: hay que decidir si se suma o se resta.",
   "opciones": [
    {
     "id": "nivel",
     "etiqueta": "Llevadas",
     "tipo": "opcion",
     "defecto": null,
     "valores": [
      {
       "valor": null,
       "etiqueta": "Sin llevadas"
      },
      {
       "valor": "con",
       "etiqueta": "Con llevadas"
      },
      {
       "valor": "mezcla",
       "etiqueta": "Mezcladas"
      }
     ]
    }
   ],
   "rangos": [
    10,
    20,
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    100
   ],
   "rango": 20,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "PROBLEMAS",
   "color": "verde",
   "metadatos": {
    "dificultad": 3,
    "minutos": 18,
    "etiquetas": [
     "problemas",
     "sumar",
     "restar",
     "texto",
     "razonamiento"
    ]
   }
  },
  {
   "id": "problemas.barras",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 8,
   "familia": "problemas",
   "clave": "barras",
   "nombre": "Problemas con barras",
   "descripcion": "Modelo de barras de Singapur (como Barri): enunciado, barra de partes y total o de comparación, operación y respuesta.",
   "opciones": [
    {
     "id": "operacion",
     "etiqueta": "Operaciones",
     "tipo": "opcion",
     "defecto": null,
     "valores": [
      {
       "valor": null,
       "etiqueta": "Sumas y restas"
      },
      {
       "valor": "suma",
       "etiqueta": "Solo sumar"
      },
      {
       "valor": "resta",
       "etiqueta": "Solo restar"
      }
     ]
    },
    {
     "id": "nivel",
     "etiqueta": "Llevadas",
     "tipo": "opcion",
     "defecto": null,
     "valores": [
      {
       "valor": null,
       "etiqueta": "Sin llevadas"
      },
      {
       "valor": "con",
       "etiqueta": "Con llevadas"
      },
      {
       "valor": "mezcla",
       "etiqueta": "Mezcladas"
      }
     ]
    },
    {
     "id": "barra",
     "etiqueta": "Barra",
     "tipo": "opcion",
     "defecto": null,
     "valores": [
      {
       "valor": null,
       "etiqueta": "Dibujada (con los números)"
      },
      {
       "valor": "blanco",
       "etiqueta": "En blanco (la dibuja el alumno)"
      }
     ]
    }
   ],
   "rangos": [
    10,
    20,
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    100
   ],
   "rango": 20,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "PROBLEMAS CON BARRAS",
   "color": "azul",
   "metadatos": {
    "dificultad": 3,
    "minutos": 20,
    "etiquetas": [
     "problemas",
     "barras",
     "modelo de barras",
     "singapur",
     "sumar",
     "restar",
     "razonamiento"
    ]
   }
  },
  {
   "id": "trucos.masmenos1",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 12,
   "familia": "trucos",
   "clave": "masmenos1",
   "nombre": "Uno más, uno menos",
   "descripcion": "El vecino de cada número: sumar o restar 1 (truco de Calculi).",
   "opciones": [
    {
     "id": "modo",
     "etiqueta": "Operaciones",
     "tipo": "opcion",
     "defecto": null,
     "valores": [
      {
       "valor": null,
       "etiqueta": "Uno más y uno menos"
      },
      {
       "valor": "mas",
       "etiqueta": "Solo uno más"
      },
      {
       "valor": "menos",
       "etiqueta": "Solo uno menos"
      }
     ]
    }
   ],
   "rangos": [
    10,
    20
   ],
   "rango": 10,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "UNO MÁS, UNO MENOS",
   "color": "amarillo",
   "metadatos": {
    "dificultad": 1,
    "minutos": 8,
    "etiquetas": [
     "cálculo mental",
     "truco",
     "sumar",
     "restar",
     "uno más uno menos"
    ]
   }
  },
  {
   "id": "trucos.descomponer",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 12,
   "familia": "trucos",
   "clave": "descomponer",
   "nombre": "Descomponer hasta 10",
   "descripcion": "Partir un número en dos trozos y hallar el que falta (truco de Calculi).",
   "opciones": [],
   "rangos": [
    10
   ],
   "rango": 10,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "DESCOMPONER HASTA 10",
   "color": "verde",
   "metadatos": {
    "dificultad": 1,
    "minutos": 8,
    "etiquetas": [
     "cálculo mental",
     "truco",
     "descomposición",
     "hasta 10"
    ]
   }
  },
  {
   "id": "trucos.orden",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 12,
   "familia": "trucos",
   "clave": "orden",
   "nombre": "El orden no importa",
   "descripcion": "Empezar por el número grande: igualdades y sumas giradas (truco de Calculi).",
   "opciones": [
    {
     "id": "forma",
     "etiqueta": "Ejercicios",
     "tipo": "opcion",
     "defecto": null,
     "valores": [
      {
       "valor": null,
       "etiqueta": "Variados"
      },
      {
       "valor": "igualdad",
       "etiqueta": "Completar la igualdad"
      },
      {
       "valor": "calcula",
       "etiqueta": "Calcular empezando por el grande"
      }
     ]
    }
   ],
   "rangos": [
    10,
    20
   ],
   "rango": 10,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "EL ORDEN NO IMPORTA",
   "color": "azul",
   "metadatos": {
    "dificultad": 2,
    "minutos": 8,
    "etiquetas": [
     "cálculo mental",
     "truco",
     "sumar",
     "propiedad conmutativa"
    ]
   }
  },
  {
   "id": "trucos.usar5",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 12,
   "familia": "trucos",
   "clave": "usar5",
   "nombre": "Usar el 5",
   "descripcion": "Sumas de 5 a 9 separando la mano de 5 (truco de Calculi).",
   "opciones": [
    {
     "id": "modo",
     "etiqueta": "Ejercicios",
     "tipo": "opcion",
     "defecto": null,
     "valores": [
      {
       "valor": null,
       "etiqueta": "Variados"
      },
      {
       "valor": "suma",
       "etiqueta": "Solo sumas"
      }
     ]
    }
   ],
   "rangos": [
    20
   ],
   "rango": 20,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "USAR EL 5",
   "color": "rosa",
   "metadatos": {
    "dificultad": 2,
    "minutos": 10,
    "etiquetas": [
     "cálculo mental",
     "truco",
     "sumar",
     "el 5"
    ]
   }
  },
  {
   "id": "trucos.casidobles",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 12,
   "familia": "trucos",
   "clave": "casidobles",
   "nombre": "Casi dobles",
   "descripcion": "Sumas de dos números seguidos: el doble y uno más (truco de Calculi).",
   "opciones": [],
   "rangos": [
    20
   ],
   "rango": 20,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "CASI DOBLES",
   "color": "amarillo",
   "metadatos": {
    "dificultad": 2,
    "minutos": 8,
    "etiquetas": [
     "cálculo mental",
     "truco",
     "sumar",
     "casi dobles"
    ]
   }
  },
  {
   "id": "trucos.sumar9",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 12,
   "familia": "trucos",
   "clave": "sumar9",
   "nombre": "Sumar 9",
   "descripcion": "Sumar 10 y quitar 1 (truco de Calculi).",
   "opciones": [],
   "rangos": [
    20,
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    100
   ],
   "rango": 30,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "SUMAR 9",
   "color": "azul",
   "metadatos": {
    "dificultad": 3,
    "minutos": 10,
    "etiquetas": [
     "cálculo mental",
     "truco",
     "sumar",
     "sumar 9"
    ]
   }
  },
  {
   "id": "trucos.restarsumando",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 12,
   "familia": "trucos",
   "clave": "restarsumando",
   "nombre": "Restar sumando",
   "descripcion": "Restar contando lo que falta para llegar (truco de Calculi).",
   "opciones": [],
   "rangos": [
    20
   ],
   "rango": 20,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "RESTAR SUMANDO",
   "color": "rosa",
   "metadatos": {
    "dificultad": 3,
    "minutos": 10,
    "etiquetas": [
     "cálculo mental",
     "truco",
     "restar",
     "restar sumando"
    ]
   }
  },
  {
   "id": "trucos.masmenos10",
   "curso": 1,
   "materia": "matematicas",
   "bloque": 12,
   "familia": "trucos",
   "clave": "masmenos10",
   "nombre": "Sumar y restar 10",
   "descripcion": "Solo cambia la decena (truco de Calculi).",
   "opciones": [
    {
     "id": "modo",
     "etiqueta": "Operaciones",
     "tipo": "opcion",
     "defecto": null,
     "valores": [
      {
       "valor": null,
       "etiqueta": "Sumar y restar 10"
      },
      {
       "valor": "suma",
       "etiqueta": "Solo sumar 10"
      },
      {
       "valor": "resta",
       "etiqueta": "Solo restar 10"
      }
     ]
    }
   ],
   "rangos": [
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    100
   ],
   "rango": 50,
   "tamanos": [
    "completa",
    "media"
   ],
   "titulo": "SUMAR Y RESTAR 10",
   "color": "verde",
   "metadatos": {
    "dificultad": 2,
    "minutos": 10,
    "etiquetas": [
     "cálculo mental",
     "truco",
     "sumar",
     "restar",
     "decenas"
    ]
   }
  }
 ]
};
export const POR_ID = Object.fromEntries(CATALOGO.modelos.map((m) => [m.id, m]));
