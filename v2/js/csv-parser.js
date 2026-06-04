import { DataExtractor } from './data-extractor.js';

export const CsvParser = {

  init(onImportSuccess) {
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('file-input');

    dropzone.addEventListener('dragover', e => {
      e.preventDefault();
      dropzone.classList.add('drag-over');
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('drag-over');
    });

    dropzone.addEventListener('drop', e => {
      e.preventDefault();
      dropzone.classList.remove('drag-over');
      this.handleFiles(e.dataTransfer.files, onImportSuccess);
    });

    fileInput.addEventListener('change', e => {
      this.handleFiles(e.target.files, onImportSuccess);
    });
  },

  handleFiles(files, onImportSuccess) {
    const valides = Array.from(files).filter(f =>
      f.type === 'text/csv' || f.name.endsWith('.csv') || f.name.endsWith('.txt')
    );

    if (valides.length === 0) return;

    DataExtractor.reset();

    const lectures = valides.map(file => new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => {
        const lignes = this.parse(e.target.result);
        const type   = this.detectType(lignes);
        DataExtractor.addFichier({ type, lignes });
        resolve();
      };
      reader.readAsText(file, 'ISO-8859-1');
    }));

    Promise.all(lectures).then(() => {
      onImportSuccess(DataExtractor.getSemaines());
    });
  },

  parse(contenu) {
    const lignes = contenu.split('\n').filter(l => l.trim() !== '');
    if (lignes.length < 2) return [];

    const entetes = this.splitLigne(lignes[0]).map(e => e.trim());

    return lignes.slice(1).map(ligne => {
      const valeurs = this.splitLigne(ligne);
      const obj = {};
      entetes.forEach((col, i) => {
        obj[col] = (valeurs[i] || '').trim();
      });
      return obj;
    });
  },

  // Découpe une ligne CSV en tenant compte des guillemets
  splitLigne(ligne) {
    const result = [];
    let courant = '';
    let dansGuillemets = false;

    for (let i = 0; i < ligne.length; i++) {
      const c = ligne[i];
      if (c === '"') {
        dansGuillemets = !dansGuillemets;
      } else if (c === ';' && !dansGuillemets) {
        result.push(courant);
        courant = '';
      } else {
        courant += c;
      }
    }
    result.push(courant);
    return result;
  },

  detectType(lignes) {
    if (lignes.length === 0) return 'programme';
    const cols = Object.keys(lignes[0]);
    return cols.some(c => c.toLowerCase().includes('sc rec') || c.toLowerCase().includes('fdme'))
      ? 'resultat'
      : 'programme';
  },

};
