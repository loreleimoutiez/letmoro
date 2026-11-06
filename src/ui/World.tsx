import { useEffect, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import type { Run } from '../domain/prologue.ts';
import { discoveredDistance, routeGeometry } from '../domain/map.ts';

export function World({ run, label }: { run: Run | null; label: string }) {
  const discovered = discoveredDistance(run);
  const route = routeGeometry(run);
  const [zoom, setZoom] = useState(1);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const previousPinch = useRef(0);
  useEffect(() => { if (discovered === 0) setZoom(1); }, [discovered]);
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
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const pinch = distance();
    // Pinch changes magnification only; dragging never moves Moro or the camera.
    if (pinch && previousPinch.current && discovered > route.office) {
      setZoom(value => Math.max(.5, Math.min(2, value * pinch / previousPinch.current)));
    }
    previousPinch.current = pinch;
  }
  function release(event: PointerEvent<HTMLDivElement>) { pointers.current.delete(event.pointerId); previousPinch.current = 0; }
  return <div className="world" role="region" aria-label={label} onPointerDown={down} onPointerMove={move} onPointerUp={release} onPointerCancel={release}>
    <div className="terrain-origin"><div className="terrain" style={{ transform: `scale(${zoom}) translateX(${-discovered}px)` }}>
      <span className="discovered-path" style={{ width: discovered + 24, height: 1 / zoom }} />
      {discovered >= route.crossing && <span className="crossing" style={{ width: 1 / zoom, left: route.crossing }} />}
      {run?.events.some(event => event.type === 'cross') && <span className="post-office" style={{ left: route.office - 18 }} />}
      {Array.from({ length: Math.ceil(discovered / 96) }, (_, index) => 48 + index * 96).filter(x => x < discovered).map((x, index) => <span className="pebble" key={x} style={{ left: x, top: index % 2 ? 5 : -4 }} />)}
    </div></div>
    <span className="moro" />
  </div>;
}
