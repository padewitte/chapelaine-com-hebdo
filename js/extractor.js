const FICHIERS = [];
let SEMAINES = [];
const MATCHS_PROGRAMMES_PAR_SEMAINE = new Map();
const MATCHS_JOUES_PAR_SEMAINE = new Map();

function pushMap(key, value, map){
    if(!map.has(key)){
        map.set(key, [])
    }
    map.get(key).push(value)
}


function extraireSemaines(nouveauFichier){
    const tmpSemaine = new Set();
    
        nouveauFichier.data.forEach(match => {
            tmpSemaine.add(match.semaine)
            if(nouveauFichier.type == 'programme'){
                pushMap(match.semaine, match, MATCHS_PROGRAMMES_PAR_SEMAINE)
            }else{
                pushMap(match.semaine, match, MATCHS_JOUES_PAR_SEMAINE)
            }
        })
        
    FICHIERS.push(nouveauFichier);
    const tmpSet =  new Set( [...tmpSemaine, ...SEMAINES]);
    SEMAINES =[...tmpSet].sort()
    console.log(SEMAINES);
}


function extraireData(nouveauFichier){
    extraireSemaines(nouveauFichier)
    majSemaines(SEMAINES)
}