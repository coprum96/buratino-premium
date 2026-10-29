# Премиальный UI и motion: отчёт

Дата: 29 октября 2026  
Проект: «Золотой Детектор»  
Figma frame: **не предоставлен**. В промпте стоит плейсхолдер `[ВСТАВИТЬ ССЫЛКУ НА FIGMA FRAME]`. Pixel-perfect сверка с макетом **не выполнялась** и не заявляется.

## 1. Визуальная концепция

Экран награды продолжает фиолетовую поверхность игры, золото и свет используются только для фиксации результата. Badge — диск с реальной иллюстрацией достижения, толщиной, бликом и тенью. Текст идёт иерархией: редкость → название → причина → награда. CTA включается после сцены (~3.2 с), чтобы сначала прочитать результат.

Ролик строится как «заметь сигнал до того, как станет поздно»: давление обещаний → детектор → проверка → выбор → badge → payoff с пятью монетами.

## 2. Bento.surf: референсы и принципы

Актуальный [bento.surf](https://bento.surf/) — creator OS, не галерея чужих showreel. Чужие композиции и ассеты не копировались.

| Источник | Наблюдение | Принцип для «Золотого Детектора» |
|---|---|---|
| [bento.surf](https://bento.surf/) | Хук в первом экране, крупный product shot | 0–3 с: давление «2000% / только сегодня», затем пауза |
| Там же, блоки Create / Grow / Monetise | Макро-ценность чередуется с деталью UI | Карта глав → карточка Лисы → флаги → калькулятор/договор |
| Там же, review UI постов | Один кадр = один читаемый интерфейс | Реальные тексты `gameData` и `assessmentBank`, без выдуманных экранов |
| Там же, финальный CTA | Ролик заканчивается действием, не эффектом | «Сначала проверь. Потом решай» |
| [PromptReel: Bento product video](https://promptreels.vercel.app/p/bizibeast-10f264/) | 40 с, секундный тайминг, showreel-темп | Таймлайн `FILM_SCENES`, не копирование чужого ролика |

## 3. Переиспользованные компоненты и ассеты

Компоненты: `Modal`, `choice-card`, `surface-card`, `StatsBar`, `Badge3D`, данные `ACHIEVEMENTS`, `levels[7]`, `CHAPTER_META`, `assessmentBank`, `getEndingContent`, `controlQuestions`.

Ассеты: `item_detector_mirror_golden.png`, `effect_golden_rays.png`, `effect_coin_sparkle.png`, `character_buratino_cautious.png`, `character_buratino_happy.png`, `character_cricket_wise.png`, `fox.png`, `item_gold_coins_5.png`, `item_letter_tortila_sealed.png`, `item_tablet_karabas_presentation.png`, `item_envelope_golden_emblem.png`, `item_business_plan.png`, `background_cobblestone_path.png`.

## 4. Изменённые и созданные файлы

Созданы: `src/lib/{motion,achievements,filmTimeline}.ts`, `src/data/achievements.ts`, `src/motion/{useBadgeTilt,particlePool,motion.css}`, `src/components/achievements/{Badge3D,AchievementUnlock,AchievementGallery}.tsx`, тесты, `video/**`, `outputs/*`.

Изменены: store/storage/events, App, Dialogue/Microscope/PostTest/StatsBar/ChapterMap/Start/Onboarding/Quiz/Ending, `index.css` токены через motion.css, `package.json`, `README.md`.

## 5. Motion specification

| Токен | Значение |
|---|---|
| duration.fast / base / slow | 180 / 280 / 480 ms |
| duration.enter / scene / unlock | 640 / 900 / 3200 ms |
| ease.out | `cubic-bezier(0.22, 1, 0.36, 1)` |
| ease.enter | `cubic-bezier(0.16, 1, 0.3, 1)` |
| ease.dim / inOut | `cubic-bezier(0.33, 0, 0.2, 1)` / `cubic-bezier(0.4, 0, 0.2, 1)` |
| stagger | 70 ms |
| tilt | max 8°, damping 0.14, return 0.1, без spring/overshoot |
| particles | pool 18, life 900 ms, gravity 0.12, PNG `effect_coin_sparkle` |

Reduced motion: без 3D-tilt, частиц и длинных смещений; CTA сразу активен; смысл перехода сохраняется статичной иерархией.

## 6. Storyboard ролика (факт)

Композиция `FILM_DURATION_MS = 40000`. Master MP4 обрезан до **40.000 с**. Сырой WebM Playwright ~43.4 с из‑за загрузки страницы.

| Время | Сцена | Содержание |
|---|---|---|
| 0–3 | HookScene | 2000%, «Только сегодня», «Осталось 2 места» |
| 3–8 | ProductRevealScene | Детектор, карта глав |
| 8–11 | FraudOfferScene | Реплика Лисы из главы 8 |
| 11–14 | DetectorScanScene | Реальные red-flag карточки |
| 14–20 | VerificationToolsScene | ЦБ / лицензия / реквизиты / договор / расчёт + легальный кейс |
| 20–26 | DecisionScene | loss vs pause из финала |
| 26–32 | BadgeUnlockScene | «Холодная голова» + Badge3D |
| 32–37 | ProgressMontageScene | карта, договор, калькулятор, тест, галерея |
| 37–40 | FinalPayoffScene | 5 монет, безопасный исход |

Субтитры: `video/captions/launch.ru.vtt`. Форматы 9:16 и 1:1: `?ratio=9x16` / `?ratio=1x1`, safe-area 12%/10%.

## 7. Команды

```bash
npm run dev              # игра, http://localhost:5173
npm run badge:demo       # /?demo=badge
npm run video:preview    # ролик, http://localhost:5174
npm run video:render     # outputs/gold-detector-launch.webm
npm test
npm run test:e2e
npm run build
```

## 8. Финальное видео

- Master 16:9 1920×1080, 40.000 с: `outputs/gold-detector-launch.mp4`
- Исходник записи: `outputs/gold-detector-launch.webm`
- Кадры сцен: `outputs/frame-*.png`
- Манифест: `outputs/launch-manifest.json`

Звук не добавлялся: нет лицензированной дорожки в репозитории. Текст читается без звука.

## 9. Скриншоты

- `outputs/frame-hook.png` … `outputs/frame-payoff.png`
- Живой unlock проверен в браузере (`/?demo=badge`) и e2e: диалог «Холодная голова», CTA сначала disabled, затем «Продолжить»
- Figma-сравнение одинаковых viewport **нет** — ссылки на frame не было

## 10. Проверки

| Проверка | Результат |
|---|---|
| Unit + a11y | 33/33 |
| Playwright | 30/30 (desktop + Pixel 5) |
| Unlock один раз + persist | store + e2e |
| Focus / Escape / CTA | a11y + e2e |
| Reduced motion | e2e: нет частиц и tilt, CTA сразу |
| Pointer без React re-render | Badge3D.test |
| Touch без гироскопа | pointer drag + coarse auto-tilt |
| Particles dispose | particlePool.test |
| 320/375/768/1024/1440 | e2e, карточка не шире viewport |
| Film 40 с, 9 сцен, адаптеры | filmTimeline + video.spec |
| Production build | `tsc && vite build` OK; video не в `dist/` (143 модуля, 589 KB JS) |
| 60 FPS | **не измерялся профайлером**. Реализация: только `transform`/`opacity`, rAF, нет setState на pointermove |

## 11. Ограничения

1. Figma frame отсутствует — визуал собран по токенам и ассетам игры, не по пикселям макета.
2. Bento.surf сейчас продукт, не motion-галерея; взяты принципы, не чужие кадры.
3. Ролик — изолированный CSS/React timeline + Playwright, не Remotion. Детерминизм сцен есть; запись браузера даёт ~3 с оверхеда, master обрезан до 40 с.
4. Playwright пишет 25 fps VP8, не 60 fps master.
5. Золотой луч и 3D в фильме — CSS, без тяжёлого движка.
6. FPS интерактива не профилировался на устройстве.
7. Чужой Bento-ролик не использовался как шаблон композиции.
