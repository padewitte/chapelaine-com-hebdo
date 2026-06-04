/**
 * Configuration Google Sheets.
 * À remplir après avoir créé une application dans Google Cloud Console :
 * https://console.cloud.google.com/
 *
 * Étapes :
 * 1. Créer un projet
 * 2. Activer l'API Google Sheets
 * 3. Créer des identifiants OAuth2 (type : application Web)
 * 4. Ajouter http://localhost:PORT en "Origines JavaScript autorisées"
 * 5. Copier le Client ID ci-dessous
 * 6. Créer un Google Sheet et copier son ID (dans l'URL : /spreadsheets/d/SPREADSHEET_ID/)
 */
export const GOOGLE_CONFIG = {
  clientId:      '713725989125-mfr2efe07olh0633u18nql7mnka80vko.apps.googleusercontent.com',
  spreadsheetId: '1SNFp52sRvu_HFLbZPSkUKdsptmrM70mrg_r3dUUQDso',
  scope:         'https://www.googleapis.com/auth/spreadsheets',
};
