let meds = JSON.parse(localStorage.getItem('vitaData')) || [];
let filtroActual = 'mañana';
let chartInstance = null;

window.onload = () => {
    // 1. LIMPIEZA DE DATOS (Arregla el error de split)
    meds = meds.map(m => {
        if (!m.hora) m.hora = "08:00";
        if (m.manual === undefined) m.manual = m.permanente || false;
        return m;
    });

    initChart();
    
    // 2. RELOJ
    setInterval(() => {
        const ahora = new Date();
        const el = document.getElementById('reloj');
        if(el) el.innerText = ahora.toLocaleTimeString();
        document.getElementById('statusDia').innerText = ahora.toLocaleDateString();
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

        return `
        <div class="col">
            <div class="card h-100 shadow-sm task-card ${hecho ? 'task-done border-success' : ''}">
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
        meds = meds.map(m => { m.mHecho = false; m.tHecho = false; m.nHecho = false; return m; });
        localStorage.setItem('lastCheck', hoy);
        sync();
    }
}