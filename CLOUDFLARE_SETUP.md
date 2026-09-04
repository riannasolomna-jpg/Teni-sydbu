# Настройка финальной версии в Cloudflare

1. Worker: `arhiv-doma`.
2. Bindings → D1 → Variable name `DB` → база `arhiv-doma`.
3. Variables and Secrets → Secret `ADMIN_PASSWORD`.
4. R2 не нужен. В админке изображения добавляются прямой ссылкой.
5. Загрузить проект так, чтобы корнем проекта были `worker.js`, `wrangler.jsonc` и папка `public`.
6. После деплоя открыть публичную ссылку Worker. Админка: `/admin.html`.

`schema.sql` уже соответствует созданной таблице `posts`. Повторно создавать таблицу не требуется, если она уже существует.
