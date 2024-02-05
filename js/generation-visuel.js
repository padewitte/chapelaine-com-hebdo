const fichiers = [];
const semaines = [];
const matchsProgrammesParSemaine = new Map();
const matchsJouesParSemaine = new Map();

function pushMap(key, value, map){
    if(!map.has(key)){
        map.set(key, [])
    }
    map.get(key).push(value)
}