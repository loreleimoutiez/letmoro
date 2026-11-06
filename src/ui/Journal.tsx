import type { Run } from '../domain/prologue.ts';
import type { en } from '../content/ui.ts';
import type { OpeningContent } from '../content/narrative.ts';
import { journalCopy } from '../content/presentation.ts';

export function Journal({ run, text: t, locale, original, content }: { run: Run; text: typeof en; locale: string; original: Record<string, string>; content?: OpeningContent }) {
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'short' }), time = new Intl.DateTimeFormat(locale, { timeStyle: 'short' });
  const entries = run.events.map((event, index) => ({ event, index, text: journalCopy(event, t, original, content) })).filter(entry => entry.text).reverse();
  return <table className="journal-table"><caption className="sr-only">{t.journal}</caption><colgroup><col className="journal-date-column" /><col /></colgroup><thead className="sr-only"><tr><th scope="col">{t.dateLabel}</th><th scope="col">{t.eventLabel}</th></tr></thead><tbody>
    {entries.map(entry => <tr key={entry.index}><td>{entry.event.at ? <time dateTime={entry.event.at}><span>{date.format(new Date(entry.event.at))}</span><span>{time.format(new Date(entry.event.at))}</span></time> : <span title={t.unknownDate}>—</span>}</td><td>{entry.text}{entry.event.type === 'accept' && <p>{t.skillsUnlocked}</p>}</td></tr>)}
  </tbody></table>;
}
