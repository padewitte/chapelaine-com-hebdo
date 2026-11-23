/**
 * Référentiel géographique des clubs adverses et calcul des distances
 * routières aller-retour depuis l'adresse de départ du bénévole.
 */

export const ADRESSE_COUTANCIERE_DEFAUT = 'La Coutancière, Allée des Favrières, 44240 La Chapelle-sur-Erdre';

export const COORD_COUTANCIERE = {
  lat: 47.2917,
  lon: -1.5439,
};

// Référentiel des clubs adverses par numéro fédéral ("Num rec")
export const CLUBS_GEO_PAR_NUM = {
  '5335063': { ville: 'Pacé', cp: '35740', salle: 'Complexe Sportif Chasseboeuf', lat: 48.1483, lon: -1.7736 },
  '5335068': { ville: 'Retiers', cp: '35240', salle: 'Salle omnisports', lat: 47.9136, lon: -1.3811 },
  '5335076': { ville: 'Janzé', cp: '35150', salle: 'Complexe Sportif', lat: 47.9608, lon: -1.4989 },
  '6244001': { ville: 'Nantes', cp: '44200', salle: 'Palais des Sports de Beaulieu', lat: 47.2091, lon: -1.5356 },
  '6244003': { ville: 'Nantes', cp: '44000', salle: 'Gymnase Gaston Serpette', lat: 47.2275, lon: -1.5764 },
  '6244004': { ville: 'Châteaubriant', cp: '44110', salle: 'Centre Municipal des Sports', lat: 47.7175, lon: -1.3767 },
  '6244006': { ville: 'Rezé', cp: '44400', salle: 'Gymnase Andrée Perrichon', lat: 47.1847, lon: -1.5492 },
  '6244007': { ville: 'Saint-Nazaire', cp: '44600', salle: 'Gymnase Pierre de Coubertin', lat: 47.2736, lon: -2.2139 },
  '6244008': { ville: 'Rezé', cp: '44400', salle: 'Gymnase Évelyne Crétual', lat: 47.1812, lon: -1.5644 },
  '6244011': { ville: 'Couëron', cp: '44220', salle: 'Complexe Pierre Moisan', lat: 47.2147, lon: -1.7278 },
  '6244012': { ville: 'Sucé-sur-Erdre', cp: '44240', salle: 'Complexe de la Papinière', lat: 47.3414, lon: -1.5289 },
  '6244014': { ville: 'Clisson', cp: '44190', salle: 'Complexe Sportif du Val de Moine', lat: 47.0872, lon: -1.2836 },
  '6244015': { ville: 'Nantes', cp: '44100', salle: 'Salle Laëtitia', lat: 47.2211, lon: -1.5844 },
  '6244016': { ville: 'Donges', cp: '44480', salle: 'Salle omnisports', lat: 47.3208, lon: -2.0750 },
  '6244019': { ville: 'Trignac', cp: '44570', salle: 'Complexe Sportif', lat: 47.3183, lon: -2.1889 },
  '6244020': { ville: 'Savenay', cp: '44260', salle: 'Gymnase Alice Milliat', lat: 47.3592, lon: -1.9422 },
  '6244021': { ville: 'Nantes', cp: '44300', salle: 'Salle Jean Jahan (Porterie)', lat: 47.2695, lon: -1.5165 },
  '6244024': { ville: 'Saint-Brevin-les-Pins', cp: '44250', salle: 'Complexe Sportif', lat: 47.2464, lon: -2.1667 },
  '6244027': { ville: 'Bouguenais', cp: '44340', salle: 'Complexe Sportif des Bélians', lat: 47.1792, lon: -1.6247 },
  '6244032': { ville: 'Couëron', cp: '44220', salle: 'Salle Patrick Dufief', lat: 47.2147, lon: -1.7278 },
  '6244034': { ville: 'Sainte-Pazanne', cp: '44680', salle: 'Complexe Armand Gauvrit', lat: 47.1031, lon: -1.8108 },
  '6244035': { ville: 'Blain', cp: '44130', salle: 'Salle Catherine Destivelle', lat: 47.4761, lon: -1.7636 },
  '6244036': { ville: 'Pornic', cp: '44210', salle: 'Complexe du Val Saint-Martin', lat: 47.1156, lon: -2.1028 },
  '6244038': { ville: 'La Chapelle-sur-Erdre', cp: '44240', salle: 'La Coutancière', lat: 47.2917, lon: -1.5439 },
  '6244039': { ville: 'Ligné', cp: '44850', salle: 'Complexe Édouard Landrain', lat: 47.4119, lon: -1.3769 },
  '6244041': { ville: 'Nort-sur-Erdre', cp: '44390', salle: 'Salle Marie-Amélie Le Fur', lat: 47.4397, lon: -1.4989 },
  '6244042': { ville: 'Nantes', cp: '44300', salle: 'Salle Jean Les Bats', lat: 47.2328, lon: -1.5122 },
  '6244043': { ville: 'Ancenis-Saint-Géréon', cp: '44150', salle: 'Salle du Pressoir Rouge', lat: 47.3667, lon: -1.1769 },
  '6244044': { ville: 'Saint-Herblain', cp: '44800', salle: 'Salle de la Bourgonnière', lat: 47.2167, lon: -1.6486 },
  '6244045': { ville: 'Sautron', cp: '44880', salle: 'Complexe Sportif de la Forêt', lat: 47.2636, lon: -1.6683 },
  '6244049': { ville: 'Carquefou', cp: '44470', salle: 'Complexe du Moulin Boisseau', lat: 47.2975, lon: -1.4919 },
  '6244050': { ville: 'Savenay', cp: '44260', salle: 'Complexe Polyvalent', lat: 47.3592, lon: -1.9422 },
  '6244054': { ville: 'Riaillé', cp: '44440', salle: 'Salle des Étangs', lat: 47.5194, lon: -1.2953 },
  '6244056': { ville: 'Sainte-Luce-sur-Loire', cp: '44980', salle: 'Salle Éric Tabarly', lat: 47.2494, lon: -1.4864 },
  '6244061': { ville: 'Nozay', cp: '44170', salle: 'Complexe Sportif', lat: 47.5656, lon: -1.6253 },
  '6244071': { ville: 'Saint-Julien-de-Concelles', cp: '44450', salle: 'Salle Le Paladin', lat: 47.2536, lon: -1.3856 },
  '6244073': { ville: 'Pontchâteau', cp: '44160', salle: 'Complexe du Landas', lat: 47.4369, lon: -2.0878 },
  '6244077': { ville: 'Bouaye', cp: '44830', salle: 'Complexe Sportif de la Bellonnière', lat: 47.1436, lon: -1.6917 },
  '6244078': { ville: 'Saint-Mars-du-Désert', cp: '44850', salle: 'Complexe Audrey Le Morvan', lat: 47.3667, lon: -1.4058 },
  '6244082': { ville: 'Le Landreau', cp: '44430', salle: 'Complexe Sportif des Nouelles', lat: 47.2053, lon: -1.3056 },
  '6244083': { ville: 'Montbert', cp: '44140', salle: 'Complexe Sportif', lat: 47.0769, lon: -1.4006 },
  '6244085': { ville: 'Treillières', cp: '44119', salle: 'Complexe Olympie / Marathon', lat: 47.3308, lon: -1.6267 },
  '6244088': { ville: 'Saint-Philbert-de-Grand-Lieu', cp: '44310', salle: 'Complexe Sportif des Chevrets', lat: 47.0392, lon: -1.6400 },
  '6244091': { ville: 'Thouaré-sur-Loire', cp: '44470', salle: 'Complexe Sportif Multisalle', lat: 47.2678, lon: -1.4411 },
  '6244094': { ville: 'Héric', cp: '44810', salle: 'Gymnase du Collège', lat: 47.4125, lon: -1.6517 },
  '6244096': { ville: 'Chauvé', cp: '44320', salle: 'Salle du Pinier', lat: 47.1511, lon: -1.9858 },
  '6244097': { ville: 'Saint-Sébastien-sur-Loire', cp: '44230', salle: 'Gymnase de la Martellière', lat: 47.2072, lon: -1.5025 },
  '6244098': { ville: 'Orvault', cp: '44700', salle: 'Gymnase de la Cholière', lat: 47.2553, lon: -1.6033 },
  '6244108': { ville: 'Guérande', cp: '44350', salle: 'Complexe de Kerbiniou', lat: 47.3281, lon: -2.4292 },
  '6249001': { ville: 'Les Ponts-de-Cé', cp: '49130', salle: 'Complexe Sportif François Bernard', lat: 47.4244, lon: -0.5253 },
  '6249013': { ville: 'Les Hauts-d\'Anjou (Châteauneuf)', cp: '49330', salle: 'Salle omnisports', lat: 47.6550, lon: -0.4969 },
  '6249020': { ville: 'Brissac Loire Aubance', cp: '49320', salle: 'Complexe du Marin', lat: 47.3550, lon: -0.4489 },
  '6249027': { ville: 'Sainte-Gemmes-sur-Loire', cp: '49130', salle: 'Salle omnisports', lat: 47.4242, lon: -0.5858 },
  '6249045': { ville: 'Chemillé-en-Anjou', cp: '49120', salle: 'Salle de la Gabardière', lat: 47.2122, lon: -0.7258 },
  '6249052': { ville: 'Loire-Authion', cp: '49800', salle: 'Complexe Sportif de Brain-sur-l\'Authion', lat: 47.4464, lon: -0.4111 },
  '6249056': { ville: 'Angers', cp: '49000', salle: 'Gymnase Jean Monnet', lat: 47.4667, lon: -0.5950 },
  '6249061': { ville: 'Avrillé', cp: '49240', salle: 'Complexe Sportif Auguste Delaune', lat: 47.5069, lon: -0.5889 },
  '6249068': { ville: 'Beaucouzé', cp: '49070', salle: 'Complexe Sportif Jacques Aubineau', lat: 47.4756, lon: -0.6328 },
  '6249077': { ville: 'Saumur', cp: '49400', salle: 'Gymnase Jean Chacun', lat: 47.2600, lon: -0.0769 },
  '6253012': { ville: 'Mayenne', cp: '53100', salle: 'Salle Gambetta', lat: 48.3025, lon: -0.6136 },
  '6253021': { ville: 'Loiron-Ruillé', cp: '53320', salle: 'Complexe Sportif', lat: 48.0600, lon: -0.9350 },
  '6253037': { ville: 'Bonchamp-lès-Laval', cp: '53960', salle: 'Complexe Sportif', lat: 48.0742, lon: -0.7014 },
  '6253038': { ville: 'L\'Huisserie', cp: '53970', salle: 'Salle omnisports', lat: 48.0239, lon: -0.7689 },
  '6253045': { ville: 'Laval', cp: '53000', salle: 'Salle Constant Laisis', lat: 48.0786, lon: -0.7669 },
  '6253053': { ville: 'Mayenne', cp: '53100', salle: 'Salle Jules Ferry / Gambetta', lat: 48.3025, lon: -0.6136 },
  '6272003': { ville: 'Le Mans', cp: '72000', salle: 'Gymnase du CSC Le Mans', lat: 48.0061, lon: 0.1996 },
  '6272029': { ville: 'La Flèche', cp: '72200', salle: 'Complexe du Petit Versailles', lat: 47.6997, lon: -0.0756 },
  '6272044': { ville: 'Connerré', cp: '72160', salle: 'Gymnase Alhéna', lat: 48.0608, lon: 0.4439 },
  '6285011': { ville: 'Saint-Gilles-Croix-de-Vie', cp: '85800', salle: 'Complexe Sportif de la Soudinière', lat: 46.6975, lon: -1.9444 },
  '6285029': { ville: 'Challans', cp: '85300', salle: 'Complexe Pierre de Coubertin', lat: 46.8458, lon: -1.8789 },
  '6285039': { ville: 'Dompierre-sur-Yon', cp: '85170', salle: 'Complexe Sportif', lat: 46.7383, lon: -1.3931 },
  '6285068': { ville: 'Le Poiré-sur-Vie', cp: '85170', salle: 'Complexe de la Montparière', lat: 46.7683, lon: -1.5083 },
};

/**
 * Calcule la distance à vol d'oiseau (formule de Haversine) en kilomètres.
 * @param {{ lat: number, lon: number }} orig
 * @param {{ lat: number, lon: number }} dest
 * @returns {number}
 */
function distanceHaversineKm(orig, dest) {
  const R = 6371;
  const dLat = ((dest.lat - orig.lat) * Math.PI) / 180;
  const dLon = ((dest.lon - orig.lon) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos((orig.lat * Math.PI) / 180)
    * Math.cos((dest.lat * Math.PI) / 180)
    * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Estime la distance routière aller-retour en kilomètres à partir des coordonnées GPS.
 * Applique un coefficient de détour routier moyen de 1,28 sur l'aller simple,
 * puis multiplie par 2 pour l'aller-retour (minimum 4 km A/R).
 * @param {{ lat: number, lon: number }} coordDepart
 * @param {{ lat: number, lon: number }} coordDestination
 * @returns {number}
 */
export function calculerDistanceRoutiereArKm(coordDepart, coordDestination) {
  if (!coordDepart || !coordDestination) return 0;
  const volOiseau = distanceHaversineKm(coordDepart, coordDestination);
  const allerRoutier = Math.max(2, Math.round(volOiseau * 1.28));
  return allerRoutier * 2;
}

/**
 * Résout les informations géographiques (ville, salle, coordonnées) d'une rencontre à l'extérieur.
 * @param {Object} infosMatch - { numRec, clubRec, villeCsv, cpCsv, salleCsv }
 * @returns {{ ville: string, cp: string, salle: string, lieu: string, coord: { lat: number, lon: number } }}
 */
export function resoudreDestinationMatch(infosMatch) {
  const numRec = (infosMatch.numRec || '').trim();
  const ref = CLUBS_GEO_PAR_NUM[numRec];

  const ville = (infosMatch.villeCsv || ref?.ville || '').trim();
  const cp = (infosMatch.cpCsv || ref?.cp || '').trim();
  const salle = (infosMatch.salleCsv || ref?.salle || '').trim();
  const coord = ref
    ? { lat: ref.lat, lon: ref.lon }
    : COORD_COUTANCIERE;

  let lieu = ville;
  if (salle && ville) {
    lieu = `${ville} (${salle})`;
  } else if (salle) {
    lieu = salle;
  } else if (!lieu) {
    lieu = infosMatch.adversaire || 'Extérieur';
  }

  return {
    ville,
    cp,
    salle,
    lieu,
    coord,
  };
}

/**
 * Géocode une adresse postale en France via l'API publique data.gouv.fr.
 * En cas d'échec ou d'adresse par défaut, retourne les coordonnées de La Coutancière.
 * @param {string} adresse
 * @returns {Promise<{ lat: number, lon: number, label: string }>}
 */
export async function geocoderAdresse(adresse) {
  const texte = (adresse || '').trim();
  if (!texte || texte.toLowerCase().includes('coutanciere') || texte.toLowerCase().includes('coutancière')) {
    return { ...COORD_COUTANCIERE, label: ADRESSE_COUTANCIERE_DEFAUT };
  }

  try {
    const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(texte)}&limit=1`;
    const reponse = await fetch(url);
    if (!reponse.ok) throw new Error('Réponse API Adresse non valide');
    const json = await reponse.json();
    const feature = json?.features?.[0];
    if (feature?.geometry?.coordinates) {
      const [lon, lat] = feature.geometry.coordinates;
      return {
        lat,
        lon,
        label: feature.properties?.label || texte,
      };
    }
  } catch (err) {
    console.warn('Géocodage hors-ligne ou indisponible, repli sur La Coutancière :', err);
  }

  return { ...COORD_COUTANCIERE, label: texte };
}
