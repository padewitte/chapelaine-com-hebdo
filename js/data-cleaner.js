const options_dates = { weekday: 'long', month: 'long', day: 'numeric' };

function calculer_victoire(pScoreClub, pScoreAutre) {
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

function format_heure(string_heure) {
    return string_heure.slice(0, -3);
}
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function capitalize_first_letter(str) {
    return str.toLowerCase().split(' ').map(capitalize).join(' ');
}

function nettoyer_nom_equipe(competition, nom_equipe_adverse) {
    var str = mapper_collectif_club(competition, nom_equipe_adverse);
    sub_equipes.forEach(sub => str = str.replace(capitalize_first_letter(sub[0]), capitalize_first_letter(sub[1])));
    str = str.replace("Handball", "").replace("1m.2m.3m", "").replace("1m.2m", "").replace("OLYMPIQUE", "").replace("Olympique", "").replace("Club", "").replace("*HTE SARTHE", "").trim();
    return capitalize_first_letter(str)
}

function mapper_collectif_club(competition, nom_equipe_fdm) {
    let compet = competition.replaceAll('"', '').trim();
    var categorie = configurationEquipe[compet];
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
    return capitalize_first_letter(nom_collectif_club)
}


function clean_salle(match, salle_dom) {
    if(salle_dom){
        return capitalize_first_letter(match['nom salle']).replace("St Joseph De La Porterie N°1 - ", "");
    }else{
        return "Extérieur"
    }
}

function is_salle_dom(match) {
    return match['nom salle'] != undefined && (match['nom salle'].toUpperCase().includes("COUTANCIERE") || match['nom salle'].toUpperCase().includes("JEAN JAHAN"));
}

function is_match_dom(match){
    return noms_equipes_dom.find(g => match['club rec'].includes(g)) != undefined || (match['club hote'] != undefined && noms_equipes_dom.find(g => match['club hote'].includes(g)) != undefined);
}

function clean_jour(match){
    let dateSplitted = match.le.split("/");
    return new Date(dateSplitted[2] + "-" + dateSplitted[1] + "-" + dateSplitted[0]).toLocaleDateString('fr-fr', options_dates);
}


function isNomEquipeSuspicieux(nom_equipe){
    if(nom_equipe){
        if(nom_equipe.includes("*") || nom_equipe.includes("/")){
            return "Nom équipe contient un charactère * ou /"
        }
        if(nom_equipe.length >= 34){
            return "Nom équipe long de 34 charactères et plus"
        }
    }
}

function lire_matchs(semaine, matchs) {
    const matchsCleans = matchs.get(semaine)?.map(match => {
        console.log(match)
        //Recherche du collectif
        const match_dom = is_match_dom(match);
        const salle_dom = is_salle_dom(match);

        //génération de la structure
        let match_triangulaire = false;
        var equipe_dom, equipe_dom_warning, equipe_dom_orig;
        var equipe_ext, equipe_ext_warning, equipe_ext_orig;
        var victoire;
        var salle = clean_salle(match, salle_dom)
        

        if (match_dom) {
            equipe_dom_orig = match['club rec'];
            equipe_ext_orig = match['club vis'];
            
            victoire = calculer_victoire(match['fdme rec'], match['fdme vis']);
            //Dans le cadre des triangulaires on ignore les matchs non porteri ou chapelain
            match_triangulaire = noms_equipes_dom.find(g => match['club rec'].includes(g)) == undefined;
        } else {
            equipe_dom_orig = match['club vis'];
            equipe_ext_orig = match['club rec'];
            victoire = calculer_victoire(match['fdme vis'], match['fdme rec']);
        }

        equipe_dom = nettoyer_nom_equipe(match.competition, equipe_dom_orig);
        equipe_dom_warning = isNomEquipeSuspicieux(equipe_dom);

        equipe_ext = nettoyer_nom_equipe(match.competition, equipe_ext_orig);
        equipe_ext_warning  = isNomEquipeSuspicieux(equipe_ext);
        
        return({
            competition: match.competition,
            salle,
            jour: clean_jour(match),
            horaire: match.horaire,
            equipe_dom,
            equipe_dom_orig,
            equipe_dom_warning,
            equipe_ext,
            equipe_ext_orig,
            equipe_ext_warning,
            match_dom,
            salle_dom,
            match_triangulaire,
            fdme_rec: match['fdme rec'],
            fdme_vis: match['fdme vis'],
            victoire
        });
    })

    console.log(matchsCleans);
    return matchsCleans;
}


