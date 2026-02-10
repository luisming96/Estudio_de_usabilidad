import { state, getActiveUserName, loadMedsForUser, saveMedsForUser, loadHistorialForUser, saveHistorialForUser, matchesPaciente, getAdherenciaSerie, setAdherenciaSerie } from './core.js';

export function initPatientUI() {
    const isPatientPage = !!document.querySelector(
        '#listaTareas, #profileForm, #historialList, #mensajesPaciente, #inventarioPaciente, #graficoProgreso, #miniCalendario, #farmaciaQuery, #drugForm, #recetasPaciente, #alertaMedicoForm'
    );
    if (!isPatientPage) return;

    loadMedsForUser();
    state.historialMedico = loadHistorialForUser(getActiveUserName());

    const userNameEl = document.getElementById('userName');
    if (userNameEl) {
        const nombrePerfil = state.perfilActual.nombre || state.nombreUsuario || 'usuario';
        userNameEl.innerText = nombrePerfil;
    }

    cargarPerfil();
    const saveProfileBtn = document.getElementById('saveProfile');
    if (saveProfileBtn) saveProfileBtn.addEventListener('click', guardarPerfil);

    renderHistorial();
    const addHistorialBtn = document.getElementById('addHistorial');
    if (addHistorialBtn) addHistorialBtn.addEventListener('click', agregarHistorial);

    renderConsejo();
    const nuevoConsejoBtn = document.getElementById('nuevoConsejo');
    if (nuevoConsejoBtn) nuevoConsejoBtn.addEventListener('click', renderConsejo);

    initDrugLookup();

    renderRecetasPaciente();
    renderMensajesPaciente();
    renderInventarioPaciente();
    initAlertaMedico();

    initChart();
    calcularRacha();
    actualizarMiniCalendario();

    setInterval(() => {
        const ahora = new Date();
        const el = document.getElementById('reloj');
        if (el) el.innerText = ahora.toLocaleTimeString();
        const statusEl = document.getElementById('statusDia');
        if (statusEl) {
            const statusText = statusEl.querySelector('.fw-bold');
            if (statusText) statusText.innerText = ahora.toLocaleDateString();
        }
        actualizarProximaToma();
        actualizarAlertas();
    }, 1000);

    const inpTel = document.getElementById('telFamiliar');
    const btnFam = document.getElementById('callFamiliar');
    if (inpTel && btnFam) {
        const upSOS = (n) => {
            const num = (n || '').trim();
            if (num.length > 0) {
                btnFam.href = `tel:${num}`;
                btnFam.classList.remove('disabled', 'opacity-50');
                btnFam.innerText = `Llamar a ${num}`;
            } else {
                btnFam.href = '#';
                btnFam.classList.add('disabled', 'opacity-50');
                btnFam.innerText = 'Llamar Familiar';
            }
        };
        inpTel.value = localStorage.getItem('vitaTel') || '';
        upSOS(inpTel.value);
        inpTel.oninput = (e) => {
            localStorage.setItem('vitaTel', e.target.value);
            upSOS(e.target.value);
        };
    }

    const btnGuardar = document.getElementById('btnGuardar');
    if (btnGuardar) btnGuardar.onclick = saveMed;
    const buscador = document.getElementById('buscador');
    if (buscador) buscador.oninput = render;

    const esManual = document.getElementById('esManual');
    if (esManual) {
        esManual.onchange = (e) => {
            const panel = document.getElementById('panelMedico');
            if (panel) panel.classList.toggle('d-none', e.target.checked);
        };
    }
    const selMed = document.getElementById('selMed');
    if (selMed) {
        selMed.onchange = (e) => {
            const otroMed = document.getElementById('otroMed');
            if (otroMed) otroMed.classList.toggle('d-none', e.target.value !== 'otro');
        };
    }

    document.querySelectorAll('.tab-filter').forEach(btn => {
        btn.onclick = (e) => {
            state.filtroActual = normalizeTurno(e.target.dataset.val);
            document.querySelectorAll('.tab-filter').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            render();
        };
    });

    revisarNuevoDia();
    render();
}

export function updateHomeHero() {
    if (document.body.dataset.page !== 'inicio') return;
    if (localStorage.getItem('vitaAuth') !== 'true') return;
    if (state.rolActual !== 'paciente') return;

    const nextLabel = document.getElementById('homeNextLabel');
    const nextName = document.getElementById('homeNextName');
    const nextMeta = document.getElementById('homeNextMeta');
    const weekLabel = document.getElementById('homeWeekLabel');
    const weekPct = document.getElementById('homeWeekPct');
    const panelLabel = document.getElementById('homePanelLabel');
    const panelValue = document.getElementById('homePanelValue');
    const bars = [
        document.getElementById('homeWeekBar1'),
        document.getElementById('homeWeekBar2'),
        document.getElementById('homeWeekBar3'),
        document.getElementById('homeWeekBar4'),
        document.getElementById('homeWeekBar5')
    ];

    if (!nextLabel || !nextName || !nextMeta || !weekLabel || !weekPct || !panelLabel || !panelValue) return;

    const { total, hechos, porcentaje } = calcularAdherenciaBase();
    const tieneMeds = total > 0;

    const proxima = obtenerProximaToma();
    if (proxima) {
        nextLabel.innerText = 'Proxima toma';
        nextName.innerText = proxima.nombre;
        nextMeta.innerText = `${proxima.hora} · En ${proxima.horas}h ${proxima.minutos}m`;
    } else if (tieneMeds) {
        nextLabel.innerText = 'Todo al dia';
        nextName.innerText = 'Sin tomas pendientes';
        nextMeta.innerText = 'Buen trabajo, vuelve mas tarde.';
    } else {
        nextLabel.innerText = 'Configura tu primera rutina';
        nextName.innerText = 'Activa recordatorios';
        nextMeta.innerText = 'Conecta tu tratamiento y empieza a medir tu avance.';
    }

    if (tieneMeds) {
        weekLabel.innerText = 'Adherencia semanal';
        weekPct.innerText = `${porcentaje}%`;
    } else {
        weekLabel.innerText = 'Seguimiento listo para usar';
        weekPct.innerText = '--';
    }

    const serie = getAdherenciaSerie().slice(-5);
    const valores = serie.length ? serie.map((d) => d.porcentaje) : (tieneMeds ? [porcentaje, porcentaje, porcentaje, porcentaje, porcentaje] : null);
    if (valores) {
        valores.forEach((val, idx) => {
            const bar = bars[idx];
            if (bar) bar.style.height = `${val}%`;
        });
    }

    if (tieneMeds) {
        panelLabel.innerText = 'Panel activo';
        panelValue.innerText = `${state.meds.length} medicamentos`;
    } else {
        panelLabel.innerText = 'Estado del panel';
        panelValue.innerText = 'Sin datos aun';
    }
}

function calcularAdherenciaBase() {
    let total = 0;
    let hechos = 0;
    const hoyMs = new Date().setHours(0, 0, 0, 0);

    state.meds.forEach((m) => {
        const vigente = m.manual || (m.duracionDias - Math.floor((hoyMs - m.fechaInicio) / 86400000) > 0);
        if (!vigente) return;

        if (m.manual) {
            total++;
            if (m.mHecho || m.tHecho || m.nHecho) hechos++;
        } else {
            total += m.tomasAlDia;
            if (m.mHecho) hechos++;
            if (m.tomasAlDia === 3 && m.tHecho) hechos++;
            if (m.tomasAlDia >= 2 && m.nHecho) hechos++;
        }
    });

    const porcentaje = total ? Math.round((hechos / total) * 100) : 0;
    return { total, hechos, porcentaje };
}

function obtenerProximaToma() {
    const ahora = new Date();
    const horaActual = ahora.getHours() * 60 + ahora.getMinutes();
    const hoyMs = new Date().setHours(0, 0, 0, 0);

    let proxima = null;
    let menorDif = Infinity;

    state.meds.forEach((m) => {
        const vigente = m.manual || (m.duracionDias - Math.floor((hoyMs - m.fechaInicio) / 86400000) > 0);
        if (!vigente) return;

        const turnos = [];
        if (m.manual) {
            turnos.push({ turno: m.turnoAuto, hora: m.hora, hecho: m.mHecho || m.tHecho || m.nHecho });
        } else {
            turnos.push({ turno: 'mañana', hora: m.hora, hecho: m.mHecho });
            if (m.tomasAlDia === 3) turnos.push({ turno: 'tarde', hora: calcularHoraTurno(m.hora, 'tarde', false, m.tomasAlDia), hecho: m.tHecho });
            if (m.tomasAlDia >= 2) turnos.push({ turno: 'noche', hora: calcularHoraTurno(m.hora, 'noche', false, m.tomasAlDia), hecho: m.nHecho });
        }

        turnos.forEach((t) => {
            if (t.hecho) return;
            const [h, min] = t.hora.split(':').map(Number);
            const minToma = h * 60 + min;
            const dif = minToma - horaActual;

            if (dif > 0 && dif < menorDif) {
                menorDif = dif;
                proxima = { nombre: m.nombre, hora: t.hora, minutosTotal: dif };
            }
        });
    });

    if (!proxima) return null;
    const horas = Math.floor(proxima.minutosTotal / 60);
    const minutos = proxima.minutosTotal % 60;
    return { nombre: proxima.nombre, hora: proxima.hora, horas, minutos };
}

function initAlertaMedico() {
    const form = document.getElementById('alertaMedicoForm');
    if (!form) return;
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const tipoEl = document.getElementById('alertaTipo');
        const textoEl = document.getElementById('alertaTexto');
        if (!tipoEl || !textoEl) return;
        const texto = textoEl.value.trim();
        if (!texto) return;

        const tipo = tipoEl.value || 'mensaje';
        const alertas = JSON.parse(localStorage.getItem('vitaAlertasMedico')) || [];
        const paciente = getActiveUserName();
        alertas.unshift({
            id: Date.now(),
            paciente,
            tipo,
            texto,
            fecha: new Date().toLocaleString()
        });
        localStorage.setItem('vitaAlertasMedico', JSON.stringify(alertas.slice(0, 100)));
        textoEl.value = '';
        tipoEl.value = 'mensaje';
        alert('Mensaje enviado al medico.');
    });
}

function initDrugLookup() {
    const form = document.getElementById('drugForm');
    const queryInput = document.getElementById('drugQuery');
    const result = document.getElementById('drugResult');
    const empty = document.getElementById('drugEmpty');
    if (!form || !queryInput) return;

    const nameEl = document.getElementById('drugName');
    const purposeEl = document.getElementById('drugPurpose');
    const indicationsEl = document.getElementById('drugIndications');
    const warningsEl = document.getElementById('drugWarnings');

    const setResult = (info) => {
        if (!result || !nameEl || !purposeEl || !indicationsEl || !warningsEl) return;
        nameEl.innerText = info.name || 'Medicamento sin nombre';
        purposeEl.innerText = info.purpose || 'Sin proposito especificado.';
        indicationsEl.innerText = info.indications || 'No disponible.';
        warningsEl.innerText = info.warnings || 'No disponible.';
        result.classList.remove('d-none');
        if (empty) empty.classList.add('d-none');
    };

    const setEmpty = (message) => {
        if (result) result.classList.add('d-none');
        if (empty) {
            empty.innerText = message;
            empty.classList.remove('d-none');
        }
    };

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const rawQuery = queryInput.value.trim();
        if (!rawQuery) return;

        setEmpty('Buscando informacion...');
        try {
            const info = await fetchOpenFda(rawQuery);
            if (!info) {
                setEmpty('No encontramos informacion para ese medicamento.');
                return;
            }
            setResult(info);
        } catch (error) {
            setEmpty('No se pudo conectar con openFDA.');
        }
    });
}

async function fetchOpenFda(rawQuery) {
    const query = normalizeDrugQuery(rawQuery);
    const searches = [
        `openfda.generic_name:\"${query}\"`,
        `openfda.brand_name:\"${query}\"`,
        `active_ingredient:\"${query}\"`
    ];
    for (const search of searches) {
        const result = await fetchOpenFdaBy(search);
        if (result) return result;
    }
    return null;
}

async function fetchOpenFdaBy(search) {
    const url = `https://api.fda.gov/drug/label.json?search=${encodeURIComponent(search)}&limit=1`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    const result = data && data.results ? data.results[0] : null;
    if (!result) return null;

    const openfda = result.openfda || {};
    const name = (openfda.generic_name && openfda.generic_name[0]) || (openfda.brand_name && openfda.brand_name[0]);
    const purpose = (result.purpose && result.purpose[0]) || '';
    const indications = (result.indications_and_usage && result.indications_and_usage[0]) || '';
    const warnings = (result.warnings && result.warnings[0]) || (result.boxed_warning && result.boxed_warning[0]) || '';

    return {
        name,
        purpose: trimText(purpose),
        indications: trimText(indications, 420),
        warnings: trimText(warnings, 420)
    };
}

function normalizeDrugQuery(value) {
    const cleaned = value.toLowerCase().trim();
    const map = {
        ibuprofeno: 'ibuprofen',
        paracetamol: 'acetaminophen',
        acetaminofen: 'acetaminophen',
        amoxicilina: 'amoxicillin',
        omeprazol: 'omeprazole',
        metformina: 'metformin',
        naproxeno: 'naproxen',
        loratadina: 'loratadine',
        amlodipino: 'amlodipine'
    };
    if (map[cleaned]) return map[cleaned];
    return cleaned.normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

function trimText(text, max = 240) {
    if (!text) return '';
    const clean = text.replace(/\s+/g, ' ').trim();
    if (clean.length <= max) return clean;
    return `${clean.slice(0, max)}...`;
}

export function calcularHoraTurno(horaBase, turno, esManual, tomasAlDia = 3) {
    if (!horaBase || typeof horaBase !== 'string' || !horaBase.includes(':')) return '08:00';
    if (esManual) return horaBase;

    const parts = horaBase.split(':');
    let h = parseInt(parts[0], 10);
    const m = parts[1];

    if (turno === 'tarde') {
        h = (h + (tomasAlDia === 3 ? 6 : 8)) % 24;
    }
    if (turno === 'noche') {
        h = (h + (tomasAlDia === 2 ? 12 : 14)) % 24;
    }
    return `${String(h).padStart(2, '0')}:${m}`;
}

export function normalizeTurno(value) {
    if (!value) return 'mañana';
    if (value === 'manana') return 'mañana';
    return value;
}

export function saveMed() {
    const sel = document.getElementById('selMed').value;
    const nombre = (sel === 'otro') ? document.getElementById('otroMed').value.trim() : sel;
    let hToma = document.getElementById('horaToma').value;
    const esManual = document.getElementById('esManual').checked;

    if (!nombre) return alert('Falta el nombre del medicamento.');
    if (!hToma) {
        if (esManual) {
            const ahora = new Date();
            hToma = ahora.toTimeString().slice(0, 5);
            document.getElementById('horaToma').value = hToma;
        } else {
            return alert('Falta la hora de la toma.');
        }
    }

    const hh = parseInt(hToma.split(':')[0], 10);
    const tAuto = (hh >= 6 && hh < 13) ? 'mañana' : (hh >= 13 && hh < 20) ? 'tarde' : 'noche';

    state.meds.push({
        nombre,
        hora: hToma,
        manual: esManual,
        turnoAuto: tAuto,
        tomasAlDia: esManual ? 1 : parseInt(document.getElementById('tomasDiarias').value, 10),
        fechaInicio: new Date().setHours(0, 0, 0, 0),
        duracionDias: esManual ? 0 : parseInt(document.getElementById('duracion').value, 10),
        mHecho: false,
        tHecho: false,
        nHecho: false
    });

    sync();
    bootstrap.Modal.getInstance(document.getElementById('modalRegistro')).hide();
}

export function render() {
    const cont = document.getElementById('listaTareas');
    if (!cont) {
        updateStats();
        return;
    }
    const buscadorEl = document.getElementById('buscador');
    const busq = buscadorEl ? buscadorEl.value.toLowerCase() : '';
    const hoyMs = new Date().setHours(0, 0, 0, 0);
    const ahora = new Date();
    const horaActual = ahora.getHours() * 60 + ahora.getMinutes();

    cont.innerHTML = state.meds.map((m, i) => {
        const msPasados = hoyMs - m.fechaInicio;
        const diasRestantes = m.duracionDias - Math.floor(msPasados / 86400000);

        if (!m.manual && diasRestantes <= 0) return '';
        if (!m.nombre.toLowerCase().includes(busq)) return '';

        let visible = false;
        let hecho = false;
        if (m.manual) {
            if (normalizeTurno(m.turnoAuto) === state.filtroActual) {
                visible = true;
                hecho = (state.filtroActual === 'mañana' ? m.mHecho : state.filtroActual === 'tarde' ? m.tHecho : m.nHecho);
            }
        } else {
            if (state.filtroActual === 'mañana') { visible = true; hecho = m.mHecho; }
            if (state.filtroActual === 'tarde' && m.tomasAlDia === 3) { visible = true; hecho = m.tHecho; }
            if (state.filtroActual === 'noche' && m.tomasAlDia >= 2) { visible = true; hecho = m.nHecho; }
        }

        if (!visible) return '';

        const horaDisplay = calcularHoraTurno(m.hora, state.filtroActual, m.manual, m.tomasAlDia);
        const etiqueta = m.manual
            ? '<span class="badge bg-light text-dark border">💊 Automedicacion</span>'
            : `<small class="text-muted">Quedan ${diasRestantes} dias</small>`;
        const nota = m.nota ? `<div class="small text-muted mt-1">${m.nota}</div>` : '';

        const [h, min] = horaDisplay.split(':').map(Number);
        const minToma = h * 60 + min;
        let claseEstado = '';
        if (hecho) {
            claseEstado = 'task-done';
        } else {
            const difMinutos = horaActual - minToma;
            if (difMinutos > 0) {
                claseEstado = 'task-retrasada';
            } else if (difMinutos > -60) {
                claseEstado = 'task-proxima';
            } else {
                claseEstado = 'task-en-tiempo';
            }
        }

        return `
        <div class="col">
            <div class="card h-100 shadow-sm task-card ${claseEstado}">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h5 class="fw-bold mb-1">${m.nombre}</h5>
                            ${etiqueta}
                            ${nota}
                            <div class="small mt-1 text-primary fw-bold"><i class="bi bi-clock"></i> ${horaDisplay}</div>
                        </div>
                        <div class="text-end">
                            <button class="btn ${hecho ? 'btn-secondary' : 'btn-primary'} btn-sm rounded-pill w-100 mb-2" onclick="toggleMed(${i})">
                                ${hecho ? 'Deshacer' : 'Hecho'}
                            </button>
                            <i class="bi bi-trash text-muted small" style="cursor:pointer" onclick="delMed(${i})"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    }).join('');
    updateStats();
}

export function updateStats() {
    let total = 0;
    let hechos = 0;
    state.meds.forEach(m => {
        const vigente = m.manual || (m.duracionDias - Math.floor((new Date().setHours(0, 0, 0, 0) - m.fechaInicio) / 86400000) > 0);
        if (vigente) {
            if (m.manual) {
                total++;
                if (m.mHecho || m.tHecho || m.nHecho) hechos++;
            } else {
                total += m.tomasAlDia;
                if (m.mHecho) hechos++;
                if (m.tomasAlDia === 3 && m.tHecho) hechos++;
                if (m.tomasAlDia >= 2 && m.nHecho) hechos++;
            }
        }
    });
    const p = total ? Math.round((hechos / total) * 100) : 0;
    if (state.chartInstance) {
        state.chartInstance.data.datasets[0].data = [p, 100 - p];
        state.chartInstance.update();
    }
    const chartCanvas = document.getElementById('graficoProgreso');
    if (!state.chartInstance && chartCanvas) drawFallbackChart(chartCanvas, p);

    const porcentajeEl = document.getElementById('porcentajeTxt');
    if (porcentajeEl) porcentajeEl.innerText = `${p}%`;
    const progresoBar = document.getElementById('progresoBar');
    if (progresoBar) {
        progresoBar.style.width = `${p}%`;
        progresoBar.setAttribute('aria-valuenow', p);
    }

    const resumenEl = document.getElementById('resumenTomas');
    if (resumenEl) resumenEl.innerText = `${hechos} de ${total} tomas`;
    const resumenSmall = document.getElementById('resumenTomasSmall');
    if (resumenSmall) resumenSmall.innerText = `${hechos}/${total}`;
    const statsTotalMeds = document.getElementById('statsTotalMeds');
    if (statsTotalMeds) statsTotalMeds.innerText = state.meds.length;
    const statsTomas = document.getElementById('statsTomas');
    if (statsTomas) statsTomas.innerText = hechos;
    const statsAdh = document.getElementById('statsAdherencia');
    if (statsAdh) statsAdh.innerText = `${p}%`;
    const adhPct = document.getElementById('adherenciaPct');
    if (adhPct) adhPct.innerText = `${p}%`;
    const statsAlertas = document.getElementById('statsAlertas');
    if (statsAlertas) statsAlertas.innerText = document.querySelectorAll('#listaAlertas .alert-warning').length || 0;

    const hoy = new Date().toLocaleDateString();
    const indexHoy = state.historialDias.findIndex(h => h.fecha === hoy);

    if (p === 100 && total > 0) {
        if (indexHoy === -1) {
            state.historialDias.push({ fecha: hoy, cumplido: true });
            localStorage.setItem('vitaHistorial', JSON.stringify(state.historialDias.slice(-30)));
            calcularRacha();
        }
    } else if (indexHoy !== -1) {
        state.historialDias.splice(indexHoy, 1);
        localStorage.setItem('vitaHistorial', JSON.stringify(state.historialDias));
        calcularRacha();
    }

    const serie = getAdherenciaSerie();
    const idxSerie = serie.findIndex(d => d.fecha === hoy);
    const entry = { fecha: hoy, porcentaje: p };
    if (idxSerie >= 0) {
        serie[idxSerie] = entry;
    } else {
        serie.push(entry);
    }
    setAdherenciaSerie(serie.slice(-30));

    updateSeguimientoUI(p);
}

function updateSeguimientoUI(porcentajeActual) {
    const objetivoTomasLabel = document.getElementById('objetivoTomasLabel');
    const objetivoTomasBar = document.getElementById('objetivoTomasBar');
    const objetivoRegistroLabel = document.getElementById('objetivoRegistroLabel');
    const objetivoRegistroBar = document.getElementById('objetivoRegistroBar');
    const objetivoConstanciaLabel = document.getElementById('objetivoConstanciaLabel');
    const objetivoConstanciaBar = document.getElementById('objetivoConstanciaBar');

    const ritmoMananaPct = document.getElementById('ritmoMananaPct');
    const ritmoMananaBar = document.getElementById('ritmoMananaBar');
    const ritmoTardePct = document.getElementById('ritmoTardePct');
    const ritmoTardeBar = document.getElementById('ritmoTardeBar');
    const ritmoNochePct = document.getElementById('ritmoNochePct');
    const ritmoNocheBar = document.getElementById('ritmoNocheBar');
    const notasEl = document.getElementById('seguimientoNotas');

    const hasObjetivos = objetivoTomasLabel || objetivoRegistroLabel || objetivoConstanciaLabel;
    const hasRitmo = ritmoMananaPct || ritmoTardePct || ritmoNochePct;
    if (!hasObjetivos && !hasRitmo && !notasEl) return;

    const serie = getAdherenciaSerie().slice(-7);
    const diasConMeta = serie.filter((d) => d.porcentaje >= 80).length;
    const diasRegistrados = serie.length;
    const metaPct = Math.round((diasConMeta / 7) * 100);
    const registroPct = Math.round((diasRegistrados / 7) * 100);
    const racha = state.rachaActual || 0;
    const rachaPct = Math.min(Math.round((racha / 7) * 100), 100);

    if (objetivoTomasLabel) objetivoTomasLabel.innerText = `${diasConMeta}/7`;
    if (objetivoTomasBar) objetivoTomasBar.style.width = `${metaPct}%`;
    if (objetivoRegistroLabel) objetivoRegistroLabel.innerText = `${diasRegistrados}/7`;
    if (objetivoRegistroBar) objetivoRegistroBar.style.width = `${registroPct}%`;
    if (objetivoConstanciaLabel) objetivoConstanciaLabel.innerText = `${racha} dias seguidos`;
    if (objetivoConstanciaBar) objetivoConstanciaBar.style.width = `${rachaPct}%`;

    const ritmo = calcularRitmoTurnos();
    if (ritmoMananaPct) ritmoMananaPct.innerText = `${ritmo.mañana}%`;
    if (ritmoMananaBar) ritmoMananaBar.style.width = `${ritmo.mañana}%`;
    if (ritmoTardePct) ritmoTardePct.innerText = `${ritmo.tarde}%`;
    if (ritmoTardeBar) ritmoTardeBar.style.width = `${ritmo.tarde}%`;
    if (ritmoNochePct) ritmoNochePct.innerText = `${ritmo.noche}%`;
    if (ritmoNocheBar) ritmoNocheBar.style.width = `${ritmo.noche}%`;

    if (notasEl) {
        const notas = [];
        if (porcentajeActual >= 85) {
            notas.push('Buen ritmo general de adherencia esta semana.');
        } else if (porcentajeActual >= 60) {
            notas.push('Vas bien, pero aun puedes subir la adherencia.');
        } else {
            notas.push('Semana irregular. Activa recordatorios extra.');
        }

        const pico = Object.entries(ritmo).sort((a, b) => b[1] - a[1])[0];
        const valle = Object.entries(ritmo).sort((a, b) => a[1] - b[1])[0];
        if (pico && valle && pico[0] !== valle[0]) {
            notas.push(`Tu mejor franja es la ${pico[0]} y la mas baja es la ${valle[0]}.`);
        }

        if (racha >= 3) {
            notas.push(`Mantienes ${racha} dias seguidos, sigue asi.`);
        } else {
            notas.push('Objetivo proximo: 3 dias seguidos sin fallos.');
        }

        notasEl.innerHTML = notas.map((n, i) => `<li${i < notas.length - 1 ? ' class="mb-2"' : ''}>${n}</li>`).join('');
    }
}

function calcularRitmoTurnos() {
    const turnos = {
        mañana: { total: 0, hechos: 0 },
        tarde: { total: 0, hechos: 0 },
        noche: { total: 0, hechos: 0 }
    };

    const hoyMs = new Date().setHours(0, 0, 0, 0);
    state.meds.forEach((m) => {
        const vigente = m.manual || (m.duracionDias - Math.floor((hoyMs - m.fechaInicio) / 86400000) > 0);
        if (!vigente) return;

        if (m.manual) {
            const turno = normalizeTurno(m.turnoAuto);
            if (!turnos[turno]) return;
            turnos[turno].total += 1;
            const hecho = turno === 'mañana' ? m.mHecho : turno === 'tarde' ? m.tHecho : m.nHecho;
            if (hecho) turnos[turno].hechos += 1;
        } else {
            turnos.mañana.total += 1;
            if (m.mHecho) turnos.mañana.hechos += 1;

            if (m.tomasAlDia === 3) {
                turnos.tarde.total += 1;
                if (m.tHecho) turnos.tarde.hechos += 1;
            }
            if (m.tomasAlDia >= 2) {
                turnos.noche.total += 1;
                if (m.nHecho) turnos.noche.hechos += 1;
            }
        }
    });

    const pct = (data) => (data.total ? Math.round((data.hechos / data.total) * 100) : 0);
    return {
        mañana: pct(turnos.mañana),
        tarde: pct(turnos.tarde),
        noche: pct(turnos.noche)
    };
}

export function toggleMed(i) {
    if (state.filtroActual === 'mañana') state.meds[i].mHecho = !state.meds[i].mHecho;
    if (state.filtroActual === 'tarde') state.meds[i].tHecho = !state.meds[i].tHecho;
    if (state.filtroActual === 'noche') state.meds[i].nHecho = !state.meds[i].nHecho;
    sync();
}

export function delMed(i) {
    if (confirm('¿Eliminar?')) {
        state.meds.splice(i, 1);
        sync();
    }
}

export function sync() {
    saveMedsForUser();
    render();
}

export function initChart() {
    const ctx = document.getElementById('graficoProgreso');
    if (!ctx) return;
    if (!window.Chart) {
        drawFallbackChart(ctx, 0);
        return;
    }
    state.chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: { datasets: [{ data: [0, 100], backgroundColor: ['#10b981', '#e5e7eb'], borderWidth: 0 }] },
        options: { cutout: '80%', responsive: true, maintainAspectRatio: false, plugins: { tooltip: { enabled: false } } }
    });
}

export function drawFallbackChart(canvas, percent) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const size = Math.min(canvas.width || 200, canvas.height || 200);
    canvas.width = size;
    canvas.height = size;
    const center = size / 2;
    const radius = (size / 2) - 8;
    ctx.clearRect(0, 0, size, size);
    ctx.lineWidth = 16;
    ctx.strokeStyle = '#e5e7eb';
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.stroke();
    const angle = (Math.PI * 2) * (percent / 100);
    ctx.strokeStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(center, center, radius, -Math.PI / 2, -Math.PI / 2 + angle);
    ctx.stroke();
    ctx.fillStyle = '#0f172a';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${percent}%`, center, center);
}

export function actualizarProximaToma() {
    const ahora = new Date();
    const horaActual = ahora.getHours() * 60 + ahora.getMinutes();

    let proximaMed = null;
    let menorDif = Infinity;

    state.meds.forEach(m => {
        const hoyMs = new Date().setHours(0, 0, 0, 0);
        const vigente = m.manual || (m.duracionDias - Math.floor((hoyMs - m.fechaInicio) / 86400000) > 0);
        if (!vigente) return;

        const turnos = [];
        if (m.manual) {
            turnos.push({ turno: m.turnoAuto, hora: m.hora, hecho: m.mHecho || m.tHecho || m.nHecho });
        } else {
            turnos.push({ turno: 'mañana', hora: m.hora, hecho: m.mHecho });
            if (m.tomasAlDia === 3) turnos.push({ turno: 'tarde', hora: calcularHoraTurno(m.hora, 'tarde', false, m.tomasAlDia), hecho: m.tHecho });
            if (m.tomasAlDia >= 2) turnos.push({ turno: 'noche', hora: calcularHoraTurno(m.hora, 'noche', false, m.tomasAlDia), hecho: m.nHecho });
        }

        turnos.forEach(t => {
            if (t.hecho) return;
            const [h, min] = t.hora.split(':').map(Number);
            const minToma = h * 60 + min;
            const dif = minToma - horaActual;

            if (dif > 0 && dif < menorDif) {
                menorDif = dif;
                proximaMed = { nombre: m.nombre, hora: t.hora, minutos: dif };
            }
        });
    });

    const widget = document.getElementById('widgetProxima');
    if (!widget) return;
    if (proximaMed) {
        widget.classList.remove('d-none');
        document.getElementById('proximaNombre').innerText = proximaMed.nombre;
        document.getElementById('proximaHora').innerText = proximaMed.hora;

        const horas = Math.floor(proximaMed.minutos / 60);
        const mins = proximaMed.minutos % 60;
        document.getElementById('proximaCountdown').innerText = `${horas}h ${mins}m`;

        if (proximaMed.minutos < 30) {
            widget.classList.remove('alert-warning');
            widget.classList.add('alert-danger');
        } else {
            widget.classList.remove('alert-danger');
            widget.classList.add('alert-warning');
        }
    } else {
        widget.classList.add('d-none');
    }
}

export function actualizarAlertas() {
    const listaAlertas = document.getElementById('listaAlertas');
    if (!listaAlertas) return;

    const alertas = [];
    const hoyMs = new Date().setHours(0, 0, 0, 0);

    state.meds.forEach(m => {
        if (m.manual) return;
        const diasRestantes = m.duracionDias - Math.floor((hoyMs - m.fechaInicio) / 86400000);
        if (diasRestantes > 0 && diasRestantes <= 3) {
            alertas.push(`⚠️ <strong>${m.nombre}</strong> se acaba en ${diasRestantes} dia${diasRestantes > 1 ? 's' : ''}`);
        }
    });

    if (alertas.length === 0) {
        listaAlertas.innerHTML = '<div class="alert alert-success w-100 mb-0 py-2">✓ Todo al dia, sin alertas</div>';
    } else {
        listaAlertas.innerHTML = alertas.map(a => `<div class="alert alert-warning w-100 mb-0 py-2">${a}</div>`).join('');
    }
}

export function calcularRacha() {
    state.historialDias.sort((a, b) => new Date(b.fecha.split('/').reverse().join('-')) - new Date(a.fecha.split('/').reverse().join('-')));

    let racha = 0;
    const hoy = new Date();
    const hoyStr = hoy.toLocaleDateString();
    const hoyCompleto = state.historialDias.some(h => h.fecha === hoyStr && h.cumplido);
    const iniciar = hoyCompleto ? 0 : 1;

    for (let i = iniciar; i <= 30; i++) {
        const fecha = new Date(hoy);
        fecha.setDate(fecha.getDate() - i);
        const fechaStr = fecha.toLocaleDateString();
        const diaEnHistorial = state.historialDias.find(h => h.fecha === fechaStr && h.cumplido);
        if (diaEnHistorial) {
            racha++;
        } else {
            break;
        }
    }

    state.rachaActual = racha;
    localStorage.setItem('vitaRacha', state.rachaActual);
    actualizarRacha();
    actualizarMiniCalendario();
}

export function actualizarRacha() {
    const rachaEl = document.getElementById('rachaTexto');
    const subtextoEl = document.getElementById('rachaSubtexto');
    if (!rachaEl) return;

    rachaEl.innerHTML = `<span class="text-warning">🔥</span> ${state.rachaActual} dia${state.rachaActual !== 1 ? 's' : ''}`;

    const rachaDiasEl = document.getElementById('rachaDias');
    if (rachaDiasEl) rachaDiasEl.innerText = `${state.rachaActual} dias`;

    if (subtextoEl) {
        if (state.rachaActual === 0) {
            subtextoEl.innerText = '¡Completa hoy para empezar!';
        } else {
            subtextoEl.innerText = `¡Sigue asi! ${state.rachaActual} dia${state.rachaActual !== 1 ? 's' : ''} consecutivo${state.rachaActual !== 1 ? 's' : ''}`;
        }
    }
}

export function actualizarMiniCalendario() {
    const calEl = document.getElementById('miniCalendario');
    if (!calEl) return;

    const dias = [];
    for (let i = 6; i >= 0; i--) {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() - i);
        const fechaStr = fecha.toLocaleDateString();
        const dia = fecha.toLocaleDateString('es-ES', { weekday: 'short' })[0].toUpperCase();

        const cumplido = state.historialDias.some(h => h.fecha === fechaStr && h.cumplido);
        const esHoy = i === 0;

        let icono = '○';
        let color = 'text-muted';
        if (cumplido) {
            icono = '●';
            color = 'text-success';
        } else if (esHoy) {
            icono = '◐';
            color = 'text-primary';
        }

        dias.push(`<div class="text-center"><small class="text-muted d-block">${dia}</small><span class="${color} fs-5">${icono}</span></div>`);
    }

    calEl.innerHTML = dias.join('');
}

export function revisarNuevoDia() {
    const hoy = new Date().toLocaleDateString();
    if (localStorage.getItem('lastCheck') !== hoy) {
        state.meds = state.meds.map(m => {
            m.mHecho = false;
            m.tHecho = false;
            m.nHecho = false;
            return m;
        });
        localStorage.setItem('lastCheck', hoy);
        calcularRacha();
        sync();
    }
}

export function cargarPerfil() {
    const form = document.getElementById('profileForm');
    if (!form) return;
    const perfiles = JSON.parse(localStorage.getItem('vitaProfilesByUser')) || {};
    const usuario = getActiveUserName();
    state.perfilActual = perfiles[usuario] || JSON.parse(localStorage.getItem('vitaProfile')) || {};
    const get = (id) => document.getElementById(id);
    if (get('perfilNombre')) get('perfilNombre').value = state.perfilActual.nombre || state.nombreUsuario || '';
    if (get('perfilAlergias')) get('perfilAlergias').value = state.perfilActual.alergias || '';
    if (get('perfilCronicas')) get('perfilCronicas').value = state.perfilActual.cronicas || '';
    if (get('perfilSangre')) get('perfilSangre').value = state.perfilActual.sangre || '';
    if (get('perfilTelefono')) get('perfilTelefono').value = state.perfilActual.telefono || '';
    if (get('perfilMedico')) get('perfilMedico').value = state.perfilActual.medico || '';
    if (get('perfilNotas')) get('perfilNotas').value = state.perfilActual.notas || '';
}

export function guardarPerfil() {
    const get = (id) => document.getElementById(id);
    if (!get('perfilNombre')) return;
    state.perfilActual = {
        nombre: get('perfilNombre').value.trim(),
        alergias: get('perfilAlergias').value.trim(),
        cronicas: get('perfilCronicas').value.trim(),
        sangre: get('perfilSangre').value,
        telefono: get('perfilTelefono').value.trim(),
        medico: get('perfilMedico').value.trim(),
        notas: get('perfilNotas').value.trim()
    };
    localStorage.setItem('vitaProfile', JSON.stringify(state.perfilActual));
    const perfiles = JSON.parse(localStorage.getItem('vitaProfilesByUser')) || {};
    const usuario = getActiveUserName();
    perfiles[usuario] = state.perfilActual;
    localStorage.setItem('vitaProfilesByUser', JSON.stringify(perfiles));
    if (state.perfilActual.nombre) localStorage.setItem('vitaUserName', state.perfilActual.nombre);
    if (state.perfilActual.telefono) localStorage.setItem('vitaTel', state.perfilActual.telefono);
    const userNameEl = document.getElementById('userName');
    if (userNameEl && state.perfilActual.nombre) userNameEl.innerText = state.perfilActual.nombre;
    alert('Perfil medico guardado');
}

export function renderHistorial() {
    const cont = document.getElementById('historialList');
    if (!cont) return;
    if (!state.historialMedico.length) {
        cont.innerHTML = '<div class="text-muted">Sin registros todavia.</div>';
        return;
    }
    cont.innerHTML = state.historialMedico.map(item => {
        const data = normalizeHistorialItem(item);
        return `
            <div class="history-item">
                <div class="history-date">${data.fecha}</div>
                <div class="history-content">
                    <div class="history-title">${data.patologia || 'Registro clinico'}</div>
                    <div class="history-sub">
                        ${data.exploracion ? `<span>Exploracion: ${data.exploracion}</span>` : ''}
                        ${data.diagnostico ? `<span>Diagnostico: ${data.diagnostico}</span>` : ''}
                    </div>
                    ${data.notas ? `<div class="history-notes">${data.notas}</div>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

export function agregarHistorial() {
    const fechaEl = document.getElementById('historialFecha');
    const patologiaEl = document.getElementById('historialPatologia');
    const exploracionEl = document.getElementById('historialExploracion');
    const diagnosticoEl = document.getElementById('historialDiagnostico');
    const notasEl = document.getElementById('historialNotas');
    if (!fechaEl || !patologiaEl || !exploracionEl || !diagnosticoEl || !notasEl) return;

    const fecha = fechaEl.value || new Date().toISOString().slice(0, 10);
    const patologia = patologiaEl.value.trim();
    const exploracion = exploracionEl.value.trim();
    const diagnostico = diagnosticoEl.value.trim();
    const notas = notasEl.value.trim();
    if (!patologia || !diagnostico) return alert('Indica patologia y diagnostico');

    state.historialMedico.unshift({ fecha, patologia, exploracion, diagnostico, notas });
    saveHistorialForUser(getActiveUserName(), state.historialMedico.slice(0, 50));
    fechaEl.value = '';
    patologiaEl.value = '';
    exploracionEl.value = '';
    diagnosticoEl.value = '';
    notasEl.value = '';
    renderHistorial();
}

function normalizeHistorialItem(item) {
    const fecha = item.fecha || new Date().toISOString().slice(0, 10);
    const patologia = item.patologia || item.evento || '';
    const exploracion = item.exploracion || '';
    const diagnostico = item.diagnostico || '';
    const notas = item.notas || '';
    return { fecha, patologia, exploracion, diagnostico, notas };
}

export function renderConsejo() {
    const consejoEl = document.getElementById('consejoTexto');
    if (!consejoEl) return;
    const consejos = [
        'Asocia cada toma con una rutina diaria para no olvidarla.',
        'Mantener un registro actualizado reduce errores en tu medicacion.',
        'Guarda el telefono de emergencia en tu perfil medico.',
        'Si dudas sobre una toma, revisa el historial antes de repetir.',
        'Planifica tus tomas por bloques: manana, tarde y noche.'
    ];
    const idx = Math.floor(Math.random() * consejos.length);
    consejoEl.innerText = consejos[idx];
}

export function renderRecetasPaciente() {
    const list = document.getElementById('recetasPaciente');
    if (!list) return;
    const recetas = state.prescripciones.filter(p => matchesPaciente(p.paciente) && p.estado !== 'Activo');
    if (!recetas.length) {
        list.innerHTML = '<div class="text-muted">No tienes recetas nuevas.</div>';
        return;
    }
    list.innerHTML = recetas.map(r => `
        <div class="border rounded-3 p-2">
            <div class="fw-bold">${r.med} ${r.dosis ? '(' + r.dosis + ')' : ''}</div>
            <div class="small text-muted">${r.dias} dias - ${r.tomas} tomas/dia</div>
            ${r.notas ? `<div class="small text-muted">${r.notas}</div>` : ''}
            <button class="btn btn-sm btn-outline-primary mt-2" data-add-receta="${r.id}">Agregar a mis tomas</button>
        </div>
    `).join('');

    list.querySelectorAll('[data-add-receta]').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.addReceta, 10);
            const receta = state.prescripciones.find(p => p.id === id);
            if (!receta) return;
            state.meds.push({
                nombre: receta.med,
                hora: receta.hora || '08:00',
                manual: false,
                turnoAuto: 'mañana',
                tomasAlDia: receta.tomas || 1,
                fechaInicio: new Date().setHours(0, 0, 0, 0),
                duracionDias: receta.dias || 7,
                nota: receta.notas || '',
                mHecho: false,
                tHecho: false,
                nHecho: false
            });
            state.prescripciones = state.prescripciones.map(p => p.id === id ? { ...p, estado: 'Activo' } : p);
            localStorage.setItem('vitaPrescripciones', JSON.stringify(state.prescripciones));
            saveMedsForUser();
            render();
            renderRecetasPaciente();
        });
    });
}

export function renderMensajesPaciente() {
    const list = document.getElementById('mensajesPaciente');
    if (!list) return;
    const mensajes = state.mensajesMedicos.filter(m => matchesPaciente(m.paciente));
    if (!mensajes.length) {
        list.innerHTML = '<div class="text-muted">Sin mensajes del medico.</div>';
        return;
    }
    list.innerHTML = mensajes.map(m => `
        <div class="border rounded-3 p-2">
            <div class="fw-bold">Mensaje medico</div>
            <div class="small text-muted">${m.fecha}</div>
            <div>${m.texto}</div>
        </div>
    `).join('');
}

export function renderInventarioPaciente() {
    const list = document.getElementById('inventarioPaciente');
    if (!list) return;
    const usuario = getActiveUserName();
    const items = state.inventarioPacientes.filter(i => matchesPaciente(i.paciente));
    if (!items.length) {
        list.innerHTML = '<div class="text-muted">Sin inventario asignado.</div>';
        return;
    }
    list.innerHTML = items.map(i => `
        <div class="border rounded-3 p-2">
            <div class="fw-bold">${i.med}</div>
            <div class="small text-muted">Unidades: ${i.unidades} | Estado: ${i.estado}</div>
            ${i.estado === 'Listo' ? '<button class="btn btn-sm btn-outline-primary mt-2" data-recogida="' + i.med + '">Marcar recogida</button>' : ''}
        </div>
    `).join('');
    list.querySelectorAll('[data-recogida]').forEach(btn => {
        btn.addEventListener('click', () => {
            const med = btn.dataset.recogida;
            state.inventarioPacientes = state.inventarioPacientes.map(i =>
                normalizeText(i.paciente) === normalizeText(usuario) && normalizeText(i.med) === normalizeText(med)
                    ? { ...i, estado: 'Recogida' }
                    : i
            );
            localStorage.setItem('vitaInventario', JSON.stringify(state.inventarioPacientes));
            renderInventarioPaciente();
        });
    });
}

function normalizeText(value) {
    if (!value) return '';
    return value.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').trim();
}
