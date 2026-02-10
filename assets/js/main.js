import { state, initSkinSelector, initNavActive, initAuth, initActions, initFarmacias, setRol, enforceRoleAccess, loadMedsForUser } from './core.js';
import { initPatientUI, toggleMed, delMed, updateHomeHero } from './patient.js';
import { initMedico } from './doctor.js';
import { initFarmaceutico } from './pharmacy.js';
import { initAnalisis } from './analysis.js';
import { initAlertas } from './alerts.js';
import { initSalud } from './health.js';

window.toggleMed = toggleMed;
window.delMed = delMed;

document.addEventListener('DOMContentLoaded', () => {
    if (!enforceRoleAccess()) return;

    initSkinSelector();
    setRol(state.rolActual, { redirect: false });
    initNavActive();
    initAuth();

    loadMedsForUser();

    initPatientUI();
    updateHomeHero();
    initMedico();
    initFarmaceutico();
    initAnalisis();
    initSalud();
    initFarmacias();
    initActions();
    initAlertas();

    window.addEventListener('storage', (event) => {
        if (!event || !event.key) return;
        if (event.key.startsWith('vita')) {
            initPatientUI();
            updateHomeHero();
            initAnalisis();
            initAlertas();
            initMedico();
            initFarmaceutico();
            if (event.key.startsWith('vitaHealth')) initSalud();
        }
    });
});
