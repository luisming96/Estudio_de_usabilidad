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

export const UNIDADES_POR_CAJA = 20;

const demoUsers = {
    'correo1@gmail.com': { role: 'paciente', pass: '1234' },
    'correo2@gmail.com': { role: 'medico', pass: '1234' },
    'correo3@gmail.com': { role: 'farmaceutico', pass: '1234' }
};

const navShortLabels = {
    inicio: 'Ini',
    dashboard: 'Dash',
    salud: 'Sal',
    herramientas: 'Herr',
    seguimiento: 'Seg',
    analisis: 'Ana',
    sobre: 'Info',
    mapa: 'Mapa',
    comunicacion: 'Com'
};

function unwrapStudyTableWrappers() {
    document.querySelectorAll('.study-table-wrapper').forEach((wrapper) => {
        const table = wrapper.querySelector('table');
        if (!table || !wrapper.parentNode) return;
        wrapper.parentNode.insertBefore(table, wrapper);
        wrapper.remove();
    });
}

function resetStudyEvidenceMutations() {
    document.body.classList.remove('study-skin-base', 'study-skin-access', 'study-skin-good');

    unwrapStudyTableWrappers();

    document.querySelectorAll('[data-study-original-label]').forEach((element) => {
        element.textContent = element.dataset.studyOriginalLabel;
        delete element.dataset.studyOriginalLabel;
    });

    document.querySelectorAll('[data-study-original-for]').forEach((label) => {
        label.setAttribute('for', label.dataset.studyOriginalFor);
        delete label.dataset.studyOriginalFor;
    });

    document.querySelectorAll('[data-study-original-aria-label]').forEach((element) => {
        element.setAttribute('aria-label', element.dataset.studyOriginalAriaLabel);
        delete element.dataset.studyOriginalAriaLabel;
    });

    document.querySelectorAll('[data-study-had-aria-label="no"]').forEach((element) => {
        element.removeAttribute('aria-label');
        delete element.dataset.studyHadAriaLabel;
    });

    document.querySelectorAll('[data-study-original-tabindex]').forEach((element) => {
        if (element.dataset.studyOriginalTabindex === 'none') {
            element.removeAttribute('tabindex');
        } else {
            element.setAttribute('tabindex', element.dataset.studyOriginalTabindex);
        }
        delete element.dataset.studyOriginalTabindex;
    });

    document.querySelectorAll('[data-study-original-class]').forEach((element) => {
        element.className = element.dataset.studyOriginalClass;
        delete element.dataset.studyOriginalClass;
    });

    document.querySelectorAll('[data-study-original-options]').forEach((select) => {
        try {
            const originalOptions = JSON.parse(select.dataset.studyOriginalOptions);
            Array.from(select.options).forEach((option, index) => {
                if (originalOptions[index] !== undefined) {
                    option.textContent = originalOptions[index];
                }
            });
        } catch (_error) {
            // noop
        }
        delete select.dataset.studyOriginalOptions;
    });

    document.querySelectorAll('[data-study-original-autocomplete]').forEach((element) => {
        if (element.dataset.studyOriginalAutocomplete === 'none') {
            element.removeAttribute('autocomplete');
        } else {
            element.setAttribute('autocomplete', element.dataset.studyOriginalAutocomplete);
        }
        delete element.dataset.studyOriginalAutocomplete;
    });

    document.querySelectorAll('[data-study-original-inputmode]').forEach((element) => {
        if (element.dataset.studyOriginalInputmode === 'none') {
            element.removeAttribute('inputmode');
        } else {
            element.setAttribute('inputmode', element.dataset.studyOriginalInputmode);
        }
        delete element.dataset.studyOriginalInputmode;
    });

    document.querySelectorAll('[data-study-original-rows]').forEach((element) => {
        element.setAttribute('rows', element.dataset.studyOriginalRows);
        delete element.dataset.studyOriginalRows;
    });

    document.querySelectorAll('[data-study-had-rows="no"]').forEach((element) => {
        element.removeAttribute('rows');
        delete element.dataset.studyHadRows;
    });

    document.querySelectorAll('[data-study-original-placeholder]').forEach((element) => {
        element.setAttribute('placeholder', element.dataset.studyOriginalPlaceholder);
        delete element.dataset.studyOriginalPlaceholder;
    });

    document.querySelectorAll('[data-study-had-placeholder="no"]').forEach((element) => {
        element.removeAttribute('placeholder');
        delete element.dataset.studyHadPlaceholder;
    });

    document.querySelectorAll('[data-study-original-type]').forEach((element) => {
        element.setAttribute('type', element.dataset.studyOriginalType);
        delete element.dataset.studyOriginalType;
    });

    document.querySelectorAll('[data-study-had-type="no"]').forEach((element) => {
        element.removeAttribute('type');
        delete element.dataset.studyHadType;
    });

    document.querySelectorAll('[data-study-original-novalidate]').forEach((element) => {
        if (element.dataset.studyOriginalNovalidate === 'yes') {
            element.setAttribute('novalidate', 'novalidate');
        } else {
            element.removeAttribute('novalidate');
        }
        delete element.dataset.studyOriginalNovalidate;
    });

    document.querySelectorAll('[data-study-had-required="yes"]').forEach((element) => {
        element.setAttribute('required', 'required');
        delete element.dataset.studyHadRequired;
    });

    document.querySelectorAll('[data-study-original-alt]').forEach((element) => {
        element.setAttribute('alt', element.dataset.studyOriginalAlt);
        delete element.dataset.studyOriginalAlt;
    });

    document.querySelectorAll('[data-study-had-alt="no"]').forEach((element) => {
        element.removeAttribute('alt');
        delete element.dataset.studyHadAlt;
    });

    document.querySelectorAll('[data-study-original-lang]').forEach((element) => {
        element.setAttribute('lang', element.dataset.studyOriginalLang);
        delete element.dataset.studyOriginalLang;
    });

    document.querySelectorAll('[data-study-original-aria-hidden]').forEach((element) => {
        element.setAttribute('aria-hidden', element.dataset.studyOriginalAriaHidden);
        delete element.dataset.studyOriginalAriaHidden;
    });

    document.querySelectorAll('[data-study-had-aria-hidden="no"]').forEach((element) => {
        element.removeAttribute('aria-hidden');
        delete element.dataset.studyHadAriaHidden;
    });

    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
        skipLink.removeAttribute('aria-hidden');
    }

    document.querySelectorAll('.stat-grid').forEach((grid) => {
        grid.classList.remove('study-force-two-cols');
    });

    document.querySelectorAll('.page-header').forEach((header) => {
        header.classList.remove('flex-nowrap', 'overflow-auto');
    });
}

function applyBaseStudyEvidence() {
    document.body.classList.add('study-skin-base');

    unwrapStudyTableWrappers();

    document.querySelectorAll('[data-nav]').forEach((link) => {
        if (!link.dataset.studyOriginalLabel) {
            link.dataset.studyOriginalLabel = link.textContent.trim();
        }
        const key = link.dataset.nav;
        if (navShortLabels[key]) {
            link.textContent = navShortLabels[key];
        }
    });

    document.querySelectorAll('form[data-study-grid]').forEach((form) => {
        if (!form.dataset.studyOriginalClass) {
            form.dataset.studyOriginalClass = form.className;
        }
        if (!form.dataset.studyOriginalNovalidate) {
            form.dataset.studyOriginalNovalidate = form.hasAttribute('novalidate') ? 'yes' : 'no';
        }
        if (!form.dataset.studyOriginalAutocomplete) {
            form.dataset.studyOriginalAutocomplete = form.getAttribute('autocomplete') || 'none';
        }
        form.setAttribute('autocomplete', 'off');
        form.setAttribute('novalidate', 'novalidate');
        form.className = 'row g-0 mt-1';
    });

    document.querySelectorAll('form[data-study-grid] input, form[data-study-grid] textarea').forEach((field) => {
        if (!field.dataset.studyOriginalAutocomplete) {
            field.dataset.studyOriginalAutocomplete = field.getAttribute('autocomplete') || 'none';
        }
        field.setAttribute('autocomplete', 'off');
    });

    document.querySelectorAll('form[data-study-grid] select').forEach((select) => {
        if (!select.dataset.studyOriginalOptions) {
            const options = Array.from(select.options).map((option) => option.textContent);
            select.dataset.studyOriginalOptions = JSON.stringify(options);
        }

        Array.from(select.options).forEach((option, index) => {
            option.textContent = index === 0 ? 'Elegir' : `Opcion ${index}`;
        });
    });

    document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach((field) => {
        if (!field.dataset.studyOriginalPlaceholder) {
            field.dataset.studyOriginalPlaceholder = field.getAttribute('placeholder');
        }
        field.setAttribute('placeholder', '...');
    });

    document.querySelectorAll('input:not([placeholder]), textarea:not([placeholder])').forEach((field) => {
        if (!field.dataset.studyHadPlaceholder) {
            field.dataset.studyHadPlaceholder = 'no';
        }
        field.setAttribute('placeholder', '...');
    });

    document.querySelectorAll('input[type="email"], input[type="password"], input[type="tel"], input[type="number"], input[type="date"]').forEach((field) => {
        if (!field.dataset.studyOriginalType) {
            field.dataset.studyOriginalType = field.getAttribute('type') || 'text';
        }
        if (!field.dataset.studyOriginalInputmode) {
            field.dataset.studyOriginalInputmode = field.getAttribute('inputmode') || 'none';
        }
        field.setAttribute('type', 'text');
        field.setAttribute('inputmode', 'text');
    });

    document.querySelectorAll('textarea').forEach((field) => {
        if (field.hasAttribute('rows')) {
            if (!field.dataset.studyOriginalRows) {
                field.dataset.studyOriginalRows = field.getAttribute('rows');
            }
        } else if (!field.dataset.studyHadRows) {
            field.dataset.studyHadRows = 'no';
        }
        field.setAttribute('rows', '1');
    });

    document.querySelectorAll('.btn-primary, .btn-outline-primary').forEach((button) => {
        const label = button.textContent.trim();
        if (!label) return;
        if (!button.dataset.studyOriginalLabel) {
            button.dataset.studyOriginalLabel = label;
        }
        button.textContent = 'OK'; // se destruye la claridad

        const belongsToLoginForm = !!button.closest('#loginForm');
        if (belongsToLoginForm) {
            return;
        }

        if (!button.dataset.studyOriginalType) {
            if (button.hasAttribute('type')) {
                button.dataset.studyOriginalType = button.getAttribute('type');
            } else {
                button.dataset.studyHadType = 'no';
                button.dataset.studyOriginalType = 'submit';
            }
        }

        button.setAttribute('type', 'button'); // Anula la función de envío nativa
    });

    document.querySelectorAll('.form-label, .page-title, .section-title, .dashboard-section-title').forEach((element) => {
        const label = element.textContent.trim();
        if (!label) return;
        if (!element.dataset.studyOriginalLabel) {
            element.dataset.studyOriginalLabel = label;
        }
        element.textContent = 'Dato';
    });

    //Quita el atributo required a los campos.
    document.querySelectorAll('input[required], select[required], textarea[required]').forEach((field) => {
        field.dataset.studyHadRequired = 'yes';
        field.removeAttribute('required');
    });

    document.querySelectorAll('.page-header').forEach((header) => {
        header.classList.add('flex-nowrap', 'overflow-auto');
    });

    document.querySelectorAll('.stat-grid').forEach((grid) => {
        grid.classList.add('study-force-two-cols');
    });
}

function applyAccessStudyEvidence() {
    document.body.classList.add('study-skin-access');

    if (!document.documentElement.dataset.studyOriginalLang) {
        document.documentElement.dataset.studyOriginalLang = document.documentElement.getAttribute('lang') || 'es';
    }
    document.documentElement.setAttribute('lang', 'en');

    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
        if (!skipLink.dataset.studyOriginalTabindex) {
            skipLink.dataset.studyOriginalTabindex = skipLink.getAttribute('tabindex') || 'none';
        }
        skipLink.setAttribute('tabindex', '-1');
        skipLink.setAttribute('aria-hidden', 'true');
    }

    document.querySelectorAll('label[for]').forEach((label) => {
        if (!label.dataset.studyOriginalFor) {
            label.dataset.studyOriginalFor = label.getAttribute('for');
        }
        label.removeAttribute('for');
    });

    document.querySelectorAll('a[aria-label], button[aria-label], input[aria-label], select[aria-label], textarea[aria-label]').forEach((element) => {
        if (!element.dataset.studyOriginalAriaLabel) {
            element.dataset.studyOriginalAriaLabel = element.getAttribute('aria-label');
        }
        element.removeAttribute('aria-label');
    });

    document.querySelectorAll('a:not([aria-label]), button:not([aria-label]), input:not([aria-label]), select:not([aria-label]), textarea:not([aria-label])').forEach((element) => {
        if (!element.dataset.studyHadAriaLabel) {
            element.dataset.studyHadAriaLabel = 'no';
        }
    });

    document.querySelectorAll('img').forEach((image) => {
        const hadAlt = image.hasAttribute('alt');
        if (hadAlt) {
            if (!image.dataset.studyOriginalAlt) {
                image.dataset.studyOriginalAlt = image.getAttribute('alt');
            }
        } else {
            image.dataset.studyHadAlt = 'no';
        }
        image.setAttribute('alt', '');
    });

    document.querySelectorAll('a, button, input, select, textarea').forEach((element) => {
        if (!element.dataset.studyOriginalTabindex) {
            element.dataset.studyOriginalTabindex = element.getAttribute('tabindex') || 'none';
        }
        element.setAttribute('tabindex', '-1');
    });

    document.querySelectorAll('h1, h2, h3, .page-title, .section-title').forEach((element) => {
        if (element.hasAttribute('aria-hidden')) {
            if (!element.dataset.studyOriginalAriaHidden) {
                element.dataset.studyOriginalAriaHidden = element.getAttribute('aria-hidden');
            }
        } else if (!element.dataset.studyHadAriaHidden) {
            element.dataset.studyHadAriaHidden = 'no';
        }
        element.setAttribute('aria-hidden', 'true');
    });
}

function applyGoodStudyEvidence() {
    document.body.classList.add('study-skin-good');

    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
        skipLink.setAttribute('tabindex', '0');
        skipLink.removeAttribute('aria-hidden');
    }

    document.querySelectorAll('table').forEach((table) => {
        const parent = table.parentElement;
        if (parent && parent.classList.contains('table-responsive')) return;
        const wrapper = document.createElement('div');
        wrapper.className = 'table-responsive study-table-wrapper';
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);
    });
}

function applyStudyEvidenceBySkin(skin) {
    resetStudyEvidenceMutations();
    if (skin === 'base') applyBaseStudyEvidence();
    if (skin === 'access') applyAccessStudyEvidence();
    if (skin === 'good') applyGoodStudyEvidence();
}

export function setSkin(s) {
    state.skinActual = s || 'base';
    document.body.classList.remove('skin-base', 'skin-good', 'skin-access');
    if (state.skinActual === 'good') document.body.classList.add('skin-good');
    if (state.skinActual === 'access') document.body.classList.add('skin-access');
    if (state.skinActual === 'base') document.body.classList.add('skin-base');
    applyStudyEvidenceBySkin(state.skinActual);
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
    const isAuth = localStorage.getItem('vitaAuth') === 'true';
    const visualRole = isAuth ? state.rolActual : 'guest';
    document.body.classList.remove('role-paciente', 'role-medico', 'role-farmaceutico', 'role-guest');
    document.body.classList.add(`role-${visualRole}`);
    localStorage.setItem('vitaRole', state.rolActual);

    const dashLink = document.getElementById('navDashboard');
    if (dashLink) dashLink.href = isAuth ? (dashboardMap[state.rolActual] || 'dashboard.html') : 'login.html';

    document.querySelectorAll('a[aria-label="Centro de alertas"]').forEach((link) => {
        if (!isAuth) {
            link.href = 'login.html';
            return;
        }
        link.href = state.rolActual === 'farmaceutico' ? 'farmaceutico-comunicacion.html' : 'alertas.html';
    });

    if (options.redirect && document.body.dataset.page && document.body.dataset.page.startsWith('dashboard')) {
        const target = dashboardMap[state.rolActual];
        if (!window.location.pathname.endsWith(target)) {
            window.location.href = target;
        }
    }

    const authContainer = document.querySelector('.navbar .d-flex.align-items-center.gap-2');
    if (authContainer && localStorage.getItem('vitaAuth') === 'true') {
        let display = document.getElementById('navUserDisplay');
        if (!display) {
            display = document.createElement('div');
            display.id = 'navUserDisplay';
            display.className = 'd-flex align-items-center gap-2 ms-lg-3';
            authContainer.appendChild(display);
            
            // Oculta el botón "Acceder" original para no duplicar
            const loginBtn = authContainer.querySelector('a[href="login.html"]');
            if (loginBtn) loginBtn.style.display = 'none';
        }

        const nombre = getActiveUserName(); // Usa la función que ya tienes en core.js
        const rolLabel = state.rolActual.charAt(0).toUpperCase() + state.rolActual.slice(1);
        
        display.innerHTML = `
            <div class="text-end" style="line-height: 1.1">
                <div style="font-size: 0.85rem; font-weight: 700; color: var(--text);">${nombre}</div>
                <span class="badge badge-role badge-role-${state.rolActual}">${rolLabel}</span>
            </div>
            <button onclick="localStorage.removeItem('vitaAuth'); location.href='index.html';" 
                    class="btn btn-sm btn-outline-danger ms-2" style="font-size: 0.7rem; padding: 0.2rem 0.5rem;">
                Salir
            </button>
        `;
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
    if (page && page === 'farmaceutico-comunicacion') {
        if (!isAuth) {
            window.location.href = 'login.html';
            return false;
        }
        if (state.rolActual !== 'farmaceutico') {
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
