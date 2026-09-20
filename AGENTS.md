# Chapelaine Com Hebdo — Agent Guidelines

## Architecture & Technology Stack
- **Vanilla JavaScript**: This project strictly uses vanilla JavaScript with ES Modules (`import`/`export`). Do not introduce bundlers (Webpack, Vite, Rollup) or transpilers (Babel).
- **No Backend**: The application runs entirely in the browser. All data processing is done client-side. Do not add any server-side logic (e.g., Node.js, Express, Python backends). Data is not persisted across reloads (except when exported via Google Sheets).
- **Native CSS**: Use plain CSS with custom properties (variables) as seen in `css/style.css`. Do not introduce Sass, Less, or Tailwind CSS.
- **HTML**: Keep structure simple and declarative in `index.html`.

## File Structure & Conventions
- **JavaScript Modules (`js/`)**:
  - Keep logic modularized. DOM manipulation (Renderers), data extraction (`data-extractor.js`), parsing (`csv-parser.js`), and cleaning (`data-cleaner.js`) are separated.
  - Configuration files: `competitions.js` maps raw pool names to display names. `google-config.js` stores Google Sheets API credentials.
- **Standalone Scripts (`mail/`, `matchs/`)**:
  - Directories like `mail/` contain one-off shell scripts used for ad-hoc tasks (e.g., sending emails with attachments via `mutt`). Treat these as independent utilities that do not affect the main web application.

## Working with GestHand CSV Data
- The app ingests GestHand CSV exports (`;` separated, UTF-8).
- Differentiate between "Programmes" (no scores) and "Résultats" (with scores).
- Keep data cleaning/normalization logic contained in `js/data-cleaner.js`.
- Ensure changes do not break the auto-table assignments and referee detection logic.

## General Guidelines
- Do not add `package.json` or external dependencies via `npm` or `yarn` for the web frontend.
- When modifying JavaScript, use modern ES6+ syntax that is natively supported by browsers.
- Respect the existing CSS variables (e.g., `--orange`, `--dark`, etc.) defined in `:root`.

## Linting & Formatting Rules
- **Indentation**: Use 2 spaces for indentation.
- **Quotes**: Use single quotes (`'`) for all JavaScript strings unless using template literals.
- **Semicolons**: Always end JavaScript statements with a semicolon.

