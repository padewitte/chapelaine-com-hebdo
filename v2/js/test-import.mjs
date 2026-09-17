// Contrôle d'import : node v2/js/test-import.mjs <fichier.csv…>
// Vérifie qu'un derby exporté par les deux clubs n'apparaît qu'une fois et que
// l'adversaire affiché n'est jamais notre propre équipe de la poule.
import assert from 'node:assert';
import fs from 'node:fs';
import { CsvParser } from './csv-parser.js';
import { DataExtractor } from './data-extractor.js';
import { DataCleaner } from './data-cleaner.js';
import { CLUBS } from './competitions.js';

// Un fragment de CLUBS l'emporte où qu'il soit dans le nom ; sans fragment,
// les règles de nettoyage s'appliquent.
const [cle, valeur] = Object.entries(CLUBS)[0];
assert.strictEqual(DataCleaner.cleanNomEquipe(`U11M44C - ${cle} 2`), valeur);
assert.strictEqual(DataCleaner.cleanNomEquipe('PORTERIE HANDBALL'), 'Porterie');
assert.strictEqual(DataCleaner.cleanNomEquipe('LA FLECHE HANDBALL'), 'La Fleche');

const fichiers = process.argv.slice(2);
assert(fichiers.length, 'usage: node test-import.mjs <fichier.csv…>');
fichiers.forEach(f => DataExtractor.addFichier({
  type: 'match',
  lignes: CsvParser.parse(fs.readFileSync(f, 'utf8').replace(/^﻿/, '')),
}));

let n = 0;
for (const semaine of DataExtractor.getSemaines()) {
  const matchs = DataExtractor.getMatchsParSemaine(semaine);
  // Les tournois de détection n'ont ni horaire ni adversaire : rien à dédoublonner.
  const cles = matchs.filter(m => m.adversaire && m.horaire)
                     .map(m => `${m.dateISO} ${m.horaire} ${m.poule} ${m.adversaire}`);
  assert.deepStrictEqual([...new Set(cles)], cles, `doublon en ${semaine} : ${cles}`);
  matchs.forEach(m => assert.notStrictEqual(m.poule, m.adversaire, `${semaine} : adversaire = nous`));
  if (semaine === '2026-40') {
    // Derby La Chapelaine 2 / Porterie : exporté par les deux clubs, une seule
    // ligne attendue, l'adversaire étant l'autre équipe et non la nôtre.
    // ponytail: les deux équipes partagent la poule Z624470051, donc le même nom
    // court ; c'est l'ordre d'import qui décide laquelle est "nous".
    const derby = matchs.filter(m => m.poule === 'U11M-2');
    assert.strictEqual(derby.length, 1, 'derby U11M-2 en double');
    assert.match(derby[0].adversaire, /^(Porterie|La Chapelaine 2)$/, derby[0].adversaire);
  }
  n += matchs.length;
}
console.log(`ok — ${n} matchs, ${DataExtractor.getSemaines().length} semaines`);
