const FICHIERS = [];
let SEMAINES = [];
const MATCHS_PROGRAMMES_PAR_SEMAINE = new Map();
const MATCHS_JOUES_PAR_SEMAINE = new Map();

let CHAMP = [];
const MATCHS_PROGRAMMES_PAR_CHAMP = new Map();


function pushMap(key, value, map) {
    if (!map.has(key)) {
        map.set(key, [])
    }
    map.get(key).push(value)
}


function extraireSemaines(nouveauFichier) {
    const tmpSemaine = new Set();
    const tmpChamp = new Set();
    nouveauFichier.data.forEach(match => {
        tmpSemaine.add(match.semaine)
        tmpChamp.add(match.poule)
        if (nouveauFichier.type == 'programme') {
            pushMap(match.semaine, match, MATCHS_PROGRAMMES_PAR_SEMAINE)
            pushMap(remove_spaces(match.poule), match, MATCHS_PROGRAMMES_PAR_CHAMP)
        } else {
            pushMap(match.semaine, match, MATCHS_JOUES_PAR_SEMAINE)
        }
    })
    FICHIERS.push(nouveauFichier);
    const tmpSet = new Set([...tmpSemaine, ...SEMAINES]);
    SEMAINES = [...tmpSet].sort();
    const tmpSetChamp = new Set([...tmpChamp, ...CHAMP]);
    CHAMP = [...tmpSetChamp].sort();
    console.log(SEMAINES, CHAMP);
}


function extraireData(nouveauFichier) {
    extraireSemaines(nouveauFichier)

}
