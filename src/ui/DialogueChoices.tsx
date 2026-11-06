import { useState, useRef } from 'react';
import type { ReactNode } from 'react';

// Reused by conversations: details temporarily replace, rather than stack on, initial choices.
export function DialogueChoices({ label, back, initial, children }: { label: string; back: string; initial: ReactNode; children: ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  return <div className="dialogue-choices">
    <button ref={toggle} aria-expanded={expanded} onClick={() => { setExpanded(value => !value); toggle.current?.focus(); }}>{expanded ? back : label}</button>
    {expanded ? <div className="dialogue-details">{children}</div> : initial}
  </div>;
}
