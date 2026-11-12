# Charta · prueba en navegador (PLAN-DISENO fase 1). Necesita Chrome y Playwright para Python; no la ejecuta `npm test`.
# Uso, desde la raíz del repositorio (después de `python3 tools/build.py`):
#   python3 tests/navegador.py [carpeta_capturas]
# Sirve el repositorio como /Charta/ (igual que GitHub Pages) y recorre, a 390 × 844:
#   Inicio → Crear ficha → selector (Atrás lo cierra) → Diseño → 2 actividades → 25 alumnos → recargar (el borrador
#   vuelve con sus alumnos) → Inicio → «Seguir con la última» → favorita → enviar a Tabula y a Fori → imprimir.
# Fase 3: menú «⋯» de la cabecera, Ajustes en hoja inferior (Atrás, Escape, foco atrapado, tema), confirmar() (importado de
# src/ui/piezas.js), pestañas con su rol, selector modal con nombre y, en Inicio, selector, Diseño y Lengua (Letras):
# ningún control visible por debajo de 44 px ni texto de la app por debajo de 12,5 px.
# Falla (código 1) si hay errores de consola, desbordamiento horizontal a 360/390/768/1180 px, se pierde el borrador,
# Atrás de Android no cierra el selector o algún nombre de alumno sale de `charta:borrador` (otra clave, la URL de
# Tabula o el paquete de Fori). Con carpeta, guarda capturas (inicio, selector, diseño) a 390 y 768 px.
import asyncio, base64, functools, http.server, json, os, sys, tempfile, threading
from playwright.async_api import async_playwright

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CAPTURAS = sys.argv[1] if len(sys.argv) > 1 else None
ANCHOS = (360, 390, 768, 1180)
MARCA = 'Pruebaz'   # apellido ficticio: si aparece fuera del borrador, se ha escapado un nombre
NOMBRES = [f'{n} {MARCA}{chr(97 + i)}' for i, n in enumerate(
    'Ana Luis Marta Pablo Lucía Hugo Sara Leo Vera Iker Noa Teo Alma Gael Lola Unai Ciro Nora Olga Raúl Eva Ian Ada Bruno Celia'.split())]
fallos = []
# Fase 3: controles visibles < 44 px y texto < 12,5 px (fuera de las fichas: svg, .mini, .hoja). Solo lo no inerte.
AUDITORIA = """(() => {
  const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; };
  const desc = (e) => (e.id ? '#' + e.id : e.tagName.toLowerCase() + (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\\s+/)[0] : '')) + '«' + (e.textContent || '').trim().slice(0, 12) + '»';
  const controles = [], textos = [];
  for (const e of document.querySelectorAll('button, a[href], select, input:not([type=checkbox]):not([type=file]), textarea, label.check')) {
    if (!vis(e) || e.closest('[inert], svg')) continue;
    const r = e.getBoundingClientRect();
    if (r.height < 43.5 || r.width < 43.5) controles.push(desc(e) + ' ' + Math.round(r.width) + '×' + Math.round(r.height));
  }
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (w.nextNode()) {
    const p = w.currentNode.parentElement;
    if (!w.currentNode.textContent.trim() || p.closest('svg, [inert], .mini, .hoja, option, script') || !vis(p)) continue;
    const fs = parseFloat(getComputedStyle(p).fontSize);
    if (fs < 12.45) textos.push(desc(p) + ' ' + fs.toFixed(1) + 'px');
  }
  return { controles: [...new Set(controles)], textos: [...new Set(textos)] };
})()"""


def comprobar(cond, texto):
    print(('  ok  ' if cond else '  MAL ') + texto)
    if not cond: fallos.append(texto)


def servir():
    sitio = tempfile.mkdtemp(prefix='charta-sitio-')
    os.symlink(RAIZ, os.path.join(sitio, 'Charta'))
    class Callado(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    h = functools.partial(Callado, directory=sitio)
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), h)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return f'http://127.0.0.1:{srv.server_port}'


async def main():
    base = servir()
    app = base + '/Charta/dist/'
    errores, visitas = [], []
    async with async_playwright() as p:
        nav = await p.chromium.launch(executable_path='/usr/bin/google-chrome' if os.path.exists('/usr/bin/google-chrome') else None, args=['--no-sandbox'])
        ctx = await nav.new_context(viewport={'width': 390, 'height': 844}, service_workers='block')
        await ctx.add_init_script('window.print = () => { window.__impreso = (window.__impreso || 0) + 1; };')
        # Tabula y Fori de mentira: solo se apunta la URL a la que se ha ido.
        async def destino(ruta):
            visitas.append(ruta.request.url)
            await ruta.fulfill(status=200, content_type='text/html', body='<!doctype html><title>destino</title>')
        await ctx.route('**/tabula/**', destino)
        await ctx.route('**/Fori/**', destino)
        await ctx.route('https://**/*', lambda r: r.abort())   # sin red: la app no debe necesitarla
        pg = await ctx.new_page()
        pg.on('console', lambda m: m.type == 'error' and errores.append(m.text))
        pg.on('pageerror', lambda e: errores.append(str(e)))

        async def visible(sel): return await pg.locator(sel).first.is_visible()
        async def desborda():
            out = []
            for w in ANCHOS:
                await pg.set_viewport_size({'width': w, 'height': 844 if w < 700 else 1024 if w < 1000 else 820})
                await pg.wait_for_timeout(150)
                sw = await pg.evaluate('document.documentElement.scrollWidth - innerWidth')
                if sw > 1: out.append(f'{w} px (+{sw})')
            await pg.set_viewport_size({'width': 390, 'height': 844})
            return out
        async def captura(nombre):
            if not CAPTURAS: return
            os.makedirs(CAPTURAS, exist_ok=True)
            for w, h in ((390, 844), (768, 1024)):
                await pg.set_viewport_size({'width': w, 'height': h}); await pg.wait_for_timeout(200)
                await pg.screenshot(path=os.path.join(CAPTURAS, f'{nombre}_{w}.png'))
            await pg.set_viewport_size({'width': 390, 'height': 844})
        async def elegir_modelo(k=0):
            """En el selector abierto: baja por los niveles con la primera tarjeta y elige el modelo k (habilitado)."""
            for _ in range(5):
                if await pg.locator('.selector .sel-tarjeta.modelo').count(): break
                await pg.locator('.selector .sel-tarjeta').first.click()
            await pg.locator('.selector .sel-tarjeta.modelo:not([disabled])').nth(k).click()
            await pg.wait_for_selector('.selector', state='detached')
            await pg.wait_for_timeout(300)
        async def auditar(donde):
            """Fase 3: controles visibles de menos de 44 px y texto de la app de menos de 12,5 px (no cuentan las fichas)."""
            for w, h in ((390, 844), (768, 1024)):
                await pg.set_viewport_size({'width': w, 'height': h}); await pg.wait_for_timeout(150)
                r = await pg.evaluate(AUDITORIA)
                comprobar(not r['controles'], f'{donde} a {w} px: controles de 44 px ' + ', '.join(r['controles'][:6]))
                comprobar(not r['textos'], f'{donde} a {w} px: texto de 12,5 px o más ' + ', '.join(r['textos'][:6]))
            await pg.set_viewport_size({'width': 390, 'height': 844})
        async def foco_dentro(sel, n=14):
            """El tabulador no sale de `sel` (n pulsaciones)."""
            for _ in range(n):
                await pg.keyboard.press('Tab')
                if not await pg.evaluate(f'!!document.activeElement.closest({json.dumps(sel)})'): return False
            return True
        async def almacen():
            return await pg.evaluate('Object.fromEntries(Object.keys(localStorage).map((k) => [k, localStorage.getItem(k)]))')

        print('Inicio')
        await pg.goto(app); await pg.wait_for_selector('#inicio:not([hidden])')
        comprobar(not await desborda(), 'inicio sin desbordamiento')
        await captura('inicio')

        await auditar('inicio')

        print('Fase 3: menú «⋯», Ajustes, confirmar y pestañas')
        comprobar(await pg.get_attribute('#masBarra', 'aria-label') == 'Más opciones', 'cabecera: «⋯» con nombre')
        comprobar(await pg.locator('.barra button:visible').count() == 1, 'cabecera del inicio: solo «⋯» (cuenta y tema, en Ajustes)')
        await pg.click('#masBarra'); await pg.wait_for_selector('[role=menu]')
        comprobar(await pg.get_attribute('#masBarra', 'aria-expanded') == 'true', 'menú: aria-expanded')
        comprobar(await pg.evaluate("document.activeElement.getAttribute('role')") == 'menuitem', 'menú: el foco va al primer elemento')
        await pg.keyboard.press('ArrowDown')
        comprobar('Grupos' in await pg.evaluate('document.activeElement.textContent'), 'menú: las flechas mueven el foco')
        comprobar(await pg.evaluate("document.querySelector('#inicio').inert"), 'menú: lo de detrás, inerte')
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(300)
        comprobar(await pg.locator('[role=menu]').count() == 0, 'menú: Escape lo cierra')
        comprobar(await pg.evaluate("document.activeElement.id") == 'masBarra', 'menú: el foco vuelve a «⋯»')
        await pg.click('#masBarra'); await pg.locator('[role=menuitem]', has_text='Ajustes').click()
        await pg.wait_for_selector('.hoja-inf'); await pg.wait_for_timeout(250)
        comprobar(await pg.evaluate("(() => { const d = document.querySelector('.hoja-inf'); return d.getAttribute('aria-modal') === 'true' && document.getElementById(d.getAttribute('aria-labelledby'))?.textContent === 'Ajustes'; })()"), 'Ajustes: diálogo modal con nombre')
        comprobar(await visible('#iaCuenta') and await visible('#iaTema'), 'Ajustes: cuenta y tema')
        comprobar(await foco_dentro('.hoja-inf'), 'Ajustes: el tabulador no sale de la hoja')
        await auditar('ajustes')
        await pg.select_option('#iaTema', 'oscuro'); await pg.wait_for_timeout(100)
        comprobar(await pg.evaluate("document.documentElement.dataset.tema") == 'oscuro', 'Ajustes: tema oscuro')
        await captura('ajustes')
        await pg.select_option('#iaTema', 'sistema')
        await pg.go_back(); await pg.wait_for_timeout(300)
        comprobar(await pg.locator('.hoja-inf').count() == 0 and await visible('#inicio') and pg.url.startswith(app), 'Atrás cierra Ajustes sin salir del inicio')
        comprobar(await pg.locator('#ajustes').count() == 1 and not await visible('#ajustes'), 'Ajustes vuelve a su sitio, oculto')
        comprobar(not await pg.evaluate("document.querySelector('#inicio').inert || document.body.classList.contains('con-capa')"), 'al cerrar, nada queda inerte')
        comprobar(await pg.evaluate("document.querySelector('#iniFichas .pestanas').getAttribute('role') === 'tablist' && document.querySelectorAll('#iniFichas [role=tab][aria-selected=true]').length === 1"), 'pestañas con su rol')
        # confirmar(): sí, no, Escape y Atrás
        await pg.evaluate("import('/Charta/src/ui/piezas.js').then((m) => { window.__p = m; })"); await pg.wait_for_timeout(300)
        async def preguntar(accion):
            await pg.evaluate("window.__r = undefined; window.__p.confirmar({ titulo: '¿Borrar?', texto: 'Prueba', si: 'Borrar', peligro: true }).then((v) => { window.__r = v; }); 0")
            await pg.wait_for_selector('[role=alertdialog]'); await accion(); await pg.wait_for_timeout(350)
            return await pg.evaluate('window.__r')
        comprobar(await preguntar(lambda: pg.click('[role=alertdialog] button.peligro')) is True, 'confirmar: «Borrar» → sí')
        comprobar(await preguntar(lambda: pg.keyboard.press('Escape')) is False, 'confirmar: Escape → no')
        comprobar(await preguntar(lambda: pg.go_back()) is False and pg.url.startswith(app), 'confirmar: Atrás → no (sin salir de la app)')
        comprobar(await preguntar(lambda: pg.keyboard.press('Enter')) is False, 'confirmar: el foco empieza en «Cancelar»')

        print('Selector desde Inicio y Atrás de Android')
        async def abrir_crear():
            if not await visible('#iniMaterias'): await pg.click('#iniCrear')
            if await visible('#iniMaterias'): await pg.locator('#iniMateriasBtn button', has_text='Matemáticas').click()
            await pg.wait_for_selector('.selector')
        await abrir_crear()
        d = await desborda(); comprobar(not d, 'selector sin desbordamiento ' + ', '.join(d))
        await captura('selector')
        comprobar(await pg.evaluate("(() => { const d = document.querySelector('.selector'); return d.getAttribute('aria-modal') === 'true' && !!document.getElementById(d.getAttribute('aria-labelledby'))?.textContent && document.querySelector('main').inert; })()"), 'selector: diálogo modal con nombre')
        comprobar(await foco_dentro('.selector', 6), 'selector: el tabulador no sale')
        await auditar('selector')
        await pg.go_back(); await pg.wait_for_timeout(300)
        comprobar(await pg.locator('.selector').count() == 0, 'Atrás cierra el selector')
        comprobar(await visible('#inicio') and pg.url.startswith(app), 'Atrás vuelve al inicio sin salir de la app')
        if not pg.url.startswith(app): await pg.goto(app); await pg.wait_for_selector('#inicio:not([hidden])')
        await abrir_crear(); await elegir_modelo(0)
        comprobar(await visible('main'), 'diseño abierto tras elegir el modelo')

        print('Diseño: 2 actividades y 25 alumnos')
        await pg.locator('#acts button.anadir').first.click(); await pg.wait_for_selector('.selector')
        await elegir_modelo(1)
        comprobar(await pg.locator('#acts .act').count() == 2, 'dos actividades')
        await pg.locator('#acts .elegido button').first.click(); await pg.wait_for_selector('.selector')
        await pg.go_back(); await pg.wait_for_timeout(300)
        comprobar(await pg.locator('.selector').count() == 0 and await visible('main'), 'Atrás cierra el selector y sigue en el diseño')
        await pg.fill('#titulo', 'Prueba de navegador'); await pg.dispatch_event('#titulo', 'change')
        await pg.fill('#alumnos', '\n'.join(NOMBRES)); await pg.dispatch_event('#alumnos', 'change')
        await pg.wait_for_timeout(600)
        comprobar(await pg.locator('#hojas .hoja').count() == 25, '25 hojas en la vista previa')
        d = await desborda(); comprobar(not d, 'diseño sin desbordamiento ' + ', '.join(d))
        await captura('diseno')
        await pg.evaluate('scrollTo(0, 0)')
        comprobar(await visible('#aInicio') and await visible('#barraTitulo') and not await visible('#marca'), 'cabecera del diseño: atrás + título + «⋯»')
        comprobar(await pg.inner_text('#barraTitulo') == 'Prueba de navegador', 'cabecera del diseño: título de la ficha')
        await auditar('diseño')
        ls = await almacen()
        comprobar('charta:borrador' in ls and MARCA in ls['charta:borrador'], 'borrador guardado con los alumnos')
        b = json.loads(ls['charta:borrador']); comprobar(MARCA not in json.dumps(b['composicion']), 'la composición del borrador no lleva nombres')

        print('Recargar: el borrador vuelve')
        await pg.reload(); await pg.wait_for_timeout(1200)
        comprobar(await visible('main'), 'tras recargar sigue en el diseño')
        comprobar(await pg.locator('#acts .act').count() == 2, 'tras recargar, las dos actividades')
        comprobar(await pg.input_value('#alumnos') == '\n'.join(NOMBRES), 'tras recargar, los alumnos')
        comprobar(await pg.input_value('#titulo') == 'Prueba de navegador', 'tras recargar, el título')
        comprobar(await pg.locator('#hojas .hoja').count() == 25, 'tras recargar, 25 hojas')
        await pg.go_back(); await pg.wait_for_timeout(300)
        comprobar(await visible('#inicio'), 'Atrás desde el diseño vuelve al inicio')
        comprobar(await visible('#iniDescartar') and 'sin imprimir' in await pg.inner_text('#iniSeguir'), 'Inicio ofrece seguir con el borrador')
        await pg.click('#iniSeguir'); await pg.wait_for_timeout(600)
        comprobar(await pg.input_value('#alumnos') == '\n'.join(NOMBRES) and await pg.locator('#acts .act').count() == 2, '«Seguir con la última» recupera el borrador')

        print('Favorita, Tabula y Fori sin nombres')
        await pg.click('#favorito'); await pg.wait_for_timeout(200)
        ls = await almacen()
        fuera = [k for k, v in ls.items() if k != 'charta:borrador' and MARCA in v]
        comprobar(not fuera, 'ninguna otra clave lleva nombres ' + ', '.join(fuera))
        comprobar('charta:favoritos' in ls, 'favorita guardada')
        await pg.click('#aTabula'); await pg.wait_for_timeout(1500)
        u = next((v for v in visitas if '/tabula/' in v), '')
        datos = ''
        if 'charta=' in u:
            c = u.split('charta=')[1].split('&')[0]; datos = base64.urlsafe_b64decode(c + '=' * (-len(c) % 4)).decode()
        comprobar(bool(datos) and MARCA not in datos and MARCA not in u, 'enlace a Tabula sin nombres')
        comprobar(MARCA not in (await almacen()).get('charta:aTabula', ''), 'miniatura para Tabula sin nombres')
        await pg.goto(app); await pg.wait_for_timeout(800)
        await pg.click('#iniSeguir'); await pg.wait_for_timeout(600)
        await pg.click('#aFori'); await pg.wait_for_timeout(1500)
        fori = (await almacen()).get('charta:aFori', '')
        comprobar(bool(fori) and MARCA not in fori, 'paquete de Fori sin nombres')
        comprobar(any('/Fori/' in v for v in visitas), 'se abre Fori')

        print('Imprimir')
        await pg.goto(app); await pg.wait_for_timeout(800)
        await pg.click('#iniSeguir'); await pg.wait_for_timeout(600)
        await pg.click('#imprimir'); await pg.wait_for_timeout(800)
        comprobar(await pg.evaluate('window.__impreso || 0') == 1, 'se imprime')
        comprobar(await pg.locator('#impresion .pag').count() == 25, '25 páginas para imprimir')
        ls = await almacen()
        comprobar('charta:borrador' not in ls, 'al imprimir se borra el borrador')
        comprobar(not [k for k, v in ls.items() if MARCA in v], 'tras imprimir no queda ningún nombre guardado')
        comprobar('Prueba de navegador' in ls.get('charta:recientes', ''), 'la ficha pasa a Recientes')

        print('Fase 3: «⋯» → Nueva ficha de Lengua (Letras)')
        await pg.click('#masBarra'); await pg.locator('[role=menuitem]', has_text='Nueva ficha').click(); await pg.wait_for_selector('.selector')
        await pg.locator('.selector .sel-tarjeta').first.click()
        await pg.locator('.selector .sel-tarjeta', has_text='Lengua').first.click()
        await elegir_modelo(0)
        comprobar(await visible('#secLetras') and await pg.locator('#acts .act').count() == 1, 'nueva ficha de Lengua con el mapa de letras')
        await auditar('diseño de Lengua')
        await captura('lengua')

        comprobar(not errores, 'sin errores de consola' + ('' if not errores else ': ' + ' | '.join(errores[:5])))
        await nav.close()
    print(f'navegador: {"OK" if not fallos else str(len(fallos)) + " fallos"}')
    sys.exit(1 if fallos else 0)

asyncio.run(main())
