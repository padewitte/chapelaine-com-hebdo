import { Configuration } from './default-param.js';

export class DataCleaner {
    static options_dates = { weekday: 'long', month: 'long', day: 'numeric' };

    static calculer_victoire(pScoreClub, pScoreAutre) {
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

    static remove_spaces(str) {
        return str.replace(/ /g, "_");
    }

    static capitalize_first_letter(str) {
        return str.toLowerCase().split(' ').map(this.capitalize).join(' ');
    }

    static removeTrailingStar(str) {
        return str.replace(/ \*$/, "").replace(/\*$/, "");
    }

    static clean_jour(match) {
        let dateSplitted = match.le.split("/");
        return new Date(dateSplitted[2] + "-" + dateSplitted[1] + "-" + dateSplitted[0]).toLocaleDateString('fr-fr', this.options_dates);
    }

    static is_match_dom(match) {
        return Configuration.noms_equipes_dom.find(g => match['club rec'].includes(g)) != undefined || (match['club hote'] != undefined && Configuration.noms_equipes_dom.find(g => match['club hote'].includes(g)) != undefined);
    }

    static clean_salle(match, salle_dom) {
        if (salle_dom) {
            if(this.isStringEmptyOrFalsy(match['nom salle'])){
                return match['club hote'];
            }else {
                return this.capitalize_first_letter(match['nom salle']).replace("St Joseph De La Porterie N°1 - ", "");
            }
        } else {
            return "Extérieur"
        }
    }

    static mapper_collectif_club(competition, nom_equipe_fdm) {
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
        return this.capitalize_first_letter(nom_collectif_club)
    }

    
    static nettoyer_nom_equipe(competition, nom_equipe) {
        var str = this.mapper_collectif_club(competition, nom_equipe);
        Configuration.sub_equipes.forEach(sub => str = str.replace(this.capitalize_first_letter(sub[0]), this.capitalize_first_letter(sub[1])));
        str = str.replace("Handball", "").replace("1m.2m.3m", "").replace("1m.2m", "").replace("1f.2f", "").replace("OLYMPIQUE", "").replace("Olympique", "").replace("Club", "").replace("*HTE SARTHE", "").trim();
        str = this.removeTrailingStar(str)
    
        return this.capitalize_first_letter(str)
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
    
    static lire_matchs(semaine, matchs) {
        const matchsCleans = matchs.get(semaine)?.map(match => {
            console.log(match)
            //Recherche du collectif
            const match_dom = this.is_match_dom(match);
            const salle_dom = this.is_match_dom(match);

            //génération de la structure
            let match_triangulaire = false;
            var equipe_dom, equipe_dom_warning, equipe_dom_orig;
            var equipe_ext, equipe_ext_warning, equipe_ext_orig;
            var victoire;
            var salle = this.clean_salle(match, salle_dom)

            equipe_dom_orig = match['club rec'];
            equipe_ext_orig = match['club vis'];
            if (match_dom) {
                victoire = this.calculer_victoire(match['fdme rec'], match['fdme vis']);
                //Dans le cadre des triangulaires on ignore les matchs non porteri ou chapelain
                match_triangulaire = Configuration.noms_equipes_dom.find(g => match['club rec'].includes(g)) == undefined;
            } else {
                victoire = this.calculer_victoire(match['fdme vis'], match['fdme rec']);
            }

            equipe_dom = this.nettoyer_nom_equipe(match.competition, equipe_dom_orig);
            equipe_dom_warning = this.isNomEquipeSuspicieux(equipe_dom);

            equipe_ext = this.nettoyer_nom_equipe(match.competition, equipe_ext_orig);
            equipe_ext_warning = this.isNomEquipeSuspicieux(equipe_ext);

            return ({
                competition: match.competition,
                edh: this.isCompetEdh(match.competition),
                salle,
                jour: this.clean_jour(match),
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
                fdme_rec: match['fdme rec'],
                fdme_vis: match['fdme vis'],
                victoire
            });
        })

        console.log(matchsCleans);
        return matchsCleans;
    }
}


