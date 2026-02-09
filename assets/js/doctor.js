import { state } from './core.js';

export function initMedico() {
    state.prescripciones = JSON.parse(localStorage.getItem('vitaPrescripciones')) || [];
    state.inventarioPacientes = JSON.parse(localStorage.getItem('vitaInventario')) || [];

    const form = document.getElementById('prescripcionForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const paciente = document.getElementById('prescPaciente').value.trim();
            const med = document.getElementById('prescMed').value.trim();
            const dosis = document.getElementById('prescDosis').value.trim();
            const dias = parseInt(document.getElementById('prescDias').value, 10) || 1;
            const tomas = parseInt(document.getElementById('prescTomas').value, 10) || 1;
            const hora = document.getElementById('prescHora').value || '08:00';
            const notas = document.getElementById('prescNotas').value.trim();
            if (!paciente || !med) return alert('Completa paciente y medicamento');

            if (state.prescripcionEditId) {
                state.prescripciones = state.prescripciones.map(p => p.id === state.prescripcionEditId ? {
                    ...p,
                    paciente,
                    med,
                    dosis,
                    dias,
                    tomas,
                    hora,
                    notas,
                    estado: p.estado === 'Activo' ? 'Activo' : 'Pendiente'
                } : p);
                state.inventarioPacientes = state.inventarioPacientes.map(i => {
                    if (i.prescId && i.prescId === state.prescripcionEditId) {
                        return { ...i, paciente, med, unidades: dias * tomas };
                    }
                    return i;
                });
                localStorage.setItem('vitaInventario', JSON.stringify(state.inventarioPacientes.slice(0, 100)));
                state.prescripcionEditId = null;
            } else {
                const item = {
                    id: Date.now(),
                    paciente,
                    med,
                    dosis,
                    dias,
                    tomas,
                    hora,
                    notas,
                    estado: 'Pendiente'
                };
                state.prescripciones.unshift(item);
                const unidades = dias * tomas;
                state.inventarioPacientes.unshift({
                    prescId: item.id,
                    paciente,
                    med,
                    unidades,
                    estado: 'Pendiente',
                    fecha: new Date().toLocaleDateString()
                });
                localStorage.setItem('vitaInventario', JSON.stringify(state.inventarioPacientes.slice(0, 100)));
            }
            localStorage.setItem('vitaPrescripciones', JSON.stringify(state.prescripciones.slice(0, 50)));
            form.reset();
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.innerText = 'Guardar prescripcion';
            renderPrescripciones();
            renderPacientesRiesgo();
            renderCumplimiento();
            renderTratamientosActivos();
            renderSeguimientoPacientes();
        });
    }
    const resetBtn = document.getElementById('prescReset');
    if (resetBtn && form) {
        resetBtn.addEventListener('click', () => {
            form.reset();
            state.prescripcionEditId = null;
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.innerText = 'Guardar prescripcion';
        });
    }
    renderPrescripciones();
    renderPacientesRiesgo();
    renderCumplimiento();
    renderTratamientosActivos();
    renderSeguimientoPacientes();
    renderAlertasMedico();
    initNuevoSeguimiento();

    const mensajeForm = document.getElementById('mensajeForm');
    if (mensajeForm) {
        mensajeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const paciente = document.getElementById('mensajePaciente').value.trim();
            const texto = document.getElementById('mensajeTexto').value.trim();
            if (!paciente || !texto) return alert('Completa paciente y mensaje');
            state.mensajesMedicos.unshift({ paciente, texto, fecha: new Date().toLocaleDateString() });
            localStorage.setItem('vitaMensajes', JSON.stringify(state.mensajesMedicos.slice(0, 50)));
            mensajeForm.reset();
            renderMensajes();
        });
    }
    renderMensajes();

    const buscarHistorialBtn = document.getElementById('buscarHistorial');
    if (buscarHistorialBtn) {
        buscarHistorialBtn.addEventListener('click', () => {
            const nombre = document.getElementById('histPacienteNombre').value.trim();
            renderHistorialPaciente(nombre);
        });
    }
}

function renderPacientesRiesgo() {
    const list = document.getElementById('riesgoList');
    if (!list) return;
    const resumen = buildPacientesResumen();
    const enRiesgo = resumen
        .filter(r => r.riesgoClinico || (r.total && r.pct < 70) || r.total === 0)
        .sort((a, b) => getRiesgoScore(b) - getRiesgoScore(a));
    if (!enRiesgo.length) {
        list.innerHTML = '<li class="text-muted">Sin pacientes en riesgo.</li>';
        return;
    }
    list.innerHTML = enRiesgo.map(r => {
        const motivos = [];
        if (r.riesgoDetalle) motivos.push(`riesgo clinico: ${r.riesgoDetalle}`);
        if (r.total === 0) {
            motivos.push('sin tomas registradas');
        } else if (r.pct < 70) {
            motivos.push(`bajo cumplimiento: ${r.pct}%`);
        } else {
            motivos.push(`${r.pct}% cumplimiento`);
        }
        return `<li class="mb-2">${r.paciente} - ${motivos.join(' | ')}</li>`;
    }).join('');
}

function renderCumplimiento() {
    const tbody = document.getElementById('cumplimientoList');
    if (!tbody) return;
    const resumen = buildPacientesResumen();
    if (!resumen.length) {
        tbody.innerHTML = '<tr><td colspan="3" class="text-muted">Sin datos de cumplimiento.</td></tr>';
        return;
    }
    const rango = 'Hoy';
    tbody.innerHTML = resumen.map(r => `
        <tr>
            <td>${r.paciente}</td>
            <td>${rango}</td>
            <td>${r.pct}%</td>
        </tr>
    `).join('');
}

function renderTratamientosActivos() {
    const tbody = document.getElementById('tratamientosActivosList');
    if (!tbody) return;
    const activos = state.prescripciones.filter(p => p.estado === 'Activo');
    if (!activos.length) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-muted">Sin tratamientos activos.</td></tr>';
        return;
    }
    const resumen = buildPacientesResumen();
    const resumenByPaciente = new Map(resumen.map(r => [r.paciente.toLowerCase(), r]));
    tbody.innerHTML = activos.map(p => {
        const resumenPaciente = resumenByPaciente.get((p.paciente || '').toLowerCase());
        const pct = resumenPaciente ? resumenPaciente.pct : 0;
        const badge = pct < 40 ? 'text-bg-danger' : pct < 70 ? 'text-bg-warning' : 'text-bg-success';
        const estadoLabel = p.estado === 'Activo' ? 'Activo' : 'Pendiente';
        return `
            <tr>
                <td>${p.paciente}</td>
                <td>${p.med}${p.dias ? ` ${p.dias} dias` : ''}</td>
                <td><span class="badge ${badge}">${estadoLabel}</span></td>
                <td class="d-flex gap-2">
                    <button class="btn btn-sm btn-outline-primary" data-trat="revisar" data-paciente="${p.paciente}">Revisar</button>
                    <button class="btn btn-sm btn-outline-primary" data-trat="contactar" data-paciente="${p.paciente}">Contactar</button>
                </td>
            </tr>
        `;
    }).join('');

    tbody.querySelectorAll('[data-trat]').forEach(btn => {
        btn.addEventListener('click', () => {
            const paciente = btn.dataset.paciente || '';
            const action = btn.dataset.trat;
            if (action === 'contactar') {
                const input = document.getElementById('mensajePaciente');
                if (input) input.value = paciente;
                const texto = document.getElementById('mensajeTexto');
                if (texto) texto.focus();
                return;
            }
            if (action === 'revisar') {
                renderTratamientoDetalle(paciente);
                const form = document.getElementById('tratamientoDetalle');
                if (form) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

function renderAlertasMedico() {
    const list = document.getElementById('alertasMedicoList');
    if (!list) return;
    const alerts = JSON.parse(localStorage.getItem('vitaAlertasMedico')) || [];
    const readIds = new Set(JSON.parse(localStorage.getItem('vitaAlertsMedicoRead')) || []);
    if (!alerts.length) {
        list.innerHTML = '<div class="text-muted">Sin alertas de pacientes.</div>';
        return;
    }
    list.innerHTML = alerts.map(a => {
        const id = `med-${a.id}`;
        const isUrg = a.tipo === 'urgencia';
        const badge = isUrg ? 'text-bg-danger' : 'text-bg-primary';
        return `
            <div class="border rounded-3 p-2 ${readIds.has(id) ? 'opacity-75' : ''}">
                <div class="d-flex justify-content-between align-items-center">
                    <div class="fw-bold">${a.paciente}</div>
                    <span class="badge ${badge}">${isUrg ? 'Urgente' : 'Mensaje'}</span>
                </div>
                <div class="small text-muted">${a.fecha}</div>
                <div>${a.texto}</div>
                <button class="btn btn-sm btn-outline-primary mt-2" data-alert-med="${id}">Marcar leida</button>
            </div>
        `;
    }).join('');

    list.querySelectorAll('[data-alert-med]').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.alertMed;
            const readSet = new Set(JSON.parse(localStorage.getItem('vitaAlertsMedicoRead')) || []);
            readSet.add(id);
            localStorage.setItem('vitaAlertsMedicoRead', JSON.stringify([...readSet]));
            renderAlertasMedico();
        });
    });
}

function buildPacientesResumen() {
    const medsByUser = JSON.parse(localStorage.getItem('vitaMedsByUser')) || {};
    const prescPatients = state.prescripciones.map(p => (p.paciente || '').trim()).filter(Boolean);
    const histByUser = JSON.parse(localStorage.getItem('vitaHistorialByUser')) || {};
    const perfilesByUser = JSON.parse(localStorage.getItem('vitaProfilesByUser')) || {};
    const pacientes = new Set([
        ...Object.keys(medsByUser),
        ...prescPatients,
        ...Object.keys(histByUser),
        ...Object.keys(perfilesByUser)
    ]);
    const resumen = [];
    pacientes.forEach((paciente) => {
        const nombre = (paciente || '').trim();
        const meds = getByKeyCaseInsensitive(medsByUser, nombre) || [];
        const { total, hechos } = calcularAdherencia(meds);
        const pct = total ? Math.round((hechos / total) * 100) : 0;
        const hist = getHistorialPorPaciente(histByUser, nombre);
        const perfil = getPerfilPorPaciente(perfilesByUser, nombre);
        const riesgoDetalle = getRiesgoDetalle(hist) || getRiesgoDetalleFromPerfil(perfil);
           const riesgoClinico = !!riesgoDetalle;
           resumen.push({ paciente: nombre || paciente, total, hechos, pct, riesgoClinico, riesgoDetalle });
    });
    return resumen.sort((a, b) => a.pct - b.pct);
}

function initNuevoSeguimiento() {
    const btn = document.getElementById('nuevoSeguimiento');
    if (!btn) return;
    btn.addEventListener('click', () => {
        const input = document.getElementById('seguimientoPaciente');
        const paciente = input ? input.value.trim() : '';
        const inputPaciente = document.getElementById('mensajePaciente');
        const inputTexto = document.getElementById('mensajeTexto');

        if (!paciente) {
                alert('Selecciona un paciente para iniciar seguimiento.');
            return;
        }
        if (inputPaciente) inputPaciente.value = paciente;
        if (inputTexto) inputTexto.value = 'Seguimiento: revisar sintomas y adherencia de la semana.';
        const form = document.getElementById('mensajeForm');
        if (form) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
}

    function renderSeguimientoPacientes() {
        const input = document.getElementById('seguimientoPaciente');
        const list = document.getElementById('seguimientoPacientesList');
        if (!input || !list) return;
        const resumen = buildPacientesResumen();
        if (!resumen.length) {
            list.innerHTML = '';
            input.value = '';
            input.placeholder = 'Sin pacientes registrados';
            input.disabled = true;
            return;
        }
        const pacientes = resumen.map(r => r.paciente).filter(Boolean);
        pacientes.sort((a, b) => a.localeCompare(b));
        list.innerHTML = pacientes.map(p => `<option value="${p}"></option>`).join('');
        input.disabled = false;
        input.placeholder = 'Escribe o selecciona un paciente';
    }

    function getHistorialPorPaciente(histByUser, nombre) {
        if (!histByUser || !nombre) return [];
        const direct = getByKeyCaseInsensitive(histByUser, nombre);
        if (direct && direct.length) return direct;
        const normalize = (val) => val.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').trim();
        const target = normalize(nombre);
        const matchKey = Object.keys(histByUser).find(k => {
            const keyNorm = normalize(k);
            return keyNorm.includes(target) || target.includes(keyNorm);
        });
        return matchKey ? histByUser[matchKey] : [];
    }

    function getPerfilPorPaciente(perfilesByUser, nombre) {
        if (!perfilesByUser || !nombre) return null;
        const direct = getByKeyCaseInsensitive(perfilesByUser, nombre);
        if (direct) return direct;
        const normalize = (val) => val.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').trim();
        const target = normalize(nombre);
        const matchKey = Object.keys(perfilesByUser).find(k => {
            const keyNorm = normalize(k);
            return keyNorm.includes(target) || target.includes(keyNorm);
        });
        return matchKey ? perfilesByUser[matchKey] : null;
    }

function getByKeyCaseInsensitive(obj, key) {
    if (!obj || !key) return null;
    const normalize = (val) => val.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').trim();
    const target = normalize(key);
    const matchKey = Object.keys(obj).find(k => normalize(k) === target);
    return matchKey ? obj[matchKey] : null;
}

function getRiesgoDetalle(historial) {
    if (!historial || !historial.length) return '';
    const keywords = /(diabetes|hipertension|cardio|renal|asma|cronica|urgente|riesgo|alergia|epoc|oncolog)/i;
    const match = historial.find(item => keywords.test(`${item.evento || ''} ${item.notas || ''}`));
    if (!match) return '';
    const texto = `${match.evento || ''} ${match.notas || ''}`.trim();
    return texto.length ? texto : 'condicion clinica registrada';
}

function getRiesgoDetalleFromPerfil(perfil) {
    if (!perfil) return '';
    const partes = [];
    const cronicas = (perfil.cronicas || '').trim();
    const alergias = (perfil.alergias || '').trim();
    const keywords = /(diabetes|hipertension|cardio|renal|asma|cronica|urgente|riesgo|alergia|epoc|oncolog)/i;

    if (cronicas && keywords.test(cronicas)) partes.push(`cronicas: ${cronicas}`);
    if (alergias) partes.push(`alergias: ${alergias}`);
    return partes.join(' | ');
}

function getRiesgoScore(r) {
    let score = 0;
    if (r.riesgoClinico) score += 50;
    if (r.total === 0) score += 30;
    if (r.total && r.pct < 70) score += 20;
    score += Math.max(0, 100 - (r.pct || 0)) / 10;
    return score;
}

function calcularAdherencia(meds) {
    let total = 0;
    let hechos = 0;
    const hoyMs = new Date().setHours(0, 0, 0, 0);
    meds.forEach(m => {
        const vigente = m.manual || (m.duracionDias - Math.floor((hoyMs - m.fechaInicio) / 86400000) > 0);
        if (!vigente) return;
        if (m.manual) {
            total++;
            if (m.mHecho || m.tHecho || m.nHecho) hechos++;
            return;
        }
        total += m.tomasAlDia;
        if (m.mHecho) hechos++;
        if (m.tomasAlDia === 3 && m.tHecho) hechos++;
        if (m.tomasAlDia >= 2 && m.nHecho) hechos++;
    });
    return { total, hechos };
}

export function renderPrescripciones() {
    const tbody = document.getElementById('prescripcionesList');
    if (!tbody) return;
    const pendientes = state.prescripciones.filter(p => p.estado !== 'Activo');
    if (!pendientes.length) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-muted">Sin prescripciones pendientes.</td></tr>';
        return;
    }
    tbody.innerHTML = pendientes.map(p => `
        <tr>
            <td>${p.paciente}</td>
            <td>${p.med}${p.notas ? `<div class="small text-muted">${p.notas}</div>` : ''}</td>
            <td><span class="badge ${p.estado === 'Activo' ? 'text-bg-success' : 'text-bg-warning'}">${p.estado}</span></td>
            <td class="d-flex gap-2">
                <button class="btn btn-sm btn-outline-primary" data-presc="${p.id}">Editar</button>
                <button class="btn btn-sm btn-outline-danger" data-del-presc="${p.id}">Eliminar</button>
            </td>
        </tr>
    `).join('');
    tbody.querySelectorAll('[data-presc]').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.presc, 10);
            const presc = state.prescripciones.find(p => p.id === id);
            if (!presc) return;
            fillPrescripcionForm(presc);
        });
    });
    tbody.querySelectorAll('[data-del-presc]').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.delPresc, 10);
            if (!confirm('¿Eliminar prescripcion?')) return;
            state.prescripciones = state.prescripciones.filter(p => p.id !== id);
            state.inventarioPacientes = state.inventarioPacientes.filter(i => i.prescId !== id);
            localStorage.setItem('vitaPrescripciones', JSON.stringify(state.prescripciones.slice(0, 50)));
            localStorage.setItem('vitaInventario', JSON.stringify(state.inventarioPacientes.slice(0, 100)));
            renderPrescripciones();
            renderPacientesRiesgo();
            renderCumplimiento();
            renderTratamientosActivos();
            renderSeguimientoPacientes();
        });
    });
}

export function renderMensajes() {
    const list = document.getElementById('mensajesList');
    if (!list) return;
    if (!state.mensajesMedicos.length) {
        list.innerHTML = '<div class="text-muted">Sin mensajes enviados.</div>';
        return;
    }
    list.innerHTML = state.mensajesMedicos.map(m => `
        <div class="border rounded-3 p-2">
            <div class="fw-bold">${m.paciente}</div>
            <div class="small text-muted">${m.fecha}</div>
            <div>${m.texto}</div>
        </div>
    `).join('');
}

export function renderHistorialPaciente(nombre) {
    const cont = document.getElementById('historialPaciente');
    if (!cont) return;
    if (!nombre) {
        cont.innerHTML = '<div class="text-muted">Introduce un nombre de paciente.</div>';
        return;
    }
    const medsByUser = JSON.parse(localStorage.getItem('vitaMedsByUser')) || {};
    const histByUser = JSON.parse(localStorage.getItem('vitaHistorialByUser')) || {};
    const medsPac = getByKeyCaseInsensitive(medsByUser, nombre) || [];
    const histPac = getByKeyCaseInsensitive(histByUser, nombre) || [];
    cont.innerHTML = `
        <div class="row g-3">
            <div class="col-lg-6">
                <div class="border rounded-3 p-3">
                    <div class="fw-bold mb-2">Medicacion activa</div>
                    ${medsPac.length ? medsPac.map(m => `<div>${m.nombre} (${m.tomasAlDia} tomas/dia)</div>`).join('') : '<div class="text-muted">Sin registros</div>'}
                </div>
            </div>
            <div class="col-lg-6">
                <div class="border rounded-3 p-3">
                    <div class="fw-bold mb-2">Historial medico</div>
                    ${histPac.length ? histPac.map(h => {
                        const item = normalizeHistorialItem(h);
                        const extra = [item.exploracion ? `Exploracion: ${item.exploracion}` : '', item.diagnostico ? `Diagnostico: ${item.diagnostico}` : '']
                            .filter(Boolean)
                            .join(' · ');
                        return `<div>${item.fecha} - ${item.patologia}${extra ? ` (${extra})` : ''}</div>`;
                    }).join('') : '<div class="text-muted">Sin eventos</div>'}
                </div>
            </div>
        </div>
    `;
}

function renderTratamientoDetalle(paciente) {
    const cont = document.getElementById('tratamientoDetalle');
    if (!cont) return;
    if (!paciente) {
        cont.innerHTML = '<div class="text-muted">Selecciona un paciente para revisar su tratamiento.</div>';
        return;
    }
    const resumen = buildPacientesResumen();
    const resumenPaciente = resumen.find(r => normalizeName(r.paciente) === normalizeName(paciente));
    const pct = resumenPaciente ? resumenPaciente.pct : 0;
    const badge = pct < 40 ? 'text-bg-danger' : pct < 70 ? 'text-bg-warning' : 'text-bg-success';

    const prescs = state.prescripciones.filter(p => p.estado === 'Activo' && normalizeName(p.paciente) === normalizeName(paciente));
    const medsByUser = JSON.parse(localStorage.getItem('vitaMedsByUser')) || {};
    const meds = getByKeyCaseInsensitive(medsByUser, paciente) || [];

    const prescHtml = prescs.length ? prescs.map(p => `
        <div class="border rounded-3 p-2">
            <div class="fw-bold">${p.med}</div>
            <div class="small text-muted">${p.dosis || '-'} · ${p.tomas || 1} tomas/dia · ${p.dias || 0} dias</div>
            <div class="small text-muted">Hora sugerida: ${p.hora || '08:00'}</div>
            ${p.notas ? `<div class="small text-muted">${p.notas}</div>` : ''}
            <button class="btn btn-sm btn-outline-primary mt-2" data-edit-presc="${p.id}">Editar prescripcion</button>
        </div>
    `).join('') : '<div class="text-muted">Sin prescripciones activas.</div>';

    const medsHtml = meds.length ? meds.map(m => {
        const hechos = [m.mHecho, m.tHecho, m.nHecho].filter(Boolean).length;
        return `<div class="border rounded-3 p-2">
            <div class="fw-bold">${m.nombre}</div>
            <div class="small text-muted">${m.tomasAlDia || 1} tomas/dia · Hechas hoy: ${hechos}</div>
        </div>`;
    }).join('') : '<div class="text-muted">Sin tomas registradas.</div>';

    cont.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
                <div class="fw-bold">${paciente}</div>
                <div class="small text-muted">Adherencia hoy: ${pct}%</div>
            </div>
            <span class="badge ${badge}">${pct < 70 ? 'En seguimiento' : 'Estable'}</span>
        </div>
        <div class="row g-3">
            <div class="col-lg-6">
                <div class="fw-bold mb-2">Tratamientos activos</div>
                <div class="d-flex flex-column gap-2">${prescHtml}</div>
            </div>
            <div class="col-lg-6">
                <div class="fw-bold mb-2">Tomas registradas</div>
                <div class="d-flex flex-column gap-2">${medsHtml}</div>
            </div>
        </div>
    `;

    cont.querySelectorAll('[data-edit-presc]').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.editPresc, 10);
            const presc = state.prescripciones.find(p => p.id === id);
            if (!presc) return;
            fillPrescripcionForm(presc);
            const form = document.getElementById('prescripcionForm');
            if (form) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

function fillPrescripcionForm(presc) {
    const form = document.getElementById('prescripcionForm');
    if (!form) return;
    document.getElementById('prescPaciente').value = presc.paciente || '';
    document.getElementById('prescMed').value = presc.med || '';
    document.getElementById('prescDosis').value = presc.dosis || '';
    document.getElementById('prescDias').value = presc.dias || '';
    document.getElementById('prescTomas').value = presc.tomas || '';
    document.getElementById('prescHora').value = presc.hora || '08:00';
    document.getElementById('prescNotas').value = presc.notas || '';
    state.prescripcionEditId = presc.id;
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.innerText = 'Guardar cambios';
}

function normalizeHistorialItem(item) {
    return {
        fecha: item.fecha || '',
        patologia: item.patologia || item.evento || 'Registro clinico',
        exploracion: item.exploracion || '',
        diagnostico: item.diagnostico || '',
        notas: item.notas || ''
    };
}

function normalizeName(value) {
    return (value || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').trim();
}
