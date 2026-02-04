let meds = JSON.parse(localStorage.getItem('vitaData')) || [];
let filtroActual = 'mañana';
let chartInstance = null;
let rachaActual = parseInt(localStorage.getItem('vitaRacha')) || 0;
let historialDias = JSON.parse(localStorage.getItem('vitaHistorial')) || [];

window.onload = () => {
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
        if(statusEl) statusEl.querySelector('.fw-bold').innerText = ahora.toLocaleDateString();
        
        actualizarProximaToma();
        actualizarAlertas();
    }, 1000);

    // 3. SOS REACTIVO
    const inpTel = document.getElementById('telFamiliar');
    const btnFam = document.getElementById('callFamiliar');
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

    // 4. EVENTOS DE BUSQUEDA Y UI
    document.getElementById('btnGuardar').onclick = saveMed;
    document.getElementById('buscador').oninput = render; // Buscador funcional

    document.getElementById('esManual').onchange = (e) => {
        document.getElementById('panelMedico').classList.toggle('d-none', e.target.checked);
    };
    document.getElementById('selMed').onchange = (e) => {
        document.getElementById('otroMed').classList.toggle('d-none', e.target.value !== 'otro');
    };

    document.querySelectorAll('.tab-filter').forEach(btn => {
        btn.onclick = (e) => {
            filtroActual = e.target.dataset.val;
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

function saveMed() {
    const sel = document.getElementById('selMed').value;
    const nombre = (sel === 'otro') ? document.getElementById('otroMed').value.trim() : sel;
    const hToma = document.getElementById('horaToma').value;
    const esManual = document.getElementById('esManual').checked;

    if(!nombre || !hToma) return alert("Faltan datos.");

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
    const busq = document.getElementById('buscador').value.toLowerCase();
    const hoyMs = new Date().setHours(0,0,0,0);
    const ahora = new Date();
    const horaActual = ahora.getHours() * 60 + ahora.getMinutes();

    if(!cont) return;

    cont.innerHTML = meds.map((m, i) => {
        const msPasados = hoyMs - m.fechaInicio;
        const diasRestantes = m.duracionDias - Math.floor(msPasados / 86400000);

        if(!m.manual && diasRestantes <= 0) return "";
        if(!m.nombre.toLowerCase().includes(busq)) return ""; // Lógica del buscador

        let visible = false; let hecho = false;
        if (m.manual) {
            if(m.turnoAuto === filtroActual) { 
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
    document.getElementById('porcentajeTxt').innerText = p + '%';
    
    // Actualizar resumen de tomas
    const resumenEl = document.getElementById('resumenTomas');
    if(resumenEl) resumenEl.innerText = `${hechos} de ${total} tomas`;
    
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
    
    if(rachaActual === 0) {
        subtextoEl.innerText = '¡Completa hoy para empezar!';
    } else {
        subtextoEl.innerText = `¡Sigue así! ${rachaActual} día${rachaActual !== 1 ? 's' : ''} consecutivo${rachaActual !== 1 ? 's' : ''}`;
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
function sync() { localStorage.setItem('vitaData', JSON.stringify(meds)); render(); }

function initChart() {
    const ctx = document.getElementById('graficoProgreso');
    if(!ctx) return;
    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: { datasets: [{ data: [0, 100], backgroundColor: ['#10b981', '#e5e7eb'], borderWidth: 0 }] },
        options: { cutout: '80%', responsive: true, maintainAspectRatio: false, plugins: { tooltip: { enabled: false } } }
    });
}

function setSkin(s) {
    document.body.classList.remove('skin-dark', 'skin-access');
    if(s === 'dark') document.body.classList.add('skin-dark');
    if(s === 'acc') document.body.classList.add('skin-access');
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