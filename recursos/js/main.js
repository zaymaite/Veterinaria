const FOTO = 'recursos/imagenes/animales-inicio.webp';
const ANCHO = 1671;
const ALTO = 941;

const PIEZAS = [
    { nombre: 'golden', d: 0.9, dx: 0, dy: 14, s: 0.92,
      pts: [[515,15],[905,15],[905,280],[840,285],[840,390],[872,420],[870,690],[740,628],[600,640],[612,380],[515,370]] },

    { nombre: 'gato-blanco', d: 1.4, dx: -24, dy: 0,
      pts: [[440,368],[515,368],[614,378],[604,645],[555,702],[485,832],[452,690]] },

    { nombre: 'perro-mestizo', d: 1.4, dx: 24, dy: 0,
      pts: [[905,15],[1168,15],[1168,432],[1137,432],[1122,560],[1117,792],[1040,765],[940,770],[915,700],[870,690],[872,420],[840,390],[840,285],[905,280]] },

    { nombre: 'caniche', d: 1.85, dx: -24, dy: 0,
      pts: [[200,395],[442,395],[452,690],[485,832],[400,848],[396,885],[200,885]] },

    { nombre: 'gatito', d: 1.85, dx: 24, dy: 0,
      pts: [[1137,428],[1306,428],[1302,520],[1292,798],[1210,792],[1117,792],[1122,560]] },

    { nombre: 'gato-atigrado', d: 2.25, dx: 24, dy: 0,
      pts: [[1302,495],[1482,495],[1482,808],[1292,798],[1302,520]] },

    { nombre: 'plato', d: 2.6, dx: 0, dy: 22,
      pts: [[555,700],[600,638],[740,624],[872,688],[915,698],[942,768],[965,800],[945,898],[392,898],[396,846],[485,830]] },

    { nombre: 'juguetes', d: 2.9, dx: 22, dy: 0,
      pts: [[942,768],[1040,762],[1117,790],[1210,790],[1292,796],[1482,806],[1524,826],[1524,912],[888,912],[888,812]] }
];

const TIEMPO_MIN_CARGA = 2400;
const FIN_ARMADO = 4.2;

const reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function armarPiezas() {
    const escenario = document.getElementById('escenario');
    PIEZAS.forEach(p => {
        const poligono = p.pts
            .map(([x, y]) => `${(x / ANCHO * 100).toFixed(2)}% ${(y / ALTO * 100).toFixed(2)}%`)
            .join(', ');
        const div = document.createElement('div');
        div.className = 'pieza';
        div.dataset.nombre = p.nombre;
        div.style.backgroundImage = `url(${FOTO})`;
        div.style.clipPath = `polygon(${poligono})`;
        div.style.setProperty('--d', p.d + 's');
        div.style.setProperty('--dx', p.dx + '%');
        div.style.setProperty('--dy', p.dy + '%');
        div.style.setProperty('--s', p.s || 1);
        div.setAttribute('aria-hidden', 'true');
        escenario.appendChild(div);
    });
    escenario.classList.add('con-piezas');
}

function esperarImagen() {
    return new Promise(resolve => {
        const img = new Image();
        img.onload = img.onerror = resolve;
        img.src = FOTO;
    });
}

function esperar(ms) {
    return new Promise(r => setTimeout(r, ms));
}

async function iniciar() {
    const cargador = document.getElementById('cargador');

    if (reducirMovimiento) {
        cargador.remove();
        document.body.classList.remove('is-loading');
        document.body.classList.add('is-ready', 'is-built');
        return;
    }

    armarPiezas();
    await Promise.all([esperarImagen(), document.fonts ? document.fonts.ready : null, esperar(TIEMPO_MIN_CARGA)]);

    cargador.classList.add('cargador--salida');
    await esperar(650);
    document.body.classList.remove('is-loading');
    document.body.classList.add('is-ready');
    await esperar(250);
    cargador.remove();

    await esperar(FIN_ARMADO * 1000);
    document.body.classList.add('is-built');
}

iniciar();

const CINTA = {
    velocidad: 90,
    curvatura: 90,
    tamanoLetra: 46,
    espaciado: 2,
    anchoCinta: 86,
    colorCinta: '#F0475A',
    separador: '🐾',
    pausarAlPasar: true
};

function crearCinta() {
    const cont = document.getElementById('cinta');
    if (!cont) return;
    const items = cont.dataset.items.split('|');
    const secuencia = items.map(t => `${CINTA.separador}  ${t.toUpperCase()}  `).join('');
    const NS = 'http://www.w3.org/2000/svg';

    let offset = 0, largoSecuencia = 1, velocidadActual = CINTA.velocidad, objetivo = CINTA.velocidad;
    let textPath, svg;

    function construir() {
        const ancho = cont.clientWidth || window.innerWidth;
        const chico = ancho < 700;
        const letra = chico ? 28 : CINTA.tamanoLetra;
        const grosor = chico ? 56 : CINTA.anchoCinta;
        const amplitud = (CINTA.curvatura / 90) * (chico ? 22 : 38);
        const largoOla = chico ? 520 : 900;
        const alto = grosor + amplitud * 2 + 20;
        const medio = alto / 2;

        let d = '';
        for (let x = -200; x <= ancho + 200; x += 8) {
            const y = medio + Math.sin((x / largoOla) * Math.PI * 2) * amplitud;
            d += (x === -200 ? 'M' : 'L') + x + ' ' + y.toFixed(1) + ' ';
        }

        cont.innerHTML = '';
        svg = document.createElementNS(NS, 'svg');
        svg.setAttribute('viewBox', `0 0 ${ancho} ${alto}`);
        svg.setAttribute('height', alto);
        svg.setAttribute('aria-hidden', 'true');

        const camino = document.createElementNS(NS, 'path');
        camino.setAttribute('id', 'caminoCinta');
        camino.setAttribute('d', d);
        camino.setAttribute('fill', 'none');
        camino.setAttribute('stroke', CINTA.colorCinta);
        camino.setAttribute('stroke-width', grosor);
        svg.appendChild(camino);

        const texto = document.createElementNS(NS, 'text');
        texto.setAttribute('font-size', letra);
        texto.setAttribute('letter-spacing', CINTA.espaciado);
        texto.setAttribute('dy', '0.35em');
        textPath = document.createElementNS(NS, 'textPath');
        textPath.setAttribute('href', '#caminoCinta');
        texto.appendChild(textPath);
        svg.appendChild(texto);
        cont.appendChild(svg);

        textPath.textContent = secuencia;
        largoSecuencia = texto.getComputedTextLength() || 1;
        const repeticiones = Math.ceil(camino.getTotalLength() / largoSecuencia) + 2;
        textPath.textContent = secuencia.repeat(repeticiones);
        document.querySelector('.cinta').classList.add('lista');
    }

    let ultimo = performance.now();
    function animar(ahora) {
        const dt = Math.min((ahora - ultimo) / 1000, 0.05);
        ultimo = ahora;
        velocidadActual += (objetivo - velocidadActual) * 0.08;
        offset = (offset - velocidadActual * dt) % largoSecuencia;
        textPath.setAttribute('startOffset', offset);
        requestAnimationFrame(animar);
    }

    if (CINTA.pausarAlPasar) {
        cont.addEventListener('mouseenter', () => objetivo = 0);
        cont.addEventListener('mouseleave', () => objetivo = CINTA.velocidad);
    }

    let espera;
    window.addEventListener('resize', () => {
        clearTimeout(espera);
        espera = setTimeout(construir, 200);
    });

    construir();
    if (!reducirMovimiento) requestAnimationFrame(animar);
}

function crearCarrusel() {
    const raiz = document.getElementById('carrusel');
    if (!raiz) return;
    const marco = raiz.querySelector('.carrusel__marco');
    const pista = raiz.querySelector('.carrusel__pista');
    const items = [...raiz.querySelectorAll('.carrusel__item')];
    const puntos = raiz.querySelector('.carrusel__puntos');
    const anchoBase = Number(raiz.dataset.baseWidth) || 300;
    const GAP = 16, PAD = 16;

    let indice = 0, x = 0, paso = 0, animacion;

    function medir() {
        const columna = raiz.parentElement.clientWidth || anchoBase;
        const ancho = Math.min(anchoBase, columna, window.innerWidth - 48);
        marco.style.setProperty('--ancho', ancho + 'px');
        paso = ancho - PAD * 2 + GAP;
        x = -indice * paso;
        pintar();
    }

    function pintar() {
        pista.style.transform = `translateX(${x}px)`;
        items.forEach((item, i) => {
            const p = (x + i * paso) / paso;
            const giro = Math.max(-90, Math.min(90, -p * 90));
            item.style.transform = `rotateY(${giro}deg)`;
        });
    }

    function irA(i) {
        indice = Math.max(0, Math.min(items.length - 1, i));
        const desde = x, hasta = -indice * paso, inicio = performance.now(), dur = 450;
        cancelAnimationFrame(animacion);
        const paso_ = ahora => {
            const t = Math.min((ahora - inicio) / dur, 1);
            const e = 1 - Math.pow(1 - t, 3);
            x = desde + (hasta - desde) * e;
            pintar();
            if (t < 1) animacion = requestAnimationFrame(paso_);
        };
        animacion = requestAnimationFrame(paso_);
        [...puntos.children].forEach((b, n) => b.setAttribute('aria-selected', n === indice));
    }

    items.forEach((item, n) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('role', 'tab');
        b.setAttribute('aria-label', 'Ver ' + item.querySelector('h3').textContent);
        b.addEventListener('click', () => irA(n));
        puntos.appendChild(b);
    });

    let arrastrando = false, inicioX = 0, inicioPista = 0, ultimoX = 0, ultimoT = 0, vel = 0;
    marco.addEventListener('pointerdown', e => {
        if (e.target.closest('.carrusel__puntos')) return;
        arrastrando = true;
        cancelAnimationFrame(animacion);
        inicioX = ultimoX = e.clientX;
        ultimoT = performance.now();
        inicioPista = x;
        marco.setPointerCapture(e.pointerId);
        marco.classList.add('arrastrando');
    });
    marco.addEventListener('pointermove', e => {
        if (!arrastrando) return;
        let dx = e.clientX - inicioX;
        const min = -(items.length - 1) * paso;
        let nuevo = inicioPista + dx;
        if (nuevo > 0) nuevo *= 0.35;
        if (nuevo < min) nuevo = min + (nuevo - min) * 0.35;
        x = nuevo;
        const ahora = performance.now();
        vel = (e.clientX - ultimoX) / Math.max(ahora - ultimoT, 1);
        ultimoX = e.clientX; ultimoT = ahora;
        pintar();
    });
    const soltar = () => {
        if (!arrastrando) return;
        arrastrando = false;
        marco.classList.remove('arrastrando');
        const movido = x - inicioPista;
        if (movido < -paso * 0.2 || vel < -0.5) irA(indice + 1);
        else if (movido > paso * 0.2 || vel > 0.5) irA(indice - 1);
        else irA(indice);
    };
    marco.addEventListener('pointerup', soltar);
    marco.addEventListener('pointercancel', soltar);

    marco.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight') irA(indice + 1);
        if (e.key === 'ArrowLeft') irA(indice - 1);
    });

    window.addEventListener('resize', medir);
    medir();
    irA(0);
}

function aparecerAlBajar() {
    if (reducirMovimiento || !('IntersectionObserver' in window)) return;
    document.documentElement.classList.add('js-revelar');
    const obs = new IntersectionObserver(entradas => {
        entradas.forEach(en => {
            if (en.isIntersecting) { en.target.classList.add('visible'); obs.unobserve(en.target); }
        });
    }, { threshold: 0.15 });
    document.querySelectorAll('.revelar').forEach(el => obs.observe(el));
}

function menuActivo() {
    const links = [...document.querySelectorAll('.menu a')];
    const secciones = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
    const obs = new IntersectionObserver(entradas => {
        entradas.forEach(en => {
            if (!en.isIntersecting) return;
            links.forEach(a => a.classList.toggle('activo', a.getAttribute('href') === '#' + en.target.id));
        });
    }, { rootMargin: '-45% 0px -50% 0px' });
    secciones.forEach(s => obs.observe(s));
}

const WHATSAPP = '5493516220419';
function formularioWhatsApp() {
    const form = document.getElementById('formulario');
    if (!form) return;
    form.addEventListener('submit', e => {
        e.preventDefault();
        const d = new FormData(form);
        let msj = `¡Hola! Soy ${d.get('nombre').trim()}.`;
        if (d.get('mascota').trim()) msj += ` Mi mascota se llama ${d.get('mascota').trim()}.`;
        msj += ` Quería consultar por: ${d.get('servicio')}.`;
        if (d.get('mensaje').trim()) msj += `\n${d.get('mensaje').trim()}`;
        window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msj)}`, '_blank', 'noopener');
    });
}

document.getElementById('anio').textContent = new Date().getFullYear();
crearCarrusel();
aparecerAlBajar();
menuActivo();
formularioWhatsApp();
(document.fonts ? document.fonts.ready : Promise.resolve()).then(crearCinta);

const AGENDAS = {
    consulta: 'https://cal.com/yazmin-riquelme-wlqzqw/consulta-veterinaria?theme=light',
    peluqueria: 'https://cal.com/yazmin-riquelme-wlqzqw/peluqueria?theme=light'
};

function pestanasContacto() {
    const tabs = [...document.querySelectorAll('.pestanas [role="tab"]')];
    if (!tabs.length) return;

    function activar(nombre, enfocar) {
        tabs.forEach(tab => {
            const activa = tab.id === 'tab-' + nombre;
            tab.setAttribute('aria-selected', activa);
            tab.tabIndex = activa ? 0 : -1;
            document.getElementById(tab.getAttribute('aria-controls')).hidden = !activa;
            if (activa && enfocar) tab.focus();
        });
    }

    tabs.forEach((tab, i) => {
        tab.addEventListener('click', () => activar(tab.id.replace('tab-', '')));
        tab.addEventListener('keydown', e => {
            if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
            const otra = tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
            activar(otra.id.replace('tab-', ''), true);
        });
    });

    document.querySelectorAll('[data-pestana]').forEach(el => {
        el.addEventListener('click', () => activar(el.dataset.pestana));
    });
}

function agendaTurnos() {
    const agenda = document.getElementById('agenda');
    if (!agenda) return;
    const marco = agenda.querySelector('.agenda__marco');
    const aviso = agenda.querySelector('.agenda__aviso');
    const botonWhatsapp = document.getElementById('turnoWhatsapp');
    const opciones = [...document.querySelectorAll('.servicio-turno [data-agenda]')];
    const REFRESCO = 60000;

    let urlActual = '';
    let ultimaCarga = 0;
    let enUso = false;
    let enPantalla = false;

    function prepararUrl(url) {
        if (url.includes('calendar.google.com') && !url.includes('gv=true')) {
            url += (url.includes('?') ? '&' : '?') + 'gv=true';
        }
        return url;
    }

    function cargar() {
        if (!urlActual) return;
        marco.src = urlActual;
        ultimaCarga = Date.now();
    }

    function refrescarSiHaceFalta() {
        if (!urlActual || enUso || document.hidden || !enPantalla || marco.hidden) return;
        if (Date.now() - ultimaCarga >= REFRESCO) cargar();
    }

    function mostrar(clave) {
        const opcion = opciones.find(o => o.dataset.agenda === clave);
        opciones.forEach(o => o.setAttribute('aria-checked', o === opcion));
        const url = (AGENDAS[clave] || '').trim();
        enUso = false;
        if (url) {
            urlActual = prepararUrl(url);
            marco.hidden = false;
            aviso.hidden = true;
            cargar();
        } else {
            urlActual = '';
            marco.hidden = true;
            marco.removeAttribute('src');
            aviso.hidden = false;
            const texto = `¡Hola! Quería pedir un turno para ${opcion.textContent.trim().toLowerCase()}.`;
            botonWhatsapp.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`;
        }
    }

    window.addEventListener('blur', () => {
        setTimeout(() => {
            if (document.activeElement === marco) enUso = true;
        }, 0);
    });

    new IntersectionObserver(entradas => {
        enPantalla = entradas[0].isIntersecting;
        refrescarSiHaceFalta();
    }).observe(agenda);

    document.addEventListener('visibilitychange', refrescarSiHaceFalta);
    setInterval(refrescarSiHaceFalta, 10000);

    opciones.forEach(o => o.addEventListener('click', () => mostrar(o.dataset.agenda)));
    mostrar(opciones[0].dataset.agenda);
}

pestanasContacto();
agendaTurnos();
