import { CsvParser } from './csv-parser.js';
import { DataExtractor } from './data-extractor.js';
import { KifekoiRenderer } from './kifekoi-renderer.js';
import { VisuelRenderer } from './visuel-renderer.js';
import { GoogleSheets } from './google-sheets.js';

const semaineSelect = document.getElementById('semaine-select');

let dernierMatchs = [];

semaineSelect.addEventListener('change', () => {
  const semaine = semaineSelect.value;
  if (!semaine) return;

  dernierMatchs = DataExtractor.getMatchsParSemaine(semaine);
  const resultats = DataExtractor.getResultatsParSemaine(semaine);

  KifekoiRenderer.render(dernierMatchs);
  VisuelRenderer.renderAnnonce(dernierMatchs);
  VisuelRenderer.renderResultats(resultats);

  document.getElementById('btn-export-sheets').disabled = dernierMatchs.length === 0;

  // Activer directement le sous-onglet salle qui contient des matchs
  const salleActive = ['coutanciere', 'jahan', 'exterieur']
    .find(salle => dernierMatchs.some(m => m.salle === salle));
  if (salleActive) activerSousOngletSalle(salleActive);

  // Activer directement l'onglet principal correspondant au contenu trouvé
  if (dernierMatchs.length > 0) {
    activerOngletPrincipal('matchs');
  } else if (resultats.length > 0) {
    activerOngletPrincipal('resultats');
  }
});

// Export Google Sheets
document.getElementById('btn-export-sheets').addEventListener('click', async () => {
  const btn = document.getElementById('btn-export-sheets');
  btn.textContent = 'Connexion…';
  btn.disabled = true;

  try {
    const parSalle = {
      coutanciere: dernierMatchs.filter(m => m.salle === 'coutanciere'),
      jahan:       dernierMatchs.filter(m => m.salle === 'jahan'),
      exterieur:   dernierMatchs.filter(m => m.salle === 'exterieur'),
    };
    await GoogleSheets.exporter(parSalle, semaineSelect.value);
    btn.textContent = '✓ Exporté !';
    setTimeout(() => { btn.textContent = 'Exporter vers Google Sheets'; btn.disabled = false; }, 3000);
  } catch (e) {
    console.error(e);
    btn.textContent = '✗ Erreur';
    setTimeout(() => { btn.textContent = 'Exporter vers Google Sheets'; btn.disabled = false; }, 3000);
  }
});

// Onglets principaux
function activerOngletPrincipal(nomOnglet) {
  document.querySelectorAll('.tabs .tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.main-content').forEach(c => c.classList.add('hidden'));
  document.querySelector(`.tabs .tab[data-tab="${nomOnglet}"]`)?.classList.add('active');
  document.getElementById('main-' + nomOnglet).classList.remove('hidden');
}

document.querySelectorAll('.tabs .tab').forEach(tab => {
  tab.addEventListener('click', () => activerOngletPrincipal(tab.dataset.tab));
});

// Sous-onglets jours (annonce)
document.querySelectorAll('.annonce-day').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.annonce-day').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('annonce-samedi').style.display  = tab.dataset.day === 'samedi'   ? '' : 'none';
    document.getElementById('annonce-dimanche').style.display = tab.dataset.day === 'dimanche' ? '' : 'none';
  });
});

// Sous-onglets salles
function activerSousOngletSalle(salle) {
  document.querySelectorAll('.sub-tab:not(.annonce-day)').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
  document.querySelector(`.sub-tab[data-salle="${salle}"]`)?.classList.add('active');
  document.getElementById('tab-' + salle).classList.remove('hidden');
}

document.querySelectorAll('.sub-tab:not(.annonce-day)').forEach(tab => {
  tab.addEventListener('click', () => activerSousOngletSalle(tab.dataset.salle));
});

// Formate une semaine (YYYY-SS) en date du samedi (DD/MM)
function formaterDateSamedi(semaineStr) {
  const [year, week] = semaineStr.split('-').map(Number);
  
  // Calculer le jeudi de la semaine ISO (référence ISO 8601)
  const date = new Date(year, 0, 1 + (week - 1) * 7);
  const dayOfWeek = date.getDay(); // 0=dimanche, 1=lundi, ..., 6=samedi
  const diff = (4 - dayOfWeek + 7) % 7; // Ajustement pour atteindre jeudi
  date.setDate(date.getDate() + diff);
  
  // Ajouter 2 jours pour aller de jeudi à samedi
  date.setDate(date.getDate() + 2);
  
  const jour = String(date.getDate()).padStart(2, '0');
  const mois = String(date.getMonth() + 1).padStart(2, '0');
  return `${jour}/${mois}`;
}

// Retourne la date du samedi pour une semaine donnée
function getSamediDate(semaineStr) {
  const [year, week] = semaineStr.split('-').map(Number);
  const date = new Date(year, 0, 4);
  date.setDate(date.getDate() - date.getDay() + 1);
  date.setDate(date.getDate() + (week - 1) * 7);
  date.setDate(date.getDate() + 5);
  return date;
}

// Appelé après chaque import CSV
function onImportSuccess(semaines) {
  semaineSelect.innerHTML = '<option value="">— Sélectionner une semaine —</option>';

  const aujourdhui = new Date();
  aujourdhui.setHours(0, 0, 0, 0);

  let semainePasseeProche = null;
  let diffMin = Infinity;

  semaines.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s;
    opt.textContent = `Semaine ${s.split('-')[1]} — ${formaterDateSamedi(s)}`;

    const samedi = getSamediDate(s);
    if (samedi < aujourdhui) {
      opt.style.opacity = '0.6';
      const diff = aujourdhui - samedi;
      if (diff < diffMin) {
        diffMin = diff;
        semainePasseeProche = s;
      }
    }

    semaineSelect.appendChild(opt);
  });

  semaineSelect.disabled = false;

  // Sélectionner la semaine passée la plus proche si elle existe, sinon la première
  if (semainePasseeProche) {
    semaineSelect.value = semainePasseeProche;
  } else if (semaines.length > 0) {
    semaineSelect.selectedIndex = 1;
  }
  semaineSelect.dispatchEvent(new Event('change'));
}

CsvParser.init(onImportSuccess);
