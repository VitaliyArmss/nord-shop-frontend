# NORD Shop — frontend (React + JavaScript)

Репозиторий: `VitaliyArmss/nord-shop-frontend`  
Сайт: <https://vitaliyarmss.github.io/nord-shop-frontend/>  
Production API: <https://api.vitaliy-armss.ru/nord-shop/api>

## Публикация через GitHub Pages

1. Загрузи содержимое этого каталога в корень репозитория `nord-shop-frontend` на ветку `main`.
2. В GitHub открой **Settings → Pages → Build and deployment → Source** и выбери **GitHub Actions**.
3. Открой **Actions** и дождись успешного запуска `Deploy React app to GitHub Pages`.
4. Открой <https://vitaliyarmss.github.io/nord-shop-frontend/>.

Workflow запускает Vite build, проверяет, что собранный JS содержит правильный production API URL, и публикует `dist/`. Если в исходниках или конфигурации случайно окажется неправильный адрес API, шаг проверки остановит публикацию.

### Важные настройки

- `vite.config.js` содержит `base: '/nord-shop-frontend/'`. Это необходимо для загрузки JS/CSS на GitHub Pages по пути репозитория.
- В production `src/api.js` **всегда** использует `https://api.vitaliy-armss.ru/nord-shop/api`. Значение из `VITE_API_URL` и старые `.env.production` не могут переопределить адрес production API.
- В режиме разработки можно задать `VITE_API_URL` в `.env.local`; пример локального адреса — `http://localhost:5003/api`.
- Не добавляй пароли PostgreSQL, JWT-секреты или другие backend-секреты во frontend-репозиторий.

## Заменить файлы существующего GitHub-репозитория через Git Bash

1. Скачай новый `nord-shop-frontend-production-fixed.zip` и распакуй его **в отдельную папку, не внутрь существующего git-каталога**. Например, распакуй в `~/Downloads/nord-shop-frontend-fixed/`.
2. Открой Git Bash и перейди в существующий локальный клон репозитория. Перед заменой сохрани свои незакоммиченные изменения или сделай резервную копию.
3. Выполни команды, заменив путь к каталогу распакованного архива, если он отличается:

```bash
cd /c/path/to/nord-shop-frontend

git status --short
git branch --show-current
git remote -v
git switch main
git pull --ff-only origin main

# Проверь, что репозиторий подключён к VitaliyArmss/nord-shop-frontend.
# Если в рабочем каталоге нет нужных незакоммиченных изменений, замени tracked-файлы:
git rm -r .
cp -a ~/Downloads/nord-shop-frontend-fixed/. .

git add -A
git diff --cached --stat
git diff --cached -- src/api.js .github/workflows/deploy.yml

git commit -m "Fix production API URL"
git push origin main
```

В Git Bash путь `/c/path/to/nord-shop-frontend` — пример; замени его на реальный путь своего клона. Если у тебя распаковка создала дополнительную вложенную папку, `cp -a` должен ссылаться на ту папку, внутри которой сразу лежат `src/`, `package.json`, `vite.config.js` и `.github/`.

`git rm -r .` удаляет из индекса текущие отслеживаемые файлы, но не удаляет каталог `.git`; команда `cp -a` затем копирует новые файлы, включая скрытые `.github/` и `.gitignore`. Не выполняй `git clean -fdx` — эта команда может удалить локальные файлы и настройки. Если ветка по умолчанию называется не `main`, используй её фактическое имя.

4. Открой GitHub → **Actions** и дождись успешного деплоя. При ошибке проверь журнал шага **Verify production API URL**.
5. В браузере открой сайт и сделай принудительное обновление `Ctrl+F5`. В DevTools → **Network** URL `login` должен быть `https://api.vitaliy-armss.ru/nord-shop/api/auth/login`, а не старый путь.

## Локальная разработка

Требуется Node.js 22.12 или новее.

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

## Демонстрационные аккаунты

- Покупатель: `demo` / `demo123`
- Менеджер: `manager` / `manager123`

Регистрация и реальная оплата не предусмотрены.
