function attachBtnGenerationChamp() {
    const selChampionnat = document.getElementById('selChampionnat');
    const btnGenerationChamp = document.getElementById('btnGenerationChamp');
    btnGenerationChamp.addEventListener('click', function (e) {
        e.preventDefault();
        generer_champ(selChampionnat.value);
    });
}

function generer_champ(champ){
    console.log("generation du championnat")
    const matchs = MATCHS_PROGRAMMES_PAR_CHAMP.get(champ);
    let extraHtml = "";
    matchs.forEach(match => {
        extraHtml += "<tr>";
        extraHtml += "<td>" + match.J +"</td>";
        extraHtml += "<td>" + "TODO Opposition" +"</td>";
        extraHtml += "<td>" + match.le+"</td>";
        extraHtml += "<td>" + match.horaire+"</td>";
        extraHtml += "<td>" + match['nom salle'] +"</td>";
        extraHtml += "<td>" + match['adresse salle'] + ", " + match.Ville +"</td>";
        extraHtml += "<td>" + "A domicile/Extérieur"+"</td>";
        extraHtml += "</tr>";
    });
    //extraHtml += "</table>";
    let tableauChamp = createHtmlElement("table", "tableau-champ", extraHtml)
    document.getElementById("sctChampionnat").appendChild(tableauChamp);

}

document.addEventListener('DOMContentLoaded', function () {
    attach_btn_param();
    attachDropZone();
    attachBtnGenerationChamp();
    loadParametres();
});