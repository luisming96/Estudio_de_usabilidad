import { getActiveUserName } from './core.js';

const MAX_ENTRIES = 30;
const DEFAULT_DAYS = 7;

let sleepChart = null;
let stepsChart = null;
let painChart = null;

export function initSalud() {
    const hasForm = !!document.getElementById('healthForm');
    const hasCharts = !!document.getElementById('healthSleepChart');
    if (!hasForm && !hasCharts) return;

    let data = loadHealthData();
    if (!data.length) {
        data = seedHealthData();
        saveHealthData(data);
    }

    renderHealth(data);
    initHealthTips();

    const form = document.getElementById('healthForm');
    if (form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const sleepHours = parseFloat(document.getElementById('sleepHours').value);
            const sleepQuality = parseInt(document.getElementById('sleepQuality').value, 10);
            const pain = parseInt(document.getElementById('painLevel').value, 10);
            const steps = parseInt(document.getElementById('stepCount').value, 10);

            if (!isFiniteNumber(sleepHours) || sleepHours < 0 || sleepHours > 14) {
                alert('Ingresa horas de sueno entre 0 y 14.');
                return;
            }
            if (!isFiniteNumber(sleepQuality) || sleepQuality < 1 || sleepQuality > 5) {
                alert('Selecciona una calidad de sueno valida.');
                return;
            }
            if (!isFiniteNumber(pain) || pain < 0 || pain > 10) {
                alert('Ingresa un nivel de dolor entre 0 y 10.');
                return;
            }
            if (!isFiniteNumber(steps) || steps < 0) {
                alert('Ingresa un numero de pasos valido.');
                return;
            }

            const entry = buildEntry(new Date(), sleepHours, sleepQuality, pain, steps);
            const updated = upsertEntry(loadHealthData(), entry);
            saveHealthData(updated);
            renderHealth(updated);
        });
    }
}

function renderHealth(data) {
    const normalized = normalizeEntries(data).sort((a, b) => a.ts - b.ts);
    const lastEntries = normalized.slice(-7);

    updateSummary(lastEntries);
    updateCharts(lastEntries);
    fillForm(lastEntries[lastEntries.length - 1]);
}

function updateSummary(entries) {
    const sleepAvg = average(entries.map(e => e.sleepHours));
    const painAvg = average(entries.map(e => e.pain));
    const stepsAvg = Math.round(average(entries.map(e => e.steps)));
    const latest = entries[entries.length - 1];
    const balanceScore = latest ? getBalanceScore(latest) : 0;

    const sleepEl = document.getElementById('healthAvgSleep');
    const painEl = document.getElementById('healthAvgPain');
    const stepsEl = document.getElementById('healthAvgSteps');

    if (sleepEl) sleepEl.innerText = `${sleepAvg.toFixed(1)} h`;
    if (painEl) painEl.innerText = `${painAvg.toFixed(1)} / 10`;
    if (stepsEl) stepsEl.innerText = `${stepsAvg} pasos`;

    const balanceEl = document.getElementById('healthBalanceScore');
    const balanceBar = document.getElementById('healthBalanceBar');
    if (balanceEl) balanceEl.innerText = `${balanceScore}`;
    if (balanceBar) balanceBar.style.width = `${balanceScore}%`;
}

function updateCharts(entries) {
    if (!window.Chart) return;

    const labels = entries.map(e => new Date(e.ts).toLocaleDateString('es-ES', { weekday: 'short' }));
    const sleepData = entries.map(e => e.sleepHours);
    const stepsData = entries.map(e => e.steps);
    const painData = entries.map(e => e.pain);

    const sleepCanvas = document.getElementById('healthSleepChart');
    const stepsCanvas = document.getElementById('healthStepsChart');
    const painCanvas = document.getElementById('healthPainChart');

    sleepChart = renderLineChart(sleepCanvas, document.getElementById('healthSleepEmpty'), sleepChart, labels, sleepData, '#0ea5e9');
    stepsChart = renderBarChart(stepsCanvas, document.getElementById('healthStepsEmpty'), stepsChart, labels, stepsData, '#22c55e');
    painChart = renderAreaChart(painCanvas, document.getElementById('healthPainEmpty'), painChart, labels, painData, '#f87171');
}

function renderLineChart(canvas, emptyEl, instance, labels, data, color) {
    if (!canvas) return null;
    if (!hasValues(data)) return clearChart(instance, emptyEl);
    showChart(emptyEl);
    if (instance) instance.destroy();

    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height || 220);
    gradient.addColorStop(0, hexToRgba(color, 0.35));
    gradient.addColorStop(1, hexToRgba(color, 0.05));

    return new Chart(canvas, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    data,
                    borderColor: color,
                    backgroundColor: gradient,
                    fill: true,
                    tension: 0.35,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: color,
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2
                }
            ]
        },
        options: baseLineOptions({ max: 12, suffix: ' h' })
    });
}

function renderAreaChart(canvas, emptyEl, instance, labels, data, color) {
    if (!canvas) return null;
    if (!hasValues(data)) return clearChart(instance, emptyEl);
    showChart(emptyEl);
    if (instance) instance.destroy();

    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height || 220);
    gradient.addColorStop(0, hexToRgba(color, 0.35));
    gradient.addColorStop(1, hexToRgba(color, 0.06));

    return new Chart(canvas, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    data,
                    borderColor: color,
                    backgroundColor: gradient,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: color,
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2
                }
            ]
        },
        options: baseLineOptions({ max: 10, suffix: '' })
    });
}

function renderBarChart(canvas, emptyEl, instance, labels, data, color) {
    if (!canvas) return null;
    if (!hasValues(data)) return clearChart(instance, emptyEl);
    showChart(emptyEl);
    if (instance) instance.destroy();

    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height || 220);
    gradient.addColorStop(0, hexToRgba(color, 0.8));
    gradient.addColorStop(1, hexToRgba(color, 0.25));

    return new Chart(canvas, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    data,
                    backgroundColor: gradient,
                    borderColor: color,
                    borderWidth: 1,
                    borderRadius: 12,
                    borderSkipped: false
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
                x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 12, weight: '600' } } },
                y: {
                    beginAtZero: true,
                    ticks: { color: '#94a3b8' },
                    grid: { color: 'rgba(148, 163, 184, 0.25)', drawBorder: false }
                }
            }
        }
    });
}


function baseLineOptions({ max, suffix }) {
    return {
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
                max,
                ticks: { color: '#94a3b8', stepSize: max ? Math.round(max / 4) : undefined, callback: (v) => `${v}${suffix}` },
                grid: { color: 'rgba(148, 163, 184, 0.25)', drawBorder: false }
            }
        }
    };
}

function getBalanceScore(entry) {
    const sleepScore = getSleepScore(entry.sleepHours, entry.sleepQuality);
    const stepsScore = Math.min(100, Math.round((entry.steps / 8000) * 100));
    const painScore = Math.max(0, 100 - Math.round((entry.pain / 10) * 100));
    return Math.round((sleepScore + stepsScore + painScore) / 3);
}

function initHealthTips() {
    const textEl = document.getElementById('healthTipText');
    const authorEl = document.getElementById('healthTipAuthor');
    const btn = document.getElementById('healthTipReload');
    if (!textEl) return;

    const fallback = [
        'Toma agua de forma regular durante el dia para mantener energia estable.',
        'Duerme a la misma hora cada noche para mejorar la recuperacion.',
        'Da un paseo corto despues de comer para activar la circulacion.',
        'Respira profundo 2 minutos cuando notes estres o tension.',
        'Reduce la cafeina por la tarde para descansar mejor.'
    ];

    const renderTip = (tip, author) => {
        textEl.innerText = tip;
        if (authorEl) authorEl.innerText = author ? `Fuente: ${author}` : '';
    };

    const loadTip = async () => {
        renderTip('Cargando consejo...', '');
        try {
            const response = await fetch('https://api.quotable.io/random?tags=health|inspirational');
            if (!response.ok) throw new Error('Tip no disponible');
            const data = await response.json();
            if (!data || !data.content) throw new Error('Tip vacio');
            renderTip(data.content, data.author || 'Quotable');
        } catch (error) {
            const tip = fallback[Math.floor(Math.random() * fallback.length)];
            renderTip(tip, 'VitaClick');
        }
    };

    if (btn) btn.addEventListener('click', loadTip);
    loadTip();
}


function getSleepScore(hours, quality) {
    const diff = Math.abs(hours - 8);
    const hoursScore = Math.max(0, 100 - Math.round(diff * 20));
    const qualityScore = Math.max(20, Math.min(100, quality * 20));
    return Math.round(hoursScore * 0.6 + qualityScore * 0.4);
}

function fillForm(entry) {
    if (!entry) return;
    const sleepHours = document.getElementById('sleepHours');
    const sleepQuality = document.getElementById('sleepQuality');
    const painLevel = document.getElementById('painLevel');
    const stepCount = document.getElementById('stepCount');

    if (sleepHours) sleepHours.value = entry.sleepHours;
    if (sleepQuality) sleepQuality.value = entry.sleepQuality;
    if (painLevel) painLevel.value = entry.pain;
    if (stepCount) stepCount.value = entry.steps;
}

function loadHealthData() {
    const key = 'vitaHealthByUser';
    const all = JSON.parse(localStorage.getItem(key)) || {};
    const user = getActiveUserName();
    return all[user] || [];
}

function saveHealthData(data) {
    const key = 'vitaHealthByUser';
    const all = JSON.parse(localStorage.getItem(key)) || {};
    const user = getActiveUserName();
    all[user] = data.slice(-MAX_ENTRIES);
    localStorage.setItem(key, JSON.stringify(all));
}

function seedHealthData() {
    const data = [];
    for (let i = DEFAULT_DAYS - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const sleepHours = 6.5 + ((i + 1) % 3) * 0.6;
        const sleepQuality = 3 + (i % 3);
        const pain = Math.max(0, 4 - (i % 4));
        const steps = 4200 + (DEFAULT_DAYS - 1 - i) * 700;
        data.push(buildEntry(date, sleepHours, sleepQuality, pain, steps));
    }
    return data;
}

function buildEntry(date, sleepHours, sleepQuality, pain, steps) {
    return {
        fecha: date.toLocaleDateString(),
        iso: date.toISOString().slice(0, 10),
        ts: date.getTime(),
        sleepHours,
        sleepQuality,
        pain,
        steps
    };
}

function upsertEntry(data, entry) {
    const normalized = normalizeEntries(data);
    const idx = normalized.findIndex((item) => item.iso === entry.iso);
    if (idx >= 0) {
        normalized[idx] = entry;
    } else {
        normalized.push(entry);
    }
    return normalized.sort((a, b) => a.ts - b.ts).slice(-MAX_ENTRIES);
}

function normalizeEntries(entries) {
    return entries.map((entry) => {
        if (!entry.ts) {
            const parsed = entry.iso ? new Date(entry.iso) : new Date(entry.fecha);
            entry.ts = parsed.getTime() || Date.now();
        }
        if (!entry.iso) {
            entry.iso = new Date(entry.ts).toISOString().slice(0, 10);
        }
        return {
            ...entry,
            sleepHours: Number(entry.sleepHours) || 0,
            sleepQuality: Number(entry.sleepQuality) || 0,
            pain: Number(entry.pain) || 0,
            steps: Number(entry.steps) || 0
        };
    });
}

function average(values) {
    if (!values.length) return 0;
    const total = values.reduce((acc, value) => acc + value, 0);
    return total / values.length;
}

function hasValues(values) {
    return values.some((value) => value > 0);
}

function clearChart(instance, emptyEl) {
    if (emptyEl) emptyEl.style.display = 'grid';
    if (instance) instance.destroy();
    return null;
}

function showChart(emptyEl) {
    if (emptyEl) emptyEl.style.display = 'none';
}

function isFiniteNumber(value) {
    return typeof value === 'number' && Number.isFinite(value);
}

function hexToRgba(hex, alpha) {
    const value = hex.replace('#', '');
    const bigint = parseInt(value, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

