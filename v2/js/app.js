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
document.querySelectorAll('.tabs .tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tabs .tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.main-content').forEach(c => c.classList.add('hidden'));
    tab.classList.add('active');
    document.getElementById('main-' + tab.dataset.tab).classList.remove('hidden');
  });
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
document.querySelectorAll('.sub-tab:not(.annonce-day)').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
    tab.classList.add('active');
    document.getElementById('tab-' + tab.dataset.salle).classList.remove('hidden');
  });
});

// Appelé après chaque import CSV
function onImportSuccess(semaines) {
  semaineSelect.innerHTML = '<option value="">— Sélectionner une semaine —</option>';

  semaines.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s;
    opt.textContent = `Semaine ${s.split('-')[1]} — ${s}`;
    semaineSelect.appendChild(opt);
  });

  semaineSelect.disabled = false;

  // Sélectionner automatiquement la première semaine
  semaineSelect.selectedIndex = 1;
  semaineSelect.dispatchEvent(new Event('change'));
}

CsvParser.init(onImportSuccess);
