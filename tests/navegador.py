# Charta · prueba en navegador (PLAN-DISENO fase 1). Necesita Chrome y Playwright para Python; no la ejecuta `npm test`.
# Uso, desde la raíz del repositorio (después de `python3 tools/build.py`):
#   python3 tests/navegador.py [carpeta_capturas]
# Sirve el repositorio como /Charta/ (igual que GitHub Pages) y recorre, a 390 × 844:
#   Inicio → Crear ficha → selector (Atrás lo cierra) → Diseño → 2 actividades → 25 alumnos → recargar (el borrador
#   vuelve con sus alumnos) → Inicio → «Seguir con la última» → favorita → enviar a Tabula y a Fori → imprimir.
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
        async def almacen():
            return await pg.evaluate('Object.fromEntries(Object.keys(localStorage).map((k) => [k, localStorage.getItem(k)]))')

        print('Inicio')
        await pg.goto(app); await pg.wait_for_selector('#inicio:not([hidden])')
        comprobar(not await desborda(), 'inicio sin desbordamiento')
        await captura('inicio')

        print('Selector desde Inicio y Atrás de Android')
        async def abrir_crear():
            if not await visible('#iniMaterias'): await pg.click('#iniCrear')
            if await visible('#iniMaterias'): await pg.locator('#iniMateriasBtn button', has_text='Matemáticas').click()
            await pg.wait_for_selector('.selector')
        await abrir_crear()
        d = await desborda(); comprobar(not d, 'selector sin desbordamiento ' + ', '.join(d))
        await captura('selector')
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

        comprobar(not errores, 'sin errores de consola' + ('' if not errores else ': ' + ' | '.join(errores[:5])))
        await nav.close()
    print(f'navegador: {"OK" if not fallos else str(len(fallos)) + " fallos"}')
    sys.exit(1 if fallos else 0)

asyncio.run(main())
