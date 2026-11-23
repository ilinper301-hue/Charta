// Charta · pequeñas preferencias del dispositivo: último modelo elegido y blanco y negro por defecto (activado si no se ha tocado).
import { hayTipo } from "../nucleo/tipos.js";

const ULTIMO = "charta:ultimoModelo";
export function guardarUltimo(id) { try { localStorage.setItem(ULTIMO, id); } catch {} }
export function leerUltimo() { try { const id = localStorage.getItem(ULTIMO); return id && hayTipo(id) ? id : null; } catch { return null; } }

const BN_DEFECTO = "charta:bnDefecto";
// Por defecto, blanco y negro (23-11-2026, petición de Iván): solo el color si se quita en Ajustes ("0").
export const bnDefecto = () => { try { return localStorage.getItem(BN_DEFECTO) !== "0"; } catch { return true; } };
export function ponerBnDefecto(v) { try { localStorage.setItem(BN_DEFECTO, v ? "1" : "0"); } catch {} }
