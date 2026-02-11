import { state, UNIDADES_POR_CAJA } from './core.js';

export function initFarmaceutico() {
    if (!state.stockFarmacia.length) {
        state.stockFarmacia = [
            { med: 'Metformina', cajas: 12 },
            { med: 'Omeprazol', cajas: 5 },
            { med: 'Paracetamol', cajas: 18 }
        ];
        localStorage.setItem('vitaStock', JSON.stringify(state.stockFarmacia));
    }
    state.stockFarmacia = state.stockFarmacia.map((s) => ({
        med: s.med,
        cajas: s.cajas ?? s.cant ?? 0
    }));
    localStorage.setItem('vitaStock', JSON.stringify(state.stockFarmacia));

    state.inventarioPacientes = state.inventarioPacientes.map((i) => {
        const unidades = i.unidades ?? 0;
        const cajas = i.cajas ?? Math.ceil(unidades / UNIDADES_POR_CAJA);
        return {
            ...i,
            unidades,
            cajas,
            unidadesPorCaja: i.unidadesPorCaja ?? UNIDADES_POR_CAJA
        };
    });
    localStorage.setItem('vitaInventario', JSON.stringify(state.inventarioPacientes));
    renderStock();

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
            if (state.inventarioPacientes[idx].unidades < unidadesDisp) return alert('Unidades insuficientes');

            const stockIdx = findStockIndex(med);
            if (stockIdx === -1) return alert('No hay stock disponible para ese medicamento');
            if (state.stockFarmacia[stockIdx].cajas < cajas) return alert('Stock insuficiente en farmacia');

            state.stockFarmacia[stockIdx].cajas -= cajas;
            localStorage.setItem('vitaStock', JSON.stringify(state.stockFarmacia));

            state.inventarioPacientes[idx].unidades = Math.max(0, state.inventarioPacientes[idx].unidades - unidadesDisp);
            state.inventarioPacientes[idx].cajas = Math.ceil(state.inventarioPacientes[idx].unidades / UNIDADES_POR_CAJA);
            state.inventarioPacientes[idx].estado = state.inventarioPacientes[idx].unidades === 0 ? 'Dispensado' : 'Parcial';
            localStorage.setItem('vitaInventario', JSON.stringify(state.inventarioPacientes));

            state.dispensaciones.unshift({ fecha: new Date().toLocaleDateString(), paciente, med, cajas, unidades: unidadesDisp });
            localStorage.setItem('vitaDispensaciones', JSON.stringify(state.dispensaciones.slice(0, 50)));
            dispForm.reset();
            renderDispensaciones();
            renderInventarioFarmacia();
            renderStock();
        });
    }
    renderDispensaciones();

    const avisoForm = document.getElementById('avisoForm');
    if (avisoForm) {
        avisoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const paciente = document.getElementById('avisoPaciente').value.trim();
            const texto = document.getElementById('avisoTexto').value.trim();
            if (!paciente || !texto) return alert('Completa paciente y aviso');
            state.avisosFarmacia.unshift({ paciente, texto, fecha: new Date().toLocaleDateString() });
            localStorage.setItem('vitaAvisos', JSON.stringify(state.avisosFarmacia.slice(0, 50)));
            state.inventarioPacientes = state.inventarioPacientes.map(i =>
                normalizeText(i.paciente) === normalizeText(paciente) ? { ...i, estado: 'Listo' } : i
            );
            localStorage.setItem('vitaInventario', JSON.stringify(state.inventarioPacientes));
            avisoForm.reset();
            renderAvisos();
            renderInventarioFarmacia();
            renderResumenPacientes();
            updateFarmaceuticoAlertBadge();
        });
    }
    renderAvisos();
    renderInventarioFarmacia();
    renderReposiciones();
    renderInteracciones();
    renderResumenPacientes();
    updateFarmaceuticoAlertBadge();

    const interaccionesBtn = document.getElementById('interaccionesOpen');
    if (interaccionesBtn) {
        interaccionesBtn.addEventListener('click', () => openInteraccionesModal());
    }
}

export function renderStock() {
    const tbody = document.getElementById('stockList');
    if (!tbody) return;
    tbody.innerHTML = state.stockFarmacia.map(s => `
        <tr>
            <td>${s.med}</td>
            <td>${s.cajas}</td>
        </tr>
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
            <td>${d.cajas ?? calcCajas(d.unidades)}</td>
            <td>${d.unidades || 0}</td>
        </tr>
    `).join('');
}

export function renderAvisos() {
    const list = document.getElementById('avisosList');
    if (!list) return;
    if (!state.avisosFarmacia.length) {
        list.innerHTML = '<div class="text-muted">Sin avisos enviados.</div>';
        return;
    }
    list.innerHTML = state.avisosFarmacia.map(a => `
        <div class="border rounded-3 p-2">
            <div class="fw-bold">${a.paciente}</div>
            <div class="small text-muted">${a.fecha}</div>
            <div>${a.texto}</div>
        </div>
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
            <td>${i.estado}</td>
            <td><button class="btn btn-sm btn-outline-primary" data-listo-id="${idx}">Marcar listo</button></td>
        </tr>
    `).join('');
    tbody.querySelectorAll('[data-listo-id]').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.listoId, 10);
            state.inventarioPacientes = state.inventarioPacientes.map((i, iIdx) => iIdx === idx ? { ...i, estado: 'Listo' } : i);
            localStorage.setItem('vitaInventario', JSON.stringify(state.inventarioPacientes));
            renderInventarioFarmacia();
            renderReposiciones();
            renderResumenPacientes();
        });
    });
}

function renderReposiciones() {
    const list = document.getElementById('reposicionesList');
    if (!list) return;
    if (!state.inventarioPacientes.length) {
        list.innerHTML = '<li class="text-muted">Sin reposiciones pendientes.</li>';
        return;
    }
    const criticos = state.inventarioPacientes
        .map((i) => ({
            ...i,
            diasRestantes: calcularDiasRestantes(i)
        }))
        .filter(i => (i.unidades || 0) <= 3 || i.estado === 'Pendiente' || (i.diasRestantes !== null && i.diasRestantes <= 2))
        .slice(0, 5);
    if (!criticos.length) {
        list.innerHTML = '<li class="text-muted">Sin reposiciones pendientes.</li>';
        return;
    }
    list.innerHTML = criticos.map(i => `
        <li class="mb-2 d-flex justify-content-between align-items-start gap-2">
            <div>${i.paciente} - ${i.med} (${i.unidades} uds, ${calcCajas(i.unidades)} cajas${i.diasRestantes !== null ? ` · ${i.diasRestantes} dias` : ''})</div>
            <button class="btn btn-sm btn-outline-primary" data-aviso-paciente="${i.paciente}" data-aviso-med="${i.med}">Avisar</button>
        </li>
    `).join('');

    list.querySelectorAll('[data-aviso-paciente]').forEach(btn => {
        btn.addEventListener('click', () => {
            const paciente = btn.dataset.avisoPaciente || '';
            const med = btn.dataset.avisoMed || '';
            const inputPaciente = document.getElementById('avisoPaciente');
            const inputTexto = document.getElementById('avisoTexto');
            if (inputPaciente) inputPaciente.value = paciente;
            if (inputTexto) inputTexto.value = `Tu medicacion de ${med} esta baja. Puedes pasar por la farmacia a reponer.`;
            const form = document.getElementById('avisoForm');
            if (form) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

function renderInteracciones() {
    const countEl = document.getElementById('interaccionesCount');
    const hintEl = document.getElementById('interaccionesHint');
    const list = document.getElementById('interaccionesModalList');
    const listAlt = document.getElementById('interaccionesCommsList');
    if (!countEl || !hintEl || !list) return;
    const alerts = buildInteracciones();
    countEl.innerText = alerts.length;
    if (!alerts.length) {
        hintEl.innerText = 'Sin interacciones detectadas.';
        list.innerHTML = '<li class="text-muted">Sin interacciones detectadas.</li>';
        if (listAlt) listAlt.innerHTML = '<li class="text-muted">Sin interacciones detectadas.</li>';
        return;
    }
    list.innerHTML = alerts.map(a => `
        <li class="mb-2">${a.paciente} - ${a.combo}</li>
    `).join('');
    if (listAlt) {
        listAlt.innerHTML = alerts.map(a => `
            <li class="mb-2">${a.paciente} - ${a.combo}</li>
        `).join('');
    }
    hintEl.innerText = `Se detectaron ${alerts.length} combinaciones a revisar.`;

    const last = sessionStorage.getItem('vitaInteraccionesCount') || '';
    if (String(alerts.length) !== last) {
        sessionStorage.setItem('vitaInteraccionesCount', String(alerts.length));
        openInteraccionesModal();
    }
}

function updateFarmaceuticoAlertBadge() {
    if (state.rolActual !== 'farmaceutico') return;
    const badge = document.getElementById('alertBadge');
    if (!badge) return;
    const interacciones = buildInteracciones().length;
    const avisos = state.avisosFarmacia.length;
    const total = interacciones + avisos;
    badge.innerText = total;
    badge.classList.toggle('d-none', total === 0);
}

function renderResumenPacientes() {
    const tbody = document.getElementById('resumenPacientesList');
    if (!tbody) return;
    if (!state.inventarioPacientes.length) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-muted">Sin inventario registrado.</td></tr>';
        return;
    }
    const resumen = buildResumenPacientes();
    if (!resumen.length) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-muted">Sin datos para mostrar.</td></tr>';
        return;
    }
    tbody.innerHTML = resumen.map(r => `
        <tr>
            <td>${r.paciente}</td>
            <td>${r.meds}</td>
            <td>${r.unidades}</td>
            <td>${r.reposicion}</td>
        </tr>
    `).join('');
}

function buildResumenPacientes() {
    const map = new Map();
    state.inventarioPacientes.forEach((item) => {
        const key = normalizeText(item.paciente);
        if (!key) return;
        if (!map.has(key)) {
            map.set(key, {
                paciente: item.paciente,
                medsSet: new Set(),
                unidades: 0,
                diasMin: null
            });
        }
        const row = map.get(key);
        row.medsSet.add(normalizeMedName(item.med));
        row.unidades += item.unidades || 0;
        const diasRestantes = calcularDiasRestantes(item);
        if (diasRestantes !== null) {
            row.diasMin = row.diasMin === null ? diasRestantes : Math.min(row.diasMin, diasRestantes);
        }
    });
    return [...map.values()]
        .map(r => ({
            paciente: r.paciente,
            meds: r.medsSet.size,
            unidades: r.unidades,
            reposicion: r.diasMin === null ? '-' : `${r.diasMin} dias`
        }))
        .sort((a, b) => b.unidades - a.unidades);
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

    state.prescripciones.forEach(p => {
        const paciente = (p.paciente || '').trim();
        if (!paciente) return;
        const med = normalizeMedName(p.med || '');
        setMed(paciente, med);
    });

    Object.keys(medsByUser).forEach((paciente) => {
        const meds = medsByUser[paciente] || [];
        meds.forEach((m) => setMed(paciente, normalizeMedName(m.nombre || '')));
    });

    const alerts = [];
    Object.keys(byPaciente).forEach(key => {
        const entry = byPaciente[key];
        const meds = [...entry.meds];
        const hasStatin = meds.some(m => m.includes('statin') || m.includes('statina'));
        if (meds.includes('fluconazol') && hasStatin) {
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

function openInteraccionesModal() {
    const modalEl = document.getElementById('interaccionesModal');
    if (!modalEl || !window.bootstrap) return;
    const modal = window.bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
}

function calcularDiasRestantes(item) {
    if (!item || !item.prescId) return null;
    const presc = state.prescripciones.find(p => p.id === item.prescId);
    if (!presc || !presc.tomas) return null;
    return Math.ceil((item.unidades || 0) / presc.tomas);
}

function calcCajas(unidades) {
    if (!unidades) return 0;
    return Math.ceil(unidades / UNIDADES_POR_CAJA);
}

function normalizeMedName(value) {
    if (!value) return '';
    return value
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .trim();
}

function normalizeText(value) {
    return normalizeMedName(value);
}

function findStockIndex(med) {
    return state.stockFarmacia.findIndex(s => normalizeMedName(s.med) === normalizeMedName(med));
}

function capitalize(value) {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1);
}
