export const KifekoiRenderer = {

  render(matchs) {
    this.vider();
    if (!matchs || matchs.length === 0) return;

    const parSalle = {
      coutanciere: matchs.filter(m => m.salle === 'coutanciere'),
      jahan:       matchs.filter(m => m.salle === 'jahan'),
      exterieur:   matchs.filter(m => m.salle === 'exterieur'),
    };

    Object.entries(parSalle).forEach(([salle, liste]) => {
      const container  = document.getElementById(`kifekoi-${salle}`);
      const emptyState = document.getElementById(`empty-${salle}`);

      if (liste.length === 0) {
        emptyState.style.display = '';
        return;
      }

      emptyState.style.display = 'none';
      this.renderSection(liste, container, salle);
    });
  },

  renderSection(matchs, container, salle) {
    // Grouper par jour (clé = dateISO pour le tri, valeur = { label, matchs })
    const parJour = new Map();
    matchs.forEach(m => {
      if (!parJour.has(m.dateISO)) parJour.set(m.dateISO, { label: m.jour, matchs: [] });
      parJour.get(m.dateISO).matchs.push(m);
    });

    // Trier par date calendaire (samedi avant dimanche)
    [...parJour.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([, { label, matchs: matchsDuJour }]) => {
        const bloc = this.creerBloc(label, matchsDuJour, salle);
        container.appendChild(bloc);
      });
  },

  creerBloc(jour, matchs, salle) {
    const bloc = document.createElement('div');
    bloc.className = `kifekoi-block ${salle}`;

    const header = document.createElement('div');
    header.className = 'kifekoi-day';
    header.textContent = this.capitalise(jour);
    bloc.appendChild(header);

    if (salle !== 'exterieur') {
      const venue = document.createElement('div');
      venue.className = 'kifekoi-venue';
      venue.innerHTML = `<span class="venue-dot"></span> ${matchs[0]?.nom_salle || ''}`;
      bloc.appendChild(venue);
    }

    const estDomicile = salle !== 'exterieur';
    bloc.appendChild(this.creerTableau(matchs, estDomicile));

    return bloc;
  },

  creerTableau(matchs, estDomicile) {
    const table = document.createElement('table');
    table.className = 'kifekoi-table';

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const colonnes = estDomicile
      ? ['Horaire', 'Équipe', 'Adversaire', 'Table', 'Arbitrage', 'Arb. backup', 'Suivi', 'Resp. Salle', 'Animation']
      : ['Horaire', 'Club hôte', 'Équipe', 'Gymnase'];

    colonnes.forEach(col => {
      const th = document.createElement('th');
      th.textContent = col;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    const tries = [...matchs].sort((a, b) => a.horaire.localeCompare(b.horaire));
    if (estDomicile) this.assignerTables(tries);
    tries.forEach(m => tbody.appendChild(this.creerLigne(m, estDomicile)));
    table.appendChild(tbody);

    return table;
  },

  creerLigne(match, estDomicile) {
    const tr = document.createElement('tr');

    const cellules = estDomicile ? [
      `<span class="time-badge">${match.horaire}</span>`,
      `<span class="team-home">${match.poule}</span>`,
      `<span class="team-away">${match.equipe_ext}</span>`,
    ] : [
      `<span class="time-badge">${match.horaire}</span>`,
      `<span class="team-home">${match.club_hote}</span>`,
      `<span class="team-away">${match.poule}</span>`,
      `<span class="team-away">${match.nom_salle}</span>`,
    ];

    if (estDomicile) {
      const table = match._table
        ? `<span class="team-away">${match._table}</span>`
        : '<span class="cell-empty">—</span>';
      cellules.push(table);
      cellules.push(this.formatArbitrage(match.arb1, match.arb2));
      for (let i = 0; i < 4; i++) cellules.push('<span class="cell-empty">—</span>');
    }

    cellules.forEach(html => {
      const td = document.createElement('td');
      td.innerHTML = html;
      tr.appendChild(td);
    });

    return tr;
  },

  vider() {
    ['jahan', 'coutanciere', 'exterieur'].forEach(salle => {
      document.getElementById(`kifekoi-${salle}`).innerHTML = '';
    });
  },

  // Convertit "10h30" en minutes (630)
  enMinutes(horaire) {
    const [h, m] = horaire.replace('h', ':').split(':').map(Number);
    return h * 60 + (m || 0);
  },

  // Assigne _table à chaque match selon le match suivant/précédent (écart max 3h)
  assignerTables(matchs) {
    const MAX_ECART = 180; // 3h en minutes

    matchs.forEach((match, i) => {
      const suivant   = matchs[i + 1];
      const precedent = matchs[i - 1];

      const ecartSuivant   = suivant   ? this.enMinutes(suivant.horaire)   - this.enMinutes(match.horaire)   : Infinity;
      const ecartPrecedent = precedent ? this.enMinutes(match.horaire)     - this.enMinutes(precedent.horaire) : Infinity;

      if (suivant && ecartSuivant <= MAX_ECART) {
        match._table = suivant.poule;
      } else if (precedent && ecartPrecedent <= MAX_ECART) {
        match._table = precedent.poule;
      } else {
        match._table = null;
      }
    });
  },

  formatArbitrage(arb1, arb2) {
    if (!arb1 && !arb2) return '<span class="cell-empty">—</span>';
    const noms = [arb1, arb2].filter(Boolean).join(' / ');
    return `<span class="badge-designe">D</span> ${noms}`;
  },

  capitalise(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

};
