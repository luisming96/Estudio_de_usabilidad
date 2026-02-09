import { state } from './core.js';

export function initFarmaceutico() {
    if (!state.stockFarmacia.length) {
        state.stockFarmacia = [
            { med: 'Metformina', cant: 12 },
            { med: 'Omeprazol', cant: 5 },
            { med: 'Paracetamol', cant: 18 }
        ];
        localStorage.setItem('vitaStock', JSON.stringify(state.stockFarmacia));
    }
    renderStock();

    const stockForm = document.getElementById('stockForm');
    if (stockForm) {
        stockForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const med = document.getElementById('stockMed').value.trim();
            const cant = parseInt(document.getElementById('stockCant').value, 10);
            if (!med || Number.isNaN(cant)) return alert('Completa medicamento y unidades');
            state.stockFarmacia.unshift({ med, cant });
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
            const unidades = parseInt(document.getElementById('dispUnidades').value, 10) || 0;
            if (!paciente || !med || unidades <= 0) return alert('Completa paciente, medicamento y unidades');

            const idx = state.inventarioPacientes.findIndex(i => i.paciente.toLowerCase() === paciente.toLowerCase() && i.med.toLowerCase() === med.toLowerCase());
            if (idx === -1) return alert('No existe inventario para ese paciente');
            if (state.inventarioPacientes[idx].unidades < unidades) return alert('Unidades insuficientes');

            state.inventarioPacientes[idx].unidades -= unidades;
            state.inventarioPacientes[idx].estado = state.inventarioPacientes[idx].unidades === 0 ? 'Dispensado' : 'Parcial';
            localStorage.setItem('vitaInventario', JSON.stringify(state.inventarioPacientes));

            state.dispensaciones.unshift({ fecha: new Date().toLocaleDateString(), paciente, med, unidades });
            localStorage.setItem('vitaDispensaciones', JSON.stringify(state.dispensaciones.slice(0, 50)));
            dispForm.reset();
            renderDispensaciones();
            renderInventarioFarmacia();
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
            state.inventarioPacientes = state.inventarioPacientes.map(i => i.paciente.toLowerCase() === paciente.toLowerCase() ? { ...i, estado: 'Listo' } : i);
            localStorage.setItem('vitaInventario', JSON.stringify(state.inventarioPacientes));
            avisoForm.reset();
            renderAvisos();
            renderInventarioFarmacia();
        });
    }
    renderAvisos();
    renderInventarioFarmacia();
    renderReposiciones();
    renderInteracciones();
}

export function renderStock() {
    const tbody = document.getElementById('stockList');
    if (!tbody) return;
    tbody.innerHTML = state.stockFarmacia.map(s => `
        <tr>
            <td>${s.med}</td>
            <td>${s.cant}</td>
        </tr>
    `).join('') || '<tr><td colspan="2" class="text-muted">Sin stock registrado.</td></tr>';
}

export function renderDispensaciones() {
    const tbody = document.getElementById('dispList');
    if (!tbody) return;
    if (!state.dispensaciones.length) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-muted">Sin dispensaciones.</td></tr>';
        return;
    }
    tbody.innerHTML = state.dispensaciones.map(d => `
        <tr>
            <td>${d.fecha}</td>
            <td>${d.paciente}</td>
            <td>${d.med}</td>
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
            <td>${i.unidades}</td>
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
        .filter(i => (i.unidades || 0) <= 3 || i.estado === 'Pendiente')
        .slice(0, 5);
    if (!criticos.length) {
        list.innerHTML = '<li class="text-muted">Sin reposiciones pendientes.</li>';
        return;
    }
    list.innerHTML = criticos.map(i => `
        <li class="mb-2">${i.paciente} - ${i.med} (${i.unidades} uds)</li>
    `).join('');
}

function renderInteracciones() {
    const list = document.getElementById('interaccionesList');
    if (!list) return;
    const alerts = buildInteracciones();
    if (!alerts.length) {
        list.innerHTML = '<li class="text-muted">Sin interacciones detectadas.</li>';
        return;
    }
    list.innerHTML = alerts.map(a => `
        <li class="mb-2">${a.paciente} - ${a.combo}</li>
    `).join('');
}

function buildInteracciones() {
    if (!state.prescripciones.length) return [];
    const rules = [
        ['ibuprofeno', 'enalapril'],
        ['warfarina', 'aspirina'],
        ['omeprazol', 'clopidogrel']
    ];

    const byPaciente = {};
    state.prescripciones.forEach(p => {
        const paciente = (p.paciente || '').trim();
        if (!paciente) return;
        const med = normalizeMedName(p.med || '');
        if (!byPaciente[paciente]) byPaciente[paciente] = new Set();
        if (med) byPaciente[paciente].add(med);
    });

    const alerts = [];
    Object.keys(byPaciente).forEach(paciente => {
        const meds = [...byPaciente[paciente]];
        const hasStatin = meds.some(m => m.includes('statin') || m.includes('statina'));
        if (meds.includes('fluconazol') && hasStatin) {
            alerts.push({ paciente, combo: 'Fluconazol + Estatinas' });
        }
        rules.forEach(([a, b]) => {
            if (meds.includes(a) && meds.includes(b)) {
                alerts.push({ paciente, combo: `${capitalize(a)} + ${capitalize(b)}` });
            }
        });
    });
    return alerts.slice(0, 6);
}

function normalizeMedName(value) {
    if (!value) return '';
    return value
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .trim();
}

function capitalize(value) {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1);
}
