import { DataCleaner } from '../core/data-cleaner.js';
import { DataExtractor } from '../core/extractor.js';
import { Configuration } from '../default-param.js';

function genereLigneStat(ligne){
    let extraHtml = "";
    extraHtml += "<tr>";
    extraHtml += "<td>" + ligne[0] +"</td>";
    extraHtml += "<td>" + ligne[1] +"</td>";
    extraHtml += "</tr>";
    return extraHtml;

}

function loadStats() {

    console.log("generation des stats")
    document.getElementById("sctStats").innerHTML = ""
    generateTab(STATS.ARBITRES, "ARBITRES")
    generateTab(STATS.TABLES, "TABLES")
    generateTab(STATS.TUTEURS, "TUTEURS")
    generateTab(STATS.SUIVEURS, "SUIVEURS")
    generateTab(STATS.SALLES, "SALLES")
    generateTab(STATS.IMPLICATION_POINTS, "IMPLICATION_POINTS")
    
}

function generateTab(arrayStat, titre) {
    let extraHtml = "";

    arrayStat.forEach(stat => {
        extraHtml += genereLigneStat(stat)
    });
    //extraHtml += "</table>";
    document.getElementById("sctStats").appendChild(createHtmlElement("h2", "titre-champ", titre));
    let tableauStats = createHtmlElement("table", "tableau-stat", extraHtml)
    document.getElementById("sctStats").appendChild(tableauStats);
}

document.addEventListener('DOMContentLoaded', function () {
    attachDropZone();
    loadParametres();
});