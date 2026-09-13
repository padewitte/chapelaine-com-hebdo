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
  clientId:      '915818676755-376dssnanvd6vfmfvbev3dk58vn0g57u.apps.googleusercontent.com',
  spreadsheetId: '1b6PG45nRn--kJv-ARBqHDBx7xSumNWMuzcWZIkqshp4',
  scope:         'https://www.googleapis.com/auth/spreadsheets',
};
