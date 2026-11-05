import { Capacitor, registerPlugin } from '@capacitor/core';
import { createClient } from '@supabase/supabase-js';
import { validAuthConfiguration } from '../auth/config.ts';

interface SecureSessionPlugin {
  get(options: { key: string }): Promise<{ value: string | null }>;
  set(options: { key: string; value: string }): Promise<void>;
  remove(options: { key: string }): Promise<void>;
}
const secure = registerPlugin<SecureSessionPlugin>('SecureSession');
const native = Capacitor.getPlatform() === 'android';
const storage = {
  async getItem(key: string) { return native ? (await secure.get({ key })).value : sessionStorage.getItem(key); },
  async setItem(key: string, value: string) { if (native) await secure.set({ key, value }); else sessionStorage.setItem(key, value); },
  async removeItem(key: string) { if (native) await secure.remove({ key }); else sessionStorage.removeItem(key); },
};
const url = import.meta.env.VITE_SUPABASE_URL ?? '';
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '';
// Public client configuration only. No service-role key or server secret is accepted.
export const auth = validAuthConfiguration(url, key) ? createClient(url, key, {
  auth: { storage, storageKey: 'letmoro.auth.session.v1', flowType: 'pkce', detectSessionInUrl: false, persistSession: true, autoRefreshToken: true },
}) : null;

export async function googleSignInAvailable(): Promise<boolean> {
  if (!auth) return false;
  try {
    const response = await fetch(`${url.replace(/\/$/, '')}/auth/v1/settings`, { headers: { apikey: key } });
    if (!response.ok) return false;
    const settings = await response.json();
    return settings?.external?.google === true;
  } catch { return false; }
}
