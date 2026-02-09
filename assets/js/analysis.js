import { state, getAdherenciaSerie, setAdherenciaSerie } from './core.js';

let chartSemanal = null;
let chartDistrib = null;
let chartTendencia = null;

export function initAnalisis() {
    const adhEl = document.getElementById('analisisAdhGlobal');
    const rachaEl = document.getElementById('analisisRacha');
    const totalEl = document.getElementById('analisisTomas');
    const compEl = document.getElementById('analisisCompletadas');
    const semanalEl = document.getElementById('analisisSemanal');
    const distEl = document.getElementById('analisisDistribucion');
    const tendenciaEl = document.getElementById('analisisTendencia');
    const semanalEmpty = document.getElementById('analisisSemanalEmpty');
    const distEmpty = document.getElementById('analisisDistribucionEmpty');
    const tendenciaEmpty = document.getElementById('analisisTendenciaEmpty');

    if (!adhEl && !rachaEl && !totalEl && !compEl && !semanalEl && !distEl && !tendenciaEl) return;

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
    if (adhEl) adhEl.innerText = `${p}%`;
    if (rachaEl) rachaEl.innerText = `${state.rachaActual} dias`;
    if (totalEl) totalEl.innerText = `${total}`;
    if (compEl) compEl.innerText = `${hechos}`;

    const labelsSemana = [];
    const ultimos7 = [];
    const serie = ensureSerieForToday(p);
    for (let i = 6; i >= 0; i--) {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() - i);
        const fechaStr = fecha.toLocaleDateString();
        const dia = fecha.toLocaleDateString('es-ES', { weekday: 'short' });
        const entry = serie.find(d => d.fecha === fechaStr);
        labelsSemana.push(dia);
        ultimos7.push(entry ? entry.porcentaje : 0);
    }

    const turnos = { manana: { total: 0, hecho: 0 }, tarde: { total: 0, hecho: 0 }, noche: { total: 0, hecho: 0 } };
    state.meds.forEach(m => {
        if (m.manual) {
            const t = m.turnoAuto === 'tarde' ? 'tarde' : m.turnoAuto === 'noche' ? 'noche' : 'manana';
            turnos[t].total += 1;
            if (m.mHecho || m.tHecho || m.nHecho) turnos[t].hecho += 1;
            return;
        }
        turnos.manana.total += 1;
        if (m.mHecho) turnos.manana.hecho += 1;
        if (m.tomasAlDia >= 2) {
            turnos.noche.total += 1;
            if (m.nHecho) turnos.noche.hecho += 1;
        }
        if (m.tomasAlDia === 3) {
            turnos.tarde.total += 1;
            if (m.tHecho) turnos.tarde.hecho += 1;
        }
    });
    const dist = [
        turnos.manana.total ? Math.round((turnos.manana.hecho / turnos.manana.total) * 100) : 0,
        turnos.tarde.total ? Math.round((turnos.tarde.hecho / turnos.tarde.total) * 100) : 0,
        turnos.noche.total ? Math.round((turnos.noche.hecho / turnos.noche.total) * 100) : 0
    ];

    const tendencia = serie.slice(-8).map(d => d.porcentaje);

    chartSemanal = renderBarChart(
        semanalEl,
        semanalEmpty,
        chartSemanal,
        labelsSemana,
        ultimos7,
        100
    );

    chartDistrib = renderBarChart(
        distEl,
        distEmpty,
        chartDistrib,
        ['Manana', 'Tarde', 'Noche'],
        dist,
        100
    );

    chartTendencia = renderLineChart(
        tendenciaEl,
        tendenciaEmpty,
        chartTendencia,
        tendencia
    );
}

function renderBarChart(canvas, emptyEl, instance, labels, data, maxY) {
    if (!canvas || !window.Chart) return null;
    const max = Math.max(...data, 0);
    if (max === 0) {
        if (emptyEl) emptyEl.style.display = 'grid';
        if (instance) instance.destroy();
        return null;
    }
    if (emptyEl) emptyEl.style.display = 'none';
    if (instance) instance.destroy();
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height || 200);
    gradient.addColorStop(0, 'rgba(14, 165, 233, 0.85)');
    gradient.addColorStop(1, 'rgba(56, 189, 248, 0.25)');
    return new Chart(canvas, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    data,
                    backgroundColor: gradient,
                    borderColor: 'rgba(14, 165, 233, 0.9)',
                    borderWidth: 1,
                    borderRadius: 12,
                    borderSkipped: false,
                    barThickness: 28
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: { padding: { top: 6, right: 8, left: 8, bottom: 6 } },
            plugins: {
                legend: { display: false },
                tooltip: {
                    enabled: true,
                    displayColors: false,
                    backgroundColor: '#0f172a',
                    titleColor: '#ffffff',
                    bodyColor: '#e2e8f0',
                    padding: 10,
                    cornerRadius: 8
                }
            },
            scales: {
                x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 12, weight: '600' } } },
                y: {
                    beginAtZero: true,
                    suggestedMax: maxY || undefined,
                    max: maxY || undefined,
                    ticks: { color: '#94a3b8', stepSize: maxY ? 25 : undefined, callback: (v) => maxY ? `${v}%` : v },
                    grid: { color: 'rgba(148, 163, 184, 0.25)', drawBorder: false }
                }
            }
        }
    });
}

function renderLineChart(canvas, emptyEl, instance, data) {
    if (!canvas || !window.Chart) return null;
    const max = Math.max(...data, 0);
    if (max === 0) {
        if (emptyEl) emptyEl.style.display = 'grid';
        if (instance) instance.destroy();
        return null;
    }
    if (emptyEl) emptyEl.style.display = 'none';
    if (instance) instance.destroy();
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height || 240);
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.35)');
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0.02)');
    const labels = data.map((_, idx) => `${idx + 1}`);
    return new Chart(canvas, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    data,
                    borderColor: '#10b981',
                    backgroundColor: gradient,
                    fill: true,
                    tension: 0.35,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#10b981',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: { padding: { top: 8, right: 12, left: 8, bottom: 6 } },
            plugins: {
                legend: { display: false },
                tooltip: {
                    enabled: true,
                    displayColors: false,
                    backgroundColor: '#0f172a',
                    titleColor: '#ffffff',
                    bodyColor: '#e2e8f0',
                    padding: 10,
                    cornerRadius: 8
                }
            },
            scales: {
                x: { grid: { color: 'rgba(148, 163, 184, 0.2)' }, ticks: { color: '#94a3b8', font: { size: 11 } } },
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: { color: '#94a3b8', stepSize: 25, callback: (v) => `${v}%` },
                    grid: { color: 'rgba(148, 163, 184, 0.25)', drawBorder: false }
                }
            }
        }
    });
}

function ensureSerieForToday(porcentaje) {
    const serie = getAdherenciaSerie();
    const hoy = new Date().toLocaleDateString();
    const idx = serie.findIndex(d => d.fecha === hoy);
    if (idx >= 0) {
        serie[idx].porcentaje = porcentaje;
    } else {
        serie.push({ fecha: hoy, porcentaje });
    }
    setAdherenciaSerie(serie.slice(-30));
    return serie;
}
