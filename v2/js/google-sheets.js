import { GOOGLE_CONFIG } from './google-config.js';

let accessToken = null;

// Couleurs des gymnases (valeurs 0-1 pour l'API Sheets)
const COULEURS = {
  coutanciere: { red: 0.24, green: 0.60, blue: 0.19 },
  jahan:       { red: 1.00, green: 0.47, blue: 0.16 },
  exterieur:   { red: 0.55, green: 0.56, blue: 0.56 },
};

const COULEUR_HEADER   = { red: 0.18, green: 0.20, blue: 0.25 };
const COULEUR_JOUR     = { red: 0.93, green: 0.93, blue: 0.93 };
const BLANC            = { red: 1,    green: 1,    blue: 1    };
const COULEUR_DESIGNE  = { red: 0.80, green: 0.90, blue: 1.00 }; // bleu clair
const COULEUR_MINEUR   = { red: 1.00, green: 0.95, blue: 0.80 }; // jaune pâle

export const GoogleSheets = {

  authentifier() {
    return new Promise((resolve, reject) => {
      if (accessToken) { resolve(accessToken); return; }
      if (typeof google === 'undefined') { reject(new Error('Google Identity Services non chargé')); return; }
      const client = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CONFIG.clientId,
        scope:     GOOGLE_CONFIG.scope,
        callback:  (response) => {
          if (response.error) { reject(response); return; }
          accessToken = response.access_token;
          resolve(accessToken);
        },
      });
      client.requestAccessToken();
    });
  },

  async exporter(matchsParSalle, semaine) {
    const token      = await this.authentifier();
    const nomFeuille = this.nomFeuille(matchsParSalle, semaine);
    const sheetId    = await this.creerOuViderFeuille(token, nomFeuille);

    const { lignes, meta } = this.formaterLignes(matchsParSalle);
    await this.ecrire(token, nomFeuille, lignes);
    await this.styliser(token, sheetId, meta);
  },

  nomFeuille(matchsParSalle, semaine) {
    const tous  = Object.values(matchsParSalle).flat();
    const dates = [...new Set(tous.map(m => m.dateISO))].sort();
    const fmt   = iso => { const [,m,j] = iso.split('-'); return `${parseInt(j)}/${parseInt(m)}`; };
    const sNum  = semaine.split('-')[1];
    if (dates.length === 0) return `S${sNum}`;
    if (dates.length === 1) return `S${sNum} — ${fmt(dates[0])}`;
    return `S${sNum} — ${fmt(dates[0])} & ${fmt(dates[dates.length - 1])}`;
  },

  // Retourne les lignes + métadonnées de chaque ligne pour le style
  formaterLignes(matchsParSalle) {
    const lignes = [];
    const meta   = [];

    // Légende en haut, sur une seule ligne
    lignes.push(['LÉGENDE', 'Arbitre désigné (D)', 'Suivi requis (< U19)']);
    meta.push({ type: 'legende-ligne', salle: null });
    lignes.push([]);
    meta.push({ type: 'empty', salle: null });

    const salles = [
      { key: 'coutanciere', nom: 'COUTANCIÈRE', domicile: true  },
      { key: 'jahan',       nom: 'JEAN JAHAN',  domicile: true  },
      { key: 'exterieur',   nom: 'EXTÉRIEUR',    domicile: false },
    ];

    for (const { key, nom, domicile } of salles) {
      const matchs = matchsParSalle[key] || [];
      if (matchs.length === 0) continue;

      // Séparation entre gymnases (sauf avant le premier)
      if (lignes.length > 0) {
        lignes.push([], []);
        meta.push({ type: 'empty', salle: key }, { type: 'empty', salle: key });
      }

      // Titre gymnase
      lignes.push([nom]);
      meta.push({ type: 'section', salle: key });

      const entetes = domicile
        ? ['Horaire', 'Équipe', 'Adversaire', 'Table', 'Arbitrage', 'Arb. backup', 'Suivi', 'Resp. Salle', 'Animation']
        : ['Horaire', 'Club hôte', 'Équipe', 'Gymnase'];

      const tries = [...matchs].sort((a, b) =>
        a.dateISO.localeCompare(b.dateISO) || a.horaire.localeCompare(b.horaire)
      );

      // Grouper par jour
      const parJour = new Map();
      tries.forEach(m => {
        if (!parJour.has(m.dateISO)) parJour.set(m.dateISO, { label: m.jour, matchs: [] });
        parJour.get(m.dateISO).matchs.push(m);
      });

      // Pour chaque jour : date → en-têtes → matchs
      parJour.forEach(({ label, matchs: matchsDuJour }) => {
        lignes.push([label]);
        meta.push({ type: 'jour', salle: key });

        lignes.push(entetes);
        meta.push({ type: 'header', salle: key });

        matchsDuJour.forEach(m => {
          if (domicile) {
            const arb = [m.arb1, m.arb2].filter(Boolean).join(' / ');
            lignes.push([m.horaire, m.poule, m.equipe_ext, m._table || '', arb ? `(D) ${arb}` : '', '', '', '', '']);
            meta.push({ type: 'data', salle: key, estMineur: this.estMineur(m.poule), aArbitre: !!arb });
          } else {
            lignes.push([m.horaire, m.club_hote, m.poule, m.nom_salle]);
            meta.push({ type: 'data', salle: key, estMineur: false, aArbitre: false });
          }
        });

        lignes.push([]);
        meta.push({ type: 'empty', salle: key });
      });

    }


    return { lignes, meta };
  },

  estMineur(poule) {
    const match = (poule || '').match(/U(\d+)/i);
    if (!match) return false;
    return parseInt(match[1]) < 19;
  },

  async creerOuViderFeuille(token, nomFeuille) {
    const baseUrl = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_CONFIG.spreadsheetId}`;
    const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

    const meta   = await fetch(baseUrl, { headers }).then(r => r.json());
    const feuille = meta.sheets?.find(s => s.properties.title === nomFeuille);

    if (feuille) {
      await fetch(`${baseUrl}/values/${encodeURIComponent(nomFeuille)}!A1:Z1000:clear`, { method: 'POST', headers });
      return feuille.properties.sheetId;
    } else {
      const r    = await fetch(`${baseUrl}:batchUpdate`, {
        method: 'POST', headers,
        body: JSON.stringify({ requests: [{ addSheet: { properties: { title: nomFeuille } } }] }),
      });
      const json = await r.json();
      return json.replies[0].addSheet.properties.sheetId;
    }
  },

  async ecrire(token, nomFeuille, lignes) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_CONFIG.spreadsheetId}/values/${encodeURIComponent(nomFeuille)}!A1?valueInputOption=RAW`;
    const r   = await fetch(url, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: lignes }),
    });
    if (!r.ok) { const e = await r.json(); throw new Error(e.error?.message); }
  },

  async styliser(token, sheetId, meta) {
    const requests = [];

    meta.forEach(({ type, salle }, i) => {
      const range = { sheetId, startRowIndex: i, endRowIndex: i + 1, startColumnIndex: 0, endColumnIndex: 9 };

      if (type === 'section') {
        const bg = COULEURS[salle];
        requests.push({
          repeatCell: {
            range,
            cell: {
              userEnteredFormat: {
                backgroundColor: bg,
                textFormat: { bold: true, fontSize: 12, foregroundColor: BLANC },
              },
            },
            fields: 'userEnteredFormat(backgroundColor,textFormat)',
          },
        });
      }

      if (type === 'header') {
        requests.push({
          repeatCell: {
            range,
            cell: {
              userEnteredFormat: {
                backgroundColor: COULEUR_HEADER,
                textFormat: { bold: true, foregroundColor: BLANC },
              },
            },
            fields: 'userEnteredFormat(backgroundColor,textFormat)',
          },
        });
      }

      if (type === 'jour') {
        requests.push({
          repeatCell: {
            range,
            cell: {
              userEnteredFormat: {
                backgroundColor: COULEUR_JOUR,
                textFormat: { bold: true, italic: true },
              },
            },
            fields: 'userEnteredFormat(backgroundColor,textFormat)',
          },
        });
      }

      // Arbitre désigné → colonne E (index 4) en bleu clair
      if (type === 'data' && meta[i].aArbitre) {
        requests.push({
          repeatCell: {
            range: { ...range, startColumnIndex: 4, endColumnIndex: 5 },
            cell: { userEnteredFormat: { backgroundColor: COULEUR_DESIGNE } },
            fields: 'userEnteredFormat(backgroundColor)',
          },
        });
      }

      // Catégorie mineure → Table (col D) toujours en jaune, Arbitrage (col E) seulement si vide
      if (type === 'data' && meta[i].estMineur) {
        // Table toujours
        requests.push({
          repeatCell: {
            range: { ...range, startColumnIndex: 3, endColumnIndex: 4 },
            cell: { userEnteredFormat: { backgroundColor: COULEUR_MINEUR } },
            fields: 'userEnteredFormat(backgroundColor)',
          },
        });
        // Arbitrage seulement si pas de désigné (sinon déjà bleu)
        if (!meta[i].aArbitre) {
          requests.push({
            repeatCell: {
              range: { ...range, startColumnIndex: 4, endColumnIndex: 5 },
              cell: { userEnteredFormat: { backgroundColor: COULEUR_MINEUR } },
              fields: 'userEnteredFormat(backgroundColor)',
            },
          });
        }
      }

      // Légende horizontale
      if (type === 'legende-ligne') {
        // "LÉGENDE" en gras (col A)
        requests.push({
          repeatCell: {
            range: { ...range, startColumnIndex: 0, endColumnIndex: 1 },
            cell: { userEnteredFormat: { textFormat: { bold: true } } },
            fields: 'userEnteredFormat(textFormat)',
          },
        });
        // Col B → bleu (arbitre désigné)
        requests.push({
          repeatCell: {
            range: { ...range, startColumnIndex: 1, endColumnIndex: 2 },
            cell: { userEnteredFormat: { backgroundColor: COULEUR_DESIGNE } },
            fields: 'userEnteredFormat(backgroundColor)',
          },
        });
        // Col C → jaune (mineur)
        requests.push({
          repeatCell: {
            range: { ...range, startColumnIndex: 2, endColumnIndex: 3 },
            cell: { userEnteredFormat: { backgroundColor: COULEUR_MINEUR } },
            fields: 'userEnteredFormat(backgroundColor)',
          },
        });
      }
    });

    // Auto-resize colonnes A-D (contenu variable)
    requests.push({
      autoResizeDimensions: {
        dimensions: { sheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: 4 },
      },
    });

    // Largeur fixe pour les colonnes bénévoles E-I (Table, Arbitrage, Arb. backup, Suivi, Resp. Salle, Animation)
    requests.push({
      updateDimensionProperties: {
        range: { sheetId, dimension: 'COLUMNS', startIndex: 4, endIndex: 9 },
        properties: { pixelSize: 150 },
        fields: 'pixelSize',
      },
    });

    console.log('[Sheets] styliser sheetId:', sheetId, '| nb requests:', requests.length);
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_CONFIG.spreadsheetId}:batchUpdate`;
    const r   = await fetch(url, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ requests }),
    });
    const json = await r.json();
    console.log('[Sheets] styliser status:', r.status, json?.error || 'OK');
    if (!r.ok) throw new Error(json.error?.message);
  },

};
