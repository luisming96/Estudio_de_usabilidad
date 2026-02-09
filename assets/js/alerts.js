import { state, matchesPaciente } from './core.js';

export function initAlertas(openId = null) {
    const isAuth = localStorage.getItem('vitaAuth') === 'true';
    const role = localStorage.getItem('vitaRole') || 'paciente';
    const badgeOnly = document.getElementById('alertBadge');
    if (!isAuth || (role !== 'paciente' && role !== 'medico')) {
        if (badgeOnly) badgeOnly.classList.add('d-none');
        return;
    }

    state.prescripciones = JSON.parse(localStorage.getItem('vitaPrescripciones')) || [];
    state.mensajesMedicos = JSON.parse(localStorage.getItem('vitaMensajes')) || [];
    state.avisosFarmacia = JSON.parse(localStorage.getItem('vitaAvisos')) || [];

    const contAll = document.getElementById('alertasTodasList');
    const contUnread = document.getElementById('alertasSinLeerList');
    const contRecord = document.getElementById('alertasRecordatoriosList');
    const contInter = document.getElementById('alertasInteraccionesList');
    const contEmerg = document.getElementById('alertasEmergenciasList');
    const badge = document.getElementById('alertBadge');
    if (!contAll && !contUnread && !contRecord && !contInter && !contEmerg && !badge) return;

    if (role === 'medico') {
        const header = document.getElementById('alertasMedicoHeader');
        const tabs = document.getElementById('alertasTabs');
        if (header) header.classList.remove('d-none');
        if (tabs) tabs.classList.add('d-none');

        const doctorAlerts = buildDoctorAlerts();
        const unreadDoc = doctorAlerts.filter(a => !a.read);
        updateBadge(badge, unreadDoc.length);
        renderDoctorList(contAll, doctorAlerts, 'Sin alertas de pacientes.');
        renderDoctorList(contUnread, [], '');
        renderDoctorList(contRecord, [], '');
        renderDoctorList(contInter, [], '');
        renderDoctorList(contEmerg, [], '');
        return;
    }

    const alerts = buildAlerts();
    const unread = alerts.filter(a => !a.read);
    const record = alerts.filter(a => a.type === 'recordatorio');
    const inter = alerts.filter(a => a.type === 'interaccion');
    const emerg = alerts.filter(a => a.type === 'emergencia');

    updateBadge(badge, unread.length);

    renderList(contAll, alerts, 'No tienes alertas.', openId);
    renderList(contUnread, unread, 'Sin alertas sin leer.', openId);
    renderList(contRecord, record, 'Sin recordatorios pendientes.', openId);
    renderList(contInter, inter, 'Sin alertas de interacciones.', openId);
    renderList(contEmerg, emerg, 'Sin emergencias activas.', openId);
}

function updateBadge(badge, count) {
    if (!badge) return;
    if (!count) {
        badge.classList.add('d-none');
        badge.innerText = '0';
        return;
    }
    badge.classList.remove('d-none');
    badge.innerText = count > 9 ? '9+' : String(count);
}

function buildAlerts() {
    const hoyMs = new Date().setHours(0, 0, 0, 0);
    const readIds = new Set(JSON.parse(localStorage.getItem('vitaAlertsRead')) || []);
    const list = [];

    state.meds.forEach(m => {
        if (m.manual) return;
        const diasRestantes = m.duracionDias - Math.floor((hoyMs - m.fechaInicio) / 86400000);
        if (diasRestantes > 0 && diasRestantes <= 3) {
            list.push({
                id: `med-${m.nombre}-${m.fechaInicio}`,
                type: 'recordatorio',
                title: 'Medicamento por terminar',
                detail: `${m.nombre} se acaba en ${diasRestantes} dia${diasRestantes > 1 ? 's' : ''}.`,
                meta: 'Recordatorio de toma',
                read: readIds.has(`med-${m.nombre}-${m.fechaInicio}`)
            });
        }
    });

    state.mensajesMedicos
        .filter(m => matchesPaciente(m.paciente))
        .forEach(m => {
            list.push({
                id: `msg-${m.paciente}-${m.fecha}-${m.texto}`,
                type: 'recordatorio',
                title: 'Mensaje del medico',
                detail: m.texto,
                meta: m.fecha,
                read: readIds.has(`msg-${m.paciente}-${m.fecha}-${m.texto}`)
            });
        });

    state.prescripciones
        .filter(p => matchesPaciente(p.paciente) && p.estado !== 'Activo')
        .forEach(p => {
            const id = `presc-${p.paciente}-${p.id}`;
            list.push({
                id,
                type: 'recordatorio',
                title: 'Nueva prescripcion',
                detail: `${p.med} ${p.dosis ? '(' + p.dosis + ')' : ''} - ${p.dias} dias`,
                meta: 'Pendiente de activar',
                read: readIds.has(id)
            });
        });

    state.avisosFarmacia
        .filter(a => matchesPaciente(a.paciente))
        .forEach(a => {
            const isInter = /interacci[oó]n/i.test(a.texto || '');
            list.push({
                id: `farm-${a.paciente}-${a.fecha}-${a.texto}`,
                type: isInter ? 'interaccion' : 'recordatorio',
                title: isInter ? 'Alerta de interaccion' : 'Aviso de farmacia',
                detail: a.texto,
                meta: a.fecha,
                read: readIds.has(`farm-${a.paciente}-${a.fecha}-${a.texto}`)
            });
        });

    return list;
}

function renderList(container, items, emptyText, openId) {
    if (!container) return;
    if (!items.length) {
        container.innerHTML = `<div class="dash-card text-center py-5"><p class="text-muted mb-0">${emptyText}</p></div>`;
        return;
    }
    container.innerHTML = items.map(a => `
        <div class="alert-card ${a.read ? 'is-read' : ''} ${openId && openId === a.id ? 'is-open' : ''}" data-alert-id="${a.id}">
            <div class="alert-title">${a.title}</div>
            <div class="alert-detail">${a.detail}</div>
            <div class="alert-meta">${a.meta}</div>
        </div>
    `).join('');

    container.querySelectorAll('[data-alert-id]').forEach(card => {
        card.addEventListener('click', () => {
            const id = card.dataset.alertId;
            const readIds = new Set(JSON.parse(localStorage.getItem('vitaAlertsRead')) || []);
            if (!readIds.has(id)) {
                readIds.add(id);
                localStorage.setItem('vitaAlertsRead', JSON.stringify([...readIds]));
                initAlertas(id);
                return;
            }
            card.classList.toggle('is-open');
        });
    });
}

function buildDoctorAlerts() {
    const readIds = new Set(JSON.parse(localStorage.getItem('vitaAlertsMedicoRead')) || []);
    const list = JSON.parse(localStorage.getItem('vitaAlertasMedico')) || [];
    return list.map(a => ({
        id: `med-${a.id}`,
        type: a.tipo === 'urgencia' ? 'emergencia' : 'recordatorio',
        title: a.tipo === 'urgencia' ? 'Urgencia reportada' : 'Mensaje de paciente',
        detail: a.texto,
        meta: `${a.paciente} · ${a.fecha}`,
        read: readIds.has(`med-${a.id}`)
    }));
}

function renderDoctorList(container, items, emptyText) {
    if (!container) return;
    if (!items.length) {
        container.innerHTML = emptyText ? `<div class="dash-card text-center py-5"><p class="text-muted mb-0">${emptyText}</p></div>` : '';
        return;
    }
    container.innerHTML = items.map(a => `
        <div class="alert-card ${a.read ? 'is-read' : ''}" data-alert-id="${a.id}">
            <div class="alert-title">${a.title}</div>
            <div class="alert-detail">${a.detail}</div>
            <div class="alert-meta">${a.meta}</div>
        </div>
    `).join('');

    container.querySelectorAll('[data-alert-id]').forEach(card => {
        card.addEventListener('click', () => {
            const id = card.dataset.alertId;
            const readIds = new Set(JSON.parse(localStorage.getItem('vitaAlertsMedicoRead')) || []);
            if (!readIds.has(id)) {
                readIds.add(id);
                localStorage.setItem('vitaAlertsMedicoRead', JSON.stringify([...readIds]));
                initAlertas();
                return;
            }
            card.classList.toggle('is-open');
        });
    });
}
