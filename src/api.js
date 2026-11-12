// Charta · API pública `globalThis.Charta` (fase 7 de PLAN-DISENO, R7). La usa Tabula desde un iframe oculto (tabula/js/charta-hojas.js).
// Contrato escrito en ESQUEMA.md («API pública») y fijado por tests/test_contratos.js: no quitar ni cambiar la forma de lo que hay aquí
// sin subir `contrato` (y avisar a Tabula). Se pueden añadir campos.
import { CATALOGO } from "./nucleo/catalogo.js";
import { generar, modelo } from "./nucleo/ficha.js";
import { erroresFicha } from "./nucleo/lector.js";
import { listaTipos } from "./tipos/index.js";
import { hojas } from "./render/hoja.js";

export const CONTRATO = 1;
export const API = { contrato: CONTRATO, generar, hojas, modelo, erroresFicha, listaTipos, CATALOGO };
