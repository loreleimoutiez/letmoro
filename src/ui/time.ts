export function themeAt(date: Date): 'day' | 'dusk' | 'night' {
  const hour = date.getHours();
  return hour >= 8 && hour < 18 ? 'day' : hour >= 6 && hour < 21 ? 'dusk' : 'night';
}
