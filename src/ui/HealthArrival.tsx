import type { en } from '../content/ui.ts';
import type { StepSnapshot } from '../health/steps.ts';
export function HealthArrival({ text: t, snapshot, busy, initialized, supported, connect, continueGame }: {
  text: typeof en; snapshot: StepSnapshot; busy: boolean; initialized: boolean; supported: boolean; connect: () => void; continueGame: () => void;
}) {
  return <main className="health-arrival"><section aria-labelledby="health-arrival-title"><h1 id="health-arrival-title">{t.healthArrivalTitle}</h1>
    <p>{supported ? t.healthArrivalBody : t.healthWeb}</p>
    <p className="muted">{t.healthDataUse}</p>
    <p className="muted" role="status">{!initialized || busy ? t.checkingConnection : snapshot.status === 'permission-required' ? t.permission : snapshot.status === 'error' ? t.error : t.disconnected}</p>
    {supported && <button disabled={busy || !initialized} onClick={connect}>{t.connect}</button>}
    <button className="back-button" disabled={!initialized} onClick={continueGame}>{t.connectLater}</button>
  </section></main>;
}
