// Charta · pequeñas preferencias del dispositivo: último modelo elegido y blanco y negro por defecto.
import { hayTipo } from "../nucleo/tipos.js";

const ULTIMO = "charta:ultimoModelo";
export function guardarUltimo(id) { try { localStorage.setItem(ULTIMO, id); } catch {} }
export function leerUltimo() { try { const id = localStorage.getItem(ULTIMO); return id && hayTipo(id) ? id : null; } catch { return null; } }

const BN_DEFECTO = "charta:bnDefecto";
export const bnDefecto = () => { try { return localStorage.getItem(BN_DEFECTO) === "1"; } catch { return false; } };
export function ponerBnDefecto(v) { try { localStorage.setItem(BN_DEFECTO, v ? "1" : "0"); } catch {} }
