const FICHIERS = [];
let SEMAINES = [];
const MATCHS_PROGRAMMES_PAR_SEMAINE = new Map();
const MATCHS_JOUES_PAR_SEMAINE = new Map();

let CHAMP = [];
const MATCHS_PROGRAMMES_PAR_CHAMP = new Map();

const RAW_STATS = {
    SUIVEURS: new Map(),
    ARBITRES: new Map(),
    TABLES: new Map(),
    TUTEURS: new Map(),
    SALLES: new Map(),
    IMPLICATION_POINTS: new Map(),
}
const STATS = {}


function pushMap(key, value, map) {
    if (!map.has(key)) {
        map.set(key, [])
    }
    map.get(key).push(value)
}
function incrementMapStat(key, map, skikImplicationPoint) {
    if(!isStringEmptyOrFalsy(key)){
        if (!map.has(key)) {
            map.set(key, 1)
        }else{
            map.set(key, map.get(key) + 1)
        }
    }
    if(!skikImplicationPoint){
        incrementMapStat(key,RAW_STATS.IMPLICATION_POINTS, true)
    }
}


function extraireSemaines(nouveauFichier) {
    const tmpSemaine = new Set();
    const tmpChamp = new Set();
    nouveauFichier.data.forEach(match => {
        tmpSemaine.add(match.semaine)
        tmpChamp.add(remove_spaces(match.poule))
        if (nouveauFichier.type == 'programme') {
            pushMap(match.semaine, match, MATCHS_PROGRAMMES_PAR_SEMAINE)
            pushMap(remove_spaces(match.poule), match, MATCHS_PROGRAMMES_PAR_CHAMP)
        } else {
            pushMap(match.semaine, match, MATCHS_JOUES_PAR_SEMAINE)
            compute_stats(match)
        }
    })
    FICHIERS.push(nouveauFichier);
    const tmpSet = new Set([...tmpSemaine, ...SEMAINES]);
    SEMAINES = [...tmpSet].sort();
    const tmpSetChamp = new Set([...tmpChamp, ...CHAMP]);
    CHAMP = [...tmpSetChamp].sort();
    console.log(SEMAINES, CHAMP);
    sortStats();
}


function extraireData(nouveauFichier) {
    extraireSemaines(nouveauFichier)

}

function compute_stats(match){
    if(is_match_dom(match) ){
        //On ne compte pas les arbitrages designés
        if(isStringEmptyOrFalsy(match['arb1 designe'])){
            incrementMapStat(match['arb1 sifle'],RAW_STATS.ARBITRES);
            incrementMapStat(match['arb2 sifle'],RAW_STATS.ARBITRES);
        }
        incrementMapStat(match['secretaire'],RAW_STATS.TABLES);
        incrementMapStat(match['chronometreur'],RAW_STATS.TABLES);
        incrementMapStat(match['observateur'],RAW_STATS.SUIVEURS);
        incrementMapStat(match['delegue'],RAW_STATS.SUIVEURS);
        incrementMapStat(match['resp salle'],RAW_STATS.SALLES);
        incrementMapStat(match['tuteur table'],RAW_STATS.TUTEURS);
    }
}

function statsSorter(a,b){
    return  b[1] - a[1]
}

function sortStats(){
    STATS.SUIVEURS = [...RAW_STATS.SUIVEURS.entries()].sort(statsSorter);
    STATS.ARBITRES = [...RAW_STATS.ARBITRES.entries()].sort(statsSorter);
    STATS.TABLES = [...RAW_STATS.TABLES.entries()].sort(statsSorter);
    STATS.TUTEURS = [...RAW_STATS.TUTEURS.entries()].sort(statsSorter);
    STATS.SALLES = [...RAW_STATS.SALLES.entries()].sort(statsSorter);
    STATS.IMPLICATION_POINTS = [...RAW_STATS.IMPLICATION_POINTS.entries()].sort(statsSorter);
}