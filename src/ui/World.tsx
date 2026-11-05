import { useEffect, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import type { Run } from '../domain/prologue.ts';
import { clampVisit, discoveredDistance } from '../domain/map.ts';

export function World({ run, label, locale }: { run: Run | null; label: string; locale: string }) {
  const discovered = discoveredDistance(run);
  const [position, setPosition] = useState(discovered);
  const [zoom, setZoom] = useState(1);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const previousPinch = useRef(0);
  useEffect(() => { setPosition(discovered); if (discovered === 0) setZoom(1); }, [discovered]);
  function distance() {
    const points = [...pointers.current.values()];
    return points.length === 2 ? Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y) : 0;
  }
  function down(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    previousPinch.current = distance();
  }
  function move(event: PointerEvent<HTMLDivElement>) {
    const previous = pointers.current.get(event.pointerId);
    if (!previous) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const pinch = distance();
    if (pinch && previousPinch.current && discovered > 160) {
      setZoom(value => Math.max(.5, Math.min(2, value * pinch / previousPinch.current)));
    } else if (pointers.current.size === 1) {
      setPosition(value => clampVisit(value - (event.clientX - previous.x) / zoom, discovered));
    }
    previousPinch.current = pinch;
  }
  function release(event: PointerEvent<HTMLDivElement>) { pointers.current.delete(event.pointerId); previousPinch.current = 0; }
  return <div className="world" role="region" aria-label={label} onPointerDown={down} onPointerMove={move} onPointerUp={release} onPointerCancel={release}>
    <div className="terrain-origin"><div className="terrain" style={{ transform: `scale(${zoom}) translateX(${-position}px)` }}>
      <span className="discovered-path" style={{ width: discovered + 24, height: 1 / zoom }} />
      {discovered >= 160 && <span className="crossing" style={{ width: 1 / zoom }} />}
      {run?.events.some(event => event.type === 'cross') && <span className="post-office" />}
      {[72, 136, 250, 410, 520].filter(x => x < discovered).map((x, index) => <span className="pebble" key={x} style={{ left: x, top: index % 2 ? 5 : -4 }} />)}
    </div></div>
    <span className="moro" />
    {discovered > 0 && <div className="map-access">
      <button onClick={() => setPosition(0)} aria-label={locale === 'fr' ? 'Revenir au départ' : 'Return to the start'}>&lt;</button>
      <button onClick={() => setPosition(discovered)} aria-label={locale === 'fr' ? 'Revenir au trajet' : 'Return to the journey'}>&gt;</button>
      {discovered > 160 && <><button onClick={() => setZoom(value => Math.max(.5, value - .25))} aria-label={locale === 'fr' ? 'Dézoomer' : 'Zoom out'}>−</button><button onClick={() => setZoom(value => Math.min(2, value + .25))} aria-label={locale === 'fr' ? 'Zoomer' : 'Zoom in'}>+</button></>}
    </div>}
  </div>;
}
