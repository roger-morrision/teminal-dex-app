export async function clearAppCookies() {
  // HTTP-only cookies cannot be read or cleared by web JavaScript. The backend
  // session expires after 24h; local verified state and wallet auth are still revoked.
}
