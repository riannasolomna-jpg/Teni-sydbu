# Архив Дома — финальная версия

Готовый full-stack сайт для Cloudflare Workers + D1.

## Что внутри
- `public/` — публичный сайт и админка;
- `worker.js` — API, авторизация администратора и работа с D1;
- `wrangler.jsonc` — конфигурация Cloudflare Workers Static Assets;
- `schema.sql` — таблица `posts`;
- `admin.html` — `/admin.html`;
- `admin.js` — интерфейс управления материалами.

## Привязки Cloudflare
Worker должен иметь:
- D1 binding: `DB` → база `arhiv-doma`;
- Secret: `ADMIN_PASSWORD` → пароль администратора;
- Изображения: по прямой внешней ссылке, без R2.

Пароль не хранится в файлах сайта.

## Важно
Публичный сайт не показывает админскую форму посетителям. Админка находится по `/admin.html` и защищена секретом Worker.
