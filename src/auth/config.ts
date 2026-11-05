export const AUTH_REDIRECT = 'letmoro://auth/callback';
export function validAuthConfiguration(url: string, key: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && !parsed.username && !parsed.password && !parsed.search && !parsed.hash && key.startsWith('sb_publishable_') && key.length > 20;
  } catch { return false; }
}
export function callbackCode(raw: string): string | null {
  try {
    const url = new URL(raw);
    if (url.protocol !== 'letmoro:' || url.hostname !== 'auth' || url.pathname !== '/callback' || url.hash || url.username || url.password || url.port || url.searchParams.getAll('code').length !== 1) return null;
    const code = url.searchParams.get('code');
    return code && code.length <= 2048 && !url.searchParams.has('error') ? code : null;
  } catch { return null; }
}
