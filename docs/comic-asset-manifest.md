# Манифест ассетов graphic-novel slice

Мастера лежат в `outputs/gold-detector-graphic-novel-art-pack/`. Приложение читает только `public/assets/game/comic/`.

Character bible — reference sheet, не sprite sheet. В игре не показывается.

## Фоны

| Файл | Назначение | Размер | Aspect | Прозрачность | Anchor | Safe area | Вес | Статус | Fallback |
|---|---|---|---|---|---|---|---|---|---|
| `outputs/.../bg-theater-night-mobile.png` | мастер, не отдавать в клиент | 576×1024 | 9:16 | нет | центр, театр в верхней трети | низ тёмный для UI | 965 KB | готов | — |
| `public/.../backgrounds/bg-theater-night-390.webp` | телефон | 390×694 | 9:16 | нет | `object-position: center 28%` | HUD сверху, действия снизу | 50 KB | готов | `#071522` + grain |
| `public/.../backgrounds/bg-theater-night-768.webp` | планшет | 576×1024 | 9:16 | нет | то же | то же | 111 KB | готов | то же |
| `public/.../backgrounds/bg-theater-night-1440.webp` | десктоп cover | 810×1440 | 9:16 | нет | то же | то же | 116 KB | ограничен мастер-разрешением | то же |
| `public/.../previews/bg-theater-night-preview.webp` | blur preview | 72×128 | 9:16 | нет | — | — | 1.1 KB | готов | цвет фона |

Источник 576×1024. Файл `1440` — увеличенная копия, не новый кадр. На телефоне грузится только 390.

## Персонажи (ожидаемые production-слоты)

Прозрачный WebP, `object-fit: contain`, `object-position: center bottom`, якорь в ногах.

| Файл | Назначение | Размер | Aspect | Прозрачность | Anchor | Safe area | Вес | Статус | Fallback |
|---|---|---|---|---|---|---|---|---|---|
| `char-detective-neutral.webp` | Буратино, спокойно | ~468×720 bust | bust | да | низ bust | лицо читается на 360 | ~107 KB | готов (crop из bible) | бумажный силуэт + имя |
| `char-detective-surprised.webp` | Буратино, удивление | ~474×720 bust | bust | да | то же | то же | ~105 KB | готов | то же |
| `char-detective-thinking.webp` | Буратино, думает | ~474×720 bust | bust | да | то же | то же | ~103 KB | готов | то же |
| `char-detective-pressured.webp` | Буратино, давление | ~474×720 bust | bust | да | то же | то же | ~104 KB | готов | то же |
| `char-antagonist-friendly.webp` | Карабас, дружелюбно | ~480×720 bust | bust | да | то же | то же | ~82 KB | готов | то же |
| `char-antagonist-suspicious.webp` | Карабас, подозрение | ~471×720 bust | bust | да | то же | то же | ~81 KB | готов | то же |
| `char-antagonist-pressured.webp` | Карабас, давление | ~471×720 bust | bust | да | то же | то же | ~75 KB | готов | то же |
| `char-antagonist-angry.webp` | Карабас, злость | ~471×720 bust | bust | да | то же | то же | ~80 KB | готов | то же |

Эталоны внешности (не для рендера):

- `character-wooden-detective-art-bible.png`
- `character-theater-antagonist-art-bible.png`

## Объекты

Телефон и листовка — HTML-рамки. Русский текст не зашит в растр.

| Объект | Статус |
|---|---|
| Телефон с перепиской | HTML, текст из `levels[1].dialogues[0].text` |
| Листовка / план | HTML, слайды из `levels[1].dialogues[1].presentation` |
| Карточка улики | CSS, заголовок из `EVIDENCE_CATALOG` |
| Монета | CSS-диск для полёта |

## Нельзя

- Подключать приложение к `outputs/`.
- Подменять отсутствующего персонажа emoji.
- Показывать art bible целиком как sprite.

Bust-слоты вырезаны из expression-ряда bible с удалением бумажного фона. Полноростовые transparent sprites можно заменить позже без смены API путей.
