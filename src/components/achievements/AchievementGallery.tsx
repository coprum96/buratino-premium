import { useState } from 'react';
import { ACHIEVEMENTS, getAchievement } from '../../data/achievements';
import { Modal } from '../ui/Modal';
import { AchievementUnlock } from './AchievementUnlock';

interface AchievementGalleryProps {
  unlocks: Record<string, string>;
  onClose: () => void;
}

export function AchievementGallery({ unlocks, onClose }: AchievementGalleryProps) {
  const [replayId, setReplayId] = useState<string | null>(null);
  const unlockedCount = Object.keys(unlocks).length;

  return (
    <>
      <Modal title="Галерея достижений" onClose={onClose} wide>
        <p className="mb-5 text-white/80">
          Открыто {unlockedCount} из {ACHIEVEMENTS.length}. Повторный просмотр не выдаёт награду снова.
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ACHIEVEMENTS.map((achievement) => {
            const unlockedAt = unlocks[achievement.id];
            return (
              <li key={achievement.id} className="surface-card !p-4">
                <div className="flex gap-3 items-start">
                  <img
                    src={achievement.asset}
                    alt=""
                    className={`w-16 h-16 object-contain rounded-full bg-black/20 ${unlockedAt ? '' : 'grayscale opacity-40'}`}
                  />
                  <div className="text-left flex-1">
                    <h3 className="font-bold">{achievement.title}</h3>
                    <p className="text-sm text-white/75 mb-2">{achievement.description}</p>
                    {unlockedAt ? (
                      <>
                        <p className="text-xs text-white/60 mb-2">Получено: {formatUnlockTime(unlockedAt)}</p>
                        <button type="button" className="btn text-sm" onClick={() => setReplayId(achievement.id)}>
                          Посмотреть снова
                        </button>
                      </>
                    ) : (
                      <p className="text-sm text-white/60">Ещё закрыто. {achievement.condition}</p>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </Modal>
      {replayId && getAchievement(replayId) && (
        <AchievementUnlock achievementId={replayId} replay onClose={() => setReplayId(null)} />
      )}
    </>
  );
}

function formatUnlockTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' });
}
