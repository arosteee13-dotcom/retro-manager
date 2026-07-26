const gameState = {
    country: 'España',
    league: 'Primera División',
    team: 'Real Madrid',
    teamId: 'Real Madrid',
    budget: '15.0M€',
    manager: 'Mánager Retro',
    stadium: 'Santiago Bernabéu',
    capacity: 81044,
    rating: 86,
    squad: [],
    opponent: 'FC Barcelona',
    currentDate: 'Temporada 2026-27 - Jornada 1',
    slotId: 0,
    matchday: 1,
    totalMatchdays: 38
};

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
            pj: Math.floor(Math.random() * 38),
            gol: Math.floor(Math.random() * 15),
            asi: Math.floor(Math.random() * 10),
            ta: Math.floor(Math.random() * 8),
            tr: Math.floor(Math.random() * 2)
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
        ma: '🇲🇦', sn: '🇸🇳', ci: '🇨🇮', cm: '🇨🇲', gh: '🇬🇭',
        us: '🇺🇸', mx: '🇲🇽', co: '🇨🇴', cl: '🇨🇱', pe: '🇵🇪'
    };
    return flags[code] || '';
}

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

function selectTeam(element, teamName, budget, target, rating, stadium, capacity, squad) {
    document.querySelectorAll('.team-item').forEach(function (t) { return t.classList.remove('selected'); });
    element.classList.add('selected');

    gameState.team = teamName;
    gameState.budget = budget;
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

    const teams = Database.getTeams(gameState.country, gameState.league);
    const opponentTeam = teams.find(function (t) { return t.name !== gameState.team; }) || teams[0];
    gameState.opponent = opponentTeam ? opponentTeam.name : 'FC Barcelona';

    document.getElementById('topBarTitle').innerHTML = '<i class="fa-solid fa-futbol"></i> ' + gameState.team.toUpperCase();
    document.getElementById('gameTeamShort').innerText = gameState.team;
    document.getElementById('gameManagerShort').innerText = gameState.manager;
    document.getElementById('gameBudget').innerText = gameState.budget;

    document.getElementById('dashHomeTeam').innerText = gameState.team;
    document.getElementById('dashAwayTeam').innerText = gameState.opponent;
    document.getElementById('dashStadiumName').innerHTML = '<i class="fa-solid fa-location-dot"></i> ' + gameState.stadium;

    document.getElementById('stadiumName').innerText = gameState.stadium;
    document.getElementById('stadiumCapacity').innerText = gameState.capacity.toLocaleString() + ' esp.';

    renderSquadTable();
    asignarGruposIniciales();
    renderTacticPitch();

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
        var tr = document.createElement('tr');
        tr.innerHTML =
            '<td><span class="dorsal-badge">' + (p.dorsal || '-') + '</span></td>' +
            '<td><span class="pos-badge pos-' + p.pos + '">' + p.pos + '</span></td>' +
            '<td>' + p.name + '</td>' +
            '<td style="font-size: 20px;">' + flagEmoji(p.nationality) + '</td>' +
            '<td>' + (p.pj || 0) + '</td>' +
            '<td style="color:#10b981;">' + (p.gol || 0) + '</td>' +
            '<td style="color:#38bdf8;">' + (p.asi || 0) + '</td>' +
            '<td style="color:#facc15;">' + (p.ta || 0) + '</td>' +
            '<td style="color:#fca5a5;">' + (p.tr || 0) + '</td>';
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
            '<td>' + p.name + '</td>' +
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
        '4-3-3 Ofensivo': { po: 1, defensa: 4, medio: 3, ataque: 3 },
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

var seleccionID = null;

function organizarPlantilla() {
    var squad = gameState.squad;
    if (!squad || squad.length === 0) return { xi: [], subs: [], reserves: [] };
    var necesitaInit = false;
    for (var i = 0; i < squad.length; i++) { if (!squad[i].grupo) { necesitaInit = true; break; } }
    if (necesitaInit) {
        var selF = document.getElementById('tacticFormation');
        autocompletarFormacion(selF ? selF.value : '4-4-2 Estándar');
    }
    var sorted = squad.slice().sort(function (a, b) { return a.grupo - b.grupo; });
    var xi = [], subs = [], reserves = [];
    sorted.forEach(function (p) {
        if (xi.length < 11) xi.push(p);
        else if (subs.length < 12) subs.push(p);
        else reserves.push(p);
    });
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
    '4-3-3 Ofensivo':  { po: 2, defensa: 4, medio: 3, ataque: 3 },
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
    var sel = document.getElementById('tacticFormation');
    var formation = sel ? sel.value : '4-4-2 Estándar';
    autocompletarFormacion(formation);
}

var _tacticInitDone = false;

function renderTacticPitch() {
    var squad = gameState.squad;
    if (!squad || squad.length === 0) return;

    if (!_tacticInitDone) {
        var selF = document.getElementById('tacticFormation');
        autocompletarFormacion(selF ? selF.value : '4-4-2 Estándar');
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

    var selForm = document.getElementById('tacticFormation');
    var formation = selForm ? selForm.value : '4-4-2 Estándar';
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
        html += '<div class="tactic-list-item' + sel + '" data-pid="' + p.id + '">' +
            '<span style="font-size:11px;color:#e2e8f0;min-width:24px;">' + (p.dorsal || '-') + '</span> ' +
            badge + ' ' +
            '<span class="p-name" style="flex:1;font-size:12px;color:#e2e8f0;"> ' + p.name + '</span>' +
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
        '4-3-3 Ofensivo': ['POR','LI','DFC','DFC','LD','MC','MCD','MC','EI','DC','ED'],
        '5-3-2 Defensivo': ['POR','LI','DFC','DFC','DFC','LD','MC','MC','MC','DC','DC']
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
        return '<div class="tactic-list-item' + sel + '" data-pid="' + p.id + '">' +
            '<span style="font-size:11px;color:#e2e8f0;min-width:24px;">' + (p.dorsal || '-') + '</span> ' +
            badge + ' ' +
            '<span class="p-name" style="flex:1;font-size:12px;color:#e2e8f0;"> ' + p.name + '</span>' +
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



function onFormationChange() {
    _tacticInitDone = false;
    asignarGruposIniciales();
    seleccionID = null;
    renderTacticPitch();
    renderTacticLists();
    showModal('FORMACIÓN', 'Formación completada con los mejores jugadores disponibles.');
}




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
}
window.onTacticPlayerClick = onTacticPlayerClick;

function renderTacticas() {
    seleccionID = null;
    renderTacticPitch();
    renderTacticLists();
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

function runMatchSimulation() {
    document.querySelectorAll('.game-tab-content').forEach(function (t) { return t.classList.remove('active'); });
    document.getElementById('tab-partido').classList.add('active');

    document.getElementById('matchHomeTeam').innerText = gameState.team;
    document.getElementById('matchAwayTeam').innerText = gameState.opponent;
    document.getElementById('matchScore').innerText = '0 - 0';

    const commentary = document.getElementById('matchCommentary');
    commentary.innerHTML = '<p style="color: #38bdf8;">Comienza el encuentro en el ' + gameState.stadium + '...</p>';

    let minute = 0;
    let homeGoals = 0;
    let awayGoals = 0;

    const btnPlay = document.getElementById('btnPlayMatch');
    btnPlay.disabled = true;
    btnPlay.style.opacity = '0.5';

    var randomPlayer = function () {
        var s = gameState.squad;
        return s && s.length > 0 ? s[Math.floor(Math.random() * s.length)] : null;
    };

    var playerTag = function (p) {
        if (!p) return 'Unknown';
        return (p.dorsal ? '[' + p.dorsal + '] ' : '') + p.name;
    };

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

    const matchInterval = setInterval(function () {
        minute += 15;
        document.getElementById('matchClock').innerText = minute + "'";

        var p = randomPlayer();
        var chance = Math.random();
        if (chance > 0.65) {
            var msg = goalMsgs[Math.floor(Math.random() * goalMsgs.length)];
            if (Math.random() > 0.4) {
                homeGoals++;
                commentary.innerHTML += '<p style="color: #10b981;"><b>¡GOOOOOOL DE ' + gameState.team.toUpperCase() + '!</b> ' + playerTag(p) + '. ' + msg + ' (' + minute + "')</p>";
            } else {
                awayGoals++;
                commentary.innerHTML += '<p style="color: #fca5a5;"><b>¡Gol del ' + gameState.opponent + '!</b> ' + msg + ' (' + minute + "')</p>";
            }
            document.getElementById('matchScore').innerText = homeGoals + ' - ' + awayGoals;
        } else {
            commentary.innerHTML += '<p>min ' + minute + ': ' + actionMsgs[Math.floor(Math.random() * actionMsgs.length)] + '</p>';
        }

        commentary.scrollTop = commentary.scrollHeight;

        if (minute >= 90) {
            clearInterval(matchInterval);
            commentary.innerHTML += '<p style="color: #facc15; font-weight: bold; margin-top: 6px;">¡FINAL DEL PARTIDO! Resultado: ' + homeGoals + ' - ' + awayGoals + '</p>';
            document.getElementById('btnContinueMatch').style.display = '';
            btnPlay.disabled = false;
            btnPlay.style.opacity = '1';
        }
    }, 800);
}

function nextMatch() {
    gameState.matchday = (gameState.matchday || 1) + 1;
    gameState.currentDate = 'Temporada 2026-27 - Jornada ' + gameState.matchday;

    var teams = Database.getTeams(gameState.country, gameState.league);
    var others = teams.filter(function (t) { return t.name !== gameState.team; });
    gameState.opponent = others.length > 0 ? others[Math.floor(Math.random() * others.length)].name : 'Rival';

    document.getElementById('dashHomeTeam').innerText = gameState.team;
    document.getElementById('dashAwayTeam').innerText = gameState.opponent;
    document.getElementById('dashStadiumName').innerHTML = '<i class="fa-solid fa-location-dot"></i> ' + gameState.stadium;

    document.getElementById('btnContinueMatch').style.display = 'none';

    _tacticInitDone = false;
    goToScreen('screen-game');
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
    gameState.currentDate = data.currentDate;
    gameState.budget = data.budget;
    gameState.stadium = data.stadium || 'Estadio';
    gameState.capacity = data.capacity || 0;
    gameState.rating = data.rating || 75;
    gameState.opponent = data.opponent || 'Rival';
    gameState.squad = data.squad || [];
    gameState.slotId = slotId;

    document.getElementById('topBarTitle').innerHTML = '<i class="fa-solid fa-futbol"></i> ' + gameState.team.toUpperCase();
    document.getElementById('gameTeamShort').innerText = gameState.team;
    document.getElementById('gameManagerShort').innerText = gameState.manager;
    document.getElementById('gameBudget').innerText = gameState.budget;

    document.getElementById('dashHomeTeam').innerText = gameState.team;
    document.getElementById('dashAwayTeam').innerText = gameState.opponent;
    document.getElementById('dashStadiumName').innerHTML = '<i class="fa-solid fa-location-dot"></i> ' + gameState.stadium;
    document.getElementById('stadiumName').innerText = gameState.stadium;
    document.getElementById('stadiumCapacity').innerText = (gameState.capacity || 0).toLocaleString() + ' esp.';

    renderSquadTable();
    _tacticInitDone = false;
    renderTacticPitch();
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
            '<td>' + p.name + '</td>' +
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
    document.getElementById('pPJ').innerText = p.pj || 0;
    document.getElementById('pGOL').innerText = p.gol || 0;
    document.getElementById('pASI').innerText = p.asi || 0;
    document.getElementById('pTA').innerText = p.ta || 0;
    document.getElementById('pTR').innerText = p.tr || 0;
    document.querySelectorAll('#playerModal .player-subtab').forEach(function (t) { t.style.display = 'none'; });
    document.getElementById('pinfo').style.display = 'grid';
    document.querySelectorAll('#playerModal .btn-retro.btn-sm').forEach(function (b) { b.classList.remove('active'); });
    var btns = document.querySelectorAll('#playerModal .btn-retro.btn-sm');
    if (btns.length > 0) btns[0].classList.add('active');
    document.getElementById('playerModal').classList.add('active');
}

function closePlayerModal() {
    document.getElementById('playerModal').classList.remove('active');
}

populateCountries();
