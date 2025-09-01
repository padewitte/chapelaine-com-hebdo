import { BaseUI } from './base-ui.js';
import { DataCleaner } from '../core/data-cleaner.js';
import { DataExtractor } from '../core/extractor.js';
import { Configuration } from '../core/default-param.js';
import { DateUtils } from '../core/date-utils.js';

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

        document.getElementById("kifekoi").appendChild(this.createHtmlElement("table", "semaineKifekoi", "<tr><td>" + DateUtils.getLibSemaine(semaine) + "</td></tr>"));
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
                const domicile = Configuration.isHomeVenue(salle);

                let tableauKifekoi;
                if (domicile) {
                    tableauKifekoi = this.createHtmlElement("table", "tableau-kifekoi", "<thead><tr><td colspan='10' class='jdmKifekoi'>" + jdm + "</td></tr></thead>")
                    tableauKifekoi.appendChild(this.createHtmlElement("tr", undefined, "<td colspan='12' class='salleKifekoi'>" + salle + "</td>"))
                    tableauKifekoi.appendChild(this.createHtmlElement("tr", "enteteKifekoi", "<td>Horaire Match</td><td>Equipe</td><td>Adversaire</td><td>Table</td><td>Arbitrage</td><td>Arbitrage backup</td><td>Suivi</td><td>Resp Salle</td><td>Resp animation</td><td>Indispo anim</td>"))
                } else {
                    tableauKifekoi = this.createHtmlElement("table", "tableau-kifekoi", "<thead><tr><td colspan='3' class='jdmKifekoi'>" + jdm + "</td></tr></thead>")
                    tableauKifekoi.appendChild(this.createHtmlElement("tr", undefined, "<td colspan='3' class='salleKifekoi'>" + salle + "</td>"))
                    tableauKifekoi.appendChild(this.createHtmlElement("tr", "enteteKifekoi", "<td>Horaire Match</td><td>Equipe</td><td>Adversaire</td>"))
                }

                const divSalle = this.createHtmlElement("div", "session", "<div class='salle "+ salle.replaceAll(" ","-").toLowerCase() +"'>" + salle + "</div>");
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
            /*if(resultats){
                resultats.appendChild(this.createHtmlElement("div", "insta-footer", "Bon match à tous !"))
            }*/
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

    static genererSemaine(semaine) {
        this.cleanGeneratedDiv()
        const matchsJoueClean = DataCleaner.lireMatchs(semaine, DataExtractor.MATCHS_JOUES_PAR_SEMAINE);

        matchsJoueClean?.forEach(match => {
            this.insertLigneResultat(match)
        })

        const matchsProgClean = DataCleaner.lireMatchs(semaine, DataExtractor.MATCHS_PROGRAMMES_PAR_SEMAINE);

        if (matchsProgClean && matchsProgClean.length > 0) {
            this.insertMatchsProgrammes(matchsProgClean, semaine)
        }
        if(DateUtils.isWeekBeforeToday(semaine)){
            //Select Resultats Tab
            document.querySelector('sl-tab-panel[name="pan-resultats"]').active = true;
        }else{
            //Select Kiefkoi Tab
            document.querySelector('sl-tab-panel[name="pan-kifekoi"]').active = true;
        }
    }
} 