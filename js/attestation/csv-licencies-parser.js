/**
 * Parser CSV spécifique aux licenciés du club.
 * Séparateur : point-virgule (;)
 * Gestion robuste des guillemets parasites ou non appariés (ex: DUBOIS").
 */

/**
 * Découpe une ligne CSV de manière robuste en tenant compte des guillemets,
 * sans se laisser piéger par des guillemets isolés ou parasites.
 * @param {string} ligne - Ligne brute du CSV
 * @returns {string[]} Tableau des valeurs nettoyées
 */
function decouperLigneRobuste(ligne) {
  const resultat = [];
  let courant = '';
  let dansGuillemets = false;

  for (let i = 0; i < ligne.length; i++) {
    const c = ligne[i];

    if (c === '"') {
      if (!dansGuillemets) {
        // Un guillemet n'ouvre une section que s'il se trouve en début de valeur
        if (courant.trim() === '') {
          dansGuillemets = true;
          continue;
        } else {
          // Guillemet parasite dans le texte (ex: DUBOIS")
          courant += c;
        }
      } else {
        // Dans des guillemets : vérifier l'échappement par double guillemet ""
        if (i + 1 < ligne.length && ligne[i + 1] === '"') {
          courant += '"';
          i++;
        } else {
          // Fin normale du champ entre guillemets
          dansGuillemets = false;
        }
      }
    } else if (c === ';' && !dansGuillemets) {
      resultat.push(nettoyerValeur(courant));
      courant = '';
    } else {
      courant += c;
    }
  }

  resultat.push(nettoyerValeur(courant));
  return resultat;
}

/**
 * Nettoie une valeur : supprime les espaces et guillemets superflus aux extrémités.
 * @param {string} valeur - Valeur brute
 * @returns {string} Valeur nettoyée
 */
function nettoyerValeur(valeur) {
  if (!valeur) return '';
  return valeur.trim().replace(/^"+|"+$/g, '').trim();
}

/**
 * Construit l'adresse complète à partir des champs du licencié.
 * Combine rue, num_appt (si présent), residence (si présent),
 * lieu_dit (si présent), CP et ville.
 * @param {Object} licencie - Objet licencié parsé
 * @returns {string} Adresse complète formatée
 */
function construireAdresseComplete(licencie) {
  const partiesRue = [
    licencie.rue,
    licencie.numAppt ? `Appt ${licencie.numAppt}` : '',
    licencie.residence,
    licencie.lieuDit,
  ].filter(Boolean);

  const ligneAdresse = partiesRue.join(', ');
  const codePostalVille = [licencie.codePostal, licencie.ville]
    .filter(Boolean)
    .join(' ');

  return [ligneAdresse, codePostalVille].filter(Boolean).join(', ');
}

/**
 * Parse le contenu texte d'un CSV de licenciés.
 * @param {string} contenuTexte - Contenu brut du fichier CSV
 * @returns {Object[]} Tableau d'objets licenciés normalisés
 */
export function parserCsvLicencies(contenuTexte) {
  const lignes = contenuTexte.split('\n').filter(l => l.trim() !== '');
  if (lignes.length < 2) return [];

  // Découper l'en-tête et normaliser les noms de colonnes
  const entetes = decouperLigneRobuste(lignes[0]).map(e => e.toLowerCase());

  // Détection des index de colonnes principales
  const indexNom = entetes.indexOf('nom');
  const indexPrenom = entetes.indexOf('prenom');
  const indexSexe = entetes.indexOf('sexe');
  const indexDateNaissance = entetes.findIndex(e => e.includes('né') || e.includes('naissance'));
  const indexEmail = entetes.indexOf('email');
  const indexRue = entetes.indexOf('rue');
  const indexCP = entetes.indexOf('cp');
  const indexVille = entetes.indexOf('ville');
  const indexNumAppt = entetes.indexOf('num_appt');
  const indexResidence = entetes.indexOf('residence');
  const indexLieuDit = entetes.indexOf('lieu_dit');
  const indexPaiement = entetes.indexOf('paiement_effectue');

  return lignes.slice(1).map(ligne => {
    const valeurs = decouperLigneRobuste(ligne);

    const nom = (valeurs[indexNom !== -1 ? indexNom : 1] || '').trim();
    const prenom = (valeurs[indexPrenom !== -1 ? indexPrenom : 2] || '').trim();
    const sexe = (valeurs[indexSexe !== -1 ? indexSexe : 3] || '').trim();
    const dateNaissance = (valeurs[indexDateNaissance !== -1 ? indexDateNaissance : 6] || '').trim();
    const email = (valeurs[indexEmail !== -1 ? indexEmail : 7] || '').trim();
    const rue = (valeurs[indexRue !== -1 ? indexRue : 8] || '').trim();
    const codePostal = (valeurs[indexCP !== -1 ? indexCP : 10] || '').trim();
    const ville = (valeurs[indexVille !== -1 ? indexVille : 11] || '').trim();
    const numAppt = indexNumAppt !== -1 ? (valeurs[indexNumAppt] || '').trim() : '';
    const residence = indexResidence !== -1 ? (valeurs[indexResidence] || '').trim() : '';
    const lieuDit = indexLieuDit !== -1 ? (valeurs[indexLieuDit] || '').trim() : '';

    // Détection paiement effectué
    let paiementEffectue = '';
    if (indexPaiement !== -1 && valeurs[indexPaiement]) {
      const v = valeurs[indexPaiement].toUpperCase();
      if (v === 'OUI' || v === 'NON') {
        paiementEffectue = v;
      }
    }
    // Fallback : recherche d'une cellule contenant OUI ou NON
    if (!paiementEffectue) {
      const ouiOuNon = valeurs.find(v => v.toUpperCase() === 'OUI' || v.toUpperCase() === 'NON');
      if (ouiOuNon) {
        paiementEffectue = ouiOuNon.toUpperCase();
      }
    }

    const licencie = {
      nom,
      prenom,
      sexe,
      dateNaissance,
      email,
      rue,
      codePostal,
      ville,
      numAppt,
      residence,
      lieuDit,
      paiementEffectue,
    };

    licencie.adresseComplete = construireAdresseComplete(licencie);

    return licencie;
  });
}
