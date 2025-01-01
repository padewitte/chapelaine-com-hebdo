function attachBtnGenerationChamp() {
    const selChampionnat = document.getElementById('selChampionnat');
    const btnGenerationChamp = document.getElementById('btnGenerationChamp');
    btnGenerationChamp.addEventListener('click', function (e) {
        e.preventDefault();
        generer_champ(selChampionnat.value);
        scrollToMainSection('sctChampionnat')
        return true
    });
}

function generer_champ(champ){
    console.log("generation du championnat")
    document.getElementById("sctChampionnat").innerHTML = ""
    const matchs = MATCHS_PROGRAMMES_PAR_CHAMP.get(champ);
    let extraHtml = "";
    sctChampionnat

    matchs.forEach(match => {
        extraHtml += "<tr>";
        extraHtml += "<td>" + match.J +"</td>";
        if(is_match_dom(match)){
            extraHtml += "<td>" + match['club vis'] +"</td>";
        }else{
            extraHtml += "<td>" + match['club rec'] +"</td>";
        }
        if(match.le){
            extraHtml += "<td>" + match.le+"</td>";
            extraHtml += "<td>" + match.horaire+"</td>";
        }else{
            extraHtml += "<td>" + getSamediSemaine(match.semaine)+"</td>";
            extraHtml += "<td>00:00:00</td>";
        }

        if(match.Ville){
            extraHtml += "<td>" + match['nom salle'] +"</td>";
            extraHtml += "<td>" + match['adresse salle'] + ", " + match.Ville +"</td>";
        }else{
            extraHtml += "<td>Lieu inconnu</td>";
            extraHtml += "<td></td>";
        }

        if(is_match_dom(match)){
            extraHtml += "<td>" + "A domicile"+"</td>";
        }else{
            extraHtml += "<td>" + "Extérieur"+"</td>";
        }
        extraHtml += "</tr>";
        
    });
    //extraHtml += "</table>";
    document.getElementById("sctChampionnat").appendChild(createHtmlElement("h2", "titre-champ", champ));
    let tableauChamp = createHtmlElement("table", "tableau-champ", extraHtml)
    document.getElementById("sctChampionnat").appendChild(tableauChamp);

}

document.addEventListener('DOMContentLoaded', function () {
    attach_btn_param();
    attachDropZone();
    attachBtnGenerationChamp();
    loadParametres();
});