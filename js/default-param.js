const noms_equipes_dom = ["CHAPELAINE", "LA CHAPELAINE", "PORTERIE HB", "PORTERIE HANDBALL", "(CHAP-PHB)", "PORTES DE L'ERDRE"];

const salles_domicile = ["JEAN JAHAN","COUTANCIERE"];

function estSalleDomicile(salle){
    return salles_domicile.some(x => salle.toUpperCase().includes(x.toUpperCase()))
}

const sub_equipes = [
    ["HANDBALL CLUB MARSIEN", "St Mars"],
    ["U12M-44-EXC-C-GRAND LIEU SUD RETZ (PHB/ESL/MHC)", "GRAND LIEU"],
    ["HANDBALL CLUB DU GESVRES", "Treillières"],
    ["HANDBALL CLUB LEO LAGRANGE SUCE SUR ERDRE", "Suce sur Erdre"],
    ["UNION SPORTIVE GRANDE PRESQU'ILE HANDBALL", "Guérande"],
    ["U13F-44-EXC-C-GRAND LIEU SUD RETZ (ESL-PHB-MHC)", "Grand Lieu Sud Retz"],
    ["1DTM-44-C-CONVENTION HERIC H/NOZAY OS HB", "Heric Nozay"],
    ["U15f-44-ha-c-hb Ste Luce-chb-thbc", "Ste Luce"],
    ["U14M-44-EXC-E-FHBL/HBCM", "Ligné - St Mars"],
    ["U14m-44-exc-c-alliance Erdre Et Loire (chb-hbsl)", "All. Carquefou / Ste Luce"],
    ["U17FPL-C-AMBRIERES*MAY'N", "Ambrieres"],
    ["AMBRIERES*MAY'N","Ambrieres"],
    ["U13f-44-ha-e-sud Estuaire Hc / Hbc Pornic","Pornic"],
    ["U17FPL-C-LA CHAIZE*LA FERRIERE","LA FERRIERE"],
    ["ST LOUIS DE CHAVAGNES EN PAILLERS","ST LOUIS DE CHAVAGNES"],
    ["LA CHAIZE*LA FERRIERE","LA CHAIZE - LA FERRIERE"]
];

const configurationEquipe = {
    "ecole de hand - 44": {
        "collectif": "EDH-xx",
        "LA CHAPELAINE 1F": "EDH-CHAP-F",
        "LA CHAPELAINE 1M.2M.3M": "EDH-CHAP-M",
        "PORTERIE HANDBALL 1M.2M": "EDH-PORTERIE",
        "color": "#634928",
        "edh": true
    },
    "c-depmpl ; coupe dep masculin pays de la loire": {
        "collectif": "SM-2",
        "1DTM-44-C-ALLIANCE PORTES DE L'ERDRE (PHB-CHAP)": "SM2",
        "color": "#634928"
    },
    "c-regmpl ; coupe reg masculin pays de la loire": {
        "collectif": "SM-1",
        "HMPL-C-CHAPELAINE*PORTE DE L ERDRE": "SM-1",
        "color": "#634928"
    },
    "d1fpl ; division 1 feminine territoriale ;": {
        "collectif": "SF-xx",
        "D1F44-C-LA CHAPELAINE*ALLIANCE PORTES DE L'ERDRE": "SF1",
        "CHAPELAINE*P DE L'E": "SF1",
        "CHAPELAINE*PORTERIE": "SF1",
        "color": "#634928"
    },
    "d2fpl ; division 2 feminine territoriale ;": {
        "collectif": "SF-xx",
        "PORTERIE HANDBALL": "SF2",
        "D2F44-C-PORTERIE*ALLIANCE PORTES DE L'ERDRE": "SF2",
        "CHAPELAINE*P DE L'E": "SF2",
        "PORTERIE*CHAPELAINE": "SF2",
        "color": "#634928"
    },
    "1dtm-44": {
        "collectif": "SM-2",
        "1DTM-44-C-ALLIANCE PORTES DE L'ERDRE (PHB-CHAP)": "SM2",
        "color": "#634928"
    },
    "coupe de france regionale masculine 2023-24": {
        "collectif": "SM-xx",
        "HMPL-C-CHAPELAINE*PORTE DE L ERDRE": "SM-1",
        "CHAPELAINE*PORTE DE L'E": "SM-1",
        "color": "#634928"
    },
    "coupe de france departementale masculine 2023-24": {
        "collectif": "SM-xx",
        "LA CHAPELAINE": "SM-1",
        "PORTERIE HANDBALL": "SM-2",
        "color": "#634928"
    },
    "coupe de france departementale feminine 2023-24": {
        "collectif": "SF-xx",
        "LA CHAPELAINE": "SF-1",
        "D1FPL-C-CHAPELAINE*PORTES DE L'ERDRE": "SF-1",
        "D2FPL-C-PORTERIE*PORTES DE L'ERDRE": "SF-2",
        "color": "#634928"
    },
    "c-depfpl ; coupe dep feminin pays de la loire": {
        "collectif": "SF-xx",
        "LA CHAPELAINE": "SF-1",
        "PORTERIE HANDBALL": "SF-2",
        "D1FPL-C-CHAPELAINE*PORTES DE L'ERDRE": "SF-1",
        "D2FPL-C-PORTERIE*PORTES DE L'ERDRE": "SF-2",
        "color": "#634928"
    },
    "hmpl ; honneur masculine regionale": {
        "collectif": "SM-1",
        "C-HMPL CHAPELAINE*PORTE DE L ERDRE": "SM1",
        "CHAPELAINE*PORTE DE L'E": "SM1",
        "color": "#634928"
    },
    "u10m-44": {
        "collectif": "U10M-x",
        "PORTERIE HANDBALL": "U10M-PORTERIE",
        "color": "#29a659"
    },
    "u11m-44": {
        "collectif": "U11M-x",
        "LA CHAPELAINE 1": "U11M-1",
        "LA CHAPELAINE 2": "U11M-2",
        "color": "#29a659"
    },
    "u11f-44": {
        "collectif": "U11F-x",
        "LA CHAPELAINE": "U11F",
        "color": "#29a659"
    },
    "u12m-44": {
        "collectif": "U12M-x",
        "LA CHAPELAINE 1": "U12M-1",
        "LA CHAPELAINE 2": "U12M-2",
        "color": "#29a659"
    },
    "u13f-44": {
        "collectif": "U13F-x",
        "U13F-44-EXC-E-ALLIANCE PORTES DE L'ERDRE (CHAP-PHB)": "U13F-1",
        "color": "#29a659"
    },
    "u14m-44": {
        "collectif": "U14M-x",
        "LA CHAPELAINE 1": "U14M-CHAP-1",
        "LA CHAPELAINE 1 ": "U14M-CHAP-1",
        "LA CHAPELAINE 2": "U14M-CHAP-2",
        "PORTERIE HANDBALL": "U14M-PORTERIE-1",
        "color": "#29a659"
    },
    "u15f-44": {
        "collectif": "U15F-x",
        "U15F-44-HA-E-ALLIANCE PORTES DE L'ERDRE (CHAP-PHB)": "U15F-1",
        "U15F-44-HB-C-ALLIANCE PORTES DE L'ERDRE (PHB-CHAP)": "U15F-2",
        "color": "#634928"
    },
    "u16m-44": {
        "collectif": "U16M-x",
        "U16M-44-HA-C-ALLIANCE PORTES DE L'ERDRE (PHB-CHAP)": "U16M-1",
        "U16M-44-HB-C-ALLIANCE PORTES DE L'ERDRE (CHAP-PHB)": "U16M-2",
        "color": "#634928"
    },
    "u17f-44": {
        "collectif": "U17F-x",
        "U17F-44-PR-E-ALLIANCE PORTES DE L'ERDRE (PHB-CHAP)": "U17F",
        "color": "#634928"
    },
    "u17fpl ; u17 feminine regionale ; 2eme phase": {
        "collectif": "U17F-x",
        "PORTERIE HANDBALL": "U17F",
        "CHAPELAINE*PORTERIE": "U17F",
        "U17FPL-C-CHAPELAINE*PORTERIE": "U17F",
        "color": "#634928"
    },
    "u19m-44": {
        "collectif": "U19M-x",
        "U19M-44-PR-C-ALLIANCE PORTES DE L'ERDRE (PHB-CHAP)": "U19M-1",
        "U19M-44-HA-C-ALLIANCE PORTES DE L'ERDRE (CHAP-PHB)": "U19M-2",
        "color": "#634928"
    }
};

const ERRORS = []; // Liste d'erreurs corrigeables