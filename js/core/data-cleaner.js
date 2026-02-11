import { Configuration } from './default-param.js';

export class DataCleaner {
    static options_dates = { weekday: 'long', month: 'long', day: 'numeric' };

    static calculerVictoire(pScoreClub, pScoreAutre) {
        const scoreClub = Number.parseInt(pScoreClub);
        const scoreAutre = Number.parseInt(pScoreAutre);
        if (scoreClub > scoreAutre) {
            return "victoire";
        } else if (scoreClub == scoreAutre) {
            return "egalite";
        } else {
            return "defaite"
        }
    }

    static isStringEmptyOrFalsy(str) {
        return !str || str.trim().length === 0;
    }

    static capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    static removeSpaces(str) {
        return str.replace(/ /g, "_");
    }

    static capitalizeFirstLetter(str) {
        return str.toLowerCase().split(' ').map(this.capitalize).join(' ');
    }

    static removeTrailingStar(str) {
        return str.replace(/ \*$/, "").replace(/\*$/, "");
    }

    static cleanJour(match) {
        let dateSplitted = match.le.split("/");
        return new Date(dateSplitted[2] + "-" + dateSplitted[1] + "-" + dateSplitted[0]).toLocaleDateString('fr-fr', this.options_dates);
    }

    static isMatchDom(match) {
        const nomsEquipesDom = Configuration.noms_equipes_dom;
        const clubRecevant = match['club rec'] || '';
        const clubHote = match['club hote'] || '';

        const isRecevantKnown = nomsEquipesDom.some(nomEquipe => clubRecevant.includes(nomEquipe));
        const isHoteKnown = !this.isStringEmptyOrFalsy(clubHote) && nomsEquipesDom.some(nomEquipe => clubHote.includes(nomEquipe));
        const isTournoi = match['competition'].includes("tournoi");
        return (!isTournoi && isRecevantKnown) || isHoteKnown;
    }

    static isFriendlyMatch(match) {
        return match['competition'].includes("amicale");
    }

    static cleanSalle(match, salle_dom) {
        if (salle_dom) {
            if(this.isStringEmptyOrFalsy(match['nom salle'])){
                return match['club hote'];
            }else {
                return this.capitalizeFirstLetter(match['nom salle']).replace("St Joseph De La Porterie N°1 - ", "");
            }
        } else {
            return "Extérieur"
        }
    }

    static mapperCollectifClub(competition, nom_equipe_fdm) {
        let compet = competition.replaceAll('"', '').trim();
        var categorie = Configuration.configurationEquipe[compet];
        if (categorie == undefined) {
            console.error("Impossible de trouver la compétition :" + compet)
        }
    
        let clean_nom_equipe_fdm = _.trim(nom_equipe_fdm);
        let nom_collectif_club = categorie;
        if (categorie) {
            if (categorie[clean_nom_equipe_fdm]) {
                nom_collectif_club = categorie[clean_nom_equipe_fdm]
            } else {
                console.log("Sous collectif non trouvé", categorie, nom_equipe_fdm)
                nom_collectif_club = clean_nom_equipe_fdm;
            }
        }
        return this.capitalizeFirstLetter(nom_collectif_club)
    }

    
    static nettoyerNomEquipe(competition, nom_equipe) {
        var str = this.mapperCollectifClub(competition, nom_equipe);
        Configuration.sub_equipes.forEach(sub => str = str.replace(this.capitalizeFirstLetter(sub[0]), this.capitalizeFirstLetter(sub[1])));
        str = str.replace("Handball", "").replace("1m.2m.3m.4m", "").replace("1m.2m.3m", "").replace("1m.2m", "").replace("1f.2f", "").replace("OLYMPIQUE", "").replace("Olympique", "").replace("Club", "").replace("*HTE SARTHE", "").trim();
        str = this.removeTrailingStar(str)
        str = str.replace(/^[^*]*\*/, ''); //Suppression du contenu avant etoile
        return this.capitalizeFirstLetter(str.trim())
    }

    static isCompetEdh(competition) {
        let compet = competition.replaceAll('"', '').trim();
        var categorie = Configuration.configurationEquipe[compet];
        return categorie.edh
    }
    

    static isNomEquipeSuspicieux(nom_equipe) {
        if (nom_equipe) {
            if (nom_equipe.includes("*") || nom_equipe.includes("/")) {
                return "Nom équipe contient un charactère * ou /"
            }
            if (nom_equipe.length >= 34) {
                return "Nom équipe long de 34 charactères et plus"
            }
        }
    }
    
    static lireMatchs(semaine, matchs) {
        const matchsCleans = matchs.get(semaine)?.filter(match => !this.isFriendlyMatch(match)).map(match => {
            console.log(match)
            //Recherche du collectif
            const match_dom = this.isMatchDom(match);
            const salle_dom = this.isMatchDom(match);

            //génération de la structure
            let match_triangulaire = false;
            var equipe_dom, equipe_dom_warning, equipe_dom_orig;
            var equipe_ext, equipe_ext_warning, equipe_ext_orig;
            var victoire;
            var salle = this.cleanSalle(match, salle_dom)

            equipe_dom_orig = match['club rec'];
            equipe_ext_orig = match['club vis'];
            if (match_dom) {
                victoire = this.calculerVictoire(match['fdme rec'], match['fdme vis']);
                //Dans le cadre des triangulaires on ignore les matchs non porteri ou chapelain
                match_triangulaire = Configuration.noms_equipes_dom.find(g => match['club rec'].includes(g)) == undefined;
            } else {
                victoire = this.calculerVictoire(match['fdme vis'], match['fdme rec']);
            }

            equipe_dom = this.nettoyerNomEquipe(match.competition, equipe_dom_orig);
            equipe_dom_warning = this.isNomEquipeSuspicieux(equipe_dom);

            equipe_ext = this.nettoyerNomEquipe(match.competition, equipe_ext_orig);
            equipe_ext_warning = this.isNomEquipeSuspicieux(equipe_ext);

            return ({
                competition: match.competition,
                edh: this.isCompetEdh(match.competition),
                salle,
                jour: this.cleanJour(match),
                horaire: match.horaire,
                equipe_dom,
                equipe_dom_orig,
                equipe_dom_warning,
                equipe_ext,
                equipe_ext_orig,
                equipe_ext_warning,
                match_dom,
                salle_dom,
                salle_orig: match['nom salle'],
                match_triangulaire,
                //fdme_rec: match['fdme rec'],
                //fdme_vis: match['fdme vis'],
                fdme_rec: match['sc rec'],
                fdme_vis: match['sc vis'],
                victoire
            });
        })

        console.log(matchsCleans);
        return matchsCleans;
    }
}


