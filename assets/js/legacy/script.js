let meds = [];
let filtroActual = 'mañana';
let chartInstance = null;
let rachaActual = parseInt(localStorage.getItem('vitaRacha')) || 0;
let historialDias = JSON.parse(localStorage.getItem('vitaHistorial')) || [];
let skinActual = localStorage.getItem('vitaSkin') || 'base';
let rolActual = localStorage.getItem('vitaRole') || 'paciente';
let perfilActual = JSON.parse(localStorage.getItem('vitaProfile')) || {};
let nombreUsuario = localStorage.getItem('vitaUserName') || '';
let historialMedico = [];
let prescripciones = JSON.parse(localStorage.getItem('vitaPrescripciones')) || [];
let mensajesMedicos = JSON.parse(localStorage.getItem('vitaMensajes')) || [];
let stockFarmacia = JSON.parse(localStorage.getItem('vitaStock')) || [];
let dispensaciones = JSON.parse(localStorage.getItem('vitaDispensaciones')) || [];
let avisosFarmacia = JSON.parse(localStorage.getItem('vitaAvisos')) || [];
let inventarioPacientes = JSON.parse(localStorage.getItem('vitaInventario')) || [];
let prescripcionEditId = null;
const farmaciasData = [
    { nombre: 'Farmacia Central', direccion: 'Calle Mayor 12' },
    { nombre: 'Farmacia Norte', direccion: 'Avenida Salud 8' },
    { nombre: 'Farmacia Plaza', direccion: 'Plaza Principal 3' },
    { nombre: 'Farmacia Vida', direccion: 'Calle Rio 24' }
];
const dashboardMap = {
    paciente: 'dashboard.html',
    medico: 'dashboard-medico.html',
    farmaceutico: 'dashboard-farmaceutico.html'
};

window.onload = () => {
    const page = document.body.dataset.page;
    const isAuth = localStorage.getItem('vitaAuth') === 'true';
    const pageRole = getDashboardRoleFromPath();
    if (pageRole) {
        if (!isAuth) {
            window.location.href = 'login.html';
            return;
        }
        if (rolActual !== pageRole) {
            window.location.href = dashboardMap[rolActual] || 'dashboard.html';
            return;
        }
    }

    // Cargar medicacion del usuario actual
    loadMedsForUser();

    // Aplicar skin guardada
    setSkin(skinActual);
    const selector = document.getElementById('skinSelector');
    if (selector) {
        selector.value = skinActual;
        selector.onchange = (e) => setSkin(e.target.value);
    }

    // Aplicar rol guardado
    setRol(rolActual, { redirect: false });
    const rolSelector = document.getElementById('roleSelector');
    if (rolSelector) {
        rolSelector.value = rolActual;
        rolSelector.onchange = (e) => setRol(e.target.value, { redirect: true });
    }

    // Usuario y perfil medico
    const userNameEl = document.getElementById('userName');
    if (userNameEl) {
        const nombrePerfil = perfilActual.nombre || nombreUsuario || 'usuario';
        userNameEl.innerText = nombrePerfil;
    }
    cargarPerfil();
    const saveProfileBtn = document.getElementById('saveProfile');
    if (saveProfileBtn) saveProfileBtn.addEventListener('click', guardarPerfil);

    // Historial medico
    historialMedico = loadHistorialForUser(getActiveUserName());
    renderHistorial();
    const addHistorialBtn = document.getElementById('addHistorial');
    if (addHistorialBtn) addHistorialBtn.addEventListener('click', agregarHistorial);

    // Consejos diarios
    renderConsejo();
    const nuevoConsejoBtn = document.getElementById('nuevoConsejo');
    if (nuevoConsejoBtn) nuevoConsejoBtn.addEventListener('click', renderConsejo);

    // Recetas y mensajes del medico para el paciente
    renderRecetasPaciente();
    renderMensajesPaciente();
    renderInventarioPaciente();

    // Farmacias cercanas
    initFarmacias();

    // Analisis
    initAnalisis();

    // Medico
    initMedico();

    // Farmaceutico
    initFarmaceutico();

    // Acciones simuladas
    initActions();

    // Login simulado
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
            localStorage.setItem('vitaAuth', 'true');
            localStorage.setItem('vitaUserName', nombre || 'usuario');
            localStorage.setItem('vitaUserEmail', correo);
            nombreUsuario = nombre || 'usuario';
            setRol(rol, { redirect: false });
            window.location.href = dashboardMap[rol] || 'dashboard.html';
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

    // Activar estado de navegación
    if (page) {
        document.querySelectorAll('[data-nav]').forEach(link => {
            link.classList.toggle('active', link.dataset.nav === page);
        });
    }

    // 1. LIMPIEZA DE DATOS (Arregla el error de split)
    meds = meds.map(m => {
        if (!m.hora) m.hora = "08:00";
        if (m.manual === undefined) m.manual = m.permanente || false;
        return m;
    });

    // Limpiar historial del día actual si no está completado
    const hoy = new Date().toLocaleDateString();
    const indexHoy = historialDias.findIndex(h => h.fecha === hoy);
    if(indexHoy !== -1) {
        // Verificar si realmente está completado
        let total = 0, hechos = 0;
        meds.forEach(m => {
            const vigente = m.manual || (m.duracionDias - Math.floor((new Date().setHours(0,0,0,0) - m.fechaInicio) / 86400000) > 0);
            if (vigente) {
                if (m.manual) {
                    total++; if(m.mHecho || m.tHecho || m.nHecho) hechos++;
                } else {
                    total += m.tomasAlDia;
                    if(m.mHecho) hechos++; if(m.tomasAlDia === 3 && m.tHecho) hechos++; if(m.tomasAlDia >= 2 && m.nHecho) hechos++;
                }
            }
        });
        const p = total ? Math.round((hechos / total) * 100) : 0;
        if(p < 100) {
            historialDias.splice(indexHoy, 1);
            localStorage.setItem('vitaHistorial', JSON.stringify(historialDias));
        }
    }

    initChart();
    calcularRacha();
    actualizarMiniCalendario();
    
    // 2. RELOJ Y WIDGETS DINÁMICOS
    setInterval(() => {
        const ahora = new Date();
        const el = document.getElementById('reloj');
        if(el) el.innerText = ahora.toLocaleTimeString();
        const statusEl = document.getElementById('statusDia');
        if(statusEl) {
            const statusText = statusEl.querySelector('.fw-bold');
            if (statusText) statusText.innerText = ahora.toLocaleDateString();
        }
        
        actualizarProximaToma();
        actualizarAlertas();
    }, 1000);

    // 3. SOS REACTIVO
    const inpTel = document.getElementById('telFamiliar');
    const btnFam = document.getElementById('callFamiliar');
    if (inpTel && btnFam) {
        const upSOS = (n) => {
            const num = (n || "").trim();
            if(num.length > 0) {
                btnFam.href = `tel:${num}`; btnFam.classList.remove('disabled', 'opacity-50'); btnFam.innerText = `Llamar a ${num}`;
            } else {
                btnFam.href = "#"; btnFam.classList.add('disabled', 'opacity-50'); btnFam.innerText = `Llamar Familiar`;
            }
        };
        inpTel.value = localStorage.getItem('vitaTel') || "";
        upSOS(inpTel.value);
        inpTel.oninput = (e) => { localStorage.setItem('vitaTel', e.target.value); upSOS(e.target.value); };
    }

    // 4. EVENTOS DE BUSQUEDA Y UI
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
            filtroActual = normalizeTurno(e.target.dataset.val);
            document.querySelectorAll('.tab-filter').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            render();
        };
    });

    revisarNuevoDia();
    render();
};

/**
 * CÁLCULO DE HORA: Blindado contra errores de 'split'
 */
function calcularHoraTurno(horaBase, turno, esManual) {
    if (!horaBase || typeof horaBase !== 'string' || !horaBase.includes(':')) return "08:00";
    if (esManual) return horaBase;
    
    let parts = horaBase.split(':');
    let h = parseInt(parts[0]);
    let m = parts[1];
    
    if (turno === 'tarde') h = (h + 8) % 24;
    if (turno === 'noche') h = (h + 14) % 24;
    return `${String(h).padStart(2, '0')}:${m}`;
}

function normalizeTurno(value) {
    if (!value) return 'mañana';
    if (value === 'manana') return 'mañana';
    return value;
}

function saveMed() {
    const sel = document.getElementById('selMed').value;
    const nombre = (sel === 'otro') ? document.getElementById('otroMed').value.trim() : sel;
    let hToma = document.getElementById('horaToma').value;
    const esManual = document.getElementById('esManual').checked;

    if(!nombre) return alert("Falta el nombre del medicamento.");
    if(!hToma) {
        if (esManual) {
            const ahora = new Date();
            hToma = ahora.toTimeString().slice(0, 5);
            document.getElementById('horaToma').value = hToma;
        } else {
            return alert("Falta la hora de la toma.");
        }
    }

    const hh = parseInt(hToma.split(':')[0]);
    let tAuto = (hh >= 6 && hh < 13) ? 'mañana' : (hh >= 13 && hh < 20) ? 'tarde' : 'noche';

    meds.push({
        nombre, hora: hToma, manual: esManual, turnoAuto: tAuto,
        tomasAlDia: esManual ? 1 : parseInt(document.getElementById('tomasDiarias').value), 
        fechaInicio: new Date().setHours(0,0,0,0),
        duracionDias: esManual ? 0 : parseInt(document.getElementById('duracion').value),
        mHecho: false, tHecho: false, nHecho: false
    });

    sync();
    bootstrap.Modal.getInstance(document.getElementById('modalRegistro')).hide();
}

/**
 * RENDER: Filtra por buscador y evita cierres por errores
 */
function render() {
    const cont = document.getElementById('listaTareas');
    if(!cont) return;
    const buscadorEl = document.getElementById('buscador');
    const busq = buscadorEl ? buscadorEl.value.toLowerCase() : '';
    const hoyMs = new Date().setHours(0,0,0,0);
    const ahora = new Date();
    const horaActual = ahora.getHours() * 60 + ahora.getMinutes();

    cont.innerHTML = meds.map((m, i) => {
        const msPasados = hoyMs - m.fechaInicio;
        const diasRestantes = m.duracionDias - Math.floor(msPasados / 86400000);

        if(!m.manual && diasRestantes <= 0) return "";
        if(!m.nombre.toLowerCase().includes(busq)) return ""; // Lógica del buscador

        let visible = false; let hecho = false;
        if (m.manual) {
                if(normalizeTurno(m.turnoAuto) === filtroActual) { 
                visible = true; 
                hecho = (filtroActual === 'mañana' ? m.mHecho : filtroActual === 'tarde' ? m.tHecho : m.nHecho);
            }
        } else {
            if(filtroActual === 'mañana') { visible = true; hecho = m.mHecho; }
            if(filtroActual === 'tarde' && m.tomasAlDia === 3) { visible = true; hecho = m.tHecho; }
            if(filtroActual === 'noche' && m.tomasAlDia >= 2) { visible = true; hecho = m.nHecho; }
        }

        if(!visible) return "";

        const horaDisplay = calcularHoraTurno(m.hora, filtroActual, m.manual);
        const etiqueta = m.manual ? `<span class="badge bg-light text-dark border">💊 Automedicación</span>` : `<small class="text-muted">Quedan ${diasRestantes} días</small>`;
        const nota = m.nota ? `<div class="small text-muted mt-1">${m.nota}</div>` : '';

        // Calcular estado visual SOLO si estamos en el turno correspondiente
        const [h, min] = horaDisplay.split(':').map(Number);
        const minToma = h * 60 + min;
        
        // Determinar si el turno actual ya llegó
        const turnoActualEmpezado = 
            (filtroActual === 'mañana' && horaActual >= 6 * 60) || // 6:00 AM
            (filtroActual === 'tarde' && horaActual >= 13 * 60) || // 1:00 PM
            (filtroActual === 'noche' && horaActual >= 20 * 60);   // 8:00 PM
        
        let claseEstado = '';
        if(hecho) {
            claseEstado = 'task-done';
        } else if(turnoActualEmpezado) {
            // Solo aplicar colores de urgencia si el turno ya comenzó
            const difMinutos = horaActual - minToma;
            if(difMinutos > 0) {
                claseEstado = 'task-retrasada'; // Pasó la hora
            } else if(difMinutos > -60) {
                claseEstado = 'task-proxima'; // Menos de 1 hora
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

/**
 * ESTADÍSTICAS: Ahora el gráfico avanza siempre
 */
function updateStats() {
    let total = 0, hechos = 0;
    meds.forEach(m => {
        const vigente = m.manual || (m.duracionDias - Math.floor((new Date().setHours(0,0,0,0) - m.fechaInicio) / 86400000) > 0);
        if (vigente) {
            if (m.manual) {
                total++; if(m.mHecho || m.tHecho || m.nHecho) hechos++;
            } else {
                total += m.tomasAlDia;
                if(m.mHecho) hechos++; if(m.tomasAlDia === 3 && m.tHecho) hechos++; if(m.tomasAlDia >= 2 && m.nHecho) hechos++;
            }
        }
    });
    const p = total ? Math.round((hechos / total) * 100) : 0;
    if(chartInstance) { chartInstance.data.datasets[0].data = [p, 100-p]; chartInstance.update(); }
    const chartCanvas = document.getElementById('graficoProgreso');
    if (!chartInstance && chartCanvas) drawFallbackChart(chartCanvas, p);
    const porcentajeEl = document.getElementById('porcentajeTxt');
    if(porcentajeEl) porcentajeEl.innerText = p + '%';
    const progresoBar = document.getElementById('progresoBar');
    if(progresoBar) {
        progresoBar.style.width = `${p}%`;
        progresoBar.setAttribute('aria-valuenow', p);
    }
    
    // Actualizar resumen de tomas
    const resumenEl = document.getElementById('resumenTomas');
    if(resumenEl) resumenEl.innerText = `${hechos} de ${total} tomas`;
    const resumenSmall = document.getElementById('resumenTomasSmall');
    if(resumenSmall) resumenSmall.innerText = `${hechos}/${total}`;
    const statsTotalMeds = document.getElementById('statsTotalMeds');
    if (statsTotalMeds) statsTotalMeds.innerText = meds.length;
    const statsTomas = document.getElementById('statsTomas');
    if (statsTomas) statsTomas.innerText = hechos;
    const statsAdh = document.getElementById('statsAdherencia');
    if (statsAdh) statsAdh.innerText = `${p}%`;
    const adhPct = document.getElementById('adherenciaPct');
    if (adhPct) adhPct.innerText = `${p}%`;
    const statsAlertas = document.getElementById('statsAlertas');
    if (statsAlertas) statsAlertas.innerText = document.querySelectorAll('#listaAlertas .alert-warning').length || 0;
    
    // Gestión dinámica de la racha
    const hoy = new Date().toLocaleDateString();
    const indexHoy = historialDias.findIndex(h => h.fecha === hoy);
    
    if(p === 100 && total > 0) {
        // Día completado
        if(indexHoy === -1) {
            // Añadir el día si no existe
            historialDias.push({ fecha: hoy, cumplido: true });
            localStorage.setItem('vitaHistorial', JSON.stringify(historialDias.slice(-30)));
            calcularRacha();
        }
    } else {
        // Día no completado o parcial
        if(indexHoy !== -1) {
            // Eliminar el día si existía como completado
            historialDias.splice(indexHoy, 1);
            localStorage.setItem('vitaHistorial', JSON.stringify(historialDias));
            calcularRacha();
        }
    }
}

/**
 * WIDGET: Próxima Toma con Countdown
 */
function actualizarProximaToma() {
    const ahora = new Date();
    const horaActual = ahora.getHours() * 60 + ahora.getMinutes();
    
    let proximaMed = null;
    let menorDif = Infinity;
    
    meds.forEach(m => {
        const hoyMs = new Date().setHours(0,0,0,0);
        const vigente = m.manual || (m.duracionDias - Math.floor((hoyMs - m.fechaInicio) / 86400000) > 0);
        if(!vigente) return;
        
        const turnos = [];
        if(m.manual) {
            turnos.push({ turno: m.turnoAuto, hora: m.hora, hecho: m.mHecho || m.tHecho || m.nHecho });
        } else {
            turnos.push({ turno: 'mañana', hora: m.hora, hecho: m.mHecho });
            if(m.tomasAlDia === 3) turnos.push({ turno: 'tarde', hora: calcularHoraTurno(m.hora, 'tarde', false), hecho: m.tHecho });
            if(m.tomasAlDia >= 2) turnos.push({ turno: 'noche', hora: calcularHoraTurno(m.hora, 'noche', false), hecho: m.nHecho });
        }
        
        turnos.forEach(t => {
            if(t.hecho) return;
            const [h, min] = t.hora.split(':').map(Number);
            const minToma = h * 60 + min;
            const dif = minToma - horaActual;
            
            if(dif > 0 && dif < menorDif) {
                menorDif = dif;
                proximaMed = { nombre: m.nombre, hora: t.hora, minutos: dif };
            }
        });
    });
    
    const widget = document.getElementById('widgetProxima');
    if(!widget) return;
    if(proximaMed) {
        widget.classList.remove('d-none');
        document.getElementById('proximaNombre').innerText = proximaMed.nombre;
        document.getElementById('proximaHora').innerText = proximaMed.hora;
        
        const horas = Math.floor(proximaMed.minutos / 60);
        const mins = proximaMed.minutos % 60;
        document.getElementById('proximaCountdown').innerText = `${horas}h ${mins}m`;
        
        // Cambiar color si es urgente (menos de 30 min)
        if(proximaMed.minutos < 30) {
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

/**
 * WIDGET: Sistema de Alertas
 */
function actualizarAlertas() {
    const listaAlertas = document.getElementById('listaAlertas');
    if(!listaAlertas) return;
    
    const alertas = [];
    const hoyMs = new Date().setHours(0,0,0,0);
    
    meds.forEach(m => {
        if(m.manual) return;
        const diasRestantes = m.duracionDias - Math.floor((hoyMs - m.fechaInicio) / 86400000);
        if(diasRestantes > 0 && diasRestantes <= 3) {
            alertas.push(`⚠️ <strong>${m.nombre}</strong> se acaba en ${diasRestantes} día${diasRestantes > 1 ? 's' : ''}`);
        }
    });
    
    if(alertas.length === 0) {
        listaAlertas.innerHTML = '<div class="alert alert-success mb-0 py-2">✓ Todo al día, sin alertas</div>';
    } else {
        listaAlertas.innerHTML = alertas.map(a => `<div class="alert alert-warning mb-0 py-2">${a}</div>`).join('');
    }
}

/**
 * WIDGET: Racha de Días Consecutivos
 */
function calcularRacha() {
    // Ordenar historial por fecha (más reciente primero)
    historialDias.sort((a, b) => new Date(b.fecha.split('/').reverse().join('-')) - new Date(a.fecha.split('/').reverse().join('-')));
    
    let racha = 0;
    const hoy = new Date();
    const hoyStr = hoy.toLocaleDateString();
    
    // Verificar si hoy está completado
    const hoyCompleto = historialDias.some(h => h.fecha === hoyStr && h.cumplido);
    
    // Empezar desde ayer (i=1) si hoy no está completo, o desde hoy (i=0) si lo está
    const iniciar = hoyCompleto ? 0 : 1;
    
    for(let i = iniciar; i <= 30; i++) {
        const fecha = new Date(hoy);
        fecha.setDate(fecha.getDate() - i);
        const fechaStr = fecha.toLocaleDateString();
        
        const diaEnHistorial = historialDias.find(h => h.fecha === fechaStr && h.cumplido);
        
        if(diaEnHistorial) {
            racha++;
        } else {
            // Si un día no está completado, se rompe la racha
            break;
        }
    }
    
    rachaActual = racha;
    localStorage.setItem('vitaRacha', rachaActual);
    actualizarRacha();
    actualizarMiniCalendario();
}

function actualizarRacha() {
    const rachaEl = document.getElementById('rachaTexto');
    const subtextoEl = document.getElementById('rachaSubtexto');
    if(!rachaEl) return;
    
    rachaEl.innerHTML = `<span class="text-warning">🔥</span> ${rachaActual} día${rachaActual !== 1 ? 's' : ''}`;

    const rachaDiasEl = document.getElementById('rachaDias');
    if (rachaDiasEl) rachaDiasEl.innerText = `${rachaActual} dias`;
    
    if (subtextoEl) {
        if(rachaActual === 0) {
            subtextoEl.innerText = '¡Completa hoy para empezar!';
        } else {
            subtextoEl.innerText = `¡Sigue así! ${rachaActual} día${rachaActual !== 1 ? 's' : ''} consecutivo${rachaActual !== 1 ? 's' : ''}`;
        }
    }
}

/**
 * WIDGET: Mini Calendario (últimos 7 días)
 */
function actualizarMiniCalendario() {
    const calEl = document.getElementById('miniCalendario');
    if(!calEl) return;
    
    const dias = [];
    for(let i = 6; i >= 0; i--) {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() - i);
        const fechaStr = fecha.toLocaleDateString();
        const dia = fecha.toLocaleDateString('es-ES', { weekday: 'short' })[0].toUpperCase();
        
        const cumplido = historialDias.some(h => h.fecha === fechaStr && h.cumplido);
        const esHoy = i === 0;
        
        let icono = '○';
        let color = 'text-muted';
        if(cumplido) {
            icono = '●';
            color = 'text-success';
        } else if(esHoy) {
            icono = '◐';
            color = 'text-primary';
        }
        
        dias.push(`<div class="text-center"><small class="text-muted d-block">${dia}</small><span class="${color} fs-5">${icono}</span></div>`);
    }
    
    calEl.innerHTML = dias.join('');
}

/**
 * ESTADÍSTICAS: Ahora el gráfico avanza siempre
 */
function updateStats_OLD() {
    let total = 0, hechos = 0;
    meds.forEach(m => {
        const vigente = m.manual || (m.duracionDias - Math.floor((new Date().setHours(0,0,0,0) - m.fechaInicio) / 86400000) > 0);
        if (vigente) {
            if (m.manual) {
                total++; if(m.mHecho || m.tHecho || m.nHecho) hechos++;
            } else {
                total += m.tomasAlDia;
                if(m.mHecho) hechos++; if(m.tomasAlDia === 3 && m.tHecho) hechos++; if(m.tomasAlDia >= 2 && m.nHecho) hechos++;
            }
        }
    });
    const p = total ? Math.round((hechos / total) * 100) : 0;
    if(chartInstance) { chartInstance.data.datasets[0].data = [p, 100-p]; chartInstance.update(); }
    document.getElementById('porcentajeTxt').innerText = p + '%';
}

function toggleMed(i) {
    if(filtroActual === 'mañana') meds[i].mHecho = !meds[i].mHecho;
    if(filtroActual === 'tarde') meds[i].tHecho = !meds[i].tHecho;
    if(filtroActual === 'noche') meds[i].nHecho = !meds[i].nHecho;
    sync();
}

function delMed(i) { if(confirm("¿Eliminar?")) { meds.splice(i, 1); sync(); } }
function sync() { saveMedsForUser(); render(); }

function initChart() {
    const ctx = document.getElementById('graficoProgreso');
    if(!ctx) return;
    if (!window.Chart) {
        drawFallbackChart(ctx, 0);
        return;
    }
    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: { datasets: [{ data: [0, 100], backgroundColor: ['#10b981', '#e5e7eb'], borderWidth: 0 }] },
        options: { cutout: '80%', responsive: true, maintainAspectRatio: false, plugins: { tooltip: { enabled: false } } }
    });
}

function drawFallbackChart(canvas, percent) {
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

function setSkin(s) {
    skinActual = s || 'base';
    document.body.classList.remove('skin-base', 'skin-good', 'skin-access');
    if (skinActual === 'good') document.body.classList.add('skin-good');
    if (skinActual === 'access') document.body.classList.add('skin-access');
    if (skinActual === 'base') document.body.classList.add('skin-base');
    localStorage.setItem('vitaSkin', skinActual);
}

function setRol(r, options = { redirect: false }) {
    rolActual = r || 'paciente';
    document.body.classList.remove('role-paciente', 'role-medico', 'role-farmaceutico');
    document.body.classList.add(`role-${rolActual}`);
    localStorage.setItem('vitaRole', rolActual);

    const dashLink = document.getElementById('navDashboard');
    if (dashLink) dashLink.href = dashboardMap[rolActual];

    if (options.redirect && document.body.dataset.page && document.body.dataset.page.startsWith('dashboard')) {
        const target = dashboardMap[rolActual];
        if (!window.location.pathname.endsWith(target)) {
            window.location.href = target;
        }
    }
}

function revisarNuevoDia() {
    const hoy = new Date().toLocaleDateString();
    if(localStorage.getItem('lastCheck') !== hoy) {
        // Resetear todas las tomas del día
        meds = meds.map(m => { m.mHecho = false; m.tHecho = false; m.nHecho = false; return m; });
        localStorage.setItem('lastCheck', hoy);
        
        // Recalcular la racha basándose en el historial
        calcularRacha();
        
        sync();
    }
}

function getActiveUserName() {
    const perfil = JSON.parse(localStorage.getItem('vitaProfile')) || {};
    return (perfil.nombre || localStorage.getItem('vitaUserName') || 'usuario').trim();
}

function loadMedsForUser() {
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
    meds = all[usuario];
}

function saveMedsForUser() {
    const key = 'vitaMedsByUser';
    const all = JSON.parse(localStorage.getItem(key)) || {};
    const usuario = getActiveUserName();
    all[usuario] = meds;
    localStorage.setItem(key, JSON.stringify(all));
}

function cargarPerfil() {
    const form = document.getElementById('profileForm');
    if (!form) return;
    perfilActual = JSON.parse(localStorage.getItem('vitaProfile')) || {};
    const get = (id) => document.getElementById(id);
    if (get('perfilNombre')) get('perfilNombre').value = perfilActual.nombre || nombreUsuario || '';
    if (get('perfilAlergias')) get('perfilAlergias').value = perfilActual.alergias || '';
    if (get('perfilCronicas')) get('perfilCronicas').value = perfilActual.cronicas || '';
    if (get('perfilSangre')) get('perfilSangre').value = perfilActual.sangre || '';
    if (get('perfilTelefono')) get('perfilTelefono').value = perfilActual.telefono || '';
    if (get('perfilMedico')) get('perfilMedico').value = perfilActual.medico || '';
    if (get('perfilNotas')) get('perfilNotas').value = perfilActual.notas || '';
}

function guardarPerfil() {
    const get = (id) => document.getElementById(id);
    if (!get('perfilNombre')) return;
    perfilActual = {
        nombre: get('perfilNombre').value.trim(),
        alergias: get('perfilAlergias').value.trim(),
        cronicas: get('perfilCronicas').value.trim(),
        sangre: get('perfilSangre').value,
        telefono: get('perfilTelefono').value.trim(),
        medico: get('perfilMedico').value.trim(),
        notas: get('perfilNotas').value.trim()
    };
    localStorage.setItem('vitaProfile', JSON.stringify(perfilActual));
    if (perfilActual.nombre) localStorage.setItem('vitaUserName', perfilActual.nombre);
    if (perfilActual.telefono) localStorage.setItem('vitaTel', perfilActual.telefono);
    const userNameEl = document.getElementById('userName');
    if (userNameEl && perfilActual.nombre) userNameEl.innerText = perfilActual.nombre;
    alert('Perfil medico guardado');
}

function loadHistorialForUser(usuario) {
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

function saveHistorialForUser(usuario, data) {
    const key = 'vitaHistorialByUser';
    const all = JSON.parse(localStorage.getItem(key)) || {};
    all[usuario] = data;
    localStorage.setItem(key, JSON.stringify(all));
}

function renderHistorial() {
    const tbody = document.getElementById('historialList');
    if (!tbody) return;
    if (!historialMedico.length) {
        tbody.innerHTML = '<tr><td colspan="3" class="text-muted">Sin registros todavia.</td></tr>';
        return;
    }
    tbody.innerHTML = historialMedico.map(item => `
        <tr>
            <td>${item.fecha}</td>
            <td>${item.evento}</td>
            <td>${item.notas}</td>
        </tr>
    `).join('');
}

function agregarHistorial() {
    const fechaEl = document.getElementById('historialFecha');
    const eventoEl = document.getElementById('historialEvento');
    const notasEl = document.getElementById('historialNotas');
    if (!fechaEl || !eventoEl || !notasEl) return;

    const fecha = fechaEl.value || new Date().toISOString().slice(0, 10);
    const evento = eventoEl.value.trim();
    const notas = notasEl.value.trim();
    if (!evento) return alert('Describe el evento');

    historialMedico.unshift({ fecha, evento, notas });
    saveHistorialForUser(getActiveUserName(), historialMedico.slice(0, 50));
    fechaEl.value = '';
    eventoEl.value = '';
    notasEl.value = '';
    renderHistorial();
}

function renderConsejo() {
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

function initFarmacias() {
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

function initAnalisis() {
    const adhEl = document.getElementById('analisisAdhGlobal');
    const rachaEl = document.getElementById('analisisRacha');
    const totalEl = document.getElementById('analisisTomas');
    const compEl = document.getElementById('analisisCompletadas');
    const semanalEl = document.getElementById('analisisSemanal');
    const distEl = document.getElementById('analisisDistribucion');
    const tendenciaEl = document.getElementById('analisisTendencia');
    if (!adhEl && !rachaEl && !totalEl && !compEl && !semanalEl && !distEl && !tendenciaEl) return;

    let total = 0, hechos = 0;
    meds.forEach(m => {
        const vigente = m.manual || (m.duracionDias - Math.floor((new Date().setHours(0,0,0,0) - m.fechaInicio) / 86400000) > 0);
        if (vigente) {
            if (m.manual) {
                total++; if(m.mHecho || m.tHecho || m.nHecho) hechos++;
            } else {
                total += m.tomasAlDia;
                if(m.mHecho) hechos++; if(m.tomasAlDia === 3 && m.tHecho) hechos++; if(m.tomasAlDia >= 2 && m.nHecho) hechos++;
            }
        }
    });
    const p = total ? Math.round((hechos / total) * 100) : 0;
    if (adhEl) adhEl.innerText = `${p}%`;
    if (rachaEl) rachaEl.innerText = `${rachaActual} dias`;
    if (totalEl) totalEl.innerText = `${total}`;
    if (compEl) compEl.innerText = `${hechos}`;

    const renderBars = (container, values, label) => {
        if (!container) return;
        const max = Math.max(...values, 0);
        if (max === 0) {
            container.innerHTML = `<div class="small text-muted">${label}</div><div class="text-muted mt-2">Sin datos aun.</div>`;
            return;
        }
        const bars = values.map((v, i) => {
            const pct = Math.round((v / max) * 100);
            return `
                <div class="d-flex align-items-center gap-2 mb-2">
                    <div class="small text-muted" style="width: 22px;">${i + 1}</div>
                    <div class="flex-grow-1 bg-light rounded-pill" style="height: 10px;">
                        <div class="bg-primary rounded-pill" style="height: 10px; width: ${pct}%;"></div>
                    </div>
                    <div class="small">${v}</div>
                </div>
            `;
        }).join('');
        container.innerHTML = `<div class="small text-muted mb-2">${label}</div>${bars}`;
    };

    const ultimos7 = [];
    for (let i = 6; i >= 0; i--) {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() - i);
        const fechaStr = fecha.toLocaleDateString();
        const cumplido = historialDias.some(h => h.fecha === fechaStr && h.cumplido);
        ultimos7.push(cumplido ? 100 : 0);
    }
    renderBars(semanalEl, ultimos7, 'Cumplimiento por dia (0-100)');

    const dist = [
        meds.filter(m => !m.manual && m.tomasAlDia === 1).length,
        meds.filter(m => !m.manual && m.tomasAlDia === 2).length,
        meds.filter(m => !m.manual && m.tomasAlDia === 3).length
    ];
    renderBars(distEl, dist, 'Distribucion por tomas diarias');

    const tendencia = historialDias.slice(-8).map(h => h.cumplido ? 100 : 0);
    renderBars(tendenciaEl, tendencia, 'Tendencia reciente');
}

function initMedico() {
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
            if (prescripcionEditId) {
                prescripciones = prescripciones.map(p => p.id === prescripcionEditId ? {
                    ...p, paciente, med, dosis, dias, tomas, hora, notas, estado: 'Modificado'
                } : p);
                inventarioPacientes = inventarioPacientes.map(i => {
                    if (i.prescId && i.prescId === prescripcionEditId) {
                        return { ...i, paciente, med, unidades: dias * tomas };
                    }
                    return i;
                });
                localStorage.setItem('vitaInventario', JSON.stringify(inventarioPacientes.slice(0, 100)));
                prescripcionEditId = null;
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
                prescripciones.unshift(item);
                const unidades = dias * tomas;
                inventarioPacientes.unshift({
                    prescId: item.id,
                    paciente,
                    med,
                    unidades,
                    estado: 'Pendiente',
                    fecha: new Date().toLocaleDateString()
                });
                localStorage.setItem('vitaInventario', JSON.stringify(inventarioPacientes.slice(0, 100)));
            }
            localStorage.setItem('vitaPrescripciones', JSON.stringify(prescripciones.slice(0, 50)));
            form.reset();
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.innerText = 'Guardar prescripcion';
            renderPrescripciones();
        });
    }
    renderPrescripciones();

    const mensajeForm = document.getElementById('mensajeForm');
    if (mensajeForm) {
        mensajeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const paciente = document.getElementById('mensajePaciente').value.trim();
            const texto = document.getElementById('mensajeTexto').value.trim();
            if (!paciente || !texto) return alert('Completa paciente y mensaje');
            mensajesMedicos.unshift({ paciente, texto, fecha: new Date().toLocaleDateString() });
            localStorage.setItem('vitaMensajes', JSON.stringify(mensajesMedicos.slice(0, 50)));
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

function renderPrescripciones() {
    const tbody = document.getElementById('prescripcionesList');
    if (!tbody) return;
    if (!prescripciones.length) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-muted">Sin prescripciones.</td></tr>';
        return;
    }
    tbody.innerHTML = prescripciones.map(p => `
        <tr>
            <td>${p.paciente}</td>
            <td>${p.med}${p.notas ? `<div class="small text-muted">${p.notas}</div>` : ''}</td>
            <td><span class="badge ${p.estado === 'Activo' ? 'text-bg-success' : 'text-bg-warning'}">${p.estado}</span></td>
            <td><button class="btn btn-sm btn-outline-primary" data-presc="${p.id}">Editar</button></td>
        </tr>
    `).join('');
    tbody.querySelectorAll('[data-presc]').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.presc, 10);
            const presc = prescripciones.find(p => p.id === id);
            if (!presc) return;
            const form = document.getElementById('prescripcionForm');
            if (!form) return;
            document.getElementById('prescPaciente').value = presc.paciente || '';
            document.getElementById('prescMed').value = presc.med || '';
            document.getElementById('prescDosis').value = presc.dosis || '';
            document.getElementById('prescDias').value = presc.dias || '';
            document.getElementById('prescTomas').value = presc.tomas || '';
            document.getElementById('prescHora').value = presc.hora || '08:00';
            document.getElementById('prescNotas').value = presc.notas || '';
            prescripcionEditId = id;
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.innerText = 'Guardar cambios';
        });
    });
}

function renderMensajes() {
    const list = document.getElementById('mensajesList');
    if (!list) return;
    if (!mensajesMedicos.length) {
        list.innerHTML = '<div class="text-muted">Sin mensajes enviados.</div>';
        return;
    }
    list.innerHTML = mensajesMedicos.map(m => `
        <div class="border rounded-3 p-2">
            <div class="fw-bold">${m.paciente}</div>
            <div class="small text-muted">${m.fecha}</div>
            <div>${m.texto}</div>
        </div>
    `).join('');
}

function initFarmaceutico() {
    if (!stockFarmacia.length) {
        stockFarmacia = [
            { med: 'Metformina', cant: 12 },
            { med: 'Omeprazol', cant: 5 },
            { med: 'Paracetamol', cant: 18 }
        ];
        localStorage.setItem('vitaStock', JSON.stringify(stockFarmacia));
    }
    renderStock();
    const stockForm = document.getElementById('stockForm');
    if (stockForm) {
        stockForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const med = document.getElementById('stockMed').value.trim();
            const cant = parseInt(document.getElementById('stockCant').value, 10);
            if (!med || Number.isNaN(cant)) return alert('Completa medicamento y unidades');
            stockFarmacia.unshift({ med, cant });
            localStorage.setItem('vitaStock', JSON.stringify(stockFarmacia.slice(0, 50)));
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

            const idx = inventarioPacientes.findIndex(i => i.paciente.toLowerCase() === paciente.toLowerCase() && i.med.toLowerCase() === med.toLowerCase());
            if (idx === -1) return alert('No existe inventario para ese paciente');
            if (inventarioPacientes[idx].unidades < unidades) return alert('Unidades insuficientes');

            inventarioPacientes[idx].unidades -= unidades;
            inventarioPacientes[idx].estado = inventarioPacientes[idx].unidades === 0 ? 'Dispensado' : 'Parcial';
            localStorage.setItem('vitaInventario', JSON.stringify(inventarioPacientes));

            dispensaciones.unshift({ fecha: new Date().toLocaleDateString(), paciente, med, unidades });
            localStorage.setItem('vitaDispensaciones', JSON.stringify(dispensaciones.slice(0, 50)));
            dispForm.reset();
            renderDispensaciones();
            renderInventarioFarmacia();
            renderInventarioPaciente();
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
            avisosFarmacia.unshift({ paciente, texto, fecha: new Date().toLocaleDateString() });
            localStorage.setItem('vitaAvisos', JSON.stringify(avisosFarmacia.slice(0, 50)));
            inventarioPacientes = inventarioPacientes.map(i => i.paciente.toLowerCase() === paciente.toLowerCase() ? { ...i, estado: 'Listo' } : i);
            localStorage.setItem('vitaInventario', JSON.stringify(inventarioPacientes));
            avisoForm.reset();
            renderAvisos();
            renderInventarioFarmacia();
            renderInventarioPaciente();
        });
    }
    renderAvisos();
    renderInventarioFarmacia();
}

function renderStock() {
    const tbody = document.getElementById('stockList');
    if (!tbody) return;
    tbody.innerHTML = stockFarmacia.map(s => `
        <tr>
            <td>${s.med}</td>
            <td>${s.cant}</td>
        </tr>
    `).join('') || '<tr><td colspan="2" class="text-muted">Sin stock registrado.</td></tr>';
}

function renderDispensaciones() {
    const tbody = document.getElementById('dispList');
    if (!tbody) return;
    if (!dispensaciones.length) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-muted">Sin dispensaciones.</td></tr>';
        return;
    }
    tbody.innerHTML = dispensaciones.map(d => `
        <tr>
            <td>${d.fecha}</td>
            <td>${d.paciente}</td>
            <td>${d.med}</td>
            <td>${d.unidades || 0}</td>
        </tr>
    `).join('');
}

function renderAvisos() {
    const list = document.getElementById('avisosList');
    if (!list) return;
    if (!avisosFarmacia.length) {
        list.innerHTML = '<div class="text-muted">Sin avisos enviados.</div>';
        return;
    }
    list.innerHTML = avisosFarmacia.map(a => `
        <div class="border rounded-3 p-2">
            <div class="fw-bold">${a.paciente}</div>
            <div class="small text-muted">${a.fecha}</div>
            <div>${a.texto}</div>
        </div>
    `).join('');
}

function initActions() {
    document.querySelectorAll('[data-message]').forEach(btn => {
        btn.addEventListener('click', () => {
            alert(btn.dataset.message);
        });
    });
}

function renderRecetasPaciente() {
    const list = document.getElementById('recetasPaciente');
    if (!list) return;
    const usuario = getActiveUserName();
    const recetas = prescripciones.filter(p => p.paciente.toLowerCase() === usuario.toLowerCase() && p.estado !== 'Activo');
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
            const receta = prescripciones.find(p => p.id === id);
            if (!receta) return;
            meds.push({
                nombre: receta.med,
                hora: receta.hora || '08:00',
                manual: false,
                turnoAuto: 'mañana',
                tomasAlDia: receta.tomas || 1,
                fechaInicio: new Date().setHours(0,0,0,0),
                duracionDias: receta.dias || 7,
                nota: receta.notas || '',
                mHecho: false, tHecho: false, nHecho: false
            });
            prescripciones = prescripciones.map(p => p.id === id ? { ...p, estado: 'Activo' } : p);
            localStorage.setItem('vitaPrescripciones', JSON.stringify(prescripciones));
            saveMedsForUser();
            render();
            renderRecetasPaciente();
        });
    });
}

function renderMensajesPaciente() {
    const list = document.getElementById('mensajesPaciente');
    if (!list) return;
    const usuario = getActiveUserName();
    const mensajes = mensajesMedicos.filter(m => m.paciente.toLowerCase() === usuario.toLowerCase());
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

function renderInventarioPaciente() {
    const list = document.getElementById('inventarioPaciente');
    if (!list) return;
    const usuario = getActiveUserName();
    const items = inventarioPacientes.filter(i => i.paciente.toLowerCase() === usuario.toLowerCase());
    if (!items.length) {
        list.innerHTML = '<div class="text-muted">Sin inventario asignado.</div>';
        return;
    }
    list.innerHTML = items.map(i => `
        <div class="border rounded-3 p-2">
            <div class="fw-bold">${i.med}</div>
            <div class="small text-muted">Unidades: ${i.unidades} | Estado: ${i.estado}</div>
            ${i.estado === 'Listo' ? '<button class="btn btn-sm btn-outline-primary mt-2" data-recogida="'+ i.med +'">Marcar recogida</button>' : ''}
        </div>
    `).join('');
    list.querySelectorAll('[data-recogida]').forEach(btn => {
        btn.addEventListener('click', () => {
            const med = btn.dataset.recogida;
            inventarioPacientes = inventarioPacientes.map(i =>
                i.paciente.toLowerCase() === usuario.toLowerCase() && i.med === med
                    ? { ...i, estado: 'Recogida' }
                    : i
            );
            localStorage.setItem('vitaInventario', JSON.stringify(inventarioPacientes));
            renderInventarioPaciente();
            renderInventarioFarmacia();
        });
    });
}

function renderInventarioFarmacia() {
    const tbody = document.getElementById('inventarioList');
    if (!tbody) return;
    if (!inventarioPacientes.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-muted">Sin inventario registrado.</td></tr>';
        return;
    }
    tbody.innerHTML = inventarioPacientes.map((i, idx) => `
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
            inventarioPacientes = inventarioPacientes.map((i, iIdx) => iIdx === idx ? { ...i, estado: 'Listo' } : i);
            localStorage.setItem('vitaInventario', JSON.stringify(inventarioPacientes));
            renderInventarioFarmacia();
            renderInventarioPaciente();
        });
    });
}

function renderHistorialPaciente(nombre) {
    const cont = document.getElementById('historialPaciente');
    if (!cont) return;
    if (!nombre) {
        cont.innerHTML = '<div class="text-muted">Introduce un nombre de paciente.</div>';
        return;
    }
    const medsByUser = JSON.parse(localStorage.getItem('vitaMedsByUser')) || {};
    const histByUser = JSON.parse(localStorage.getItem('vitaHistorialByUser')) || {};
    const medsPac = medsByUser[nombre] || [];
    const histPac = histByUser[nombre] || [];
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
                    ${histPac.length ? histPac.map(h => `<div>${h.fecha} - ${h.evento}</div>`).join('') : '<div class="text-muted">Sin eventos</div>'}
                </div>
            </div>
        </div>
    `;
}

function getDashboardRoleFromPath() {
    const path = window.location.pathname.toLowerCase();
    if (path.endsWith('dashboard-medico.html')) return 'medico';
    if (path.endsWith('dashboard-farmaceutico.html')) return 'farmaceutico';
    if (path.endsWith('dashboard.html')) return 'paciente';
    return null;
}