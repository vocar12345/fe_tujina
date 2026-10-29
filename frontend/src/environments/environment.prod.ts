/**
 * Production. `apiBaseUrl` is empty so API calls are same-origin ("/api/..."),
 * which is how the deployed setup proxies the BFF. `useBff` is ON: the app
 * mirrors policies to the BFF and hydrates from it, falling back to
 * localStorage whenever the BFF is unreachable (e.g. free-tier cold start).
 */
export const environment = {
  production: true,
  useBff: true,
  apiBaseUrl: '',
};
