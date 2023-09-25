

let sub_equipes;
let clubHotes;

function calculer_victoire(scoreClub, scoreAutre) {
    if (scoreClub > scoreAutre) {
        return "victoire";
    } else if (scoreClub == scoreAutre) {
        return "egalite";
    } else {
        return "defaite"
    }

}

function format_heure (string_heure){
    return string_heure.slice(0, -3);
}
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function capitalize_first_letter(str) {
    return str.toLowerCase().split(' ').map(capitalize).join(' ');
}


function nettoyer_club_adversaire(categorie, nom_equipe_adverse) {
    var str = mapper_collectif_club(categorie, nom_equipe_adverse);
    sub_equipes.forEach(sub => str = str.replace(capitalize_first_letter(sub[0]), capitalize_first_letter(sub[1])));
    str = str.replace("Handball", "").replace("OLYMPIQUE", "").replace("Club", "").replace("*HTE SARTHE", "").trim();

    return capitalize_first_letter(str)
}

function mapper_collectif_club(categorie, nom_equipe_fdm) {
    let nom_collectif_club = categorie;
    if (categorie) {
        if (categorie[nom_equipe_fdm]) {
            nom_collectif_club = categorie[nom_equipe_fdm]
        } else {
            console.log("Sous collectif non trouvé",categorie,nom_equipe_fdm)
            nom_collectif_club = nom_equipe_fdm;
        }
    }
    return capitalize_first_letter(nom_collectif_club)
}
function generer() {
    document.querySelectorAll(".hbgenerated").forEach(e => e.remove())
    
    clubHotes = JSON.parse(document.getElementById("noms_equipes_dom").value)
    const resultats = document.getElementById("resultats");
    resultats.innerHTML = "";
    sub_equipes = JSON.parse(document.getElementById("sub_equipes").value);
    const configurationEquipe = JSON.parse(document.getElementById("configurationEquipe").value);
    const options_dates = { weekday: 'long', month: 'long', day: 'numeric' };
    const csvContent = document.getElementById("csvContent").value;
    const csv = d3.dsvFormat(";");
    const data = csv.parse(csvContent);

    let matchAVenir = [];

    const matchs = data.forEach(e => {
        console.log(e)
        let compet = e.competition.replaceAll('"','');
        var categorie = configurationEquipe[compet];
        if(categorie == undefined){
            console.error("Impossible de trouver la compétition :" + e.competition)
        }

        //Recherche du collectif
        const match_dom = clubHotes.find(g => e['club rec'].includes(g)) != undefined || (e['club hote'] != undefined && clubHotes.find(g => e['club hote'].includes(g)) != undefined);
        const salle_dom = e['nom salle'] != undefined && (e['nom salle'].toUpperCase().includes("COUTANCIERE") || e['nom salle'].toUpperCase().includes("JEAN JAHAN"));
        
        //génération de la structure
        let match_triangulaire = false;
        var equipe_dom;
        var equipe_ext;
        var victoire;
        var salle;

        if (match_dom) {
            equipe_dom = mapper_collectif_club(categorie, e['club rec']);
            equipe_ext = nettoyer_club_adversaire(categorie, e['club vis']);

            victoire = calculer_victoire(e['fdme rec'], e['fdme vis']);
            if(e['nom salle'] != undefined){
                if(salle_dom){
                    salle = capitalize_first_letter(e['nom salle']).replace("St Joseph De La Porterie N°1 - ","");
                }else{
                    salle = "Extérieur"
                }
            }
            //Dans le cadre des triangulaires on ignore les matchs non porteri ou chapelain
            match_triangulaire = clubHotes.find(g => e['club rec'].includes(g)) == undefined;
        } else {
            equipe_dom = nettoyer_club_adversaire(categorie, e['club rec']);
            equipe_ext = mapper_collectif_club(categorie, e['club vis']);
            victoire = calculer_victoire(e['fdme vis'], e['fdme rec']);
            salle = "Extérieur"
        }

        //if (!match_a_ignorer) {
            let dateSplitted = e.le.split("/");
            matchAVenir.push({
                competition : e.competition,
                salle,
                jour: new Date(dateSplitted[2]+"-"+dateSplitted[1]+"-"+dateSplitted[0]).toLocaleDateString('fr-fr', options_dates),
                horaire: e.horaire,
                equipe_dom,
                equipe_ext,
                match_dom,
                salle_dom,
                match_triangulaire,
                orig_rec: e['club rec'],
                orig_vis: e['club vis']
            });
        //}

        //Affichage de la ligne de résultat
        if (equipe_dom && equipe_ext && e['fdme rec']) {
            //Creation de la ligne de resultat HTML à afficher
            const newDiv = document.createElement("div");
            newDiv.className = "ligneResultat hbgenerated"
            //const newContent = document.createTextNode(nom_collectif_club + " : " + e['club rec'] + ":" +  e['fdme rec'] + " vs " + e['club vis'] + ":" + e['fdme vis']);
            newDiv.innerHTML = "<div class='lrl'>" + equipe_dom + "</div><div class='lrc " + victoire + "'>" + e['fdme rec'] + " - " + e['fdme vis'] + "</div><div class='lrr'>" + equipe_ext + "</div>";//+ " : " + equipe_ext;
            resultats.appendChild(newDiv);
        }

        
    })

    //Tri des matchs à venir
    
    matchAVenir = _.uniqWith(matchAVenir, (x,y) => ""+x.equipe_dom+x.equipe_ext+x.salle+x.horaire === ""+y.equipe_dom+y.equipe_ext+y.salle+y.horaire);
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
        resultats.appendChild(createHtmlElement("div","logo_2",""))

        
 
    })
    document.getElementById("date_we_feed_3").innerHTML = dates_week_end


    function createHtmlElement(type, className, innerHtml) {
        const newDiv = document.createElement(type);
        newDiv.className = className + " hbgenerated";
        newDiv.innerHTML = innerHtml;
        return newDiv;
    }
    return false
}
generer();