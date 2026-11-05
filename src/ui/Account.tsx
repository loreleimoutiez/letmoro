import { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { auth } from '../adapters/auth.ts';
import { AUTH_REDIRECT } from '../auth/config.ts';
import type { Locale } from '../content/ui.ts';
import { accountText } from '../content/account.ts';

type Screen = 'login' | 'signup' | 'reset' | 'password';
export function Account({ locale, user, recovery, completeRecovery, callbackFailed, googleAvailable, landing = false }: { locale: Locale; user: User | null; recovery: boolean; completeRecovery: () => void; callbackFailed: boolean; googleAvailable: boolean; landing?: boolean }) {
  const t = accountText[locale];
  const [screen, setScreen] = useState<Screen>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const current = recovery ? 'password' : screen;
  async function submit() {
    if (!auth || busy) return;
    setBusy(true); setMessage('');
    try {
      if ((current === 'signup' || current === 'password') && password !== confirm) { setMessage(t.mismatch); return; }
      if (current === 'login') {
        const { error } = await auth.auth.signInWithPassword({ email: email.trim(), password });
        setMessage(error ? t.loginError : t.connected);
      } else if (current === 'signup') {
        const { error } = await auth.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: AUTH_REDIRECT } });
        setMessage(error ? t.requestError : t.checkEmail);
      } else if (current === 'reset') {
        const { error } = await auth.auth.resetPasswordForEmail(email.trim(), { redirectTo: AUTH_REDIRECT });
        setMessage(error ? t.requestError : t.resetSent);
      } else {
        const { error } = await auth.auth.updateUser({ password });
        if (error) setMessage(t.requestError); else { completeRecovery(); setMessage(t.updated); }
      }
    } catch { setMessage(t.requestError); }
    finally { setPassword(''); setConfirm(''); setBusy(false); }
  }
  return <section className={`account ${landing ? 'account-landing' : ''}`}>
    {landing ? <header className="auth-brand"><div className="welcome-mark" aria-hidden="true"><svg viewBox="16 16 32 38" shapeRendering="crispEdges"><path fill="#fff" d="M20 20h24v24H20zM20 48h24v3H20z" /></svg></div><h1 tabIndex={-1}>letmoro</h1></header> : <h1 tabIndex={-1}>{t.title}</h1>}
    {callbackFailed && <p role="alert">{t.sessionError}</p>}{message && <p role="status">{message}</p>}{!googleAvailable && !user && <p className="muted">{t.googleUnavailable}</p>}
    {!auth ? <p>{t.unavailable}</p> : user && !recovery ? <>
      <p>{user.email}</p><p className="muted">{t.localProgress}</p>
      <button disabled={busy} onClick={async () => {
        if (!auth) return;
        setBusy(true); try { const { error } = await auth.auth.signOut(); setMessage(error ? t.requestError : ''); } catch { setMessage(t.requestError); } finally { setBusy(false); }
      }}>{t.signOut}</button>
    </> : <>
      {!recovery && <nav className="collection-tabs" aria-label={t.title}>{(['login', 'signup'] as const).map(value => <button key={value} aria-current={current === value ? 'page' : undefined} onClick={() => { setScreen(value); setMessage(''); setPassword(''); setConfirm(''); }}>{t[value]}</button>)}</nav>}
      <form onSubmit={event => { event.preventDefault(); void submit(); }}>
        {current !== 'password' && <label>{t.email}<input type="email" autoComplete="email" required maxLength={254} value={email} onChange={event => setEmail(event.target.value)} /></label>}
        {current !== 'reset' && <label>{current === 'password' ? t.newPassword : t.password}<input type="password" autoComplete={current === 'login' ? 'current-password' : 'new-password'} required minLength={current === 'login' ? 1 : 12} maxLength={128} value={password} onChange={event => setPassword(event.target.value)} /></label>}
        {current === 'login' && <button className="forgot-password" type="button" onClick={() => { setScreen('reset'); setMessage(''); setPassword(''); setConfirm(''); }}>{t.reset}</button>}
        {(current === 'signup' || current === 'password') && <><p className="muted">{t.passwordHint}</p><label>{t.confirm}<input type="password" autoComplete="new-password" required minLength={12} maxLength={128} value={confirm} onChange={event => setConfirm(event.target.value)} /></label></>}
        
        <button type="submit" disabled={busy}>{current === 'password' ? t.savePassword : t[current]}</button>
      </form>
      {!recovery && <><button className="google-signin" disabled={busy || !googleAvailable} onClick={async () => {
        if (!auth) return;
        setBusy(true); setMessage('');
        try {
          const { data, error } = await auth.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: AUTH_REDIRECT, skipBrowserRedirect: true } });
          if (error || !data.url) setMessage(t.requestError);
          else if (Capacitor.isNativePlatform()) await Browser.open({ url: data.url });
          else window.location.assign(data.url);
        } catch { setMessage(t.requestError); }
        finally { setBusy(false); }
      }}>{t.google}</button></>}

    </>}
  </section>;
}
