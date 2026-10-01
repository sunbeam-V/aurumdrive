# Aurum Drive

Production-ready двуязычный сайт премиальной аренды автомобилей с водителем в Санкт-Петербурге и Ленинградской области. Проект объединяет индексируемую публичную часть, серверный калькулятор, заявку с транзакционным audit/outbox, email/password админку, CMS-ресурсы и переносимый Docker deployment.

## Возможности

Публичная часть работает на русском и английском, содержит главную, автопарк с фильтрами, страницы автомобилей, услуги, трансферы, корпоративное направление, информацию о сервисе, FAQ, контакты, форму заказа и юридические шаблоны. Заявка не требует адреса подачи или email: обязательны имя, телефон, тип, будущие дата/время, продолжительность, пассажиры и согласие; автомобиль, багаж и комментарий необязательны.

Админка поддерживает роли `superadmin` и `manager`, безопасные сессии, CSRF, rate limiting, статусы заявок, внутренние комментарии, историю, аудит входов и действий, CRUD автомобилей, менеджеров, тарифов, FAQ, CMS-контента и настроек. Публичные тарифы, extras, FAQ, контакты и явно заполненные CMS body читаются из БД; снятие публикации автомобиля удаляет его из публичного каталога и sitemap. Новые заявки создают событие `request.created` в transactional outbox, к которому позднее подключаются Telegram, CRM, телефония или календарь.

## Стек

| Слой | Технология |
|---|---|
| UI/SSR/SSG/API | Next.js 16 App Router, React 19, TypeScript strict |
| Стиль и motion | Tailwind CSS 4, Framer Motion |
| Локализация | next-intl, маршруты `/ru` и `/en` |
| Формы и DTO | React Hook Form, Zod |
| База | MySQL 8 / TiDB-compatible managed DB, Drizzle ORM |
| Auth | bcryptjs, случайные opaque session tokens, httpOnly cookies |
| Проверки | ESLint, TypeScript, Vitest, Next production build |

## Дизайн-система

Визуальная концепция **Imperial Night** использует Obsidian `#090A0B`, Graphite `#131517`, Ivory `#F4F0E8`, Aurum `#C9A96E` и Champagne `#E6D3A7`. Тёмная база сообщает о приватности, золото направляет к основному CTA, а функциональные цвета применяются только для статусов. Заголовки набраны Cormorant Garamond, интерфейс — Manrope; обе гарнитуры распространяются по SIL OFL.

Сетка mobile-first: 4 колонки на телефоне, 8 на планшете, 12 на desktop, max-width 1280 px. Spacing следует шкале 4/8/12/16/24/32/48/64/96 px, интерактивные цели не меньше 44 px. Анимации длятся 0.3–0.5 секунды, входные эффекты запускаются во viewport и отключаются через `prefers-reduced-motion`. Прелоадер ждёт `load`, имеет timeout и сокращается при повторном посещении. Подробности находятся в `ideas.md`.

## Структура

```text
app/                 страницы, layouts, metadata, API, robots, sitemap
components/          UI, marketing, forms, motion, admin
features/            DTO и доменная логика pricing/requests
server/db/           Drizzle schema и миграции
server/repositories/ доступ к автопарку
server/services/     request transaction и quote
server/security/     sessions, CSRF, rate limiting
lib/                 данные, env, analytics, utilities
messages/            RU/EN UI messages
scripts/             migrate, seed, create-admin
tests/               unit/integration contracts
public/              route manifest и branding
```

## Переменные окружения

Скопируйте `.env.example` в `.env.local`. Обязательны `DATABASE_URL` и `SESSION_SECRET` длиной не менее 32 символов. `ADMIN_EMAIL` и `ADMIN_PASSWORD` используются только конечной командой `pnpm admin:create`. Production origin задаётся через `NEXT_PUBLIC_SITE_URL` только после подключения реального домена; без него canonical и абсолютный sitemap не угадываются. Яндекс.Метрика и GA не загружаются без реальных ID и пользовательского consent.

## Локальный запуск

```bash
corepack enable
pnpm install
cp .env.example .env.local
pnpm db:migrate
pnpm db:seed
ADMIN_EMAIL=owner@example.com ADMIN_PASSWORD='strong-unique-password' pnpm admin:create
pnpm dev
```

Откройте `http://localhost:3000/ru` и `http://localhost:3000/admin/login`.

## Проверки и production build

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
PORT=3000 pnpm start
curl -f http://localhost:3000/api/health
curl -f http://localhost:3000/manus-routes.json
```

Миграции и seed — отдельные конечные процессы. Seed idempotent: он обновляет только системные seed-записи по стабильным ключам и не перезаписывает заявки или менеджеров.

## Docker Compose

Создайте `.env` рядом с `docker-compose.yml`:

```dotenv
MYSQL_PASSWORD=replace-this
MYSQL_ROOT_PASSWORD=replace-this-too
SESSION_SECRET=generate-at-least-32-random-characters
NEXT_PUBLIC_SITE_URL=https://example.com
NEXT_PUBLIC_YANDEX_METRIKA_ID=
NEXT_PUBLIC_GA_ID=
```

Запуск:

```bash
docker compose up -d --build
```

Compose сначала ждёт готовности MySQL, затем конечный `migrate` service применяет migration history и idempotent seed. Основной контейнер стартует только после успешного завершения подготовки данных. Для ручного повторного запуска подготовки используйте `docker compose run --rm migrate`.

Поставьте Caddy, Nginx или cloud load balancer перед портом 3000, включите HTTPS, резервное копирование MySQL и мониторинг health endpoint. Контейнер работает непривилегированным пользователем и имеет healthcheck.

## Управляемое развёртывание

Проект рассчитан на container deployment с managed MySQL-compatible database. Build берёт чистый checkpoint, Dockerfile компилирует standalone Next.js, приложение слушает `$PORT`, а `/api/health` проверяет БД. Публичные URL остаются относительными, поэтому Preview proxy и production origin работают одинаково. После подключения домена задайте `NEXT_PUBLIC_SITE_URL` и перепубликуйте версию.

## Безопасность

Пароли хэшируются bcrypt cost 12. Сессии — случайные opaque tokens; в БД хранится SHA-256 hash, cookie имеет `httpOnly`, `SameSite=Lax` и `Secure` в production. Мутации админки требуют подписанного double-submit CSRF token и проверяют роль на сервере. Login, quote и request ограничены rate limit; ошибки входа не подтверждают существование email. Zod проверяет каждый DTO, Drizzle параметризует запросы. PII не отправляется в analytics и не пишется в application logs.

На production установите отдельный `SESSION_SECRET`, регулярно меняйте администраторские пароли, ограничьте доступ к БД, настройте backup/restore и retention персональных данных. Старые сессии следует отзывать при деактивации пользователя; текущий endpoint входа не использует localStorage.

## SEO и аналитика

Публичные страницы отдаются с содержательным HTML и route-specific metadata; неизвестный автомобиль вызывает настоящий 404. `robots.txt` закрывает `/admin` и `/api`, sitemap содержит только публичные локали и автомобили после настройки production origin. Встроены LocalBusiness JSON-LD, OG/Twitter metadata и RU/EN структура. События: `form_start`, `quote_calculated`, `request_submitted`, `phone_click`, `messenger_click`, `corporate_lead`.

## Ручной testing checklist

| Область | Проверка |
|---|---|
| Навигация | Все пункты RU/EN, language switch, mobile menu, back/forward |
| Форма | Обязательные поля, неверный телефон, прошедшая дата, optional авто/багаж/комментарий |
| Расчёт | Минимальные часы, service multiplier, extras, пояснение о приблизительной цене |
| Отправка | Spinner и disabled, номер заявки, сохранение полей при ошибке, rate limit |
| Админка | Вход/выход, неверный пароль, session expiry, manager/superadmin RBAC |
| Заявки | Фильтрация, переход в карточку, каждый статус, комментарий, immutable history |
| Контент | Создание и публикация авто, менеджер, тариф, FAQ, page/settings записи |
| Ошибки | 404 автомобиля, недоступная БД, 401/403/409/429/503 |
| Устройства | 320, 375, 768, 1024, 1440, 1920 px без горизонтального scroll |
| A11y | Keyboard-only, видимый focus, labels, 44 px targets, contrast, reduced motion |
| SEO | Raw HTML, title/description, sitemap/robots, noindex admin, отсутствующий slug = 404 |
| Privacy | Analytics только после consent, отсутствие PII в событиях, legal placeholders заменены |

## Production checklist

1. Заменить телефон, email, адрес, Telegram, WhatsApp и реквизиты оператора через настройки.
2. Передать privacy/consent/booking terms профильному юристу и зафиксировать retention policy.
3. Подключить домен и HTTPS, затем задать `NEXT_PUBLIC_SITE_URL`.
4. Задать уникальные database credentials и `SESSION_SECRET`; создать администратора CLI-командой.
5. Включить backup MySQL, проверить восстановление и оповещение по `/api/health`.
6. Добавить реальные IDs аналитики только после настройки consent и целей.
7. Проверить тарифы, минимальные часы, коэффициенты, список автомобилей и изображения.
8. Выполнить `pnpm check`, `pnpm build`, smoke API и ручные критические сценарии.

## Расширение

Outbox event `request.created` позволяет подключить Telegram consumer с idempotency по `outbox_events.id`: worker берёт `pending`, атомарно переводит в `processing`, отправляет сообщение и отмечает `delivered`; ошибка увеличивает `attempts` и планирует retry. Тем же паттерном подключаются CRM и webhooks. Следующие продуктовые шаги: календарь доступности, роль водителя, клиентские уведомления, онлайн-оплата, call tracking, A/B тест CTA и полноценные конверсионные отчёты.

## Важные ограничения

Контакты и юридические реквизиты сейчас являются явными заглушками. Онлайн-оплата, Telegram, CRM, телефония, филиалы и роль водителя не активированы без реальных credentials и отдельной бизнес-логики, но доменная модель и outbox готовы к их подключению. Изображения сгенерированы специально для проекта и не содержат сторонних водяных знаков.
