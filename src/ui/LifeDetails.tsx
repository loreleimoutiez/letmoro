import type { Run } from '../domain/prologue.ts';
import { civilDate, weekOf } from '../domain/lives.ts';
import type { en } from '../content/ui.ts';
import { realLifeRules } from './useLifeDays.ts';
export function LifeDetails({ run, text: t, historyStatus }: { run: Run; text: typeof en; historyStatus: 'disabled' | 'ready' | 'unavailable' }) {
  const currentWeek = run.life.calendar ? weekOf(civilDate(Date.now(), run.life.calendar.zone)) : '';
  const allowance = run.profile?.mode === 'hard' ? 1 : run.profile?.mode === 'standard' ? 2 : 0;
  return <section className="life-details"><h2>{t.lifeHeading}</h2><p>{run.life.lives} / 3 · {run.life.recovery} / 3 {t.recoveryDays}</p>
    {run.life.calendar && <p className="muted">{run.life.calendar.zone}</p>}
    <p>{allowance === 0 ? t.modeDescriptions.free : `${Math.max(0, allowance - (run.life.restUsed[currentWeek] ?? 0))} ${t.remainingRest}`}</p>
    {run.life.pendingRecovery > 0 && <p>{t.pendingStreak}</p>}
    <p className="muted">{!realLifeRules ? t.lifeValidationPending : historyStatus === 'ready' ? t.lifeRulesActive : t.lifeHistoryUnavailable}</p>
    <table className="journal-table"><colgroup><col className="journal-date-column" /><col /></colgroup><thead><tr><th>{t.dateLabel}</th><th>{t.eventLabel}</th></tr></thead><tbody>{Object.entries(run.life.outcomes).sort(([a], [b]) => b.localeCompare(a)).slice(0, 14).map(([date, result]) => <tr key={date}><td>{date}</td><td>{t.dayOutcomes[result]}{run.life.days[date].source === 'test' && <p className="muted">{t.testTools}</p>}</td></tr>)}</tbody></table>
  </section>;
}
