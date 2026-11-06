import { useEffect, useRef, useState } from 'react';
import type { Run } from '../domain/prologue.ts';
import { encodeSave } from '../adapters/save.ts';
import { cloudEnabled, readCloudSave, writeCloudSave, SaveConflict } from '../adapters/cloud-save.ts';
import type { CloudSnapshot } from '../adapters/cloud-save.ts';
import { reconcileCloud, snapshotFingerprint } from '../domain/cloud.ts';
import type { SyncPoint } from '../domain/cloud.ts';
import type { Locale } from '../content/ui.ts';

type Status = 'disabled' | 'loading' | 'pending' | 'saved' | 'offline' | 'conflict';
interface Session { userId: string; active: boolean; initialized: boolean; busy: boolean; blocked: boolean; paused: boolean; synced?: { payload: string | null; locale: Locale }; point: SyncPoint | null; remote: CloudSnapshot | null }
export function useCloudSave(userId: string | null, ready: boolean, run: Run | null, locale: Locale, restore: (snapshot: CloudSnapshot, ownerId: string) => void) {
  const [status, setStatus] = useState<Status>(cloudEnabled ? 'loading' : 'disabled');
  const [tick, setTick] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const current = useRef({ payload: run ? encodeSave(run) : null, locale });
  current.current = { payload: run ? encodeSave(run) : null, locale };
  const session = useRef<Session | null>(null);
  const restoreRef = useRef(restore); restoreRef.current = restore;
  const key = (id: string) => `letmoro.cloud.v1.${id}`;
  function remember(owner: Session, point: SyncPoint) {
    owner.point = point;
    localStorage.setItem(key(owner.userId), JSON.stringify(point));
    localStorage.removeItem(`${key(owner.userId)}.reset`);
  }
  useEffect(() => {
    if (!cloudEnabled || !userId || !ready) return;
    const owner: Session = { userId, active: true, initialized: false, busy: false, blocked: false, paused: false, point: null, remote: null };
    session.current = owner;
    setStatus('loading');
    async function load() {
      try {
        const raw = localStorage.getItem(key(owner.userId));
        if (raw) {
          const point = JSON.parse(raw) as SyncPoint;
          if (!Number.isSafeInteger(point.revision) || point.revision < 1 || typeof point.fingerprint !== 'string') throw new Error('Invalid sync checkpoint');
          owner.point = point;
        }
        const remote = await readCloudSave(owner.userId);
        if (!owner.active) return;
        owner.remote = remote;
        const captured = current.current;
        const localFingerprint = await snapshotFingerprint(captured.payload, captured.locale);
        const remoteFingerprint = remote ? await snapshotFingerprint(remote.payload, remote.locale) : null;
        if (!owner.active) return;
        // If gameplay changed during hashing, reevaluate from the current snapshot.
        if (captured !== current.current && (captured.payload !== current.current.payload || captured.locale !== current.current.locale)) { setStatus('offline'); return; }
        const decision = reconcileCloud(localFingerprint, remoteFingerprint, remote?.revision ?? 0, owner.point, captured.payload === null && localStorage.getItem(`${key(owner.userId)}.reset`) !== '1');
        if (decision === 'conflict') { owner.blocked = true; setStatus('conflict'); return; }
        if (remote && (decision === 'restore' || decision === 'equal')) {
          if (decision === 'restore') restoreRef.current(remote, owner.userId);
          remember(owner, { revision: remote.revision, fingerprint: remoteFingerprint! });
        }
        owner.initialized = true;
        setStatus('pending'); setTick(value => value + 1);
      } catch { if (owner.active) setStatus('offline'); }
    }
    void load();
    return () => { owner.active = false; if (session.current === owner) session.current = null; };
  }, [userId, ready, attempt]);

  useEffect(() => {
    const owner = session.current;
    if (!owner?.active || !owner.initialized || owner.busy || owner.blocked) return;
    const timer = window.setInterval(() => {
      if (!owner.active || owner.busy || owner.blocked || owner.paused) return;
      if (owner.synced?.payload === current.current.payload && owner.synced?.locale === current.current.locale) return;
      owner.busy = true;
      void (async () => {
        try {
          const captured = current.current;
          const fingerprint = await snapshotFingerprint(captured.payload, captured.locale);
          if (!owner.active) return;
          if (fingerprint === owner.point?.fingerprint) { owner.synced = captured; setStatus('saved'); return; }
          setStatus('pending');
          const saved = await writeCloudSave(owner.userId, captured, owner.point?.revision ?? 0);
          if (!owner.active) return;
          remember(owner, { revision: saved.revision, fingerprint });
          owner.remote = saved; owner.synced = captured;
          setStatus('saved');
        } catch (error) {
          if (!owner.active) return;
          if (error instanceof SaveConflict) { owner.blocked = true; setStatus('conflict'); }
          else { owner.paused = true; setStatus('offline'); }
        } finally { owner.busy = false; }
      })();
    }, 1200);
    return () => clearInterval(timer);
  }, [tick, userId, ready, attempt]);

  async function resolve(useDevice: boolean) {
    const owner = session.current;
    if (!owner?.active || owner.busy) return;
    owner.busy = true;
    try {
      const remote = await readCloudSave(owner.userId);
      if (!owner.active) return;
      if (useDevice) {
        const captured = current.current;
        const saved = await writeCloudSave(owner.userId, captured, remote?.revision ?? 0);
        if (!owner.active) return;
        const fingerprint = await snapshotFingerprint(captured.payload, captured.locale);
        if (!owner.active) return;
        remember(owner, { revision: saved.revision, fingerprint });
        owner.remote = saved;
      } else if (remote) {
        localStorage.setItem(`${key(owner.userId)}.backup`, JSON.stringify(current.current));
        const fingerprint = await snapshotFingerprint(remote.payload, remote.locale);
        if (!owner.active) return;
        restoreRef.current(remote, owner.userId);
        remember(owner, { revision: remote.revision, fingerprint });
        owner.remote = remote;
      } else throw new Error('Cloud save unavailable');
      if (!owner.active) return;
      owner.initialized = true; owner.blocked = false;
      setStatus('pending'); setTick(value => value + 1);
    } catch { if (owner.active) setStatus('offline'); }
    finally { owner.busy = false; }
  }
  async function eraseProgress() {
    if (!userId || !ready) throw new Error('Save owner unavailable');
    if (!cloudEnabled) { restoreRef.current({payload:null,locale:'en',revision:1},userId); return; }
    const owner = session.current;
    if (!owner?.active || owner.busy || status === 'loading') throw new Error('Save operation in progress');
    owner.busy = true;
    try {
      // Complete the online reset before removing the device copy. CAS rejects races.
      const remote = await readCloudSave(owner.userId);
      if (!owner.active) throw new Error('Save owner changed');
      const cleared = await writeCloudSave(owner.userId,{payload:null,locale:'en'},remote?.revision ?? 0);
      if (!owner.active) throw new Error('Save owner changed');
      const fingerprint = await snapshotFingerprint(null,'en');
      if (!owner.active) throw new Error('Save owner changed');
      restoreRef.current(cleared,owner.userId);
      remember(owner,{revision:cleared.revision,fingerprint});
      owner.remote=cleared; owner.synced={payload:null,locale:'en'};
      owner.initialized=true; owner.blocked=false; owner.paused=false;
      setStatus('saved'); setTick(value=>value+1);
    } finally { owner.busy=false; }
  }
  return { status, resolve, eraseProgress, retry: () => {
    // Reinitialize ownership/reconciliation without automatically resolving conflicts.
    setAttempt(value => value + 1);
  } };
}
