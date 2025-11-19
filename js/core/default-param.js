export class Configuration {
    static noms_equipes_dom = ["CHAPELAINE", "LA CHAPELAINE", "PORTERIE HB", "PORTERIE HANDBALL","PORTERIE*", "PORTERIE", "(CHAP-PHB)", "PORTES DE L'ERDRE"];

    static salles_domicile = ["JEAN JAHAN","COUTANCIERE","LA COUTANCIERE"];

    static isHomeVenue(salle) {
        return this.salles_domicile.includes(salle.toUpperCase());
    }

    static sub_equipes = [
        ["HANDBALL CLUB MARSIEN", "St Mars"],
        ["U12M-44-EXC-C-GRAND LIEU SUD RETZ (PHB/ESL/MHC)", "GRAND LIEU"],
        ["C - Grand Lieu Sud Retz (phb/esl/mhc)", "GRAND LIEU"],
        ["C - Grand Lieu Sud Retz 1 (esl/mhc/phb)", "GRAND LIEU"],
        ["E - Grand Lieu Sud Retz (phb/esl/mhc)", "GRAND LIEU"],
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
        ["LA CHAIZE*LA FERRIERE","LA CHAIZE - LA FERRIERE"],
        ["Honm72c-us Flechois*ctsf","Us Flechois"],
        ["U16m-44-ha-e-grand Lieu Sud Retz (phb.esl.mhc)","Grand Lieu"],
        ["U14m-44-ha-e-grand Lieu Sud Retz (phb.esl.mhc)","Grand Lieu"],
        ["U12m-44-exc-c-grand Lieu Sud Retz (esl.mhc.phb)","Grand Lieu"],
        ["Hau15f44e-asbr-arhb","Asb Rezé"],
        ["ESH PAYS DU MANS*   2","ESH Pays du Mans"]
    ];

    static configurationEquipe = {
        "1dtm-44": {
            "collectif": "SM-2",
            "1DTM44C-PORTERIE HB*ALLIANCE PORTES DE L'ERDRE": "SM-2",
        },
        "3dtm-44": {
            "collectif": "SM-3",
            "3DTM44C-PORTERIE HB*ALLIANCE PORTES DE L'ERDRE": "SM3",
        },
        "c-depfpl ; coupe dep feminin pays de la loire": {
            "collectif": "SF-xx",
            "LA CHAPELAINE": "SF-1",
            "PORTERIE HANDBALL": "SF-2",
            "D1FPL-C-CHAPELAINE*PORTES DE L'ERDRE": "SF-1",
            "D2FPL-C-PORTERIE*PORTES DE L'ERDRE": "SF-2",
        },
        "c-depmpl ; coupe dep masculin pays de la loire": {
            "collectif": "SM-2",
            "1DTM-44-C-ALLIANCE PORTES DE L'ERDRE (PHB-CHAP)": "SM-2",
        },
        "c-regmpl ; coupe reg masculin pays de la loire": {
            "collectif": "SM-1",
            "HMPL-C-CHAPELAINE*PORTE DE L ERDRE": "SM-1",
        },
        "coupe de france departementale feminine 2025-26": {
            "collectif": "SF-xx",
            "LA CHAPELAINE": "SF-1",
            "PORTERIE HANDBALL": "SF-2",
            "D1FPL-C-CHAPELAINE*PORTES DE L'ERDRE": "SF-1",
            "D2FPL-C-PORTERIE*PORTES DE L'ERDRE": "SF-2",
            "PORTES DE L'ERDRE (PHB)": "SF-2",
            "D1F62C-PORTERIE* ALLIANCE PORTES DE L ERDRE": "SF-2"
        },
        "coupe de france departementale masculine 2025-26": {
            "collectif": "SM-xx",
            "LA CHAPELAINE": "SM-1",
            "PORTERIE HANDBALL": "SM-2",
            "PORTES DE L'ERDRE (PHB)": "SM-2",
            "1DTM44C-PORTERIE HB*ALLIANCE PORTES DE L'ERDRE": "SM-2"
        },
        "coupe de france regionale feminine 2025-26":{
            "LA CHAPELAINE": "SF-1",
            "LA CHAPELAINE*": "SF-1",
        },
        "coupe de france regionale masculine 2025-26": {
            "collectif": "SM-xx",
            "HMPL-C-CHAPELAINE*PORTE DE L ERDRE": "SM-1",
            "CHAPELAINE*PORTE DE L'E": "SM-1",
            "LA CHAPELAINE":"SM-1",
            "HM62C-LA CHAPELAINE* ALLIANCE PORTES DE L ERDRE":"SM-1",
        },
        "coupe pays de la loire departementale feminine":{
            "collectif": "SF-2",
            "PORTES DE L'ERDRE (PHB)": "SF-2",
        },
        "coupe pays de la loire departementale masculine":{
            "collectif": "SM-2",
            "PORTES DE L'ERDRE (PHB)": "SM-2",
            "1DTM44C-PORTERIE HB*ALLIANCE PORTES DE L'ERDRE": "SM-2",
        },
        "coupe pays de la loire regionale feminine 25_26":{
            "LA CHAPELAINE": "SF-1",
            "LA CHAPELAINE*": "SF-1",
            "PORTES DE L'ERDRE (CHAPELAINE)":"SF-1",
            "HONF62C-CHAPELAINE* ALLIANCE PORTES DE L ERDRE":"SF-1"
        },
        "coupe pays de la loire regionale masculine 25_26":{
            "collectif": "SM-1",
            "PORTES DE L'ERDRE (CHAPELAINE)": "SM-1",
            "HM62C-LA CHAPELAINE* ALLIANCE PORTES DE L ERDRE": "SM-1"
        },
        "coupe tag perform u19m 44":{
            "collectif":"U19M-x",
            "U19M44C-PORTERIE HB*ALLIANCE PORTES DE L'ERDRE":"U19M-1"
        },
        "coupe u16m 44":{
            "collectif":"U16M-x",
            "U16M44C-LA CHAPELAINE*ALLIANCE PORTES DE L'ERDRE":"U16M-1",
            "U16M44C-PORTERIE HB*ALLIANCE PORTES DE L'ERDRE":"U16M-2"
        },
        "coupe u17f 44":{
            "collectif":"U17F-x",
            "U17F44E-LA CHAPELAINE*ALLIANCE PORTES DE L'ERDRE":"U17F"
        },
        "d1fpl ; division 1 feminine territoriale": {
            "collectif": "SF-xx",
            "D1F62C-PORTERIE* ALLIANCE PORTES DE L ERDRE": "SF-2",
            "ALLIANCE PORTES DE L ERDRE": "SF-2",
            "PORTERIE*PORTES... 2": "SF-2"
        },
        "ecole de hand feminine - 44": {
            "collectif": "EDH-xx",
            "LA CHAPELAINE 1F": "EDH-CHAP-F",
            "edh": true
        },
        "ecole de hand mixte - 44": {
            "collectif": "EDH-xx",
            "LA CHAPELAINE 1F": "EDH-CHAP-F",
            "LA CHAPELAINE 1M.2M.3M": "EDH-CHAP-M",
            "LA CHAPELAINE 1M.2M.3M.4M": "EDH-CHAP-M",
            "PORTERIE HANDBALL 1M.2M": "EDH-PORTERIE",
            "edh": true
        },
        "hfpl ; honneur feminine regionale": {
            "collectif": "SF-xx",
            "D1F44-C-LA CHAPELAINE*ALLIANCE PORTES DE L'ERDRE": "SF-1",
            "CHAPELAINE*P DE L'E": "SF-1",
            "CHAPELAINE*PORTERIE": "SF-1",
            "LA CHAPELAINE": "SF-1",
            "LA CHAPELAINE*": "SF-1",
            "HONF62C-CHAPELAINE* ALLIANCE PORTES DE L ERDRE": "SF-1",
            "CHAPELAINE*PORTES... 1": "SF-1"
        },
        "hmpl; honneur masculine regionale": {
            "collectif": "SM-1",
            "HM62C-LA CHAPELAINE* ALLIANCE PORTES DE L ERDRE": "SM-1",
            "CHAPELAINE*PORTES DE L ERDRE": "SM-1",
            "ALLIANCE PORTES DE L ERDRE": "SM-1",
            "CHAPELAINE*PORTERIE 1": "SM-1"
        },
        "tournois de detection u13f": {
            "collectif": "U13F-x",
            "LA CHAPELAINE": "U13F-1",
            "LA CHAPELAINE 1": "U13F-1",
            "LA CHAPELAINE 2": "U13F-2",
            "color": "#29a659"
        },
        "tournois de detection u14m": {
            "collectif": "U14M-x",
            "LA CHAPELAINE 1": "U14M-1",
            "LA CHAPELAINE  1 ": "U14M-1",
            "LA CHAPELAINE 2": "U14M-2",
            "color": "#29a659"
        },
        "tournois de detection u15f": {
            "collectif": "U15F-x",
            "PRU15F44C-LA CHAPELAINE*ALLIANCE PORTES DE L'ERDRE": "U15F-1",
            "HAU15F44C-PORTERIE*ALLIANCE PORTES DE L'ERDRE": "U15F-2"
        },
        "u10m-44": {
            "collectif": "U10M-x",
            "PORTERIE HANDBALL": "U10M-PORTERIE"
        },
        "u11f-44": {
            "collectif": "U11F-x",
            "LA CHAPELAINE": "U11F",
            "LA CHAPELAINE 1": "U11F-1",
            "LA CHAPELAINE 2": "U11F-2"
        },
        "u11m-44": {
            "collectif": "U11M-x",
            "LA CHAPELAINE 1": "U11M-1",
            "LA CHAPELAINE 2": "U11M-2",
            "LA CHAPELAINE 3": "U11M-3",
            "PORTERIE HANDBALL 1": "U11M1-PORTERIE",
            "PORTERIE HANDBALL 2": "U11M2-PORTERIE"
        },
        "u12m-44": {
            "collectif": "U12M-x",
            "LA CHAPELAINE": "U12M-1"
        },
        "u13f-44": {
            "collectif": "U13F-x",
            "U13F-44-EXC-E-ALLIANCE PORTES DE L'ERDRE (CHAP-PHB)": "U13F-1",
            "LA CHAPELAINE": "U13F-1"
        },
        "u14m-44": {
            "collectif": "U14M-x",
            "LA CHAPELAINE 1": "U14M-1",
            "LA CHAPELAINE 2": "U14M-2"
        },
        "u15f-44": {
            "collectif": "U15F-x",
            "PRU15F44C-LA CHAPELAINE*ALLIANCE PORTES DE L'ERDRE": "U15F-1",
            "HAU15F44C-PORTERIE*ALLIANCE PORTES DE L'ERDRE": "U15F-2"
        },
        "u16m-44": {
            "collectif": "U16M-x",
            "PRU16M44C-LA CHAPELAINE*ALLIANCE PORTES DE L'ERDRE": "U16M-1",
            "HAU16M44C-PORTERIE HB*ALLIANCE PORTES DE L'ERDRE": "U16M-2",
        },
        "u17f-44": {
            "collectif": "U17F-x",
            "HAU17F44E-LA CHAPELAINE*ALLIANCE PORTES DE L'ERDRE": "U17F",
        },
        "u19m-44": {
            "collectif": "U19M-x",
            "PRU19M44C-PORTERIE HB*ALLIANCE PORTES DE L'ERDRE": "U19M-1",
            "HAU19M44C-LA CHAPELAINE*ALLIANCE PORTES DE L'ERDRE": "U19M-2",
        },
        "u20fpl; u20feminine territoriale":{
            "collectif": "U20F-x",
            "LA CHAPELAINE*": "U20F",
            "LA CHAPELAINE": "U20F",
            "U20F44C_CHAPELAINE HB*ALLIANCE PORTES DE L ERDRE": "U20F",
        }
    };

    static ERRORS = []; // Liste d'erreurs corrigeables
}
