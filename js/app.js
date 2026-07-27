const gameState = {
    country: 'España',
    league: 'Primera División',
    team: 'Real Madrid',
    teamId: 'Real Madrid',
    budget: 15.0,
    manager: 'Mánager Retro',
    stadium: 'Santiago Bernabéu',
    capacity: 81044,
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
    fixtureGenerado: false,
    mensajes: [],
    ultimoIdMensaje: 0,
    historialTraspasos: [],
    estiloPresion: 'pesada',
    formacion: '4-4-2 Estándar',
    capitanId: null
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
                html += '<button class="btn-retro btn-sm" onclick="event.stopPropagation();' + act.fn + '" style="font-size:7px;">' + act.texto + '</button> ';
            }
            html += '</div>';
        }
        html += '</div>';
    }
    if (gameState.mensajes.length === 0) {
        html = '<div style="color:#64748b;font-size:14px;text-align:center;padding:10px;">Bandeja vacía. Los mensajes aparecerán aquí.</div>';
    }
    container.innerHTML = html;
    var badge = document.getElementById('inboxBadge');
    if (badge) badge.innerText = noLeidos > 0 ? noLeidos : '';
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
            statsTemporada: { partidos: 0, goles: 0, asistencias: 0, ta: 0, tr: 0, historialNotas: [], promedioNotas: 0 }
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
        nl: '🇳🇱', 'gb': '🇬🇧', eng: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', de: '🇩🇪', pt: '🇵🇹', pl: '🇵🇱',
        hu: '🇭🇺', dk: '🇩🇰', uy: '🇺🇾', se: '🇸🇪', be: '🇧🇪',
        at: '🇦🇹', ch: '🇨🇭', jp: '🇯🇵', kr: '🇰🇷', ng: '🇳🇬',
                ma: '🇲🇦', sn: '🇸🇳', ci: '🇨🇮', cm: '🇨🇲', gh: '🇬🇭', gw: '🇬🇼', ua: '🇺🇦', tr: '🇹🇷', si: '🇸🇮', sk: '🇸🇰', no: '🇳🇴', ro: '🇷🇴', gn: '🇬🇳', gq: '🇬🇶', my: '🇲🇾', fi: '🇫🇮', ml: '🇲🇱', rs: '🇷🇸', dz: '🇩🇿', do: '🇩🇴',
        us: '🇺🇸', mx: '🇲🇽', co: '🇨🇴', cl: '🇨🇱', pe: '🇵🇪'
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
    cl: 'Chile', pe: 'Perú'
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

function startGame() {
    gameState.manager = document.getElementById('managerName').value || 'Mánager Retro';
    gameState.teamId = gameState.team;
    gameState.currentDate = 'Temporada 2026-27 - Jornada 1';
    if (!gameState.squad || gameState.squad.length === 0) {
        gameState.squad = generateSquad(gameState.rating);
    }

    renderSquadTable();
    asignarGruposIniciales();
    renderTacticPitch();
    generarCalendario();

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

    enviarMensaje('Secretaría Técnica', 'Bienvenido al club',
        '¡Enhorabuena ' + gameState.manager + '! Has sido presentado como nuevo entrenador del ' + gameState.team + '. ' +
        'Dispones de un presupuesto de ' + formatearPresupuesto(gameState.budget) + ' para afrontar la temporada.');
    enviarMensaje('Oficina de Prensa', 'Comienza la temporada',
        'La temporada 2026-27 arranca con la jornada 1. Tu primer rival será el ' + gameState.opponent + '. ¡Buena suerte!');
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
    } else {
        panel.style.display = 'none';
        layout.style.gridTemplateColumns = '140px 1fr';
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
        poblarSelectoresClasificacion();
        renderClasificacion();
    }
}

function switchSquadSubTab(btn, tabId) {
    document.querySelectorAll('#tab-plantilla .squad-subtab').forEach(function (t) { t.style.display = 'none'; });
    document.getElementById(tabId).style.display = 'flex';
    document.querySelectorAll('#tab-plantilla .btn-retro.btn-sm').forEach(function (b) { b.classList.remove('active'); });
    btn.classList.add('active');
    if (tabId === 'squad-stats') renderSquadStats();
}

function renderSquadStats() {
    var tbody = document.getElementById('squadStatsBody');
    tbody.innerHTML = '';
    gameState.squad.forEach(function (p) {
        var st = p.statsTemporada || {};
        var tr = document.createElement('tr');
        tr.innerHTML =
            '<td><span class="dorsal-badge">' + (p.dorsal || '-') + '</span></td>' +
            '<td><span class="pos-badge pos-' + p.pos + '">' + p.pos + '</span></td>' +
            '<td>' + p.name + getEstadoIcono(p) + '</td>' +
            '<td style="font-size: 20px;">' + flagEmoji(p.nationality) + '</td>' +
            '<td>' + (st.partidos || 0) + '</td>' +
            '<td style="color:#10b981;">' + (st.goles || 0) + '</td>' +
            '<td style="color:#38bdf8;">' + (st.asistencias || 0) + '</td>' +
            '<td style="color:#facc15;">' + (st.ta || 0) + '</td>' +
            '<td style="color:#fca5a5;">' + (st.tr || 0) + '</td>';
        tr.onclick = function () { showPlayerDetail(p); };
        tbody.appendChild(tr);
    });
}

function renderSquadTable() {
    const tbody = document.getElementById('squadTableBody');
    tbody.innerHTML = '';

    gameState.squad.forEach(function (p) {
        const tr = document.createElement('tr');
        tr.innerHTML =
            '<td><span class="dorsal-badge">' + (p.dorsal || '-') + '</span></td>' +
            '<td><span class="pos-badge pos-' + p.pos + '">' + p.pos + '</span></td>' +
            '<td>' + p.name + getEstadoIcono(p) + '</td>' +
            '<td style="font-size: 20px;">' + flagEmoji(p.nationality) + '</td>' +
            '<td>' + p.age + '</td>' +
            '<td style="color:#6ee7b7;font-weight:bold;">' + p.rating + '</td>' +
            '<td>' + (p.stamina || '100%') + '</td>' +
            '<td>' + p.val + '</td>';
        tr.onclick = function () { showPlayerDetail(p); };
        tbody.appendChild(tr);
    });
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
            statsTemporada: { partidos: 0, goles: 0, asistencias: 0, ta: 0, tr: 0, historialNotas: [], promedioNotas: 0 }
        });
    }
    return squad;
}

function generarPalmaresClub(rating) {
    var ligas = rating >= 85 ? 3 + Math.floor(Math.random() * 4) : rating >= 75 ? 1 + Math.floor(Math.random() * 3) : Math.floor(Math.random() * 2);
    var copas = rating >= 80 ? 2 + Math.floor(Math.random() * 3) : rating >= 70 ? 1 + Math.floor(Math.random() * 2) : Math.floor(Math.random());
    var champions = rating >= 88 ? 1 + Math.floor(Math.random() * 2) : rating >= 82 ? Math.floor(Math.random() * 2) : 0;
    return { ligas: ligas, copas: copas, champions: champions };
}
function generarHistorialPosiciones(rating) {
    var temp = [];
    var base = Math.max(1, 20 - Math.round(rating / 4.5));
    for (var i = 0; i < 5; i++) {
        var v = Math.floor(Math.random() * 5) - 2;
        temp.push(Math.max(1, Math.min(20, base + v)));
    }
    return temp;
}

function abrirPlantillaRival(nombreEquipo) {
    var equiposDB = Database.getTeams(gameState.country, gameState.league);
    var equipoData = null;
    for (var i = 0; i < equiposDB.length; i++) {
        if (equiposDB[i].name === nombreEquipo) { equipoData = equiposDB[i]; break; }
    }

    document.getElementById('rivalModalIcon').textContent = '🏟️';
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
        genHtml += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:12px;color:#e2e8f0;">' +
            '<div class="stat-row"><span>Estadio</span><span class="stat-val">' + (equipoData.stadium || '—') + '</span></div>' +
            '<div class="stat-row"><span>Capacidad</span><span class="stat-val">' + ((equipoData.capacity || 0).toLocaleString()) + '</span></div>' +
            '<div class="stat-row"><span>Presupuesto</span><span class="stat-val" style="color:#facc15;">' + (equipoData.budget || '—') + '</span></div>' +
            '<div class="stat-row"><span>Objetivo</span><span class="stat-val" style="color:#38bdf8;">' + (equipoData.target || '—') + '</span></div>' +
            '</div>';
    } else {
        genHtml += '<div style="color:#94a3b8;font-size:12px;padding:4px;">No hay datos disponibles.</div>';
    }
    var calc = calcularRatingEquipo(squad);
    genHtml += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr 1fr;gap:4px;text-align:center;padding:6px 0;margin-top:4px;border-top:1px solid #1e293b;">' +
        '<div><span style="font-size:10px;color:#94a3b8;">GLO</span><br><span style="font-size:22px;color:#38bdf8;">' + calc.glo + '</span></div>' +
        '<div><span style="font-size:10px;color:#94a3b8;">POR</span><br><span style="font-size:22px;color:#7c3aed;">' + calc.por + '</span></div>' +
        '<div><span style="font-size:10px;color:#94a3b8;">DEF</span><br><span style="font-size:22px;color:#b91c1c;">' + calc.def + '</span></div>' +
        '<div><span style="font-size:10px;color:#94a3b8;">MED</span><br><span style="font-size:22px;color:#ea580c;">' + calc.med + '</span></div>' +
        '<div><span style="font-size:10px;color:#94a3b8;">ATA</span><br><span style="font-size:22px;color:#15803d;">' + calc.ata + '</span></div>' +
        '</div>';
    document.getElementById('rivalGeneralContent').innerHTML = genHtml;

    // PLANTILLA
    var htmlInfo = '<table class="squad-table" style="font-size:12px;"><thead><tr>' +
        '<th>#</th><th>Pos</th><th>Jugador</th><th>Nac</th><th>Edad</th><th>Med</th><th>Est</th><th>Valor</th>' +
        '</tr></thead><tbody>';
    squad.forEach(function(p){
        htmlInfo += '<tr class="rival-player-row" data-rid="' + p.id + '" style="cursor:pointer;">' +
            '<td><span class="dorsal-badge" style="width:22px;height:22px;font-size:9px;">' + (p.dorsal || '-') + '</span></td>' +
            '<td><span class="pos-badge pos-' + p.pos + '" style="font-size:10px;width:24px;">' + p.pos + '</span></td>' +
            '<td style="font-size:11px;">' + p.name + getEstadoIcono(p) + '</td>' +
            '<td style="font-size:16px;">' + flagEmoji(p.nationality) + '</td>' +
            '<td>' + p.age + '</td>' +
            '<td style="color:#6ee7b7;font-weight:bold;">' + p.rating + '</td>' +
            '<td>' + (p.stamina || '100%') + '</td>' +
            '<td>' + p.val + '</td></tr>';
    });
    htmlInfo += '</tbody></table>';

    var htmlStats = '<table class="squad-table" style="font-size:12px;"><thead><tr>' +
        '<th>#</th><th>Pos</th><th>Jugador</th><th>Nac</th><th>PJ</th><th>GOL</th><th>ASI</th><th>TA</th><th>TR</th>' +
        '</tr></thead><tbody>';
    squad.forEach(function(p){
        var st = p.statsTemporada || {};
        htmlStats += '<tr class="rival-player-row" data-rid="' + p.id + '" style="cursor:pointer;">' +
            '<td><span class="dorsal-badge" style="width:22px;height:22px;font-size:9px;">' + (p.dorsal || '-') + '</span></td>' +
            '<td><span class="pos-badge pos-' + p.pos + '" style="font-size:10px;width:24px;">' + p.pos + '</span></td>' +
            '<td style="font-size:11px;">' + p.name + getEstadoIcono(p) + '</td>' +
            '<td style="font-size:16px;">' + flagEmoji(p.nationality) + '</td>' +
            '<td>' + (st.partidos || 0) + '</td>' +
            '<td style="color:#10b981;">' + (st.goles || 0) + '</td>' +
            '<td style="color:#38bdf8;">' + (st.asistencias || 0) + '</td>' +
            '<td style="color:#facc15;">' + (st.ta || 0) + '</td>' +
            '<td style="color:#fca5a5;">' + (st.tr || 0) + '</td></tr>';
    });
    htmlStats += '</tbody></table>';

    document.getElementById('rinfo').innerHTML = htmlInfo;
    document.getElementById('rstats').innerHTML = htmlStats;

    document.querySelectorAll('#modalRival .rival-player-row').forEach(function(el){
        el.onclick = function(){
            var pid = parseInt(this.dataset.rid);
            for (var j = 0; j < squad.length; j++) {
                if (squad[j].id === pid) { showPlayerDetail(squad[j]); break; }
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
            var icono = t.tipo === 'compra' ? '💰' : t.tipo === 'venta' ? '💵' : '🔄';
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
    var palmares = generarPalmaresClub(rating);
    var historico = generarHistorialPosiciones(rating);
    var tempActual = new Date().getFullYear();
    var histHtml = '' +
        '<div style="font-size:11px;color:#38bdf8;padding:2px 4px;border-bottom:1px solid #1e293b;margin-bottom:4px;">🏆 PALMARÉS</div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;padding:4px;">' +
        '<div style="background:#0f172a;border:1px solid #334155;border-radius:4px;padding:6px 10px;text-align:center;min-width:70px;">' +
        '<span style="font-size:20px;">🏆</span><br><span style="font-size:18px;color:#facc15;font-weight:bold;">' + palmares.ligas + '</span><br><span style="font-size:9px;color:#94a3b8;">Ligas</span></div>' +
        '<div style="background:#0f172a;border:1px solid #334155;border-radius:4px;padding:6px 10px;text-align:center;min-width:70px;">' +
        '<span style="font-size:20px;">🏅</span><br><span style="font-size:18px;color:#38bdf8;font-weight:bold;">' + palmares.copas + '</span><br><span style="font-size:9px;color:#94a3b8;">Copas</span></div>' +
        '<div style="background:#0f172a;border:1px solid #334155;border-radius:4px;padding:6px 10px;text-align:center;min-width:70px;">' +
        '<span style="font-size:20px;">⭐</span><br><span style="font-size:18px;color:#6ee7b7;font-weight:bold;">' + palmares.champions + '</span><br><span style="font-size:9px;color:#94a3b8;">Champions</span></div>' +
        '</div>' +
        '<div style="font-size:11px;color:#38bdf8;padding:2px 4px;border-bottom:1px solid #1e293b;margin:4px 0;">📊 HISTÓRICO LIGA</div>' +
        '<div style="display:flex;gap:4px;padding:4px;justify-content:center;">';
    for (var t = 0; t < 5; t++) {
        var anio = tempActual - 5 + t;
        var p = historico[t];
        var col = p <= 4 ? '#49CB2B' : p <= 8 ? '#38bdf8' : p <= 14 ? '#bcbcbc' : '#ED3B46';
        histHtml += '<div style="background:#0f172a;border:1px solid #334155;border-radius:4px;padding:4px 6px;text-align:center;min-width:40px;">' +
            '<span style="font-size:8px;color:#64748b;">' + anio + '</span><br>' +
            '<span style="font-size:16px;color:' + col + ';font-weight:bold;">' + p + 'º</span></div>';
    }
    histHtml += '</div>';
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
    todos.forEach(function(p) {
        var avg = p.statsTemporada ? (p.statsTemporada.promedioNotas || 0) : 0;
        var partidos = p.statsTemporada ? (p.statsTemporada.partidos || 0) : 0;
        var cambio = 0;

        if (p.age <= 29) {
            if (avg >= 7.2 && partidos >= 5) cambio = Math.floor(Math.random() * 3) + 2;
            else if (avg >= 6.3 && partidos >= 5) cambio = Math.floor(Math.random() * 2);
            else cambio = -(Math.floor(Math.random() * 2) + 1);
        } else {
            if (avg >= 7.3 && partidos >= 5) cambio = 0;
            else if (avg > 0 || partidos > 0) cambio = -(Math.floor(Math.random() * 3) + 1);
            else cambio = -(Math.floor(Math.random() * 2) + 1);
        }

        p.rating = Math.min(99, Math.max(40, (p.rating || 75) + cambio));
        var valNum = p.rating * 0.12;
        valNum = Math.max(0.1, valNum);
        p.val = valNum.toFixed(1) + 'M\u20ac';
    });
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

function iniciarNuevaTemporada() {
    procesarEvolucionRendimiento();

    var todos = obtenerTodosJugadoresLiga();
    todos.forEach(function(p) {
        p.age = (p.age || 20) + 1;
        p.statsTemporada = { partidos: 0, goles: 0, asistencias: 0, ta: 0, tr: 0, historialNotas: [], promedioNotas: 0 };
        p.pj = 0; p.gol = 0; p.asi = 0; p.ta = 0; p.tr = 0;
        p.lesionSemanas = 0; p.sancionSemanas = 0; p.tarjetasAmarillasAcum = 0;
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
    renderInbox();
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
    xi.forEach(function(p) {
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
        if (esSuplenteEntrado(p.id)) badges += '\uD83D\uDFE2 ';

        var stam = parseInt(p.stamina) || 100;
        var stamColor = stam > 60 ? '#22c55e' : stam > 30 ? '#eab308' : '#ef4444';

        html += '<div class="match-nota-row">' +
            '<span class="mn-dorsal">[' + (p.dorsal || '-') + ']</span>' +
            '<span class="mn-nombre">' + p.name + '</span>' +
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

function calcularPrecio(rating) {
    var base = Math.pow(rating / 10, 3) * 0.1;
    return Math.round(Math.max(0.5, base) * 100) / 100;
}

function getPrimerDorsalLibre() {
    var usados = {};
    if (gameState.squad) { gameState.squad.forEach(function(p){ if (p.dorsal) usados[p.dorsal] = true; }); }
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
        var icono = t.tipo === 'compra' ? '💰' : t.tipo === 'venta' ? '💵' : '🔄';
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
        lista.innerHTML = '<div style="color:#64748b;text-align:center;padding:10px;font-size:12px;">No se encontraron jugadores con esos filtros.</div>';
        return;
    }

    var mostrar = filtrados.slice(0, _mercadoLimite);
    var html = '<div style="font-size:11px;color:#38bdf8;padding:4px 2px;border-bottom:1px solid #1e293b;margin-bottom:2px;">JUGADORES DISPONIBLES (' + filtrados.length + ')</div>';
    mostrar.forEach(function(item, idx) {
        var j = item.jugador;
        var precio = calcularPrecio(j.rating);
        var color = getColorLinea(j.pos);
        var badge = '<span class="pos-badge" style="background:' + color + ';color:#fff;font-size:10px;width:28px;padding:1px 0;">' + j.pos + '</span>';
        var puedeComprar = gameState.budget >= precio;
        html += '<div class="tactic-list-item" data-midx="' + idx + '" style="cursor:pointer;">' +
            badge + ' ' +
            '<span class="p-name" style="font-size:11px;flex:1;"> ' + j.name + getEstadoIcono(j) + '</span>' +
            '<span style="font-size:15px;">' + flagEmoji(j.nationality) + '</span>' +
            '<span style="font-size:10px;color:#94a3b8;min-width:20px;text-align:center;">' + j.age + '</span>' +
            '<span style="font-size:10px;color:#6ee7b7;font-weight:bold;min-width:20px;text-align:center;">' + j.rating + '</span>' +
            '<span style="font-size:10px;color:#94a3b8;min-width:50px;text-align:right;">' + j.val + '</span>' +
            '<span style="font-size:10px;color:#eab308;min-width:44px;text-align:right;">' + precio.toFixed(1) + 'M€</span>' +
            (puedeComprar
                ? '<button class="btn-retro btn-sm" onclick="event.stopPropagation();comprarJugador(' + j.id + ',\'' + item.equipo + '\',' + precio + ')" style="font-size:7px;padding:2px 4px;margin-left:2px;">💰</button>'
                : '<span style="font-size:9px;color:#ef4444;margin-left:4px;min-width:16px;">🚫</span>') +
            '</div>';
    });
    if (filtrados.length > _mercadoLimite) {
        html += '<div class="tactic-list-item" style="cursor:pointer;justify-content:center;padding:6px;" onclick="javascript:_mercadoLimite+=20;renderMercado();">' +
            '<span style="font-size:11px;color:#38bdf8;">📄 Ver más (' + (filtrados.length - _mercadoLimite) + ' restantes)</span></div>';
    }
    lista.innerHTML = html;

    lista.querySelectorAll('.tactic-list-item[data-midx]').forEach(function(el) {
        el.onclick = function() {
            var idx = parseInt(this.dataset.midx);
            if (idx >= 0 && idx < mostrar.length) {
                showPlayerDetail(mostrar[idx].jugador);
            }
        };
    });
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
    if (gameState.budget < precio) { showModal('PRESUPUESTO', 'No tienes fondos suficientes para fichar a ' + jugador.name + '.'); return; }

    gameState.budget -= precio;
    var nuevoId = 1000 + Math.floor(Math.random() * 9000);
    var dorsal = getPrimerDorsalLibre();
    var nuevoJugador = JSON.parse(JSON.stringify(jugador));
    nuevoJugador.id = nuevoId;
    nuevoJugador.dorsal = dorsal;
    nuevoJugador.grupo = null;
    if (!nuevoJugador.statsTemporada) nuevoJugador.statsTemporada = { partidos: 0, goles: 0, asistencias: 0, ta: 0, tr: 0 };
    gameState.squad.push(nuevoJugador);
    squadOrigen.splice(idx, 1);

    if (!gameState.historialTraspasos) gameState.historialTraspasos = [];
    gameState.historialTraspasos.unshift({
        fecha: 'J' + (gameState.matchday || 1),
        tipo: 'compra',
        jugador: jugador.name,
        desde: equipoOrigen,
        para: gameState.team,
        precio: precio,
        pos: jugador.pos,
        rating: jugador.rating
    });

    enviarMensaje('Secretaría Técnica', '✍️ Fichaje completado',
        'Se ha cerrado el fichaje de ' + jugador.name + ' procedente del ' + equipoOrigen + ' por ' + precio.toFixed(1) + 'M€. Dorsal #' + dorsal + '.');
    _mercadoLimite = 20;
    renderMercado();
    document.getElementById('gameBudget').innerText = formatearPresupuesto(gameState.budget);
    showModal('FICHAJE', jugador.name + ' se une al ' + gameState.team + ' con el dorsal #' + dorsal + '. Coste: ' + precio.toFixed(1) + 'M€.');
}

function aceptarOferta(jugadorId, precio) {
    for (var i = 0; i < gameState.squad.length; i++) {
        if (gameState.squad[i].id === jugadorId) {
            var p = gameState.squad[i];
            var jugadorName = p.name;
            var jugadorPos = p.pos;
            var jugadorRating = p.rating;
            gameState.budget += precio;
            gameState.squad.splice(i, 1);
            if (!gameState.historialTraspasos) gameState.historialTraspasos = [];
            gameState.historialTraspasos.unshift({
                fecha: 'J' + (gameState.matchday || 1),
                tipo: 'venta',
                jugador: jugadorName,
                desde: gameState.team,
                para: 'CPU',
                precio: precio,
                pos: jugadorPos,
                rating: jugadorRating
            });
            enviarMensaje('Dirección Deportiva', '💰 Traspaso cerrado',
                'Se ha aceptado la oferta por ' + jugadorName + '. ' + formatearPresupuesto(precio) + ' ingresados en la cuenta del club.');
            renderInbox();
            document.getElementById('gameBudget').innerText = formatearPresupuesto(gameState.budget);
            break;
        }
    }
}

function rechazarOferta(jugadorId) {
    enviarMensaje('Dirección Deportiva', '❌ Oferta rechazada',
        'Se ha rechazado la oferta por el jugador.');
    renderInbox();
}

function simularMercadoCPU() {
    if (Object.keys(_presupuestosCPU).length === 0) {
        var equipos = Database.getTeams(gameState.country, gameState.league);
        equipos.forEach(function(eq) {
            if (eq.name !== gameState.team) {
                _presupuestosCPU[eq.name] = parsearPresupuesto(eq.budget || '2.0M€');
            }
        });
    }
    var equipos = Database.getTeams(gameState.country, gameState.league);
    equipos.forEach(function(comprador) {
        if (comprador.name === gameState.team) return;
        if (Math.random() > 0.25) return;

        var presupuesto = _presupuestosCPU[comprador.name] || 0;
        if (presupuesto < 1) return;

        var squad = obtenerSquadEquipo(comprador.name);
        if (!squad || squad.length < 11) return;

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
        if (necesidades.length === 0) return;

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
        if (candidatos.length === 0) return;
        candidatos.sort(function(a, b) { return b.jugador.rating - a.jugador.rating; });
        var target = candidatos[0];

        var squadVendedor = _cachedSquads[target.equipo];
        if (!squadVendedor) return;
        var idx = -1;
        for (var i = 0; i < squadVendedor.length; i++) {
            if (squadVendedor[i].id === target.jugador.id) { idx = i; break; }
        }
        if (idx === -1) return;

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
            rating: jugador.rating
        });
    });
}

function generarOfertasCPU() {
    if (!gameState.squad || gameState.squad.length === 0) return;
    if (Math.random() > 0.15) return;
    var elegido = gameState.squad[Math.floor(Math.random() * gameState.squad.length)];
    var descuento = 0.5 + Math.random() * 0.3;
    var precio = Math.round(calcularPrecio(elegido.rating) * descuento * 100) / 100;
    var equipos = Database.getTeams(gameState.country, gameState.league);
    var ofertante = null;
    for (var i = 0; i < equipos.length; i++) {
        if (equipos[i].name !== gameState.team) { ofertante = equipos[i].name; break; }
    }
    if (!ofertante) return;
    var ofertaId = 'oferta_' + elegido.id;
    enviarMensaje('Dirección Deportiva', '📨 Oferta por ' + elegido.name,
        'El ' + ofertante + ' ofrece ' + precio.toFixed(1) + 'M€ por ' + elegido.name + '. ¿Qué haces?',
        [
            { texto: '✅ Aceptar (' + precio.toFixed(1) + 'M€)', fn: 'aceptarOferta(' + elegido.id + ',' + precio + ')' },
            { texto: '❌ Rechazar', fn: 'rechazarOferta(' + elegido.id + ')' }
        ]
    );
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
        if (Math.random() < 0.015 * (ratingL / 100)) {
            var esLocal = Math.random() < probGanaL;
            if (esLocal) golesL++;
            else golesV++;

            var xiAtacante = esLocal ? xiL : xiV;
            var goleador = jugadorAleatorio(xiAtacante);
            var asistente = Math.random() > 0.3 ? asistenAleatorio(xiAtacante, goleador) : null;

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
    var equipos = Database.getTeams(gameState.country, gameState.league);
    for (var i = 0; i < equipos.length; i++) {
        if (equipos[i].name === nombre) {
            var rating = equipos[i].rating || 75;
            var squad = equipos[i].squad && equipos[i].squad.length > 0
                ? equipos[i].squad
                : generarPlantillaSimulada(nombre, gameState.country, rating);
            _cachedSquads[nombre] = squad;
            return squad;
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
            if (r < 0.70) p.lesionSemanas = 1;
            else if (r < 0.90) p.lesionSemanas = 2;
            else if (r < 0.98) p.lesionSemanas = 3;
            else p.lesionSemanas = 4 + Math.floor(Math.random() * 3);
            if (equipoNombre === gameState.team) {
                enviarMensaje('Servicio Médico', 'Parte de Lesión',
                    p.name + ' ha sufrido una lesión durante el partido. El tiempo estimado de baja es de ' + p.lesionSemanas + ' semana' + (p.lesionSemanas > 1 ? 's' : '') + '.');
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
        aplicarDesgasteXI(xiL);
        aplicarDesgasteXI(xiV);
        aplicarLesiones(xiL, p.local);
        aplicarLesiones(xiV, p.visitante);
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
    for (var s = 1; s <= totalJornadas; s++) {
        var partidos = [];

        if (s % 5 === 0) {
            var copaRival = rivales[(s + 3) % rivales.length];
            partidos.push({ competicion: (s % 10 === 0) ? 'Champions' : 'Copa', rival: copaRival, condicion: (s % 3 === 0) ? 'C' : 'V', jugado: false, resultado: null });
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
    var html = '';
    for (var s = 0; s < gameState.calendario.length; s++) {
        var semana = gameState.calendario[s];
        var esActual = (semana.semana === currentWeek);
        var claseCard = 'week-card' + (esActual ? ' current' : '');

        html += '<div class="' + claseCard + '">';
        html += '<div class="week-header">Semana ' + semana.semana + '</div>';

        for (var p = 0; p < semana.partidos.length; p++) {
            var partido = semana.partidos[p];
            var badgeComp = '';
            if (partido.competicion === 'LaLiga') badgeComp = '<span class="comp-badge laliga">LaLiga</span>';
            else if (partido.competicion === 'Copa') badgeComp = '<span class="comp-badge copa">Copa</span>';
            else badgeComp = '<span class="comp-badge champions">Champions</span>';

            var condText = partido.condicion === 'C' ? '<span class="cond-local"><i class="fa-solid fa-house"></i></span>' : '<span class="cond-visit"><i class="fa-solid fa-arrow-right"></i></span>';
            var badgeRes = '';
            if (!partido.jugado) {
                badgeRes = '<span class="result-badge pendiente">Pendiente</span>';
            } else if (partido.resultado) {
                var gf = partido.resultado.golesFavor;
                var gc = partido.resultado.golesContra;
                if (gf > gc) badgeRes = '<span class="result-badge victoria">' + gf + '-' + gc + '</span>';
                else if (gf === gc) badgeRes = '<span class="result-badge empate">' + gf + '-' + gc + '</span>';
                else badgeRes = '<span class="result-badge derrota">' + gf + '-' + gc + '</span>';
            }

            html += '<div class="match-row' + (esActual && !partido.jugado ? ' match-next' : '') + '">';
            html += badgeComp + ' <span class="match-rival">' + partido.rival + '</span> <span class="match-cond">' + condText + '</span> ' + badgeRes;
            html += '</div>';
        }
        html += '</div>';
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

function poblarSelectoresClasificacion() {
    var selPais = document.getElementById('selClasificacionPais');
    var selLiga = document.getElementById('selClasificacionLiga');
    if (!selPais || !selLiga) return;

    if (selPais.options.length === 0) {
        var paises = Database.getCountries();
        paises.forEach(function(c){
            var opt = document.createElement('option');
            opt.value = c.name;
            opt.innerText = c.icon + ' ' + c.name;
            if (c.name === gameState.country) opt.selected = true;
            selPais.appendChild(opt);
        });
        selPais.onchange = function(){
            selLiga.innerHTML = '';
            var ligas2 = Database.getLeagues(this.value);
            ligas2.forEach(function(l){
                var opt = document.createElement('option');
                opt.value = l.name;
                opt.innerText = l.name;
                selLiga.appendChild(opt);
            });
            renderClasificacion();
        };
    }
    if (selLiga.options.length === 0) {
        var ligas = Database.getLeagues(gameState.country);
        ligas.forEach(function(l){
            var opt = document.createElement('option');
            opt.value = l.name;
            opt.innerText = l.name;
            if (l.name === gameState.league) opt.selected = true;
            selLiga.appendChild(opt);
        });
        selLiga.onchange = function(){ renderClasificacion(); };
    }
}

function poblarLigasClasificacion() {
    var selPais = document.getElementById('selClasificacionPais');
    var selLiga = document.getElementById('selClasificacionLiga');
    if (!selPais || !selLiga) return;
    selLiga.innerHTML = '';
    var ligas = Database.getLeagues(selPais.value);
    ligas.forEach(function(l){
        var opt = document.createElement('option');
        opt.value = l.name;
        opt.innerText = l.name;
        selLiga.appendChild(opt);
    });
    renderClasificacion();
}

function renderClasificacion() {
    var container = document.getElementById('clasificacionBody');
    var leyenda = document.getElementById('leyendaColores');
    if (!container) return;

    var selPais = document.getElementById('selClasificacionPais');
    var selLiga = document.getElementById('selClasificacionLiga');
    var paisSel = selPais ? selPais.value : gameState.country;
    var ligaSel = selLiga ? selLiga.value : gameState.league;

    if (!gameState.fixture || gameState.fixture.length === 0) generarCalendario();
    var equipos = Database.getTeams(paisSel, ligaSel);
    if (!equipos || equipos.length === 0) {
        container.innerHTML = '<tr><td colspan="9" style="color:#64748b;text-align:center;">No hay datos disponibles.</td></tr>';
        return;
    }

    var hasta = gameState.matchday || 38;
    var tabla = calcularClasificacion(equipos, gameState.fixture, hasta);

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
}

var _cachedSquads = {};
var _presupuestosCPU = {};

function switchMercadoSubTab(btn, tabId) {
    document.querySelectorAll('#tab-mercado .mercado-subtab').forEach(function(t){ t.style.display = 'none'; });
    document.getElementById(tabId).style.display = 'flex';
    document.querySelectorAll('#tab-mercado .btn-retro.btn-sm').forEach(function(b){ b.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    if (tabId === 'mercado-buscar') renderMercado();
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
    if (tabId === 'comp-estadisticas') renderEstadisticas();
}

function renderEstadisticas() {
    var content = document.getElementById('estadisticasContent');
    if (!content) return;

    var selPais = document.getElementById('selClasificacionPais');
    var selLiga = document.getElementById('selClasificacionLiga');
    var pais = selPais ? selPais.value : gameState.country;
    var liga = selLiga ? selLiga.value : gameState.league;

    var equipos = Database.getTeams(pais, liga);
    if (!equipos || equipos.length === 0) {
        content.innerHTML = '<div style="color:#64748b;text-align:center;padding:10px;font-size:13px;">No hay datos disponibles.</div>';
        return;
    }

    var todosJugadores = [];
    var usuariosYaVistos = false;
    equipos.forEach(function(eq){
        var squad;
        if (eq.name === gameState.team && gameState.squad && gameState.squad.length > 0) {
            squad = gameState.squad;
        } else if (_cachedSquads[eq.name]) {
            squad = _cachedSquads[eq.name];
        } else if (eq.squad && eq.squad.length > 0) {
            squad = eq.squad;
        } else {
            squad = generarPlantillaSimulada(eq.name, pais, eq.rating || 75);
            _cachedSquads[eq.name] = squad;
        }
        squad.forEach(function(j){
            var st = j.statsTemporada || {};
            todosJugadores.push({
                nombre: j.name,
                dorsal: j.dorsal || '-',
                equipo: eq.name,
                gol: st.goles || 0,
                asi: st.asistencias || 0,
                ta: st.ta || 0,
                tr: st.tr || 0
            });
        });
    });

    function topList(arr, key, label, color, unidad) {
        var sorted = arr.slice().sort(function(a,b){ return b[key] - a[key]; });
        var top = sorted.slice(0, 5).filter(function(p){ return p[key] > 0; });
        if (top.length === 0) return '';
        var html = '<div class="est-card"><div class="est-card-title">' + label + '</div>';
        top.forEach(function(p, i){
            html += '<div class="est-row">' +
                '<span>' + (i+1) + '. <span style="color:#94a3b8;">[' + p.dorsal + ']</span> ' + p.nombre + ' <span style="color:#64748b;">(' + p.equipo + ')</span></span>' +
                '<span class="est-val" style="color:' + color + ';">' + p[key] + (unidad || '') + '</span></div>';
        });
        html += '</div>';
        return html;
    }

    var html = '';
    html += topList(todosJugadores, 'gol', '<i class="fa-solid fa-futbol"></i> MÁXIMOS GOLEADORES', '#22c55e', ' goles');
    html += topList(todosJugadores, 'asi', '<i class="fa-solid fa-handshake"></i> MÁXIMOS ASISTENTES', '#38bdf8', ' asis');
    html += topList(todosJugadores, 'ta', '<i class="fa-solid fa-square" style="color:#eab308;"></i> MÁS TARJETAS AMARILLAS', '#eab308', ' TA');
    html += topList(todosJugadores, 'tr', '<i class="fa-solid fa-square" style="color:#ef4444;"></i> MÁS TARJETAS ROJAS', '#ef4444', ' TR');

    if (!html) {
        html = '<div style="color:#64748b;text-align:center;padding:10px;font-size:13px;">No hay estadísticas disponibles. Juega algunos partidos para generar datos.</div>';
    }

    content.innerHTML = html;
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
        var capIcon = (p.id === gameState.capitanId) ? ' <span style="color:#eab308;font-size:12px;">👑</span>' : '';
        html += '<div class="tactic-list-item' + sel + '" data-pid="' + p.id + '">' +
            '<span style="font-size:11px;color:#e2e8f0;min-width:24px;">' + (p.dorsal || '-') + '</span> ' +
            badge + ' ' +
            '<span class="p-name" style="flex:1;font-size:12px;color:#e2e8f0;"> ' + p.name + getEstadoIcono(p) + capIcon + '</span>' +
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
        var capIcon = (p.id === gameState.capitanId) ? ' <span style="color:#eab308;font-size:11px;">👑</span>' : '';
        return '<div class="tactic-list-item' + sel + '" data-pid="' + p.id + '">' +
            '<span style="font-size:11px;color:#e2e8f0;min-width:24px;">' + (p.dorsal || '-') + '</span> ' +
            badge + ' ' +
            '<span class="p-name" style="flex:1;font-size:12px;color:#e2e8f0;"> ' + p.name + getEstadoIcono(p) + capIcon + '</span>' +
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
        actualizarDisplayFormacion();
        renderTacticPitch();
        renderTacticLists();
        actualizarDisplayCapitan();
    }
    cerrarDropdown();
}

document.addEventListener('click', function(e) {
    var dd = document.getElementById('tacticDropdown');
    if (dd && dd.style.display === 'block' && !dd.contains(e.target) && !e.target.closest('.tactic-card')) {
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

    var titulares = matchState.jugadoresEnCampo.slice();
    var enCampoIds = {};
    matchState.jugadoresEnCampo.forEach(function(p) { enCampoIds[p.id] = true; });
    var noUsados = [];
    if (gameState.squad) {
        gameState.squad.forEach(function(p) {
            if (!enCampoIds[p.id]) noUsados.push(p);
        });
    }

    function badgeHTML(p) {
        var color = getColorLinea(p.pos);
        return '<span class="pos-badge" style="background:' + color + ';color:#fff;font-size:9px;width:26px;padding:1px 0;">' + p.pos + '</span>';
    }

    function stamColor(s) {
        var n = parseInt(s) || 100;
        return n > 60 ? '#22c55e' : n > 30 ? '#eab308' : '#ef4444';
    }

    function estaSeleccionado(pid, grupo) {
        return (_sel1 && _sel1.id === pid && _sel1.grupo === grupo) || (_sel2 && _sel2.id === pid && _sel2.grupo === grupo);
    }

    var htmlTit = '<div class="sub-card-title">TITULARES (' + titulares.length + ')</div>';
    titulares.forEach(function(p) {
        var sel = estaSeleccionado(p.id, 'T') ? ' sub-selected' : '';
        htmlTit += '<div class="sub-row' + sel + '" onclick="onClickJugador(' + p.id + ',\'T\')">' +
            badgeHTML(p) + ' ' +
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

        // Si son del mismo grupo (ambos T o ambos S), reiniciar
        if (_sel1.grupo === _sel2.grupo) {
            _sel1 = _sel2;
            _sel2 = null;
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
    document.getElementById('btnGuardarPartida').style.display = '';
    document.getElementById('btnSalirMenu').style.display = '';
    document.getElementById('matchCommentary').style.display = '';
    document.getElementById('matchCommentary').innerHTML += '<p style="color:#38bdf8;">¡Comienza la segunda parte!</p>';

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

function runMatchSimulation() {
    document.querySelectorAll('.game-tab-content').forEach(function (t) { return t.classList.remove('active'); });
    document.getElementById('tab-partido').classList.add('active');

    document.getElementById('matchHomeTeam').innerText = gameState.team;
    document.getElementById('matchAwayTeam').innerText = gameState.opponent;
    document.getElementById('matchScore').innerText = '0 - 0';

    var commentary = document.getElementById('matchCommentary');
    commentary.innerHTML = '<p style="color: #38bdf8;">Comienza el encuentro en el ' + gameState.stadium + '...</p>';
    commentary.style.display = '';
    document.getElementById('halfTimeMenu').style.display = 'none';
    document.getElementById('btnContinueMatch').style.display = 'none';
    document.getElementById('btnContinuarSegundaParte').style.display = 'none';
    document.getElementById('btnGuardarPartida').style.display = '';
    document.getElementById('btnSalirMenu').style.display = '';

    document.getElementById('panelClubInfo').style.display = 'none';
    document.getElementById('matchRatingPanel').style.display = 'flex';

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
        var umbralGol = presion === 'suave' ? 0.75 : (presion === 'extrema' ? 0.55 : 0.65);

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
            if (Math.random() > 0.4) {
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
                    p.pj = (p.pj || 0) + 1;
                }
            });

            var todosQueJugaron = [];
            matchState.jugadoresEnCampo.forEach(function(p) { todosQueJugaron.push(p); });
            calcularNotasPartido(todosQueJugaron, awayGoals, homeGoals);
            aplicarDesgasteXI(todosQueJugaron);
            aplicarLesiones(todosQueJugaron, gameState.team);
            renderInbox();
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

function nextMatch() {
    var jornadaAnterior = (gameState.matchday || 1) - 1;
    var diasDescanso = 7;
    if (gameState.calendario && gameState.calendario[jornadaAnterior]) {
        if (gameState.calendario[jornadaAnterior].partidos.length > 1) diasDescanso = 3;
    }
    recuperarEstaminaPlantilla(diasDescanso);
    if (gameState.fixture && gameState.fixture[jornadaAnterior]) {
        simularJornadaCPU(jornadaAnterior);
    }
    simularMercadoCPU();
    generarOfertasCPU();
    gameState.matchday = (gameState.matchday || 1) + 1;

    if (gameState.matchday > gameState.totalMatchdays) {
        restaurarPanelClub();
        iniciarNuevaTemporada();
        document.getElementById('dashJornada').innerText = 'Jornada 1 - Nueva Temporada';
        document.getElementById('dashHomeTeam').innerText = gameState.team;
        document.getElementById('dashAwayTeam').innerText = gameState.opponent;
        document.getElementById('dashStadiumName').innerHTML = '<i class="fa-solid fa-location-dot"></i> ' + gameState.stadium;
        goToScreen('screen-game');
        var btnInicio = document.querySelector('.nav-tab-btn');
        if (btnInicio) switchGameTab(btnInicio, 'tab-inicio');
        return;
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
        rating: gameState.rating,
        opponent: gameState.opponent,
        matchday: gameState.matchday,
        calendario: gameState.calendario,
        calendarioGenerado: gameState.calendarioGenerado,
        fixture: gameState.fixture,
        fixtureGenerado: gameState.fixtureGenerado,
        cachedSquads: _cachedSquads,
        fixtureRatings: _fixtureRatings,
        presupuestosCPU: _presupuestosCPU,
        mensajes: gameState.mensajes,
        ultimoIdMensaje: gameState.ultimoIdMensaje,
        historialTraspasos: gameState.historialTraspasos,
        estiloPresion: gameState.estiloPresion,
        formacion: gameState.formacion,
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
        showModal('GUARDADO', 'Partida guardada en el Slot ' + slotId + '.');
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
    gameState.rating = data.rating || 75;
    gameState.opponent = data.opponent || 'Rival';
    gameState.matchday = data.matchday || 1;
    gameState.currentDate = data.currentDate || 'Temporada 2026-27 - Jornada 1';
    gameState.calendario = data.calendario || [];
    gameState.calendarioGenerado = data.calendarioGenerado || false;
    gameState.fixture = data.fixture || [];
    gameState.fixtureGenerado = data.fixtureGenerado || false;
    if (data.cachedSquads) { for (var k in data.cachedSquads) { _cachedSquads[k] = data.cachedSquads[k]; } }
    if (data.fixtureRatings) { for (var k in data.fixtureRatings) { _fixtureRatings[k] = data.fixtureRatings[k]; } }
    if (data.presupuestosCPU) { for (var k in data.presupuestosCPU) { _presupuestosCPU[k] = data.presupuestosCPU[k]; } }
    gameState.mensajes = data.mensajes || [];
    gameState.ultimoIdMensaje = data.ultimoIdMensaje || 0;
    gameState.historialTraspasos = data.historialTraspasos || [];
    gameState.estiloPresion = data.estiloPresion || 'pesada';
    gameState.formacion = data.formacion || '4-4-2 Estándar';
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
    var squad = gameState.squad;
    if (!squad || squad.length === 0) {
        squad = generateSquad(gameState.rating);
    }
    document.getElementById('squadModalTitle').innerText = 'PLANTILLA: ' + gameState.team.toUpperCase();
    var tbody = document.getElementById('squadModalBody');
    tbody.innerHTML = '';
    var table = document.createElement('table');
    table.className = 'squad-table';
    table.innerHTML =
        '<thead><tr><th>#</th><th>Pos</th><th>Jugador</th><th>Nac</th><th>Edad</th><th>Med</th><th>Est</th><th>Valor</th></tr></thead>';
    var tbodyInner = document.createElement('tbody');
    squad.forEach(function (p) {
        var tr = document.createElement('tr');
        tr.innerHTML =
            '<td><span class="dorsal-badge">' + (p.dorsal || '-') + '</span></td>' +
            '<td><span class="pos-badge pos-' + p.pos + '">' + p.pos + '</span></td>' +
            '<td>' + p.name + getEstadoIcono(p) + '</td>' +
            '<td style="font-size: 20px;">' + flagEmoji(p.nationality) + '</td>' +
            '<td>' + p.age + '</td>' +
            '<td style="color:#6ee7b7;font-weight:bold;">' + p.rating + '</td>' +
            '<td>' + (p.stamina || '100%') + '</td>' +
            '<td>' + p.val + '</td>';
        tr.onclick = function () { showPlayerDetail(p); };
        tbodyInner.appendChild(tr);
    });
    table.appendChild(tbodyInner);
    tbody.appendChild(table);
    document.getElementById('squadModal').classList.add('active');
}

function closeSquadModal() {
    document.getElementById('squadModal').classList.remove('active');
}

function renderDorsalManager() {
    var select = document.getElementById('dorsalPlayerSelect');
    var grid = document.getElementById('tabDorsalGrid');
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

function showPlayerDetail(p) {
    document.getElementById('playerModalDorsal').innerText = '#' + (p.dorsal || p.id || '-');
    document.getElementById('playerModalPos').className = 'pos-badge pos-' + p.pos;
    document.getElementById('playerModalPos').innerText = p.pos;
    document.getElementById('playerModalName').innerText = p.name;
    document.getElementById('playerModalFullName').innerText = p.fullName || '';
    document.getElementById('playerModalNation').innerHTML = flagEmoji(p.nationality) + ' <span style="font-size: 14px; color: #94a3b8;">' + (p.nationality || '').toUpperCase() + '</span>';
    document.getElementById('playerModalAge').innerText = p.age + ' años';
    document.getElementById('playerModalHeight').innerText = p.height ? p.height + ' cm' : '-';
    document.getElementById('playerModalRating').innerText = p.rating;
    document.getElementById('playerModalVal').innerText = p.val;
    document.getElementById('playerModalStamina').innerText = p.stamina || '100%';
    var st = p.statsTemporada || {};
    document.getElementById('pPJ').innerText = st.partidos || 0;
    document.getElementById('pGOL').innerText = st.goles || 0;
    document.getElementById('pASI').innerText = st.asistencias || 0;
    document.getElementById('pTA').innerText = st.ta || 0;
    document.getElementById('pTR').innerText = st.tr || 0;
    document.querySelectorAll('#playerModal .player-subtab').forEach(function (t) { t.style.display = 'none'; });
    document.getElementById('pinfo').style.display = 'grid';
    document.querySelectorAll('#playerModal .btn-retro.btn-sm').forEach(function (b) { b.classList.remove('active'); });
    var btns = document.querySelectorAll('#playerModal .btn-retro.btn-sm');
    if (btns.length > 0) btns[0].classList.add('active');
    document.getElementById('playerModal').style.zIndex = '300';
    document.getElementById('playerModal').classList.add('active');
}

function closePlayerModal() {
    document.getElementById('playerModal').style.zIndex = '';
    document.getElementById('playerModal').classList.remove('active');
}

populateCountries();
