// Charta · app. Director (fase 2 de PLAN-DISENO): crea las vistas de src/ui/ y las conecta con un `ctx` compartido.
// 4.8: pantalla de inicio · 4.1: selector y opciones · 4.2: compositor · 4.3: alumnos y variantes · 4.4: favoritas y recientes · 4.5: PWA y tableta · 5.1: nube · 5.2: Tabula · 5.3: Fori.
import { CATALOGO } from "./nucleo/catalogo.js";
import { generar, modelo } from "./nucleo/ficha.js";
import { erroresFicha } from "./nucleo/lector.js";
import { listaTipos } from "./tipos/index.js";
import { hojas } from "./render/hoja.js";
import { hayTipo } from "./nucleo/tipos.js";
import { cursos, materias } from "./ui/navegacion.js";
import { abrirSelector } from "./ui/selector.js";
import { crearGuardadas } from "./ui/guardadas.js";
import { saludo, crearUsos, accesosRapidos, ultimaComposicion, materiasDisponibles, fechaCorta } from "./ui/inicio.js";
import { crearInicio } from "./ui/inicio_vista.js";
import { leerAlumnos, MAX_ALUMNOS } from "./ui/alumnos.js";
import { registrarSW } from "./pwa/registro.js";
import { iniciarTema } from "./ui/tema.js";
import { crearBorrador } from "./ui/borrador.js";
import { todasLasFuentes } from "./render/fuentes.js";
import { guardarUltimo, leerUltimo, bnDefecto, ponerBnDefecto } from "./ui/preferencias.js";
import { crearCompositor } from "./ui/compositor.js";
import { crearLetrasVista } from "./ui/letras_vista.js";
import { crearFuentesVista } from "./ui/fuentes_vista.js";
import { crearPrevia } from "./ui/previa.js";
import { crearListaFichas } from "./ui/lista_fichas.js";
import { crearNubeVista } from "./ui/nube_vista.js";
import { crearEnlaces } from "./ui/enlaces.js";
import { crearAjustes } from "./ui/ajustes_vista.js";
import { abrirMenu, ICONOS, avisar, confirmar } from "./ui/piezas.js";
import { URL_FORI, URL_TABULA } from "./rutas.js";
import { $ } from "./ui/dom.js";

// API pública: la usa el iframe de Tabula (contrato por escribir en ESQUEMA.md, fase 7).
globalThis.Charta = { generar, modelo, erroresFicha, listaTipos, hojas, CATALOGO };

function iniciar(tema) {
  // `ctx` reúne el estado compartido y las vistas (cada una se asigna al crearla; se usan al responder a eventos, no al crearlas).
  const ctx = { semilla: 1, vista: "diseno", pusheado: false, listo: false, enNube: null, grupoBorrador: null };   // 4.8: vista = "inicio" | "diseno"
  let inicioVista = null;
  ctx.almacen = (() => { try { return localStorage; } catch { return { getItem: () => null, setItem() {} }; } })();
  ctx.guardadas = crearGuardadas(ctx.almacen);   // Paso 4.4 · favoritas (con su semilla: sale la misma ficha) y recientes (al imprimir). Sin nombres de alumnos.
  ctx.borrador = crearBorrador(ctx.almacen);
  ctx.usos = crearUsos(ctx.almacen);
  ctx.aDiseno = aDiseno; ctx.refrescarInicio = refrescarInicio;

  ctx.comp = crearCompositor(ctx);
  ctx.letras = crearLetrasVista(ctx);
  ctx.fuentes = crearFuentesVista(ctx);
  ctx.previa = crearPrevia(ctx);
  ctx.lista = crearListaFichas(ctx);
  ctx.nubeV = crearNubeVista(ctx);
  ctx.enlaces = crearEnlaces(ctx);
  const { comp, nubeV, enlaces } = ctx, entrada = enlaces.entrada, idUrl = nubeV.idUrl, aFori = nubeV.aFori;
  const pintar = () => ctx.previa.pintar();

  // Paso 4.8 · pantalla de inicio: saludo, Crear ficha, Seguir con la última, accesos rápidos y Mis fichas.
  const nombreModelo = (id) => { try { return modelo(id).nombre; } catch { return id; } };
  const colorDe = (id) => { try { return modelo(id).color; } catch { return "verde"; } };
  // «Seguir con la última»: el borrador (la ficha a medias, con sus alumnos) y, si no hay, la última impresa o el último modelo.
  const ultimaDeInicio = () => { const b = ctx.borrador.leer(hayTipo); return b ? { borrador: b } : ultimaComposicion({ recientes: ctx.guardadas.recientes(), ultimo: leerUltimo(), hayTipo }); };
  function estadoInicio() {
    const rec = ctx.guardadas.recientes(), fav = ctx.guardadas.favoritos(), e = nubeV.nube.estado(), dentro = e.estado === "dentro", u = ultimaDeInicio();
    let seguir = null;
    if (u?.borrador) {
      const c = u.borrador.composicion, t = c.actividades[0].tipo, n = leerAlumnos(u.borrador.alumnos).length;
      seguir = { nombre: c.titulo || "Ficha sin terminar", tipo: t, color: colorDe(t), borrador: true,
        detalle: c.actividades.map((a) => nombreModelo(a.tipo)).join(" + ") + (n ? ` · ${Math.min(n, MAX_ALUMNOS)} alumnos` : "") + " · sin imprimir" };
    } else if (u?.composicion) {
      const c = u.composicion, t = c.actividades[0].tipo;
      seguir = { nombre: c.nombre || "Ficha", tipo: t, color: colorDe(t),
        detalle: c.actividades.map((a) => nombreModelo(a.tipo)).join(" + ") + (c.fecha ? " · " + fechaCorta(c.fecha) : "") };
    } else if (u?.modelo) seguir = { nombre: nombreModelo(u.modelo), tipo: u.modelo, color: colorDe(u.modelo), detalle: "Último modelo elegido" };
    const rapidos = accesosRapidos({ usos: ctx.usos.mapa(), recientes: rec, ultimo: leerUltimo(), hayTipo })
      .map((id) => ({ id, nombre: nombreModelo(id), color: colorDe(id) }));
    return { saludo: saludo(new Date().getHours(), dentro ? e.usuario?.nombre : ""), seguir, rapidos, fav, rec, nube: dentro ? ctx.enNube : null, dentro };
  }
  function refrescarInicio() { if (ctx.vista === "inicio") inicioVista?.pintar(estadoInicio()); }
  function mostrar(v) {
    ctx.vista = v; document.body.dataset.vista = v;
    $("inicio").hidden = v !== "inicio"; document.querySelector("main").hidden = v === "inicio";
    // Cabecera única (fase 3): en el inicio, la marca; en el diseño, atrás + título de la ficha (editable, fase 4). «⋯» en las dos.
    $("aInicio").hidden = $("titulo").hidden = v === "inicio"; $("marca").hidden = v !== "inicio";
    if (v === "inicio") { inicioVista.cerrarMaterias(); refrescarInicio(); }
    window.scrollTo(0, 0);
  }
  // El botón «Atrás» de Android vuelve al inicio (se apunta una entrada de historial al entrar en el diseño desde el inicio).
  function aDiseno() { if (ctx.vista === "diseno") return; history.pushState({ diseno: 1 }, ""); ctx.pusheado = true; mostrar("diseno"); }
  function aInicio() { if (ctx.vista === "inicio") return; if (ctx.pusheado) history.back(); else mostrar("inicio"); }
  addEventListener("popstate", () => { ctx.pusheado = !!history.state?.diseno; mostrar(ctx.pusheado ? "diseno" : "inicio"); });
  $("aInicio").onclick = aInicio; $("aInicio").innerHTML = ICONOS.atras;
  $("masBarra").innerHTML = ICONOS.mas;
  $("masBarra").onclick = () => abrirMenu($("masBarra"), ctx.vista === "inicio" ? [
    { texto: "Ajustes", icono: ICONOS.ajustes, accion: ajustes.abrir }, "-",
    { texto: "Grupos de Tabula", icono: ICONOS.grupos, accion: () => { location.href = URL_TABULA; } },
    { texto: "Pizarra Fori", icono: ICONOS.pizarra, accion: () => { location.href = URL_FORI; } },
  ] : [
    { texto: "Nueva ficha", icono: ICONOS.nueva, accion: () => abrirSelector({ tamano: "completa", alElegir: nuevaFicha }) },
    { texto: "Ajustes", icono: ICONOS.ajustes, accion: ajustes.abrir },
  ]);
  // Fase 4 · barra inferior: Ver ficha + Imprimir + «⋯» con el resto de acciones (antes, la tarjeta «Más acciones»).
  $("masFicha").innerHTML = ICONOS.mas;
  $("masFicha").onclick = () => { const fav = ctx.lista.esFavorita(); abrirMenu($("masFicha"), [
    { texto: "Otra variante", icono: ICONOS.variante, accion: ctx.previa.otraVariante },
    { texto: fav ? "Quitar de favoritas" : "Añadir a favoritas", icono: fav ? ICONOS.estrellaLlena : ICONOS.estrella, accion: ctx.lista.alternarFavorita },
    { texto: "Guardar en la nube", icono: ICONOS.nube, accion: nubeV.guardarEnNube }, "-",
    { texto: "Enviar a Tabula", icono: ICONOS.tabula, accion: enlaces.enviarTabula },
    { texto: "Proyectar en Fori", icono: ICONOS.fori, accion: enlaces.proyectar },
  ]); };
  /** «Crear ficha»: una ficha nueva con el modelo elegido (la composición anterior no se toca: sigue en Recientes). */
  function nuevaFicha(id, curso) {
    if (!id || !hayTipo(id)) return;
    comp.editores.splice(1); comp.cuentas = [1]; comp.recolocar();
    comp.editores[0].poner(id, undefined, curso);
    ctx.semilla = 1; $("titulo").value = ""; $("bn").checked = bnDefecto();
    ctx.usos.anotar(id); guardarUltimo(id); comp.letraMateria();
    aDiseno(); pintar();
  }
  inicioVista = crearInicio({
    hayTipo, nombreModelo, colorDe,
    materias: () => materiasDisponibles(cursos, materias),
    crear: (materia) => abrirSelector({ tamano: "completa", ruta: materia ? { materia } : null, alElegir: nuevaFicha }),
    crearModelo: nuevaFicha,
    seguir: () => { const u = ultimaDeInicio(); if (u?.borrador) comp.abrirGuardada(u.borrador.composicion, u.borrador); else if (u?.composicion) comp.abrirGuardada(u.composicion); else if (u?.modelo) nuevaFicha(u.modelo); },
    hayBorrador: () => ctx.borrador.hay(hayTipo),
    descartarBorrador: () => { ctx.borrador.descartar(); refrescarInicio(); },
    abrir: comp.abrirGuardada,
    duplicar: (c, nombre) => { const n = ctx.guardadas.duplicar(c, nombre); refrescarInicio(); avisar(`Copia «${n}» añadida a favoritas.`); },
    quitar: async (pestana, { i, id, nombre }) => {
      if (pestana !== "nube") { ctx.guardadas.quitar(pestana, i); refrescarInicio(); return avisar("Quitada de la lista."); }
      if (!await confirmar({ titulo: "¿Borrar de la nube?", texto: `«${nombre}» se borrará de tu nube; las copias de otros dispositivos no cambian.`, si: "Borrar", peligro: true })) return;
      try { await nubeV.nube.borrar(id); ctx.enNube = await nubeV.nube.listar().catch(() => ctx.enNube); refrescarInicio(); avisar("Borrada de la nube."); }
      catch (e) { avisar(e.message, { error: true }); }
    },
    leerNube: () => { if (!ctx.enNube) nubeV.leerNube(); },
  });
  // Fase 3: Ajustes en una hoja inferior (único sitio de la cuenta y del tema), desde «⋯» en la cabecera.
  const ajustes = crearAjustes({
    tema,
    fuentes: () => ({ fuentes: todasLasFuentes(), fuente: $("fuente").value }),
    ponerFuente: (id) => { ctx.fuentes.elegirFuente(id); pintar(); },
    bnDefecto,
    ponerBn: (v) => { ponerBnDefecto(v); $("bn").checked = v; pintar(); },
    hayBorrador: () => ctx.borrador.hay(hayTipo),
    descartarBorrador: () => { ctx.borrador.descartar(); refrescarInicio(); },
  });

  ctx.lista.pintar();
  const ultimo = leerUltimo();
  if (!entrada.comp && !idUrl) $("bn").checked = bnDefecto();
  comp.nuevoEditor(entrada.comp?.actividades[0].tipo || ultimo || listaTipos()[0]); pintar();
  if (entrada.comp) { comp.abrirGuardada(entrada.comp); if (aFori) enlaces.proyectar(); }
  // Los enlaces directos (?ficha=, ?comp=, ?grupo=, ?desde=tabula…) van al diseño; si no, la app abre en el inicio.
  const directo = !!(idUrl || entrada.comp || entrada.grupo || entrada.desdeTabula || entrada.sesion || entrada.tarea);
  // Recarga (o vuelta tras cerrarla Android) estando en el diseño: se recupera el borrador allí mismo.
  const b = !directo && history.state?.diseno ? ctx.borrador.leer(hayTipo) : null;
  if (b) { comp.abrirGuardada(b.composicion, b); ctx.pusheado = true; }
  else if (!directo && history.state?.diseno) history.replaceState(null, "");
  mostrar(directo || b ? "diseno" : "inicio");
  comp.ponerMateria1();   // al arrancar mandan la letra guardada o la de la composición abierta
  ctx.listo = true;
}

if (typeof document !== "undefined") {
  iniciar(iniciarTema());
  // Paso 4.5 · sin conexión. Si llega una versión nueva, se avisa (no se recarga solo: se perdería lo escrito).
  registrarSW(() => { $("aviso").hidden = false; $("recargar").onclick = () => location.reload(); });
}
