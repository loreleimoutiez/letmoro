import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { auth, googleSignInAvailable } from '../adapters/auth.ts';
import { callbackCode } from './config.ts';

export function useAccount() {
  const [initialized, setInitialized] = useState(!auth);
  const [googleAvailable, setGoogleAvailable] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [recovery, setRecovery] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!auth) return;
    let active = true;
    const client = auth;
    void googleSignInAvailable().then(value => { if (active) setGoogleAvailable(value); });
    void client.auth.getSession().then(({ data, error }) => {
      if (active) { setUser(data.session?.user ?? null); setFailed(Boolean(error)); setInitialized(true); }
    }).catch(() => { if (active) { setFailed(true); setInitialized(true); } });
    const { data } = client.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      setUser(session?.user ?? null);
      if (event === 'PASSWORD_RECOVERY') setRecovery(true);
      if (event === 'SIGNED_OUT') setRecovery(false);
    });
    const seen = new Set<string>();
    const handle = async (raw: string) => {
      const code = callbackCode(raw);
      if (!code || seen.has(code)) return;
      seen.add(code);
      try { const result = await client.auth.exchangeCodeForSession(code); if (active && result.error) setFailed(true); }
      catch { if (active) setFailed(true); }
    };
    const launch = Capacitor.isNativePlatform() ? App.getLaunchUrl().then(result => { if (active && result?.url) return handle(result.url); }).catch(() => { if (active) setFailed(true); }) : Promise.resolve();
    const listener = Capacitor.isNativePlatform() ? App.addListener('appUrlOpen', ({ url }) => { void handle(url); }) : Promise.resolve({ remove: async () => {} });
    void launch;
    return () => { active = false; data.subscription.unsubscribe(); void listener.then(value => value.remove()); };
  }, []);
  return { initialized, googleAvailable, user, recovery, completeRecovery: () => setRecovery(false), failed };
}
