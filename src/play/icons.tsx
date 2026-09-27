import { ICONS } from './iconData';

export type IconName = keyof typeof ICONS;

export function PixelIcon({ name, size = 32 }: { name: IconName; size?: number }) {
  const icon = ICONS[name];
  const h = icon.rows.length;
  const w = Math.max(...icon.rows.map((r) => r.length));
  return (
    <svg width={size} height={size} viewBox={`0 0 ${w} ${h}`} shapeRendering="crispEdges" aria-hidden>
      {icon.rows.flatMap((row, y) =>
        [...row].map((ch, x) =>
          icon.pal[ch] ? <rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} fill={icon.pal[ch]} /> : null,
        ),
      )}
    </svg>
  );
}
