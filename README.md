# Sana AI Playwright Tests

This repo contains Playwright E2E tests for Sana's Workflows feature using TypeScript.

## Setup

1. Install dependencies:
   - `npm install`
2. Install Playwright browsers:
   - `npx playwright install`
3. Optional env config:
   - Copy `.env.example` to `.env` and adjust values if needed.

## Authenticate (Google SSO)

Run the auth helper to save a `storageState.json` file:

```
npm run auth
```

This opens a browser window. Complete the Google login manually, then press Enter in the terminal to save the storage state.

### Troubleshooting Google sign-in

If Google shows "This browser or app may not be secure", use the system Chrome channel:

```
SANA_CHROME_CHANNEL=chrome npm run auth
```

You can also set a persistent profile folder:

```
SANA_USER_DATA_DIR=.auth/chrome npm run auth
```

## Run tests

```
npm test
```

Useful variants:
- `npm run test:ui`
- `npm run test:headed`
- `npm run test:debug`
- `npm run test:report`

## Notes

- Base URL defaults to `https://sana.ai/djjMCfzgRmaf`
- Override via `SANA_BASE_URL`
- Storage state path defaults to `storageState.json`, override with `SANA_STORAGE_STATE`
