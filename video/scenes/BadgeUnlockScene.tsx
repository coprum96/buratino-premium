import { getAchievement } from '../../src/data/achievements';
import { Badge3D } from '../../src/components/achievements/Badge3D';

export function BadgeUnlockScene(_props: { t?: number }) {
  const badge = getAchievement('cool-head');
  if (!badge) return null;
  return (
    <section className="film-scene film-badge-scene" data-scene="badge">
      <div className="film-safe text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-amber-200/80 mb-3">Достижение открыто</p>
        <div className="badge-orbit">
          <Badge3D asset={badge.asset} label={badge.title} disableTilt />
        </div>
        <h1 className="film-title mt-4">{badge.title}</h1>
        <p className="film-sub">Холодная голова. Решение принято без давления.</p>
      </div>
    </section>
  );
}
