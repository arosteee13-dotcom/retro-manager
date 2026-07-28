const gameState = {
    country: 'España',
    league: 'Primera División',
    team: 'Real Madrid',
    teamId: 'Real Madrid',
    budget: 15.0,
    manager: 'Mánager Retro',
    stadium: 'Santiago Bernabéu',
    capacity: 81044,
    ticketPrice: 25,
    rating: 86,
    squad: [],
    opponent: 'FC Barcelona',
    currentDate: 'Temporada 2026-27 - Jornada 1',
    slotId: 0,
    matchday: 1,
    totalMatchdays: 38,
    calendario: [],
    calendarioGenerado: false,
    fixture: [],
    fixturesPorLiga: {},
    fixtureGenerado: false,
    mensajes: [],
    ultimoIdMensaje: 0,
    historialTraspasos: [],
    copa: null,
    cedidosFuera: [],
    historialClub: {},
    palmaresClub: {},
    objetivoTemporada: 'Evitar el descenso',
    estiloPresion: 'pesada',
    formacion: '4-4-2 Estándar',
    capitanId: null,
    records: {
        maximoGoleador: { nombre: '', goles: 0, foto: '' },
        masPartidos: { nombre: '', partidos: 0, foto: '' },
        fichajeMasCaro: { nombre: '', precio: 0, equipoOrigen: '' },
        ventaMasCara: { nombre: '', precio: 0, equipoDestino: '' }
    },
    cantera: {
        promesas: [],
        filial: [],
        generacionHecha: false
    },
    patrocinadorActual: null,
    ofertasPatrocinio: [],
    supercopa: null,
    playoff: null,
    config: { debugSimularTemporada: false }
};

var _formacionesEquipos = {
    // LaLiga EA Sports
    'FC Barcelona': '4-2-3-1',
    'Real Madrid': '4-4-2 Diamante',
    'Atlético de Madrid': '5-3-2 Defensivo',
    'Athletic Club': '4-2-3-1',
    'Girona FC': '4-3-3 Defensivo',
    'Real Sociedad': '4-3-3 Defensivo',
    'Real Betis': '4-2-3-1',
    'Villarreal': '4-4-2 Estándar',
    'Sevilla': '4-2-3-1',
    'Valencia': '4-4-2 Estándar',
    'Celta': '3-4-3',
    'Osasuna': '4-3-3 Defensivo',
    'Rayo Vallecano': '4-2-3-1',
    'Getafe': '5-3-2 Defensivo',
    'Espanyol': '4-4-2 Estándar',
    'Málaga': '4-2-3-1',
    'Deportivo Alavés': '4-2-3-1',
    'Levante': '4-4-2 Estándar',
    'Racing': '4-2-3-1',
    'Elche': '3-4-3',
    'RC Deportivo': '4-2-3-1',
    // LaLiga Hypermotion
    'Mallorca': '5-3-2 Defensivo',
    'Leganés': '5-3-2 Defensivo',
    'Almería': '4-2-3-1',
    'Real Oviedo': '4-2-3-1',
    'UD Las Palmas': '4-3-3 Defensivo',
    'Cádiz': '4-4-2 Estándar',
    'Granada': '4-3-3 Defensivo',
    'Eibar': '4-2-3-1',
    'Real Valladolid': '4-3-3 Defensivo',
    'Real Sporting': '4-3-3 Defensivo',
    'Albacete': '4-4-2 Estándar',
    'Córdoba CF': '4-3-3 Defensivo',
    'Burgos CF': '5-3-2 Defensivo',
    'CD Castellón': '4-4-2 Estándar',
    'Tenerife': '4-4-2 Estándar',
    'Eldense': '4-4-2 Estándar',
    'FC Andorra': '4-2-3-1',
    'AD Ceuta FC': '4-4-2 Estándar',
    'Real Sociedad B': '4-4-2 Estándar',
    'Celta Fortuna': '4-4-2 Estándar',
    'CE Sabadell': '4-4-2 Estándar'
};

function enviarMensaje(remitente, asunto, texto, acciones) {
    gameState.ultimoIdMensaje++;
    gameState.mensajes.unshift({
        id: gameState.ultimoIdMensaje,
        remitente: remitente,
        asunto: asunto,
        texto: texto,
        leido: false,
        timestamp: gameState.matchday || 1,
        acciones: acciones || null
    });
    if (acciones) {
        acciones.forEach(function(act) {
            act.fn = act.fn.replace(/"([^"]*)"/g, "'$1'");
        });
    }
    actualizarBadges();
}

function formatearPresupuesto(cantidad) {
    if (cantidad >= 1000) return (cantidad / 1000).toFixed(1) + 'B€';
    if (cantidad >= 1) return cantidad.toFixed(1) + 'M€';
    return (cantidad * 1000).toFixed(0) + 'K€';
}

function marcarMensajeLeido(id) {
    for (var i = 0; i < gameState.mensajes.length; i++) {
        if (gameState.mensajes[i].id === id) { gameState.mensajes[i].leido = true; break; }
    }
    renderInbox();
    var iv = document.getElementById('inboxLista');
    if (iv) renderInboxView();
}

function renderInbox() {
    var container = document.querySelector('#tab-inicio .dash-card:last-child div');
    if (!container) return;
    var noLeidos = 0;
    var html = '';
    for (var i = 0; i < gameState.mensajes.length; i++) {
        var msg = gameState.mensajes[i];
        if (!msg.leido) noLeidos++;
        var clase = msg.leido ? '' : 'msg-no-leido';
        html += '<div class="msg-item ' + clase + '" onclick="marcarMensajeLeido(' + msg.id + ')">' +
            '<div class="msg-header"><span class="msg-remitente">' + msg.remitente + '</span><span class="msg-fecha">J' + msg.timestamp + '</span></div>' +
            '<div class="msg-asunto">' + msg.asunto + '</div>' +
            '<div class="msg-texto">' + msg.texto + '</div>';
        if (msg.acciones) {
            html += '<div class="msg-acciones">';
            for (var a = 0; a < msg.acciones.length; a++) {
                var act = msg.acciones[a];
                html += '<button class="btn-retro ' + (act.texto.indexOf('Aceptar') !== -1 ? 'green' : 'danger') + ' btn-sm" onclick="event.stopPropagation();' + act.fn + '" style="font-size:7px;">' + act.texto + '</button> ';
            }
            html += '</div>';
        }
        html += '</div>';
    }
    if (gameState.mensajes.length === 0) {
        html = '<div style="color:#64748b;font-size:14px;text-align:center;padding:10px;">Bandeja vacía. Los mensajes aparecerán aquí.</div>';
    }
    container.innerHTML = html;
    actualizarBadges(noLeidos);
}

function renderRecords() {
    var container = document.getElementById('recordsContainer');
    if (!container) return;
    var r = gameState.records;
    var items = [
        { icon: 'fa-solid fa-futbol', label: 'Máx. Goleador', nombre: r.maximoGoleador.nombre || '-', valor: r.maximoGoleador.goles > 0 ? r.maximoGoleador.goles + ' goles' : '- Sin registro -' },
        { icon: 'fa-solid fa-shirt', label: 'Más Partidos', nombre: r.masPartidos.nombre || '-', valor: r.masPartidos.partidos > 0 ? r.masPartidos.partidos + ' part.' : '- Sin registro -' },
        { icon: 'fa-solid fa-cart-plus', label: 'Fichaje + Caro', nombre: r.fichajeMasCaro.nombre || '-', valor: r.fichajeMasCaro.precio > 0 ? r.fichajeMasCaro.precio.toFixed(1) + 'M€ (' + r.fichajeMasCaro.equipoOrigen + ')' : '- Sin registro -' },
        { icon: 'fa-solid fa-sack-dollar', label: 'Venta + Cara', nombre: r.ventaMasCara.nombre || '-', valor: r.ventaMasCara.precio > 0 ? r.ventaMasCara.precio.toFixed(1) + 'M€ (' + r.ventaMasCara.equipoDestino + ')' : '- Sin registro -' }
    ];
    var html = '';
    items.forEach(function(item) {
        html += '<div style="display:flex;align-items:center;gap:6px;padding:3px 4px;background:#0f1620;border-radius:4px;border-left:3px solid #eab308;">' +
            '<i class="' + item.icon + '" style="color:#eab308;font-size:12px;width:16px;text-align:center;"></i>' +
            '<div style="flex:1;min-width:0;">' +
            '<div style="font-size:9px;color:#64748b;text-transform:uppercase;">' + item.label + '</div>' +
            '<div style="font-size:11px;color:#e2e8f0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + item.nombre + '</div>' +
            '<div style="font-size:9px;color:#94a3b8;">' + item.valor + '</div>' +
            '</div></div>';
    });
    if (items.length === 0) html = '<div style="color:#64748b;font-size:12px;text-align:center;padding:8px;">Sin récords todavía.</div>';
    container.innerHTML = html;
}

function actualizarRecordsDeportivos() {
    var maxGoles = 0, maxGoleador = '';
    var maxPartidos = 0, maxPJ = '';
    gameState.squad.forEach(function(p) {
        var g = p.golesHistoricos || 0;
        var pj = p.partidosHistoricos || 0;
        if (g > maxGoles) { maxGoles = g; maxGoleador = p.name; }
        if (pj > maxPartidos) { maxPartidos = pj; maxPJ = p.name; }
    });
    if (maxGoles > 0 || !gameState.records.maximoGoleador.nombre) {
        gameState.records.maximoGoleador = { nombre: maxGoleador, goles: maxGoles };
    }
    if (maxPartidos > 0 || !gameState.records.masPartidos.nombre) {
        gameState.records.masPartidos = { nombre: maxPJ, partidos: maxPartidos };
    }
    renderRecords();
}

var _inboxFiltro = 'todos';

function actualizarBadges(noLeidos) {
    if (noLeidos === undefined) {
        noLeidos = 0;
        for (var i = 0; i < gameState.mensajes.length; i++) {
            if (!gameState.mensajes[i].leido) noLeidos++;
        }
    }
    var b2 = document.getElementById('inboxUnreadBadge');
    if (b2) b2.innerText = noLeidos > 0 ? noLeidos : '';
}

function filtrarInbox(btn, filtro) {
    _inboxFiltro = filtro;
    document.querySelectorAll('#tab-inbox .btn-retro.btn-sm').forEach(function(b){ b.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    renderInboxView();
}

function ordenarPlantilla(squad) {
    var ordenPos = { PO:0, POR:0, DFC:1, LI:1, LD:1, CAI:1, CAD:1, MCD:2, MC:2, MCO:2, MI:2, MD:2, EI:3, ED:3, DC:3 };
    squad.sort(function(a, b) {
        var oA = ordenPos[a.pos] !== undefined ? ordenPos[a.pos] : 99;
        var oB = ordenPos[b.pos] !== undefined ? ordenPos[b.pos] : 99;
        if (oA !== oB) return oA - oB;
        return (b.rating || 0) - (a.rating || 0);
    });
    return squad;
}

var _patrocinadoresPool = [
    { nombre: 'Fly Emirates', logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Emirates_logo.svg', color: '#eab308' },
    { nombre: 'Nike', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg', color: '#22c55e' },
    { nombre: 'Adidas', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg', color: '#38bdf8' },
    { nombre: 'Puma', logo: 'https://upload.wikimedia.org/wikipedia/en/d/da/Puma_complete_logo.svg', color: '#ef4444' },
    { nombre: 'Rakuten', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Rakuten_logo.svg', color: '#a855f7' },
    { nombre: 'Qatar Airways', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/75/Qatar_Airways_logo.svg', color: '#8b5cf6' },
    { nombre: 'Spotify', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/bd/2024_Spotify_Logo.svg', color: '#22c55e' },
    { nombre: 'Jeep', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/0d/Jeep_logo.svg', color: '#64748b' },
    { nombre: 'Bwin', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Logo_Bwin.svg', color: '#eab308' },
    { nombre: 'Coca-Cola', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Coca-Cola_logo.svg', color: '#ef4444' },
    { nombre: 'BBVA', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/98/BBVA_logo_2025.svg', color: '#2563eb' },
    { nombre: "McDonald's", logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/McDonald%27s_logo.svg', color: '#eab308' }
];

function generarOfertasPatrocinio() {
    gameState.ofertasPatrocinio = [];
    var pool = _patrocinadoresPool.slice();
    for (var i = pool.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp;
    }
    var seleccionadas = pool.slice(0, 3);
    var base = Math.round(gameState.rating * 3500) / 1000000;
    seleccionadas.forEach(function(marca) {
        var variacion = 0.8 + Math.random() * 0.4;
        var pago = Math.round(base * variacion * 100) / 100;
        var duracion = 1 + Math.floor(Math.random() * 3);
        gameState.ofertasPatrocinio.push({
            nombre: marca.nombre,
            pagoMensual: pago,
            temporadas: duracion,
            logo: marca.logo,
            color: marca.color
        });
    });

    var htmlOfertas = '';
    gameState.ofertasPatrocinio.forEach(function(o, idx) {
        htmlOfertas += '<div style="display:flex;align-items:center;gap:8px;background:#0f172a;border:1px solid #334155;border-radius:6px;padding:8px;margin-bottom:4px;">' +
            '<img src="' + o.logo + '" style="height:24px;width:auto;background:#fff;border-radius:3px;padding:2px;" onerror="this.style.display=\'none\';">' +
            '<div style="flex:1;">' +
            '<div style="font-size:12px;color:#e2e8f0;font-weight:bold;">' + o.nombre + '</div>' +
            '<div style="font-size:10px;color:#94a3b8;">' + o.pagoMensual.toFixed(2) + 'M\u20ac por periodo \u2014 ' + o.temporadas + ' temporada' + (o.temporadas > 1 ? 's' : '') + '</div>' +
            '<button class="btn-retro green btn-sm" onclick="firmarPatrocinio(' + idx + ')" style="font-size:8px;padding:4px 10px;margin-top:4px;"><i class="fa-solid fa-pen"></i> Firmar</button></div></div>';
    });
    enviarMensaje('Dirección Comercial', '\ud83d\udccb Ofertas de patrocinio disponibles',
        'El ' + gameState.team + ' tiene 3 ofertas de patrocinio sobre la mesa. Elige la que m\u00e1s te interese:<br><br>' + htmlOfertas);
    renderInbox();
}

function firmarPatrocinio(idx) {
    if (gameState.patrocinadorActual) {
        showModal('PATROCINIO', 'Ya tienes un patrocinador activo. Debes esperar a que expire su contrato para firmar uno nuevo.');
        return;
    }
    var oferta = gameState.ofertasPatrocinio[idx];
    if (!oferta) return;
    gameState.patrocinadorActual = {
        nombre: oferta.nombre,
        pagoMensual: oferta.pagoMensual,
        temporadasRestantes: oferta.temporadas,
        logo: oferta.logo,
        color: oferta.color
    };
    gameState.ofertasPatrocinio = [];
    enviarMensaje('Dirección Comercial', '\u270d\ufe0f Nuevo patrocinador',
        'El ' + gameState.team + ' ha firmado un acuerdo con ' + oferta.nombre + ' por ' + oferta.temporadas + ' temporada(s). Ingreso de ' + oferta.pagoMensual.toFixed(2) + 'M\u20ac por periodo.');

    gameState.mensajes.forEach(function(msg) {
        if (msg.remitente === 'Direcci\u00f3n Comercial' && msg.asunto.indexOf('patrocinio') !== -1) {
            msg.acciones = null;
            msg.texto = msg.texto.replace(/Firmar/g, '\u2714\ufe0f Firmado');
        }
    });
    renderInbox();
    renderInboxView();
    renderFinanzasView();
}

function calcularGastosMensuales() {
    var gastoEstadio = Math.round((gameState.capacity || 0) * 2) / 1000000;
    var gastoCantera = Math.round((gameState.rating || 75) * 800) / 1000000;
    return { estadio: gastoEstadio, cantera: gastoCantera, total: gastoEstadio + gastoCantera };
}

function actualizarColorPresupuesto() {
    var el = document.getElementById('gameBudget');
    if (el) el.style.color = gameState.budget < 0 ? '#ef4444' : '#facc15';
    var fEl = document.getElementById('finPresupuesto');
    if (fEl) fEl.style.color = gameState.budget < 0 ? '#ef4444' : '#facc15';
}

function procesarGastosMensuales() {
    var gastos = calcularGastosMensuales();
    gameState.budget -= gastos.total;
    if (!gameState.historialTraspasos) gameState.historialTraspasos = [];
    gameState.historialTraspasos.unshift({
        fecha: 'J' + (gameState.matchday || 1),
        tipo: 'gasto',
        jugador: 'Mantenimiento Estadio + Cantera',
        desde: gameState.team,
        para: 'Gastos Fijos',
        precio: gastos.total
    });
    actualizarColorPresupuesto();
    document.getElementById('gameBudget').innerText = formatearPresupuesto(gameState.budget);
    enviarMensaje('Departamento Financiero', '\ud83d\udcc9 Gastos de instalaciones',
        'Gastos del mes procesados: Estadio (' + formatearPresupuesto(gastos.estadio) + ') y Cantera (' + formatearPresupuesto(gastos.cantera) + '). Total: ' + formatearPresupuesto(gastos.total) + '.');
    renderInbox();
}

function procesarPagoPatrocinio() {
    if (!gameState.patrocinadorActual) return;
    var pago = gameState.patrocinadorActual.pagoMensual;
    gameState.budget += pago;
    if (!gameState.historialTraspasos) gameState.historialTraspasos = [];
    gameState.historialTraspasos.unshift({
        fecha: 'J' + (gameState.matchday || 1),
        tipo: 'sponsor',
        jugador: gameState.patrocinadorActual.nombre,
        desde: 'Patrocinio',
        para: gameState.team,
        precio: pago
    });
    document.getElementById('gameBudget').innerText = formatearPresupuesto(gameState.budget);
    enviarMensaje('Dirección Comercial', '\ud83d\udcb0 Ingreso por patrocinio',
        gameState.patrocinadorActual.nombre + ' ha realizado un pago de ' + formatearPresupuesto(pago) + ' al ' + gameState.team + '.');
    renderInbox();
}

function renderFinanzasView() {
    document.getElementById('finPresupuesto').innerText = formatearPresupuesto(gameState.budget);
    document.getElementById('finPresupuesto').style.color = gameState.budget < 0 ? '#ef4444' : '#facc15';
    var valorTotal = 0;
    gameState.squad.forEach(function(p) {
        var valStr = (p.val || '0M\u20ac').replace('\u20ac', '').replace('M', '').replace('K', '');
        var valNum = parseFloat(valStr);
        if ((p.val || '').indexOf('K') !== -1) valNum = valNum / 1000;
        valorTotal += valNum;
    });
    document.getElementById('finValorPlantilla').innerText = valorTotal >= 1000 ? (valorTotal/1000).toFixed(1) + 'B\u20ac' : valorTotal.toFixed(1) + 'M\u20ac';
    var ingresos = 0, gastos = 0;
    (gameState.historialTraspasos || []).forEach(function(t) {
        if (t.tipo === 'venta' || t.tipo === 'cesion' || t.tipo === 'sponsor') ingresos += t.precio;
        if (t.tipo === 'compra' || t.tipo === 'gasto') gastos += t.precio;
    });
    var neto = ingresos - gastos;
    var netoEl = document.getElementById('finBalance');
    netoEl.innerText = (neto >= 0 ? '+' : '') + neto.toFixed(1) + 'M\u20ac';
    netoEl.style.color = neto >= 0 ? '#22c55e' : '#ef4444';

    var spEl = document.getElementById('sponsorSection');
    if (spEl) {
        if (gameState.patrocinadorActual) {
            var p = gameState.patrocinadorActual;
            spEl.innerHTML = '<div class="fin-card" style="grid-column:span 3;border-left:4px solid ' + (p.color || '#38bdf8') + ';">' +
                '<div style="display:flex;align-items:center;gap:10px;">' +
                '<img src="' + p.logo + '" style="height:26px;width:auto;background:#fff;border-radius:3px;padding:2px;" onerror="this.style.display=\'none\';">' +
                '<div style="flex:1;">' +
                '<div style="font-size:11px;color:#94a3b8;text-transform:uppercase;">PATROCINADOR PRINCIPAL</div>' +
                '<div style="font-size:16px;color:#e2e8f0;font-weight:bold;">' + p.nombre + '</div>' +
                '</div>' +
                '<div style="text-align:right;">' +
                '<div style="font-size:13px;color:#22c55e;font-weight:bold;">' + p.pagoMensual.toFixed(2) + 'M\u20ac</div>' +
                '<div style="font-size:9px;color:#94a3b8;">por periodo</div>' +
                '</div>' +
                '<div style="text-align:right;min-width:60px;">' +
                '<div style="font-size:16px;color:#eab308;font-weight:bold;">' + p.temporadasRestantes + '</div>' +
                '<div style="font-size:9px;color:#94a3b8;">temp. rest.</div>' +
                '</div></div></div>';
        } else {
            spEl.innerHTML = '';
        }
    }

    var gfEl = document.getElementById('gastosFijosSection');
    if (gfEl) {
        var g = calcularGastosMensuales();
        gfEl.innerHTML = '<div class="fin-card" style="border-left:4px solid #ef4444;">' +
            '<span class="fin-label">MANT. ESTADIO</span>' +
            '<span class="fin-val" style="color:#ef4444;font-size:13px;">' + formatearPresupuesto(g.estadio) + '<span style="font-size:9px;color:#94a3b8;">/per</span></span></div>' +
            '<div class="fin-card" style="border-left:4px solid #ef4444;">' +
            '<span class="fin-label">CANTERA</span>' +
            '<span class="fin-val" style="color:#ef4444;font-size:13px;">' + formatearPresupuesto(g.cantera) + '<span style="font-size:9px;color:#94a3b8;">/per</span></span></div>';
    }

    var bmEl = document.getElementById('balanceMensual');
    if (bmEl) {
        var g2 = calcularGastosMensuales();
        var ingreso = gameState.patrocinadorActual ? gameState.patrocinadorActual.pagoMensual : 0;
        var balance = ingreso - g2.total;
        var colorBal = balance >= 0 ? '#22c55e' : '#ef4444';
        var iconoBal = balance >= 0 ? '<i class="fa-solid fa-circle-check"></i>' : '<i class="fa-solid fa-circle-exclamation"></i>';
        bmEl.innerHTML = iconoBal + ' Balance mensual: <span style="color:#94a3b8;">Ingresos</span> ' + formatearPresupuesto(ingreso) +
            ' <span style="color:#94a3b8;">- Gastos</span> ' + formatearPresupuesto(g2.total) +
            ' <span style="color:' + colorBal + ';font-weight:bold;">= ' + (balance >= 0 ? '+' : '') + formatearPresupuesto(balance) + '</span>';
    }

    var lista = document.getElementById('finMovimientos');
    if (!lista) return;
    var h = gameState.historialTraspasos || [];
    if (h.length === 0) {
        lista.innerHTML = '<div style="color:#64748b;text-align:center;padding:20px;font-size:12px;">Sin movimientos econ\u00f3micos.</div>';
        return;
    }
    var html = '';
    h.forEach(function(t) {
        var icono = t.tipo === 'venta' ? '<i class="fa-solid fa-coins"></i>' : t.tipo === 'cesion' ? '<i class="fa-solid fa-file-contract"></i>' : t.tipo === 'sponsor' ? '<i class="fa-solid fa-handshake"></i>' : t.tipo === 'gasto' ? '<i class="fa-solid fa-wrench"></i>' : t.tipo === 'compra' ? '<i class="fa-solid fa-cart-shopping"></i>' : '<i class="fa-solid fa-arrows-rotate"></i>';
        var color = (t.tipo === 'venta' || t.tipo === 'cesion' || t.tipo === 'sponsor') ? '#22c55e' : '#ef4444';
        var signo = (t.tipo === 'venta' || t.tipo === 'cesion' || t.tipo === 'sponsor') ? '+' : '-';
        html += '<div class="tactic-list-item" style="cursor:default;padding:3px 6px;">' +
            '<span style="font-size:10px;color:#64748b;min-width:36px;">' + t.fecha + '</span>' +
            '<span style="font-size:12px;">' + icono + ' ' + t.jugador + '</span>' +
            '<span style="font-size:10px;color:#94a3b8;flex:1;text-align:right;">' + t.desde + ' \u2192 ' + t.para + '</span>' +
            '<span style="font-size:10px;color:' + color + ';min-width:44px;text-align:right;">' + signo + t.precio.toFixed(1) + 'M\u20ac</span></div>';
    });
    lista.innerHTML = html;
}

function renderInboxView() {
    var lista = document.getElementById('inboxLista');
    if (!lista) return;
    var noLeidos = 0;
    var html = '';
    for (var i = 0; i < gameState.mensajes.length; i++) {
        var msg = gameState.mensajes[i];
        if (!msg.leido) noLeidos++;
        if (_inboxFiltro === 'noleidos' && msg.leido) continue;
        var clase = 'inbox-list-item';
        if (!msg.leido) clase += ' unread';
        if (msg._selected) clase += ' active';
        var preview = msg.texto.replace(/<[^>]+>/g, '').substring(0, 60);
        html += '<div class="' + clase + '" onclick="seleccionarMensaje(' + msg.id + ')">' +
            '<div style="display:flex;justify-content:space-between;">' +
            '<span class="inbox-list-remitente">' + msg.remitente + '</span>' +
            '<span class="inbox-list-fecha">J' + msg.timestamp + '</span></div>' +
            '<div class="inbox-list-asunto">' + msg.asunto + '</div>' +
            '<div class="inbox-list-preview">' + preview + '...</div></div>';
    }
    if (html === '') html = '<div style="color:#64748b;text-align:center;padding:20px;font-size:12px;">No hay mensajes' + (_inboxFiltro === 'noleidos' ? ' sin leer' : '') + '.</div>';
    lista.innerHTML = html;
    actualizarBadges(noLeidos);
}

function seleccionarMensaje(id) {
    for (var i = 0; i < gameState.mensajes.length; i++) {
        gameState.mensajes[i]._selected = (gameState.mensajes[i].id === id);
        if (gameState.mensajes[i].id === id) {
            gameState.mensajes[i].leido = true;
        }
    }
    marcarMensajeLeido(id);
    renderInboxView();
    var msg = null;
    for (var i = 0; i < gameState.mensajes.length; i++) {
        if (gameState.mensajes[i].id === id) { msg = gameState.mensajes[i]; break; }
    }
    var content = document.getElementById('inboxReaderContent');
    if (!msg) { content.innerHTML = '<div style="color:#64748b;text-align:center;padding:20px;font-size:13px;">Selecciona un mensaje para leerlo</div>'; return; }
    var html = '<div class="inbox-reader-header">' +
        '<div class="inbox-reader-remitente">' + msg.remitente + ' <span style="color:#64748b;">· J' + msg.timestamp + '</span></div>' +
        '<div class="inbox-reader-asunto">' + msg.asunto + '</div></div>' +
        '<div class="inbox-reader-texto">' + msg.texto + '</div>';
    if (msg.acciones) {
        html += '<div class="inbox-reader-acciones">';
        for (var a = 0; a < msg.acciones.length; a++) {
            html += '<button class="btn-retro ' + (msg.acciones[a].texto.indexOf('Aceptar') !== -1 ? 'green' : 'danger') + ' btn-sm" onclick="' + msg.acciones[a].fn + '">' + msg.acciones[a].texto + '</button>';
        }
        html += '</div>';
    }
    content.innerHTML = html;
}

const screenTitles = {
    'screen-menu': 'MENÚ PRINCIPAL',
    'screen-country': 'PASO 1: SELECCIONAR PAÍS',
    'screen-league': 'PASO 2: SELECCIONAR LIGA',
    'screen-team': 'PASO 3: SELECCIONAR EQUIPO',
    'screen-manager': 'PASO 4: PERFIL MÁNAGER',
    'screen-settings': 'CONFIGURACIÓN',
    'screen-game': 'ESCRITORIO DEL MÁNAGER'
};

function generateSquad(teamRating) {
    const positions = ['PO', 'DFC', 'CAI', 'CAD', 'LI', 'LD', 'MCD', 'MC', 'MC', 'MI', 'MD', 'MCO', 'EI', 'ED', 'DC', 'DC'];
    const names = ['Martínez', 'Gómez', 'Ruíz', 'Silva', 'Torres', 'Bravo', 'Roca', 'Vega', 'Sosa', 'Rossi', 'Fernández', 'López', 'Navarro', 'Sánchez', 'Morales', 'Gil'];

    const natCodes = ['es', 'es', 'es', 'br', 'ar', 'fr', 'it', 'nl', 'gb', 'de', 'pt', 'es', 'es', 'es', 'es', 'es'];
    var usedDorsals = [];
    return positions.map(function (pos, idx) {
        var dorsal;
        do {
            dorsal = Math.floor(Math.random() * 99) + 1;
        } while (usedDorsals.indexOf(dorsal) !== -1);
        usedDorsals.push(dorsal);

        var age = Math.floor(Math.random() * 12) + 18;
        var variation = Math.floor(Math.random() * 8) - 4;
        var rating = Math.min(99, Math.max(60, parseInt(teamRating) + variation));
        return {
            id: idx + 1,
            dorsal: dorsal,
            pos: pos,
            name: names[idx] || 'Jugador ' + (idx + 1),
            nationality: natCodes[idx] || 'es',
            age: age,
            rating: rating,
            stamina: '100%',
            val: (rating * 0.15).toFixed(1) + 'M€',
            pj: 0, gol: 0, asi: 0, ta: 0, tr: 0,
            lesionSemanas: 0,
            sancionSemanas: 0,
            tarjetasAmarillasAcum: 0,
            moral: 4, rol: 'rotacion', jornadasSinJugar: 0,
            statsTemporada: { partidos: 0, goles: 0, asistencias: 0, ta: 0, tr: 0, historialNotas: [], promedioNotas: 0 },
            equipoId: gameState.team || 'Unknown'
        };
    });
}

function validateDorsal(dorsal, squad, excludeId) {
    dorsal = parseInt(dorsal);
    if (isNaN(dorsal) || dorsal < 1 || dorsal > 99) return 'El dorsal debe estar entre 1 y 99.';
    var dup = squad.find(function (p) { return p.dorsal === dorsal && p.id !== excludeId; });
    if (dup) return 'El dorsal ' + dorsal + ' ya lo tiene ' + dup.name + '.';
    return null;
}

function flagEmoji(code) {
    var flags = {
        es: '🇪🇸', fr: '🇫🇷', br: '🇧🇷', ar: '🇦🇷', it: '🇮🇹',
        nl: '🇳🇱', 'gb': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', eng: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', de: '🇩🇪', pt: '🇵🇹', pl: '🇵🇱',
        hu: '🇭🇺', dk: '🇩🇰', uy: '🇺🇾', se: '🇸🇪', be: '🇧🇪',
        at: '🇦🇹', ch: '🇨🇭', jp: '🇯🇵', kr: '🇰🇷', ng: '🇳🇬',
                ma: '🇲🇦', sn: '🇸🇳', ci: '🇨🇮', cm: '🇨🇲', gh: '🇬🇭', gw: '🇬🇼', ua: '🇺🇦', tr: '🇹🇷', si: '🇸🇮', sk: '🇸🇰', no: '🇳🇴', ro: '🇷🇴', gn: '🇬🇳', gq: '🇬🇶', my: '🇲🇾', fi: '🇫🇮', ml: '🇲🇱', rs: '🇷🇸', dz: '🇩🇿', do: '🇩🇴',
        us: '🇺🇸', mx: '🇲🇽', co: '🇨🇴', cl: '🇨🇱', pe: '🇵🇪',
        tg: '🇹🇬', cz: '🇨🇿', cd: '🇨🇩',
        hn: '🇭🇳', il: '🇮🇱',
        ie: '🇮🇪',
        ge: '🇬🇪', gm: '🇬🇲',
        al: '🇦🇱', ao: '🇦🇴',
        ga: '🇬🇦',
        ve: '🇻🇪', ru: '🇷🇺', is: '🇮🇸',
        gr: '🇬🇷', ch: '🇨🇭',
        mk: '🇲🇰', gp: '🇬🇵',
        cv: '🇨🇻', ca: '🇨🇦'
    };
    return flags[code] || '';
}

var _nombresPaises = {
    es: 'España', fr: 'Francia', br: 'Brasil', ar: 'Argentina', it: 'Italia',
    nl: 'Países Bajos', gb: 'Reino Unido', eng: 'Inglaterra', de: 'Alemania',
    pt: 'Portugal', pl: 'Polonia', hu: 'Hungría', dk: 'Dinamarca', uy: 'Uruguay',
    se: 'Suecia', be: 'Bélgica', at: 'Austria', ch: 'Suiza', jp: 'Japón',
    kr: 'Corea del Sur', ng: 'Nigeria', ma: 'Marruecos', sn: 'Senegal',
    ci: 'Costa de Marfil', cm: 'Camerún', gh: 'Ghana', gw: 'Guinea-Bissau',
    ua: 'Ucrania', tr: 'Turquía', si: 'Eslovenia', sk: 'Eslovaquia',
    no: 'Noruega', ro: 'Rumanía', gn: 'Guinea', gq: 'Guinea Ecuatorial',
    my: 'Malasia', fi: 'Finlandia', ml: 'Mali', rs: 'Serbia', dz: 'Argelia',
    do: 'República Dominicana', us: 'Estados Unidos', mx: 'México', co: 'Colombia',
    cl: 'Chile', pe: 'Perú',
    tg: 'Togo', cz: 'República Checa', cd: 'República Democrática del Congo',
    hn: 'Honduras', il: 'Israel',
    ie: 'Irlanda',
    ge: 'Georgia', gm: 'Gambia',
    al: 'Albania', ao: 'Angola',
    ga: 'Gabón',
    ve: 'Venezuela', ru: 'Rusia', is: 'Islandia',
    gr: 'Grecia', ch: 'Suiza',
    mk: 'Macedonia del Norte', gp: 'Guadalupe',
    cv: 'Cabo Verde', ca: 'Canadá'
};

function goToScreen(screenId) {
    document.querySelectorAll('.screen').forEach(function (s) { return s.classList.remove('active'); });
    document.getElementById(screenId).classList.add('active');
    document.getElementById('stepTitle').innerText = screenTitles[screenId] || 'RETRO MANAGER';

    if (screenId === 'screen-manager') {
        document.getElementById('summaryCountry').innerText = gameState.country;
        document.getElementById('summaryLeague').innerText = gameState.league;
        document.getElementById('summaryTeam').innerText = gameState.team;
    }
    if (screenId === 'screen-settings') {
        var chk = document.getElementById('chkDebugSim');
        if (chk && gameState.config) {
            chk.checked = gameState.config.debugSimularTemporada === true;
            chk.onchange = function() {
                if (!gameState.config) gameState.config = { debugSimularTemporada: false };
                gameState.config.debugSimularTemporada = this.checked;
                actualizarVisibilidadSimular();
            };
        }
        actualizarVisibilidadSimular();
    }
}

function actualizarVisibilidadSimular() {
    var btn = document.getElementById('btnSimularTemporada');
    if (!btn) return;
    var visible = gameState.config && gameState.config.debugSimularTemporada === true;
    btn.style.display = visible ? '' : 'none';
}

function selectCountry(element, countryName) {
    document.querySelectorAll('#screen-country .card-select').forEach(function (c) { return c.classList.remove('selected'); });
    element.classList.add('selected');
    gameState.country = countryName;
    populateLeagues(countryName);
}

function selectLeague(element, leagueName) {
    document.querySelectorAll('#screen-league .card-select').forEach(function (c) { return c.classList.remove('selected'); });
    element.classList.add('selected');
    gameState.league = leagueName;
    populateTeams(gameState.country, leagueName);
}

function parsearPresupuesto(str) {
    if (typeof str === 'number') return str;
    var match = str.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 15.0;
}

function selectTeam(element, teamName, budget, target, rating, stadium, capacity, squad) {
    document.querySelectorAll('.team-item').forEach(function (t) { return t.classList.remove('selected'); });
    element.classList.add('selected');

    gameState.team = teamName;
    gameState.budget = parsearPresupuesto(budget);
    gameState.rating = rating;
    gameState.stadium = stadium;
    gameState.capacity = capacity;
    gameState.squad = squad || [];

    var displayRating = rating;
    if (gameState.squad && gameState.squad.length > 0) {
        var calc = calcularRatingEquipo(gameState.squad);
        if (calc.glo > 0) displayRating = calc.glo;
    }

    document.getElementById('detailTeamName').innerText = teamName;
    document.getElementById('detailBudget').innerText = budget;
    document.getElementById('detailTarget').innerText = target;
    document.getElementById('detailRating').innerText = displayRating + ' / 99';
    document.getElementById('detailStadium').innerText = stadium;
    gameState.objetivoTemporada = target || 'Evitar el descenso';
}

function populateCountries() {
    const grid = document.getElementById('countryGrid');
    grid.innerHTML = '';
    const countries = Database.getCountries();
    countries.forEach(function (c, i) {
        const card = document.createElement('div');
        card.className = 'card-select' + (i === 0 ? ' selected' : '');
        card.onclick = function () { selectCountry(card, c.name); };
        card.innerHTML =
            '<span style="font-size: 32px;">' + c.icon + '</span>' +
            '<span>' + c.name.toUpperCase() + '</span>' +
            '<span class="subtext">' + c.leagues.length + ' ' + (c.leagues.length === 1 ? 'Liga' : 'Ligas') + '</span>';
        grid.appendChild(card);
    });

    if (countries.length > 0) {
        gameState.country = countries[0].name;
        populateLeagues(countries[0].name);
    }
}

function populateLeagues(countryName) {
    const grid = document.getElementById('leagueGrid');
    grid.innerHTML = '';
    const leagues = Database.getLeagues(countryName);
    leagues.forEach(function (l, i) {
        const card = document.createElement('div');
        card.className = 'card-select' + (i === 0 ? ' selected' : '');
        card.onclick = function () { selectLeague(card, l.name); };
        card.innerHTML =
            '<i class="fa-solid fa-shield-halved"></i>' +
            '<span>' + l.name.toUpperCase() + '</span>' +
            '<span class="subtext">' + l.desc + '</span>';
        grid.appendChild(card);
    });

    if (leagues.length > 0) {
        gameState.league = leagues[0].name;
        populateTeams(countryName, leagues[0].name);
    }
}

function populateTeams(countryName, leagueName) {
    const list = document.getElementById('teamList');
    list.innerHTML = '';
    var teams = Database.getTeams(countryName, leagueName);
    teams.sort(function (a, b) {
        var ra = a.rating, rb = b.rating;
        if (a.squad && a.squad.length > 0) { var ca = calcularRatingEquipo(a.squad); if (ca.glo > 0) ra = ca.glo; }
        if (b.squad && b.squad.length > 0) { var cb = calcularRatingEquipo(b.squad); if (cb.glo > 0) rb = cb.glo; }
        return rb - ra;
    });
    teams.forEach(function (t, i) {
        var displayRating = t.rating;
        if (t.squad && t.squad.length > 0) {
            var calc = calcularRatingEquipo(t.squad);
            if (calc.glo > 0) displayRating = calc.glo;
        }
        const item = document.createElement('div');
        item.className = 'team-item';
        item.onclick = function () { selectTeam(item, t.name, t.budget, t.target, t.rating, t.stadium, t.capacity, t.squad); };
        item.innerHTML =
            '<span>' + t.name + '</span>' +
            '<span>' + displayRating + '★</span>';
        list.appendChild(item);
    });

    if (teams.length > 0) {
        const firstItem = list.querySelector('.team-item');
        const t = teams[0];
        selectTeam(firstItem, t.name, t.budget, t.target, t.rating, t.stadium, t.capacity, t.squad);
    }
}

var _cesionesSalida = {
    'Athletic Club': [
        { nombre: 'Ibai Sanz', pos: 'DEL', destino: 'Córdoba CF' },
        { nombre: 'Eder García', pos: 'MED', destino: 'Córdoba CF' }
    ],
    'Atlético de Madrid': [
        { nombre: 'C. Lenglet', pos: 'DEF', destino: 'Benfica' },
        { nombre: 'H. Moldovan', pos: 'POR', destino: 'Eyupspor' }
    ],
    'Celta': [
        { nombre: 'Manu Sánchez', pos: 'DEF', destino: 'Levante' },
        { nombre: 'Carlos Dotor', pos: 'MED', destino: 'Málaga' },
        { nombre: 'Hugo Sotelo', pos: 'MED', destino: 'Levante' }
    ],
    'Deportivo Alavés': [
        { nombre: 'Unai Ropero', pos: 'DEL', destino: 'Racing Ferrol' },
        { nombre: 'Adrián Pica', pos: 'DEF', destino: 'Penafiel' },
        { nombre: 'Egoitz Muñoz', pos: 'DEF', destino: 'Córdoba CF' },
        { nombre: 'G. Albarracin', pos: 'MED', destino: 'NK Istra 1961' }
    ],
    'Elche': [
        { nombre: 'A. Werner', pos: 'POR', destino: 'Rosario Central' }
    ],
    'Espanyol': [
        { nombre: 'José Gragera', pos: 'MED', destino: 'Burgos CF' },
        { nombre: 'Antoniu', pos: 'DEL', destino: 'Mallorca' }
    ],
    'Racing': [
        { nombre: 'Jokin Ezkieta', pos: 'POR', destino: 'Cádiz' },
        { nombre: 'Aritz Aldasoro', pos: 'MED', destino: 'Real Oviedo' }
    ],
    'RC Deportivo': [
        { nombre: 'Diego Gómez', pos: 'DEL', destino: 'Huesca' }
    ],
    'Villarreal': [
        { nombre: 'Diego Conde', pos: 'POR', destino: 'Real Betis' },
        { nombre: 'Arnau Tenas', pos: 'POR', destino: 'Mallorca' }
    ]
};

function inicializarCesiones() {
    var salidas = gameState.team ? _cesionesSalida[gameState.team] : null;
    if (salidas) {
        salidas.forEach(function(s) {
            for (var i = gameState.squad.length - 1; i >= 0; i--) {
                if (gameState.squad[i].name === s.nombre) {
                    var p = gameState.squad[i];
                    gameState.squad.splice(i, 1);
                    var finJornada = 38;
                    var idEnDestino = 20000 + Math.floor(Math.random() * 90000);
                    var squadD = obtenerSquadEquipo(s.destino);
                    if (squadD) {
                        var clone = JSON.parse(JSON.stringify(p));
                        clone.id = idEnDestino;
                        clone.esCedido = true;
                        clone.equipoOrigen = gameState.team;
                        clone.jornadaFinCesion = finJornada;
                        clone.grupo = null;
                        squadD.push(clone);
                        _cachedSquads[s.destino] = squadD;
                    }
                    if (!gameState.cedidosFuera) gameState.cedidosFuera = [];
                    gameState.cedidosFuera.push({
                        id: p.id,
                        nombre: p.name,
                        pos: p.pos,
                        rating: p.rating,
                        edad: p.age,
                        nacionalidad: p.nationality,
                        altura: p.height,
                        dorsal: p.dorsal,
                        val: p.val,
                        statsTemporada: p.statsTemporada || { partidos: 0, goles: 0, asistencias: 0, ta: 0, tr: 0 },
                        lesionSemanas: p.lesionSemanas || 0,
                        tipoLesion: p.tipoLesion || '',
                        sancionSemanas: p.sancionSemanas || 0,
                        destino: s.destino,
                        idEnDestino: idEnDestino,
                        jornadaFin: finJornada
                    });
                    break;
                }
            }
        });
    }
}

function startGame() {
    gameState.manager = document.getElementById('managerName').value || 'Mánager Retro';
    gameState.teamId = gameState.team;
    gameState.currentDate = 'Temporada 2026-27 - Jornada 1';
    if (!gameState.squad || gameState.squad.length === 0) {
        gameState.squad = generateSquad(gameState.rating);
    }
    gameState.squad.forEach(function(p) { if (!p.equipoId) p.equipoId = gameState.team; });

    inicializarCesiones();
    asignarRolesIniciales();
    actualizarVisibilidadSimular();
    renderSquadTable();
    asignarGruposIniciales();
    renderTacticPitch();
    generarCuadroCopa();
    var paises = Database.getCountries();
    paises.forEach(function(p) {
        var ligas = Database.getLeagues(p.name);
        ligas.forEach(function(l) {
            generarFixturePara(l.name);
        });
    });
    if (!gameState.fixture || gameState.fixture.length === 0) generarFixture();
    if (gameState.country === 'España' && !gameState._supercopaClasificados && !gameState.supercopa) {
        var eqs = Database.getTeams(gameState.country, gameState.league);
        var ordenados = eqs.slice().sort(function(a, b) { return (b.rating || 75) - (a.rating || 75); });
        var top4 = ordenados.slice(0, 4).map(function(t) { return t.name; });
        if (top4.length === 4) {
            gameState._supercopaClasificados = top4;
        }
    }
    generarCalendario();

    if (!gameState.objetivoTemporada || gameState.objetivoTemporada === 'Evitar el descenso') {
        var eqs = Database.getTeams(gameState.country, gameState.league);
        for (var i = 0; i < eqs.length; i++) {
            if (eqs[i].name === gameState.team) {
                gameState.objetivoTemporada = eqs[i].target || 'Evitar el descenso';
                break;
            }
        }
    }

    if (gameState.calendario && gameState.calendario[0]) {
        var p = gameState.calendario[0].partidos[0];
        gameState.opponent = p ? p.rival : 'FC Barcelona';
    } else {
        var teams = Database.getTeams(gameState.country, gameState.league);
        var opponentTeam = teams.find(function (t) { return t.name !== gameState.team; }) || teams[0];
        gameState.opponent = opponentTeam ? opponentTeam.name : 'FC Barcelona';
    }

    document.getElementById('topBarTitle').innerHTML = '<i class="fa-solid fa-futbol"></i> ' + gameState.team.toUpperCase();
    document.getElementById('gameTeamShort').innerText = gameState.team;
    document.getElementById('gameManagerShort').innerText = gameState.manager;
    document.getElementById('gameBudget').innerText = formatearPresupuesto(gameState.budget);

    document.getElementById('dashJornada').innerText = 'Jornada ' + (gameState.matchday || 1) + ' - Liga';
    document.getElementById('dashHomeTeam').innerText = gameState.team;
    document.getElementById('dashAwayTeam').innerText = gameState.opponent;
    document.getElementById('dashStadiumName').innerHTML = '<i class="fa-solid fa-location-dot"></i> ' + gameState.stadium;

    document.getElementById('stadiumName').innerText = gameState.stadium;
    document.getElementById('stadiumCapacity').innerText = gameState.capacity.toLocaleString() + ' esp.';
    gameState.ticketPrice = gameState.ticketPrice || calcularPrecioBaseEntrada();

    enviarMensaje('Secretaría Técnica', 'Bienvenido al club',
        '\u00a1Enhorabuena ' + gameState.manager + '! Has sido presentado como nuevo entrenador del ' + gameState.team + '. ' +
        'Dispones de un presupuesto de ' + formatearPresupuesto(gameState.budget) + ' para afrontar la temporada.');
    enviarMensaje('Oficina de Prensa', 'Comienza la temporada',
        'La temporada 2026-27 arranca con la jornada 1. Tu primer rival ser\u00e1 el ' + gameState.opponent + '. \u00a1Buena suerte!');
    enviarMensaje('Directiva', '\ud83c\udfaf Objetivo de la temporada',
        'La Directiva ha fijado el siguiente objetivo: ' + gameState.objetivoTemporada + '. \u00a1Cumple con las expectativas!');
    if (!gameState.patrocinadorActual && gameState.ofertasPatrocinio.length === 0) {
        generarOfertasPatrocinio();
    }
    enviarMensaje('Cuerpo Técnico', '\ud83d\udccb Ajuste de roles',
        'Los roles de la plantilla se han asignado autom\u00e1ticamente seg\u00fan el nivel de cada jugador. Revisa y aj\u00fastalos en el modal de cada jugador haciendo clic en el rol.');
    renderInbox();

    goToScreen('screen-game');
}

function switchGameTab(btn, tabId) {
    document.querySelectorAll('.nav-tab-btn').forEach(function (b) { return b.classList.remove('active'); });
    document.querySelectorAll('.game-tab-content').forEach(function (t) { return t.classList.remove('active'); });

    btn.classList.add('active');
    document.getElementById(tabId).classList.add('active');

    var panel = document.getElementById('gameActionPanel');
    var layout = document.querySelector('.game-layout');
    if (tabId === 'tab-inicio') {
        panel.style.display = '';
        layout.style.gridTemplateColumns = '140px 1fr 180px';
        restaurarPanelClub();
        renderInbox();
        renderRecords();
    } else {
        panel.style.display = 'none';
        layout.style.gridTemplateColumns = '140px 1fr';
    }

    if (tabId === 'tab-inbox') {
        renderInboxView();
    }
    if (tabId === 'tab-finanzas') {
        renderFinanzasView();
    }

    if (tabId === 'tab-dorsales') {
        renderDorsalManager();
    }
    if (tabId === 'tab-tacticas') {
        renderTacticas();
    }
    if (tabId === 'tab-calendario') {
        renderCalendario();
    }
    if (tabId === 'tab-mercado') {
        _mercadoLimite = 20;
        _filtrosMercado = { rating: '', edad: '', nacionalidad: '', posicion: '' };
        var fD = document.getElementById('filterRatingDisplay');
        if (fD) fD.textContent = 'Todas';
        fD = document.getElementById('filterEdadDisplay');
        if (fD) fD.textContent = 'Cualquier edad';
        fD = document.getElementById('filterNacDisplay');
        if (fD) fD.textContent = '\ud83c\udf0d Cualquier pa\u00eds';
        fD = document.getElementById('filterPosDisplay');
        if (fD) fD.textContent = 'Todas';
        renderMercado();
    }
    if (tabId === 'tab-competiciones') {
        if (_torneoPaisActual === null) _torneoPaisActual = gameState.country;
        if (_torneoLigaActual === null) _torneoLigaActual = gameState.league;
        renderTorneoPaises();
        renderTorneoTorneos();
        renderClasificacion();
    }
    if (tabId === 'tab-club') {
        renderClubView();
    }
    if (tabId === 'tab-cantera') {
        renderCanteraView();
    }
    if (tabId === 'tab-estadio') {
        renderEstadioView();
    }
}

function switchSquadSubTab(btn, tabId) {
    document.querySelectorAll('#tab-plantilla .squad-subtab').forEach(function (t) { t.style.display = 'none'; });
    document.getElementById(tabId).style.display = 'flex';
    document.querySelectorAll('#tab-plantilla .btn-retro.btn-sm').forEach(function (b) { b.classList.remove('active'); });
    btn.classList.add('active');
    if (tabId === 'squad-stats') renderSquadStats();
    if (tabId === 'squad-injuries') renderInjuries();
}

function switchClubSubTab(btn, tabId) {
    document.querySelectorAll('#tab-club .club-subtab').forEach(function(t) { t.style.display = 'none'; });
    document.querySelectorAll('#tab-club .btn-retro.btn-sm').forEach(function(b) { b.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    document.getElementById(tabId).style.display = 'flex';
    if (tabId === 'club-general') renderClubGeneral();
    if (tabId === 'club-fichajes') renderClubFichajes();
    if (tabId === 'club-records') renderRecords();
    if (tabId === 'club-historial') renderClubHistorial();
}

function renderClubView() {
    document.getElementById('clubTeamName').innerText = gameState.team;
    var firstBtn = document.querySelector('#tab-club .btn-retro.btn-sm');
    if (firstBtn) switchClubSubTab(firstBtn, 'club-general');
}

function renderClubGeneral() {
    var c = document.getElementById('club-general');
    if (!c) return;
    c.innerHTML = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:6px;">' +
        '<div class="stat-row"><span>Club</span><span class="stat-val">' + gameState.team + '</span></div>' +
        '<div class="stat-row"><span>Mánager</span><span class="stat-val">' + gameState.manager + '</span></div>' +
        '<div class="stat-row"><span>Estadio</span><span class="stat-val">' + gameState.stadium + '</span></div>' +
        '<div class="stat-row"><span>Capacidad</span><span class="stat-val">' + (gameState.capacity || 0).toLocaleString() + '</span></div>' +
        '<div class="stat-row"><span>Presupuesto</span><span class="stat-val" style="color:#facc15;">' + formatearPresupuesto(gameState.budget) + '</span></div>' +
        '<div class="stat-row"><span>Objetivo</span><span class="stat-val" style="color:#38bdf8;">' + (gameState.objetivoTemporada || '-') + '</span></div>' +
        '</div>';
}

function renderClubFichajes() {
    var c = document.getElementById('club-fichajes');
    if (!c) return;
    var h = gameState.historialTraspasos || [];
    var propios = h.filter(function(t) { return t.desde === gameState.team || t.para === gameState.team; });
    if (propios.length === 0) {
        c.innerHTML = '<div style="color:#64748b;text-align:center;padding:20px;font-size:12px;">No hay movimientos en el mercado.</div>';
        return;
    }
    var html = '<div style="font-size:11px;color:#38bdf8;padding:4px 2px;border-bottom:1px solid #1e293b;">FICHAJES (' + propios.length + ')</div>';
    propios.forEach(function(t) {
        var icono = t.tipo === 'compra' ? '<i class="fa-solid fa-cart-shopping"></i>' : t.tipo === 'venta' ? '<i class="fa-solid fa-coins"></i>' : '<i class="fa-solid fa-arrows-rotate"></i>';
        var color = t.tipo === 'compra' ? '#22c55e' : t.tipo === 'venta' ? '#eab308' : '#38bdf8';
        html += '<div class="tactic-list-item" style="cursor:default;flex-wrap:wrap;padding:4px 6px;">' +
            '<div style="display:flex;align-items:center;gap:4px;width:100%;">' +
            '<span style="font-size:10px;color:#64748b;min-width:36px;">' + t.fecha + '</span>' +
            '<span style="font-size:13px;">' + icono + '</span>' +
            '<span style="font-size:12px;font-weight:bold;flex:1;">' + t.jugador + '</span>' +
            (t.pos ? '<span class="pos-badge" style="font-size:9px;padding:1px 4px;display:inline-block;">' + t.pos + '</span> ' : '') +
            (t.rating ? '<span style="font-size:10px;color:#6ee7b7;min-width:18px;text-align:center;">' + t.rating + '</span>' : '') +
            '</div>' +
            '<div style="font-size:10px;color:#94a3b8;padding:1px 0 0 50px;width:100%;">' +
            t.desde + ' <span style="color:' + color + ';">\u2192</span> ' + t.para +
            ' \u00b7 <span style="color:#eab308;">' + t.precio.toFixed(1) + 'M\u20ac</span></div></div>';
    });
    c.innerHTML = html;
}

function renderClubHistorial() {
    var palmares = obtenerPalmaresClub(gameState.team, gameState.rating);
    window._palmaresActual = palmares;
    var palContent = document.getElementById('clubPalmaresContent');
    var histContent = document.getElementById('clubHistorialContent');
    if (!palContent || !histContent) return;

    var ph = '<div style="font-size:11px;color:#38bdf8;padding:2px 4px;border-bottom:1px solid #1e293b;margin-bottom:4px;"><i class="fa-solid fa-trophy"></i> PALMAR\u00c9S</div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;padding:4px;">';
    palmares.forEach(function(t) {
        var nombreEscaped = t.nombre.replace(/'/g, "\\'");
        ph += '<div class="trofeo-card" onclick="mostrarAniosTrofeo(\'' + nombreEscaped + '\')" style="cursor:pointer;background:#0f172a;border:1px solid #334155;border-radius:4px;padding:6px 10px;text-align:center;min-width:70px;">' +
            t.icono + '<br><span style="font-size:18px;font-weight:bold;color:#facc15;">' + t.count + '</span><br><span style="font-size:9px;color:#94a3b8;">' + t.nombre + '</span></div>';
    });
    ph += '</div><div id="trofeoDetail" style="display:none;background:#0f172a;border:1px solid #38bdf8;border-radius:6px;padding:8px;margin-top:4px;"><div id="trofeoDetailContent"></div></div>';
    palContent.innerHTML = ph;

    var historialEquipo = gameState.historialClub[gameState.team] || [];
    var hh = '<div style="font-size:11px;color:#38bdf8;padding:2px 4px;border-bottom:1px solid #1e293b;margin-top:8px;"><i class="fa-solid fa-clock-rotate-left"></i> HIST\u00d3RICO LIGA</div>';
    if (historialEquipo.length === 0) {
        hh += '<div style="color:#64748b;text-align:center;padding:8px;font-size:12px;">Sin temporadas registradas.</div>';
    } else {
        hh += '<div style="display:flex;gap:4px;padding:4px;flex-direction:column;">';
        var reversed = historialEquipo.slice().reverse();
        reversed.forEach(function(h) {
            var col = h.posicion <= 4 ? '#49CB2B' : h.posicion <= 8 ? '#38bdf8' : h.posicion <= 18 ? '#bcbcbc' : '#ED3B46';
            hh += '<div style="display:flex;align-items:center;gap:6px;background:#0f172a;border:1px solid #334155;border-radius:4px;padding:4px 8px;">' +
                '<span style="font-size:10px;color:#64748b;min-width:65px;">' + h.temporada + '</span>' +
                '<span style="font-size:16px;color:' + col + ';font-weight:bold;min-width:30px;">' + h.posicion + '\u00ba</span>' +
                '<span style="font-size:11px;color:#94a3b8;">' + h.division + '</span></div>';
        });
        hh += '</div>';
    }
    histContent.innerHTML = hh;
}

function generarCamadaCantera() {
    if (gameState.cantera.generacionHecha) return;
    gameState.cantera.generacionHecha = true;
    var cantidad = 3 + Math.floor(Math.random() * 3);
    var nombres = ['Alejandro','Pablo','Daniel','David','Javier','Carlos','Miguel','Ángel','Jorge','Sergio','Adrián','Hugo','Mario','Diego','Iván','Marcos','Raúl','Rubén','Óscar','Luis'];
    var apellidos = _nombresPool[gameState.country] || _nombresPool['España'];
    var posicionesPool = ['PO','DFC','DFC','LI','LD','MCD','MC','MC','MCO','MI','MD','EI','ED','DC','DC'];
    var natMap = {'España':'es','Inglaterra':'eng','Italia':'it'};
    var nat = natMap[gameState.country] || 'es';

    for (var i = 0; i < cantidad; i++) {
        var edad = 15 + Math.floor(Math.random() * 3);
        var ratingBase = Math.max(40, Math.min(75, gameState.rating - 35 + Math.floor(Math.random() * 16) - 5));
        var pos = posicionesPool[Math.floor(Math.random() * posicionesPool.length)];
        var nombreCompleto = nombres[Math.floor(Math.random() * nombres.length)] + ' ' + apellidos[Math.floor(Math.random() * apellidos.length)];
        gameState.cantera.promesas.push({
            id: 50000 + Math.floor(Math.random() * 90000),
            dorsal: 0,
            pos: pos,
            name: nombreCompleto,
            nationality: nat,
            age: edad,
            height: Math.floor(Math.random() * 25) + 160,
            rating: ratingBase,
            stamina: '100%',
            val: '0M\u20ac',
            pj: 0, gol: 0, asi: 0, ta: 0, tr: 0,
            lesionSemanas: 0, tipoLesion: '',
            sancionSemanas: 0,
            tarjetasAmarillasAcum: 0,
            moral: 4, rol: 'rotacion', jornadasSinJugar: 0,
            statsTemporada: { partidos: 0, goles: 0, asistencias: 0, ta: 0, tr: 0, historialNotas: [], promedioNotas: 0 },
            golesHistoricos: 0,
            partidosHistoricos: 0,
            equipoId: gameState.team,
            esCanterano: true
        });
    }
    enviarMensaje('Cantera', '\uD83C\uDF31 Nueva camada de j\u00f3venes',
        'Han llegado ' + cantidad + ' j\u00f3venes talentos a la cantera del ' + gameState.team + '. Rev\u00edsalos en el apartado Cantera y decide su futuro.');
    renderInbox();
}

function getCanteraColor(pos) {
    var grupo = getGrupoPos(pos);
    var colores = { PO: '#f59e0b', DEF: '#3b82f6', MC: '#22c55e', ATA: '#ef4444' };
    return colores[grupo] || '#94a3b8';
}

function renderCanteraView() {
    document.getElementById('canteraTeamName').innerText = gameState.team;
    renderCanteraPromesas();
    renderCanteraFilial();
}

function renderCanteraPromesas() {
    var section = document.getElementById('canteraPromesasSection');
    var list = document.getElementById('canteraPromesasList');
    if (!section || !list) return;
    if (!gameState.cantera.promesas || gameState.cantera.promesas.length === 0) {
        section.style.display = 'none';
        return;
    }
    section.style.display = 'flex';
    var html = '<table class="squad-table" style="font-size:12px;"><thead><tr>' +
        '<th>Pos</th><th>Jugador</th><th>Edad</th><th>Med</th><th>Pot.</th><th>Acción</th>' +
        '</tr></thead><tbody>';
    gameState.cantera.promesas.forEach(function(p, idx) {
        var color = getCanteraColor(p.pos);
        html += '<tr>' +
            '<td><span class="pos-badge" style="background:' + color + ';color:#fff;font-size:9px;padding:1px 6px;">' + p.pos + '</span></td>' +
            '<td style="font-size:11px;color:#e2e8f0;">' + p.name + '</td>' +
            '<td style="font-size:11px;color:#94a3b8;">' + p.age + '</td>' +
            '<td style="font-size:11px;color:#6ee7b7;font-weight:bold;">' + p.rating + '</td>' +
            '<td style="font-size:11px;color:#eab308;font-weight:bold;">' + Math.min(99, p.rating + 3 + Math.floor(Math.random() * 6)) + '</td>' +
            '<td><button class="btn-retro green btn-sm" onclick="firmarCanterano(' + idx + ')" style="font-size:7px;padding:2px 6px;">\u2713</button>' +
            ' <button class="btn-retro danger btn-sm" onclick="descartarCanterano(' + idx + ')" style="font-size:7px;padding:2px 6px;">\u2717</button></td></tr>';
    });
    html += '</tbody></table>';
    list.innerHTML = html;
}

function renderCanteraFilial() {
    var list = document.getElementById('canteraFilialList');
    if (!list) return;
    var filial = gameState.cantera.filial || [];
    if (filial.length === 0) {
        list.innerHTML = '<div style="color:#64748b;text-align:center;padding:15px;font-size:11px;">No hay jugadores en el filial.</div>';
        return;
    }
    var html = '<table class="squad-table" style="font-size:12px;"><thead><tr>' +
        '<th>Pos</th><th>Jugador</th><th>Edad</th><th>Med</th><th>Pot.</th><th>Estado</th><th>Acción</th>' +
        '</tr></thead><tbody>';
    filial.forEach(function(p, idx) {
        var color = getCanteraColor(p.pos);
        var potencial = Math.min(99, p.rating + 3 + Math.floor(Math.random() * 6));
        var estado = potencial - p.rating >= 5 ? 'Promesa' : 'Formado';
        var estadoColor = potencial - p.rating >= 5 ? '#22c55e' : '#94a3b8';
        html += '<tr>' +
            '<td><span class="pos-badge" style="background:' + color + ';color:#fff;font-size:9px;padding:1px 6px;">' + p.pos + '</span></td>' +
            '<td style="font-size:11px;color:#e2e8f0;">' + p.name + '</td>' +
            '<td style="font-size:11px;color:#94a3b8;">' + p.age + '</td>' +
            '<td style="font-size:11px;color:#6ee7b7;font-weight:bold;">' + p.rating + '</td>' +
            '<td style="font-size:11px;color:#eab308;font-weight:bold;">' + potencial + '</td>' +
            '<td style="font-size:10px;color:' + estadoColor + ';">' + estado + '</td>' +
            '<td><button class="btn-retro green btn-sm" onclick="subirAlPrimerEquipo(' + idx + ')" style="font-size:7px;padding:2px 6px;"><i class="fa-solid fa-arrow-up"></i> Subir</button></td></tr>';
    });
    html += '</tbody></table>';
    list.innerHTML = html;
}

function firmarCanterano(idx) {
    var p = gameState.cantera.promesas[idx];
    if (!p) return;
    gameState.cantera.promesas.splice(idx, 1);
    gameState.cantera.filial.push(p);
    renderCanteraPromesas();
    renderCanteraFilial();
}

function descartarCanterano(idx) {
    gameState.cantera.promesas.splice(idx, 1);
    renderCanteraPromesas();
    if (gameState.cantera.promesas.length === 0 && gameState.cantera.filial.length === 0) {}
}

function firmarTodosCanteranos() {
    gameState.cantera.filial = gameState.cantera.filial.concat(gameState.cantera.promesas);
    gameState.cantera.promesas = [];
    renderCanteraPromesas();
    renderCanteraFilial();
}

function descartarTodosCanteranos() {
    gameState.cantera.promesas = [];
    renderCanteraPromesas();
}

function subirAlPrimerEquipo(idx) {
    var p = gameState.cantera.filial[idx];
    if (!p) return;
    gameState.cantera.filial.splice(idx, 1);
    var nuevoId = 70000 + Math.floor(Math.random() * 90000);
    var dorsal = getPrimerDorsalLibre();
    var clon = JSON.parse(JSON.stringify(p));
    clon.id = nuevoId;
    clon.dorsal = dorsal;
    clon.grupo = null;
    if (!clon.statsTemporada) clon.statsTemporada = { partidos: 0, goles: 0, asistencias: 0, ta: 0, tr: 0 };
    if (!clon.golesHistoricos) clon.golesHistoricos = 0;
    if (!clon.partidosHistoricos) clon.partidosHistoricos = 0;
    clon.equipoId = gameState.team;
    gameState.squad.push(clon);
    renderSquadTable();
    renderSquadStats();
    renderCanteraFilial();
    showModal('CANTERA', p.name + ' ha sido promovido al primer equipo con el dorsal #' + dorsal + '.');
}

function bajarAlFilial(jugadorId) {
    for (var i = 0; i < gameState.squad.length; i++) {
        if (gameState.squad[i].id === jugadorId) {
            var p = gameState.squad[i];
            gameState.squad.splice(i, 1);
            var clon = JSON.parse(JSON.stringify(p));
            clon.esCanterano = true;
            gameState.cantera.filial.push(clon);
            renderSquadTable();
            renderSquadStats();
            renderCanteraFilial();
            showModal('FILIAL', p.name + ' ha sido bajado al filial.');
            return;
        }
    }
}

function calcularPrecioBaseEntrada() {
    var r = gameState.rating || 75;
    if (r >= 90) return 70;
    if (r >= 80) return 55;
    if (r >= 70) return 40;
    if (r >= 60) return 28;
    if (r >= 50) return 18;
    if (r >= 40) return 12;
    return 7;
}

function renderEstadioView() {
    document.getElementById('stadiumName').innerText = gameState.stadium;
    document.getElementById('stadiumCapacity').innerText = (gameState.capacity || 0).toLocaleString() + ' esp.';
    document.getElementById('stadiumRating').innerText = gameState.rating || 75;
    var precioBase = calcularPrecioBaseEntrada();
    document.getElementById('stadiumPrecioRecomendado').innerText = precioBase + ' \u20ac';

    var slider = document.getElementById('ticketSlider');
    if (slider) {
        var minVal = Math.round(precioBase * 0.3);
        var maxVal = Math.round(precioBase * 2.5);
        slider.min = minVal;
        slider.max = maxVal;
        slider.value = gameState.ticketPrice || precioBase;
        document.getElementById('ticketMinLabel').innerText = minVal + '\u20ac';
        document.getElementById('ticketMaxLabel').innerText = maxVal + '\u20ac';
    }
    actualizarPrecioEntrada();
}

function actualizarPrecioEntrada() {
    var slider = document.getElementById('ticketSlider');
    if (!slider) return;
    var precio = parseInt(slider.value);
    gameState.ticketPrice = precio;
    document.getElementById('ticketPriceDisplay').innerText = precio + '\u20ac';

    var base = calcularPrecioBaseEntrada();
    var ratio = precio / base;
    var fb = document.getElementById('ticketFeedback');
    if (!fb) return;

    if (ratio <= 0.8) {
        fb.style.background = '#0a2a1a';
        fb.style.border = '1px solid #22c55e';
        fb.style.color = '#a7f3d0';
        fb.innerHTML = '<i class="fa-solid fa-circle" style="color:#22c55e;"></i> Precios muy accesibles para la afici\u00f3n. Lleno total asegurado (100% aforo).';
    } else if (ratio <= 1.15) {
        fb.style.background = '#1a2a0a';
        fb.style.border = '1px solid #eab308';
        fb.style.color = '#fde68a';
        fb.innerHTML = '<i class="fa-solid fa-circle" style="color:#eab308;"></i> Precio justo para el nivel del club. Buena entrada esperada (85% - 95% aforo).';
    } else if (ratio <= 1.4) {
        fb.style.background = '#1a1a0a';
        fb.style.border = '1px solid #f97316';
        fb.style.color = '#fdba74';
        fb.innerHTML = '<i class="fa-solid fa-circle" style="color:#f97316;"></i> Precios algo elevados. La asistencia bajar\u00e1 (60% - 75% aforo).';
    } else {
        fb.style.background = '#2a0a0a';
        fb.style.border = '1px solid #ef4444';
        fb.style.color = '#fca5a5';
        fb.innerHTML = '<i class="fa-solid fa-circle" style="color:#ef4444;"></i> \u00a1Precios desorbitados para nuestro club! Gran parte del estadio estar\u00e1 vac\u00edo (30% - 45% aforo).';
    }
}

function renderSquadStats() {
    var tbody = document.getElementById('squadStatsBody');
    tbody.innerHTML = '';
    ordenarPlantilla(gameState.squad);
    gameState.squad.forEach(function (p) {
        var st = p.statsTemporada || {};
        var tr = document.createElement('tr');
        tr.innerHTML =
            '<td><span class="dorsal-badge">' + (p.dorsal || '-') + '</span></td>' +
            '<td><span class="pos-badge pos-' + p.pos + '">' + p.pos + '</span></td>' +
            '<td>' + p.name + getEstadoIcono(p) + '</td>' +
            '<td style="text-align:center;">' + getRolIcon(p.rol || 'rotacion') + '<br><span style="font-size:8px;color:#94a3b8;">' + getRolAbreviado(p.rol || 'rotacion') + '</span></td>' +
            '<td style="text-align:center;">' + getMoralIcon(p) + '</td>' +
            '<td style="font-size: 20px;">' + flagEmoji(p.nationality) + '</td>' +
            '<td>' + (st.partidos || 0) + '</td>' +
            '<td style="color:#10b981;">' + (st.goles || 0) + '</td>' +
            '<td style="color:#38bdf8;">' + (st.asistencias || 0) + '</td>' +
            '<td style="color:#6ee7b7;font-weight:bold;">' + (st.promedioNotas ? st.promedioNotas.toFixed(1) : '-') + '</td>' +
            '<td style="color:#facc15;">' + (st.ta || 0) + '</td>' +
            '<td style="color:#fca5a5;">' + (st.tr || 0) + '</td>';
        tr.onclick = function () { showPlayerDetail(p, true); };
        tbody.appendChild(tr);
    });
    if (gameState.cedidosFuera && gameState.cedidosFuera.length > 0) {
        var hr = tbody.insertRow();
        hr.innerHTML = '<td colspan="12" style="color:#38bdf8;font-size:11px;padding:8px 4px;border-bottom:1px solid #1e293b;border-top:2px solid #334155;"><i class="fa-solid fa-handshake"></i> JUGADORES CEDIDOS</td>';
        gameState.cedidosFuera.forEach(function(cr) {
            var r = tbody.insertRow();
            r.style.color = '#64748b';
            r.innerHTML =
                '<td><span class="dorsal-badge" style="background:#334155;">' + (cr.dorsal || '-') + '</span></td>' +
                '<td><span class="pos-badge pos-' + cr.pos + '">' + cr.pos + '</span></td>' +
                '<td>' + cr.nombre + ' <span style="color:#eab308;font-size:10px;">→ ' + cr.destino + '</span></td>' +
                '<td style="text-align:center;font-size:10px;color:#64748b;">-</td>' +
                '<td style="text-align:center;">-</td>' +
                '<td style="font-size:20px;">' + flagEmoji(cr.nacionalidad || 'es') + '</td>' +
                '<td>' + (cr.partidos || 0) + '</td>' +
                '<td style="color:#10b981;">' + (cr.statsTemporada ? (cr.statsTemporada.goles || 0) : 0) + '</td>' +
                '<td style="color:#38bdf8;">' + (cr.statsTemporada ? (cr.statsTemporada.asistencias || 0) : 0) + '</td>' +
                '<td style="color:#64748b;">-</td>' +
                '<td style="color:#facc15;">0</td>' +
                '<td style="color:#fca5a5;">0</td>';
            r.onclick = function() {
                showPlayerDetail({
                    id: cr.id,
                    name: cr.nombre,
                    pos: cr.pos,
                    rating: cr.rating,
                    age: cr.edad,
                    nationality: cr.nacionalidad || 'es',
                    height: cr.altura || 180,
                    val: cr.val || '0M€',
                    dorsal: cr.dorsal,
                    statsTemporada: cr.statsTemporada || { partidos: 0, goles: 0, asistencias: 0, ta: 0, tr: 0 },
                    lesionSemanas: 0,
                    sancionSemanas: 0,
                    stamina: '100%'
                }, true);
            };
        });
    }
}

function renderSquadTable() {
    const tbody = document.getElementById('squadTableBody');
    tbody.innerHTML = '';
    ordenarPlantilla(gameState.squad);
    gameState.squad.forEach(function (p) {
        const tr = document.createElement('tr');
        tr.innerHTML =
            '<td><span class="dorsal-badge">' + (p.dorsal || '-') + '</span></td>' +
            '<td><span class="pos-badge pos-' + p.pos + '">' + p.pos + '</span></td>' +
            '<td>' + p.name + getEstadoIcono(p) + (p.enTransferibles ? ' <span style="font-size:8px;background:#92400e;color:#fbbf24;padding:1px 4px;border-radius:3px;font-weight:bold;">TRA</span>' : '') + (p.enCedibles ? ' <span style="font-size:8px;background:#1e3a5f;color:#38bdf8;padding:1px 4px;border-radius:3px;font-weight:bold;">CED</span>' : '') + (p.esCedido ? ' <span style="font-size:8px;background:#1e3a5f;color:#38bdf8;padding:1px 4px;border-radius:3px;font-weight:bold;">CED</span> <span style="font-size:9px;color:#38bdf8;">\u2190 ' + (p.equipoOrigen || '?') + '</span>' : '') + '</td>' +
            '<td style="text-align:center;">' + getMoralIcon(p) + '</td>' +
            '<td style="font-size: 20px;">' + flagEmoji(p.nationality) + '</td>' +
            '<td>' + p.age + '</td>' +
            '<td style="color:#6ee7b7;font-weight:bold;">' + p.rating + '</td>' +
            '<td>' + (p.stamina || '100%') + '</td>' +
            '<td>' + p.val + '</td>';
        tr.onclick = function () { showPlayerDetail(p, true); };
        tbody.appendChild(tr);
    });
    if (gameState.cedidosFuera && gameState.cedidosFuera.length > 0) {
        var hr = tbody.insertRow();
        hr.innerHTML = '<td colspan="9" style="color:#38bdf8;font-size:11px;padding:8px 4px;border-bottom:1px solid #1e293b;border-top:2px solid #334155;"><i class="fa-solid fa-handshake"></i> JUGADORES CEDIDOS A OTROS CLUBES</td>';
        gameState.cedidosFuera.forEach(function(cr) {
            var r = tbody.insertRow();
            r.style.color = '#64748b';
            r.innerHTML =
                '<td><span class="dorsal-badge" style="background:#334155;">' + (cr.dorsal || '-') + '</span></td>' +
                '<td><span class="pos-badge pos-' + cr.pos + '">' + cr.pos + '</span></td>' +
                '<td>' + cr.nombre + ' <span style="color:#eab308;font-size:10px;">→ ' + cr.destino + '</span></td>' +
                '<td style="text-align:center;">-</td>' +
                '<td style="font-size:20px;">' + flagEmoji(cr.nacionalidad || 'es') + '</td>' +
                '<td>' + (cr.edad || '-') + '</td>' +
                '<td style="color:#6ee7b7;font-weight:bold;">' + (cr.rating || '-') + '</td>' +
                '<td style="color:#64748b;">CEDIDO</td>' +
                '<td style="color:#64748b;">—</td>';
            r.onclick = function() {
                showPlayerDetail({
                    id: cr.id,
                    name: cr.nombre,
                    pos: cr.pos,
                    rating: cr.rating,
                    age: cr.edad,
                    nationality: cr.nacionalidad || 'es',
                    height: cr.altura || 180,
                    val: cr.val || '0M€',
                    dorsal: cr.dorsal,
                    statsTemporada: cr.statsTemporada || { partidos: 0, goles: 0, asistencias: 0, ta: 0, tr: 0 },
                    lesionSemanas: 0,
                    sancionSemanas: 0,
                    stamina: '100%'
                }, true);
            };
        });
    }

}
function renderInjuries() {
    var container = document.getElementById('injuriesList');
    if (!container) return;
    var lesionados = gameState.squad.filter(function(p) { return p.lesionSemanas > 0; });
    if (lesionados.length === 0) {
        container.innerHTML = '<div style="color:#22c55e;font-size:12px;text-align:center;padding:20px;"><i class="fa-solid fa-check-circle"></i> No hay lesionados en la plantilla.</div>';
        return;
    }
    var html = '';
    lesionados.forEach(function(p) {
        var tipo = p.tipoLesion || 'Desconocida';
        var icono = tipo === 'Muscular' ? 'fa-solid fa-bolt' : tipo === 'Esguince' ? 'fa-solid fa-bone' : tipo === 'Fractura' ? 'fa-solid fa-xmark' : 'fa-solid fa-notes-medical';
        html += '<div style="display:flex;align-items:center;gap:6px;padding:4px;background:#0f1620;border-radius:4px;border-left:3px solid #ef4444;">' +
            '<i class="' + icono + '" style="color:#ef4444;font-size:14px;width:18px;text-align:center;"></i>' +
            '<div style="flex:1;min-width:0;">' +
            '<div style="font-size:11px;color:#e2e8f0;">' + p.name + ' <span class="pos-badge" style="font-size:8px;padding:1px 3px;">' + p.pos + '</span></div>' +
            '<div style="font-size:9px;color:#94a3b8;">' + tipo + '</div></div>' +
            '<div style="text-align:right;">' +
            '<div style="font-size:11px;color:#fca5a5;font-weight:bold;">' + p.lesionSemanas + ' sem</div>' +
            '<div style="font-size:8px;color:#64748b;">baja</div></div></div>';
    });
    container.innerHTML = html;
}
function getLinea(pos) {
    if (pos === 'PO' || pos === 'POR') return 'po';
    if (['DFC','LI','LD','CAI','CAD'].indexOf(pos) !== -1) return 'defensa';
    if (['MCD','MC','MCO','MI','MD'].indexOf(pos) !== -1) return 'medio';
    if (['EI','ED','DC'].indexOf(pos) !== -1) return 'ataque';
    return 'medio';
}

function getAlineacion(formation) {
    var lines = {
        '4-4-2 Estándar': { po: 1, defensa: 4, medio: 4, ataque: 2 },
        '4-3-3 Defensivo': { po: 1, defensa: 4, medio: 3, ataque: 3 },
        '4-2-3-1':        { po: 1, defensa: 4, medio: 5, ataque: 1 },
        '3-4-3':          { po: 1, defensa: 3, medio: 4, ataque: 3 },
        '4-4-2 Diamante': { po: 1, defensa: 4, medio: 4, ataque: 2 },
        '4-1-4-1':        { po: 1, defensa: 4, medio: 5, ataque: 1 },
        '5-3-2 Defensivo': { po: 1, defensa: 5, medio: 3, ataque: 2 }
    };
    return lines[formation] || lines['4-4-2 Estándar'];
}

function seleccionarXI(squad, formation) {
    var alineacion = getAlineacion(formation);
    var lines = { po: [], defensa: [], medio: [], ataque: [] };
    squad.forEach(function (p) {
        var linea = getLinea(p.pos);
        if (lines[linea]) lines[linea].push(p);
    });
    Object.keys(lines).forEach(function (k) {
        lines[k].sort(function (a, b) { return b.rating - a.rating; });
    });

    var xi = [];
    var used = {};
    Object.keys(alineacion).forEach(function (k) {
        var needed = alineacion[k];
        var picked = 0;
        lines[k].forEach(function (p) {
            if (picked < needed && !used[p.id]) {
                xi.push(p);
                used[p.id] = true;
                picked++;
            }
        });
        while (picked < needed) {
            var best = null;
            squad.forEach(function (p) {
                if (!used[p.id] && (!best || p.rating > best.rating)) best = p;
            });
            if (best) { xi.push(best); used[best.id] = true; picked++; }
            else break;
        }
    });
    squad.forEach(function (p) {
        if (xi.length < 11 && !used[p.id]) { xi.push(p); used[p.id] = true; }
    });
    return xi;
}

function calcularRatingEquipo(squad) {
    var s = squad || gameState.squad;
    if (!s || s.length === 0) return { por: 0, def: 0, med: 0, ata: 0, glo: 0 };

    function avg(arr) {
        return arr.length > 0 ? Math.round(arr.reduce(function (a, b) { return a + b; }) / arr.length) : 0;
    }

    function mejores(arr, n) {
        return arr.sort(function (a, b) { return b.rating - a.rating; }).slice(0, n);
    }

    var por = s.filter(function (p) { return getLinea(p.pos) === 'po'; });
    var def = s.filter(function (p) { return getLinea(p.pos) === 'defensa'; });
    var med = s.filter(function (p) { return getLinea(p.pos) === 'medio'; });
    var ata = s.filter(function (p) { return getLinea(p.pos) === 'ataque'; });

    var topPor = mejores(por, 2);
    var topDef = mejores(def, 3);
    var topMed = mejores(med, 3);
    var topAta = mejores(ata, 3);

    var rPor = avg(topPor.map(function (p) { return p.rating; }));
    var rDef = avg(topDef.map(function (p) { return p.rating; }));
    var rMed = avg(topMed.map(function (p) { return p.rating; }));
    var rAta = avg(topAta.map(function (p) { return p.rating; }));

    var once = topPor.concat(topDef, topMed, topAta);
    var rGlo = avg(once.map(function (p) { return p.rating; }));

    return { por: rPor, def: rDef, med: rMed, ata: rAta, glo: rGlo };
}

var _nombresPool = {
    'España': ['García','López','Martínez','Sánchez','González','Fernández','Ruíz','Díaz','Moreno','Álvarez','Romero','Navarro','Torres','Jiménez','Vázquez','Ramos','Gil','Ortega','Castro','Domínguez'],
    'Inglaterra': ['Smith','Jones','Williams','Brown','Taylor','Davies','Wilson','Evans','Thomas','Roberts','Walker','Wright','Green','Hill','Scott','Adams','Baker','Parker','Miller','Turner'],
    'Italia': ['Rossi','Russo','Ferrari','Esposito','Bianchi','Romano','Colombo','Ricci','Marino','Greco','Bruno','Conti','Mancini','Costa','Giordano','Rinaldi','Pellegrini','Caruso','Martini','Bellini']
};

function generarPlantillaSimulada(nombreEquipo, pais, ratingEquipo) {
    var pool = _nombresPool[pais] || _nombresPool['España'];
    var posiciones = ['PO','PO','DFC','DFC','LI','LD','MCD','MC','MC','MI','MD','MCO','EI','ED','DC','DC','DFC','MC','ED','EI'];
    var nats = {'España':'es','Inglaterra':'eng','Italia':'it'};
    var nat = nats[pais] || 'es';

    var squad = [];
    for (var i = 0; i < posiciones.length; i++) {
        var varRating = Math.floor(Math.random() * 10) - 4;
        var rating = Math.min(99, Math.max(50, parseInt(ratingEquipo) + varRating));
        squad.push({
            id: i + 1,
            dorsal: Math.floor(Math.random() * 40) + 1,
            pos: posiciones[i],
            name: pool[i % pool.length],
            nationality: nat,
            age: Math.floor(Math.random() * 15) + 18,
            height: Math.floor(Math.random() * 20) + 170,
            rating: rating,
            stamina: (Math.floor(Math.random() * 21) + 80) + '%',
            val: (rating * 0.12).toFixed(1) + 'M€',
            pj: 0, gol: 0, asi: 0, ta: 0, tr: 0,
            lesionSemanas: 0,
            sancionSemanas: 0,
            tarjetasAmarillasAcum: 0,
            moral: 4, rol: 'rotacion', jornadasSinJugar: 0,
            statsTemporada: { partidos: 0, goles: 0, asistencias: 0, ta: 0, tr: 0, historialNotas: [], promedioNotas: 0 },
            equipoId: nombreEquipo
        });
    }
    return squad;
}

var _palmaresReales = {
    'Athletic Club': [
        { nombre: 'Primera División', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/1.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 8, anios: ['1983-84','1982-83','1955-56','1942-43','1935-36','1933-34','1930-31','1929-30'] },
        { nombre: 'Copa del Rey', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/129.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 24, anios: ['2023-24','1983-84','1972-73','1968-69','1957-58','1955-56','1954-55','1949-50','1944-45','1943-44','1942-43','1932-33','1931-32','1930-31','1929-30','1922-23','1920-21','1915-16','1914-15','1913-14','1910-11','1909-10','1903-04'] },
        { nombre: 'Supercopa de España', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/132.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 3, anios: ['2021','2015','1984'] }
    ],
    'Atlético de Madrid': [
        { nombre: 'Primera División', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/1.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 11, anios: ['2020-21','2013-14','1995-96','1976-77','1972-73','1969-70','1965-66','1950-51','1949-50','1940-41','1939-40'] },
        { nombre: 'Copa del Rey', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/129.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 10, anios: ['2012-13','1995-96','1991-92','1990-91','1984-85','1975-76','1971-72','1964-65','1960-61','1959-60'] },
        { nombre: 'Supercopa de España', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/132.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 2, anios: ['2014','1985'] },
        { nombre: 'Europa League', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/117.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 3, anios: ['2017-18','2011-12','2009-10'] },
        { nombre: 'Supercopa de Europa', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/133.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 3, anios: ['2018','2012','2010'] },
        { nombre: 'Copa Intercontinental', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/1747.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 1, anios: ['1974'] },
        { nombre: 'Segunda División', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/2.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 1, anios: ['2001-02'] }
    ],
    'RC Celta': [
        { nombre: 'Segunda División', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/2.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 4, anios: ['1991-92','1981-82','1935-36','1934-35'] },
        { nombre: 'Primera Federación', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/2468.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 1, anios: ['1980-81'] },
        { nombre: 'Segunda Federación', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/2469.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 1, anios: ['1930-31'] }
    ],
    'Deportivo Alavés': [
        { nombre: 'Segunda División', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/2.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 4, anios: ['2015-16','1997-98','1953-54','1929-30'] },
        { nombre: 'Primera Federación', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/2468.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 4, anios: ['2012-13','1994-95','1993-94','1992-93'] },
        { nombre: 'Segunda Federación', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/2469.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 6, anios: ['1989-90','1973-74','1967-68','1964-65','1960-61','1940-41'] }
    ],
    'Elche': [
        { nombre: 'Segunda División', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/2.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 2, anios: ['2012-13','1958-59'] },
        { nombre: 'Segunda Federación', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/2469.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 7, anios: ['1957-58','1956-57','1954-55','1947-48','1944-45','1943-44','1940-41'] }
    ],
    'Espanyol': [
        { nombre: 'Copa del Rey', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/129.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 4, anios: ['2005-06','1999-00','1939-40','1928-29'] },
        { nombre: 'Segunda División', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/2.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 2, anios: ['2020-21','1993-94'] }
    ],
    'FC Barcelona': [
        { nombre: 'Primera División', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/1.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 29, anios: ['2025-26','2024-25','2022-23','2018-19','2017-18','2015-16','2014-15','2012-13','2010-11','2009-10','2008-09','2005-06','2004-05','1998-99','1997-98','1993-94','1992-93','1991-92','1990-91','1984-85','1973-74','1959-60','1958-59','1952-53','1951-52','1948-49','1947-48','1944-45','1929'] },
        { nombre: 'Copa del Rey', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/129.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 32, anios: ['2024-25','2020-21','2017-18','2016-17','2015-16','2014-15','2011-12','2008-09','1997-98','1996-97','1989-90','1987-88','1982-83','1980-81','1977-78','1970-71','1967-68','1962-63','1958-59','1956-57','1952-53','1951-52','1950-51','1941-42','1927-28','1925-26','1924-25','1921-22','1919-20','1912-13','1911-12','1909-10'] },
        { nombre: 'Supercopa de España', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/132.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 16, anios: ['2026','2025','2023','2018','2016','2013','2011','2010','2009','2006','2005','1996','1994','1992','1991','1983'] },
        { nombre: 'Champions League', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/107.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 5, anios: ['2014-15','2010-11','2008-09','2005-06','1991-92'] },
        { nombre: 'Supercopa de Europa', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/133.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 5, anios: ['2015','2011','2009','1997','1992'] },
        { nombre: 'Mundial de Clubes', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/137.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 3, anios: ['2016','2012','2010'] }
    ],
    'Getafe': [
        { nombre: 'Primera Federación', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/2468.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 1, anios: ['1998-99'] }
    ],
    'Levante': [
        { nombre: 'Segunda División', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/2.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 4, anios: ['2024-25','2016-17','2003-04','1939-40'] },
        { nombre: 'Primera Federación', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/2468.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 5, anios: ['1998-99','1995-96','1994-95','1988-89','1978-79'] },
        { nombre: 'Segunda Federación', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/2469.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 7, anios: ['1975-76','1972-73','1955-56','1953-54','1945-46','1943-44','1931-32'] }
    ],
    'Málaga': [
        { nombre: 'Segunda División', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/2.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 1, anios: ['1998-99'] },
        { nombre: 'Primera Federación', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/2468.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 1, anios: ['1997-98'] },
        { nombre: 'Segunda Federación', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/2469.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 1, anios: ['1994-95'] }
    ],
    'Osasuna': [
        { nombre: 'Segunda División', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/2.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 5, anios: ['2018-19','1960-61','1955-56','1952-53','1934-35'] },
        { nombre: 'Segunda Federación', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/2469.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 6, anios: ['1976-77','1974-75','1968-69','1948-49','1947-48','1931-32'] }
    ],
    'Racing': [
        { nombre: 'Segunda División', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/2.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 3, anios: ['2025-26','1959-60','1949-50'] },
        { nombre: 'Primera Federación', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/2468.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 2, anios: ['2021-22','1990-91'] },
        { nombre: 'Segunda Federación', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/2469.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 3, anios: ['1969-70','1947-48','1943-44'] }
    ],
    'Rayo Vallecano': [
        { nombre: 'Segunda División', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/2.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 1, anios: ['2017-18'] },
        { nombre: 'Primera Federación', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/2468.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 2, anios: ['2007-08','1984-85'] },
        { nombre: 'Segunda Federación', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/2469.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 2, anios: ['1964-65','1955-56'] }
    ],
    'RC Deportivo': [
        { nombre: 'Primera División', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/1.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 1, anios: ['1999-00'] },
        { nombre: 'Copa del Rey', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/129.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 2, anios: ['2001-02','1994-95'] },
        { nombre: 'Supercopa de España', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/132.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 3, anios: ['2002','2000','1995'] },
        { nombre: 'Segunda División', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/2.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 6, anios: ['2011-12','1967-68','1965-66','1963-64','1961-62','1939-40'] },
        { nombre: 'Primera Federación', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/2468.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 1, anios: ['2023-24'] },
        { nombre: 'Segunda Federación', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/2469.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 1, anios: ['1974-75'] }
    ],
    'Real Betis': [
        { nombre: 'Primera División', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/1.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 1, anios: ['1934-35'] },
        { nombre: 'Copa del Rey', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/129.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 3, anios: ['2021-22','2004-05','1976-77'] },
        { nombre: 'Segunda División', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/2.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 7, anios: ['2014-15','2010-11','1973-74','1970-71','1957-58','1941-42','1931-32'] },
        { nombre: 'Segunda Federación', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/2469.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 1, anios: ['1953-54'] }
    ],
    'Real Madrid': [
        { nombre: 'Primera División', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/1.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 36, anios: ['2023-24','2021-22','2019-20','2016-17','2011-12','2007-08','2006-07','2002-03','2000-01','1996-97','1994-95','1989-90','1988-89','1987-88','1986-87','1985-86','1979-80','1978-79','1977-78','1975-76','1974-75','1971-72','1968-69','1967-68','1966-67','1964-65','1963-64','1962-63','1961-62','1960-61','1957-58','1956-57','1954-55','1953-54','1932-33','1931-32'] },
        { nombre: 'Copa del Rey', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/129.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 20, anios: ['2022-23','2013-14','2010-11','1992-93','1988-89','1981-82','1979-80','1974-75','1973-74','1969-70','1961-62','1946-47','1945-46','1935-36','1933-34','1916-17','1907-08','1906-07'] },
        { nombre: 'Supercopa de España', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/132.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 13, anios: ['2024','2022','2020','2017','2012','2008','2003','2001','1997','1993','1990','1988'] },
        { nombre: 'Champions League', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/107.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 15, anios: ['2023-24','2021-22','2017-18','2016-17','2015-16','2013-14','2001-02','1999-00','1997-98','1965-66','1959-60','1958-59','1957-58','1956-57','1955-56'] },
        { nombre: 'Supercopa de Europa', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/133.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 6, anios: ['2024','2022','2017','2016','2014','2002'] },
        { nombre: 'Europa League', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/117.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 2, anios: ['1985-86','1984-85'] },
        { nombre: 'Mundial de Clubes', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/137.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 5, anios: ['2023','2019','2018','2017','2015'] },
        { nombre: 'Copa Intercontinental', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/1747.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 3, anios: ['2002','1998','1960'] },
        { nombre: 'Copa Intercontinental de la FIFA', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/2976.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 1, anios: ['2025'] }
    ],
    'Real Sociedad': [
        { nombre: 'Primera División', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/1.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 2, anios: ['1981-82','1980-81'] },
        { nombre: 'Copa del Rey', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/129.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 3, anios: ['2025-26','2019-20','1986-87'] },
        { nombre: 'Supercopa de España', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/132.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 1, anios: ['1982'] },
        { nombre: 'Segunda División', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/2.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 6, anios: ['2009-10','1966-67','1948-49','1942-43','1940-41','1939-40'] }
    ],
    'Sevilla': [
        { nombre: 'Primera División', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/1.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 1, anios: ['1945-46'] },
        { nombre: 'Copa del Rey', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/129.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 5, anios: ['2009-10','2006-07','1947-48','1938-39','1934-35'] },
        { nombre: 'Supercopa de España', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/132.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 1, anios: ['2007'] },
        { nombre: 'Europa League', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/117.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 7, anios: ['2022-23','2019-20','2015-16','2014-15','2013-14','2006-07','2005-06'] },
        { nombre: 'Supercopa de Europa', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/133.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 1, anios: ['2006'] },
        { nombre: 'Segunda División', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/2.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 4, anios: ['2000-01','1968-69','1933-34','1928-29'] }
    ],
    'Valencia': [
        { nombre: 'Primera División', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/1.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 6, anios: ['2003-04','2001-02','1970-71','1946-47','1943-44','1941-42'] },
        { nombre: 'Copa del Rey', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/129.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 8, anios: ['2018-19','2007-08','1998-99','1978-79','1966-67','1953-54','1948-49','1940-41'] },
        { nombre: 'Supercopa de España', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/132.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 1, anios: ['1999'] },
        { nombre: 'Europa League', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/117.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 1, anios: ['2003-04'] },
        { nombre: 'Supercopa de Europa', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/133.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 2, anios: ['2004','1980'] },
        { nombre: 'Segunda División', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/2.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 2, anios: ['1986-87','1930-31'] }
    ],
    'Villarreal': [
        { nombre: 'Europa League', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/117.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 1, anios: ['2020-21'] },
        { nombre: 'Segunda Federación', icono: '<img src="https://cdn.resfu.com/img_data/competiciones/copa/2469.png?size=120x&lossy=1" style="height:28px;width:auto;">', count: 1, anios: ['1969-70'] }
    ]
};

function inicializarPalmaresClub() {
    if (Object.keys(gameState.palmaresClub).length > 0) return;
    for (var team in _palmaresReales) {
        gameState.palmaresClub[team] = JSON.parse(JSON.stringify(_palmaresReales[team]));
    }
}

function obtenerIconoPorTipo(tipo) {
    var base = 'https://cdn.resfu.com/img_data/competiciones/copa/';
    var ids = {
        'Primera División': '1', 'Copa del Rey': '129', 'Supercopa de España': '132',
        'Champions League': '107', 'Europa League': '117', 'Supercopa de Europa': '133',
        'Mundial de Clubes': '137', 'Copa Intercontinental': '1747',
        'Copa Intercontinental de la FIFA': '2976', 'Segunda División': '2',
        'Primera Federación': '2468', 'Segunda Federación': '2469'
    };
    return '<img src="' + base + (ids[tipo] || '1') + '.png?size=120x&lossy=1" style="height:28px;width:auto;">';
}

function generarPalmaresSimulado(rating) {
    var ahora = new Date().getFullYear();
    function generarAnios(count, min, max) {
        var anios = [];
        for (var i = 0; i < count; i++) anios.push(max - Math.floor(Math.random() * (max - min)));
        anios.sort(function(a, b) { return b - a; });
        return anios;
    }
    var trofeos = [];
    var ligasCount = rating >= 85 ? 3 + Math.floor(Math.random() * 4) : rating >= 75 ? 1 + Math.floor(Math.random() * 3) : Math.floor(Math.random() * 2);
    if (ligasCount > 0) trofeos.push({ nombre: 'Primera División', icono: obtenerIconoPorTipo('Primera División'), count: ligasCount, anios: generarAnios(ligasCount, 1950, ahora - 1) });
    var copasCount = rating >= 80 ? 2 + Math.floor(Math.random() * 3) : rating >= 70 ? 1 + Math.floor(Math.random() * 2) : Math.floor(Math.random());
    if (copasCount > 0) trofeos.push({ nombre: 'Copa del Rey', icono: obtenerIconoPorTipo('Copa del Rey'), count: copasCount, anios: generarAnios(copasCount, 1950, ahora - 1) });
    var superCount = rating >= 88 ? 1 + Math.floor(Math.random() * 2) : rating >= 82 ? Math.floor(Math.random() * 2) : 0;
    if (superCount > 0) trofeos.push({ nombre: 'Supercopa de España', icono: obtenerIconoPorTipo('Supercopa de España'), count: superCount, anios: generarAnios(superCount, 1955, ahora - 1) });
    return trofeos;
}

function obtenerPalmaresClub(nombreEquipo, rating) {
    inicializarPalmaresClub();
    if (!gameState.palmaresClub[nombreEquipo]) {
        gameState.palmaresClub[nombreEquipo] = generarPalmaresSimulado(rating);
    }
    return gameState.palmaresClub[nombreEquipo];
}

function registrarTitulo(teamId, tipoTrofeo, temporada) {
    inicializarPalmaresClub();
    if (!gameState.palmaresClub[teamId]) gameState.palmaresClub[teamId] = [];
    var trofeo = null;
    for (var i = 0; i < gameState.palmaresClub[teamId].length; i++) {
        if (gameState.palmaresClub[teamId][i].nombre === tipoTrofeo) {
            trofeo = gameState.palmaresClub[teamId][i]; break;
        }
    }
    if (trofeo) {
        trofeo.count++;
        trofeo.anios.unshift(temporada);
        trofeo._nuevas = trofeo._nuevas || [];
        trofeo._nuevas.push(temporada);
    } else {
        gameState.palmaresClub[teamId].push({
            nombre: tipoTrofeo,
            icono: obtenerIconoPorTipo(tipoTrofeo),
            count: 1,
            anios: [temporada],
            _nuevas: [temporada]
        });
    }
}

function mostrarAniosTrofeo(nombre) {
    var palmares = window._palmaresActual || [];
    var data = null;
    for (var i = 0; i < palmares.length; i++) {
        if (palmares[i].nombre === nombre) { data = palmares[i]; break; }
    }
    if (!data || !data.anios || data.anios.length === 0) return;
    var el = document.getElementById('trofeoDetail');
    var content = document.getElementById('trofeoDetailContent');
    if (!el || !content) return;
    if (el.style.display === 'block' && el._nombre === nombre) {
        el.style.display = 'none';
        return;
    }
    content.innerHTML = '<div style="font-size:13px;font-weight:bold;color:#38bdf8;margin-bottom:4px;">' + data.icono + ' ' + data.nombre + '</div>' +
        '<div style="display:flex;gap:4px;flex-wrap:wrap;">' +
        data.anios.map(function(a) {
            var esNueva = data._nuevas && data._nuevas.indexOf(a) !== -1;
            var chipStyle = esNueva
                ? 'background:#1a2a40;border:1px solid #38bdf8;border-radius:4px;padding:2px 8px;font-size:13px;color:#38bdf8;font-weight:bold;'
                : 'background:#1e293b;border:1px solid #334155;border-radius:4px;padding:2px 8px;font-size:13px;color:#e2e8f0;';
            return '<span style="' + chipStyle + '">' + a + '</span>';
        }).join('') +
        '</div>';
    el.style.display = 'block';
    el._nombre = nombre;
}

function abrirPlantillaRival(nombreEquipo) {
    var equiposDB = Database.getTeams(gameState.country, gameState.league);
    var equipoData = null;
    for (var i = 0; i < equiposDB.length; i++) {
        if (equiposDB[i].name === nombreEquipo) { equipoData = equiposDB[i]; break; }
    }

    document.getElementById('rivalModalTitle').innerText = nombreEquipo.toUpperCase();

    var tabla = [];
    if (gameState.fixture && gameState.fixture.length > 0) {
        var hasta = gameState.matchday || 38;
        var todosE = Database.getTeams(gameState.country, gameState.league);
        tabla = calcularClasificacion(todosE, gameState.fixture, hasta);
    }
    var pos = 0;
    var pts = 0;
    for (var i = 0; i < tabla.length; i++) {
        if (tabla[i].nombre === nombreEquipo) { pos = i + 1; pts = tabla[i].pts; break; }
    }
    var formacionRival = _formacionesEquipos[nombreEquipo] || '—';
    document.getElementById('rivalModalPosicion').innerHTML = (pos > 0 ? pos + 'ª (' + pts + ' pts)' : '') + ' · ' + formacionRival;

    var rating = equipoData ? (equipoData.rating || 75) : 75;
    if (nombreEquipo === gameState.team) rating = gameState.rating;
    var squad = obtenerSquadEquipo(nombreEquipo);

    // GENERAL
    var genHtml = '';
    if (equipoData) {
        var valorTotal = 0;
        squad.forEach(function(p) {
            var valStr = (p.val || '0M€').replace('€', '').replace('M', '').replace('K', '');
            var valNum = parseFloat(valStr);
            if ((p.val || '').indexOf('K') !== -1) valNum = valNum / 1000;
            valorTotal += valNum;
        });
        var valorFormateado = valorTotal >= 1000 ? (valorTotal / 1000).toFixed(1) + 'B€' : valorTotal.toFixed(1) + 'M€';

        var apellidos = _nombresPool[gameState.country] || _nombresPool['España'];
        var managerName = (equipoData && equipoData.manager)
            ? equipoData.manager + (equipoData.managerNation ? ' ' + flagEmoji(equipoData.managerNation) : '')
            : apellidos[Math.floor(Math.random() * apellidos.length)];

        var formaHtml = '';
        if (gameState.fixture) {
            var ultimos = [];
            for (var f = 0; f < gameState.fixture.length; f++) {
                var jornada = gameState.fixture[f];
                if (!jornada || !jornada.partidos) continue;
                for (var m = 0; m < jornada.partidos.length; m++) {
                    var p = jornada.partidos[m];
                    if (!p.jugado || !p.resultado) continue;
                    if (p.local === nombreEquipo || p.visitante === nombreEquipo) {
                        var gf = p.local === nombreEquipo ? p.resultado.golesFavor : p.resultado.golesContra;
                        var gc = p.local === nombreEquipo ? p.resultado.golesContra : p.resultado.golesFavor;
                        ultimos.push(gf > gc ? 'V' : gf === gc ? 'E' : 'D');
                    }
                }
            }
            var recientes = ultimos.slice(-5);
            var colores = { V: '#22c55e', E: '#eab308', D: '#ef4444' };
            recientes.forEach(function(r) {
                formaHtml += '<span style="display:inline-block;width:24px;height:24px;line-height:24px;text-align:center;border-radius:4px;background:#1e293b;border:1px solid ' + colores[r] + ';color:' + colores[r] + ';font-size:12px;font-weight:bold;">' + r + '</span>';
            });
        }

        var calc = calcularRatingEquipo(squad);
        genHtml =
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">' +
            '<div style="background:#0f172a;border:1px solid #334155;border-radius:8px;padding:12px;">' +
            '<div style="font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;border-bottom:1px solid #1e293b;padding-bottom:4px;"><i class="fa-solid fa-building"></i> DATOS DEL CLUB</div>' +
            '<div style="display:flex;flex-direction:column;gap:6px;">' +
            '<div><span style="font-size:10px;color:#64748b;text-transform:uppercase;">ESTADIO</span><br><span style="font-size:14px;color:#f8fafc;font-weight:bold;">' + (equipoData.stadium || '—') + '</span></div>' +
            '<div><span style="font-size:10px;color:#64748b;text-transform:uppercase;">CAPACIDAD</span><br><span style="font-size:14px;color:#f8fafc;font-weight:bold;">' + ((equipoData.capacity || 0).toLocaleString()) + ' esp.</span></div>' +
            '<div><span style="font-size:10px;color:#64748b;text-transform:uppercase;">ENTRENADOR</span><br><span style="font-size:14px;color:#f8fafc;font-weight:bold;">' + managerName + '</span></div>' +
            '</div></div>' +
            '<div style="background:#0f172a;border:1px solid #334155;border-radius:8px;padding:12px;">' +
            '<div style="font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;border-bottom:1px solid #1e293b;padding-bottom:4px;"><i class="fa-solid fa-briefcase"></i> FINANZAS Y OBJETIVO</div>' +
            '<div style="display:flex;flex-direction:column;gap:6px;">' +
            '<div><span style="font-size:10px;color:#64748b;text-transform:uppercase;">PRESUPUESTO</span><br><span style="font-size:14px;color:#eab308;font-weight:bold;">' + (equipoData.budget || '—') + '</span></div>' +
            '<div><span style="font-size:10px;color:#64748b;text-transform:uppercase;">OBJETIVO</span><br><span style="font-size:14px;color:#38bdf8;font-weight:bold;">' + (nombreEquipo === gameState.team ? (gameState.objetivoTemporada || '—') : (equipoData.target || '—')) + '</span></div>' +
            '<div><span style="font-size:10px;color:#64748b;text-transform:uppercase;">VALOR PLANTILLA</span><br><span style="font-size:14px;color:#f8fafc;font-weight:bold;">' + valorFormateado + '</span></div>' +
            '</div></div></div>' +
            '<div style="background:#0f172a;border:1px solid #334155;border-radius:8px;padding:12px;">' +
            '<div style="font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;border-bottom:1px solid #1e293b;padding-bottom:4px;"><i class="fa-solid fa-chart-simple"></i> RENDIMIENTO Y MEDIAS</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">' +
            '<div style="display:flex;gap:4px;align-items:center;flex-wrap:wrap;">' +
            '<div style="background:#1e293b;border:1px solid #334155;border-radius:6px;padding:4px 8px;text-align:center;min-width:36px;"><span style="font-size:10px;color:#94a3b8;">GLO</span><br><span style="font-size:18px;color:#38bdf8;font-weight:bold;">' + calc.glo + '</span></div>' +
            '<div style="background:#1e293b;border:1px solid #334155;border-radius:6px;padding:4px 8px;text-align:center;min-width:36px;"><span style="font-size:10px;color:#94a3b8;">POR</span><br><span style="font-size:18px;color:#7c3aed;font-weight:bold;">' + calc.por + '</span></div>' +
            '<div style="background:#1e293b;border:1px solid #334155;border-radius:6px;padding:4px 8px;text-align:center;min-width:36px;"><span style="font-size:10px;color:#94a3b8;">DEF</span><br><span style="font-size:18px;color:#b91c1c;font-weight:bold;">' + calc.def + '</span></div>' +
            '<div style="background:#1e293b;border:1px solid #334155;border-radius:6px;padding:4px 8px;text-align:center;min-width:36px;"><span style="font-size:10px;color:#94a3b8;">MED</span><br><span style="font-size:18px;color:#ea580c;font-weight:bold;">' + calc.med + '</span></div>' +
            '<div style="background:#1e293b;border:1px solid #334155;border-radius:6px;padding:4px 8px;text-align:center;min-width:36px;"><span style="font-size:10px;color:#94a3b8;">ATA</span><br><span style="font-size:18px;color:#15803d;font-weight:bold;">' + calc.ata + '</span></div>' +
            '</div>' +
            '<div style="display:flex;flex-direction:column;gap:4px;">' +
            '<span style="font-size:10px;color:#64748b;text-transform:uppercase;">ÚLTIMOS 5 PARTIDOS</span>' +
            '<div style="display:flex;gap:4px;">' + (formaHtml || '<span style="font-size:11px;color:#64748b;">Sin datos</span>') + '</div>' +
            '</div></div></div>';
    } else {
        genHtml = '<div style="color:#94a3b8;font-size:12px;padding:4px;">No hay datos disponibles.</div>';
    }
    document.getElementById('rivalGeneralContent').innerHTML = genHtml;

    // PLANTILLA
    ordenarPlantilla(squad);
    var htmlInfo = '<table class="squad-table" style="font-size:12px;"><thead><tr>' +
        '<th>#</th><th>Pos</th><th>Jugador</th><th>Nac</th><th>Edad</th><th>Med</th><th>Est</th><th>Valor</th>' +
        '</tr></thead><tbody>';
    squad.forEach(function(p){
        htmlInfo += '<tr class="rival-player-row" data-rid="' + p.id + '" style="cursor:pointer;">' +
            '<td><span class="dorsal-badge" style="width:22px;height:22px;font-size:9px;">' + (p.dorsal || '-') + '</span></td>' +
            '<td><span class="pos-badge pos-' + p.pos + '" style="font-size:10px;width:24px;">' + p.pos + '</span></td>' +
            '<td style="font-size:11px;">' + p.name + getEstadoIcono(p) + (p.esCedido ? ' <span style="font-size:8px;background:#eab308;color:#000;padding:1px 4px;border-radius:3px;font-weight:bold;">CED</span>' : '') + '</td>' +
            '<td style="font-size:16px;">' + flagEmoji(p.nationality) + '</td>' +
            '<td>' + p.age + '</td>' +
            '<td style="color:#6ee7b7;font-weight:bold;">' + p.rating + '</td>' +
            '<td>' + (p.stamina || '100%') + '</td>' +
            '<td>' + p.val + '</td></tr>';
    });
    htmlInfo += '</tbody></table>';

    var salidas = _cesionesSalida[nombreEquipo];
    if (salidas && salidas.length > 0) {
        htmlInfo += '<table class="squad-table" style="font-size:12px;margin-top:6px;"><thead><tr>' +
            '<th colspan="8" style="color:#38bdf8;font-size:11px;padding:8px 4px;border-bottom:1px solid #1e293b;border-top:2px solid #334155;"><i class="fa-solid fa-handshake"></i> JUGADORES CEDIDOS A OTROS CLUBES</th>' +
            '</tr></thead><tbody>';
        salidas.forEach(function(s) {
            htmlInfo += '<tr style="color:#64748b;">' +
                '<td><span class="dorsal-badge" style="background:#334155;">—</span></td>' +
                '<td><span class="pos-badge" style="font-size:8px;padding:1px 4px;">' + (s.pos || '—') + '</span></td>' +
                '<td style="font-size:11px;">' + s.nombre + ' <span style="color:#eab308;font-size:10px;">\u2192 ' + s.destino + '</span></td>' +
                '<td colspan="5"></td></tr>';
        });
        htmlInfo += '</tbody></table>';
    }

    var htmlStats = '<table class="squad-table" style="font-size:12px;"><thead><tr>' +
        '<th>#</th><th>Pos</th><th>Jugador</th><th>Nac</th><th>PJ</th><th>GOL</th><th>ASI</th><th>TA</th><th>TR</th>' +
        '</tr></thead><tbody>';
    squad.forEach(function(p){
        var st = p.statsTemporada || {};
        htmlStats += '<tr class="rival-player-row" data-rid="' + p.id + '" style="cursor:pointer;">' +
            '<td><span class="dorsal-badge" style="width:22px;height:22px;font-size:9px;">' + (p.dorsal || '-') + '</span></td>' +
            '<td><span class="pos-badge pos-' + p.pos + '" style="font-size:10px;width:24px;">' + p.pos + '</span></td>' +
            '<td style="font-size:11px;">' + p.name + getEstadoIcono(p) + (p.esCedido ? ' <span style="font-size:8px;background:#1e3a5f;color:#38bdf8;padding:1px 4px;border-radius:3px;font-weight:bold;">CED</span> <span style="font-size:9px;color:#38bdf8;">\u2190 ' + (p.equipoOrigen || '?') + '</span>' : '') + '</td>' +
            '<td style="font-size:16px;">' + flagEmoji(p.nationality) + '</td>' +
            '<td>' + (st.partidos || 0) + '</td>' +
            '<td style="color:#10b981;">' + (st.goles || 0) + '</td>' +
            '<td style="color:#38bdf8;">' + (st.asistencias || 0) + '</td>' +
            '<td style="color:#facc15;">' + (st.ta || 0) + '</td>' +
            '<td style="color:#fca5a5;">' + (st.tr || 0) + '</td></tr>';
    });
    htmlStats += '</tbody></table>';

    if (salidas && salidas.length > 0) {
        htmlStats += '<table class="squad-table" style="font-size:12px;margin-top:6px;"><thead><tr>' +
            '<th colspan="9" style="color:#38bdf8;font-size:11px;padding:8px 4px;border-bottom:1px solid #1e293b;border-top:2px solid #334155;"><i class="fa-solid fa-handshake"></i> JUGADORES CEDIDOS A OTROS CLUBES</th>' +
            '</tr></thead><tbody>';
        salidas.forEach(function(s) {
            htmlStats += '<tr style="color:#64748b;">' +
                '<td><span class="dorsal-badge" style="background:#334155;">—</span></td>' +
                '<td><span class="pos-badge" style="font-size:8px;padding:1px 4px;">' + (s.pos || '—') + '</span></td>' +
                '<td style="font-size:11px;">' + s.nombre + ' <span style="color:#eab308;font-size:10px;">\u2192 ' + s.destino + '</span></td>' +
                '<td colspan="6"></td></tr>';
        });
        htmlStats += '</tbody></table>';
    }

    document.getElementById('rinfo').innerHTML = htmlInfo;
    document.getElementById('rstats').innerHTML = htmlStats;

    document.querySelectorAll('#modalRival .rival-player-row').forEach(function(el){
        el.onclick = function(){
            var pid = parseInt(this.dataset.rid);
            for (var j = 0; j < squad.length; j++) {
                if (squad[j].id === pid) { showPlayerDetail(squad[j], false); break; }
            }
        };
    });

    // FICHAJES
    var h = gameState.historialTraspasos || [];
    var fichajesClub = [];
    h.forEach(function(t) {
        if (t.desde === nombreEquipo || t.para === nombreEquipo) fichajesClub.push(t);
    });
    var fichHtml = '';
    if (fichajesClub.length === 0) {
        fichHtml = '<div style="color:#64748b;text-align:center;padding:10px;font-size:12px;">No hay movimientos registrados.</div>';
    } else {
        fichHtml = '<div style="font-size:11px;color:#94a3b8;padding:2px 4px;border-bottom:1px solid #1e293b;">MOVIMIENTOS (' + fichajesClub.length + ')</div>';
        fichajesClub.forEach(function(t) {
            var icono = t.tipo === 'compra' ? '<i class="fa-solid fa-cart-shopping"></i>' : t.tipo === 'venta' ? '<i class="fa-solid fa-coins"></i>' : '<i class="fa-solid fa-arrows-rotate"></i>';
            var color = t.tipo === 'compra' ? '#22c55e' : t.tipo === 'venta' ? '#eab308' : '#38bdf8';
            fichHtml += '<div class="tactic-list-item" style="cursor:default;padding:3px 6px;">' +
                '<span style="font-size:10px;color:#64748b;min-width:36px;">' + t.fecha + '</span>' +
                '<span style="font-size:12px;">' + icono + ' ' + t.jugador + '</span>' +
                '<span style="font-size:10px;color:#94a3b8;flex:1;text-align:right;">' + t.desde + ' → <span style="color:' + color + ';">' + t.para + '</span></span>' +
                '<span style="font-size:10px;color:#eab308;min-width:44px;text-align:right;">' + t.precio.toFixed(1) + 'M€</span></div>';
        });
    }
    document.getElementById('rivalFichajesContent').innerHTML = fichHtml;

    // HISTORIAL
    var palmares = obtenerPalmaresClub(nombreEquipo, rating);
    window._palmaresActual = palmares;
    var histHtml = '' +
        '<div style="font-size:11px;color:#38bdf8;padding:2px 4px;border-bottom:1px solid #1e293b;margin-bottom:4px;"><i class="fa-solid fa-trophy"></i> PALMARÉS</div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;padding:4px;">';
    palmares.forEach(function(t) {
        var nombreEscaped = t.nombre.replace(/'/g, "\\'");
        histHtml += '<div class="trofeo-card" onclick="mostrarAniosTrofeo(\'' + nombreEscaped + '\')" style="cursor:pointer;background:#0f172a;border:1px solid #334155;border-radius:4px;padding:6px 10px;text-align:center;min-width:70px;">' +
            t.icono + '<br><span style="font-size:18px;font-weight:bold;color:#facc15;">' + t.count + '</span><br><span style="font-size:9px;color:#94a3b8;">' + t.nombre + '</span></div>';
    });
    histHtml += '</div>' +
        '<div id="trofeoDetail" style="display:none;background:#0f172a;border:1px solid #38bdf8;border-radius:6px;padding:8px;margin-top:4px;">' +
        '<div id="trofeoDetailContent"></div></div>' +
        '<div style="font-size:11px;color:#38bdf8;padding:2px 4px;border-bottom:1px solid #1e293b;margin:4px 0;"><i class="fa-solid fa-clock-rotate-left"></i> HISTÓRICO LIGA</div>';
    var historialEquipo = gameState.historialClub[nombreEquipo] || [];
    if (historialEquipo.length === 0) {
        histHtml += '<div style="color:#64748b;text-align:center;padding:8px;font-size:12px;">Sin temporadas registradas.</div>';
    } else {
        histHtml += '<div style="display:flex;gap:4px;padding:4px;flex-direction:column;">';
        var reversed = historialEquipo.slice().reverse();
        var totalEq = equiposDB.length || 20;
        reversed.forEach(function(h) {
            var col = h.posicion <= 4 ? '#49CB2B' : h.posicion <= 8 ? '#38bdf8' : h.posicion <= (totalEq - 3) ? '#bcbcbc' : '#ED3B46';
            histHtml += '<div style="display:flex;align-items:center;gap:6px;background:#0f172a;border:1px solid #334155;border-radius:4px;padding:4px 8px;">' +
                '<span style="font-size:10px;color:#64748b;min-width:65px;">' + h.temporada + '</span>' +
                '<span style="font-size:16px;color:' + col + ';font-weight:bold;min-width:30px;">' + h.posicion + 'º</span>' +
                '<span style="font-size:11px;color:#94a3b8;">' + h.division + '</span></div>';
        });
        histHtml += '</div>';
    }
    document.getElementById('rivalHistorialContent').innerHTML = histHtml;

    document.querySelectorAll('#modalRival .rival-tab').forEach(function(t){ t.style.display = 'none'; });
    document.getElementById('rival-general').style.display = 'flex';
    document.querySelectorAll('#modalRival > div > .btn-retro.btn-sm').forEach(function(b){ b.classList.remove('active'); });
    var firstTab = document.querySelector('#modalRival .btn-retro.btn-sm[onclick*="rival-general"]');
    if (firstTab) firstTab.classList.add('active');
    document.querySelectorAll('#rival-plantilla .btn-retro.btn-sm').forEach(function(b){ b.classList.remove('active'); });
    var firstSub = document.querySelector('#rival-plantilla .btn-retro.btn-sm[onclick*="rinfo"]');
    if (firstSub) firstSub.classList.add('active');

    document.getElementById('modalRival').classList.add('active');
}

function switchRivalTab(btn, tabId) {
    document.querySelectorAll('#modalRival .rival-tab').forEach(function(t){ t.style.display = 'none'; });
    document.getElementById(tabId).style.display = 'flex';
    document.querySelectorAll('#modalRival .btn-retro.btn-sm').forEach(function(b){ b.classList.remove('active'); });
    if (btn) btn.classList.add('active');
}

function switchRivalSubTab(btn, tabId) {
    document.querySelectorAll('#modalRival .rival-subtab').forEach(function(t){ t.style.display = 'none'; });
    document.getElementById(tabId).style.display = 'flex';
    document.querySelectorAll('#rival-plantilla .btn-retro.btn-sm').forEach(function(b){ b.classList.remove('active'); });
    if (btn) btn.classList.add('active');
}

function restaurarPanelClub() {
    document.getElementById('panelClubInfo').style.display = '';
    document.getElementById('matchRatingPanel').style.display = 'none';
    document.getElementById('btnGuardarPartida').style.display = '';
    document.getElementById('btnSalirMenu').style.display = '';
    var tEl = document.getElementById('gameTarget');
    if (tEl) tEl.innerText = gameState.objetivoTemporada || 'Evitar el descenso';
}

function cerrarModalRival() {
    document.getElementById('modalRival').classList.remove('active');
}

function calcularNotasPartido(xi, golesRecibidos, golesFavor) {
    if (!xi) return;
    golesRecibidos = golesRecibidos || 0;
    for (var i = 0; i < xi.length; i++) {
        var p = xi[i];
        if (!p.statsTemporada) p.statsTemporada = { partidos: 0, goles: 0, asistencias: 0, ta: 0, tr: 0, historialNotas: [], promedioNotas: 0 };
        var nota = 6.5;
        nota += (p.statsTemporada.goles || 0) * 1.2;
        nota += (p.statsTemporada.asistencias || 0) * 0.8;
        if (golesRecibidos === 0 && (getLinea(p.pos) === 'po' || getLinea(p.pos) === 'defensa')) nota += 0.8;
        nota -= (p.statsTemporada.ta || 0) * 0.5;
        nota -= (p.statsTemporada.tr || 0) * 2.0;
        nota = Math.min(10, Math.max(1, Math.round(nota * 10) / 10));
        if (!p.statsTemporada.historialNotas) p.statsTemporada.historialNotas = [];
        p.statsTemporada.historialNotas.push(nota);
        var sum = 0;
        for (var j = 0; j < p.statsTemporada.historialNotas.length; j++) sum += p.statsTemporada.historialNotas[j];
        p.statsTemporada.promedioNotas = Math.round((sum / p.statsTemporada.historialNotas.length) * 10) / 10;
    }
}

function obtenerTodosJugadoresLiga() {
    var todos = [];
    if (gameState.squad) {
        gameState.squad.forEach(function(p) { todos.push(p); });
    }
    var equipos = Database.getTeams(gameState.country, gameState.league);
    equipos.forEach(function(eq) {
        if (eq.name === gameState.team) return;
        var squad = _cachedSquads[eq.name];
        if (squad) {
            squad.forEach(function(p) { todos.push(p); });
        }
    });
    return todos;
}

function procesarEvolucionRendimiento() {
    var todos = obtenerTodosJugadoresLiga();
    var cambios = [];
    todos.forEach(function(p) {
        if (!p.statsTemporada) return;
        var avg = p.statsTemporada.promedioNotas || 0;
        var partidos = p.statsTemporada.partidos || 0;
        p._oldRating = p.rating || 75;
        p._oldVal = p.val || '0M€';

        var cambio = 0;

        if (avg >= 7.5 && partidos >= 3) {
            cambio = 2 + Math.floor(Math.random() * 2);
        } else if (avg >= 6.8 && partidos >= 3) {
            cambio = 1;
        } else if (avg >= 6.0 || partidos === 0) {
            cambio = 0;
        } else {
            cambio = -1;
        }

        if (p.age <= 21 && partidos >= 3) cambio += 1;
        if (p.age >= 33) cambio -= 1 + Math.floor(Math.random() * 2);

        var oldRating = p.rating || 75;
        var newRating = Math.min(99, Math.max(40, oldRating + cambio));
        p.rating = newRating;

        var valMult = 1.0;
        if (avg >= 7.5 && partidos >= 3) valMult = 1.30;
        else if (avg >= 6.8 && partidos >= 3) valMult = 1.10;
        else if (avg < 6.0 && partidos >= 3) valMult = 0.90;

        var valNum = p.rating * 0.12 * valMult;
        if (p.rating >= 85 && p.age < 28) {
            var minVal = 80 + (p.rating - 85) * 10;
            valNum = Math.max(valNum, minVal);
        }
        p.val = Math.max(0.1, valNum).toFixed(1) + 'M\u20ac';

        if (Math.abs(cambio) >= 2 && p.name) {
            cambios.push({ nombre: p.name, cambio: cambio });
        }
    });

    if (cambios.length > 0) {
        cambios.sort(function(a, b) { return b.cambio - a.cambio; });
        var suben = cambios.filter(function(c) { return c.cambio >= 2; }).slice(0, 3);
        var bajan = cambios.filter(function(c) { return c.cambio <= -2; }).reverse().slice(0, 3);
        var msg = '';
        if (suben.length > 0) {
            msg += '\u2B06 Mayor evoluci\u00f3n positiva:\n';
            suben.forEach(function(c) { msg += c.nombre + ' (+' + c.cambio + ')\n'; });
        }
        if (bajan.length > 0) {
            if (msg) msg += '\n';
            msg += '\u2B07 Mayor evoluci\u00f3n negativa:\n';
            bajan.forEach(function(c) { msg += c.nombre + ' (' + c.cambio + ')\n'; });
        }
        if (msg) {
            enviarMensaje('Departamento de An\u00e1lisis', '\ud83d\udcca Evoluci\u00f3n de rendimiento', msg);
        }
    }
}

function simularPlayoffAscenso(equipoA, equipoB) {
    var squadA = obtenerSquadEquipo(equipoA);
    var squadB = obtenerSquadEquipo(equipoB);
    var xiA = extraerXI(squadA, equipoA);
    var xiB = extraerXI(squadB, equipoB);
    var rL = _fixtureRatings[equipoA] || 75;
    var rV = _fixtureRatings[equipoB] || 75;
    var ida = simularPartidoCompleto(equipoA, equipoB, xiA, xiB, rL, rV);
    var vuelta = simularPartidoCompleto(equipoB, equipoA, xiB, xiA, rV, rL);
    var dgA = ida.golesL + vuelta.golesV;
    var dgB = ida.golesV + vuelta.golesL;
    var ganador = dgA > dgB ? equipoA : (dgB > dgA ? equipoB : (vuelta.golesL > vuelta.golesV ? equipoB : equipoA));
    return ganador;
}

function calcularRatingMedioLiga() {
    var equipos = Database.getTeams(gameState.country, gameState.league);
    var total = 0, count = 0;
    equipos.forEach(function(eq) {
        if (eq.rating) { total += eq.rating; count++; }
    });
    return count > 0 ? Math.round(total / count) : 75;
}

function actualizarObjetivosDirectiva() {
    var historial = gameState.historialClub[gameState.team] || [];
    var ultimo = historial.length > 0 ? historial[historial.length - 1] : null;
    var pos = ultimo ? ultimo.posicion : null;
    var equipos = Database.getTeams(gameState.country, gameState.league);
    var nEq = equipos.length || 20;
    var objetivo = 'Evitar el descenso';

    if (pos === null) {
        objetivo = 'Evitar el descenso';
    } else if (pos <= 4) {
        objetivo = 'Luchar por la Liga';
    } else if (pos <= 6) {
        objetivo = 'Clasificar a Europa';
    } else if (pos <= 12) {
        objetivo = 'Mitad de tabla / Top 10';
    } else if (pos <= nEq - 3) {
        objetivo = 'Evitar el descenso';
    } else {
        objetivo = 'Conseguir el ascenso inmediato';
    }

    if (ultimo) {
        var divisionActual = nEq === 20 ? 'Primera División' : nEq === 22 ? 'Segunda División' : gameState.league;
        if (ultimo.division !== divisionActual) {
            if (divisionActual === 'Primera División') objetivo = 'Evitar el descenso';
            else objetivo = 'Conseguir el ascenso inmediato';
        }
    }

    var miRating = calcularRatingEquipo(gameState.squad).glo;
    var mediaLiga = calcularRatingMedioLiga();
    if (miRating > mediaLiga + 8 && objetivo === 'Evitar el descenso') objetivo = 'Mitad de tabla / Top 10';
    if (miRating > mediaLiga + 12 && objetivo === 'Mitad de tabla / Top 10') objetivo = 'Clasificar a Europa';

    gameState.objetivoTemporada = objetivo;
}

function recalcularRatingClub() {
    if (!gameState.squad || gameState.squad.length === 0) return;
    var calc = calcularRatingEquipo(gameState.squad);
    var mediaEstrella = calc.glo || 50;

    var equipos = Database.getTeams(gameState.country, gameState.league);
    if (!equipos || equipos.length === 0) return;
    var numEq = equipos.length;
    var fixture = gameState.fixturesPorLiga[gameState.league] || gameState.fixture;
    var tabla = fixture ? calcularClasificacion(equipos, fixture, gameState.totalMatchdays || 38) : [];
    var pos = numEq;
    for (var i = 0; i < tabla.length; i++) {
        if (tabla[i].nombre === gameState.team) { pos = i + 1; break; }
    }

    var bonus = 0;
    if (pos === 1) bonus = 5;
    else if (pos <= 4) bonus = 3;
    else if (pos <= 7) bonus = 1;
    else if (pos <= 12) bonus = 0;
    else if (pos <= numEq - 3) bonus = -2;
    else bonus = -4;

    var nuevo = Math.round(gameState.rating * 0.35 + mediaEstrella * 0.45 + bonus * 2);
    gameState.rating = Math.min(99, Math.max(1, nuevo));
}

function calcularPremiosTemporada() {
    var todos = obtenerTodosJugadoresLiga();
    var maxGoles = 0, maxAsist = 0, mejorNota = 0;
    var pichichi = null, asistente = null, mvp = null;
    var mejorDefensa = null, menorGolesPJ = Infinity;
    var equiposGC = {};
    var equipos = Database.getTeams(gameState.country, gameState.league);
    var fixture = gameState.fixturesPorLiga[gameState.league] || gameState.fixture;
    if (fixture) {
        var tablaDef = calcularClasificacion(equipos, fixture, gameState.totalMatchdays || 38);
        tablaDef.forEach(function(t) {
            if (t.pj > 0) equiposGC[t.nombre] = t.gc / t.pj;
        });
    }
    var porteros = [];
    todos.forEach(function(p) {
        var st = p.statsTemporada || {};
        var partidos = st.partidos || 0;
        if ((st.goles || 0) > maxGoles) { maxGoles = st.goles; pichichi = { nombre: p.name, valor: st.goles, equipo: obtenerEquipoJugador(p) }; }
        if ((st.asistencias || 0) > maxAsist) { maxAsist = st.asistencias; asistente = { nombre: p.name, valor: st.asistencias, equipo: obtenerEquipoJugador(p) }; }
        if ((st.promedioNotas || 0) > mejorNota && partidos >= 10) { mejorNota = st.promedioNotas; mvp = { nombre: p.name, valor: st.promedioNotas, equipo: obtenerEquipoJugador(p) }; }
        if (getLinea(p.pos) === 'po' && partidos >= 5) {
            porteros.push({ nombre: p.name, equipo: obtenerEquipoJugador(p), pj: partidos });
        }
    });
    for (var eq in equiposGC) {
        if (equiposGC[eq] < menorGolesPJ) {
            menorGolesPJ = equiposGC[eq];
            mejorDefensa = eq;
        }
    }
    var zamora = null;
    if (mejorDefensa) {
        var eqSquad = obtenerSquadEquipo(mejorDefensa) || [];
        for (var pi = 0; pi < eqSquad.length; pi++) {
            if (getLinea(eqSquad[pi].pos) === 'po' && (eqSquad[pi].statsTemporada?.partidos || 0) >= 5) {
                zamora = { nombre: eqSquad[pi].name, valor: menorGolesPJ, equipo: mejorDefensa };
                break;
            }
        }
    }
    return { pichichi: pichichi, asistente: asistente, zamora: zamora, mvp: mvp };
}

function obtenerEquipoJugador(p) {
    if (!p || !p.equipoId) return '';
    return p.equipoId;
}

function evaluarSatisfaccionDirectiva(posicion, objetivo) {
    var numEq = (Database.getTeams(gameState.country, gameState.league) || []).length || 20;
    var cumplido = false;
    if (objetivo === 'Luchar por la Liga' && posicion <= 2) cumplido = true;
    else if (objetivo === 'Clasificar a Europa' && posicion <= 6) cumplido = true;
    else if (objetivo === 'Mitad de tabla / Top 10' && posicion <= numEq / 2) cumplido = true;
    else if (objetivo === 'Evitar el descenso' && posicion <= numEq - 3) cumplido = true;
    else if (objetivo === 'Conseguir el ascenso inmediato' && posicion <= 6) cumplido = true;

    var nivel, texto;
    if (cumplido) { nivel = 'satisfecha'; texto = '\ud83d\ude01 Satisfecha'; }
    else if (posicion <= numEq - 3) { nivel = 'aceptable'; texto = '\ud83d\ude10 Aceptable'; }
    else { nivel = 'insatisfecha'; texto = '\ud83d\ude21 Insatisfecha'; }
    return { nivel: nivel, texto: texto, cumplido: cumplido };
}

function calcularNuevoPresupuesto(posicion, numEquipos, titulos) {
    var eqData = null;
    var eqs = Database.getTeams(gameState.country, gameState.league);
    for (var ei = 0; ei < eqs.length; ei++) { if (eqs[ei].name === gameState.team) { eqData = eqs[ei]; break; } }
    var base = eqData ? parsearPresupuesto(eqData.budget) : 5.0;
    var bonusPos = 0;
    if (posicion === 1) bonusPos = 10.0;
    else if (posicion <= 4) bonusPos = 5.0;
    else if (posicion <= 7) bonusPos = 2.0;
    else if (posicion > numEquipos - 3) bonusPos = -base * 0.2;
    var bonusTitulos = (titulos || 0) * 3.0;
    return Math.max(1.0, base + bonusPos + bonusTitulos);
}

function procesarFinTemporada() {
    var equipos = Database.getTeams(gameState.country, gameState.league);
    var fixture = gameState.fixturesPorLiga[gameState.league] || gameState.fixture;
    var tabla = fixture ? calcularClasificacion(equipos, fixture, gameState.totalMatchdays || 38) : [];
    var miPos = 0;
    for (var i = 0; i < tabla.length; i++) { if (tabla[i].nombre === gameState.team) { miPos = i + 1; break; } }
    var numEq = equipos.length;

    var m = gameState.currentDate.match(/Temporada (\d{4}-\d{2})/);
    var seasonStr = m ? m[1] : '2026-27';
    document.getElementById('finTempSeason').innerText = 'Temporada ' + seasonStr;

    var palmares = gameState.palmaresClub[gameState.team] || [];
    var titulosEstaTemp = palmares.filter(function(t) {
        return t._nuevas && t._nuevas.indexOf(seasonStr) !== -1;
    });

    var premios = calcularPremiosTemporada();
    var satisfaccion = evaluarSatisfaccionDirectiva(miPos, gameState.objetivoTemporada);
    var nuevoPresupuesto = calcularNuevoPresupuesto(miPos, numEq, titulosEstaTemp.length);

    var html = '';

    // Títulos
    html += '<div style="margin-bottom:8px;">';
    html += '<div style="font-size:10px;color:#94a3b8;text-transform:uppercase;border-bottom:1px solid #1e293b;padding-bottom:3px;margin-bottom:4px;">TUS T\u00cdTULOS</div>';
    if (titulosEstaTemp.length === 0) {
        html += '<div style="font-size:11px;color:#64748b;padding:2px 0;">Ning\u00fan t\u00edtulo esta temporada.</div>';
    } else {
        titulosEstaTemp.forEach(function(t) {
            html += '<div style="font-size:11px;color:#e2e8f0;padding:1px 0;">' + t.icono + ' ' + t.nombre + '</div>';
        });
    }
    html += '</div>';

    // Cuadro de Honor
    html += '<div style="margin-bottom:8px;">';
    html += '<div style="font-size:10px;color:#94a3b8;text-transform:uppercase;border-bottom:1px solid #1e293b;padding-bottom:3px;margin-bottom:4px;">CUADRO DE HONOR</div>';
    if (premios.pichichi) html += '<div style="font-size:11px;color:#e2e8f0;padding:1px 0;"><i class="fa-solid fa-futbol" style="color:#eab308;"></i> Pichichi: ' + premios.pichichi.nombre + ' (' + premios.pichichi.valor + ' goles) - ' + premios.pichichi.equipo + '</div>';
    if (premios.asistente) html += '<div style="font-size:11px;color:#e2e8f0;padding:1px 0;"><i class="fa-solid fa-eye" style="color:#38bdf8;"></i> Asistente: ' + premios.asistente.nombre + ' (' + premios.asistente.valor + ' asistencias) - ' + premios.asistente.equipo + '</div>';
    if (premios.zamora) html += '<div style="font-size:11px;color:#e2e8f0;padding:1px 0;"><i class="fa-solid fa-shield-halved" style="color:#22c55e;"></i> Zamora: ' + premios.zamora.nombre + ' (' + premios.zamora.valor.toFixed(2) + ' g/p) - ' + premios.zamora.equipo + '</div>';
    if (premios.mvp) html += '<div style="font-size:11px;color:#e2e8f0;padding:1px 0;"><i class="fa-solid fa-star" style="color:#eab308;"></i> MVP: ' + premios.mvp.nombre + ' (' + premios.mvp.valor.toFixed(1) + ' nota) - ' + premios.mvp.equipo + '</div>';
    html += '</div>';

    // Directiva
    html += '<div style="margin-bottom:8px;">';
    html += '<div style="font-size:10px;color:#94a3b8;text-transform:uppercase;border-bottom:1px solid #1e293b;padding-bottom:3px;margin-bottom:4px;">DIRECTIVA</div>';
    html += '<div style="font-size:11px;color:#e2e8f0;padding:1px 0;">' + satisfaccion.texto + ' (Objetivo: ' + gameState.objetivoTemporada + ', Puesto: ' + miPos + '\u00ba)</div>';
    html += '</div>';

    // Presupuesto
    html += '<div style="margin-bottom:4px;">';
    html += '<div style="font-size:10px;color:#94a3b8;text-transform:uppercase;border-bottom:1px solid #1e293b;padding-bottom:3px;margin-bottom:4px;">NUEVO PRESUPUESTO</div>';
    html += '<div style="font-size:14px;color:#facc15;font-weight:bold;">' + formatearPresupuesto(nuevoPresupuesto) + '</div>';
    html += '</div>';

    document.getElementById('finTemporadaContent').innerHTML = html;
    document.getElementById('modalFinTemporada').classList.add('active');
    document.getElementById('modalFinTemporada').style.zIndex = '500';
}

function avanzarNuevaTemporada() {
    document.getElementById('modalFinTemporada').classList.remove('active');
    var equipos = Database.getTeams(gameState.country, gameState.league);
    var numEq = equipos.length;
    var fixture = gameState.fixturesPorLiga[gameState.league] || gameState.fixture;
    var tabla = fixture ? calcularClasificacion(equipos, fixture, gameState.totalMatchdays || 38) : [];
    var miPos = 0;
    for (var i = 0; i < tabla.length; i++) { if (tabla[i].nombre === gameState.team) { miPos = i + 1; break; } }
    var palmares = gameState.palmaresClub[gameState.team] || [];
    var m = gameState.currentDate.match(/Temporada (\d{4}-\d{2})/);
    var seasonStr = m ? m[1] : '2026-27';
    var titulosEstaTemp = palmares.filter(function(t) { return t._nuevas && t._nuevas.indexOf(seasonStr) !== -1; });
    var nuevoPresupuesto = calcularNuevoPresupuesto(miPos, numEq, titulosEstaTemp.length);
    gameState.budget = nuevoPresupuesto;

    // Evaluar descenso
    if (miPos > numEq - 3) {
        enviarMensaje('Directiva', '\u26a0\ufe0f Evaluaci\u00f3n de temporada',
            'El equipo ha descendido esta temporada. La directiva aplica un recorte presupuestario. El nuevo presupuesto es de ' + formatearPresupuesto(nuevoPresupuesto) + '.');
    }

    procesarRetornoCesiones();
    iniciarNuevaTemporada();

    restaurarPanelClub();
    document.getElementById('dashJornada').innerText = 'Jornada 1 - Nueva Temporada';
    document.getElementById('dashHomeTeam').innerText = gameState.team;
    document.getElementById('dashAwayTeam').innerText = gameState.opponent;
    document.getElementById('dashStadiumName').innerHTML = '<i class="fa-solid fa-location-dot"></i> ' + gameState.stadium;
    document.getElementById('gameBudget').innerText = formatearPresupuesto(gameState.budget);
    if (gameState.budget < 0) document.getElementById('gameBudget').style.color = '#ef4444';
    goToScreen('screen-game');
    var btnInicio = document.querySelector('.nav-tab-btn');
    if (btnInicio) switchGameTab(btnInicio, 'tab-inicio');
    renderInbox();
}

function cerrarModalFinTemporada() {
    document.getElementById('modalFinTemporada').classList.remove('active');
}

function gestionarEstaminaXI(xi) {
    var nuevos = xi.slice();
    for (var i = 0; i < nuevos.length; i++) {
        var p = nuevos[i];
        var stam = parseInt(p.stamina) || 100;
        if (stam < 80 && gameState.squad.length > 11) {
            var grupo = getGrupoPos(p.pos);
            var mejor = null;
            for (var j = 0; j < gameState.squad.length; j++) {
                var c = gameState.squad[j];
                if (nuevos.indexOf(c) === -1 && getGrupoPos(c.pos) === grupo && c.lesionSemanas === 0) {
                    var stamC = parseInt(c.stamina) || 100;
                    if (stamC >= 80 && (!mejor || c.rating > mejor.rating)) mejor = c;
                }
            }
            if (mejor) nuevos[i] = mejor;
        }
    }
    return nuevos;
}

function simularHastaFinDeTemporada() {
    var btn = document.getElementById('btnSimularTemporada');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> SIMULANDO...';

    function tick() {
        var modal = document.getElementById('modalFinTemporada');
        if (modal && modal.classList.contains('active')) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-bolt"></i> SIMULAR TEMPORADA';
            return;
        }

        // Detener antes de playoff o cuando queden ≤3 jornadas
        if (gameState.playoff && !gameState.playoff.completado) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-bolt"></i> SIMULAR TEMPORADA';
            showModal('SIMULACI\u00d3N', 'Simulaci\u00f3n detenida. Hay partidos de playoff pendientes. J\u00f3galos manualmente.');
            return;
        }
        if (gameState.matchday >= gameState.totalMatchdays - 3 && !gameState.playoff) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-bolt"></i> SIMULAR TEMPORADA';
            showModal('SIMULACI\u00d3N', 'Simulaci\u00f3n detenida. Quedan ' + (gameState.totalMatchdays - gameState.matchday + 1) + ' jornadas decisivas. J\u00f3galas manualmente.');
            return;
        }

        var jornadaIdx = (gameState.matchday || 1) - 1;
        var rival = null;

        if (gameState.calendario && gameState.calendario[jornadaIdx]) {
            var partidosSem = gameState.calendario[jornadaIdx].partidos;
            for (var pi = 0; pi < partidosSem.length; pi++) {
                if (partidosSem[pi].competicion === 'LaLiga') { rival = partidosSem[pi].rival; break; }
            }
            if (!rival && partidosSem.length > 0) rival = partidosSem[partidosSem.length - 1].rival;
        }

        if (rival) {
            gameState.opponent = rival;
            var formAct = getFormacionActiva();
            var xiBase = seleccionarXI(gameState.squad, formAct).slice(0, 11);
            var xi = gestionarEstaminaXI(xiBase);
            var rL = gameState.rating || 75;
            var rV = _fixtureRatings[rival] || 75;
            var squadV = obtenerSquadEquipo(rival);
            var xiV = squadV ? extraerXI(squadV, rival) : [];
            var res = simularPartidoCompleto(gameState.team, rival, xi, xiV, rL, rV);

            if (!gameState.fixture) gameState.fixture = [];
            if (!gameState.fixture[jornadaIdx]) gameState.fixture[jornadaIdx] = { partidos: [] };
            var encontrado = false;
            for (var fm = 0; fm < gameState.fixture[jornadaIdx].partidos.length; fm++) {
                var fp = gameState.fixture[jornadaIdx].partidos[fm];
                if (fp && (fp.local === gameState.team || fp.visitante === gameState.team)) {
                    if (fp.local === gameState.team) { fp.golesL = res.golesL; fp.golesV = res.golesV; }
                    else { fp.golesL = res.golesV; fp.golesV = res.golesL; }
                    fp.jugado = true;
                    encontrado = true;
                    break;
                }
            }
            if (!encontrado) {
                gameState.fixture[jornadaIdx].partidos.push({
                    local: gameState.team, visitante: rival,
                    golesL: res.golesL, golesV: res.golesV, jugado: true
                });
            }
            // Premio por resultado (victoria 150K, empate 50K)
            if (res.golesL !== undefined) {
                var gFav = res.golesL, gCon = res.golesV;
                var premio = 0;
                if (gFav > gCon) premio = 0.15;
                else if (gFav === gCon) premio = 0.05;
                if (premio > 0) {
                    gameState.budget += premio;
                    if (!gameState.historialTraspasos) gameState.historialTraspasos = [];
                    gameState.historialTraspasos.unshift({
                        fecha: 'J' + (gameState.matchday || 1),
                        tipo: 'sponsor',
                        jugador: 'Premio ' + (gFav > gCon ? 'victoria' : 'empate'),
                        desde: 'LaLiga',
                        para: gameState.team,
                        precio: premio
                    });
                }
            }
            // Desgaste, lesiones y moral para el equipo del usuario
            xi.forEach(function(pp) {
                var stPp = parseInt(pp.stamina) || 100;
                stPp = Math.max(10, stPp - Math.floor(Math.random() * 15 + 10));
                pp.stamina = stPp + '%';
                var probL = 0;
                if (stPp > 70) probL = 0.005;
                else if (stPp >= 40) probL = 0.025;
                else if (stPp >= 20) probL = 0.05;
                else probL = 0.08;
                if (Math.random() < probL) {
                    pp.lesionSemanas = 1 + Math.floor(Math.random() * 3);
                    pp.tipoLesion = 'Muscular';
                }
            });
            // Actualizar moral de toda la plantilla
            var xiIds = {};
            xi.forEach(function(pp) { xiIds[pp.id] = true; });
            gameState.squad.forEach(function(pp) {
                if (pp.lesionSemanas > 0) return;
                if (xiIds[pp.id]) {
                    pp.moral = Math.min(5, (pp.moral || 4) + 1);
                    pp.jornadasSinJugar = 0;
                } else {
                    pp.jornadasSinJugar = (pp.jornadasSinJugar || 0) + 1;
                    var umbralP = 5;
                    if (pp.rol === 'clave') umbralP = 1;
                    else if (pp.rol === 'primer') umbralP = 2;
                    else if (pp.rol === 'rotacion') umbralP = 3;
                    if (pp.jornadasSinJugar >= umbralP) pp.moral = Math.max(1, (pp.moral || 4) - 1);
                }
            });
        }

        nextMatch();

        if (modal && modal.classList.contains('active')) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-bolt"></i> SIMULAR TEMPORADA';
            return;
        }
        setTimeout(tick, 50);
    }

    tick();
}

function iniciarNuevaTemporada() {
    if (gameState.patrocinadorActual) {
        gameState.patrocinadorActual.temporadasRestantes--;
        if (gameState.patrocinadorActual.temporadasRestantes <= 0) {
            var nombreViejo = gameState.patrocinadorActual.nombre;
            gameState.patrocinadorActual = null;
            generarOfertasPatrocinio();
            enviarMensaje('Dirección Comercial', '\u26a0\ufe0f Contrato de patrocinio expirado',
                'El contrato con ' + nombreViejo + ' ha llegado a su fin. Hay nuevas ofertas de patrocinio disponibles.');
        }
    }
    if (gameState.fixture && gameState.fixture.length > 0) {
        var equipos = Database.getTeams(gameState.country, gameState.league);
        var tabla = calcularClasificacion(equipos, gameState.fixture, gameState.totalMatchdays || 38);
        var numEquipos = equipos.length;
        var division = numEquipos === 20 ? 'Primera División' : numEquipos === 22 ? 'Segunda División' : gameState.league;
        var m = gameState.currentDate.match(/Temporada (\d{4}-\d{2})/);
        var seasonStr = m ? m[1] : '2026-27';
        tabla.forEach(function(t, idx) {
            if (!gameState.historialClub[t.nombre]) gameState.historialClub[t.nombre] = [];
            gameState.historialClub[t.nombre].push({
                temporada: seasonStr,
                posicion: idx + 1,
                division: division
            });
        });
        if (tabla.length > 0 && tabla[0].nombre) {
            registrarTitulo(tabla[0].nombre, 'Primera División', seasonStr);
        }
        if (gameState.playoff) gameState.playoff = null;
        if (gameState.country === 'España' && tabla.length >= 4) {
            var campeonLiga = tabla[0].nombre;
            var subLiga = tabla[1].nombre;
            var campeonCopa = gameState.copa && gameState.copa.campeon ? gameState.copa.campeon : null;
            var subCopa = gameState.copa && gameState.copa.subcampeon ? gameState.copa.subcampeon : null;
            var clasificados = [];
            function addTeam(n) { if (n && clasificados.indexOf(n) === -1 && clasificados.length < 4) clasificados.push(n); }
            addTeam(campeonLiga);
            addTeam(campeonCopa);
            addTeam(subLiga);
            addTeam(subCopa);
            for (var ci = 2; ci < tabla.length && clasificados.length < 4; ci++) addTeam(tabla[ci].nombre);
            if (clasificados.length === 4) {
                gameState._supercopaClasificados = clasificados;
            }
        }
    }
    actualizarObjetivosDirectiva();
    procesarEvolucionRendimiento();

    var todos = obtenerTodosJugadoresLiga();
    todos.forEach(function(p) {
        p.age = (p.age || 20) + 1;
        p.statsTemporada = { partidos: 0, goles: 0, asistencias: 0, ta: 0, tr: 0, historialNotas: [], promedioNotas: 0 };
        p.pj = 0; p.gol = 0; p.asi = 0; p.ta = 0; p.tr = 0;
        p.lesionSemanas = 0; p.tipoLesion = ''; p.sancionSemanas = 0; p.tarjetasAmarillasAcum = 0; p.jornadasSinJugar = 0; p._solicitudEnviada = false;
        p.stamina = '100%';
    });

    gameState.calendarioGenerado = false;
    gameState.fixtureGenerado = false;
    gameState.matchday = 1;
    var oldY = gameState.currentDate || 'Temporada 2026-27 - Jornada 1';
    var m1 = oldY.match(/\\d{4}/);
    var m2 = oldY.match(/\\d{2}$/);
    var y1 = m1 ? parseInt(m1[0]) : 2026;
    var y2 = m2 ? parseInt(m2[0]) : 27;
    gameState.currentDate = 'Temporada ' + (y1 + 1) + '-' + (String(y2 + 1).padStart(2, '0')) + ' - Jornada 1';
    _tacticInitDone = false;

    enviarMensaje('LaLiga', '📅 Nueva temporada',
        'Comienza una nueva temporada. Todos los equipos empiezan desde cero. ¡Suerte!');
    enviarMensaje('Directiva', '🎯 Nuevo objetivo de temporada',
        'Tras analizar los resultados, la Directiva ha fijado el siguiente objetivo: ' + gameState.objetivoTemporada + '.');
    enviarMensaje('Cuerpo Técnico', '\ud83d\udccb Revisión de roles',
        'Los roles de la plantilla se mantienen de la temporada anterior. Revisa y ajústalos en el modal de cada jugador si lo necesitas.');
    renderInbox();
    recalcularRatingClub();
}

function renderMatchNotas(xi, eventos, gc, partidoFinalizado) {
    var div = document.getElementById('matchNotasLista');
    if (!div || !xi) return;
    gc = gc || 0;

    function contarEventosJugador(pid) {
        var g = 0, a = 0;
        eventos.forEach(function(ev) {
            if (ev.goleador && ev.goleador.id === pid) g++;
            if (ev.asistente && ev.asistente.id === pid) a++;
        });
        return { gol: g, asi: a };
    }

    function esSuplenteEntrado(pid) {
        if (!matchState || !matchState.sustitucionesRealizadas) return false;
        for (var i = 0; i < matchState.sustitucionesRealizadas.length; i++) {
            if (matchState.sustitucionesRealizadas[i].entra === pid) return true;
        }
        return false;
    }

    var html = '';
    var formPartido = (matchState && matchState.formacionUsada) || getFormacionActiva();
    var slotLabels = getSlotLabels(formPartido);
    xi.forEach(function(p, idx) {
        var cnt = contarEventosJugador(p.id);
        var forma = (matchState && matchState.formaInicial) ? (matchState.formaInicial[p.id] || 0) : 0;
        var nota = 6.5 + forma;
        nota += cnt.gol * 1.3;
        nota += cnt.asi * 0.8;
        if (gc > 0 && (getLinea(p.pos) === 'po' || getLinea(p.pos) === 'defensa')) nota -= gc * 0.4;
        if (partidoFinalizado && gc === 0 && (getLinea(p.pos) === 'po' || getLinea(p.pos) === 'defensa')) nota += 0.8;
        if (partidoFinalizado) {
            var stamP = parseInt(p.stamina) || 100;
            if (stamP < 20) nota -= 0.3;
        }
        nota = Math.min(10, Math.max(1, Math.round(nota * 10) / 10));

        var color = nota >= 7.5 ? '#4CAF50' : nota >= 6.0 ? '#FFEB3B' : '#F44336';

        var badges = '';
        if (cnt.gol > 0) badges += '\u26BD ';
        if (cnt.asi > 0) badges += '\uD83C\uDD70 ';
        if (esSuplenteEntrado(p.id)) badges += '<i class="fa-solid fa-arrow-up" style="color:#22c55e;font-size:11px;"></i> ';

        var stam = parseInt(p.stamina) || 100;
        var stamColor = stam > 60 ? '#22c55e' : stam > 30 ? '#eab308' : '#ef4444';

        var nombreMostrar = p.name;
        var ultEsp = nombreMostrar.lastIndexOf(' ');
        if (ultEsp > 0) {
            var inicial = nombreMostrar.charAt(0);
            nombreMostrar = inicial + '. ' + nombreMostrar.substring(ultEsp + 1);
        }

        var posDisplay = (slotLabels && slotLabels[idx]) ? slotLabels[idx] : p.pos;

        html += '<div class="match-nota-row">' +
            '<span class="pos-badge" style="background:' + getColorLinea(posDisplay) + ';color:#fff;font-size:9px;width:24px;padding:1px 0;">' + posDisplay + '</span>' +
            '<span class="mn-nombre" title="' + p.name + '">' + nombreMostrar + '</span>' +
            (badges ? '<span class="mn-badges">' + badges + '</span>' : '<span class="mn-badges"></span>') +
            '<span class="mn-nota" style="color:' + color + ';">' + nota.toFixed(1) + '</span>' +
            '<span style="font-size:10px;color:' + stamColor + ';min-width:36px;text-align:right;">⚡' + stam + '</span>' +
            '</div>';
    });
    div.innerHTML = html;
}

function getEstadoIcono(p) {
    var r = '';
    if (p && p.lesionSemanas > 0) r += '<span style="font-size:11px;margin-left:2px;" title="Lesionado ' + p.lesionSemanas + ' sem">🩹' + p.lesionSemanas + '</span>';
    if (p && p.sancionSemanas > 0) r += '<span style="font-size:11px;margin-left:2px;" title="Sancionado ' + p.sancionSemanas + ' part">🟥' + p.sancionSemanas + '</span>';
    return r;
}

function getMoralIcon(p) {
    var m = (p && p.moral) || 4;
    var icons = { 5: 'fa-face-grin-stars', 4: 'fa-face-smile', 3: 'fa-face-meh', 2: 'fa-face-frown', 1: 'fa-face-angry' };
    var colors = { 5: '#22c55e', 4: '#84cc16', 3: '#eab308', 2: '#f97316', 1: '#ef4444' };
    return '<i class="fa-regular ' + (icons[m] || 'fa-face-smile') + '" style="color:' + (colors[m] || '#84cc16') + ';font-size:14px;" title="Moral: ' + m + '/5"></i>';
}

function getRolTexto(rol) {
    var textos = { clave: 'Jugador Clave', primer: 'Primer Equipo', rotacion: 'Rotaci\u00f3n', suplente: 'Suplente', promesa: 'Joven Promesa' };
    return textos[rol] || 'Rotaci\u00f3n';
}

function getRolAbreviado(rol) {
    var map = { clave: 'CLA', primer: 'PRI', rotacion: 'ROT', suplente: 'SUP', promesa: 'JOV' };
    return map[rol] || 'ROT';
}

function getRolIcon(rol) {
    var icons = { clave: 'fa-crown', primer: 'fa-shirt', rotacion: 'fa-arrows-rotate', suplente: 'fa-chair', promesa: 'fa-seedling' };
    var colors = { clave: '#eab308', primer: '#38bdf8', rotacion: '#a855f7', suplente: '#94a3b8', promesa: '#22c55e' };
    return '<i class="fa-solid ' + (icons[rol] || 'fa-arrows-rotate') + '" style="color:' + (colors[rol] || '#a855f7') + ';font-size:12px;" title="' + getRolTexto(rol) + '"></i>';
}

function asignarRolesIniciales() {
    if (!gameState.squad || gameState.squad.length === 0) return;
    gameState.squad.forEach(function(p) {
        if (p.moral === undefined) p.moral = 4;
        if (p.jornadasSinJugar === undefined) p.jornadasSinJugar = 0;
        p.rol = 'suplente';
    });
    var formation = getFormacionActiva();
    var xiIds = {};
    var xi = seleccionarXI(gameState.squad, formation).slice(0, 11);
    xi.forEach(function(p) { xiIds[p.id] = true; });

    var usadosXI = [];
    xi.forEach(function(p) {
        var encontrado = null;
        for (var i = 0; i < gameState.squad.length; i++) {
            if (gameState.squad[i].id === p.id) { encontrado = gameState.squad[i]; break; }
        }
        if (encontrado) {
            encontrado.rol = 'primer';
            usadosXI.push(encontrado);
        }
    });

    usadosXI.sort(function(a, b) { return b.rating - a.rating; });
    for (var i = 0; i < Math.min(2, usadosXI.length); i++) {
        usadosXI[i].rol = 'clave';
    }

    var grupos = { PO: [], DEF: [], MC: [], ATA: [] };
    gameState.squad.forEach(function(p) {
        if (xiIds[p.id]) return;
        var g = getGrupoPos(p.pos);
        if (grupos[g]) grupos[g].push(p);
    });
    for (var g in grupos) {
        grupos[g].sort(function(a, b) { return b.rating - a.rating; });
        grupos[g].forEach(function(p, idx) {
            if (idx === 0) p.rol = 'rotacion';
            else if (p.age <= 21 && p.rating < 65) p.rol = 'promesa';
            else p.rol = 'suplente';
        });
    }
}

function actualizarMoralPostPartido() {
    if (!matchState || !matchState.jugadoresQueJugaron) return;
    var idsJugaron = {};
    matchState.jugadoresQueJugaron.forEach(function(id) { idsJugaron[id] = true; });
    gameState.squad.forEach(function(p) {
        if (p.lesionSemanas > 0) return;
        if (idsJugaron[p.id]) {
            p.moral = Math.min(5, (p.moral || 4) + 1);
            p.jornadasSinJugar = 0;
        } else {
            var stam = parseInt(p.stamina) || 100;
            if (stam < 80) { p.jornadasSinJugar = 0; return; }
            p.jornadasSinJugar = (p.jornadasSinJugar || 0) + 1;
            var umbral = 5;
            if (p.rol === 'clave') umbral = 1;
            else if (p.rol === 'primer') umbral = 2;
            else if (p.rol === 'rotacion') umbral = 3;
            else if (p.rol === 'estrella') umbral = 2;
            if (p.jornadasSinJugar >= umbral) {
                p.moral = Math.max(1, (p.moral || 4) - 1);
            }
        }
    });
    gameState.squad.forEach(function(p) {
        if (p.moral === 1 && (p.jornadasSinJugar || 0) >= 3 && !p._solicitudEnviada) {
            p._solicitudEnviada = true;
            p.enTransferibles = true;
            enviarMensaje('Agente de ' + p.name, '\ud83d\udcc4 Solicitud de traspaso',
                p.name + ' ha solicitado formalmente ser puesto en la lista de transferibles por falta de minutos.');
            renderInbox();
        }
    });
}

function calcularPrecio(rating) {
    var base = Math.pow(rating / 10, 3) * 0.1;
    return Math.round(Math.max(0.5, base) * 100) / 100;
}

function getPrimerDorsalLibre() {
    var usados = {};
    if (gameState.squad) { gameState.squad.forEach(function(p){ if (p.dorsal) usados[p.dorsal] = true;         });
        if (tabla.length > 0 && tabla[0].nombre) {
            registrarTitulo(tabla[0].nombre, 'Primera División', seasonStr);
        }
    }
    for (var d = 1; d <= 99; d++) { if (!usados[d]) return d; }
    return 99;
}

function renderHistorial() {
    var lista = document.getElementById('historialLista');
    if (!lista) return;
    var h = gameState.historialTraspasos || [];

    var filtrados = h;
    if (_historialFiltro === 'miliga') {
        var equiposLiga = Database.getTeams(gameState.country, gameState.league);
        var nombresLiga = {};
        equiposLiga.forEach(function(e) { nombresLiga[e.name] = true; });
        filtrados = h.filter(function(t) {
            return nombresLiga[t.desde] || nombresLiga[t.para];
        });
    }

    if (filtrados.length === 0) {
        lista.innerHTML = '<div style="color:#64748b;text-align:center;padding:20px;font-size:12px;">No hay movimientos en el mercado.</div>';
        return;
    }

    var html = '<div style="font-size:11px;color:#38bdf8;padding:4px 2px;border-bottom:1px solid #1e293b;">HISTORIAL (' + filtrados.length + ')</div>';
    filtrados.forEach(function(t) {
        var icono = t.tipo === 'compra' ? '<i class="fa-solid fa-cart-shopping"></i>' : t.tipo === 'venta' ? '<i class="fa-solid fa-coins"></i>' : '<i class="fa-solid fa-arrows-rotate"></i>';
        var color = t.tipo === 'compra' ? '#22c55e' : t.tipo === 'venta' ? '#eab308' : '#38bdf8';
        html += '<div class="tactic-list-item" style="cursor:default;flex-wrap:wrap;padding:4px 6px;">' +
            '<div style="display:flex;align-items:center;gap:4px;width:100%;">' +
            '<span style="font-size:10px;color:#64748b;min-width:36px;">' + t.fecha + '</span>' +
            '<span style="font-size:13px;">' + icono + '</span>' +
            '<span style="font-size:12px;font-weight:bold;flex:1;">' + t.jugador + '</span>' +
            (t.pos ? '<span class="pos-badge" style="font-size:9px;padding:1px 4px;display:inline-block;">' + t.pos + '</span> ' : '') +
            (t.rating ? '<span style="font-size:10px;color:#6ee7b7;min-width:18px;text-align:center;">' + t.rating + '</span>' : '') +
            '</div>' +
            '<div style="font-size:10px;color:#94a3b8;padding:1px 0 0 50px;width:100%;">' +
            t.desde + ' <span style="color:' + color + ';">→</span> ' + t.para +
            ' · <span style="color:#eab308;">' + t.precio.toFixed(1) + 'M€</span></div>' +
            '</div>';
    });
    lista.innerHTML = html;
}

function normalizeStr(s) {
    return (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}
var _filtrosMercado = { rating: '', edad: '', nacionalidad: '', posicion: '' };

function getOpcionesFiltro(tipo) {
    if (tipo === 'rating') {
        return [
            { value: '', label: 'Todas' },
            { value: '90-99', label: '90 - 99' },
            { value: '80-89', label: '80 - 89' },
            { value: '70-79', label: '70 - 79' },
            { value: '60-69', label: '60 - 69' },
            { value: '50-59', label: '50 - 59' },
            { value: '40-49', label: '40 - 49' },
            { value: '0-39', label: '0 - 39' }
        ];
    } else if (tipo === 'edad') {
        return [
            { value: '', label: 'Cualquier edad' },
            { value: '-20', label: '< 21 años — Promesas' },
            { value: '21-25', label: '21 - 25 años — Jóvenes' },
            { value: '26-30', label: '26 - 30 años — Plena Madurez' },
            { value: '31-', label: '> 30 años — Veteranos' }
        ];
    } else if (tipo === 'nacionalidad') {
        var opts = [{ value: '', label: '🌍 Cualquier país', html: '🌍 Cualquier país' }];
        var nats = {};
        var equipos = Database.getTeams(gameState.country, gameState.league);
        equipos.forEach(function(eq) {
            var squad = _cachedSquads[eq.name] || eq.squad || [];
            squad.forEach(function(j) { if (j.nationality) nats[j.nationality] = true; });
        });
        Object.keys(nats).sort(function(a, b) {
            var na = _nombresPaises[a] || a.toUpperCase();
            var nb = _nombresPaises[b] || b.toUpperCase();
            return na.localeCompare(nb);
        }).forEach(function(code) {
            var name = _nombresPaises[code] || code.toUpperCase();
            opts.push({
                value: code,
                label: name,
                html: flagEmoji(code) + ' <span style="font-size:13px;">' + name + '</span>'
            });
        });
        return opts;
    } else if (tipo === 'posicion') {
        return [
            { value: '', label: 'Todas' },
            { value: 'PO', label: 'PO' },
            { value: 'DFC', label: 'DFC' },
            { value: 'LD', label: 'LD' },
            { value: 'LI', label: 'LI' },
            { value: 'CAI', label: 'CAI' },
            { value: 'CAD', label: 'CAD' },
            { value: 'MCD', label: 'MCD' },
            { value: 'MC', label: 'MC' },
            { value: 'MCO', label: 'MCO' },
            { value: 'MI', label: 'MI' },
            { value: 'MD', label: 'MD' },
            { value: 'EI', label: 'EI' },
            { value: 'ED', label: 'ED' },
            { value: 'DC', label: 'DC' }
        ];
    }
    return [];
}

function abrirFiltroDropdown(e, tipo) {
    e.stopPropagation();
    var dd = document.getElementById('filterDropdown');
    var list = document.getElementById('filterDropdownList');
    if (!dd || !list) return;

    if (dd.style.display === 'block' && dd._tipo === tipo) {
        cerrarFiltroDropdown();
        return;
    }

    var btn = e.currentTarget;
    var tab = document.getElementById('tab-mercado');
    var tabRect = tab.getBoundingClientRect();
    var btnRect = btn.getBoundingClientRect();

    dd.style.left = (btnRect.left - tabRect.left) + 'px';
    dd.style.top = (btnRect.bottom - tabRect.top + 2) + 'px';
    dd.style.width = btnRect.width + 'px';
    dd._tipo = tipo;

    list.innerHTML = '';
    var opciones = getOpcionesFiltro(tipo);
    var currentVal = _filtrosMercado[tipo] || '';

    opciones.forEach(function(o) {
        var item = document.createElement('div');
        item.className = 'tactic-dropdown-item';
        if (o.value === currentVal) item.classList.add('selected');
        if (o.html) item.innerHTML = o.html;
        else item.textContent = o.label;
        if (o.color) item.style.color = o.color;
        item.dataset.value = o.value;
        item.dataset.label = o.html || o.label;
        item.onclick = function(ev) { ev.stopPropagation(); seleccionarFiltroOpcion(tipo, this.dataset.value, this.dataset.label); };
        list.appendChild(item);
    });

    dd.style.display = 'block';
    document.querySelectorAll('.filter-btn.active').forEach(function(b) { b.classList.remove('active'); });
    btn.classList.add('active');
}

function cerrarFiltroDropdown() {
    var dd = document.getElementById('filterDropdown');
    if (dd) dd.style.display = 'none';
    document.querySelectorAll('.filter-btn.active').forEach(function(b) { b.classList.remove('active'); });
}

function seleccionarFiltroOpcion(tipo, valor, etiqueta) {
    _filtrosMercado[tipo] = valor;
    var displayMap = { rating: 'filterRatingDisplay', edad: 'filterEdadDisplay', nacionalidad: 'filterNacDisplay', posicion: 'filterPosDisplay' };
    var el = document.getElementById(displayMap[tipo]);
    if (el) el.textContent = etiqueta || valor;
    cerrarFiltroDropdown();
    renderMercado();
}

var _mercadoLimite = 20;

function renderMercado() {
    var presEl = document.getElementById('mercadoPresupuesto');
    if (presEl) presEl.innerText = formatearPresupuesto(gameState.budget);

    var lista = document.getElementById('mercadoLista');
    if (!lista || !gameState.squad) return;

    var pais = gameState.country;
    var equipos = Database.getTeams(pais, gameState.league);
    var todosJugadores = [];

    equipos.forEach(function(eq) {
        if (eq.name === gameState.team) return;
        var squad = _cachedSquads[eq.name];
        if (!squad || squad.length === 0) {
            if (eq.squad && eq.squad.length > 0) {
                squad = eq.squad;
            } else {
                squad = generarPlantillaSimulada(eq.name, pais, eq.rating || 75);
            }
            _cachedSquads[eq.name] = squad;
        }
        squad.forEach(function(j) {
            todosJugadores.push({ jugador: j, equipo: eq.name });
        });
    });

    todosJugadores.sort(function(a, b) { return b.jugador.rating - a.jugador.rating; });

    var textoBusqueda = document.getElementById('mercadoBuscar') ? document.getElementById('mercadoBuscar').value : '';
    var filtroPos = _filtrosMercado.posicion;
    var filtroRating = _filtrosMercado.rating;
    var filtroEdad = _filtrosMercado.edad;
    var filtroNac = _filtrosMercado.nacionalidad;

    var filtrados = [];
    todosJugadores.forEach(function(item) {
        var j = item.jugador;
        if (filtroPos && j.pos !== filtroPos) return;
        if (filtroRating) {
            var parts = filtroRating.split('-');
            if (parts.length === 2) {
                var rMin = parseInt(parts[0]);
                var rMax = parseInt(parts[1]);
                if (j.rating < rMin || j.rating > rMax) return;
            }
        }
        if (filtroEdad) {
            if (filtroEdad === '-20' && j.age >= 21) return;
            else if (filtroEdad === '21-25' && (j.age < 21 || j.age > 25)) return;
            else if (filtroEdad === '26-30' && (j.age < 26 || j.age > 30)) return;
            else if (filtroEdad === '31-' && j.age <= 30) return;
        }
        if (filtroNac && j.nationality !== filtroNac) return;
        if (textoBusqueda && normalizeStr(j.name).indexOf(normalizeStr(textoBusqueda)) === -1) return;
        filtrados.push(item);
    });

    if (filtrados.length === 0) {
        lista.innerHTML = '<div style="color:#64748b;text-align:center;padding:20px;font-size:12px;">No se encontraron jugadores con esos filtros.</div>';
        return;
    }

    var mostrar = filtrados.slice(0, _mercadoLimite);
    var html = '';
    mostrar.forEach(function(item, idx) {
        var j = item.jugador;
        var precio = calcularPrecioOferta(j, false);
        var puedeComprar = gameState.budget >= precio;
        var color = getColorLinea(j.pos);
        html += '<div class="market-row" data-midx="' + idx + '">' +
            '<span class="pos-badge" style="background:' + color + ';color:#fff;font-size:8px;width:20px;padding:1px 0;text-align:center;">' + j.pos + '</span>' +
            '<span class="market-name">' + j.name + getEstadoIcono(j) + '</span>' +
            '<span style="font-size:14px;text-align:center;">' + flagEmoji(j.nationality) + '</span>' +
            '<span style="text-align:center;color:#94a3b8;">' + j.age + '</span>' +
            '<span class="market-val" style="text-align:center;">' + j.rating + '</span>' +
            '<span class="market-val" style="text-align:right;">' + j.val + '</span>' +
            '<span class="market-price" style="text-align:right;">' + precio.toFixed(1) + 'M\u20ac</span>' +
            (puedeComprar
                ? '<button class="btn-retro green btn-sm" onclick="event.stopPropagation();comprarJugador(' + j.id + ',\'' + item.equipo + '\',' + precio + ')" style="font-size:7px;padding:2px 4px;"><i class="fa-solid fa-coins"></i> Fichar</button>'
                : '<span style="color:#ef4444;font-size:8px;text-align:center;" title="Presupuesto insuficiente"><i class="fa-solid fa-ban"></i> Sin fondo</span>') +
            '</div>';
    });
    if (filtrados.length > _mercadoLimite) {
        html += '<div class="market-row" style="cursor:pointer;justify-content:center;padding:6px;" onclick="_mercadoLimite+=20;renderMercado();grid-template-columns:1fr;">' +
            '<span style="font-size:11px;color:#38bdf8;grid-column:1/-1;text-align:center;">\ud83d\udcc4 Ver m\u00e1s (' + (filtrados.length - _mercadoLimite) + ' restantes)</span></div>';
    }
    lista.innerHTML = html;

    lista.querySelectorAll('.market-row[data-midx]').forEach(function(el) {
        el.onclick = function() {
            var idx = parseInt(this.dataset.midx);
            if (idx >= 0 && idx < mostrar.length) {
                showPlayerDetail(mostrar[idx].jugador, false);
            }
        };
    });
}

function renderMercadoTransferibles() {
    var lista = document.getElementById('mercadoTransferiblesLista');
    if (!lista) return;
    var jugadores = (gameState.squad || []).filter(function(p) { return p.enTransferibles; });
    if (jugadores.length === 0) {
        lista.innerHTML = '<div style="color:#64748b;text-align:center;padding:20px;font-size:12px;">No hay jugadores en la lista de transferibles. Márcalos desde su ficha.</div>';
        return;
    }
    var html = '';
    jugadores.forEach(function(j) {
        var precio = calcularPrecioOferta(j, true);
        var color = getColorLinea(j.pos);
        html += '<div class="market-row" style="cursor:default;">' +
            '<span class="pos-badge" style="background:' + color + ';color:#fff;font-size:8px;width:20px;padding:1px 0;text-align:center;">' + j.pos + '</span>' +
            '<span class="market-name">' + j.name + '</span>' +
            '<span style="text-align:center;color:#94a3b8;">' + j.age + '</span>' +
            '<span class="market-val" style="text-align:center;">' + j.rating + '</span>' +
            '<span class="market-val" style="text-align:right;">' + j.val + '</span>' +
            '<span class="market-price" style="text-align:right;">' + precio.toFixed(1) + 'M\u20ac</span>' +
            '<span style="color:#22c55e;font-size:9px;text-align:center;font-weight:bold;">\u2713 En venta</span></div>';
    });
    lista.innerHTML = html;
}

function renderMercadoCedibles() {
    var lista = document.getElementById('mercadoCediblesLista');
    if (!lista) return;
    var jugadores = (gameState.squad || []).filter(function(p) { return p.enCedibles; });
    if (jugadores.length === 0) {
        lista.innerHTML = '<div style="color:#64748b;text-align:center;padding:20px;font-size:12px;">No hay jugadores en la lista de cedibles. Márcalos desde su ficha.</div>';
        return;
    }
    var html = '';
    jugadores.forEach(function(j) {
        var color = getColorLinea(j.pos);
        html += '<div class="market-row" style="cursor:default;">' +
            '<span class="pos-badge" style="background:' + color + ';color:#fff;font-size:8px;width:20px;padding:1px 0;text-align:center;">' + j.pos + '</span>' +
            '<span class="market-name">' + j.name + '</span>' +
            '<span style="text-align:center;color:#94a3b8;">' + j.age + '</span>' +
            '<span class="market-val" style="text-align:center;">' + j.rating + '</span>' +
            '<span class="market-val" style="text-align:right;">' + j.val + '</span>' +
            '<span style="color:#38bdf8;font-size:9px;text-align:center;font-weight:bold;">\ud83d\udd04 Cedible</span></div>';
    });
    lista.innerHTML = html;
}

function comprarJugador(jugadorId, equipoOrigen, precio) {
    ficharJugador(jugadorId, equipoOrigen, precio);
}

function ficharJugador(jugadorId, equipoOrigen, precio) {
    var squadOrigen = _cachedSquads[equipoOrigen];
    if (!squadOrigen) return;
    var idx = -1, jugador = null;
    for (var i = 0; i < squadOrigen.length; i++) {
        if (squadOrigen[i].id === jugadorId) { jugador = squadOrigen[i]; idx = i; break; }
    }
    if (!jugador) return;
    if (gameState.budget < 0) { showModal('PRESUPUESTO', 'El club est\u00e1 en n\u00fameros rojos. No puedes fichar hasta saldar la deuda.'); return; }
    if (gameState.budget < precio) { showModal('PRESUPUESTO', 'No tienes fondos suficientes para fichar a ' + jugador.name + '.'); return; }

    gameState.budget -= precio;
    var nuevoId = 1000 + Math.floor(Math.random() * 9000);
    var dorsal = getPrimerDorsalLibre();
    var nuevoJugador = JSON.parse(JSON.stringify(jugador));
    nuevoJugador.id = nuevoId;
    nuevoJugador.dorsal = dorsal;
    nuevoJugador.grupo = null;
    if (!nuevoJugador.statsTemporada) nuevoJugador.statsTemporada = { partidos: 0, goles: 0, asistencias: 0, ta: 0, tr: 0 };
    nuevoJugador.golesHistoricos = 0;
    nuevoJugador.partidosHistoricos = 0;
    nuevoJugador.moral = 4;
    nuevoJugador.rol = 'rotacion';
    nuevoJugador.jornadasSinJugar = 0;
    nuevoJugador.equipoId = gameState.team;
    gameState.squad.push(nuevoJugador);
    squadOrigen.splice(idx, 1);
    _presupuestosCPU[equipoOrigen] = (_presupuestosCPU[equipoOrigen] || 0) + precio;

    if (!gameState.historialTraspasos) gameState.historialTraspasos = [];
    gameState.historialTraspasos.unshift({
        fecha: 'J' + (gameState.matchday || 1),
        tipo: 'compra',
        jugador: jugador.name,
        desde: equipoOrigen,
        para: gameState.team,
        precio: precio,
        pos: jugador.pos,
        rating: jugador.rating,
        liga: gameState.league
    });

    enviarMensaje('Secretaría Técnica', '✍️ Fichaje completado',
        'Se ha cerrado el fichaje de ' + jugador.name + ' procedente del ' + equipoOrigen + ' por ' + precio.toFixed(1) + 'M€. Dorsal #' + dorsal + '.');
    _mercadoLimite = 20;
    renderMercado();
    document.getElementById('gameBudget').innerText = formatearPresupuesto(gameState.budget);
    showModal('FICHAJE', jugador.name + ' se une al ' + gameState.team + ' con el dorsal #' + dorsal + '. Coste: ' + precio.toFixed(1) + 'M€.');
    renderSquadTable();
    renderSquadStats();
    if (precio > (gameState.records.fichajeMasCaro.precio || 0)) {
        gameState.records.fichajeMasCaro = { nombre: jugador.name, precio: precio, equipoOrigen: equipoOrigen };
    }
}

function limpiarAccionesMensajes(jugadorId) {
    var idStr = String(jugadorId);
    for (var i = 0; i < gameState.mensajes.length; i++) {
        var msg = gameState.mensajes[i];
        if (msg.acciones) {
            for (var a = 0; a < msg.acciones.length; a++) {
                if (msg.acciones[a].fn.indexOf(idStr) !== -1) {
                    msg.acciones = null;
                    break;
                }
            }
        }
    }
}

function aceptarOferta(jugadorId, precio, comprador) {
    for (var i = 0; i < gameState.squad.length; i++) {
        if (gameState.squad[i].id === jugadorId) {
            var p = gameState.squad[i];
            var jugadorName = p.name;
            var jugadorPos = p.pos;
            var jugadorRating = p.rating;
            gameState.budget += precio;
            gameState.squad.splice(i, 1);

            if (comprador) {
                _presupuestosCPU[comprador] = (_presupuestosCPU[comprador] || 0) - precio;
                var squadDest = obtenerSquadEquipo(comprador);
                if (squadDest) {
                    var clone = JSON.parse(JSON.stringify(p));
                    clone.id = 10000 + Math.floor(Math.random() * 90000);
                    clone.grupo = null;
                    squadDest.push(clone);
                    _cachedSquads[comprador] = squadDest;
                }
            }

            if (!gameState.historialTraspasos) gameState.historialTraspasos = [];
            gameState.historialTraspasos.unshift({
                fecha: 'J' + (gameState.matchday || 1),
                tipo: 'venta',
                jugador: jugadorName,
                desde: gameState.team,
                para: comprador || 'CPU',
                precio: precio,
                pos: jugadorPos,
                rating: jugadorRating,
                liga: gameState.league
            });
            limpiarAccionesMensajes(jugadorId);
            enviarMensaje('Dirección Deportiva', '💰 Traspaso cerrado',
                'Se ha aceptado la oferta por ' + jugadorName + '. ' + formatearPresupuesto(precio) + ' ingresados en la cuenta del club.');
            renderInbox();
            renderInboxView();
            if (gameState.mensajes.length > 0) seleccionarMensaje(gameState.mensajes[0].id);
            document.getElementById('gameBudget').innerText = formatearPresupuesto(gameState.budget);
            renderSquadTable();
            renderSquadStats();
            if (precio > (gameState.records.ventaMasCara.precio || 0)) {
                gameState.records.ventaMasCara = { nombre: jugadorName, precio: precio, equipoDestino: comprador || 'CPU' };
            }
            break;
        }
    }
}

function rechazarOferta(jugadorId) {
    limpiarAccionesMensajes(jugadorId);
    enviarMensaje('Dirección Deportiva', '❌ Oferta rechazada',
        'Se ha rechazado la oferta por el jugador.');
    renderInbox();
    renderInboxView();
    if (gameState.mensajes.length > 0) seleccionarMensaje(gameState.mensajes[0].id);
}

function aceptarCesion(jugadorId, equipoDestino, duracion) {
    for (var i = 0; i < gameState.squad.length; i++) {
        if (gameState.squad[i].id === jugadorId) {
            var p = gameState.squad[i];
            gameState.squad.splice(i, 1);

            var finJornada = (gameState.matchday || 1) + Math.round(duracion * 38);
            var squadDest = obtenerSquadEquipo(equipoDestino);
            var idEnDestino = null;
            if (squadDest) {
                var clone = JSON.parse(JSON.stringify(p));
                clone.id = 20000 + Math.floor(Math.random() * 90000);
                clone.esCedido = true;
                clone.equipoOrigen = gameState.team;
                clone.jornadaFinCesion = finJornada;
                clone.grupo = null;
                idEnDestino = clone.id;
                squadDest.push(clone);
                _cachedSquads[equipoDestino] = squadDest;

                if (!gameState.cedidosFuera) gameState.cedidosFuera = [];
                gameState.cedidosFuera.push({
                    id: p.id,
                    nombre: p.name,
                    pos: p.pos,
                    rating: p.rating,
                    edad: p.age,
                    nacionalidad: p.nationality,
                    altura: p.height,
                    dorsal: p.dorsal,
                    val: p.val,
                    statsTemporada: p.statsTemporada || { partidos: 0, goles: 0, asistencias: 0, ta: 0, tr: 0 },
                    lesionSemanas: p.lesionSemanas || 0,
                    tipoLesion: p.tipoLesion || '',
                    sancionSemanas: p.sancionSemanas || 0,
                    destino: equipoDestino,
                    idEnDestino: idEnDestino,
                    jornadaFin: finJornada
                });
            }

            if (!gameState.historialTraspasos) gameState.historialTraspasos = [];
            gameState.historialTraspasos.unshift({
                fecha: 'J' + (gameState.matchday || 1),
                tipo: 'cesion',
                jugador: p.name,
                desde: gameState.team,
                para: equipoDestino,
                precio: 0,
                pos: p.pos,
                rating: p.rating,
                liga: gameState.league
            });
            limpiarAccionesMensajes(jugadorId);
            enviarMensaje('Dirección Deportiva', '\ud83d\udcc4 Cesión cerrada',
                p.name + ' se marcha cedido al ' + equipoDestino + ' por ' + duracion + ' temporada(s). Operación gratuita.');
            renderInbox();
            renderInboxView();
            if (gameState.mensajes.length > 0) seleccionarMensaje(gameState.mensajes[0].id);
            renderSquadTable();
            renderSquadStats();
            break;
        }
    }
}

function esMercadoAbierto() {
    var j = gameState.matchday || 1;
    return (j >= 1 && j <= 4) || (j >= 19 && j <= 21);
}

function simularMercadoCPU() {
    if (!esMercadoAbierto()) { console.log('[MERCADO CPU] Cerrado (J' + gameState.matchday + ')'); return; }
    var todosEquipos = obtenerTodosEquipos();
    if (Object.keys(_presupuestosCPU).length === 0) {
        todosEquipos.forEach(function(eq) {
            if (eq.name !== gameState.team) {
                _presupuestosCPU[eq.name] = parsearPresupuesto(eq.budget || '2.0M€');
            }
        });
    }
    var equipos = todosEquipos;
    var objetivo = 2 + Math.floor(Math.random() * 4);
    var realizadas = 0;
    var maxIter = objetivo * 15;

    while (realizadas < objetivo && maxIter-- > 0) {
        var comprador = equipos[Math.floor(Math.random() * equipos.length)];
        if (comprador.name === gameState.team) continue;

        var presupuesto = _presupuestosCPU[comprador.name] || 0;
        if (presupuesto < 1) continue;

        var squad = obtenerSquadEquipo(comprador.name);
        if (!squad || squad.length < 11) continue;

        var conteo = {}, maxRating = {};
        var todasPos = ['PO','DFC','LD','LI','CAI','CAD','MCD','MC','MCO','MI','MD','EI','ED','DC'];
        todasPos.forEach(function(p) { conteo[p] = 0; maxRating[p] = 0; });
        squad.forEach(function(j) {
            if (conteo[j.pos] !== undefined) {
                conteo[j.pos]++;
                if (j.rating > maxRating[j.pos]) maxRating[j.pos] = j.rating;
            }
        });

        var grupos = { PO: ['PO'], DEF: ['DFC','LI','LD','CAI','CAD'], MC: ['MCD','MC','MCO','MI','MD'], ATA: ['EI','ED','DC'] };
        var necesidades = [];
        for (var g in grupos) {
            var total = 0, mejor = 0;
            grupos[g].forEach(function(p) {
                total += conteo[p] || 0;
                if ((maxRating[p] || 0) > mejor) mejor = maxRating[p];
            });
            var min = g === 'PO' ? 2 : g === 'DEF' ? 4 : g === 'MC' ? 4 : 3;
            if (total < min || mejor < (comprador.rating || 75) - 8) {
                necesidades.push(g);
            }
        }
        if (necesidades.length === 0) continue;

        var grupoNeeded = necesidades[Math.floor(Math.random() * necesidades.length)];
        var posBuscar = grupos[grupoNeeded];

        var candidatos = [];
        equipos.forEach(function(vendedor) {
            if (vendedor.name === comprador.name) return;
            var sq = obtenerSquadEquipo(vendedor.name);
            if (!sq) return;
            sq.forEach(function(j) {
                if (posBuscar.indexOf(j.pos) !== -1) {
                    var precio = calcularPrecio(j.rating);
                    if (precio <= presupuesto) {
                        candidatos.push({ jugador: j, equipo: vendedor.name, precio: precio });
                    }
                }
            });
        });
        if (candidatos.length === 0) continue;
        candidatos.sort(function(a, b) { return b.jugador.rating - a.jugador.rating; });
        var target = candidatos[0];

        var squadVendedor = _cachedSquads[target.equipo];
        if (!squadVendedor) continue;
        var idx = -1;
        for (var i = 0; i < squadVendedor.length; i++) {
            if (squadVendedor[i].id === target.jugador.id) { idx = i; break; }
        }
        if (idx === -1) continue;

        var jugador = squadVendedor.splice(idx, 1)[0];
        _presupuestosCPU[comprador.name] = (_presupuestosCPU[comprador.name] || 0) - target.precio;
        _presupuestosCPU[target.equipo] = (_presupuestosCPU[target.equipo] || 0) + target.precio;

        jugador.grupo = null;
        squad.push(jugador);
        _cachedSquads[comprador.name] = squad;

        if (!gameState.historialTraspasos) gameState.historialTraspasos = [];
        gameState.historialTraspasos.unshift({
            fecha: 'J' + (gameState.matchday || 1),
            tipo: 'traspaso_cpu',
            jugador: jugador.name,
            desde: target.equipo,
            para: comprador.name,
            precio: target.precio,
            pos: jugador.pos,
            rating: jugador.rating,
            liga: gameState.league
        });
        realizadas++;
    }
    console.log('[MERCADO CPU] Objetivo: ' + objetivo + ', Realizadas: ' + realizadas);
}

function getGrupoPos(pos) {
    if (pos === 'PO') return 'PO';
    if (['DFC','LI','LD','CAI','CAD'].indexOf(pos) !== -1) return 'DEF';
    if (['MCD','MC','MCO','MI','MD'].indexOf(pos) !== -1) return 'MC';
    if (['EI','ED','DC'].indexOf(pos) !== -1) return 'ATA';
    return 'MC';
}

function getPosicionesNecesitadas(squad, ratingEquipo) {
    var grupos = { PO:['PO'], DEF:['DFC','LI','LD','CAI','CAD'], MC:['MCD','MC','MCO','MI','MD'], ATA:['EI','ED','DC'] };
    var conteo = {}, maxR = {};
    ['PO','DFC','LD','LI','CAI','CAD','MCD','MC','MCO','MI','MD','EI','ED','DC'].forEach(function(p){ conteo[p]=0; maxR[p]=0; });
    squad.forEach(function(j) {
        if (conteo[j.pos] !== undefined) { conteo[j.pos]++; if (j.rating > maxR[j.pos]) maxR[j.pos] = j.rating; }
    });
    var necesidades = [];
    for (var g in grupos) {
        var total = 0, mejor = 0;
        grupos[g].forEach(function(p) { total += conteo[p]||0; if ((maxR[p]||0) > mejor) mejor = maxR[p]; });
        var min = g==='PO' ? 2 : g==='DEF' ? 4 : g==='MC' ? 4 : 3;
        if (total < min || mejor < (ratingEquipo||75)-8) necesidades.push(g);
    }
    return necesidades;
}

function obtenerTodosEquipos() {
    var todos = [];
    var paises = Database.getCountries();
    paises.forEach(function(p) {
        var ligas = Database.getLeagues(p.name);
        ligas.forEach(function(l) {
            var teams = Database.getTeams(p.name, l.name);
            teams.forEach(function(t) { todos.push(t); });
        });
    });
    return todos;
}

function calcularPrecioOferta(jugador, enTransferibles) {
    var valStr = (jugador.val || '0.5M\u20ac').replace('\u20ac', '').replace('M', '').replace('K', '');
    var valNum = parseFloat(valStr);
    if ((jugador.val || '').indexOf('K') !== -1) valNum = valNum / 1000;
    var valorMercado = Math.max(0.5, valNum);
    var minMult = 0.85;
    var maxMult = 1.30;
    if (jugador.age <= 20) maxMult = 1.40;
    if (enTransferibles) maxMult = Math.min(maxMult, 1.0);
    var precio = valorMercado * (minMult + Math.random() * (maxMult - minMult));
    return Math.round(precio * 100) / 100;
}

function buscarClubesInteresadosEnCedible(jugador) {
    var grupoJug = getGrupoPos(jugador.pos);
    var todosEq = obtenerTodosEquipos();
    var interesados = [];
    todosEq.forEach(function(eq) {
        if (eq.name === gameState.team) return;
        var sq = _cachedSquads[eq.name];
        if (!sq || sq.length === 0) return;
        if (Math.abs(jugador.rating - (eq.rating || 75)) > 8) return;
        var tieneGrupo = false;
        for (var i = 0; i < sq.length; i++) {
            if (getGrupoPos(sq[i].pos) === grupoJug) { tieneGrupo = true; break; }
        }
        if (!tieneGrupo) return;
        if (jugador.rating <= (eq.rating || 75) + 15) interesados.push(eq.name);
    });
    return interesados;
}

function buscarYOfertarCesion(jugador) {
    if (!jugador) return;
    var interesados = buscarClubesInteresadosEnCedible(jugador);
    if (interesados.length === 0) return;
    var elegido = interesados[Math.floor(Math.random() * interesados.length)];
    var duraciones = [0.5, 1, 2];
    var duracion = duraciones[Math.floor(Math.random() * duraciones.length)];
    var textoDuracion = duracion === 0.5 ? '1/2 temporada' : duracion + ' temporadas';
    enviarMensaje(elegido, '\uD83D\uDCC4 Oferta de Cesi\u00f3n por ' + jugador.name,
        'El ' + elegido + ' est\u00e1 interesado en incorporar a ' + jugador.name +
        ' en calidad de cedido por una duraci\u00f3n de ' + textoDuracion + '.',
        [
            { texto: 'Aceptar Cesión', fn: 'aceptarCesion(' + jugador.id + ',\'' + elegido + '\',' + duracion + ')' },
            { texto: 'Rechazar', fn: 'rechazarOferta(' + jugador.id + ')' }
        ]
    );
    renderInbox();
}

function generarOfertasCPU() {
    if (!gameState.squad || gameState.squad.length === 0) return;
    if (!esMercadoAbierto()) { console.log('[MERCADO] Cerrado (J' + gameState.matchday + ')'); return; }

    var todosEquipos = obtenerTodosEquipos();
    if (Object.keys(_presupuestosCPU).length === 0) {
        todosEquipos.forEach(function(eq) {
            if (eq.name !== gameState.team) {
                _presupuestosCPU[eq.name] = parsearPresupuesto(eq.budget || '2.0M€');
            }
        });
    }

    var intentos = 3 + Math.floor(Math.random() * 3);
    var ofertasEnviadas = 0;
    var ofertasPorEquipo = {};

    for (var t = 0; t < intentos; t++) {
        var disponibles = gameState.squad.filter(function(p) {
            return p.lesionSemanas === 0 && p.sancionSemanas === 0;
        });
        if (disponibles.length === 0) { console.log('[MERCADO] Sin jugadores disponibles'); break; }

        var poolPonderado = [];
        disponibles.forEach(function(p) {
            var peso = 1;
            if (p.enTransferibles) peso += 3;
            if (p.enCedibles) peso += 5;
            for (var w = 0; w < peso; w++) poolPonderado.push(p);
        });
        var elegido = poolPonderado[Math.floor(Math.random() * poolPonderado.length)];
        var valor = calcularPrecio(elegido.rating);
        var esReserva = elegido.rating < 75;
        var esJoven = elegido.age <= 21;
        var grupoJug = getGrupoPos(elegido.pos);

        var posiblesCompra = [], posiblesCesion = [];
        todosEquipos.forEach(function(eq) {
            if (eq.name === gameState.team) return;
            var presupuesto = _presupuestosCPU[eq.name] || parsearPresupuesto(eq.budget || '2.0M€');
            if (presupuesto >= valor * 0.6) posiblesCompra.push(eq.name);

            if (elegido.enCedibles || esReserva || esJoven) {
                var sq = obtenerSquadEquipo(eq.name);
                if (sq && sq.length > 0) {
                    var tieneGrupo = false;
                    for (var si = 0; si < sq.length; si++) {
                        if (getGrupoPos(sq[si].pos) === grupoJug) { tieneGrupo = true; break; }
                    }
                    if (tieneGrupo && Math.abs(elegido.rating - (eq.rating || 75)) <= 8) {
                        posiblesCesion.push(eq.name);
                    }
                }
            }
        });

        var esCesion = false;
        if (elegido.enTransferibles && elegido.enCedibles) {
            if (posiblesCompra.length > 0 && posiblesCesion.length > 0) esCesion = Math.random() < 0.5;
            else if (posiblesCompra.length > 0) esCesion = false;
            else if (posiblesCesion.length > 0) esCesion = true;
            else continue;
        } else if (elegido.enTransferibles) {
            if (posiblesCompra.length === 0) { console.log('[MERCADO] Sin comprador para transferible', elegido.name); continue; }
            esCesion = false;
        } else if (elegido.enCedibles) {
            if (posiblesCesion.length === 0) { console.log('[MERCADO] Sin cesión para cedible', elegido.name); continue; }
            esCesion = true;
        } else {
            esCesion = (esReserva || esJoven) && posiblesCesion.length > 0 && Math.random() < 0.4;
            if (!esCesion && posiblesCompra.length === 0 && posiblesCesion.length > 0) esCesion = true;
        }

        if (esCesion) {
            if (posiblesCesion.length === 0) { console.log('[MERCADO] Sin cesión viable para', elegido.name); continue; }
            var pesoTotalC = 0, pesosC = [];
            posiblesCesion.forEach(function(n) {
                var w = 1 / (1 + (ofertasPorEquipo[n] || 0));
                pesosC.push({ nombre: n, peso: w });
                pesoTotalC += w;
            });
            var rc = Math.random() * pesoTotalC;
            var ofertante = posiblesCesion[0];
            for (var pc2 = 0; pc2 < pesosC.length; pc2++) {
                rc -= pesosC[pc2].peso;
                if (rc <= 0) { ofertante = pesosC[pc2].nombre; break; }
            }
            if (!ofertasPorEquipo[ofertante]) ofertasPorEquipo[ofertante] = 0;
            ofertasPorEquipo[ofertante]++;
            var duraciones = [0.5, 1, 2];
            var duracion = duraciones[Math.floor(Math.random() * duraciones.length)];
            var textoDuracion = duracion === 0.5 ? '1/2 temporada' : duracion + ' temporadas';
            enviarMensaje(ofertante, '\ud83d\udcc4 Oferta de Cesión por ' + elegido.name,
                'El ' + ofertante + ' está interesado en incorporar a ' + elegido.name +
                ' en calidad de cedido por una duración de ' + textoDuracion + '.',
                [
                    { texto: 'Aceptar Cesión', fn: 'aceptarCesion(' + elegido.id + ',\'' + ofertante + '\',' + duracion + ')' },
                    { texto: 'Rechazar', fn: 'rechazarOferta(' + elegido.id + ')' }
                ]
            );
            ofertasEnviadas++;
            console.log('[MERCADO] Cesión ofrecida:', elegido.name, '→', ofertante);
        } else {
            if (posiblesCompra.length === 0) { console.log('[MERCADO] Sin comprador con presupuesto para', elegido.name); continue; }
            var pesoTotal = 0, pesos = [];
            posiblesCompra.forEach(function(n) {
                var w = 1 / (1 + (ofertasPorEquipo[n] || 0));
                pesos.push({ nombre: n, peso: w });
                pesoTotal += w;
            });
            var r = Math.random() * pesoTotal;
            var ofertante = posiblesCompra[0];
            for (var pc = 0; pc < pesos.length; pc++) {
                r -= pesos[pc].peso;
                if (r <= 0) { ofertante = pesos[pc].nombre; break; }
            }
            if (!ofertasPorEquipo[ofertante]) ofertasPorEquipo[ofertante] = 0;
            ofertasPorEquipo[ofertante]++;
            var precio = calcularPrecioOferta(elegido, elegido.enTransferibles);
            var presupComp = _presupuestosCPU[ofertante] || 0;
            if (precio > presupComp) precio = presupComp;
            enviarMensaje(ofertante, '\ud83d\udce8 Oferta por ' + elegido.name,
                'El ' + ofertante + ' ofrece ' + precio.toFixed(1) + 'M\u20ac por ' + elegido.name + '.',
                [
                    { texto: 'Aceptar', fn: 'aceptarOferta(' + elegido.id + ',' + precio + ",'" + ofertante + "')" },
                    { texto: 'Rechazar', fn: 'rechazarOferta(' + elegido.id + ')' }
                ]
            );
            ofertasEnviadas++;
            console.log('[MERCADO] Oferta enviada:', elegido.name, '→', ofertante, precio + 'M\u20ac');
        }
    }

    var cediblesSinOferta = gameState.squad.filter(function(p) {
        return p.enCedibles && p.lesionSemanas === 0 && p.sancionSemanas === 0;
    });
    cediblesSinOferta.forEach(function(ced) {
        if (!_intentosCesion[ced.id]) _intentosCesion[ced.id] = 0;
        _intentosCesion[ced.id]++;
        var prob = Math.min(0.4 + _intentosCesion[ced.id] * 0.2, 0.9);
        if (Math.random() < prob) {
            var interesados = buscarClubesInteresadosEnCedible(ced);
            if (interesados.length > 0) {
                var elegidoC = interesados[Math.floor(Math.random() * interesados.length)];
                if (!ofertasPorEquipo[elegidoC]) ofertasPorEquipo[elegidoC] = 0;
                ofertasPorEquipo[elegidoC]++;
                var duraciones = [0.5, 1, 2];
                var duracion = duraciones[Math.floor(Math.random() * duraciones.length)];
                var textoDuracion = duracion === 0.5 ? '1/2 temporada' : duracion + ' temporadas';
                enviarMensaje(elegidoC, '\uD83D\uDCC4 Oferta de Cesi\u00f3n por ' + ced.name,
                    'El ' + elegidoC + ' est\u00e1 interesado en incorporar a ' + ced.name +
                    ' en calidad de cedido por una duraci\u00f3n de ' + textoDuracion + '.',
                    [
                        { texto: 'Aceptar Cesión', fn: 'aceptarCesion(' + ced.id + ',\'' + elegidoC + '\',' + duracion + ')' },
                        { texto: 'Rechazar', fn: 'rechazarOferta(' + ced.id + ')' }
                    ]
                );
                ofertasEnviadas++;
                _intentosCesion[ced.id] = 0;
                console.log('[MERCADO] Cesión dedicada ofrecida:', ced.name, '→', elegidoC);
            }
        }
    });

    if (ofertasEnviadas === 0) {
        var planB = null;
        for (var i = 0; i < gameState.squad.length; i++) {
            if (gameState.squad[i].lesionSemanas === 0) { planB = gameState.squad[i]; break; }
        }
        if (planB) {
            var cpuTeams = todosEquipos.filter(function(eq) { return eq.name !== gameState.team; });
            if (cpuTeams.length > 0) {
                var compradorB = cpuTeams[Math.floor(Math.random() * cpuTeams.length)].name;
                var precioB = calcularPrecioOferta(planB, false);
                enviarMensaje(compradorB, '\ud83d\udce8 Oferta por ' + planB.name,
                    'El ' + compradorB + ' ofrece ' + precioB.toFixed(1) + 'M\u20ac por ' + planB.name + '.',
                    [
                        { texto: 'Aceptar', fn: 'aceptarOferta(' + planB.id + ',' + precioB + ",'" + compradorB + "')" },
                        { texto: 'Rechazar', fn: 'rechazarOferta(' + planB.id + ')' }
                    ]
                );
                console.log('[MERCADO] Oferta garantizada:', planB.name, '→', compradorB, precioB + 'M\u20ac');
            }
        }
    }
    console.log('[MERCADO] Intentos: ' + intentos + ', Ofertas: ' + ofertasEnviadas);
}

var seleccionID = null;

function organizarPlantilla() {
    var squad = gameState.squad;
    if (!squad || squad.length === 0) return { xi: [], subs: [], reserves: [] };
    var necesitaInit = false;
    for (var i = 0; i < squad.length; i++) { if (!squad[i].grupo) { necesitaInit = true; break; } }
    if (necesitaInit) {
        autocompletarFormacion(getFormacionActiva());
    }
    var sorted = squad.slice().sort(function (a, b) { return a.grupo - b.grupo; });
    var lesionados = [], sancionados = [], sanos = [];
    sorted.forEach(function (p) {
        if (p.lesionSemanas > 0) lesionados.push(p);
        else if (p.sancionSemanas > 0) sancionados.push(p);
        else sanos.push(p);
    });
    var xi = [], subs = [], reserves = [];
    sanos.forEach(function (p) {
        if (xi.length < 11) xi.push(p);
        else if (subs.length < 12) subs.push(p);
        else reserves.push(p);
    });
    lesionados.forEach(function (p) { reserves.push(p); });
    sancionados.forEach(function (p) { reserves.push(p); });
    return { xi: xi, subs: subs, reserves: reserves };
}

var _slotCompatEstricto = {
    'POR': ['PO'],
    'LI':  ['LI'],
    'DFC': ['DFC', 'CAI', 'CAD'],
    'LD':  ['LD', 'CAD'],
    'MI':  ['MI'],
    'MC':  ['MC', 'MCD', 'MCO'],
    'MD':  ['MD'],
    'MCD': ['MCD', 'MC'],
    'EI':  ['EI'],
    'DC':  ['DC'],
    'ED':  ['ED']
};

var _slotCompatAmpliado = {
    'POR': ['PO'],
    'LI':  ['LI', 'CAI', 'DFC', 'LD'],
    'DFC': ['DFC', 'CAI', 'CAD', 'LI', 'LD'],
    'LD':  ['LD', 'CAD', 'DFC', 'LI'],
    'MI':  ['MI', 'EI', 'MD', 'ED', 'MC'],
    'MC':  ['MC', 'MCD', 'MCO', 'MI', 'MD'],
    'MD':  ['MD', 'ED', 'MI', 'EI', 'MC'],
    'MCD': ['MCD', 'MC', 'MCO'],
    'EI':  ['EI', 'MI', 'ED', 'MD', 'DC'],
    'DC':  ['DC', 'EI', 'ED'],
    'ED':  ['ED', 'MD', 'EI', 'MI', 'DC']
};

var _subsPorFormacion = {
    '4-4-2 Estándar':  { po: 2, defensa: 4, medio: 4, ataque: 2 },
    '4-3-3 Defensivo':  { po: 2, defensa: 4, medio: 3, ataque: 3 },
    '4-2-3-1':         { po: 2, defensa: 4, medio: 4, ataque: 2 },
    '3-4-3':           { po: 2, defensa: 5, medio: 4, ataque: 1 },
    '4-4-2 Diamante':  { po: 2, defensa: 4, medio: 4, ataque: 2 },
    '4-1-4-1':         { po: 2, defensa: 4, medio: 4, ataque: 2 },
    '5-3-2 Defensivo': { po: 2, defensa: 5, medio: 3, ataque: 2 }
};

function autocompletarFormacion(formation) {
    var squad = gameState.squad;
    if (!squad || squad.length === 0) return;
    var slots = getSlotLabels(formation);
    var usados = [];
    for (var s = 0; s < slots.length; s++) {
        var slot = slots[s];
        var ampliado = _slotCompatAmpliado[slot] || [];
        var elegido = null;
        var elegidoIdx = -1;
        var mejorPunt = -1;

        for (var i = 0; i < squad.length; i++) {
            if (usados.indexOf(i) !== -1) continue;
            if (ampliado.indexOf(squad[i].pos) === -1) continue;
            var punt = squad[i].rating;
            var estricto = (_slotCompatEstricto[slot] || []).indexOf(squad[i].pos) !== -1;
            if (estricto) punt += 20;
            else {
                var lineaSlot = getLinea(slot === 'POR' ? 'PO' : slot);
                var lineaJug = getLinea(squad[i].pos);
                if (lineaSlot === lineaJug) punt += 10;
            }
            if (punt > mejorPunt) {
                mejorPunt = punt;
                elegido = squad[i];
                elegidoIdx = i;
            }
        }
        if (!elegido) {
            for (var i = 0; i < squad.length; i++) {
                if (usados.indexOf(i) !== -1) continue;
                if (!elegido || squad[i].rating > elegido.rating) {
                    elegido = squad[i];
                    elegidoIdx = i;
                }
            }
        }
        if (elegido) {
            usados.push(elegidoIdx);
            elegido.grupo = s + 1;
        }
    }

    var restantes = [];
    for (var i = 0; i < squad.length; i++) {
        if (usados.indexOf(i) === -1) restantes.push({ idx: i, p: squad[i] });
    }

    restantes.sort(function (a, b) {
        var order = { po: 1, defensa: 2, medio: 3, ataque: 4 };
        var la = order[getLinea(a.p.pos)] || 99;
        var lb = order[getLinea(b.p.pos)] || 99;
        if (la !== lb) return la - lb;
        return b.p.rating - a.p.rating;
    });

    var needed = _subsPorFormacion[formation] || _subsPorFormacion['4-4-2 Estándar'];
    var counts = { po: 0, defensa: 0, medio: 0, ataque: 0 };
    var g = 12;

    restantes.forEach(function (item) {
        var linea = getLinea(item.p.pos);
        if (counts[linea] !== undefined && counts[linea] < needed[linea]) {
            counts[linea]++;
            item.p.grupo = g;
            g++;
        }
    });

    restantes.forEach(function (item) {
        if (item.p.grupo === undefined || item.p.grupo === null) {
            item.p.grupo = g;
            g++;
        }
    });
}

function asignarGruposIniciales() {
    autocompletarFormacion(getFormacionActiva());
}

var _tacticInitDone = false;

function simularPartidoCompleto(nombreL, nombreV, xiL, xiV, ratingL, ratingV) {
    var probGanaL = ratingL / (ratingL + ratingV);
    var golesL = 0, golesV = 0;
    var eventos = [];

    function jugadorAleatorio(xi) {
        return xi && xi.length > 0 ? xi[Math.floor(Math.random() * xi.length)] : null;
    }

    function asistenAleatorio(xi, goleador) {
        if (!xi || xi.length < 2) return null;
        var a;
        do { a = xi[Math.floor(Math.random() * xi.length)]; } while (a === goleador);
        return a;
    }

    for (var i = 0; i < 90; i++) {
        if (Math.random() < 0.022 * ((ratingL + ratingV) / 200)) {
            var esLocal = Math.random() < probGanaL;
            if (esLocal) golesL++;
            else golesV++;

            var xiAtacante = esLocal ? xiL : xiV;
            var goleador = seleccionarGoleador(xiAtacante);
            var asistente = null;
            if (Math.random() > 0.3) {
                asistente = seleccionarGoleador(xiAtacante);
                if (asistente && goleador && asistente.id === goleador.id) asistente = null;
            }

            eventos.push({
                tipo: 'gol',
                minuto: i,
                equipo: esLocal ? 'L' : 'V',
            });
            if (goleador) { eventos[eventos.length-1].goleador = { id: goleador.id, nombre: goleador.name, dorsal: goleador.dorsal }; }
            if (asistente) { eventos[eventos.length-1].asistente = { id: asistente.id, nombre: asistente.name, dorsal: asistente.dorsal }; }
        }
        if (Math.random() < 0.008) {
            var eqTarjeta = Math.random() < probGanaL ? 'L' : 'V';
            var xiTarjeta = eqTarjeta === 'L' ? xiL : xiV;
            var jugTarjeta = jugadorAleatorio(xiTarjeta);
            if (jugTarjeta) {
                eventos.push({ tipo: 'ta', minuto: i, equipo: eqTarjeta, jugador: { id: jugTarjeta.id, nombre: jugTarjeta.name, dorsal: jugTarjeta.dorsal } });
            }
        }
        if (Math.random() < 0.001) {
            var eqRoja = Math.random() < probGanaL ? 'L' : 'V';
            var xiRoja = eqRoja === 'L' ? xiL : xiV;
            var jugRoja = jugadorAleatorio(xiRoja);
            if (jugRoja) {
                eventos.push({ tipo: 'tr', minuto: i, equipo: eqRoja, jugador: { id: jugRoja.id, nombre: jugRoja.name, dorsal: jugRoja.dorsal } });
            }
        }
    }

    var totalEventosGol = 0;
    for (var ei = 0; ei < eventos.length; ei++) {
        if (eventos[ei].tipo === 'gol') totalEventosGol++;
    }
    if (totalEventosGol !== golesL + golesV) {
        if (totalEventosGol > 0) {
            golesL = 0; golesV = 0;
            for (var ei = 0; ei < eventos.length; ei++) {
                if (eventos[ei].tipo === 'gol') {
                    if (eventos[ei].equipo === 'L') golesL++;
                    else golesV++;
                }
            }
        }
    }

    return { golesL: golesL, golesV: golesV, eventos: eventos };
}

function obtenerSquadEquipo(nombre) {
    if (nombre === gameState.team) return gameState.squad;
    if (_cachedSquads[nombre]) return _cachedSquads[nombre];

    var paises = Database.getCountries();
    for (var p = 0; p < paises.length; p++) {
        var ligas = Database.getLeagues(paises[p].name);
        for (var l = 0; l < ligas.length; l++) {
            var equipos = Database.getTeams(paises[p].name, ligas[l].name);
            for (var e = 0; e < equipos.length; e++) {
                if (equipos[e].name === nombre) {
                    var rating = equipos[e].rating || 75;
                    var squad = equipos[e].squad && equipos[e].squad.length > 0
                        ? equipos[e].squad
                        : generarPlantillaSimulada(nombre, paises[p].name, rating);
                    _cachedSquads[nombre] = squad;
                    return squad;
                }
            }
        }
    }
    return null;
}

function registrarEventosPartido(eventos, fixturePartido) {
    if (!eventos || eventos.length === 0) return;
    fixturePartido.eventos = eventos;

    var squadsCache = {};

    function getSquad(nombre, esLocal) {
        var key = nombre + (esLocal ? '_L' : '_V');
        if (!squadsCache[key]) {
            squadsCache[key] = obtenerSquadEquipo(nombre);
        }
        return squadsCache[key];
    }

    for (var e = 0; e < eventos.length; e++) {
        var ev = eventos[e];
        var nombreEq = ev.equipo === 'L' ? fixturePartido.local : fixturePartido.visitante;
        var squad = getSquad(nombreEq, ev.equipo === 'L');
        if (!squad) continue;

        if (ev.goleador) {
            for (var i = 0; i < squad.length; i++) {
                if (squad[i].id === ev.goleador.id || squad[i].name === ev.goleador.nombre) {
                    if (!squad[i].statsTemporada) squad[i].statsTemporada = { partidos: 0, goles: 0, asistencias: 0, ta: 0, tr: 0 };
                    squad[i].statsTemporada.goles++;
                    squad[i].gol = (squad[i].gol || 0) + 1;
                    break;
                }
            }
        }
        if (ev.asistente) {
            var nombreEqAsis = ev.equipo === 'L' ? fixturePartido.local : fixturePartido.visitante;
            var squadAsis = getSquad(nombreEqAsis, ev.equipo === 'L');
            if (squadAsis) {
                for (var i = 0; i < squadAsis.length; i++) {
                    if (squadAsis[i].id === ev.asistente.id || squadAsis[i].name === ev.asistente.nombre) {
                        if (!squadAsis[i].statsTemporada) squadAsis[i].statsTemporada = { partidos: 0, goles: 0, asistencias: 0, ta: 0, tr: 0 };
                        squadAsis[i].statsTemporada.asistencias++;
                        squadAsis[i].asi = (squadAsis[i].asi || 0) + 1;
                        break;
                    }
                }
            }
        }
        if (ev.tipo === 'ta' && ev.jugador) {
            for (var i = 0; i < squad.length; i++) {
                if (squad[i].id === ev.jugador.id || squad[i].name === ev.jugador.nombre) {
                    if (!squad[i].statsTemporada) squad[i].statsTemporada = { partidos: 0, goles: 0, asistencias: 0, ta: 0, tr: 0 };
                    squad[i].statsTemporada.ta++;
                    squad[i].ta = (squad[i].ta || 0) + 1;
                    squad[i].tarjetasAmarillasAcum = (squad[i].tarjetasAmarillasAcum || 0) + 1;
                    if (squad[i].tarjetasAmarillasAcum >= 5) {
                        squad[i].sancionSemanas = Math.max(squad[i].sancionSemanas || 0, 1);
                        if (ev.equipo === 'L' ? (fixturePartido.local === gameState.team) : (fixturePartido.visitante === gameState.team)) {
                            enviarMensaje('Comité de Competición', '🟨 Sanción por acumulación',
                                squad[i].name + ' ha alcanzado las 5 tarjetas amarillas. Será baja para el próximo partido por sanción.');
                        }
                    }
                    break;
                }
            }
        }
        if (ev.tipo === 'tr' && ev.jugador) {
            for (var i = 0; i < squad.length; i++) {
                if (squad[i].id === ev.jugador.id || squad[i].name === ev.jugador.nombre) {
                    if (!squad[i].statsTemporada) squad[i].statsTemporada = { partidos: 0, goles: 0, asistencias: 0, ta: 0, tr: 0 };
                    squad[i].statsTemporada.tr++;
                    squad[i].tr = (squad[i].tr || 0) + 1;
                    squad[i].sancionSemanas = Math.max(squad[i].sancionSemanas || 0, 1);
                    if (ev.equipo === 'L' ? (fixturePartido.local === gameState.team) : (fixturePartido.visitante === gameState.team)) {
                        enviarMensaje('Comité de Competición', '🟥 Expulsión',
                            squad[i].name + ' ha sido expulsado. Será baja para el próximo partido por sanción.');
                    }
                    break;
                }
            }
        }
    }

}

var _fixtureRatings = {};

function generarFixture() {
    if (gameState.fixtureGenerado) return;
    gameState.fixture = [];

    var equipos = Database.getTeams(gameState.country, gameState.league);
    if (!equipos || equipos.length === 0) return;
    var nombres = equipos.map(function(t){ return t.name; });
    equipos.forEach(function(t){ _fixtureRatings[t.name] = t.rating; });
    _fixtureRatings[gameState.team] = gameState.rating;

    var n = nombres.length;
    var mitad = n / 2;
    var ronda = nombres.slice();

    var totalJ = gameState.totalMatchdays || 38;
    for (var jornada = 0; jornada < totalJ; jornada++) {
        var partidosJ = [];
        for (var m = 0; m < mitad; m++) {
            var local = ronda[m];
            var visit = ronda[n - 1 - m];
            if (jornada % 2 === 1) { var tmp = local; local = visit; visit = tmp; }
            partidosJ.push({ local: local, visitante: visit, golesL: 0, golesV: 0, jugado: false });
        }
        gameState.fixture.push({ jornada: jornada + 1, partidos: partidosJ });
        ronda.splice(1, 0, ronda.pop());
    }
    gameState.fixtureGenerado = true;
}

function extraerXI(squad, equipoNombre) {
    if (!squad || squad.length === 0) return [];
    var formacion = '4-4-2 Estándar';
    if (equipoNombre && _formacionesEquipos[equipoNombre]) {
        formacion = _formacionesEquipos[equipoNombre];
    }
    return seleccionarXI(squad, formacion).slice(0, 11);
}

function aplicarLesiones(xi, equipoNombre) {
    if (!xi) return;
    var presMult = equipoNombre === gameState.team
        ? (gameState.estiloPresion === 'extrema' ? 1.5 : gameState.estiloPresion === 'suave' ? 0.5 : 1.0)
        : 1.0;
    for (var i = 0; i < xi.length; i++) {
        var p = xi[i];
        var stam = parseInt(p.stamina) || 100;
        var prob = 0;
        if (stam > 40) prob = 0.001;
        else if (stam >= 20) prob = 0.015;
        else prob = 0.04;
        prob *= presMult;
        if (Math.random() < prob) {
            var r = Math.random();
            if (r < 0.70) { p.lesionSemanas = 1; p.tipoLesion = 'Muscular'; }
            else if (r < 0.90) { p.lesionSemanas = 2; p.tipoLesion = 'Esguince'; }
            else if (r < 0.98) { p.lesionSemanas = 3; p.tipoLesion = 'Ligamentos'; }
            else { p.lesionSemanas = 4 + Math.floor(Math.random() * 3); p.tipoLesion = 'Fractura'; }
            if (equipoNombre === gameState.team) {
                enviarMensaje('Servicio Médico', 'Parte de Lesión',
                    p.name + ' ha sufrido una lesión de tipo ' + p.tipoLesion + ' durante el partido. El tiempo estimado de baja es de ' + p.lesionSemanas + ' semana' + (p.lesionSemanas > 1 ? 's' : '') + '.');
            }
        }
    }
}

function aplicarDesgasteXI(xi) {
    if (!xi) return;
    for (var i = 0; i < xi.length; i++) {
        var stam = parseInt(xi[i].stamina) || 100;
        stam = Math.max(0, stam - (Math.floor(Math.random() * 7) + 12));
        xi[i].stamina = stam + '%';
    }
}

function simularJornadaCPU(jornadaIdx) {
    var jornada = gameState.fixture[jornadaIdx];
    if (!jornada) return;
    for (var m = 0; m < jornada.partidos.length; m++) {
        var p = jornada.partidos[m];
        if (p.jugado) continue;
        if (p.local === gameState.team || p.visitante === gameState.team) continue;

        var rL = _fixtureRatings[p.local] || 75;
        var rV = _fixtureRatings[p.visitante] || 75;
        var squadL = obtenerSquadEquipo(p.local);
        var squadV = obtenerSquadEquipo(p.visitante);
        var xiL = extraerXI(squadL, p.local);
        var xiV = extraerXI(squadV, p.visitante);
        var res = simularPartidoCompleto(p.local, p.visitante, xiL, xiV, rL, rV);

        p.golesL = res.golesL;
        p.golesV = res.golesV;
        p.jugado = true;
        registrarEventosPartido(res.eventos, p);
        [xiL, xiV].forEach(function(xi) {
            xi.forEach(function(j) {
                if (!j.statsTemporada) j.statsTemporada = { partidos: 0, goles: 0, asistencias: 0, ta: 0, tr: 0, historialNotas: [], promedioNotas: 0 };
                j.statsTemporada.partidos = (j.statsTemporada.partidos || 0) + 1;
                j.pj = (j.pj || 0) + 1;
            });
        });
        aplicarDesgasteXI(xiL);
        aplicarDesgasteXI(xiV);
        aplicarLesiones(xiL, p.local);
        aplicarLesiones(xiV, p.visitante);
    }
}

function generarCuadroCopa() {
    var todasLigas = Database.getLeagues(gameState.country);
    var todosEquipos = [];
    todasLigas.forEach(function(liga) {
        var teams = Database.getTeams(gameState.country, liga.name);
        teams.forEach(function(t) {
            todosEquipos.push({ nombre: t.name, rating: t.rating || 75, liga: liga.name });
        });
    });
    todosEquipos.sort(function(a, b) { return b.rating - a.rating; });
    var participantes = todosEquipos.slice(0, 32);

    var mezclados = participantes.slice();
    for (var i = mezclados.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = mezclados[i]; mezclados[i] = mezclados[j]; mezclados[j] = tmp;
    }

    var partidos16 = [];
    for (var i = 0; i < mezclados.length; i += 2) {
        partidos16.push({ local: mezclados[i].nombre, visitante: mezclados[i + 1].nombre, resultado: null });
    }

    gameState.copa = {
        rondas: [
            { nombre: '1/16', orden: 0, partidos: partidos16, completada: false },
            { nombre: '1/8', orden: 1, partidos: [], completada: false },
            { nombre: 'Cuartos', orden: 2, partidos: [], completada: false },
            { nombre: 'Semifinal', orden: 3, partidos: [], completada: false },
            { nombre: 'Final', orden: 4, partidos: [], completada: false }
        ],
        campeon: null,
        temporada: '2026-27'
    };
}

function simularPartidoCopa(local, visitante) {
    var rL = _fixtureRatings[local] || 75;
    var rV = _fixtureRatings[visitante] || 75;
    var squadL = obtenerSquadEquipo(local);
    var squadV = obtenerSquadEquipo(visitante);
    var xiL = extraerXI(squadL, local);
    var xiV = extraerXI(squadV, visitante);
    var res = simularPartidoCompleto(local, visitante, xiL, xiV, rL, rV);

    var resFinal = { golesL: res.golesL, golesV: res.golesV, tipo: 'normal' };

    if (res.golesL !== res.golesV) {
        return resFinal;
    }

    var golesETL = 0, golesETV = 0;
    for (var i = 0; i < 30; i++) {
        if (Math.random() < 0.012 * (rL / 100)) golesETL++;
        if (Math.random() < 0.012 * (rV / 100)) golesETV++;
    }
    resFinal.golesL += golesETL;
    resFinal.golesV += golesETV;
    resFinal.tipo = 'prorroga';

    if (golesETL !== golesETV) return resFinal;

    var penL = 0, penV = 0;
    for (var p = 0; p < 5; p++) {
        if (Math.random() < 0.75) penL++;
        if (Math.random() < 0.75) penV++;
    }
    var pIdx = 0;
    while (penL === penV && pIdx < 10) {
        penL += Math.random() < 0.75 ? 1 : 0;
        penV += Math.random() < 0.75 ? 1 : 0;
        pIdx++;
    }
    resFinal.tipo = 'penaltis';
    resFinal.penaltis = { local: penL, visitante: penV };
    if (penL > penV) resFinal.golesL++;
    else resFinal.golesV++;

    return resFinal;
}

function simularRondaPlayoff(orden) {
    if (!gameState.playoff) return;
    var ronda = gameState.playoff.rondas[orden];
    if (!ronda || ronda.completada || ronda.partidos.length === 0) return;
    var ganadores = [];
    ronda.partidos.forEach(function(p) {
        if (p.resultado) {
            var gan = p.resultado.golesL > p.resultado.golesV ? p.local : p.visitante;
            ganadores.push(gan);
            return;
        }
        var res = simularPartidoCopa(p.local, p.visitante);
        p.resultado = res;
        var ganador = res.golesL > res.golesV ? p.local : p.visitante;
        if (orden % 2 === 1 && p.resultadoIda) {
            var globalL = p.resultadoIda.golesL + res.golesL;
            var globalV = p.resultadoIda.golesV + res.golesV;
            if (globalL !== globalV) {
                ganador = globalL > globalV ? p.local : p.visitante;
            }
        }
        ganadores.push(ganador);
    });
    ronda.completada = true;

    if (orden < gameState.playoff.rondas.length - 1) {
        var sigRonda = gameState.playoff.rondas[orden + 1];
        for (var i = 0; i < ganadores.length; i += 2) {
            if (i + 1 < ganadores.length) {
                sigRonda.partidos.push({ local: ganadores[i], visitante: ganadores[i + 1], resultado: null, resultadoIda: null });
            }
        }
    } else {
        gameState.playoff.campeon = ganadores[0] || null;
        gameState.playoff.completado = true;
        if (gameState.playoff.campeon) {
            var m = gameState.currentDate.match(/Temporada (\d{4}-\d{2})/);
            var seasonStr = m ? m[1] : '2026-27';
            registrarTitulo(gameState.playoff.campeon, 'Playoff Ascenso', seasonStr);
            enviarMensaje('LaLiga', '\ud83c\udfc6 Playoff de Ascenso',
                '\u00a1' + gameState.playoff.campeon + ' asciende a Primera Divisi\u00f3n tras ganar el playoff de ascenso ' + seasonStr + '!');
            renderInbox();
        }
    }
}

function simularRondaCopa(orden) {
    var ronda = gameState.copa.rondas[orden];
    if (!ronda || ronda.completada || ronda.partidos.length === 0) return;
    var ganadores = [];
    ronda.partidos.forEach(function(p) {
        if (p.resultado) {
            var gan = p.resultado.golesL > p.resultado.golesV ? p.local : p.visitante;
            ganadores.push(gan);
            return;
        }
        var res = simularPartidoCopa(p.local, p.visitante);
        p.resultado = res;
        var ganador = res.golesL > res.golesV ? p.local : p.visitante;
        ganadores.push(ganador);
    });
    ronda.completada = true;

    if (orden < gameState.copa.rondas.length - 1) {
        var sigRonda = gameState.copa.rondas[orden + 1];
        for (var i = 0; i < ganadores.length; i += 2) {
            if (i + 1 < ganadores.length) {
                sigRonda.partidos.push({ local: ganadores[i], visitante: ganadores[i + 1], resultado: null });
            }
        }
    } else {
        gameState.copa.campeon = ganadores[0] || null;
        if (ronda.partidos.length > 0 && ronda.partidos[0].resultado) {
            var fp = ronda.partidos[0];
            gameState.copa.subcampeon = fp.resultado.golesL > fp.resultado.golesV ? fp.visitante : fp.local;
        } else {
            gameState.copa.subcampeon = null;
        }
        if (gameState.copa.campeon) {
            gameState.budget += 5;
            var m = gameState.currentDate.match(/Temporada (\d{4}-\d{2})/);
            var seasonStr = m ? m[1] : '2026-27';
            registrarTitulo(gameState.copa.campeon, 'Copa del Rey', seasonStr);
            enviarMensaje('Real Federación Española', '\ud83c\udfc6 Campeón de Copa',
                '¡' + gameState.copa.campeon + ' se proclama campeón de la Copa del Rey ' + seasonStr + '!');
        }
    }
}

function buildCopaBracketHTML(copaData, roundIndex) {
    if (!copaData) return '';
    var html = '';
    copaData.rondas.forEach(function(ronda, idx) {
        if (roundIndex !== undefined && roundIndex >= 0 && idx !== roundIndex) return;
        if (ronda.partidos.length === 0 && !ronda.completada) return;
        html += '<div class="copa-round">';
        html += '<div class="copa-round-title">' + ronda.nombre + (ronda.completada ? ' <span style="color:#22c55e;font-size:9px;">\u2713</span>' : '') + '</div>';
        ronda.partidos.forEach(function(p) {
            var esUsuario = p.local === gameState.team || p.visitante === gameState.team;
            var clase = 'copa-match' + (esUsuario ? ' user-match' : '');
            html += '<div class="' + clase + '">';
            html += '<span' + (p.local === gameState.team ? ' style="color:#38bdf8;font-weight:bold;"' : '') + '>' + p.local + '</span>';
            html += ' <span style="color:#64748b;">vs</span> ';
            html += '<span' + (p.visitante === gameState.team ? ' style="color:#38bdf8;font-weight:bold;"' : '') + '>' + p.visitante + '</span>';
            if (p.resultado) {
                html += ' <span class="copa-score">' + p.resultado.golesL + '-' + p.resultado.golesV + '</span>';
                if (p.resultado.tipo === 'penaltis') {
                    html += ' <span class="copa-pen">(' + p.resultado.penaltis.local + '-' + p.resultado.penaltis.visitante + ' PEN)</span>';
                } else if (p.resultado.tipo === 'prorroga') {
                    html += ' <span class="copa-et">(T.E.)</span>';
                }
                var ganador = p.resultado.golesL > p.resultado.golesV ? p.local : p.visitante;
                if (ganador === gameState.team) html += ' <span style="color:#22c55e;">\u2714</span>';
            } else {
                html += ' <span class="copa-pend">Pendiente</span>';
            }
            html += '</div>';
        });
        html += '</div>';
    });
    return html;
}

function renderCopaView() {
    var container = document.getElementById('copaBracket');
    if (!container) return;
    if (!gameState.copa) generarCuadroCopa();
    var campeonEl = document.getElementById('copaCampeon');
    if (gameState.copa.campeon) {
        campeonEl.innerHTML = '\ud83c\udfc6 Campe\u00f3n: <strong>' + gameState.copa.campeon + '</strong>';
    } else {
        campeonEl.innerHTML = '';
    }
    container.innerHTML = buildCopaBracketHTML(gameState.copa);
}

function generarFixturePara(ligaName) {
    var equipos = Database.getTeams(gameState.country, ligaName);
    if (!equipos || equipos.length < 2) return;
    if (gameState.fixturesPorLiga[ligaName]) return;
    var nombres = equipos.map(function(t) { return t.name; });
    var n = nombres.length;
    var ronda = nombres.slice();
    var fixture = [];
    var totalJ = (n - 1) * 2;
    for (var j = 0; j < totalJ; j++) {
        var partidos = [];
        for (var m = 0; m < n / 2; m++) {
            var local = ronda[m];
            var visit = ronda[n - 1 - m];
            if (j % 2 === 1) { var tmp = local; local = visit; visit = tmp; }
            partidos.push({ local: local, visitante: visit, golesL: 0, golesV: 0, jugado: false });
        }
        fixture.push({ jornada: j + 1, partidos: partidos });
        ronda.splice(1, 0, ronda.pop());
    }
    gameState.fixturesPorLiga[ligaName] = fixture;
}

function simularJornadaTodasLigas(jornadaIdx) {
    for (var ligaName in gameState.fixturesPorLiga) {
        var fixture = gameState.fixturesPorLiga[ligaName];
        if (!fixture || !fixture[jornadaIdx]) continue;
        var jornada = fixture[jornadaIdx];
        for (var m = 0; m < jornada.partidos.length; m++) {
            var p = jornada.partidos[m];
            if (p.jugado) continue;
            if (p.local === gameState.team || p.visitante === gameState.team) continue;
            var rL = _fixtureRatings[p.local] || 75;
            var rV = _fixtureRatings[p.visitante] || 75;
            var squadL = obtenerSquadEquipo(p.local);
            var squadV = obtenerSquadEquipo(p.visitante);
            if (!squadL || !squadV) continue;
            var xiL = extraerXI(squadL, p.local);
            var xiV = extraerXI(squadV, p.visitante);
            var res = simularPartidoCompleto(p.local, p.visitante, xiL, xiV, rL, rV);
            p.golesL = res.golesL;
            p.golesV = res.golesV;
            p.jugado = true;
            registrarEventosPartido(res.eventos, p);
            [xiL, xiV].forEach(function(xi) {
                xi.forEach(function(j) {
                    if (!j.statsTemporada) j.statsTemporada = { partidos: 0, goles: 0, asistencias: 0, ta: 0, tr: 0, historialNotas: [], promedioNotas: 0 };
                    j.statsTemporada.partidos = (j.statsTemporada.partidos || 0) + 1;
                    j.pj = (j.pj || 0) + 1;
                });
            });
            aplicarDesgasteXI(xiL);
            aplicarDesgasteXI(xiV);
            aplicarLesiones(xiL, p.local);
            aplicarLesiones(xiV, p.visitante);
        }
    }
}

function generarCalendario() {
    if (gameState.calendarioGenerado) return;
    gameState.calendario = [];
    var equiposLiga = Database.getTeams(gameState.country, gameState.league);
    gameState.totalMatchdays = equiposLiga.length > 0 ? (equiposLiga.length - 1) * 2 : 38;
    var rivales = equiposLiga.map(function(t){ return t.name; });
    rivales = rivales.filter(function(n){ return n !== gameState.team; });
    if (rivales.length === 0) rivales = ['Rival'];
    for (var i = rivales.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = rivales[i];
        rivales[i] = rivales[j];
        rivales[j] = tmp;
    }

    var totalJornadas = gameState.totalMatchdays || 38;
    var copaRondasCal = [4, 8, 12, 16, 20, 21, 24]; // 1/16 → 1/8 → Cuartos → SF(ida) → SF(vuelta) → Final
    for (var s = 1; s <= totalJornadas; s++) {
        var partidos = [];

        // Copa del Rey matchday
        var copaIdx = copaRondasCal.indexOf(s);
        if (copaIdx !== -1 && gameState.copa && gameState.copa.rondas[copaIdx]) {
            var ronda = gameState.copa.rondas[copaIdx];
            ronda.partidos.forEach(function(p) {
                if (p.local === gameState.team || p.visitante === gameState.team) {
                    var cond = p.local === gameState.team ? 'C' : 'V';
                    partidos.push({ competicion: 'Copa', rival: p.local === gameState.team ? p.visitante : p.local, condicion: cond, jugado: false, resultado: null, copaRondaIdx: copaIdx });
                }
            });
        }

        // Supercopa de España
        if (gameState._supercopaClasificados) {
            generarSupercopa();
        }
        if (gameState.supercopa) {
            if (s === 19 && gameState.supercopa.rondas[0]) {
                gameState.supercopa.rondas[0].partidos.forEach(function(p) {
                    if (p.local === gameState.team || p.visitante === gameState.team) {
                        var cond = p.local === gameState.team ? 'C' : 'V';
                        partidos.push({ competicion: 'Supercopa', rival: p.local === gameState.team ? p.visitante : p.local, condicion: cond, jugado: false, resultado: null, supercopaRondaIdx: 0, campoNeutral: true });
                    }
                });
            }
            if (s === 20 && gameState.supercopa.rondas[1] && gameState.supercopa.rondas[1].partidos.length > 0) {
                gameState.supercopa.rondas[1].partidos.forEach(function(p) {
                    if (p.local === gameState.team || p.visitante === gameState.team) {
                        var cond = p.local === gameState.team ? 'C' : 'V';
                        partidos.push({ competicion: 'Supercopa', rival: p.local === gameState.team ? p.visitante : p.local, condicion: cond, jugado: false, resultado: null, supercopaRondaIdx: 1, campoNeutral: true });
                    }
                });
            }
        }

        var rival = rivales[(s - 1) % rivales.length];
        var cond = (s % 2 === 1) ? 'C' : 'V';
        partidos.push({ competicion: 'LaLiga', rival: rival, condicion: cond, jugado: false, resultado: null });

        gameState.calendario.push({ semana: s, partidos: partidos });
    }
    gameState.calendarioGenerado = true;
    generarFixture();
}

function renderCalendario() {
    var container = document.getElementById('calendarioList');
    if (!container) return;
    if (!gameState.calendario || gameState.calendario.length === 0) generarCalendario();
    if (gameState.squad && gameState.squad.length === 0) { container.innerHTML = '<div style="color:#64748b;text-align:center;padding:20px;">Inicia una partida para ver el calendario.</div>'; return; }

    var currentWeek = gameState.matchday || 1;
    var resultados = [], proximos = [], semanaActual = null;

    for (var s = 0; s < gameState.calendario.length; s++) {
        var semana = gameState.calendario[s];
        for (var p = 0; p < semana.partidos.length; p++) {
            var partido = JSON.parse(JSON.stringify(semana.partidos[p]));
            partido.semana = semana.semana;
            if (semana.semana === currentWeek) {
                semanaActual = partido;
            } else if (partido.jugado) {
                if (partido.competicion === 'LaLiga') resultados.push(partido);
            } else {
                if (partido.competicion === 'LaLiga') proximos.push(partido);
            }
        }
    }
    resultados.reverse();

    var compBadge = function(c) {
        if (c === 'LaLiga') return '<span class="comp-badge laliga">LIGA</span>';
        if (c === 'Copa') return '<span class="comp-badge copa">COPA</span>';
        return '<span class="comp-badge champions">UCL</span>';
    };
    var condIcon = function(c) { return c === 'C' ? '<i class="fa-solid fa-house" style="color:#22c55e;"></i>' : '<i class="fa-solid fa-arrow-right" style="color:#f97316;"></i>'; };
    var resBadge = function(gf, gc) {
        if (gf > gc) return '<span class="result-badge victoria">' + gf + '-' + gc + ' <i class="fa-solid fa-check" style="font-size:9px;"></i></span>';
        if (gf === gc) return '<span class="result-badge empate">' + gf + '-' + gc + ' <i class="fa-solid fa-minus" style="font-size:9px;"></i></span>';
        return '<span class="result-badge derrota">' + gf + '-' + gc + ' <i class="fa-solid fa-xmark" style="font-size:9px;"></i></span>';
    };

    var html = '';
    html += '<div class="cal-header"><i class="fa-solid fa-calendar-days"></i> CALENDARIO <span style="font-size:10px;color:#64748b;margin-left:auto;">Jornada ' + currentWeek + ' / ' + gameState.totalMatchdays + '</span></div>';

    if (semanaActual && !semanaActual.jugado) {
        html += '<div class="next-match-card">' +
            '<div class="next-match-header">' +
            condIcon(semanaActual.condicion) + ' ' + (semanaActual.condicion === 'C' ? 'LOCAL' : 'VISITANTE') +
            ' <span class="comp-badge ' + (semanaActual.competicion === 'Copa' ? 'copa' : 'laliga') + '" style="margin-left:6px;">' + (semanaActual.competicion === 'Copa' ? 'COPA' : 'LIGA') + '</span>' +
            '<span class="next-match-jornada">Jornada ' + semanaActual.semana + '</span></div>' +
            '<div class="next-match-team">' + (semanaActual.condicion === 'C' ? gameState.team : semanaActual.rival) + '</div>' +
            '<div class="next-match-vs">vs</div>' +
            '<div class="next-match-team">' + (semanaActual.condicion === 'V' ? gameState.team : semanaActual.rival) + '</div>' +
            '<div class="next-match-info"><i class="fa-solid fa-location-dot"></i> ' + gameState.stadium + ' <span class="result-badge pendiente" style="margin-left:auto;">\u23f3 Pendiente</span></div>' +
            '</div>';
    }

    if (resultados.length > 0) {
        html += '<div class="cal-section-title"><i class="fa-solid fa-clock-rotate-left"></i> RESULTADOS</div>';
        resultados.forEach(function(r) {
            var cls = r.golesFavor !== undefined && r.golesFavor > r.golesContra ? ' cal-row-win' : r.golesFavor !== undefined && r.golesFavor === r.golesContra ? ' cal-row-draw' : '';
            html += '<div class="cal-row' + cls + '">' +
                '<span class="cal-row-j">J' + r.semana + '</span>' +
                '<span class="cal-row-icon">' + condIcon(r.condicion) + '</span>' +
                '<span class="cal-row-rival">' + r.rival + '</span>' +
                resBadge(r.golesFavor, r.golesContra) +
                '</div>';
        });
    }

    if (proximos.length > 0) {
        html += '<div class="cal-section-title"><i class="fa-solid fa-clock"></i> PR\u00d3XIMOS PARTIDOS</div>';
        proximos.forEach(function(r) {
            html += '<div class="cal-row">' +
                '<span class="cal-row-j">J' + r.semana + '</span>' +
                '<span class="cal-row-icon">' + condIcon(r.condicion) + '</span>' +
                '<span class="cal-row-rival">' + r.rival + '</span>' +
                '<span class="result-badge pendiente">\u23f3 Pendiente</span></div>';
        });
    }

    container.innerHTML = html;
}

function getColorPosicion(pos, totalEquipos) {
    totalEquipos = totalEquipos || 20;
    if (totalEquipos === 22) {
        if (pos === 1 || pos === 2) return '#AAE139';
        if (pos >= 3 && pos <= 6) return '#49CB2B';
        if (pos >= 7 && pos <= 18) return '#BCBCBC';
        if (pos >= 19) return '#ED3B46';
        return '#BCBCBC';
    }
    if (pos === 1) return '#AAE139';
    if (pos >= 2 && pos <= 4) return '#49CB2B';
    if (pos === 5) return '#38D996';
    if (pos === 6) return '#5694D8';
    if (pos >= 7 && pos <= 17) return '#BCBCBC';
    if (pos >= 18 && pos <= 20) return '#ED3B46';
    return '#BCBCBC';
}

function calcularClasificacion(equipos, fixture, hastaJornada) {
    var stats = {};
    equipos.forEach(function(t){
        stats[t.name] = { nombre: t.name, rating: t.rating, pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, pts: 0 };
    });

    if (gameState.team && stats[gameState.team]) stats[gameState.team].rating = gameState.rating;

    for (var j = 0; j < fixture.length && j < hastaJornada; j++) {
        var jornada = fixture[j];
        if (!jornada) continue;
        for (var m = 0; m < jornada.partidos.length; m++) {
            var p = jornada.partidos[m];
            if (!p.jugado) continue;
            if (stats[p.local]) {
                stats[p.local].pj++;
                stats[p.local].gf += p.golesL;
                stats[p.local].gc += p.golesV;
                if (p.golesL > p.golesV) { stats[p.local].g++; stats[p.local].pts += 3; }
                else if (p.golesL === p.golesV) { stats[p.local].e++; stats[p.local].pts += 1; }
                else stats[p.local].p++;
            }
            if (stats[p.visitante]) {
                stats[p.visitante].pj++;
                stats[p.visitante].gf += p.golesV;
                stats[p.visitante].gc += p.golesL;
                if (p.golesV > p.golesL) { stats[p.visitante].g++; stats[p.visitante].pts += 3; }
                else if (p.golesV === p.golesL) { stats[p.visitante].e++; stats[p.visitante].pts += 1; }
                else stats[p.visitante].p++;
            }
        }
    }

    var tabla = [];
    for (var nom in stats) tabla.push(stats[nom]);

    tabla.sort(function(a, b){
        if (b.pts !== a.pts) return b.pts - a.pts;

        var h2hPtsA = 0, h2hPtsB = 0, h2hGFA = 0, h2hGFB = 0;
        for (var j = 0; j < fixture.length && j < hastaJornada; j++) {
            var jornada = fixture[j];
            if (!jornada) continue;
            for (var m = 0; m < jornada.partidos.length; m++) {
                var p = jornada.partidos[m];
                if (!p.jugado) continue;
                if (p.local === a.nombre && p.visitante === b.nombre) {
                    if (p.golesL > p.golesV) h2hPtsA += 3;
                    else if (p.golesL === p.golesV) { h2hPtsA += 1; h2hPtsB += 1; }
                    else h2hPtsB += 3;
                    h2hGFA += p.golesL; h2hGFB += p.golesV;
                } else if (p.local === b.nombre && p.visitante === a.nombre) {
                    if (p.golesV > p.golesL) h2hPtsA += 3;
                    else if (p.golesL === p.golesV) { h2hPtsA += 1; h2hPtsB += 1; }
                    else h2hPtsB += 3;
                    h2hGFA += p.golesV; h2hGFB += p.golesL;
                }
            }
        }
        if (h2hPtsA + h2hPtsB > 0 && h2hPtsA !== h2hPtsB) return h2hPtsB - h2hPtsA;
        if (h2hPtsA + h2hPtsB > 0 && h2hGFA !== h2hGFB) return h2hGFB - h2hGFA;

        var dgA = a.gf - a.gc;
        var dgB = b.gf - b.gc;
        if (dgB !== dgA) return dgB - dgA;
        return b.gf - a.gf;
    });

    return tabla;
}

function renderClasificacion() {
    var container = document.getElementById('clasificacionBody');
    var leyenda = document.getElementById('leyendaColores');
    if (!container) return;

    var paisSel = _torneoPaisActual || gameState.country;
    var ligaSel = _torneoLigaActual || gameState.league;

    var copas = obtenerCopasPais(paisSel);
    if (copas.indexOf(ligaSel) !== -1) {
        renderCopaEnClasificacion(ligaSel);
        return;
    }

    var thead = document.querySelector('#comp-clasificacion thead');
    if (thead) thead.style.display = '';

    if (!gameState.fixturesPorLiga || Object.keys(gameState.fixturesPorLiga).length === 0) {
        if (!gameState.fixture || gameState.fixture.length === 0) generarCalendario();
    }
    var equipos = Database.getTeams(paisSel, ligaSel);
    if (!equipos || equipos.length === 0) {
        container.innerHTML = '<tr><td colspan="9" style="color:#64748b;text-align:center;">No hay datos disponibles.</td></tr>';
        return;
    }

    var hasta = gameState.matchday || 38;
    var fixture = gameState.fixturesPorLiga[ligaSel] || gameState.fixture;
    var tabla = calcularClasificacion(equipos, fixture, hasta);

    var html = '';
    for (var i = 0; i < tabla.length; i++) {
        var t = tabla[i];
        var pos = i + 1;
        var color = getColorPosicion(pos, equipos.length);
        var esMiEquipo = (t.nombre === gameState.team);
        var estilo = 'border-left: 4px solid ' + color + ';' + (esMiEquipo ? 'background:#1e293b;' : '');

        html += '<tr style="' + estilo + ';cursor:pointer;" onclick="abrirPlantillaRival(\'' + t.nombre.replace(/'/g, "\\'") + '\')">' +
            '<td class="col-pos">' + pos + '</td>' +
            '<td class="col-equipo">' + (esMiEquipo ? '<strong>' + t.nombre + '</strong>' : t.nombre) + '</td>' +
            '<td>' + t.pj + '</td>' +
            '<td>' + t.g + '</td>' +
            '<td>' + t.e + '</td>' +
            '<td>' + t.p + '</td>' +
            '<td>' + t.gf + '</td>' +
            '<td>' + t.gc + '</td>' +
            '<td style="color:' + (t.gf - t.gc >= 0 ? '#22c55e' : '#ef4444') + ';font-weight:bold;">' + (t.gf - t.gc > 0 ? '+' : '') + (t.gf - t.gc) + '</td>' +
            '<td class="col-pts"><strong>' + t.pts + '</strong></td>' +
            '</tr>';
    }
    container.innerHTML = html;

    if (leyenda) {
        var es22 = equipos.length === 22;
        leyenda.innerHTML =
            '<div style="font-size:11px;color:#94a3b8;padding:6px 0;border-top:1px solid #1e293b;margin-top:4px;display:flex;gap:8px;flex-wrap:wrap;">' +
            (es22
                ? '<span style="border-left:4px solid #AAE139;padding-left:4px;">1º-2º Ascenso</span>' +
                  '<span style="border-left:4px solid #49CB2B;padding-left:4px;">3º-6º Playoffs</span>' +
                  '<span style="border-left:4px solid #BCBCBC;padding-left:4px;">7º-18º Perm.</span>' +
                  '<span style="border-left:4px solid #ED3B46;padding-left:4px;">19º-22º Descenso</span>'
                : '<span style="border-left:4px solid #AAE139;padding-left:4px;">1º Campeón+CL</span>' +
                  '<span style="border-left:4px solid #49CB2B;padding-left:4px;">2º-4º Champions</span>' +
                  '<span style="border-left:4px solid #38D996;padding-left:4px;">5º Europa L.</span>' +
                  '<span style="border-left:4px solid #5694D8;padding-left:4px;">6º Conf. L.</span>' +
                  '<span style="border-left:4px solid #BCBCBC;padding-left:4px;">7º-17º Perm.</span>' +
                  '<span style="border-left:4px solid #ED3B46;padding-left:4px;">18º-20º Descenso</span>') +
            '</div>';
    }

    // Columna derecha: top goleadores y asistentes
    var colStats = document.getElementById('colStats');
    if (colStats) {
        var pais = _torneoPaisActual || gameState.country;
        var liga = _torneoLigaActual || gameState.league;
        var eqs = Database.getTeams(pais, liga);
        var goleadores = [], asistentes = [], porteros = [];
        var tablaZamora = fixture ? calcularClasificacion(eqs, fixture, hasta) : [];
        eqs.forEach(function(eq) {
            var sq = obtenerSquadEquipo(eq.name) || [];
            var equipoGC = 0;
            for (var zt = 0; zt < tablaZamora.length; zt++) { if (tablaZamora[zt].nombre === eq.name) { equipoGC = tablaZamora[zt].gc; break; } }
            sq.forEach(function(j) {
                var st = j.statsTemporada || {};
                if ((st.goles || 0) > 0) goleadores.push({ nombre: j.name, val: st.goles, pos: j.pos, equipo: eq.name });
                if ((st.asistencias || 0) > 0) asistentes.push({ nombre: j.name, val: st.asistencias, pos: j.pos, equipo: eq.name });
                if (j.pos === 'PO' && (st.partidos || 0) >= 10) {
                    var promedio = equipoGC > 0 && st.partidos > 0 ? (equipoGC / st.partidos) : 0;
                    porteros.push({ nombre: j.name, val: promedio, pos: j.pos, pj: st.partidos, equipo: eq.name, gc: equipoGC });
                }
            });
        });
        goleadores.sort(function(a, b) { return b.val - a.val; });
        asistentes.sort(function(a, b) { return b.val - a.val; });
        porteros.sort(function(a, b) { return a.val - b.val; });

        function renderTopJugadores(lista, label, icono, opts) {
            var top = lista.slice(0, 5);
            if (top.length === 0) return '';
            var h = '<div class="colStats-card"><div class="colStats-title">' + icono + ' ' + label + '</div>';
            top.forEach(function(j, idx) {
                var valorDisplay = opts && opts.esDecimal ? j.val.toFixed(2) : j.val;
                h += '<div class="colStats-item">' +
                    '<span style="color:#64748b;min-width:16px;">' + (idx + 1) + '.</span>' +
                    (j.pos ? '<span class="pos-badge" style="font-size:8px;width:20px;padding:1px 0;">' + j.pos + '</span> ' : '') +
                    '<span style="flex:1;">' + j.nombre + ' <span style="color:#94a3b8;font-size:9px;">(' + j.equipo + ')</span></span>' +
                    '<span style="color:#6ee7b7;font-weight:bold;">' + valorDisplay + '</span></div>';
            });
            h += '</div>';
            return h;
        }

        colStats.innerHTML = renderTopJugadores(goleadores, 'MAXIMOS GOLEADORES', '⚽') +
            renderTopJugadores(asistentes, 'MAXIMOS ASISTENTES', '👟') +
            renderTopJugadores(porteros, 'TROFEO ZAMORA', '🧤', { esDecimal: true });
    }
}

function renderCopaEnClasificacion(nombreCopa) {
    var europeas = ['Champions League', 'Europa League', 'Conference League'];
    var esEuropea = europeas.indexOf(nombreCopa) !== -1;
    var esSupercopa = nombreCopa === 'Supercopa de España';

    var thead = document.querySelector('#comp-clasificacion thead');
    if (thead) thead.style.display = 'none';
    var container = document.getElementById('clasificacionBody');
    var leyenda = document.getElementById('leyendaColores');
    var colStats = document.getElementById('colStats');
    if (leyenda) leyenda.innerHTML = '';
    if (colStats) colStats.innerHTML = '';

    if (esEuropea) {
        var paisSel = _torneoPaisActual || gameState.country;
        var ligaSel = _torneoLigaActual || gameState.league;
        var cls = calcularClasificadosEuropeos(paisSel, ligaSel);
        var iconos = { 'Champions League': '<i class="fa-solid fa-star" style="color:#eab308;"></i>', 'Europa League': '<i class="fa-solid fa-star" style="color:#f97316;"></i>', 'Conference League': '<i class="fa-solid fa-star" style="color:#22c55e;"></i>' };
        var colores = { 'Champions League': '#3b82f6', 'Europa League': '#f97316', 'Conference League': '#22c55e' };
        var listas = { 'Champions League': cls.champions, 'Europa League': cls.europa, 'Conference League': cls.conference };
        var clasificados = listas[nombreCopa] || [];

        var html = '<tr><td colspan="9" style="padding:6px 0;">';
        html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;border-bottom:1px solid #1e293b;padding-bottom:6px;">';
        html += (iconos[nombreCopa] || '<i class="fa-solid fa-trophy"></i>') + ' <span style="font-size:13px;color:' + (colores[nombreCopa] || '#38bdf8') + ';font-weight:bold;">' + nombreCopa + '</span></div>';

        if (clasificados.length === 0) {
            html += '<div style="color:#64748b;font-size:12px;text-align:center;padding:15px;">No hay clasificados esta temporada.</div>';
        } else {
            var fixture = gameState.fixturesPorLiga[ligaSel] || gameState.fixture;
            var equipos = Database.getTeams(paisSel, ligaSel);
            var tabla = fixture ? calcularClasificacion(equipos || [], fixture, gameState.totalMatchdays || 38) : [];
            html += '<div style="font-size:10px;color:#94a3b8;margin-bottom:4px;">CLASIFICADOS ' + (gameState.currentDate.match(/Temporada (\d{4}-\d{2})/) || ['', ''])[1] + '</div>';
            clasificados.forEach(function(n) {
                var pos = '';
                var pts = '';
                for (var i = 0; i < tabla.length; i++) {
                    if (tabla[i].nombre === n) { pos = i + 1; pts = tabla[i].pts; break; }
                }
                html += '<div style="display:flex;align-items:center;gap:6px;padding:3px 4px;background:#0f172a;border-radius:4px;margin-bottom:2px;border-left:3px solid ' + (colores[nombreCopa] || '#38bdf8') + ';">' +
                    '<span style="font-size:10px;color:#64748b;min-width:20px;">' + (pos ? pos + '\u00ba' : '') + '</span>' +
                    '<span style="font-size:12px;color:#e2e8f0;flex:1;">' + n + '</span>' +
                    '<span style="font-size:10px;color:#6ee7b7;font-weight:bold;">' + (pts ? pts + ' pts' : '') + '</span></div>';
            });
        }
        html += '<div style="margin-top:10px;padding:8px;background:#0f172a;border:1px solid #334155;border-radius:6px;text-align:center;font-size:10px;color:#64748b;">';
        html += '<i class="fa-solid fa-info-circle"></i> Competici\u00f3n inactiva \u2014 disponible en pr\u00f3ximas actualizaciones al a\u00f1adir m\u00e1s ligas.</div>';
        html += '</td></tr>';
        container.innerHTML = html;
        return;
    }

    var esPlayoff = nombreCopa === 'Playoff Ascenso';
    var copaData = esSupercopa ? gameState.supercopa : esPlayoff ? gameState.playoff : gameState.copa;
    if (!esSupercopa && !esPlayoff && !gameState.copa) generarCuadroCopa();
    copaData = esSupercopa ? gameState.supercopa : esPlayoff ? gameState.playoff : gameState.copa;

    if (!copaData || !copaData.rondas) {
        var msg = esSupercopa ? 'La Supercopa de Espa\u00f1a se disputar\u00e1 a partir de la segunda temporada.' : 'No hay datos disponibles.';
        container.innerHTML = '<tr><td colspan="9" style="padding:20px;text-align:center;color:#64748b;font-size:12px;">' + msg + '</td></tr>';
        return;
    }

    var html = '<tr><td colspan="9" style="padding:6px 0;">';
    html += '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:4px;">';
    copaData.rondas.forEach(function(r, idx) {
        var act = idx === _copaFilterRound ? ' active' : '';
        html += '<div class="torneo-torneo-btn' + act + '" onclick="filtrarRondaCopa(' + idx + ')" style="font-size:8px;padding:4px 6px;">' + r.nombre + '</div>';
    });
    html += '</div>';
    html += '<div style="width:340px;height:248px;overflow-y:auto;">' + buildCopaBracketHTML(copaData, _copaFilterRound) + '</div>';
    html += '</td></tr>';
    container.innerHTML = html;
}

function filtrarRondaCopa(idx) {
    _copaFilterRound = idx;
    renderCopaEnClasificacion(_torneoLigaActual);
}

var _cachedSquads = {};
var _presupuestosCPU = {};

function switchMercadoSubTab(btn, tabId) {
    document.querySelectorAll('#tab-mercado .mercado-subtab').forEach(function(t){ t.style.display = 'none'; });
    document.getElementById(tabId).style.display = 'flex';
    document.querySelectorAll('#tab-mercado .btn-retro.btn-sm').forEach(function(b){ b.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    if (tabId === 'mercado-buscar') renderMercado();
    if (tabId === 'mercado-transferibles') renderMercadoTransferibles();
    if (tabId === 'mercado-cedibles') renderMercadoCedibles();
    if (tabId === 'mercado-historial') renderHistorial();
}

var _historialFiltro = 'todos';

function switchHistorialFiltro(btn, filtro) {
    _historialFiltro = filtro;
    document.querySelectorAll('#mercado-historial .btn-retro.btn-sm').forEach(function(b){ b.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    renderHistorial();
}

function switchCompSubTab(btn, tabId) {
    document.querySelectorAll('#tab-competiciones .comp-subtab').forEach(function(t){ t.style.display = 'none'; });
    document.getElementById(tabId).style.display = 'flex';
    document.querySelectorAll('#tab-competiciones .btn-retro.btn-sm').forEach(function(b){ b.classList.remove('active'); });
    if (btn) btn.classList.add('active');
}

var _torneoPaisActual = null;
var _torneoLigaActual = null;
var _copaFilterRound = 0;

function obtenerCopasPais(pais) {
    var copas = [];
    if (pais === 'España') copas = ['Copa del Rey', 'Supercopa de España', 'Champions League', 'Europa League', 'Conference League'];
    else if (pais === 'Inglaterra') copas = ['FA Cup', 'Champions League', 'Europa League', 'Conference League'];
    else if (pais === 'Italia') copas = ['Coppa Italia', 'Champions League', 'Europa League', 'Conference League'];
    else return [];
    if (gameState.playoff) copas.push('Playoff Ascenso');
    return copas;
}

function calcularClasificadosEuropeos(pais, liga) {
    var equipos = Database.getTeams(pais, liga);
    if (!equipos || equipos.length < 4) return { champions: [], europa: [], conference: [] };
    var fixture = gameState.fixturesPorLiga[liga] || gameState.fixture;
    var tabla = fixture ? calcularClasificacion(equipos, fixture, gameState.totalMatchdays || 38) : [];
    if (tabla.length === 0 || tabla.every(function(t) { return t.pj === 0; })) {
        tabla = equipos.slice().sort(function(a, b) { return (b.rating || 75) - (a.rating || 75); });
        tabla = tabla.map(function(t) { return { nombre: t.name, pts: 0 }; });
    }
    var champions = [], europa = [], conference = [];

    if (tabla.length >= 4) {
        for (var i = 0; i < 4; i++) champions.push(tabla[i].nombre);
        var copaCampeon = null;
        if (pais === 'España') copaCampeon = gameState.copa ? gameState.copa.campeon : null;
        else if (pais === 'Inglaterra') copaCampeon = gameState.copa ? gameState.copa.campeon : null;
        else if (pais === 'Italia') copaCampeon = gameState.copa ? gameState.copa.campeon : null;

        var europaSlot = tabla.length > 4 ? tabla[4].nombre : null;
        if (copaCampeon && champions.indexOf(copaCampeon) === -1 && europa.indexOf(copaCampeon) === -1) {
            europa.push(copaCampeon);
            if (tabla.length > 4 && tabla[4].nombre !== copaCampeon) europa.push(tabla[4].nombre);
        } else {
            if (tabla.length > 4) europa.push(tabla[4].nombre);
            if (tabla.length > 5) europa.push(tabla[5].nombre);
        }

        var confSlot = tabla.length > 5 ? tabla[5].nombre : null;
        if (europa.indexOf(confSlot) !== -1 && tabla.length > 6) confSlot = tabla[6].nombre;
        if (confSlot) conference.push(confSlot);
    }
    return { champions: champions, europa: europa, conference: conference };
}

function generarSupercopa() {
    var clas = gameState._supercopaClasificados;
    if (!clas || clas.length < 4) return;
    var sf1 = { local: clas[0], visitante: clas[3], resultado: null };
    var sf2 = { local: clas[2], visitante: clas[1], resultado: null };
    var m = gameState.currentDate.match(/Temporada (\d{4}-\d{2})/);
    var seasonStr = m ? m[1] : '2026-27';
    gameState.supercopa = {
        rondas: [
            { nombre: 'Semifinal', orden: 0, partidos: [sf1, sf2], completada: false },
            { nombre: 'Final', orden: 1, partidos: [], completada: false }
        ],
        campeon: null,
        temporada: seasonStr
    };
    gameState._supercopaClasificados = null;
}

function simularRondaSupercopa(orden) {
    if (!gameState.supercopa) return;
    var ronda = gameState.supercopa.rondas[orden];
    if (!ronda || ronda.completada || ronda.partidos.length === 0) return;
    var ganadores = [];
    ronda.partidos.forEach(function(p) {
        if (p.resultado) {
            var gan = p.resultado.golesL > p.resultado.golesV ? p.local : p.visitante;
            ganadores.push(gan);
            return;
        }
        var res = simularPartidoCopa(p.local, p.visitante);
        p.resultado = res;
        var ganador = res.golesL > res.golesV ? p.local : p.visitante;
        ganadores.push(ganador);
    });
    ronda.completada = true;

    if (orden === 0) {
        ronda.partidos.forEach(function(p) {
            if (p.local === gameState.team || p.visitante === gameState.team) {
                gameState.budget += 1.5;
            }
        });
    }

    if (orden < gameState.supercopa.rondas.length - 1) {
        var sigRonda = gameState.supercopa.rondas[orden + 1];
        for (var i = 0; i < ganadores.length; i += 2) {
            if (i + 1 < ganadores.length) {
                sigRonda.partidos.push({ local: ganadores[i], visitante: ganadores[i + 1], resultado: null });
            }
        }
    } else {
        gameState.supercopa.campeon = ganadores[0] || null;
        if (gameState.supercopa.campeon) {
            var partidoFinal = ronda.partidos[0];
            if (partidoFinal && partidoFinal.resultado) {
                var perdedor = partidoFinal.resultado.golesL > partidoFinal.resultado.golesV ? partidoFinal.visitante : partidoFinal.local;
                if (perdedor === gameState.team) gameState.budget += 1.0;
                if (gameState.supercopa.campeon === gameState.team) gameState.budget += 2.0;
            }
            var m = gameState.currentDate.match(/Temporada (\d{4}-\d{2})/);
            var seasonStr = m ? m[1] : '2026-27';
            registrarTitulo(gameState.supercopa.campeon, 'Supercopa de España', seasonStr);
            enviarMensaje('Real Federación Española', '\ud83c\udfc6 Campe\u00f3n de la Supercopa',
                '\u00a1' + gameState.supercopa.campeon + ' se proclama campe\u00f3n de la Supercopa de Espa\u00f1a ' + seasonStr + '!');
        }
    }
}

function renderTorneoPaises() {
    var container = document.getElementById('torneoPaises');
    if (!container) return;
    var paises = Database.getCountries();
    var html = '';
    paises.forEach(function(p) {
        var active = p.name === _torneoPaisActual ? ' active' : '';
        html += '<div class="torneo-pais-btn' + active + '" onclick="seleccionarPaisClasif(\'' + p.name.replace(/'/g,"\\'") + '\')">' +
            p.icon + ' ' + p.name + '</div>';
    });
    container.innerHTML = html;
}

function renderTorneoTorneos() {
    var container = document.getElementById('torneoTorneos');
    if (!container) return;
    var ligas = Database.getLeagues(_torneoPaisActual);
    var html = '';
    ligas.forEach(function(l) {
        var active = l.name === _torneoLigaActual ? ' active' : '';
        html += '<div class="torneo-torneo-btn' + active + '" onclick="seleccionarLigaClasif(\'' + l.name.replace(/'/g,"\\'") + '\')">' +
            '<i class="fa-solid fa-table"></i> ' + l.name + '</div>';
    });
    var copas = obtenerCopasPais(_torneoPaisActual);
    copas.forEach(function(c) {
        var active = c === _torneoLigaActual ? ' active' : '';
        html += '<div class="torneo-torneo-btn' + active + '" onclick="seleccionarLigaClasif(\'' + c.replace(/'/g,"\\'") + '\')">' +
            '<i class="fa-solid fa-trophy"></i> ' + c + '</div>';
    });
    container.innerHTML = html;
}

function seleccionarPaisClasif(pais) {
    _torneoPaisActual = pais;
    _torneoLigaActual = null;
    var ligas = Database.getLeagues(pais);
    if (ligas.length > 0) _torneoLigaActual = ligas[0].name;
    renderTorneoPaises();
    renderTorneoTorneos();
    renderClasificacion();
}

function seleccionarLigaClasif(liga) {
    _torneoLigaActual = liga;
    _copaFilterRound = 0;
    renderTorneoTorneos();
    renderClasificacion();
}

function renderTacticPitch() {
    var squad = gameState.squad;
    if (!squad || squad.length === 0) return;

    if (!_tacticInitDone) {
        autocompletarFormacion(getFormacionActiva());
        _tacticInitDone = true;
    }

    var org = organizarPlantilla();
    var xi = org.xi;
    if (!xi || xi.length === 0) return;

    function staminaColor(s) {
        var n = parseInt(s);
        if (isNaN(n)) return '#22c55e';
        if (n >= 90) return '#22c55e';
        if (n >= 70) return '#eab308';
        return '#ef4444';
    }

    var formation = getFormacionActiva();
    var slotLabels = getSlotLabels(formation);

    var xiEl = document.getElementById('tacticXIList');
    if (!xiEl) return;
    var html = '<div style="font-size:11px;color:#38bdf8;padding:4px 2px;border-bottom:1px solid #1e293b;margin-bottom:2px;">XI TITULAR (' + xi.length + ')</div>';
    xi.forEach(function(p, idx){
        var slotPos = slotLabels[idx] || p.pos;
        var sel = seleccionID === p.id ? ' selected-pin' : '';
        var color = getColorLinea(slotPos);
        var badge = '<span class="pos-badge" style="background:' + color + ';color:#fff;font-size:11px;width:32px;padding:2px 0;">' + slotPos + '</span>';
        var stam = p.stamina || '100%';
        var stamCol = staminaColor(stam);
        var capIcon = (p.id === gameState.capitanId) ? ' <span style="color:#eab308;font-size:11px;"><i class="fa-solid fa-star"></i></span>' : '';
        html += '<div class="tactic-list-item' + sel + '" data-pid="' + p.id + '">' +
            '<span style="font-size:11px;color:#e2e8f0;min-width:24px;">' + (p.dorsal || '-') + '</span> ' +
            badge + ' ' +
            '<span class="p-name" style="flex:1;font-size:12px;color:#e2e8f0;"> ' + p.name + getEstadoIcono(p) + getMoralIcon(p) + capIcon + '</span>' +
            '<span style="font-size:11px;color:#6ee7b7;">(' + p.rating + ')</span>' +
            '<span style="font-size:11px;color:' + stamCol + ';min-width:40px;text-align:right;">⚡ ' + stam + '</span></div>';
    });
    xiEl.innerHTML = html;
    xiEl.querySelectorAll('.tactic-list-item').forEach(function(el){
        el.onclick = function(){ onTacticPlayerClick(parseInt(this.dataset.pid)); };
    });
    renderTeamRating();
}

function getSlotLabels(formation) {
    var map = {
        '4-4-2 Estándar': ['POR','LI','DFC','DFC','LD','MI','MC','MC','MD','DC','DC'],
        '4-3-3 Defensivo': ['POR','LI','DFC','DFC','LD','MC','MCD','MC','EI','DC','ED'],
        '4-2-3-1':        ['POR','LI','DFC','DFC','LD','MCD','MCD','MCO','EI','DC','ED'],
        '3-4-3':          ['POR','DFC','DFC','DFC','MI','MC','MC','MD','EI','DC','ED'],
        '4-4-2 Diamante': ['POR','LI','DFC','DFC','LD','MCD','MC','MC','MCO','DC','DC'],
        '4-1-4-1':        ['POR','LI','DFC','DFC','LD','MCD','MI','MC','MC','MD','DC'],
        '5-3-2 Defensivo': ['POR','LI','DFC','DFC','DFC','LD','MC','MCD','MC','DC','DC']
    };
    return map[formation] || map['4-4-2 Estándar'];
}

function getColorLinea(pos) {
    if (pos === 'PO' || pos === 'POR') return '#8b5cf6';
    if (['DFC','LI','LD','CAI','CAD'].indexOf(pos) !== -1) return '#ef4444';
    if (['MCD','MC','MCO','MI','MD'].indexOf(pos) !== -1) return '#f97316';
    if (['EI','ED','DC'].indexOf(pos) !== -1) return '#22c55e';
    return '#64748b';
}

function renderTacticLists() {
    var list = document.getElementById('tacticRightList');
    if (!list) return;
    var org = organizarPlantilla();

    function renderPlayer(p) {
        var sel = seleccionID === p.id ? ' selected-pin' : '';
        var color = getColorLinea(p.pos);
        var badge = '<span class="pos-badge" style="background:' + color + ';color:#fff;font-size:11px;width:32px;padding:2px 0;">' + p.pos + '</span>';
        var stam = p.stamina || '100%';
        var n = parseInt(stam);
        var stamCol = n >= 90 ? '#22c55e' : n >= 70 ? '#eab308' : '#ef4444';
        var capIcon = (p.id === gameState.capitanId) ? ' <span style="color:#eab308;font-size:10px;"><i class="fa-solid fa-star"></i></span>' : '';
        return '<div class="tactic-list-item' + sel + '" data-pid="' + p.id + '">' +
            '<span style="font-size:11px;color:#e2e8f0;min-width:24px;">' + (p.dorsal || '-') + '</span> ' +
            badge + ' ' +
            '<span class="p-name" style="flex:1;font-size:12px;color:#e2e8f0;"> ' + p.name + getEstadoIcono(p) + getMoralIcon(p) + capIcon + '</span>' +
            '<span style="font-size:11px;color:#6ee7b7;">(' + p.rating + ')</span>' +
            '<span style="font-size:11px;color:' + stamCol + ';min-width:40px;text-align:right;">⚡ ' + stam + '</span></div>';
    }

    var html = '';
    if (org.subs.length > 0) {
        html += '<div style="font-size:11px;color:#38bdf8;padding:4px 2px;border-bottom:1px solid #1e293b;margin-bottom:2px;">SUPLENTES (' + org.subs.length + ')</div>';
        org.subs.forEach(function (p) { html += renderPlayer(p); });
    }
    if (org.reserves.length > 0) {
        html += '<div style="font-size:11px;color:#64748b;padding:4px 2px;border-bottom:1px solid #1e293b;border-top:1px solid #1e293b;margin-top:4px;">RESERVAS / DESCONVOCADOS</div>';
        org.reserves.forEach(function (p) { html += renderPlayer(p); });
    }
    list.innerHTML = html;
    list.querySelectorAll('.tactic-list-item[data-pid]').forEach(function (el) {
        el.onclick = function () { onTacticPlayerClick(parseInt(this.dataset.pid)); };
    });
}



function getFormacionActiva() {
    return gameState.formacion || '4-4-2 Estándar';
}
function getPresionActiva() {
    return gameState.estiloPresion || 'pesada';
}

function buscarPorId(id) {
    return (gameState.squad || []).find(function(p) { return p.id === id; });
}

function actualizarDisplayCapitan() {
    var el = document.getElementById('capitanDisplay');
    if (!el) return;
    if (gameState.capitanId) {
        var p = buscarPorId(gameState.capitanId);
        el.innerText = p ? p.name : '-- Sin capitán';
    } else {
        el.innerText = '-- Sin capitán';
    }
}

function actualizarDisplayPresion() {
    var el = document.getElementById('presionDisplay');
    if (!el) return;
    var colores = { suave: '#22c55e', pesada: '#eab308', extrema: '#ef4444' };
    var labels = { suave: 'Suave', pesada: 'Pesada', extrema: 'Extrema' };
    var v = getPresionActiva();
    el.style.color = colores[v] || '#e2e8f0';
    el.innerText = labels[v] || 'Pesada';
}

function actualizarDisplayFormacion() {
    var el = document.getElementById('formacionDisplay');
    if (!el) return;
    el.innerText = getFormacionActiva();
}

var _dropdownTipo = null;

function abrirDropdown(e, tipo) {
    e.stopPropagation();
    var dropdown = document.getElementById('tacticDropdown');
    var list = document.getElementById('tacticDropdownList');
    if (!dropdown || !list) return;

    if (_dropdownTipo === tipo && dropdown.style.display === 'block') {
        cerrarDropdown();
        return;
    }

    var card = e.currentTarget;
    var tab = document.getElementById('tab-tacticas');
    var tabRect = tab.getBoundingClientRect();
    var cardRect = card.getBoundingClientRect();

    dropdown.style.left = (cardRect.left - tabRect.left) + 'px';
    dropdown.style.top = (cardRect.bottom - tabRect.top + 2) + 'px';
    dropdown.style.width = cardRect.width + 'px';

    list.innerHTML = '';
    if (tipo === 'capitan') {
        var org = organizarPlantilla();
        var xi = org.xi || [];
        if (xi.length === 0) {
            var empty = document.createElement('div');
            empty.className = 'tactic-dropdown-item';
            empty.style.color = '#94a3b8';
            empty.innerText = 'No hay jugadores disponibles';
            list.appendChild(empty);
        }
        var currentCap = gameState.capitanId;
        xi.forEach(function(p) {
            var item = document.createElement('div');
            item.className = 'tactic-dropdown-item';
            if (p.id === currentCap) item.classList.add('selected');
            item.innerHTML = p.name + ' <span style="color:#94a3b8;font-size:11px;">' + p.pos + '</span>';
            item.dataset.value = p.id;
            item.onclick = function(ev) { ev.stopPropagation(); seleccionarOpcionDropdown('capitan', parseInt(this.dataset.value)); };
            list.appendChild(item);
        });
    } else if (tipo === 'presion') {
        var opts = [
            { value: 'suave', label: 'Suave', color: '#22c55e' },
            { value: 'pesada', label: 'Pesada', color: '#eab308' },
            { value: 'extrema', label: 'Extrema', color: '#ef4444' }
        ];
        var currentPres = getPresionActiva();
        opts.forEach(function(o) {
            var item = document.createElement('div');
            item.className = 'tactic-dropdown-item';
            if (o.value === currentPres) item.classList.add('selected');
            item.style.color = o.color;
            item.innerText = o.label;
            item.dataset.value = o.value;
            item.onclick = function(ev) { ev.stopPropagation(); seleccionarOpcionDropdown('presion', this.dataset.value); };
            list.appendChild(item);
        });
    } else if (tipo === 'formacion') {
        var formaciones = ['4-4-2 Estándar','4-3-3 Defensivo','4-2-3-1','3-4-3','4-4-2 Diamante','4-1-4-1','5-3-2 Defensivo'];
        var currentForm = getFormacionActiva();
        formaciones.forEach(function(f) {
            var item = document.createElement('div');
            item.className = 'tactic-dropdown-item';
            if (f === currentForm) item.classList.add('selected');
            item.innerText = f;
            item.dataset.value = f;
            item.onclick = function(ev) { ev.stopPropagation(); seleccionarOpcionDropdown('formacion', this.dataset.value); };
            list.appendChild(item);
        });
    }

    dropdown.style.display = 'block';
    _dropdownTipo = tipo;
}

function cerrarDropdown() {
    var dropdown = document.getElementById('tacticDropdown');
    if (dropdown) dropdown.style.display = 'none';
    var matchDd = document.getElementById('matchTacticDropdown');
    if (matchDd) matchDd.style.display = 'none';
    _dropdownTipo = null;
}

function seleccionarOpcionDropdown(tipo, valor) {
    if (tipo === 'capitan') {
        gameState.capitanId = valor;
        actualizarDisplayCapitan();
        renderTacticPitch();
        renderTacticLists();
    } else if (tipo === 'presion') {
        gameState.estiloPresion = valor;
        actualizarDisplayPresion();
    } else if (tipo === 'formacion') {
        gameState.formacion = valor;
        seleccionID = null;
        _tacticInitDone = false;
        actualizarDisplayFormacion();
        renderTacticPitch();
        renderTacticLists();
        actualizarDisplayCapitan();
    }
    cerrarDropdown();
}

document.addEventListener('click', function(e) {
    var dd = document.getElementById('tacticDropdown');
    if (dd && dd.style.display === 'block' && !dd.contains(e.target) && !e.target.closest('.tactic-card') && !e.target.closest('.match-tactic-card')) {
        cerrarDropdown();
    }
    var fd = document.getElementById('filterDropdown');
    if (fd && fd.style.display === 'block' && !fd.contains(e.target) && !e.target.closest('.filter-btn')) {
        cerrarFiltroDropdown();
    }
});




function onTacticPlayerClick(pid) {
    if (seleccionID === null) {
        seleccionID = pid;
        renderTacticPitch();
        renderTacticLists();
        return;
    }
    if (seleccionID === pid) {
        seleccionID = null;
        renderTacticPitch();
        renderTacticLists();
        return;
    }
    var squad = gameState.squad;
    var p1 = null, p2 = null;
    for (var i = 0; i < squad.length; i++) {
        if (squad[i].id === seleccionID) p1 = squad[i];
        if (squad[i].id === pid) p2 = squad[i];
    }
    if (p1 && p2) {
        var tg = p1.grupo;
        p1.grupo = p2.grupo;
        p2.grupo = tg;
    }
    seleccionID = null;
    renderTacticPitch();
    renderTacticLists();
    renderTeamRating();
    actualizarDisplayCapitan();
}
window.onTacticPlayerClick = onTacticPlayerClick;

function renderTacticas() {
    seleccionID = null;
    renderTacticPitch();
    renderTacticLists();
    actualizarDisplayCapitan();
    actualizarDisplayPresion();
    actualizarDisplayFormacion();
    renderTeamRating();
}

function renderTeamRating() {
    var el = document.getElementById('teamRatingDisplay');
    if (!el) return;
    var r = calcularRatingEquipo();
    el.innerHTML =
        '<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr 1fr;gap:4px;text-align:center;">' +
        '<div><span style="font-size:13px;color:#94a3b8;">GLO</span><br><span style="font-size:22px;color:#38bdf8;">' + r.glo + '</span></div>' +
        '<div><span style="font-size:13px;color:#94a3b8;">POR</span><br><span style="font-size:22px;color:#7c3aed;">' + r.por + '</span></div>' +
        '<div><span style="font-size:13px;color:#94a3b8;">DEF</span><br><span style="font-size:22px;color:#b91c1c;">' + r.def + '</span></div>' +
        '<div><span style="font-size:13px;color:#94a3b8;">MED</span><br><span style="font-size:22px;color:#ea580c;">' + r.med + '</span></div>' +
        '<div><span style="font-size:13px;color:#94a3b8;">ATA</span><br><span style="font-size:22px;color:#15803d;">' + r.ata + '</span></div>' +
        '</div>';
}

function seleccionarGoleador(jugadoresEnCampo) {
    if (!jugadoresEnCampo || jugadoresEnCampo.length === 0) return null;
    var pesos = { DC: 65, EI: 65, ED: 65, MC: 25, MCD: 25, MCO: 25, MI: 25, MD: 25, DFC: 10, LI: 10, LD: 10, CAI: 10, CAD: 10, PO: 0 };
    var total = 0;
    var candidatos = [];
    jugadoresEnCampo.forEach(function(p) {
        if (p.pos !== 'PO') {
            candidatos.push(p);
            total += (pesos[p.pos] || 20);
        }
    });
    if (candidatos.length === 0) return null;
    var r = Math.random() * total;
    var acc = 0;
    for (var i = 0; i < candidatos.length; i++) {
        acc += (pesos[candidatos[i].pos] || 20);
        if (r <= acc) return candidatos[i];
    }
    return candidatos[candidatos.length - 1];
}

var _sel1 = null, _sel2 = null; // { id, grupo } donde grupo = 'T' titular o 'S' suplente

function mostrarMenuDescanso(matchState) {
    document.getElementById('matchCommentary').style.display = 'none';
    document.getElementById('btnContinueMatch').style.display = 'none';
    var menu = document.getElementById('halfTimeMenu');
    menu.style.display = 'flex';
    document.getElementById('subsRestantes').innerText = matchState.sustitucionesRestantes;
    document.getElementById('btnContinuarSegundaParte').style.display = '';
    document.getElementById('btnGuardarPartida').style.display = 'none';
    document.getElementById('btnSalirMenu').style.display = 'none';

    document.getElementById('gameSidebarNav').style.display = 'none';
    document.getElementById('matchSidebar').style.display = 'flex';
    document.getElementById('matchFormacionDisplay').innerText = gameState.formacion || '4-4-2 Estándar';
    var presLabels = { suave: '\ud83d\udfe2 Suave', pesada: '\ud83d\udfe1 Pesada', extrema: '\ud83d\udd34 Extrema' };
    document.getElementById('matchPresionDisplay').innerText = presLabels[gameState.estiloPresion] || '\ud83d\udfe1 Pesada';

    var titulares = matchState.jugadoresEnCampo.slice();
    var enCampoIds = {};
    matchState.jugadoresEnCampo.forEach(function(p) { enCampoIds[p.id] = true; });
    var slotLabels = getSlotLabels(matchState.formacionUsada || gameState.formacion || '4-4-2 Estándar');
    var noUsados = [];
    if (gameState.squad) {
        gameState.squad.forEach(function(p) {
            if (!enCampoIds[p.id]) noUsados.push(p);
        });
    }

    function badgeHTML(p, idx) {
        var posDisplay = (slotLabels && slotLabels[idx]) ? slotLabels[idx] : p.pos;
        var color = getColorLinea(posDisplay);
        return '<span class="pos-badge" style="background:' + color + ';color:#fff;font-size:9px;width:26px;padding:1px 0;">' + posDisplay + '</span>';
    }

    function stamColor(s) {
        var n = parseInt(s) || 100;
        return n > 60 ? '#22c55e' : n > 30 ? '#eab308' : '#ef4444';
    }

    function estaSeleccionado(pid, grupo) {
        return (_sel1 && _sel1.id === pid && _sel1.grupo === grupo) || (_sel2 && _sel2.id === pid && _sel2.grupo === grupo);
    }

    var htmlTit = '<div class="sub-card-title">TITULARES (' + titulares.length + ')</div>';
    titulares.forEach(function(p, idx) {
        var sel = estaSeleccionado(p.id, 'T') ? ' sub-selected' : '';
        htmlTit += '<div class="sub-row' + sel + '" onclick="onClickJugador(' + p.id + ',\'T\')">' +
            badgeHTML(p, idx) + ' ' +
            '<span class="sub-jugador">' + p.name + '</span>' +
            '<span class="sub-stamina" style="color:' + stamColor(p.stamina) + ';">⚡' + (parseInt(p.stamina) || 100) + '%</span></div>';
    });
    document.getElementById('colTitulares').innerHTML = htmlTit;

    var htmlSup = '<div class="sub-card-title">SUPLENTES (' + noUsados.length + ')</div>';
    noUsados.forEach(function(p) {
        var sel = estaSeleccionado(p.id, 'S') ? ' sub-selected' : '';
        htmlSup += '<div class="sub-row' + sel + '" onclick="onClickJugador(' + p.id + ',\'S\')">' +
            badgeHTML(p) + ' ' +
            '<span class="sub-jugador">' + p.name + '</span>' +
            '<span class="sub-stamina" style="color:' + stamColor(p.stamina) + ';">⚡' + (parseInt(p.stamina) || 100) + '%</span></div>';
    });
    if (noUsados.length === 0) htmlSup += '<div style="color:#64748b;font-size:11px;text-align:center;padding:10px;">No hay suplentes disponibles.</div>';
    document.getElementById('colSuplentes').innerHTML = htmlSup;
}

function onClickJugador(jugadorId, grupo) {
    // Si es el mismo jugador ya seleccionado, deseleccionar
    if ((_sel1 && _sel1.id === jugadorId && _sel1.grupo === grupo) || (_sel2 && _sel2.id === jugadorId && _sel2.grupo === grupo)) {
        _sel1 = null; _sel2 = null;
        mostrarMenuDescanso(matchState);
        return;
    }

    if (!_sel1) {
        _sel1 = { id: jugadorId, grupo: grupo };
    } else if (!_sel2 && jugadorId !== _sel1.id) {
        _sel2 = { id: jugadorId, grupo: grupo };

        // Si son del mismo grupo
        if (_sel1.grupo === _sel2.grupo) {
            if (_sel1.grupo === 'T') {
                var idx1 = -1, idx2 = -1;
                for (var i = 0; i < matchState.jugadoresEnCampo.length; i++) {
                    if (matchState.jugadoresEnCampo[i].id === _sel1.id) idx1 = i;
                    if (matchState.jugadoresEnCampo[i].id === _sel2.id) idx2 = i;
                }
                if (idx1 >= 0 && idx2 >= 0) {
                    var temp = matchState.jugadoresEnCampo[idx1];
                    matchState.jugadoresEnCampo[idx1] = matchState.jugadoresEnCampo[idx2];
                    matchState.jugadoresEnCampo[idx2] = temp;
                }
            }
            _sel1 = null; _sel2 = null;
            mostrarMenuDescanso(matchState);
            return;
        }

        // Ejecutar swap: determinar quién sale (titular) y quién entra (suplente)
        var idSale = (_sel1.grupo === 'T') ? _sel1.id : _sel2.id;
        var idEntra = (_sel1.grupo === 'S') ? _sel1.id : _sel2.id;

        var saliente = null, entrante = null;
        gameState.squad.forEach(function(p) {
            if (p.id === idSale) saliente = p;
            if (p.id === idEntra) entrante = p;
        });

        if (saliente && entrante && matchState && matchState.sustitucionesRestantes > 0) {
            matchState.sustitucionesRestantes--;
            matchState.sustitucionesRealizadas.push({ sale: idSale, entra: idEntra, minuto: 45 });
            for (var i = 0; i < matchState.jugadoresEnCampo.length; i++) {
                if (matchState.jugadoresEnCampo[i].id === idSale) {
                    matchState.jugadoresEnCampo[i] = entrante;
                    break;
                }
            }
            entrante.stamina = '100%';
            if (matchState.jugadoresQueJugaron.indexOf(saliente.id) === -1) matchState.jugadoresQueJugaron.push(saliente.id);
            if (matchState.jugadoresQueJugaron.indexOf(entrante.id) === -1) matchState.jugadoresQueJugaron.push(entrante.id);
        }
        _sel1 = null; _sel2 = null;
        mostrarMenuDescanso(matchState);
    } else {
        // Tercer click sin haber hecho swap: reiniciar con la nueva selección
        _sel1 = { id: jugadorId, grupo: grupo };
        _sel2 = null;
        mostrarMenuDescanso(matchState);
    }
}

function confirmarCambios() {
    _sel1 = null; _sel2 = null;
    document.getElementById('halfTimeMenu').style.display = 'none';
    document.getElementById('btnContinuarSegundaParte').style.display = 'none';
    document.getElementById('btnGuardarPartida').style.display = 'none';
    document.getElementById('btnSalirMenu').style.display = 'none';
    document.getElementById('matchCommentary').style.display = '';
    document.getElementById('matchCommentary').innerHTML += '<p style="color:#38bdf8;">¡Comienza la segunda parte!</p>';
    document.getElementById('gameSidebarNav').style.display = '';
    document.getElementById('matchSidebar').style.display = 'none';
    if (matchState) matchState.formacionUsada = gameState.formacion || '4-4-2 Estándar';

    var org = organizarPlantilla();
    var matchXiActual = [];
    matchState.jugadoresEnCampo.forEach(function(p) {
        matchXiActual.push(p);
    });
    matchState.actualizarMatchXi(matchXiActual);

    if (matchXi) renderMatchNotas(matchXi, matchEventos, awayGoals, false);
    if (matchState && matchState.reanudarInterval) matchState.reanudarInterval();
}

var matchState = null;
var matchEventos = null;
var matchXi = null;
var homeGoals = 0, awayGoals = 0, minute = 0;
var matchIntervalId = null;

function getOpcionesDropdown(tipo) {
    if (tipo === 'formacion') {
        return [
            { value: '4-4-2 Estándar', label: '4-4-2 Estándar' },
            { value: '4-3-3 Defensivo', label: '4-3-3 Defensivo' },
            { value: '4-2-3-1', label: '4-2-3-1' },
            { value: '3-4-3', label: '3-4-3' },
            { value: '4-4-2 Diamante', label: '4-4-2 Diamante' },
            { value: '4-1-4-1', label: '4-1-4-1' },
            { value: '5-3-2 Defensivo', label: '5-3-2 Defensivo' }
        ];
    } else if (tipo === 'presion') {
        return [
            { value: 'suave', label: '🟢 Suave', color: '#22c55e' },
            { value: 'pesada', label: '🟡 Pesada', color: '#eab308' },
            { value: 'extrema', label: '🔴 Extrema', color: '#ef4444' }
        ];
    }
    return [];
}

function abrirDropdownMatch(e, tipo) {
    e.stopPropagation();
    var dd = document.getElementById('matchTacticDropdown');
    var list = document.getElementById('matchTacticDropdownList');
    if (!dd || !list) return;

    var sidebar = document.querySelector('.game-sidebar');
    var sidebarRect = sidebar.getBoundingClientRect();
    var el = e.currentTarget;
    var elRect = el.getBoundingClientRect();

    dd.style.left = (elRect.left - sidebarRect.left) + 'px';
    dd.style.top = (elRect.bottom - sidebarRect.top + 2) + 'px';
    dd.style.width = elRect.width + 'px';

    var opciones = getOpcionesDropdown(tipo);
    var currentVal = tipo === 'formacion' ? gameState.formacion || '4-4-2 Estándar' : gameState.estiloPresion || 'pesada';

    list.innerHTML = '';
    opciones.forEach(function(o) {
        var item = document.createElement('div');
        item.className = 'tactic-dropdown-item';
        if (o.value === currentVal) item.classList.add('selected');
        item.textContent = o.label;
        if (o.color) item.style.color = o.color;
        item.dataset.value = o.value;
        item.onclick = function(ev) {
            ev.stopPropagation();
            if (tipo === 'formacion') {
                gameState.formacion = this.dataset.value;
                document.getElementById('matchFormacionDisplay').innerText = this.dataset.value;
                reajustarAlineacionPartido();
            } else if (tipo === 'presion') {
                gameState.estiloPresion = this.dataset.value;
                var labels = { suave: '🟢 Suave', pesada: '🟡 Pesada', extrema: '🔴 Extrema' };
                document.getElementById('matchPresionDisplay').innerText = labels[this.dataset.value] || this.dataset.value;
            }
            cerrarDropdown();
        };
        list.appendChild(item);
    });

    dd.style.display = 'block';
}

function reajustarAlineacionPartido() {
    if (!matchState) return;
    var nuevoXi = seleccionarXI(gameState.squad, gameState.formacion || '4-4-2 Estándar').slice(0, 11);
    if (nuevoXi.length === 0) return;

    matchXi = nuevoXi.slice();
    matchState.jugadoresEnCampo = nuevoXi.slice();
    matchState.formacionUsada = gameState.formacion || '4-4-2 Estándar';
    matchState.jugadoresQueJugaron = [];
    matchXi.forEach(function(p) {
        if (matchState.jugadoresQueJugaron.indexOf(p.id) === -1) matchState.jugadoresQueJugaron.push(p.id);
    });
    matchState.sustitucionesRestantes = 5;
    matchState.sustitucionesRealizadas = [];

    if (matchXi) renderMatchNotas(matchXi, matchEventos || [], awayGoals, false);

    var halfMenu = document.getElementById('halfTimeMenu');
    if (halfMenu && halfMenu.style.display === 'flex') {
        mostrarMenuDescanso(matchState);
    }
}

function runMatchSimulation() {
    document.querySelectorAll('.game-tab-content').forEach(function (t) { return t.classList.remove('active'); });
    document.getElementById('tab-partido').classList.add('active');

    document.getElementById('matchHomeTeam').innerText = gameState.team;
    document.getElementById('matchAwayTeam').innerText = gameState.opponent;
    document.getElementById('matchScore').innerText = '0 - 0';

    var commentary = document.getElementById('matchCommentary');
    commentary.innerHTML = '<p style="color: #38bdf8;">Comienza el encuentro en el ' + gameState.stadium + '...</p>';

    var precioBase = calcularPrecioBaseEntrada();
    var ratio = (gameState.ticketPrice || precioBase) / precioBase;
    var pct;
    if (ratio <= 0.8) pct = 1.0;
    else if (ratio <= 1.15) pct = 0.85 + Math.random() * 0.1;
    else if (ratio <= 1.4) pct = 0.6 + Math.random() * 0.15;
    else pct = 0.3 + Math.random() * 0.15;
    var asistencia = Math.round(gameState.capacity * pct);
    var recaudacionBruta = (asistencia * (gameState.ticketPrice || precioBase)) / 1000000;
    var costeOperativo = Math.round(asistencia * 1.5) / 1000000;
    var recaudacion = Math.max(0, recaudacionBruta - costeOperativo);
    gameState.budget += recaudacion;
    commentary.innerHTML += '<p style="color:#94a3b8;">Asistencia: ' + asistencia.toLocaleString() + ' espect. Ingreso neto: ' + formatearPresupuesto(recaudacion) + ' (costes operativos: ' + formatearPresupuesto(costeOperativo) + ').</p>';
    document.getElementById('gameBudget').innerText = formatearPresupuesto(gameState.budget);

    // Simular Supercopa antes del partido de Liga
    var semanaIdxSC = (gameState.matchday || 1) - 1;
    if (gameState.supercopa && gameState.calendario && gameState.calendario[semanaIdxSC]) {
        var partidosSemSC = gameState.calendario[semanaIdxSC].partidos;
        for (var sci = 0; sci < partidosSemSC.length; sci++) {
            if (partidosSemSC[sci].competicion === 'Supercopa' && !partidosSemSC[sci].jugado) {
                var pSC = partidosSemSC[sci];
                var rSC = pSC.rival;
                var condSC = pSC.condicion;
                var localSC = condSC === 'C' ? gameState.team : rSC;
                var visitSC = condSC === 'C' ? rSC : gameState.team;
                var resSC = simularPartidoCopa(localSC, visitSC);
                pSC.jugado = true;
                pSC.resultado = {
                    golesFavor: condSC === 'C' ? resSC.golesL : resSC.golesV,
                    golesContra: condSC === 'C' ? resSC.golesV : resSC.golesL
                };
                var rSCIdx = pSC.supercopaRondaIdx !== undefined ? pSC.supercopaRondaIdx : 0;
                if (gameState.supercopa.rondas[rSCIdx]) {
                    var rondaSC = gameState.supercopa.rondas[rSCIdx];
                    for (var sm = 0; sm < rondaSC.partidos.length; sm++) {
                        var pmSC = rondaSC.partidos[sm];
                        if ((pmSC.local === gameState.team || pmSC.visitante === gameState.team) && !pmSC.resultado) {
                            pmSC.resultado = resSC;
                            break;
                        }
                    }
                    simularRondaSupercopa(rSCIdx);
                }
                commentary.innerHTML += '<p style="color:#eab308;">\ud83c\udfc6 Supercopa: ' + localSC + ' ' + resSC.golesL + '-' + resSC.golesV + ' ' + visitSC + '</p>';
                break;
            }
        }
    }

    commentary.style.display = '';
    document.getElementById('halfTimeMenu').style.display = 'none';
    document.getElementById('btnContinueMatch').style.display = 'none';
    document.getElementById('btnContinuarSegundaParte').style.display = 'none';
    document.getElementById('btnGuardarPartida').style.display = 'none';
    document.getElementById('btnSalirMenu').style.display = 'none';

    document.getElementById('panelClubInfo').style.display = 'none';
    document.getElementById('matchRatingPanel').style.display = 'flex';

    document.getElementById('matchFormacionDisplay').innerText = gameState.formacion || '4-4-2 Estándar';
    var presLabels = { suave: '🟢 Suave', pesada: '🟡 Pesada', extrema: '🔴 Extrema' };
    document.getElementById('matchPresionDisplay').innerText = presLabels[gameState.estiloPresion] || '🟡 Pesada';

    var orgMatch = gameState.squad.length > 0 ? organizarPlantilla() : null;
    matchXi = (orgMatch && orgMatch.xi) ? orgMatch.xi.slice() : [];
    var todosSubs = (orgMatch && orgMatch.subs) ? orgMatch.subs.slice() : [];

    matchState = {
        jugadoresEnCampo: matchXi.slice(),
        jugadoresQueJugaron: matchXi.map(function(p) { return p.id; }),
        sustitucionesRestantes: 5,
        sustitucionesRealizadas: [],
        tiempoDescanso: false,
        matchIntervalId: null,
        formaInicial: {},
        formacionUsada: gameState.formacion || '4-4-2 Estándar',
        actualizarMatchXi: function(nuevoXi) { matchXi = nuevoXi.slice(); }
    };

    matchXi.forEach(function(p) {
        var offset = (Math.random() * 0.8) - 0.4;
        if (p.id === gameState.capitanId) offset += 0.5;
        matchState.formaInicial[p.id] = offset;
    });
    if (gameState.capitanId) {
        enviarMensaje('Dirección Técnica', '👑 Capitán',
            (gameState.squad.find(function(p) { return p.id === gameState.capitanId; }) || {}).name + ' lidera al equipo como capitán esta jornada.');
        renderInbox();
    }

    minute = 0;
    homeGoals = 0;
    awayGoals = 0;

    var btnPlay = document.getElementById('btnPlayMatch');
    btnPlay.disabled = true;
    btnPlay.style.opacity = '0.5';

    var goalMsgs = [
        'Gran remate cruzado', 'Cabezazo certero', 'Disparo desde la frontal',
        'Jugada de estrategia', 'Vaselina espectacular', 'Tiro raso ajustado al palo',
        'Chilena sensacional', 'Falta directa imparable', 'Contraataque letal'
    ];
    var actionMsgs = [
        'Ocasión de peligro interceptada por la defensa.',
        'Centro peligroso que despeja el portero.',
        'Falta peligrosa al borde del área.',
        'Jugada combinativa que se queda en nada.',
        'Saque de esquina rematado fuera.',
        'Roba el balón en el medio campo.'
    ];

    matchEventos = [];

    if (matchXi) renderMatchNotas(matchXi, matchEventos, 0, false);

    function playerTag(p) {
        if (!p) return 'Unknown';
        return (p.dorsal ? '[' + p.dorsal + '] ' : '') + p.name;
    }

    function matchIntervalCallback() {
        minute += 15;
        document.getElementById('matchClock').innerText = minute + "'";

        if (minute === 45 && !matchState.tiempoDescanso) {
            clearInterval(matchIntervalId);
            matchState.tiempoDescanso = true;
            document.getElementById('matchCommentary').innerHTML += '<p style="color:#eab308;">¡DESCANSO! ' + homeGoals + ' - ' + awayGoals + '</p>';
            mostrarMenuDescanso(matchState);
            return;
        }

        var presion = gameState.estiloPresion || 'pesada';
        var multStamina = presion === 'suave' ? 0.5 : (presion === 'extrema' ? 1.8 : 1.0);
        var rV = _fixtureRatings[gameState.opponent] || 75;
        var probGol = 0.50 - ((gameState.rating || 75) - rV) * 0.002;
        var umbralGol = presion === 'suave' ? Math.min(0.78, probGol + 0.10) : (presion === 'extrema' ? Math.max(0.40, probGol - 0.10) : probGol);

        matchState.jugadoresEnCampo.forEach(function(p) {
            var stam = parseInt(p.stamina) || 100;
            var desgaste = Math.round((Math.floor(Math.random() * 4) + 6) * multStamina);
            stam = Math.max(0, stam - desgaste);
            p.stamina = stam + '%';
        });

        if (Math.random() < 0.003) {
            var candidatos = [];
            matchState.jugadoresEnCampo.forEach(function(p) {
                var stam = parseInt(p.stamina) || 100;
                if (stam < 25) candidatos.push(p);
            });
            if (candidatos.length > 0) {
                var lesionado = candidatos[Math.floor(Math.random() * candidatos.length)];
                lesionado.lesionSemanas = 1;
                matchEventos.push({ tipo: 'lesion', equipo: 'L', jugador: { id: lesionado.id, nombre: lesionado.name, dorsal: lesionado.dorsal } });
                commentary.innerHTML += '<p style="color:#ef4444;">' + lesionado.name + ' se ha lesionado en una jugada (' + minute + "').</p>";
                if (matchXi) renderMatchNotas(matchXi, matchEventos, awayGoals, false);
            }
        }

        if (presion === 'extrema' && Math.random() < 0.08) {
            matchEventos.push({ tipo: 'ta', equipo: Math.random() > 0.5 ? 'L' : 'V', jugador: null });
        }

        var chance = Math.random();
        if (chance > umbralGol) {
            var msg = goalMsgs[Math.floor(Math.random() * goalMsgs.length)];
            var probLocal = (gameState.rating || 75) / ((gameState.rating || 75) + rV);
            if (Math.random() < probLocal) {
                homeGoals++;
                var goleador = seleccionarGoleador(matchState.jugadoresEnCampo);
                var asistente = Math.random() > 0.3 ? seleccionarGoleador(matchState.jugadoresEnCampo) : null;
                if (asistente && asistente.id === (goleador ? goleador.id : -1)) asistente = null;
                matchEventos.push({ tipo: 'gol', equipo: 'L', goleador: goleador ? { id: goleador.id, nombre: goleador.name, dorsal: goleador.dorsal } : null, asistente: asistente ? { id: asistente.id, nombre: asistente.name, dorsal: asistente.dorsal } : null });
                commentary.innerHTML += '<p style="color: #10b981;"><b>¡GOOOOOOL DE ' + gameState.team.toUpperCase() + '!</b> ' + playerTag(goleador) + '. ' + msg + ' (' + minute + "')</p>";
            } else {
                awayGoals++;
                var goleadorV = seleccionarGoleador(matchState.jugadoresEnCampo);
                matchEventos.push({ tipo: 'gol', equipo: 'V', goleador: null, asistente: null });
                commentary.innerHTML += '<p style="color: #fca5a5;"><b>¡Gol del ' + gameState.opponent + '!</b> ' + msg + ' (' + minute + "')</p>";
            }
            document.getElementById('matchScore').innerText = homeGoals + ' - ' + awayGoals;
            if (matchXi) renderMatchNotas(matchXi, matchEventos, awayGoals, false);
        } else {
            commentary.innerHTML += '<p>min ' + minute + ': ' + actionMsgs[Math.floor(Math.random() * actionMsgs.length)] + '</p>';
        }
        commentary.scrollTop = commentary.scrollHeight;

        if (minute >= 90) {
            clearInterval(matchIntervalId);
            document.getElementById('gameSidebarNav').style.display = '';
            document.getElementById('matchSidebar').style.display = 'none';
            commentary.innerHTML += '<p style="color: #facc15; font-weight: bold; margin-top: 6px;">¡FINAL DEL PARTIDO! Resultado: ' + homeGoals + ' - ' + awayGoals + '</p>';
            var semanaIdx = (gameState.matchday || 1) - 1;
            if (gameState.calendario && gameState.calendario[semanaIdx]) {
                var partidosSem = gameState.calendario[semanaIdx].partidos;
                var laLigaPartido = null;
                for (var pi = 0; pi < partidosSem.length; pi++) {
                    if (partidosSem[pi].competicion === 'LaLiga') { laLigaPartido = partidosSem[pi]; break; }
                }
                if (!laLigaPartido) laLigaPartido = partidosSem[partidosSem.length - 1];
                if (laLigaPartido && !laLigaPartido.jugado) {
                    laLigaPartido.jugado = true;
                    laLigaPartido.resultado = { golesFavor: homeGoals, golesContra: awayGoals };
                }
                // Registrar resultado de Copa si aplica
                for (var ci = 0; ci < partidosSem.length; ci++) {
                    if (partidosSem[ci].competicion === 'Copa' && !partidosSem[ci].jugado) {
                        partidosSem[ci].jugado = true;
                        partidosSem[ci].resultado = { golesFavor: homeGoals, golesContra: awayGoals };
                        // Actualizar resultado en el bracket de copa
                        var copaCal = [4, 8, 12, 16, 20, 21, 24];
                        var cIdx = copaCal.indexOf(gameState.matchday);
                        if (cIdx !== -1 && gameState.copa && gameState.copa.rondas[cIdx]) {
                            var ronda = gameState.copa.rondas[cIdx];
                            for (var pi = 0; pi < ronda.partidos.length; pi++) {
                                var p = ronda.partidos[pi];
                                if ((p.local === gameState.team && p.visitante === gameState.opponent) ||
                                    (p.visitante === gameState.team && p.local === gameState.opponent)) {
                                    var resCopa = simularPartidoCopa(gameState.team, gameState.opponent);
                                    resCopa.golesL = homeGoals;
                                    resCopa.golesV = awayGoals;
                                    p.resultado = resCopa;
                                    break;
                                }
                            }
                            simularRondaCopa(cIdx);
                        }
                        break;
                    }
                }
            }
            if (gameState.fixture && gameState.fixture[semanaIdx]) {
                for (var fm = 0; fm < gameState.fixture[semanaIdx].partidos.length; fm++) {
                    var fp = gameState.fixture[semanaIdx].partidos[fm];
                    if (fp && (fp.local === gameState.team || fp.visitante === gameState.team)) {
                        if (fp.local === gameState.team) { fp.golesL = homeGoals; fp.golesV = awayGoals; }
                        else { fp.golesL = awayGoals; fp.golesV = homeGoals; }
                        fp.jugado = true;
                        break;
                    }
                }
            }

            var procesados = {};
            for (var ei = 0; ei < matchEventos.length; ei++) {
                var ev = matchEventos[ei];
                if (ev.goleador) {
                    for (var si = 0; si < gameState.squad.length; si++) {
                        var pl = gameState.squad[si];
                        if (pl.id === ev.goleador.id || pl.name === ev.goleador.nombre) {
                            if (!pl.statsTemporada) pl.statsTemporada = { partidos: 0, goles: 0, asistencias: 0, ta: 0, tr: 0 };
                            pl.statsTemporada.goles++;
                            pl.golesHistoricos = (pl.golesHistoricos || 0) + 1;
                            pl.gol = (pl.gol || 0) + 1;
                            procesados[pl.id] = true;
                            break;
                        }
                    }
                }
                if (ev.asistente) {
                    for (var si = 0; si < gameState.squad.length; si++) {
                        var pl = gameState.squad[si];
                        if (pl.id === ev.asistente.id || pl.name === ev.asistente.nombre) {
                            if (!pl.statsTemporada) pl.statsTemporada = { partidos: 0, goles: 0, asistencias: 0, ta: 0, tr: 0 };
                            pl.statsTemporada.asistencias++;
                            pl.asi = (pl.asi || 0) + 1;
                            procesados[pl.id] = true;
                            break;
                        }
                    }
                }
            }

            var usuariosEnCampo = {};
            if (matchState.jugadoresQueJugaron) {
                matchState.jugadoresQueJugaron.forEach(function(id) { usuariosEnCampo[id] = true; });
            } else {
                matchState.jugadoresEnCampo.forEach(function(p) { usuariosEnCampo[p.id] = true; });
            }
            gameState.squad.forEach(function(p) {
                if (usuariosEnCampo[p.id] && !procesados[p.id]) {
                    if (!p.statsTemporada) p.statsTemporada = { partidos: 0, goles: 0, asistencias: 0, ta: 0, tr: 0 };
                    p.statsTemporada.partidos++;
                    p.partidosHistoricos = (p.partidosHistoricos || 0) + 1;
                    p.pj = (p.pj || 0) + 1;
                }
            });

            var todosQueJugaron = [];
            matchState.jugadoresEnCampo.forEach(function(p) { todosQueJugaron.push(p); });
            calcularNotasPartido(todosQueJugaron, awayGoals, homeGoals);
            actualizarMoralPostPartido();
            aplicarDesgasteXI(todosQueJugaron);
            aplicarLesiones(todosQueJugaron, gameState.team);
            renderInbox();
            actualizarRecordsDeportivos();
            if (matchXi) renderMatchNotas(matchXi, matchEventos, awayGoals, true);

            document.getElementById('btnContinueMatch').style.display = '';
            btnPlay.disabled = false;
            btnPlay.style.opacity = '1';
        }
    }

    matchState.reanudarInterval = function() {
        matchIntervalId = setInterval(matchIntervalCallback, 800);
    };

    if (matchXi) renderMatchNotas(matchXi, matchEventos, 0, false);
    matchIntervalId = setInterval(matchIntervalCallback, 800);
}

function recuperarEstaminaPlantilla(diasDescanso) {
    if (!gameState.squad) return;
    diasDescanso = diasDescanso || 7;
    var org = organizarPlantilla();
    var xiIds = [];
    if (org && org.xi) { for (var i = 0; i < org.xi.length; i++) xiIds.push(org.xi[i].id); }
    for (var i = 0; i < gameState.squad.length; i++) {
        var p = gameState.squad[i];
        if (p.lesionSemanas > 0) {
            p.lesionSemanas--;
            if (p.lesionSemanas === 0) {
                enviarMensaje('Servicio Médico', 'Recuperación completa',
                    p.name + ' se ha recuperado de su lesión y está disponible para la próxima convocatoria.');
            }
        }
        if (p.sancionSemanas > 0) {
            p.sancionSemanas--;
            if (p.sancionSemanas === 0) {
                enviarMensaje('Comité de Competición', '✅ Sanción cumplida',
                    p.name + ' ha cumplido su sanción y está disponible para la próxima convocatoria.');
            }
        }
        var stam = parseInt(p.stamina) || 100;
        if (xiIds.indexOf(p.id) === -1) {
            stam = 100;
        } else {
            var factor = diasDescanso >= 6 ? 6 : 5;
            stam = Math.min(100, stam + diasDescanso * factor);
        }
        p.stamina = stam + '%';
    }
}

function procesarRetornoCesiones() {
    if (!gameState.cedidosFuera || gameState.cedidosFuera.length === 0) return;
    var pendientes = [];
    var devueltos = [];
    for (var i = 0; i < gameState.cedidosFuera.length; i++) {
        var cr = gameState.cedidosFuera[i];
        if ((gameState.matchday || 1) >= cr.jornadaFin) {
            var statsCesion = cr.statsTemporada || { partidos: 0, goles: 0, asistencias: 0, ta: 0, tr: 0 };
            var squadD = _cachedSquads[cr.destino];
            if (squadD) {
                for (var j = 0; j < squadD.length; j++) {
                    if (squadD[j].id === cr.idEnDestino) {
                        var cloneStats = squadD[j].statsTemporada || {};
                        var cloneRating = squadD[j].rating || cr.rating || 70;
                        var cloneVal = squadD[j].val || cr.val || '0M€';
                        statsCesion.partidos = (statsCesion.partidos || 0) + (cloneStats.partidos || 0);
                        statsCesion.goles = (statsCesion.goles || 0) + (cloneStats.goles || 0);
                        statsCesion.asistencias = (statsCesion.asistencias || 0) + (cloneStats.asistencias || 0);
                        statsCesion.ta = (statsCesion.ta || 0) + (cloneStats.ta || 0);
                        statsCesion.tr = (statsCesion.tr || 0) + (cloneStats.tr || 0);
                        squadD.splice(j, 1);
                        _cachedSquads[cr.destino] = squadD;
                        break;
                    }
                }
            }
            var nuevoId = 30000 + Math.floor(Math.random() * 90000);
            var dorsal = getPrimerDorsalLibre();
            gameState.squad.push({
                id: nuevoId,
                pos: cr.pos,
                name: cr.nombre,
                dorsal: dorsal,
                fullName: cr.nombre,
                nationality: cr.nacionalidad || 'es',
                age: cr.edad || 25,
                height: cr.altura || 178,
                rating: cloneRating,
                stamina: '100%',
                val: cloneVal,
            lesionSemanas: 0,
            tipoLesion: '',
            sancionSemanas: 0,
                tarjetasAmarillasAcum: 0,
            moral: 4, rol: 'rotacion', jornadasSinJugar: 0,
                equipoId: gameState.team,
                statsTemporada: cr.statsTemporada || { partidos: 0, goles: 0, asistencias: 0, ta: 0, tr: 0, historialNotas: [], promedioNotas: 0 }
            });
            devueltos.push(cr.nombre);
        } else {
            pendientes.push(cr);
        }
    }
    if (devueltos.length > 0) {
        gameState.cedidosFuera = pendientes;
        enviarMensaje('Dirección Deportiva', '\ud83d\udcc4 Fin de cesión',
            devueltos.join(', ') + ' ha(n) regresado al club tras finalizar su cesión.');
        renderInbox();
    }

    var devueltosCedidos = [];
    for (var ci = gameState.squad.length - 1; ci >= 0; ci--) {
        var cp = gameState.squad[ci];
        if (cp.esCedido && cp.jornadaFinCesion && (gameState.matchday || 1) >= cp.jornadaFinCesion) {
            devueltosCedidos.push(cp.name);
            gameState.squad.splice(ci, 1);
        }
    }
    if (devueltosCedidos.length > 0) {
        enviarMensaje('Dirección Deportiva', '\ud83d\udcc4 Fin de cesión',
            devueltosCedidos.join(', ') + ' ha(n) regresado a su club de origen tras finalizar su cesión.');
        renderInbox();
    }
}

function nextMatch() {
    var jornadaAnterior = (gameState.matchday || 1) - 1;
    var diasDescanso = 7;

    // Registrar resultado del playoff del usuario si jugó
    if (gameState.playoff && !gameState.playoff.completado) {
        var fixt = gameState.fixture;
        if (fixt && fixt[jornadaAnterior]) {
            var jorP = fixt[jornadaAnterior];
            for (var fmPO = 0; fmPO < jorP.partidos.length; fmPO++) {
                var fpPO = jorP.partidos[fmPO];
                if (fpPO && fpPO.jugado && (fpPO.local === gameState.team || fpPO.visitante === gameState.team)) {
                    for (var prR = 0; prR < gameState.playoff.rondas.length; prR++) {
                        var rRonda = gameState.playoff.rondas[prR];
                        if (rRonda.completada) continue;
                        for (var pmR = 0; pmR < rRonda.partidos.length; pmR++) {
                            var pR = rRonda.partidos[pmR];
                            if (pR.resultado) continue;
                            if ((pR.local === gameState.team || pR.visitante === gameState.team)) {
                                var golesL = fpPO.local === gameState.team ? fpPO.golesL : fpPO.golesV;
                                var golesV = fpPO.local === gameState.team ? fpPO.golesV : fpPO.golesL;
                                pR.resultado = { golesL: golesL, golesV: golesV, tipo: 'normal' };
                                break;
                            }
                        }
                        break;
                    }
                    var hayResultados = true;
                    for (var rr = 0; rr < gameState.playoff.rondas.length; rr++) {
                        for (var mr = 0; mr < gameState.playoff.rondas[rr].partidos.length; mr++) {
                            if (!gameState.playoff.rondas[rr].partidos[mr].resultado) { hayResultados = false; break; }
                        }
                        if (hayResultados && rr === gameState.playoff.rondas.length - 1) {
                            var ganadoresR = [];
                            gameState.playoff.rondas[rr].partidos.forEach(function(pp) {
                                var g = pp.resultado.golesL > pp.resultado.golesV ? pp.local : pp.visitante;
                                if (rr % 2 === 1 && pp.resultadoIda) {
                                    var gl = pp.resultadoIda.golesL + pp.resultado.golesL;
                                    var gv = pp.resultadoIda.golesV + pp.resultado.golesV;
                                    if (gl !== gv) g = gl > gv ? pp.local : pp.visitante;
                                }
                                ganadoresR.push(g);
                            });
                            gameState.playoff.rondas[rr].completada = true;
                            if (rr < gameState.playoff.rondas.length - 1) {
                                for (var gi = 0; gi < ganadoresR.length; gi += 2) {
                                    if (gi + 1 < ganadoresR.length) {
                                        gameState.playoff.rondas[rr + 1].partidos.push({ local: ganadoresR[gi], visitante: ganadoresR[gi + 1], resultado: null, resultadoIda: null });
                                    }
                                }
                            } else {
                                gameState.playoff.campeon = ganadoresR[0] || null;
                                gameState.playoff.completado = true;
                                if (gameState.playoff.campeon) {
                                    var mPO = gameState.currentDate.match(/Temporada (\d{4}-\d{2})/);
                                    var seasonStrPO = mPO ? mPO[1] : '2026-27';
                                    registrarTitulo(gameState.playoff.campeon, 'Playoff Ascenso', seasonStrPO);
                                    enviarMensaje('LaLiga', '\ud83c\udfc6 Playoff de Ascenso',
                                        '\u00a1' + gameState.playoff.campeon + ' asciende a Primera Divisi\u00f3n tras ganar el playoff de ascenso ' + seasonStrPO + '!');
                                    renderInbox();
                                }
                            }
                        }
                        if (!hayResultados) break;
                    }
                    break;
                }
            }
        }
    }
    if (gameState.calendario && gameState.calendario[jornadaAnterior]) {
        if (gameState.calendario[jornadaAnterior].partidos.length > 1) diasDescanso = 3;
    }
    recuperarEstaminaPlantilla(diasDescanso);
    simularJornadaTodasLigas(jornadaAnterior);
    if (esMercadoAbierto()) {
        simularMercadoCPU();
        generarOfertasCPU();
    }
    if (gameState.matchday === 19) {
        generarCamadaCantera();
    }

    // Simular rondas de Copa donde el usuario no participa
    if (gameState.copa) {
        var copaCal = [4, 8, 12, 16, 20, 21, 24];
        var copaIdx = copaCal.indexOf(gameState.matchday);
        if (copaIdx !== -1) {
            var ronda = gameState.copa.rondas[copaIdx];
            if (ronda && !ronda.completada) {
                var usuarioJuega = false;
                ronda.partidos.forEach(function(p) {
                    if (p.local === gameState.team || p.visitante === gameState.team) usuarioJuega = true;
                });
                if (!usuarioJuega) {
                    simularRondaCopa(copaIdx);
                }
            }
        }
    }

    // Simular Supercopa donde el usuario no participa
    if (gameState.supercopa && (gameState.matchday === 19 || gameState.matchday === 20)) {
        var scIdx = gameState.matchday === 19 ? 0 : 1;
        var scRonda = gameState.supercopa.rondas[scIdx];
        if (scRonda && !scRonda.completada) {
            var usuarioJuegaSC = false;
            scRonda.partidos.forEach(function(p) {
                if (p.local === gameState.team || p.visitante === gameState.team) usuarioJuegaSC = true;
            });
            if (!usuarioJuegaSC) {
                simularRondaSupercopa(scIdx);
            }
        }
    }

    gameState.matchday = (gameState.matchday || 1) + 1;

    if (gameState.patrocinadorActual && gameState.matchday % 4 === 0) {
        procesarPagoPatrocinio();
    }
    if (gameState.matchday % 4 === 0) {
        procesarGastosMensuales();
    }

    if (gameState.matchday > gameState.totalMatchdays) {
        var equiposLiga = Database.getTeams(gameState.country, gameState.league);
        var esSegunda = equiposLiga && equiposLiga.length === 22;

        if (esSegunda && !gameState.playoff) {
            var fixtureP = gameState.fixturesPorLiga[gameState.league] || gameState.fixture;
            var tablaP = fixtureP ? calcularClasificacion(equiposLiga, fixtureP, gameState.totalMatchdays || 42) : [];
            if (tablaP.length >= 6) {
                gameState.playoff = {
                    rondas: [
                        { nombre: 'Semifinal Ida', orden: 0, partidos: [
                            { local: tablaP[2].nombre, visitante: tablaP[5].nombre, resultado: null, resultadoIda: null },
                            { local: tablaP[3].nombre, visitante: tablaP[4].nombre, resultado: null, resultadoIda: null }
                        ], completada: false },
                        { nombre: 'Semifinal Vuelta', orden: 1, partidos: [], completada: false },
                        { nombre: 'Final Ida', orden: 2, partidos: [], completada: false },
                        { nombre: 'Final Vuelta', orden: 3, partidos: [], completada: false }
                    ],
                    campeon: null,
                    completado: false
                };
                gameState.totalMatchdays += 4;
                enviarMensaje('LaLiga', '\ud83c\udfc6 Comienza el playoff de ascenso',
                    'El ' + gameState.team + (tablaP[2].nombre === gameState.team || tablaP[3].nombre === gameState.team || tablaP[4].nombre === gameState.team || tablaP[5].nombre === gameState.team ? ' ha clasificado al playoff de ascenso.' : ' no ha clasificado al playoff de ascenso.'));
                renderInbox();
            } else {
                procesarFinTemporada();
                return;
            }
        } else if (esSegunda && gameState.playoff && gameState.playoff.completado) {
            gameState.playoff = null;
            procesarFinTemporada();
            return;
        } else if (!esSegunda) {
            procesarFinTemporada();
            return;
        }
    }

    if (gameState.playoff && !gameState.playoff.completado) {
        var poRonda = null;
        for (var pr = 0; pr < gameState.playoff.rondas.length; pr++) {
            if (!gameState.playoff.rondas[pr].completada && gameState.playoff.rondas[pr].partidos.length > 0) {
                poRonda = pr;
                break;
            }
        }
        if (poRonda !== null) {
            var rondaPO = gameState.playoff.rondas[poRonda];
            var usuarioJuegaPO = false;
            rondaPO.partidos.forEach(function(p) {
                if (p.local === gameState.team || p.visitante === gameState.team) usuarioJuegaPO = true;
            });
            if (!usuarioJuegaPO) {
                simularRondaPlayoff(poRonda);
            } else {
                for (var pi = 0; pi < rondaPO.partidos.length; pi++) {
                    if (rondaPO.partidos[pi].local === gameState.team || rondaPO.partidos[pi].visitante === gameState.team) {
                        var popp = rondaPO.partidos[pi];
                        gameState.opponent = popp.local === gameState.team ? popp.visitante : popp.local;
                        if (poRonda % 2 === 1 && popp.resultadoIda) {
                            var idaGoles = popp.resultadoIda;
                        }
                        break;
                    }
                }
                gameState.currentDate = 'Temporada 2026-27 - Playoff J' + (gameState.matchday);
            }
        }
    }

    gameState.currentDate = 'Temporada 2026-27 - Jornada ' + gameState.matchday;

    var semanaIdx = gameState.matchday - 1;
    if (gameState.calendario && gameState.calendario[semanaIdx]) {
        var partidosSem = gameState.calendario[semanaIdx].partidos;
        var p = null;
        for (var pi = 0; pi < partidosSem.length; pi++) {
            if (partidosSem[pi].competicion === 'LaLiga') { p = partidosSem[pi]; break; }
        }
        if (!p) p = partidosSem[partidosSem.length - 1];
        gameState.opponent = p ? p.rival : 'Rival';
    } else {
        var teams = Database.getTeams(gameState.country, gameState.league);
        var others = teams.filter(function (t) { return t.name !== gameState.team; });
        gameState.opponent = others.length > 0 ? others[Math.floor(Math.random() * others.length)].name : 'Rival';
    }

    document.getElementById('dashJornada').innerText = 'Jornada ' + gameState.matchday + ' - Liga';
    document.getElementById('dashHomeTeam').innerText = gameState.team;
    document.getElementById('dashAwayTeam').innerText = gameState.opponent;
    document.getElementById('dashStadiumName').innerHTML = '<i class="fa-solid fa-location-dot"></i> ' + gameState.stadium;
    document.getElementById('btnContinueMatch').style.display = 'none';
    restaurarPanelClub();

    enviarMensaje('Oficina de Prensa', 'Jornada ' + gameState.matchday,
        'El ' + gameState.team + ' se prepara para la jornada ' + gameState.matchday + '. Próximo rival: ' + gameState.opponent + '.');
    renderInbox();

    goToScreen('screen-game');
    var btnInicio = document.querySelector('.nav-tab-btn');
    if (btnInicio) switchGameTab(btnInicio, 'tab-inicio');
}


function showModal(title, text) {
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalBody').innerText = text;
    document.getElementById('retroModal').classList.add('active');
}

function closeModal() {
    document.getElementById('retroModal').classList.remove('active');
}

function obtenerEstadoJuego() {
    return {
        slotId: gameState.slotId,
        managerName: gameState.manager,
        teamId: gameState.team,
        teamName: gameState.team,
        leagueName: gameState.league,
        countryName: gameState.country,
        currentDate: gameState.currentDate,
        budget: gameState.budget,
        stadium: gameState.stadium,
        capacity: gameState.capacity,
        ticketPrice: gameState.ticketPrice,
        rating: gameState.rating,
        opponent: gameState.opponent,
        matchday: gameState.matchday,
        calendario: gameState.calendario,
        calendarioGenerado: gameState.calendarioGenerado,
        fixture: gameState.fixture,
        fixturesPorLiga: gameState.fixturesPorLiga,
        fixtureGenerado: gameState.fixtureGenerado,
        cachedSquads: _cachedSquads,
        fixtureRatings: _fixtureRatings,
        presupuestosCPU: _presupuestosCPU,
        mensajes: gameState.mensajes,
        ultimoIdMensaje: gameState.ultimoIdMensaje,
        historialTraspasos: gameState.historialTraspasos,
        cedidosFuera: gameState.cedidosFuera,
        copa: gameState.copa,
        historialClub: gameState.historialClub,
        palmaresClub: gameState.palmaresClub,
        records: gameState.records,
        cantera: gameState.cantera,
        patrocinadorActual: gameState.patrocinadorActual,
        ofertasPatrocinio: gameState.ofertasPatrocinio,
        supercopa: gameState.supercopa,
        playoff: gameState.playoff,
        config: gameState.config,
        estiloPresion: gameState.estiloPresion,
        formacion: gameState.formacion,
        objetivoTemporada: gameState.objetivoTemporada,
        capitanId: gameState.capitanId,
        squad: gameState.squad.map(function (p) { return JSON.parse(JSON.stringify(p)); }),
        realSaveDate: new Date().toISOString()
    };
}

function guardarPartida(slotId) {
    var data = obtenerEstadoJuego();
    data.slotId = slotId;
    data.realSaveDate = new Date().toLocaleString('es-ES');
    gameState.slotId = slotId;
    try {
        localStorage.setItem('retro_fm_slot_' + slotId, JSON.stringify(data));
    } catch (e) {
        showModal('ERROR', 'No se pudo guardar la partida.');
    }
}

function cargarPartida(slotId) {
    var raw = localStorage.getItem('retro_fm_slot_' + slotId);
    if (!raw) { showModal('ERROR', 'Slot ' + slotId + ' vacío.'); return; }
    var data = JSON.parse(raw);
    gameState.manager = data.managerName;
    gameState.team = data.teamName;
    gameState.teamId = data.teamId;
    gameState.league = data.leagueName;
    gameState.country = data.countryName;
    gameState.budget = data.budget;
    gameState.stadium = data.stadium || 'Estadio';
    gameState.capacity = data.capacity || 0;
    gameState.ticketPrice = data.ticketPrice || Math.round((data.rating || 75) * 0.7);
    gameState.rating = data.rating || 75;
    gameState.opponent = data.opponent || 'Rival';
    gameState.matchday = data.matchday || 1;
    gameState.currentDate = data.currentDate || 'Temporada 2026-27 - Jornada 1';
    gameState.calendario = data.calendario || [];
    gameState.calendarioGenerado = data.calendarioGenerado || false;
    gameState.fixture = data.fixture || [];
    gameState.fixturesPorLiga = data.fixturesPorLiga || {};
    gameState.fixtureGenerado = data.fixtureGenerado || false;
    if (data.cachedSquads) { for (var k in data.cachedSquads) { _cachedSquads[k] = data.cachedSquads[k]; } }
    if (data.fixtureRatings) { for (var k in data.fixtureRatings) { _fixtureRatings[k] = data.fixtureRatings[k]; } }
    if (data.presupuestosCPU) { for (var k in data.presupuestosCPU) { _presupuestosCPU[k] = data.presupuestosCPU[k]; } }
    gameState.mensajes = data.mensajes || [];
    (gameState.mensajes || []).forEach(function(msg) {
        if (msg.acciones) {
            msg.acciones.forEach(function(act) {
                act.fn = act.fn.replace(/"([^"]*)"/g, "'$1'");
            });
        }
    });
    gameState.ultimoIdMensaje = data.ultimoIdMensaje || 0;
    gameState.historialTraspasos = data.historialTraspasos || [];
    gameState.cedidosFuera = data.cedidosFuera || [];
    gameState.copa = data.copa || null;
    gameState.historialClub = data.historialClub || {};
    gameState.palmaresClub = data.palmaresClub || {};
    gameState.records = data.records || { maximoGoleador: { nombre: '', goles: 0 }, masPartidos: { nombre: '', partidos: 0 }, fichajeMasCaro: { nombre: '', precio: 0, equipoOrigen: '' }, ventaMasCara: { nombre: '', precio: 0, equipoDestino: '' } };
    gameState.cantera = data.cantera || { promesas: [], filial: [], generacionHecha: false };
    gameState.patrocinadorActual = data.patrocinadorActual || null;
    gameState.ofertasPatrocinio = data.ofertasPatrocinio || [];
    gameState.supercopa = data.supercopa || null;
    gameState.playoff = data.playoff || null;
    gameState.config = data.config || { debugSimularTemporada: false };
    actualizarVisibilidadSimular();
    gameState.estiloPresion = data.estiloPresion || 'pesada';
    gameState.formacion = data.formacion || '4-4-2 Estándar';
    if (data.objetivoTemporada) {
        gameState.objetivoTemporada = data.objetivoTemporada;
    } else {
        var equipos = Database.getTeams(gameState.country, gameState.league);
        var eqData = null;
        for (var i = 0; i < equipos.length; i++) {
            if (equipos[i].name === gameState.team) { eqData = equipos[i]; break; }
        }
        gameState.objetivoTemporada = (eqData && eqData.target) || 'Evitar el descenso';
    }
    gameState.capitanId = data.capitanId || null;
    gameState.squad = data.squad || [];
    gameState.slotId = slotId;

    document.getElementById('topBarTitle').innerHTML = '<i class="fa-solid fa-futbol"></i> ' + gameState.team.toUpperCase();
    document.getElementById('gameTeamShort').innerText = gameState.team;
    document.getElementById('gameManagerShort').innerText = gameState.manager;
    document.getElementById('gameBudget').innerText = formatearPresupuesto(gameState.budget);

    document.getElementById('dashJornada').innerText = 'Jornada ' + (gameState.matchday || 1) + ' - Liga';
    document.getElementById('dashHomeTeam').innerText = gameState.team;
    document.getElementById('dashAwayTeam').innerText = gameState.opponent;
    document.getElementById('dashStadiumName').innerHTML = '<i class="fa-solid fa-location-dot"></i> ' + gameState.stadium;
    document.getElementById('stadiumName').innerText = gameState.stadium;
    document.getElementById('stadiumCapacity').innerText = (gameState.capacity || 0).toLocaleString() + ' esp.';

    renderSquadTable();
    _tacticInitDone = false;
    renderTacticPitch();
    generarCalendario();
    renderInbox();
    closeSlotsModal();
    goToScreen('screen-game');
}

function borrarPartida(slotId) {
    if (!confirm('¿Borrar partida del Slot ' + slotId + '?')) return;
    localStorage.removeItem('retro_fm_slot_' + slotId);
    renderSlots();
}

function listarPartidasGuardadas() {
    var slots = [];
    for (var i = 1; i <= 3; i++) {
        var raw = localStorage.getItem('retro_fm_slot_' + i);
        slots.push(raw ? JSON.parse(raw) : null);
    }
    return slots;
}

function openSlotsModal(mode) {
    document.getElementById('slotsModal').dataset.mode = mode || 'load';
    var title = mode === 'save' ? 'GUARDAR PARTIDA' : 'CARGAR PARTIDA';
    document.getElementById('slotsModalTitle').innerText = title;
    renderSlots();
    document.getElementById('slotsModal').classList.add('active');
}

function closeSlotsModal() {
    document.getElementById('slotsModal').classList.remove('active');
}

function renderSlots() {
    var container = document.getElementById('slotsContainer');
    container.innerHTML = '';
    var mode = document.getElementById('slotsModal').dataset.mode || 'load';
    var slots = listarPartidasGuardadas();

    slots.forEach(function (data, idx) {
        var slotNum = idx + 1;
        var card = document.createElement('div');
        card.className = 'slot-card' + (data ? '' : ' empty');

        if (data) {
            card.innerHTML =
                '<div class="slot-header">SLOT ' + slotNum + '</div>' +
                '<div class="slot-body">' +
                '<span class="slot-club">' + data.teamName + '</span>' +
                '<span class="slot-mgr"><i class="fa-solid fa-user"></i> ' + data.managerName + '</span>' +
                '<span class="slot-info"><i class="fa-solid fa-coins"></i> ' + data.budget + '</span>' +
                '<span class="slot-info"><i class="fa-solid fa-calendar"></i> ' + data.currentDate + '</span>' +
                '<span class="slot-date"><i class="fa-solid fa-clock"></i> ' + (data.realSaveDate || '') + '</span>' +
                '</div>' +
                '<div class="slot-actions">' +
                (mode === 'save'
                    ? '<button class="btn-retro green btn-sm" onclick="guardarPartida(' + slotNum + '); closeSlotsModal();">SOBREESCRIBIR</button>'
                    : '<button class="btn-retro green btn-sm" onclick="cargarPartida(' + slotNum + ');">CARGAR</button>') +
                '<button class="btn-retro danger btn-sm" onclick="borrarPartida(' + slotNum + ');">BORRAR</button>' +
                '</div>';
        } else {
            card.innerHTML =
                '<div class="slot-header">SLOT ' + slotNum + '</div>' +
                '<div class="slot-body" style="flex:1;display:flex;align-items:center;justify-content:center;">' +
                '<span style="color:#475569;font-size:18px;">Slot Vacío</span>' +
                '</div>' +
                '<div class="slot-actions">' +
                (mode === 'save'
                    ? '<button class="btn-retro green btn-sm" onclick="guardarPartida(' + slotNum + '); closeSlotsModal();">GUARDAR</button>'
                    : '') +
                '</div>';
        }

        container.appendChild(card);
    });
}

function previewSquad() {
    abrirPlantillaRival(gameState.team);
}

function closeSquadModal() {
    document.getElementById('squadModal').classList.remove('active');
}

function renderDorsalManager() {
    var select = document.getElementById('dorsalPlayerSelect');
    var grid = document.getElementById('tabDorsalGrid');
    ordenarPlantilla(gameState.squad);
    var squad = gameState.squad;

    var currentVal = select._saved;
    select.innerHTML = '<option value="">-- Ninguno --</option>';
    squad.forEach(function (p) {
        var opt = document.createElement('option');
        opt.value = p.id;
        opt.innerText = (p.dorsal ? '[' + p.dorsal + '] ' : '') + p.pos + ' - ' + p.name;
        if (p.id == currentVal) opt.selected = true;
        select.appendChild(opt);
    });

    select.onchange = function () {
        if (select.value === select._saved) {
            select.value = '';
        }
        select._saved = select.value;
        rebuild();
    };

    function rebuild() {
        grid.innerHTML = '';
        var sid = select.value ? parseInt(select.value) : null;
        var target = sid ? squad.find(function (p) { return p.id === sid; }) : null;

        for (var n = 1; n <= 99; n++) {
            var cell = document.createElement('div');
            cell.className = 'dorsal-cell';
            cell.dataset.num = n;

            var owner = squad.find(function (p) { return p.dorsal === n; });
            cell.dataset.ownerId = owner ? owner.id : '';

            var numSpan = document.createElement('span');
            numSpan.className = 'd-num';
            numSpan.innerText = n;
            cell.appendChild(numSpan);

            var infoSpan = document.createElement('span');
            infoSpan.className = 'd-info';
            if (owner) {
                cell.classList.add('occupied');
                infoSpan.innerText = owner.pos + ' ' + owner.name;
                if (owner === target) cell.classList.add('selected');
            } else {
                cell.classList.add('free');
                infoSpan.innerText = 'Libre';
            }
            cell.appendChild(infoSpan);

            grid.appendChild(cell);
        }

        grid._selCell = null;
        grid.onclick = function (e) {
            var cell = e.target.closest('.dorsal-cell');
            if (!cell) return;
            var num = parseInt(cell.dataset.num);
            if (!num) return;

            var ownerId = cell.dataset.ownerId ? parseInt(cell.dataset.ownerId) : null;

            if (ownerId) {
                if (grid._selCell === cell) {
                    cell.classList.remove('selected');
                    grid._selCell = null;
                    return;
                }

                if (grid._selCell) {
                    var prevOwnerId = grid._selCell.dataset.ownerId ? parseInt(grid._selCell.dataset.ownerId) : null;
                    if (prevOwnerId && prevOwnerId !== ownerId) {
                        var prevNum = parseInt(grid._selCell.dataset.num);
                        var playerA = squad.find(function (p) { return p.id === prevOwnerId; });
                        var playerB = squad.find(function (p) { return p.id === ownerId; });
                        if (playerA && playerB) {
                            playerA.dorsal = num;
                            playerB.dorsal = prevNum;
                        }
                        grid._selCell.classList.remove('selected');
                        grid._selCell = null;
                        renderSquadTable();
                        rebuild();
                        return;
                    }
                }

                grid.querySelectorAll('.dorsal-cell.selected').forEach(function (c) { c.classList.remove('selected'); });
                cell.classList.add('selected');
                grid._selCell = cell;
                return;
            }

            var selVal = select.value;
            if (!selVal) return;
            var t = squad.find(function (p) { return p.id === parseInt(selVal); });
            if (!t) return;

            t.dorsal = num;
            renderSquadTable();
            select._saved = select.value;
            rebuild();
        };
    }

    select._saved = select.value;
    rebuild();
}

function switchPlayerSubTab(btn, tabId) {
    document.querySelectorAll('#playerModal .player-subtab').forEach(function (t) { t.style.display = 'none'; });
    document.getElementById(tabId).style.display = 'grid';
    document.querySelectorAll('#playerModal .btn-retro.btn-sm').forEach(function (b) { b.classList.remove('active'); });
    btn.classList.add('active');
}

var _playerModalId = null;
var _intentosCesion = {};

function buscarEnSquad(id) {
    for (var i = 0; i < gameState.squad.length; i++) {
        if (gameState.squad[i].id === id) return gameState.squad[i];
    }
    return null;
}

function actualizarBotonesMercado(p) {
    var btnT = document.getElementById('btnTransferible');
    var btnC = document.getElementById('btnCedible');
    if (btnT) {
        btnT.style.cssText = p.enTransferibles
            ? 'font-size:8px;background:#92400e;border-color:#f59e0b;color:#fbbf24;'
            : 'font-size:8px;background:#182230;border-color:#28374d;color:#94a3b8;';
        btnT.innerText = (p.enTransferibles ? '\u2713 ' : '') + 'Transferible';
    }
    if (btnC) {
        btnC.style.cssText = p.enCedibles
            ? 'font-size:8px;background:#1e3a5f;border-color:#38bdf8;color:#38bdf8;'
            : 'font-size:8px;background:#182230;border-color:#28374d;color:#94a3b8;';
        btnC.innerText = (p.enCedibles ? '\u2713 ' : '') + 'Cedible';
    }
}

function toggleTransferible() {
    var p = buscarEnSquad(_playerModalId);
    if (!p) return;
    p.enTransferibles = !p.enTransferibles;
    actualizarBotonesMercado(p);
    renderSquadTable();
    renderSquadStats();
}

function toggleCedible() {
    var p = buscarEnSquad(_playerModalId);
    if (!p) return;
    p.enCedibles = !p.enCedibles;
    if (!p.enCedibles && _intentosCesion[p.id]) delete _intentosCesion[p.id];
    actualizarBotonesMercado(p);
    renderSquadTable();
    renderSquadStats();
    if (p.enCedibles && esMercadoAbierto()) {
        buscarYOfertarCesion(p);
    }
}

function toggleRolSelector() {
    var c = document.getElementById('rolSelectorContainer');
    if (c) c.style.display = c.style.display === 'block' ? 'none' : 'block';
}

function cambiarRol(rol) {
    var p = buscarEnSquad(_playerModalId);
    if (!p) return;
    p.rol = rol;
    document.getElementById('playerModalRol').innerHTML = getRolIcon(rol) + ' ' + getRolTexto(rol) + ' <i class="fa-solid fa-pen" style="font-size:9px;color:#64748b;margin-left:4px;"></i>';
    document.getElementById('rolSelectorContainer').style.display = 'none';
    var opts = document.getElementById('rolSelectorContainer').querySelectorAll('.rol-option');
    opts.forEach(function(o) {
        var ico = o.querySelector('i');
        if (o.getAttribute('onclick').indexOf("'" + rol + "'") !== -1) {
            o.style.background = '#1e293b';
            if (ico) ico.style.opacity = '1';
        } else {
            o.style.background = '';
            if (ico) ico.style.opacity = '0.5';
        }
    });
    renderSquadTable();
    renderSquadStats();
}

function showPlayerDetail(p, esPropio) {
    _playerModalId = p.id;
    document.getElementById('playerModalDorsal').innerText = '#' + (p.dorsal || p.id || '-');
    document.getElementById('playerModalPos').className = 'pos-badge pos-' + p.pos;
    document.getElementById('playerModalPos').innerText = p.pos;
    document.getElementById('playerModalName').innerText = p.name;
    document.getElementById('playerModalFullName').innerText = p.fullName || '';
    document.getElementById('playerModalNation').innerHTML = flagEmoji(p.nationality) + ' <span style="font-size: 14px; color: #94a3b8;">' + (p.nationality || '').toUpperCase() + '</span>';
    document.getElementById('playerModalAge').innerText = p.age + ' años';
    document.getElementById('playerModalHeight').innerText = p.height ? p.height + ' cm' : '-';
    var diffRat = p.rating - (p._oldRating || p.rating);
    var ratDisplay = p.rating;
    if (diffRat !== 0) ratDisplay += ' <span style="color:' + (diffRat > 0 ? '#22c55e' : '#ef4444') + ';font-size:10px;">(' + (diffRat > 0 ? '+' : '') + diffRat + ')</span>';
    document.getElementById('playerModalRating').innerHTML = ratDisplay;

    var oldValNum = parseFloat((p._oldVal || '0').replace('M', '').replace('€', ''));
    var curValNum = parseFloat((p.val || '0').replace('M', '').replace('€', ''));
    var diffVal = curValNum - oldValNum;
    var valDisplay = p.val;
    if (diffVal !== 0 && !isNaN(diffVal)) valDisplay += ' <span style="color:' + (diffVal > 0 ? '#22c55e' : '#ef4444') + ';font-size:9px;">(' + (diffVal > 0 ? '+' : '') + diffVal.toFixed(1) + 'M€)</span>';
    document.getElementById('playerModalVal').innerHTML = valDisplay;
    document.getElementById('playerModalStamina').innerText = p.stamina || '100%';
    var rolActual = p.rol || 'rotacion';
    if (esPropio) {
        document.getElementById('playerModalRol').innerHTML = getRolIcon(rolActual) + ' ' + getRolTexto(rolActual) + ' <i class="fa-solid fa-pen" style="font-size:9px;color:#64748b;margin-left:4px;"></i>';
        document.getElementById('rolSelectorContainer').style.display = 'none';
        var opts = document.getElementById('rolSelectorContainer').querySelectorAll('.rol-option');
        opts.forEach(function(o) {
            var ico = o.querySelector('i');
            if (o.getAttribute('onclick').indexOf("'" + rolActual + "'") !== -1) {
                o.style.background = '#1e293b';
                if (ico) ico.style.opacity = '1';
            } else {
                o.style.background = '';
                if (ico) ico.style.opacity = '0.5';
            }
        });
    } else {
        document.getElementById('playerModalRol').innerHTML = getRolIcon(rolActual) + ' ' + getRolTexto(rolActual);
        document.getElementById('rolSelectorContainer').style.display = 'none';
    }
    var m = p.moral || 4;
    var moralTexts = { 5: 'Excelente', 4: 'Buena', 3: 'Normal', 2: 'Baja', 1: 'Muy Baja' };
    document.getElementById('playerModalMoral').innerHTML = getMoralIcon(p) + ' ' + (moralTexts[m] || 'Buena') + ' (' + m + '/5)';
    var st = p.statsTemporada || {};
    document.getElementById('pPJ').innerText = st.partidos || 0;
    document.getElementById('pGOL').innerText = st.goles || 0;
    document.getElementById('pASI').innerText = st.asistencias || 0;
    document.getElementById('pTA').innerText = st.ta || 0;
    document.getElementById('pTR').innerText = st.tr || 0;
    var avgNota = st.promedioNotas || 0;
    document.getElementById('pNOTA').innerText = avgNota > 0 ? avgNota.toFixed(1) : '-';
    document.querySelectorAll('#playerModal .player-subtab').forEach(function (t) { t.style.display = 'none'; });
    document.getElementById('pinfo').style.display = 'grid';
    document.querySelectorAll('#playerModal .btn-retro.btn-sm').forEach(function (b) { b.classList.remove('active'); });
    var btns = document.querySelectorAll('#playerModal .btn-retro.btn-sm');
    if (btns.length > 0) btns[0].classList.add('active');

    document.getElementById('playerModalMyBtns').style.display = esPropio ? 'flex' : 'none';
    document.getElementById('playerModalRivalBtns').style.display = esPropio ? 'none' : 'flex';

    if (esPropio) actualizarBotonesMercado(p);
    document.getElementById('playerModal').style.zIndex = '300';
    document.getElementById('playerModal').classList.add('active');
}

function closePlayerModal() {
    document.getElementById('playerModal').style.zIndex = '';
    document.getElementById('playerModal').classList.remove('active');
}

function buscarJugadorEnLiga(id) {
    var equipos = obtenerTodosEquipos();
    for (var e = 0; e < equipos.length; e++) {
        if (equipos[e].name === gameState.team) continue;
        var sq = _cachedSquads[equipos[e].name] || equipos[e].squad || [];
        for (var j = 0; j < sq.length; j++) {
            if (sq[j].id === id) return { jugador: sq[j], equipo: equipos[e].name };
        }
    }
    return null;
}

function ofertarTraspasoModal() {
    closePlayerModal();
    var encontrado = buscarJugadorEnLiga(_playerModalId);
    if (!encontrado) { showModal('ERROR', 'Jugador no encontrado.'); return; }
    var jugador = encontrado.jugador;
    var precioBase = calcularPrecioOferta(jugador, jugador.enTransferibles);
    document.getElementById('ofertaJugadorNombre').innerText = jugador.name + ' (' + jugador.pos + ', ' + jugador.rating + ')';
    document.getElementById('ofertaJugadorVal').innerText = jugador.val;
    document.getElementById('ofertaPresupuesto').innerText = formatearPresupuesto(gameState.budget);
    var input = document.getElementById('inputOfertaTraspaso');
    input.value = precioBase.toFixed(1);
    input.min = '0.5';
    input.step = '0.1';
    input.dataset.jugadorId = jugador.id;
    input.dataset.equipoOrigen = encontrado.equipo;
    document.getElementById('modalOfertaTraspaso').classList.add('active');
    document.getElementById('modalOfertaTraspaso').style.zIndex = '400';
    setTimeout(function () { input.focus(); input.select(); }, 100);
}

function confirmarOfertaTraspaso() {
    var input = document.getElementById('inputOfertaTraspaso');
    var precioOferta = parseFloat(input.value.replace(',', '.'));
    if (isNaN(precioOferta) || precioOferta <= 0) { showModal('ERROR', 'Introduce un importe válido.'); return; }
    if (precioOferta > gameState.budget) {
        showModal('PRESUPUESTO', 'No tienes suficiente presupuesto. Dispones de ' + formatearPresupuesto(gameState.budget) + '.');
        return;
    }
    var jugadorId = parseInt(input.dataset.jugadorId);
    var equipoOrigen = input.dataset.equipoOrigen;
    document.getElementById('modalOfertaTraspaso').classList.remove('active');
    ficharJugador(jugadorId, equipoOrigen, precioOferta);
}

function ofertarCesionModal() {
    closePlayerModal();
    var encontrado = buscarJugadorEnLiga(_playerModalId);
    if (!encontrado) { showModal('ERROR', 'Jugador no encontrado.'); return; }
    var jugador = encontrado.jugador;
    document.getElementById('cesionJugadorNombre').innerText = jugador.name + ' (' + jugador.pos + ', ' + jugador.rating + ')';
    document.getElementById('cesionEquipoOrigen').innerText = encontrado.equipo;
    document.getElementById('modalOfertaCesion').dataset.jugadorId = jugador.id;
    document.getElementById('modalOfertaCesion').dataset.equipoOrigen = encontrado.equipo;
    document.getElementById('modalOfertaCesion').dataset.jugadorNombre = jugador.name;
    document.getElementById('modalOfertaCesion').dataset.jugadorPos = jugador.pos;
    document.getElementById('modalOfertaCesion').dataset.jugadorRating = jugador.rating;
    document.getElementById('modalOfertaCesion').classList.add('active');
    document.getElementById('modalOfertaCesion').style.zIndex = '400';
}

function seleccionarDuracionCesion(btn) {
    var padres = btn.parentNode;
    padres.querySelectorAll('.cesion-duracion').forEach(function (b) {
        b.classList.remove('active');
        b.style.background = '';
        b.style.borderColor = '';
        b.style.color = '';
    });
    btn.classList.add('active');
    btn.style.background = '#1e3a5f';
    btn.style.borderColor = '#38bdf8';
    btn.style.color = '#38bdf8';
}

function confirmarOfertaCesion() {
    var modal = document.getElementById('modalOfertaCesion');
    var durBtn = modal.querySelector('.cesion-duracion.active');
    if (!durBtn) { showModal('ERROR', 'Selecciona una duración.'); return; }
    var dur = parseFloat(durBtn.dataset.duracion);
    var jugadorId = parseInt(modal.dataset.jugadorId);
    var equipoOrigen = modal.dataset.equipoOrigen;
    var jugadorNombre = modal.dataset.jugadorNombre;
    var jugadorPos = modal.dataset.jugadorPos;
    var jugadorRating = modal.dataset.jugadorRating;
    modal.classList.remove('active');
    enviarMensaje('Dirección Deportiva', '\uD83d\uDcc4 Solicitud de cesi\u00f3n',
        'El ' + gameState.team + ' solicita la cesi\u00f3n de ' + jugadorNombre + ' (' + jugadorPos + ', ' + jugadorRating + ') del ' + equipoOrigen + ' por ' + dur + ' temporada(s).');
    renderInbox();
    showModal('CESI\u00d3N', 'Solicitud de cesi\u00f3n enviada al ' + equipoOrigen + '. Revisa tu bandeja de entrada para conocer la respuesta.');
}

function cerrarModalOferta(id) {
    document.getElementById(id).classList.remove('active');
}

populateCountries();
