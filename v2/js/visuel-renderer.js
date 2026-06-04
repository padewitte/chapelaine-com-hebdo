export const VisuelRenderer = {

  // ─── ANNONCE ────────────────────────────────────────────────────────────────

  renderAnnonce(matchs) {
    document.getElementById('annonce-samedi').innerHTML  = '';
    document.getElementById('annonce-dimanche').innerHTML = '';

    const emptyState  = document.getElementById('empty-annonce');
    const subTabs     = document.getElementById('sub-tabs-annonce');

    if (!matchs || matchs.length === 0) {
      emptyState.style.display = '';
      subTabs.style.display    = 'none';
      return;
    }

    emptyState.style.display = 'none';
    subTabs.style.display    = '';

    // Grouper par jour
    const parJour = new Map();
    matchs.forEach(m => {
      if (!parJour.has(m.dateISO)) parJour.set(m.dateISO, { label: m.jour, matchs: [] });
      parJour.get(m.dateISO).matchs.push(m);
    });

    [...parJour.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([dateISO, { label, matchs: matchsDuJour }]) => {
        const jourKey  = label.toLowerCase().startsWith('samedi') ? 'samedi' : 'dimanche';
        const container = document.getElementById(`annonce-${jourKey}`);

        const wrap = document.createElement('div');
        wrap.className = 'visuel-wrap';

        const btnDl = document.createElement('button');
        btnDl.className = 'btn-download';
        btnDl.textContent = '⬇ Télécharger';
        btnDl.addEventListener('click', () =>
          this.telecharger(`annonce-card-${dateISO}`, `annonce_${dateISO}`)
        );
        wrap.appendChild(btnDl);

        const card = this.creerCarteAnnonce(label, matchsDuJour);
        card.id = `annonce-card-${dateISO}`;
        wrap.appendChild(card);
        container.appendChild(wrap);
      });
  },

  creerCarteAnnonce(jour, matchs) {
    const card = document.createElement('div');
    card.className = 'insta-card annonce';

    // Header
    card.innerHTML = `
      <div class="insta-card-header">
        <img src="assets/img/logo-porte-de-l-erdre-handball.png" class="insta-logo" alt="logo">
        <div class="insta-card-title">Game <span class="accent-orange">DAY</span></div>
      </div>
      <div class="insta-card-date">${this.capitalise(jour)}</div>
    `;

    // Grouper par salle
    const parSalle = new Map();
    matchs.forEach(m => {
      const key = m.salle === 'exterieur' ? 'Extérieur' : m.nom_salle;
      if (!parSalle.has(key)) parSalle.set(key, []);
      parSalle.get(key).push(m);
    });

    // Extérieur toujours en dernier
    const sallesTriees = [...parSalle.entries()].sort(([a], [b]) => {
      if (a === 'Extérieur') return 1;
      if (b === 'Extérieur') return -1;
      return 0;
    });

    sallesTriees.forEach(([nomSalle, matchsSalle]) => {
      const section = document.createElement('div');
      section.className = 'insta-section';

      const salleLabel = document.createElement('div');
      salleLabel.className = 'insta-salle';
      salleLabel.textContent = nomSalle;
      section.appendChild(salleLabel);

      [...matchsSalle]
        .sort((a, b) => a.horaire.localeCompare(b.horaire))
        .forEach(m => {
          const ligne = document.createElement('div');
          ligne.className = 'insta-match-ligne';
          const gymnase = m.salle === 'exterieur' && m.nom_salle
            ? `<span class="insta-gymnase">${m.nom_salle}</span>`
            : '';
          const adversaire = m.salle === 'exterieur' ? m.equipe_dom : m.equipe_ext;
          ligne.innerHTML = `
            <span class="insta-equipe-dom">${m.poule}</span>
            <span class="insta-centre">
              <span class="insta-horaire">${m.horaire}</span>
              ${gymnase}
            </span>
            <span class="insta-equipe-ext">${adversaire}</span>
          `;
          section.appendChild(ligne);
        });

      card.appendChild(section);
    });

    card.innerHTML += `<div class="insta-card-footer">Bon match à tous !</div>`;
    return card;
  },

  // ─── RÉSULTATS ───────────────────────────────────────────────────────────────

  renderResultats(resultats) {
    const container = document.getElementById('visuel-resultats');
    container.innerHTML = '';

    if (!resultats || resultats.length === 0) {
      container.innerHTML = '<div class="empty-state">Chargez un fichier de résultats pour générer le visuel.</div>';
      return;
    }

    const wrap = document.createElement('div');
    wrap.className = 'visuel-wrap';

    const btnDl = document.createElement('button');
    btnDl.className = 'btn-download';
    btnDl.textContent = '⬇ Télécharger';
    btnDl.addEventListener('click', () => this.telecharger('carte-resultats', 'resultats'));
    wrap.appendChild(btnDl);

    const card = this.creerCarteResultats(resultats);
    card.id = 'carte-resultats';
    wrap.appendChild(card);
    container.appendChild(wrap);
  },

  creerCarteResultats(resultats) {
    const card = document.createElement('div');
    card.className = 'insta-card resultats';

    card.innerHTML = `
      <div class="insta-card-header">
        <img src="assets/img/logo-porte-de-l-erdre-handball.png" class="insta-logo" alt="logo">
        <div class="insta-card-title">Les <span class="accent-green">résultats</span></div>
      </div>
    `;

    const liste = document.createElement('div');
    liste.className = 'insta-resultats-liste';

    resultats.forEach(r => {
      const ligne = document.createElement('div');
      ligne.className = 'insta-resultat-ligne';
      ligne.innerHTML = `
        <span class="insta-res-equipe left">${r.poule}</span>
        <span class="insta-res-score ${r.victoire}">${r.score_dom} - ${r.score_ext}</span>
        <span class="insta-res-equipe right">${r.equipe_ext}</span>
      `;
      liste.appendChild(ligne);
    });

    card.appendChild(liste);
    card.innerHTML += `<div class="insta-card-footer">Bravo à tous !</div>`;
    return card;
  },

  // ─── TÉLÉCHARGEMENT ──────────────────────────────────────────────────────────

  telecharger(elementId, nomFichier) {
    const el = document.getElementById(elementId);
    if (!el || typeof html2canvas === 'undefined') {
      alert('html2canvas non chargé');
      return;
    }
    html2canvas(el, { useCORS: true, scale: 2 }).then(canvas => {
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `${nomFichier}.png`;
      a.click();
    });
  },

  capitalise(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
  },

};
