# My Body 💪

Персональний трекер здоров'я та самопочуття з синхронізацією в реальному часі.

## 🌟 Можливості

- 📊 Відстеження ваги, настрою, енергії, сну, води та харчування
- 👤 Кілька профілів (Богдан, Ліза та інші)
- 📈 Красиві інтерактивні графіки (Chart.js)
- 📅 Фільтрація по датах
- 📊 Порівняння між профілями
- 🔥 **Firebase синхронізація** — дані миттєво синхронізуються між пристроями
- 💾 Експорт/Імпорт даних як бекап
- 📱 Адаптивний дизайн (працює на телефоні)
- 🎨 Neumorphism (Soft UI) дизайн

## 🚀 Деплой на GitHub Pages

### Крок 1: Створити репозиторій

1. Зайди на [github.com](https://github.com)
2. Натисни **"+"** → **"New repository"**
3. Назва: `my-body`
4. **Public** ✅
5. НЕ ставити "Add a README"
6. **"Create repository"**

### Крок 2: Завантажити файли

**Через GitHub інтерфейс:**

1. Натисни **"uploading an existing file"**
2. Перетягни ВСІ файли та папки:
   - `index.html`
   - `css/` (з `styles.css`)
   - `js/` (з `storage.js`, `ui.js`, `charts.js`, `app.js`)
   - `README.md`
3. **"Commit changes"**

**Або через Git:**

```bash
cd "c:\Users\Bogdan\Desktop\My body"
git init
git add .
git commit -m "Initial commit: My Body health tracker"
git branch -M main
git remote add origin https://github.com/ТВІЙ_ЮЗЕРНЕЙМ/my-body.git
git push -u origin main
```

### Крок 3: Увімкнути GitHub Pages

1. **Settings** → **Pages**
2. Source: **Branch `main`**, Folder: **`/ (root)`**
3. **Save** → зачекай 1-2 хвилини

### Крок 4: Готово! 🎉

```
https://ТВІЙ_ЮЗЕРНЕЙМ.github.io/my-body/
```

## 🔥 Синхронізація

Дані синхронізуються через **Firebase Realtime Database** в реальному часі:
- Ти вносиш дані на телефоні — Ліза бачить їх на своєму
- Ніяких кнопок натискати не потрібно — все автоматично
- Працює на будь-якому пристрої через браузер

## 📁 Структура проекту

```
My body/
├── index.html       # Головна HTML сторінка
├── css/
│   └── styles.css   # Стилі (Neumorphism / Soft UI)
├── js/
│   ├── storage.js   # Firebase + localStorage cache
│   ├── ui.js        # UI компоненти
│   ├── charts.js    # Chart.js графіки
│   └── app.js       # Головна логіка
└── README.md        # Ця інструкція
```

## 🛠️ Технології

- HTML5 + CSS3 + JavaScript (Vanilla)
- [Firebase Realtime Database](https://firebase.google.com/) — синхронізація
- [Chart.js](https://www.chartjs.org/) — графіки
- [Google Fonts](https://fonts.google.com/) — Inter & Outfit
- GitHub Pages — хостинг
