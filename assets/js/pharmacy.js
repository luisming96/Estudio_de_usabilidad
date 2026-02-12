import { state, UNIDADES_POR_CAJA } from './core.js';

export function initFarmaceutico() {
    // 1. Inicialización de Stock (He mantenido tus nuevos medicamentos)
    if (!state.stockFarmacia.length) {
        state.stockFarmacia = [
            { med: 'Metformina', cajas: 12 },
            { med: 'Omeprazol', cajas: 5 },
            { med: 'Paracetamol', cajas: 18 },
            { med: 'Ibuprofeno', cajas: 20 },
            { med: 'Norotil', cajas: 30 }
        ];
        localStorage.setItem('vitaStock', JSON.stringify(state.stockFarmacia));
    }

    // Sincronización de datos
    state.stockFarmacia = state.stockFarmacia.map((s) => ({
        med: s.med,
        cajas: s.cajas ?? s.cant ?? 0
    }));

    state.inventarioPacientes = state.inventarioPacientes.map((i) => {
        const presc = i.prescId ? state.prescripciones.find(p => p.id === i.prescId) : null;
        const recetaCalc = presc && presc.tomas ? (presc.dias || 0) * presc.tomas : null;
        const unidadesReceta = i.unidadesReceta ?? recetaCalc ?? i.unidades ?? 0;
        let unidades = i.unidades ?? 0;
        if (unidadesReceta > 0) {
            unidades = Math.min(unidades, unidadesReceta);
        }
        const cajas = i.cajas ?? Math.ceil(unidadesReceta / UNIDADES_POR_CAJA);
        return {
            ...i,
            unidades,
            unidadesReceta,
            cajas,
            unidadesPorCaja: i.unidadesPorCaja ?? UNIDADES_POR_CAJA
        };
    });
    localStorage.setItem('vitaInventario', JSON.stringify(state.inventarioPacientes));

    // 2. Renderizado Inicial
    renderStock();
    renderDispensaciones();
    renderInventarioFarmacia();
    renderReposiciones();
    renderInteracciones();
    updateFarmaceuticoAlertBadge();

    // 3. Listeners de Formularios
    const stockForm = document.getElementById('stockForm');
    if (stockForm) {
        stockForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const med = document.getElementById('stockMed').value.trim();
            const cajas = parseInt(document.getElementById('stockCant').value, 10);
            if (!med || Number.isNaN(cajas)) return alert('Completa medicamento y cajas');
            const idx = findStockIndex(med);
            if (idx >= 0) {
                state.stockFarmacia[idx].cajas += cajas;
            } else {
                state.stockFarmacia.unshift({ med, cajas });
            }
            localStorage.setItem('vitaStock', JSON.stringify(state.stockFarmacia.slice(0, 50)));
            stockForm.reset();
            renderStock();
        });
    }

    const dispForm = document.getElementById('dispForm');
    if (dispForm) {
        dispForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const paciente = document.getElementById('dispPaciente').value.trim();
            const med = document.getElementById('dispMed').value.trim();
            const cajas = parseInt(document.getElementById('dispUnidades').value, 10) || 0;
            if (!paciente || !med || cajas <= 0) return alert('Completa paciente, medicamento y cajas');

            const idx = state.inventarioPacientes.findIndex(i =>
                normalizeText(i.paciente) === normalizeText(paciente) && normalizeText(i.med) === normalizeText(med)
            );
            if (idx === -1) return alert('No existe inventario para ese paciente');
            const unidadesDisp = cajas * UNIDADES_POR_CAJA;
            const unidadesRestantes = state.inventarioPacientes[idx].unidades || 0;
            if (unidadesRestantes <= 0) return alert('No quedan unidades por dispensar');

            const stockIdx = findStockIndex(med);
            if (stockIdx === -1) return alert('No hay stock disponible para ese medicamento');
            if (state.stockFarmacia[stockIdx].cajas < cajas) return alert('Stock insuficiente en farmacia');

            state.stockFarmacia[stockIdx].cajas -= cajas;
            state.inventarioPacientes[idx].unidades = Math.max(0, unidadesRestantes - unidadesDisp);
            state.inventarioPacientes[idx].estado = state.inventarioPacientes[idx].unidades === 0 ? 'Dispensado' : 'Parcial';
            
            localStorage.setItem('vitaStock', JSON.stringify(state.stockFarmacia));
            localStorage.setItem('vitaInventario', JSON.stringify(state.inventarioPacientes));

            state.dispensaciones.unshift({ fecha: new Date().toLocaleDateString(), paciente, med, cajas, unidades: unidadesDisp });
            localStorage.setItem('vitaDispensaciones', JSON.stringify(state.dispensaciones.slice(0, 50)));
            
            dispForm.reset();
            renderDispensaciones();
            renderInventarioFarmacia();
            renderStock();
            renderReposiciones();
        });
    }

    applyAvisoDraft();

    const interaccionesBtn = document.getElementById('interaccionesOpen');
    if (interaccionesBtn) {
        interaccionesBtn.addEventListener('click', () => openInteraccionesModal());
    }

const btnNuevaDisp = document.querySelector('button[data-message*="dispensacion"]');
if (btnNuevaDisp) {
    // Quitamos el comportamiento por defecto de core.js para este botón
    btnNuevaDisp.removeAttribute('data-message'); 
    btnNuevaDisp.addEventListener('click', () => {
        const form = document.getElementById('dispForm');
        if (form) {
            form.scrollIntoView({ behavior: 'smooth', block: 'start' });
            form.querySelector('input')?.focus(); // Ponemos el foco en el primer campo
        }
    });
}
}

// --- FUNCIONES DE RENDERIZADO ---

export function renderStock() {
    const tbody = document.getElementById('stockList');
    if (!tbody) return;
    tbody.innerHTML = state.stockFarmacia.map(s => `
        <tr><td>${s.med}</td><td>${s.cajas}</td></tr>
    `).join('') || '<tr><td colspan="2" class="text-muted">Sin stock registrado.</td></tr>';
}

export function renderDispensaciones() {
    const tbody = document.getElementById('dispList');
    if (!tbody) return;
    if (!state.dispensaciones.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-muted">Sin dispensaciones.</td></tr>';
        return;
    }
    tbody.innerHTML = state.dispensaciones.map(d => `
        <tr>
            <td>${d.fecha}</td>
            <td>${d.paciente}</td>
            <td>${d.med}</td>
            <td>${d.cajas}</td>
            <td>${d.unidades}</td>
        </tr>
    `).join('');
}

export function renderInventarioFarmacia() {
    const tbody = document.getElementById('inventarioList');
    if (!tbody) return;
    if (!state.inventarioPacientes.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-muted">Sin inventario registrado.</td></tr>';
        return;
    }
    tbody.innerHTML = state.inventarioPacientes.map((i, idx) => `
        <tr>
            <td>${i.paciente}</td>
            <td>${i.med}</td>
            <td>${i.unidades} (${calcCajas(i.unidades)} cajas)</td>
            <td><span class="badge ${i.estado === 'Listo' ? 'bg-success' : 'bg-light text-dark border'}">${i.estado}</span></td>
            <td><button class="btn btn-sm btn-outline-primary" data-listo-id="${idx}">Marcar listo</button></td>
        </tr>
    `).join('');
    tbody.querySelectorAll('[data-listo-id]').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.listoId, 10);
            state.inventarioPacientes[idx].estado = 'Listo';
            localStorage.setItem('vitaInventario', JSON.stringify(state.inventarioPacientes));
            renderInventarioFarmacia();
            renderReposiciones();
        });
    });
}

function renderReposiciones() {
    const list = document.getElementById('reposicionesList');
    if (!list) return;

    // 1. Detectar stock crítico de la FARMACIA (ej. Ibuprofeno con <= 1 caja)
    const stockCriticoFarmacia = state.stockFarmacia
        .filter(s => s.cajas <= 1)
        .map(s => ({
            tipo: 'farmacia',
            msg: `STOCK BAJO: Queda solo ${s.cajas} caja de ${s.med} en la farmacia.`,
            clase: 'text-danger fw-bold'
        }));

    // 2. Detectar stock crítico de PACIENTES (HU 16)
    const pacientesCriticos = state.inventarioPacientes
        .map((i) => ({
            ...i,
            diasRestantes: calcularDiasRestantes(i)
        }))
        .filter(i => {
            const unidades = i.unidades || 0;
            if (unidades <= 0) return false;
            return (i.diasRestantes !== null && i.diasRestantes <= 2) || (unidades <= 3);
        })
        .map(i => ({
            tipo: 'paciente',
            paciente: i.paciente,
            med: i.med,
            msg: `${i.paciente} - ${i.med} (${i.unidades} uds · ~${i.diasRestantes} días)`,
            clase: ''
        }));

    // Combinar ambas prioridades
    const todasLasPrioridades = [...stockCriticoFarmacia, ...pacientesCriticos].slice(0, 6);

    if (!todasLasPrioridades.length) {
        list.innerHTML = '<li class="text-muted">Sin reposiciones ni alertas de stock.</li>';
        return;
    }

    list.innerHTML = todasLasPrioridades.map(item => `
        <li class="mb-2 d-flex justify-content-between align-items-start gap-2 border-bottom pb-1">
            <div class="${item.clase}">
                <i class="bi ${item.tipo === 'farmacia' ? 'bi-exclamation-triangle-fill' : 'bi-person-fill'} me-1"></i>
                ${item.msg}
            </div>
            ${item.tipo === 'paciente' ? 
                `<button class="btn btn-sm btn-outline-primary" data-aviso-paciente="${item.paciente}" data-aviso-med="${item.med}">Avisar</button>` : 
                `<span class="badge bg-danger">Pedido urgente</span>`
            }
        </li>
    `).join('');

    // Listener para los botones de aviso al paciente
    list.querySelectorAll('[data-aviso-paciente]').forEach(btn => {
        btn.addEventListener('click', () => {
            localStorage.setItem('vitaAvisoDraft', JSON.stringify({
                paciente: btn.dataset.avisoPaciente,
                texto: `Tu medicación de ${btn.dataset.avisoMed} está baja. Puedes pasar por la farmacia a reponer.`
            }));
            window.location.href = 'farmaceutico-comunicacion.html';
        });
    });
}

function renderInteracciones() {
    const countEl = document.getElementById('interaccionesCount');
    const hintEl = document.getElementById('interaccionesHint');
    const list = document.getElementById('interaccionesModalList');
    if (!countEl || !hintEl || !list) return;

    const alerts = buildInteracciones();
    countEl.innerText = alerts.length;
    
    if (!alerts.length) {
        hintEl.innerText = 'Sin interacciones detectadas.';
        list.innerHTML = '<li class="text-muted">Sin interacciones detectadas.</li>';
        return;
    }

    list.innerHTML = alerts.map(a => `<li class="mb-2"><strong>${a.paciente}</strong>: ${a.combo}</li>`).join('');
    hintEl.innerText = `Se detectaron ${alerts.length} combinaciones a revisar.`;

    const last = sessionStorage.getItem('vitaInteraccionesCount') || '';
    if (String(alerts.length) !== last) {
        sessionStorage.setItem('vitaInteraccionesCount', String(alerts.length));
        openInteraccionesModal();
    }
}

// --- LÓGICA DE NEGOCIO Y CÁLCULOS ---

function updateFarmaceuticoAlertBadge() {
    if (state.rolActual !== 'farmaceutico') return;
    const badge = document.getElementById('alertBadge');
    if (!badge) return;

    // HU 20: Solo contamos interacciones críticas
    const total = buildInteracciones().length;
    badge.innerText = total;
    badge.classList.toggle('d-none', total === 0);
}

function buildInteracciones() {
    const medsByUser = JSON.parse(localStorage.getItem('vitaMedsByUser')) || {};
    if (!state.prescripciones.length && !Object.keys(medsByUser).length) return [];
    
    const rules = [
        ['ibuprofeno', 'enalapril'],
        ['warfarina', 'aspirina'],
        ['omeprazol', 'clopidogrel']
    ];

    const byPaciente = {};
    const setMed = (paciente, med) => {
        const key = normalizeText(paciente);
        if (!key) return;
        if (!byPaciente[key]) byPaciente[key] = { name: paciente, meds: new Set() };
        if (med) byPaciente[key].meds.add(med);
    };

    state.prescripciones.forEach(p => setMed(p.paciente, normalizeMedName(p.med)));
    Object.keys(medsByUser).forEach(pac => {
        (medsByUser[pac] || []).forEach(m => setMed(pac, normalizeMedName(m.nombre)));
    });

    const alerts = [];
    Object.keys(byPaciente).forEach(key => {
        const entry = byPaciente[key];
        const meds = [...entry.meds];
        
        // Regla especial estatinas
        if (meds.includes('fluconazol') && meds.some(m => m.includes('statin') || m.includes('statina'))) {
            alerts.push({ paciente: entry.name, combo: 'Fluconazol + Estatinas' });
        }
        
        rules.forEach(([a, b]) => {
            if (meds.includes(a) && meds.includes(b)) {
                alerts.push({ paciente: entry.name, combo: `${capitalize(a)} + ${capitalize(b)}` });
            }
        });
    });
    return alerts.slice(0, 6);
}

function calcularDiasRestantes(item) {
    if (!item || !item.prescId) return null;
    const presc = state.prescripciones.find(p => p.id === item.prescId);
    if (!presc || !presc.tomas) return null;

    // Cálculo simplificado y robusto para HU 16
    const unidadesActuales = item.unidades ?? 0;
    return Math.ceil(unidadesActuales / presc.tomas);
}

function applyAvisoDraft() {
    const inputPaciente = document.getElementById('avisoPaciente');
    const inputTexto = document.getElementById('avisoTexto');
    if (!inputPaciente) return;

    const raw = localStorage.getItem('vitaAvisoDraft');
    if (!raw) return;
    
    const draft = JSON.parse(raw);
    inputPaciente.value = draft.paciente;
    inputTexto.value = draft.texto;
    localStorage.removeItem('vitaAvisoDraft');
}

// --- HELPERS ---

function openInteraccionesModal() {
    const modalEl = document.getElementById('interaccionesModal');
    if (modalEl && window.bootstrap) {
        window.bootstrap.Modal.getOrCreateInstance(modalEl).show();
    }
}

function calcCajas(unidades) { return Math.ceil((unidades || 0) / UNIDADES_POR_CAJA); }
function normalizeMedName(v) { return (v || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').trim(); }
function normalizeText(v) { return normalizeMedName(v); }
function findStockIndex(med) { return state.stockFarmacia.findIndex(s => normalizeMedName(s.med) === normalizeMedName(med)); }
function capitalize(v) { return v ? v.charAt(0).toUpperCase() + v.slice(1) : ''; }
