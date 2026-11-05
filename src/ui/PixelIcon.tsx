const shapes = {
  medal: 'M3 1h3v4H3zM8 1h3v4H8zM5 4h4v2H5zM4 6h6v1h1v4h-1v1H4v-1H3V7h1zM6 8h2v2H6z',
  story: 'M2 1h9v11H2zM4 4h5M4 6h5M4 8h3',
  collection: 'M1 3h11v9H1zM3 1h7M4 6h5M4 8h3',
  steps: 'M2 1h3v4H2zM7 6h3v4H7zM2 7h3v2H2zM7 12h3',
  settings: 'M5 1h3v2h2v2h2v3h-2v2H8v2H5v-2H3V8H1V5h2V3h2zM5 5h3v3H5z',
  back: 'M7 2L2 7l5 5M2 7h10',
};
export function PixelIcon({ name }: { name: keyof typeof shapes }) {
  return <svg className="pixel-icon" aria-hidden="true" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1" shapeRendering="crispEdges"><path d={shapes[name]} /></svg>;
}
