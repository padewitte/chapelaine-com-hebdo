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
    str = str.replace("Handball", "").replace("OLYMPIQUE", "").replace("Club", "").replace("*HTE SARTHE", "").trim();
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

function nettoyer_matchs(semaine, matchs) {
    const matchsCleans = matchs.get(semaine).map(match => {
        console.log(match)
        //Recherche du collectif
        const match_dom = is_match_dom(match);
        const salle_dom = is_salle_dom(match);

        //génération de la structure
        let match_triangulaire = false;
        var equipe_dom;
        var equipe_ext;
        var victoire;
        var salle = clean_salle(match, salle_dom)
        

        if (match_dom) {
            equipe_dom = nettoyer_nom_equipe(match.competition, match['club rec']);
            equipe_ext = nettoyer_nom_equipe(match.competition, match['club vis']);
            victoire = calculer_victoire(match['fdme rec'], match['fdme vis']);
            //Dans le cadre des triangulaires on ignore les matchs non porteri ou chapelain
            match_triangulaire = noms_equipes_dom.find(g => match['club rec'].includes(g)) == undefined;
        } else {
            equipe_dom = nettoyer_nom_equipe(match.competition, match['club rec']);
            equipe_ext = nettoyer_nom_equipe(match.competition, match['club vis']);
            victoire = calculer_victoire(match['fdme vis'], match['fdme rec']);
        }

        
        return({
            competition: match.competition,
            salle,
            jour: clean_jour(match),
            horaire: match.horaire,
            equipe_dom,
            equipe_ext,
            match_dom,
            salle_dom,
            match_triangulaire,
            orig_rec: match['club rec'],
            orig_vis: match['club vis'],
            fdme_rec: match['fdme rec'],
            fdme_vis: match['fdme vis'],
            victoire
        });
    })

    console.log(matchsCleans);
    return matchsCleans;

    //Tri des matchs à venir

    /*matchAVenir = _.uniqWith(matchAVenir, (x,y) => ""+x.equipe_dom+x.equipe_ext+x.salle+x.horaire === ""+y.equipe_dom+y.equipe_ext+y.salle+y.horaire);
    matchAVenir = _.orderBy(matchAVenir, ['jour', 'salle', 'horaire'])
    console.log(matchAVenir)

    
    let positionAffichage = 1;
    const jours_de_match = _.uniqBy(matchAVenir, 'jour').map(j => j.jour).sort().reverse();
    console.log(jours_de_match)
    
    let dates_week_end = undefined;
    jours_de_match.forEach(jdm => {
        console.log(jdm)
        if(dates_week_end){
            dates_week_end = dates_week_end + " & " + jdm.split(' ').slice(1).join(' ');
        }else {
            dates_week_end = jdm.split(' ').slice(1).join(' ');
        }

        //Affichage du jour dans le titre général
        const resultats = document.getElementById("insta_" + positionAffichage);
        document.getElementById("date_we_feed_" + positionAffichage).innerHTML = jdm

        //Filtrage des maths du jours
        const matchs_du_jour = matchAVenir.filter(match => match.jour == jdm);

        //Tri par salle
        const salles_du_jour = _.uniqBy(matchs_du_jour, 'salle').map(j => j.salle).reverse()

        //Pour chaque salle génération de la portion d'affichage
        salles_du_jour.forEach(salle => {
            console.log(salle)
            //Generation ligne kifekoi
            let jourKifekoi = createHtmlElement("div","jour-kifekoi","<div>"+jdm+" / "+ salle +"</div");
            let tableauKifekoi = createHtmlElement("table","tableau-kifekoi","<tr><td>Horaire Match</td><td>Equipe</td><td>Adversaire</td></tr>")
            
            //Génération visuel insta
            const divSalle = createHtmlElement("div", "session", "<div class='salle'>"+salle+"</div>");
            const match_dans_la_salle = matchs_du_jour.filter(m => m.salle == salle);
            const match_dans_la_salle_trie = _.orderBy(match_dans_la_salle, ['horaire'], ['asc']);
            
            match_dans_la_salle_trie.forEach(match_a_afficher => {
                divSalle.appendChild(createHtmlElement("div", "match", "<div class='lrl'>"+match_a_afficher.equipe_dom + "</div><div class='lrc horaire'>" + format_heure(match_a_afficher.horaire) + "</div><div class='lrr'>" + match_a_afficher.equipe_ext+"</div>"));
                tableauKifekoi.appendChild(createHtmlElement("tr","","<td>"+format_heure(match_a_afficher.horaire)+"</td><td>"+match_a_afficher.equipe_dom+"</td><td>"+match_a_afficher.equipe_ext+"</td>"))
            })
            resultats.appendChild(divSalle);

            //if(salle != "Extérieur"){
                jourKifekoi.appendChild(tableauKifekoi);
                document.getElementById("kifekoi").appendChild(jourKifekoi);
            //}

        })
        positionAffichage++;
        resultats.appendChild(createHtmlElement("div","insta-footer","Bon match à tous !"))
        
 
    })*/

    //document.getElementById("date_we_feed_3").innerHTML = dates_week_end



    return false
}
