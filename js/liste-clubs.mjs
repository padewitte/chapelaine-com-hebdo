// Liste les clubs adverses des exports et leur libellé après nettoyage.
// node v2/js/liste-clubs.mjs <fichier.csv…>  →  clubs-adverses.csv
import fs from 'node:fs';
import { CsvParser } from './csv-parser.js';
import { DataCleaner, estNotreClub } from './data-cleaner.js';

const fichiers = process.argv.slice(2);
if (!fichiers.length) throw new Error('usage: node liste-clubs.mjs <fichier.csv…>');

const clubs = new Map(); // nom brut -> occurrences
fichiers.forEach(f => {
  CsvParser.parse(fs.readFileSync(f, 'utf8').replace(/^﻿/, '')).forEach(l => {
    [l['club rec'], l['club vis']].forEach(nom => {
      if (!nom || estNotreClub(nom)) return;
      clubs.set(nom, (clubs.get(nom) || 0) + 1);
    });
  });
});

const lignes = [...clubs]
  .map(([brut, n]) => [brut, DataCleaner.cleanNomEquipe(brut), n])
  .sort((a, b) => a[1].localeCompare(b[1], 'fr'));

fs.writeFileSync('clubs-adverses.csv',
  'nom brut;nom affiche;occurrences\n' + lignes.map(r => r.join(';')).join('\n') + '\n');
console.log(lignes.map(([b, a, n]) => `${b.padEnd(50)} → ${a.padEnd(40)} (${n})`).join('\n'));
console.log(`\n${lignes.length} clubs adverses → clubs-adverses.csv`);
