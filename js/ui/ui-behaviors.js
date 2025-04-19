import { DataCleaner } from '../core/data-cleaner.js';
import { DataExtractor } from '../core/extractor.js';
import { Configuration } from '../core/default-param.js';
import { DateUtils } from '../core/date-utils.js';

export class BaseUI {
    static removeAllChildNodes(parent) {
        while (parent.firstChild) {
            parent.removeChild(parent.firstChild);
        }
    }

    static createHtmlElement(type, className, innerHtml) {
        const newDiv = document.createElement(type);
        newDiv.className = className + " hbgenerated";
        newDiv.innerHTML = innerHtml;
        return newDiv;
    }

    static scrollToMainSection(idscroll) {
        window.scrollTo({
            top: document.getElementById(idscroll).offsetTop,
            left: 0,
            behavior: 'smooth'
        });
    }
}

export class DropzoneUI extends BaseUI {
    static attachDropZone() {
        const dropZone = document.getElementById('dropZone');

        dropZone.addEventListener('dragover', function (e) {
            e.preventDefault();
            dropZone.classList.add('hover');
        });

        dropZone.addEventListener('dragleave', function () {
            dropZone.classList.remove('hover');
        });

        dropZone.addEventListener('drop', function (e) {
            e.preventDefault();
            dropZone.classList.remove('hover');
            DataExtractor.SEMAINES = [];

            const files = e.dataTransfer.files;

            if (files.length > 0) {
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];

                    if (file.type === 'text/csv' || file.type === 'text/txt') {
                        const fileName = file.name;
                        const reader = new FileReader();

                        reader.onload = function (event) {
                            console.log('onload');
                            const csvContent = event.target.result;
                            const csv = d3.dsvFormat(";");
                            const data = csv.parse(csvContent);
                            let nouveauFichier = [];
                            if (data && data[0] && data[0]['Etat']) {
                                nouveauFichier = { type: 'resultat', data, fileName }
                            } else {
                                nouveauFichier = { type: 'programme', data, fileName }
                            }
                            console.log(nouveauFichier)
                            DataExtractor.extraireData(nouveauFichier)
                            DropzoneUI.majSemaines(DataExtractor.SEMAINES)
                            DropzoneUI.majChampionnat(DataExtractor.CHAMP)
                            DropzoneUI.majStats()
                        };

                        reader.onerror = function (event) {
                            console.error('File could not be read! Code ' + event.target.error.code);
                        };

                        reader.readAsText(file);
                    } else {
                        console.error('Unsupported file type: ', file.type);
                    }
                }
            }
        });
    }

    static majSemaines(semaines) {
        const selSemaine = document.getElementById("selSemaine");
        if(selSemaine){
            selSemaine.setAttribute('disabled', true)
            this.removeAllChildNodes(selSemaine);
            if(semaines && semaines.length > 0){
                selSemaine.appendChild(document.createElement("sl-option"));
                semaines.forEach(semaine => {
                    let libSemaine = this.getLibSemaine(semaine)
                    const newDiv = document.createElement("sl-option");
                    newDiv.value = semaine
                    newDiv.innerHTML = libSemaine
                    selSemaine.appendChild(newDiv);
                });
                selSemaine.removeAttribute('disabled')
            }
        }
    }

    static majChampionnat(championnats) {
        const selChampionnat = document.getElementById("selChampionnat");
        if(selChampionnat){
            selChampionnat.setAttribute('disabled', true)
            this.removeAllChildNodes(selChampionnat);
            if(championnats && championnats.length > 0){
                selChampionnat.appendChild(document.createElement("sl-option"));
                championnats.forEach(championnat => {
                    const newDiv = document.createElement("sl-option");
                    newDiv.value = championnat
                    newDiv.innerHTML = championnat
                    selChampionnat.appendChild(newDiv);
                });
                selChampionnat.removeAttribute('disabled')
            }
        }
    }

    static majStats() {
        const sctStats = document.getElementById("sctStats");
        if(sctStats){
            StatsUI.loadStats()
        }
    }

    static getLibSemaine(semaine) {
        const semMom = moment(semaine, 'YYYY-WW').add(5, 'days')
        return semaine + " (" + semMom.format('DD/MM') + " & " + semMom.add(1, 'days').format('DD/MM') + ")"
    }

    static getSamediSemaine(semaine) {
        const semMom = moment(semaine, 'YYYY-WW').add(5, 'days')
        return semMom.format('DD/MM/YYYY')
    }
}

export class MatchUI extends BaseUI {
    static insertLigneResultat(match) {
        let resultats = document.getElementById("resultats");
        if (!match.fdme_rec || !match.fdme_vis) {
            resultats = document.getElementById("erreursResultats");
            document.getElementById("alertResultats").setAttribute("open", true)
        }
        const newDiv = document.createElement("div");
        newDiv.className = "ligneResultat hbgenerated"
        newDiv.innerHTML = "<div class='lrl hbgenerated'>" + match.equipe_dom + "</div><div competition="+ match.competition +" class='lrc " + match.victoire + "'>" + match.fdme_rec + " - " + match.fdme_vis + "</div><div class='lrr'>" + match.equipe_ext + "</div>";
        resultats.appendChild(newDiv);
        document.getElementById("tab_resultat").removeAttribute("disabled")
    }

    static insertMatchsProgrammes(matchsClean, semaine) {
        const EXTRA_TD_KIFEKOI = "<td></td><td></td><td></td><td></td><td></td><td></td><td></td>"

        this.cleanGeneratedDiv()
        let matchAVenir = _.uniqWith(matchsClean, (x, y) => "" + x.equipe_dom + x.equipe_ext + x.salle + x.horaire === "" + y.equipe_dom + y.equipe_ext + y.salle + y.horaire);
        matchAVenir = _.orderBy(matchsClean, ['jour', 'salle', 'horaire'])
        console.log(matchsClean)

        const jours_de_match = _.uniqBy(matchAVenir, 'jour').map(j => j.jour).sort().reverse();
        console.log(jours_de_match)

        let dates_week_end = undefined;

        document.getElementById("kifekoi").appendChild(this.createHtmlElement("table", "semaineKifekoi", "<tr><td>" + DropzoneUI.getLibSemaine(semaine) + "</td></tr>"));
        document.getElementById("kifekoi").appendChild(document.createElement("br"));

        jours_de_match.forEach(jdm => {
            if (dates_week_end) {
                dates_week_end = dates_week_end + " & " + jdm.split(' ').slice(1).join(' ');
            } else {
                dates_week_end = jdm.split(' ').slice(1).join(' ');
            }

            const jour_we = jdm.split(' ')[0]
            console.log("dates_week_end:" + jour_we)

            const resultats = document.getElementById("insta_" + jour_we);
            if(document.getElementById("date_we_feed_" + jour_we)){
                document.getElementById("date_we_feed_" + jour_we).innerHTML = jdm
            }

            const matchs_du_jour = matchAVenir.filter(match => match.jour == jdm);
            const salles_du_jour = _.uniqBy(matchs_du_jour, 'salle').map(j => j.salle).reverse()

            salles_du_jour.forEach(salle => {
                console.log(salle)
                const domicile = Configuration.estSalleDomicile(salle);

                let tableauKifekoi;
                if (domicile) {
                    tableauKifekoi = this.createHtmlElement("table", "tableau-kifekoi", "<thead><tr><td colspan='12' class='jdmKifekoi'>" + jdm + "</td></tr></thead>")
                    tableauKifekoi.appendChild(this.createHtmlElement("tr", undefined, "<td colspan='12' class='salleKifekoi'>" + salle + "</td>"))
                    tableauKifekoi.appendChild(this.createHtmlElement("tr", "enteteKifekoi", "<td>Horaire Match</td><td>Equipe</td><td>Adversaire</td><td>Table</td><td>Arbitrage</td><td>Arbitrage backup</td><td>Suivi</td><td>Resp Salle</td><td>Resp animation</td><td>Indispo anim</td>"))
                } else {
                    tableauKifekoi = this.createHtmlElement("table", "tableau-kifekoi", "<thead><tr><td colspan='3' class='jdmKifekoi'>" + jdm + "</td></tr></thead>")
                    tableauKifekoi.appendChild(this.createHtmlElement("tr", undefined, "<td colspan='3' class='salleKifekoi'>" + salle + "</td>"))
                    tableauKifekoi.appendChild(this.createHtmlElement("tr", "enteteKifekoi", "<td>Horaire Match</td><td>Equipe</td><td>Adversaire</td>"))
                }

                const divSalle = this.createHtmlElement("div", "session", "<div class='salle'>" + salle + "</div>");
                const match_dans_la_salle = matchs_du_jour.filter(m => m.salle == salle);
                const match_dans_la_salle_trie = _.orderBy(match_dans_la_salle, ['horaire'], ['asc']);
                let derniereSalle = ""
                let precedentMatchEdh = false;

                match_dans_la_salle_trie.forEach(match_a_afficher => {
                    if (!precedentMatchEdh || !match_a_afficher.edh || derniereSalle !== match_a_afficher.salle_orig ) {
                        precedentMatchEdh = match_a_afficher.edh
                        derniereSalle = match_a_afficher.salle_orig
                        divSalle.appendChild(this.createHtmlElement("div", "match", "<div class='lrl'>" + match_a_afficher.equipe_dom + "</div><div class='lrc horaire'>" + DateUtils.formatHeure(match_a_afficher.horaire) + "</div><div class='lrr'>" + match_a_afficher.equipe_ext + "</div>"));

                        let ligneTableauKifekoi = "<td>" + DateUtils.formatHeure(match_a_afficher.horaire) + "</td><td>" + match_a_afficher.equipe_dom + "</td><td>" + match_a_afficher.equipe_ext + "</td>";
                        if (domicile) {
                            ligneTableauKifekoi += EXTRA_TD_KIFEKOI
                        }
                        tableauKifekoi.appendChild(this.createHtmlElement("tr", "", ligneTableauKifekoi))

                        if (jour_we != 'Invalid' && (match_a_afficher.equipe_dom_warning || match_a_afficher.equipe_ext_warning)) {
                            const alertDiv = document.getElementById("alert_" + jour_we);
                            alertDiv.setAttribute("open", true)
                            const contenuAlertDiv = document.getElementById("contenuAlert_" + jour_we);
                            if (match_a_afficher.equipe_dom_warning) {
                                contenuAlertDiv.appendChild(this.createHtmlElement("div", "erreurEquipe ", match_a_afficher.equipe_dom + " | " + match_a_afficher.equipe_dom_orig + " | " + match_a_afficher.competition))
                            } else {
                                contenuAlertDiv.appendChild(this.createHtmlElement("div", "erreurEquipe", match_a_afficher.equipe_ext + " | " + match_a_afficher.equipe_ext_orig + " | " + match_a_afficher.competition))
                            }
                        }
                    }
                })
                if(resultats){
                    resultats.appendChild(divSalle);
                }

                if (domicile) {
                    document.getElementById("kifekoi").appendChild(tableauKifekoi);
                    document.getElementById("kifekoi").appendChild(document.createElement("br"));
                } else {
                    document.getElementById("kifekoi-ext").appendChild(tableauKifekoi);
                    document.getElementById("kifekoi-ext").appendChild(document.createElement("br"));
                }

                document.getElementById("tab_" + jour_we)?.removeAttribute("disabled")
                document.getElementById("tab_kiefeKoi").removeAttribute("disabled")
            })

            if (jour_we == 'Invalid') {
                const message = "Attention conclusions manquantes sur ce week-end";
                document.getElementById("contenuAlert_samedi").appendChild(this.createHtmlElement("div", "erreurEquipe", message));
                document.getElementById("alert_samedi").open = true;
                document.getElementById("contenuAlert_dimanche").appendChild(this.createHtmlElement("div", "erreurEquipe", message));
                document.getElementById("alert_dimanche").open = true;
            }
            if(resultats){
                resultats.appendChild(this.createHtmlElement("div", "insta-footer", "Bon match à tous !"))
            }
        })
    }

    static cleanGeneratedDiv() {
        this.resetTab("tab_resultat")
        this.resetTab("tab_samedi")
        this.resetTab("tab_dimanche")
        this.resetTab("tab_kiefeKoi")
        document.getElementById("alert_samedi").removeAttribute("open")
        document.getElementById("alert_dimanche").removeAttribute("open")
        document.getElementById("alertResultats").removeAttribute("open")
        document.querySelectorAll(".hbgenerated").forEach(e => e.remove())
        const resultats = document.getElementById("resultats");
        resultats.innerHTML = "";
    }

    static resetTab(tabId) {
        const htmlElement = document.getElementById(tabId);
        htmlElement.removeAttribute("active")
        htmlElement.setAttribute("disabled", true)
    }
}

export class DownloadUI extends BaseUI {
    static downloadDivAsImage(divId, fileName) {
        const element = document.getElementById(divId);
        html2canvas(element).then(function (canvas) {
            const downloadLink = document.createElement('a');
            downloadLink.setAttribute('href', canvas.toDataURL("image/png"));
            downloadLink.setAttribute('download', fileName + '.png');
            downloadLink.style.display = 'none';
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        });
    }
}

export function attach_btn_param() {
    const dialog = document.querySelector('.dialog-scrolling');
    const openButton = dialog.nextElementSibling;
    const closeButton = dialog.querySelector('sl-button[slot="footer"]');

    openButton.addEventListener('click', () => dialog.show());
    closeButton.addEventListener('click', () => dialog.hide());
}

export function generer_semaine(semaine) {
    MatchUI.cleanGeneratedDiv()
    const matchsJoueClean = DataCleaner.lire_matchs(semaine, DataExtractor.MATCHS_JOUES_PAR_SEMAINE);

    matchsJoueClean?.forEach(match => {
        MatchUI.insertLigneResultat(match)
    })

    const matchsProgClean = DataCleaner.lire_matchs(semaine, DataExtractor.MATCHS_PROGRAMMES_PAR_SEMAINE);


    if (matchsProgClean && matchsProgClean.length > 0) {
        MatchUI.insertMatchsProgrammes(matchsProgClean, semaine)
    }
}

export function loadParametres() {

    document.getElementById('noms_equipes_dom').innerHTML = JSON.stringify(Configuration.noms_equipes_dom, null, '  ')
    document.getElementById('substitution_equipes').innerHTML = JSON.stringify(Configuration.sub_equipes, null, '  ')
    document.getElementById('configuration_equipe').innerHTML = JSON.stringify(Configuration.configurationEquipe, null, '  ')
}

