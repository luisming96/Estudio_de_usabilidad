export const state = {
    meds: [],
    filtroActual: 'mañana',
    chartInstance: null,
    rachaActual: parseInt(localStorage.getItem('vitaRacha'), 10) || 0,
    historialDias: JSON.parse(localStorage.getItem('vitaHistorial')) || [],
    skinActual: localStorage.getItem('vitaSkin') || 'base',
    rolActual: localStorage.getItem('vitaRole') || 'paciente',
    perfilActual: JSON.parse(localStorage.getItem('vitaProfile')) || {},
    nombreUsuario: localStorage.getItem('vitaUserName') || '',
    historialMedico: [],
    prescripciones: JSON.parse(localStorage.getItem('vitaPrescripciones')) || [],
    mensajesMedicos: JSON.parse(localStorage.getItem('vitaMensajes')) || [],
    stockFarmacia: JSON.parse(localStorage.getItem('vitaStock')) || [],
    dispensaciones: JSON.parse(localStorage.getItem('vitaDispensaciones')) || [],
    avisosFarmacia: JSON.parse(localStorage.getItem('vitaAvisos')) || [],
    inventarioPacientes: JSON.parse(localStorage.getItem('vitaInventario')) || [],
    prescripcionEditId: null
};

export const farmaciasData = [
    { nombre: 'Farmacia Central', direccion: 'Calle Mayor 12' },
    { nombre: 'Farmacia Norte', direccion: 'Avenida Salud 8' },
    { nombre: 'Farmacia Plaza', direccion: 'Plaza Principal 3' },
    { nombre: 'Farmacia Vida', direccion: 'Calle Rio 24' }
];

export const dashboardMap = {
    paciente: 'dashboard.html',
    medico: 'dashboard-medico.html',
    farmaceutico: 'dashboard-farmaceutico.html'
};

const demoUsers = {
    'correo1@gmail.com': { role: 'paciente', pass: '1234' },
    'correo2@gmail.com': { role: 'medico', pass: '1234' },
    'correo3@gmail.com': { role: 'farmaceutico', pass: '1234' }
};

export function setSkin(s) {
    state.skinActual = s || 'base';
    document.body.classList.remove('skin-base', 'skin-good', 'skin-access');
    if (state.skinActual === 'good') document.body.classList.add('skin-good');
    if (state.skinActual === 'access') document.body.classList.add('skin-access');
    if (state.skinActual === 'base') document.body.classList.add('skin-base');
    localStorage.setItem('vitaSkin', state.skinActual);
}

export function initSkinSelector() {
    setSkin(state.skinActual);
    const selector = document.getElementById('skinSelector');
    if (selector) {
        selector.value = state.skinActual;
        selector.onchange = (e) => setSkin(e.target.value);
    }
}

export function setRol(r, options = { redirect: false }) {
    state.rolActual = r || 'paciente';
    document.body.classList.remove('role-paciente', 'role-medico', 'role-farmaceutico');
    document.body.classList.add(`role-${state.rolActual}`);
    localStorage.setItem('vitaRole', state.rolActual);

    const dashLink = document.getElementById('navDashboard');
    if (dashLink) dashLink.href = dashboardMap[state.rolActual];

    if (options.redirect && document.body.dataset.page && document.body.dataset.page.startsWith('dashboard')) {
        const target = dashboardMap[state.rolActual];
        if (!window.location.pathname.endsWith(target)) {
            window.location.href = target;
        }
    }
}

export function initNavActive() {
    const page = document.body.dataset.page;
    if (!page) return;
    document.querySelectorAll('[data-nav]').forEach(link => {
        link.classList.toggle('active', link.dataset.nav === page);
    });
}

export function getDashboardRoleFromPath() {
    const path = window.location.pathname.toLowerCase();
    if (path.endsWith('dashboard-medico.html')) return 'medico';
    if (path.endsWith('dashboard-farmaceutico.html')) return 'farmaceutico';
    if (path.endsWith('dashboard.html')) return 'paciente';
    return null;
}

export function enforceRoleAccess() {
    const isAuth = localStorage.getItem('vitaAuth') === 'true';
    const pageRole = getDashboardRoleFromPath();
    const page = document.body.dataset.page;
    if (pageRole) {
        if (!isAuth) {
            window.location.href = 'login.html';
            return false;
        }
        if (state.rolActual !== pageRole) {
            window.location.href = dashboardMap[state.rolActual] || 'dashboard.html';
            return false;
        }
    }
    if (page && ['salud', 'seguimiento', 'herramientas'].includes(page)) {
        if (!isAuth) {
            window.location.href = 'login.html';
            return false;
        }
        if (state.rolActual !== 'paciente') {
            window.location.href = dashboardMap[state.rolActual] || 'dashboard.html';
            return false;
        }
    }
    if (page && page === 'alertas') {
        if (!isAuth) {
            window.location.href = 'login.html';
            return false;
        }
        if (!['paciente', 'medico'].includes(state.rolActual)) {
            window.location.href = dashboardMap[state.rolActual] || 'dashboard.html';
            return false;
        }
    }
    if (page && page === 'medico-comunicacion') {
        if (!isAuth) {
            window.location.href = 'login.html';
            return false;
        }
        if (state.rolActual !== 'medico') {
            window.location.href = dashboardMap[state.rolActual] || 'dashboard.html';
            return false;
        }
    }
    return true;
}

export function initAuth() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const nombre = document.getElementById('loginNombre').value.trim();
            const correo = document.getElementById('loginCorreo').value.trim();
            const pass = document.getElementById('loginPass').value.trim();
            const rol = document.getElementById('loginRol').value;
            if (!nombre || !correo || !pass) {
                alert('Completa nombre, correo y contrasena.');
                return;
            }
            const user = demoUsers[correo.toLowerCase()];
            if (!user || user.pass !== pass) {
                alert('Credenciales incorrectas.');
                return;
            }
            if (user.role !== rol) {
                alert('El rol seleccionado no coincide con el correo.');
                return;
            }
            localStorage.setItem('vitaAuth', 'true');
            localStorage.setItem('vitaUserName', nombre || 'usuario');
            localStorage.setItem('vitaUserEmail', correo);
            state.nombreUsuario = nombre || 'usuario';
            setRol(user.role, { redirect: false });
            window.location.href = dashboardMap[user.role] || 'dashboard.html';
        });
    }
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('vitaAuth');
            localStorage.removeItem('vitaUserName');
            window.location.href = 'index.html';
        });
    }
}

export function getActiveUserName() {
    const perfil = JSON.parse(localStorage.getItem('vitaProfile')) || {};
    return (perfil.nombre || localStorage.getItem('vitaUserName') || 'usuario').trim();
}

export function getActiveUserTokens() {
    const perfil = JSON.parse(localStorage.getItem('vitaProfile')) || {};
    const name = (perfil.nombre || localStorage.getItem('vitaUserName') || '').trim();
    const email = (localStorage.getItem('vitaUserEmail') || '').trim();
    return [name.toLowerCase(), email.toLowerCase()].filter(Boolean);
}

export function matchesPaciente(paciente) {
    if (!paciente) return false;
    const normalize = (val) => val.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').trim();
    const tokens = getActiveUserTokens().map(normalize);
    return tokens.includes(normalize(paciente));
}

export function loadMedsForUser() {
    const key = 'vitaMedsByUser';
    const all = JSON.parse(localStorage.getItem(key)) || {};
    const usuario = getActiveUserName();
    if (!all[usuario]) {
        const legacy = JSON.parse(localStorage.getItem('vitaData')) || [];
        if (legacy.length) {
            all[usuario] = legacy;
            localStorage.setItem(key, JSON.stringify(all));
            localStorage.removeItem('vitaData');
        } else {
            all[usuario] = [];
        }
    }
    state.meds = all[usuario];
}

export function saveMedsForUser() {
    const key = 'vitaMedsByUser';
    const all = JSON.parse(localStorage.getItem(key)) || {};
    const usuario = getActiveUserName();
    all[usuario] = state.meds;
    localStorage.setItem(key, JSON.stringify(all));
}

export function loadHistorialForUser(usuario) {
    const key = 'vitaHistorialByUser';
    const all = JSON.parse(localStorage.getItem(key)) || {};
    const legacy = JSON.parse(localStorage.getItem('vitaHistorialMedico')) || [];
    if (legacy.length && !all[usuario]) {
        all[usuario] = legacy;
        localStorage.setItem(key, JSON.stringify(all));
        localStorage.removeItem('vitaHistorialMedico');
    }
    return all[usuario] || [];
}

export function saveHistorialForUser(usuario, data) {
    const key = 'vitaHistorialByUser';
    const all = JSON.parse(localStorage.getItem(key)) || {};
    all[usuario] = data;
    localStorage.setItem(key, JSON.stringify(all));
}

export function getAdherenciaSerie() {
    return JSON.parse(localStorage.getItem('vitaAdherenciaSerie')) || [];
}

export function setAdherenciaSerie(serie) {
    localStorage.setItem('vitaAdherenciaSerie', JSON.stringify(serie));
}

export function initFarmacias() {
    const input = document.getElementById('farmaciaQuery');
    const list = document.getElementById('farmaciasList');
    if (!input || !list) return;
    let debounceId = null;
    const renderItems = (items, emptyMsg) => {
        list.innerHTML = items.map(f => {
            const link = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(f.nombre + ' ' + f.direccion)}`;
            return `
                <div class="d-flex justify-content-between align-items-center border rounded-3 p-2">
                    <div>
                        <div class="fw-bold">${f.nombre}</div>
                        <div class="small text-muted">${f.direccion}</div>
                    </div>
                    <a class="btn btn-sm btn-outline-primary" href="${link}" target="_blank" rel="noopener">Ver</a>
                </div>
            `;
        }).join('') || `<div class="text-muted">${emptyMsg}</div>`;
    };
    const renderStatic = (query) => {
        const q = (query || '').trim().toLowerCase();
        const items = farmaciasData.filter(f => `${f.nombre} ${f.direccion}`.toLowerCase().includes(q));
        renderItems(items, 'Sin resultados.');
    };
    const fetchNearby = async (query) => {
        const q = query.trim();
        if (q.length < 3) {
            renderStatic(q);
            return;
        }
        list.innerHTML = '<div class="text-muted">Buscando farmacias cercanas...</div>';
        try {
            const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;
            const geoRes = await fetch(geoUrl, { headers: { 'Accept-Language': 'es' } });
            const geoData = await geoRes.json();
            if (!geoData.length) {
                renderStatic(q);
                return;
            }
            const { lat, lon, display_name } = geoData[0];
            const radius = 2000;
            const overpassQuery = `[out:json][timeout:10];(node["amenity"="pharmacy"](around:${radius},${lat},${lon});way["amenity"="pharmacy"](around:${radius},${lat},${lon}););out center 12;`;
            const overpassRes = await fetch('https://overpass-api.de/api/interpreter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                body: `data=${encodeURIComponent(overpassQuery)}`
            });
            const overpassData = await overpassRes.json();
            const items = (overpassData.elements || []).slice(0, 8).map(el => {
                const tags = el.tags || {};
                const name = tags.name || 'Farmacia cercana';
                const addressParts = [tags['addr:street'], tags['addr:housenumber'], tags['addr:city']].filter(Boolean);
                const direccion = addressParts.join(' ') || display_name;
                return { nombre: name, direccion };
            });
            renderItems(items, 'Sin resultados en esta zona.');
        } catch (err) {
            renderStatic(q);
        }
    };
    input.addEventListener('input', () => {
        clearTimeout(debounceId);
        const value = input.value;
        debounceId = setTimeout(() => fetchNearby(value), 350);
    });
    renderStatic('');
}

export function initActions() {
    document.querySelectorAll('[data-message]').forEach(btn => {
        btn.addEventListener('click', () => {
            alert(btn.dataset.message);
        });
    });
}
