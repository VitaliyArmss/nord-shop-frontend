# Nord Shop — Frontend

React-интерфейс демонстрационного интернет-магазина.

**Демо:** <https://vitaliyarmss.github.io/nord-shop-frontend/>  
**API:** <https://api.vitaliy-armss.ru/nord-shop/api>

## Возможности

- каталог, поиск, фильтрация по категориям и сортировка;
- страницы/диалоги с подробной информацией о товаре;
- избранное и корзина с сохранением в браузере;
- вход по тестовым аккаунтам без регистрации;
- оформление демонстрационного заказа и просмотр истории заказов.

Каталог может показывать встроенные демонстрационные данные, если backend недоступен. Авторизация и создание заказов требуют работающего API.

## Стек

- React
- JavaScript
- Vite
- Fetch API
- GitHub Actions / GitHub Pages

## Локальный запуск

Требуется Node.js 22.12 или новее.

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Локальный адрес API можно задать в `.env.local` через `VITE_API_URL`, например:

```env
VITE_API_URL=http://localhost:5003/api
```

В production используется фиксированный адрес `https://api.vitaliy-armss.ru/nord-shop/api`. Для GitHub Pages в `vite.config.js` задан `base: '/nord-shop-frontend/'`.

## Публикация

1. Отправь изменения в ветку `main` репозитория `nord-shop-frontend`.
2. В GitHub открой **Settings → Pages** и установи **Source: GitHub Actions**.
3. Дождись успешного workflow во вкладке **Actions**.
4. Проверь сайт: <https://vitaliyarmss.github.io/nord-shop-frontend/>.

Workflow собирает `dist/`, проверяет production API URL и публикует результат.

## Тестовые аккаунты

- Покупатель: `demo` / `demo123`
- Менеджер: `manager` / `manager123`

Публичной регистрации и реальной оплаты нет. Не добавляй секреты backend или пароли PostgreSQL во frontend-репозиторий.
