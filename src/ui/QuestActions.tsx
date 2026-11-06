import type { Action, Run } from '../domain/prologue.ts';
import { travelCost } from '../domain/prologue.ts';
import type { en } from '../content/ui.ts';
import type { OpeningContent, Topic } from '../content/narrative.ts';

export function QuestActions({ run, text: t, content, act, locale }: {
  run: Run; text: typeof en; content?: OpeningContent; act: (action: Action) => void; locale: string;
}) {
  const traveling = run.stage === 'street' || run.stage === 'delivery';
  const lastTopic = run.discussed.at(-1);
  return <div className="actions">
    {traveling && <><p className="quest-progress">{Math.min(run.reserve, travelCost(run)).toLocaleString(locale)} / {travelCost(run).toLocaleString(locale)} {t.steps}</p><button disabled={run.reserve < travelCost(run)} onClick={() => act({ type: run.stage === 'street' ? 'cross' : 'arrive' })}>{run.stage === 'street' ? t.cross : t.arrive}</button></>}
    {run.stage === 'job' && <>
      {content && <details className="job-dialogue"><summary>{t.askQuestions}</summary><div>{lastTopic && <p role="status">{content.topics[lastTopic].answer}</p>}{(Object.keys(content.topics) as Topic[]).filter(topic => !run.discussed.includes(topic)).map(topic => <button key={topic} onClick={() => act({ type: 'ask', topic })}>{content.topics[topic].question}</button>)}</div></details>}
      <button onClick={() => act({ type: 'accept' })}>{t.accept}</button><button onClick={() => act({ type: 'rest' })}>{t.rest}</button>
    </>}
    {run.stage === 'rest' && <button onClick={() => act({ type: 'reconsider' })}>{t.reconsider}</button>}
    {run.stage === 'handover' && <button onClick={() => act({ type: run.letterDestroyed ? 'report-loss' : 'deliver' })}>{run.letterDestroyed ? t.reportLoss : run.letterOpened ? t.deliverOpened : t.deliver}</button>}
    {run.stage === 'settlement' && <><dl className="receipt">{[[t.deliveryPay, '+8'], [t.deduction1, '−2'], [t.deduction2, '−2'], [t.net, '4']].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value} {t.coins}</dd></div>)}</dl><button onClick={() => act({ type: 'settle' })}>{t.settle}</button></>}
    {(run.stage === 'complete' || run.stage === 'failed') && <p className="muted">{t.end}</p>}
  </div>;
}
