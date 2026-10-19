# Daily Intake Tracker — PWA

A static, offline-capable food diary and recipe manager. No build step, account backend or database is needed. All nutrition records remain in browser storage on the device.

## Upload to GitHub and deploy on Vercel

1. Extract the ZIP and open Daily-Intake-Tracker-PWA.
2. Upload everything inside this folder to your repository. Keep index.html at the repository root and retain the icons folder. Do not upload personal backup JSON files.
3. In Vercel, import the repository. Choose Framework Preset: Other; Root Directory: repository root; leave Build Command empty; set Output Directory to `.`. No install command or environment variables are needed.
4. Deploy and open the production HTTPS address. Use that same address consistently; changing the domain creates a separate data store.
5. On iPhone, open in Safari, Share → Add to Home Screen, enable Open as Web App if shown, then Add. Open the Home Screen app online and wait for “Ready for offline use on this device.”
6. Turn on Airplane Mode, close and reopen the app, and test a food entry. Turn Airplane Mode off again afterward.

## Export and restore

The Backup & offline card is on the Backup page. Export backup downloads a dated JSON file with all diary dates, saved foods, recipes, comments, electrolytes and targets. Save this in Files or another safe location.

Restore backup accepts one of these JSON files, validates it, and displays counts before confirmation. Restore REPLACES current saved data rather than merging it. Unsaved drafts are cleared. Cancel leaves your data unchanged. A local undo copy is saved before replacement; Undo last restore returns to that copy, replacing any entries added after the restore. Export those newer entries first if you want to keep them. The undo copy is overwritten by the next restore and is not a substitute for an external backup.

Files larger than 20 MB, unsupported versions and malformed records are rejected. A storage failure prevents restoration. Historical recipe logs are independent snapshots and are preserved by export/restore.

Backups are plain JSON, not encrypted. Keep them private. There is no automatic sync with another browser, device, or the native iPhone app. Clearing site data can erase both records and the local undo copy.

## Offline and updates

The service worker caches the complete app, including icons. Logging, recipes, targets and backups operate locally after initial setup. Updates download in the background; close all tracker windows and reopen when the update message appears. Save drafts first. Updates do not clear saved records.

When editing any cached app file, increment the CACHE version in sw.js before deploying. This installs a complete new set of app files before replacing the old cache. HTTPS is required in production; localhost also works for development. Opening index.html directly as a file does not install the service worker.

## Testing performed

- Existing 17 nutrition/conversion/autocomplete/aggregation assertions passed.
- Backup round-trip retained diary snapshots, recipes, targets, optional null electrolytes and explicit zeros.
- Invalid data/version/date/duplicate-ID checks passed.
- Restore handler checks passed for confirmation, cancellation, storage failure, replacement and undo.
- JavaScript syntax and all service-worker asset paths checked.
- Browser showed “Ready for offline use”; app reloaded successfully after stopping the local server.
- Physical iPhone installation, Safari file picker/export, and deployed Vercel behavior still need device testing.

Run calculation tests with `node core.test.cjs` and backup tests with `node backup.test.cjs`.

## Navigation update (cache v2)

Tabs are Home, Diary, Recipe, Backup. Home contains the calendar, Daily overview and electrolytes. Diary contains food entry and the diary, with a date shortcut to the Home calendar. Recipe Log opens Diary. Backup controls appear only on Backup. Saved storage format and key are unchanged.
