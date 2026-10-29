/**
 * Development defaults. `useBff` is OFF locally so the app (and Playwright E2E)
 * run deterministically against localStorage without needing the BFF up.
 * To exercise the BFF locally, set useBff: true and apiBaseUrl to the BFF URL.
 */
export const environment = {
  production: false,
  useBff: false,
  apiBaseUrl: 'http://localhost:3000',
};
