import { DataCleaner } from './data-cleaner.js';
import { Configuration } from './default-param.js';

export class DataExtractor {
    static FICHIERS = [];
    static SEMAINES = [];
    static MATCHS_PROGRAMMES_PAR_SEMAINE = new Map();
    static MATCHS_JOUES_PAR_SEMAINE = new Map();

    static CHAMP = [];
    static MATCHS_PROGRAMMES_PAR_CHAMP = new Map();

    static RAW_STATS = {
        SUIVEURS: new Map(),
        ARBITRES: new Map(),
        TABLES: new Map(),
        TUTEURS: new Map(),
        SALLES: new Map(),
        IMPLICATION_POINTS: new Map(),
    }
    static STATS = {}

    static pushMap(key, value, map) {
        if (!map.has(key)) {
            map.set(key, [])
        }
        map.get(key).push(value)
    }

    static incrementMapStat(key, map, skikImplicationPoint) {
        if(!DataCleaner.isStringEmptyOrFalsy(key)){
            if (!map.has(key)) {
                map.set(key, 1)
            }else{
                map.set(key, map.get(key) + 1)
            }
        }
        if(!skikImplicationPoint){
            this.incrementMapStat(key, this.RAW_STATS.IMPLICATION_POINTS, true)
        }
    }

    static extraireSemaines(nouveauFichier) {
        const tmpSemaine = new Set();
        const tmpChamp = new Set();
        nouveauFichier.data.forEach(match => {
            tmpSemaine.add(match.semaine)
            tmpChamp.add(DataCleaner.remove_spaces(match.poule))
            if (nouveauFichier.type == 'programme') {
                this.pushMap(match.semaine, match, this.MATCHS_PROGRAMMES_PAR_SEMAINE)
                this.pushMap(DataCleaner.remove_spaces(match.poule), match, this.MATCHS_PROGRAMMES_PAR_CHAMP)
            } else {
                this.pushMap(match.semaine, match, this.MATCHS_JOUES_PAR_SEMAINE)
                this.compute_stats(match)
            }
        })
        this.FICHIERS.push(nouveauFichier);
        const tmpSet = new Set([...tmpSemaine, ...this.SEMAINES]);
        this.SEMAINES = [...tmpSet].sort();
        const tmpSetChamp = new Set([...tmpChamp, ...this.CHAMP]);
        this.CHAMP = [...tmpSetChamp].sort();
        console.log(this.SEMAINES, this.CHAMP);
        this.sortStats();
    }

    static extraireData(nouveauFichier) {
        this.extraireSemaines(nouveauFichier)
    }

    static compute_stats(match) {
        if(DataCleaner.is_match_dom(match)) {
            //On ne compte pas les arbitrages designés
            if(DataCleaner.isStringEmptyOrFalsy(match['arb1 designe'])){
                this.incrementMapStat(match['arb1 sifle'], this.RAW_STATS.ARBITRES);
                this.incrementMapStat(match['arb2 sifle'], this.RAW_STATS.ARBITRES);
            }
            this.incrementMapStat(match['secretaire'], this.RAW_STATS.TABLES);
            this.incrementMapStat(match['chronometreur'], this.RAW_STATS.TABLES);
            this.incrementMapStat(match['observateur'], this.RAW_STATS.SUIVEURS);
            this.incrementMapStat(match['delegue'], this.RAW_STATS.SUIVEURS);
            this.incrementMapStat(match['resp salle'], this.RAW_STATS.SALLES);
            this.incrementMapStat(match['tuteur table'], this.RAW_STATS.TUTEURS);
        }
    }

    static statsSorter(a,b) {
        return b[1] - a[1]
    }

    static sortStats() {
        this.STATS.SUIVEURS = [...this.RAW_STATS.SUIVEURS.entries()].sort(this.statsSorter);
        this.STATS.ARBITRES = [...this.RAW_STATS.ARBITRES.entries()].sort(this.statsSorter);
        this.STATS.TABLES = [...this.RAW_STATS.TABLES.entries()].sort(this.statsSorter);
        this.STATS.TUTEURS = [...this.RAW_STATS.TUTEURS.entries()].sort(this.statsSorter);
        this.STATS.SALLES = [...this.RAW_STATS.SALLES.entries()].sort(this.statsSorter);
        this.STATS.IMPLICATION_POINTS = [...this.RAW_STATS.IMPLICATION_POINTS.entries()].sort(this.statsSorter);
    }
}