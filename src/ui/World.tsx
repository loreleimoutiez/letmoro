import { useEffect, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import type { Run, Action } from '../domain/prologue.ts';
import { availableDirections, directions, enableNavigation, positionOn, worldGraph } from '../domain/navigation.ts';
import { encounterMarkers, knownPlaces } from '../domain/encounters.ts';
import { clampZoom, wheelZoom, MAX_ZOOM } from '../domain/viewport.ts';
import type { OpeningContent } from '../content/narrative.ts';
import type { en } from '../content/ui.ts';

export function World({ run, label, text: t, content, act, controls, choiceVisible }: {
  run: Run; label: string; text: typeof en; content?: OpeningContent; act: (action: Action) => void; controls: boolean; choiceVisible: boolean;
}) {
  const nav = run.navigation ?? enableNavigation(run).navigation, view = { ...run, navigation: nav };
  const graph = worldGraph(view), position = positionOn(view, nav), available = availableDirections(view);
  const [zoom, setZoom] = useState(1), [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const world = useRef<HTMLDivElement>(null), pointers = useRef(new Map<number, { x: number; y: number }>());
  const previousPinch = useRef(0);
  const extents = Object.entries(nav.walked).flatMap(([id, range]) => range ? [positionOn(view, { ...nav, edge: id as typeof nav.edge, offset: range.min }), positionOn(view, { ...nav, edge: id as typeof nav.edge, offset: range.max })] : []);
  const radiusX = Math.max(48, ...extents.map(point => Math.abs(point.x - position.x) + 64));
  const radiusY = Math.max(48, ...extents.map(point => Math.abs(point.y - position.y) + 96));
  const fitZoom = clampZoom(Math.min(1, Math.max(80, size.width - 80) / (2 * radiusX), Math.max(80, size.height - 240) / (2 * radiusY)));
  const minimumZoom = Math.min(.15, fitZoom);
  const bounds = useRef(minimumZoom); bounds.current = minimumZoom;
  useEffect(() => {
    const element = world.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }));
    observer.observe(element);
    function wheel(event: WheelEvent) {
      event.preventDefault();
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? element!.clientHeight : 1);
      setZoom(value => wheelZoom(value, delta, bounds.current));
    }
    element.addEventListener('wheel', wheel, { passive: false });
    return () => { observer.disconnect(); element.removeEventListener('wheel', wheel); };
  }, []);
  useEffect(() => { const parent = world.current?.parentElement; parent?.style.setProperty('--world-zoom', String(zoom)); }, [zoom]);
  const fresh = run.events.length === 0;
  useEffect(() => { if (fresh) setZoom(1); }, [fresh]);
  function distance() {
    const points = [...pointers.current.values()];
    return points.length === 2 ? Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y) : 0;
  }
  function down(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    previousPinch.current = distance();
  }
  function move(event: PointerEvent<HTMLDivElement>) {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const pinch = distance();
    if (pinch && previousPinch.current) {
      const ratio = pinch / previousPinch.current;
      setZoom(value => clampZoom(value * ratio, minimumZoom));
    }
    previousPinch.current = pinch;
  }
  function release(event: PointerEvent<HTMLDivElement>) { pointers.current.delete(event.pointerId); previousPinch.current = distance(); }
  const markers = encounterMarkers(run), visited = knownPlaces(run);
  const labels: { x: number; y: number; width: number }[] = [];
  const places = [...visited].sort((a, b) => Math.hypot(graph.places[a].x - position.x, graph.places[a].y - position.y) - Math.hypot(graph.places[b].x - position.x, graph.places[b].y - position.y));
  return <>
    <div ref={world} className="world" role="region" aria-label={label} tabIndex={0} onKeyDown={event => {
      if (event.key === '+' || event.key === '=') { event.preventDefault(); setZoom(value => clampZoom(value * 1.25, minimumZoom)); }
      if (event.key === '-') { event.preventDefault(); setZoom(value => clampZoom(value / 1.25, minimumZoom)); }
    }} onPointerDown={down} onPointerMove={move} onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release}>
      <div className="terrain-origin"><div className="terrain" style={{ transform: `scale(${zoom}) translate(${-position.x}px, ${-position.y}px)` }} data-zoom={zoom}>
        <svg className="route-lines" aria-hidden="true" width="1" height="1" overflow="visible" shapeRendering="crispEdges">
          <rect x={-12} y="0" width="24" height={1 / zoom} fill="white" />
          {graph.edges.map(edge => {
            const walked = nav.walked[edge.id];
            if (!walked || walked.max <= walked.min) return null;
            const start = graph.places[edge.from], end = graph.places[edge.to];
            const x = start.x + (end.x - start.x) * walked.min / edge.length, y = start.y + (end.y - start.y) * walked.min / edge.length;
            const dx = (end.x - start.x) * (walked.max - walked.min) / edge.length, dy = (end.y - start.y) * (walked.max - walked.min) / edge.length;
            return <rect key={edge.id} data-route={edge.id} x={Math.min(x, x + dx)} y={Math.min(y, y + dy)} width={Math.max(Math.abs(dx), 1 / zoom)} height={Math.max(Math.abs(dy), 1 / zoom)} fill="white" />;
          })}
        </svg>
        {graph.edges.flatMap(edge => {
          const range = nav.walked[edge.id];
          if (!range) return [];
          const points = [];
          const from = graph.places[edge.from], to = graph.places[edge.to];
          const currentOffset = Math.max(0, Math.min(edge.length, ((position.x - from.x) * (to.x - from.x) + (position.y - from.y) * (to.y - from.y)) / edge.length));
          const low = Math.max(range.min, currentOffset - Math.max(size.width, size.height) / zoom);
          const high = Math.min(range.max, currentOffset + Math.max(size.width, size.height) / zoom);
          for (let offset = Math.ceil((low - 48) / 96) * 96 + 48; offset < high && points.length < 80; offset += 96) {
            if (offset < range.min || offset < 0) continue;
            const point = positionOn(view, { ...nav, edge: edge.id, offset });
            const sign = Math.floor(offset / 96) % 2 ? 1 : -1;
            points.push(<span aria-hidden="true" className="pebble" key={`${edge.id}:${offset}`} style={{ left: point.x + (edge.direction === 'north' ? sign * 5 : 0), top: point.y + (edge.direction !== 'north' ? sign * 5 : 0) }} />);
          }
          return points;
        })}
        {places.map(place => {
          const point = graph.places[place], title = t.places[place];
          const x = size.width / 2 + (point.x - 44 - position.x) * zoom, y = size.height / 2 + (point.y - 64 - position.y) * zoom;
          const width = title.length * 8;
          const inCopy = choiceVisible && y > 80 && y < size.height / 2 - Math.max(80, 48 * zoom) && Math.abs(x - size.width / 2) < Math.min(280, size.width / 2 - 24) + width / 2;
          const inMoro = Math.abs(x - size.width / 2) < width / 2 + 20 && y + 10 > size.height / 2 - 40 && y < size.height / 2 + 4;
          const fits = x - width / 2 > 8 && x + width / 2 < size.width - 8 && y > 64 && y < size.height - 160 && !inCopy && !inMoro && !labels.some(other => Math.abs(other.x - x) < (other.width + width) / 2 + 8 && Math.abs(other.y - y) < 20);
          if (fits) labels.push({ x, y, width });
          return <span key={place} className="place-marker" style={{ left: point.x - 62, top: point.y - 48, borderColor: place === 'office' ? '#ffe05c' : '#aaa' }} role="img" aria-label={title}>
            {fits && <span className="place-label" style={{ fontSize: 8 / zoom }}>{title}</span>}
          </span>;
        })}
        {markers.map(marker => {
          const point = graph.places[marker.place], character = content?.characters[marker.character];
          const slot = markers.filter(other => other.place === marker.place).findIndex(other => other.character === marker.character);
          const title = `${character?.name ?? t.characters}: ${marker.latest ? t.lastSeen : t.earlierEncounter} · ${t.places[marker.place]}`;
          return <span key={`${marker.character}:${marker.place}`} role="img" aria-label={title} title={title} data-character={marker.character} data-last-seen={marker.latest} className={marker.latest ? 'encounter-marker' : 'encounter-trace'} style={{ left: point.x + 32 + slot * 28, top: point.y - (marker.latest ? 44 : 32), color: character?.color ?? '#fff' }} />;
        })}
      </div></div>
      <span className="moro-clearance" aria-hidden="true" style={{ transform: `scale(${zoom})` }} /><span className="moro" style={{ transform: `scale(${zoom})` }} />
    </div>
    {controls && <>
      <div className="map-zoom" role="group" aria-label={t.mapZoom}><button aria-label={t.zoomOut} disabled={zoom <= minimumZoom} onClick={() => setZoom(value => clampZoom(value / 1.4, minimumZoom))}>−</button><button aria-label={zoom === 1 ? t.fitMap : t.resetZoom} onClick={() => setZoom(zoom === 1 ? fitZoom : 1)}>□</button><button aria-label={t.zoomIn} disabled={zoom >= MAX_ZOOM} onClick={() => setZoom(value => clampZoom(value * 1.4, minimumZoom))}>+</button></div>
      <nav className="direction-control" aria-label={t.navigation} title={t.directionHint}>
        {directions.map(direction => <button key={direction} className={direction} disabled={!run.navigation || !available[direction]} aria-label={t.directions[direction]} aria-pressed={nav.heading !== null && nav.edge === available[direction]?.edge && nav.heading === available[direction]?.heading} onClick={() => act({ type: 'choose-direction', direction })}>{t.directions[direction][0]}</button>)}
        <span className="direction-center" aria-hidden="true" />
      </nav>
    </>}
  </>;
}
