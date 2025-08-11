// Конфигурация
const CONFIG = {
    // URL для данных профиля (Google Sheets API)
    PROFILE_API_URL: 'https://sheets.livepolls.app/api/spreadsheets/fc0ed5f8-a649-47c5-a6fa-946f177d998d/main-gtnntg',

    // URL для данных ссылок (GitHub Gist)
    LINKS_API_URL: 'https://gist.githubusercontent.com/Zeroxel/30d571fe4d15914c5a45ccf9a26255af/raw/9001c0cffd6392bca30f41a9f346dd035c87f293/links.json',

    // Интервалы обновления (в миллисекундах)
    PROFILE_REFRESH_INTERVAL: 30 * 1000, // 30 секунд
    LINKS_REFRESH_INTERVAL: 60 * 1000,   // 60 секунд

    // Сопоставление текста статуса и CSS классов для цвета
    STATUS_CLASSES: {
        // Русские названия
        "в Сети": "status-online",
        "Не активен": "status-idle",
        "Не беспокоить": "status-dnd",
        "Оффлайн": "status-offline",
        "Невидимый": "status-invisible",
        // Английские названия
        "Online": "status-online",
        "Idle": "status-idle",
        "Do Not Disturb": "status-dnd",
        "Offline": "status-offline",
        "Invisible": "status-invisible"
    }
};

// Глобальное состояние
const state = {
    profileData: null,
    linksData: null,
    previousProfileData: null, // Для сравнения
    previousLinksData: null    // Для сравнения
};

// DOM элементы
const DOM = {
    username: document.getElementById('username'),
    onlinestatus: document.getElementById('onlinestatus'),
    status: document.getElementById('status'),
    avatar: document.getElementById('avatar'),
    statusIndicator: document.getElementById('status-indicator'),
    linksContainer: document.getElementById('links-container')
};

// Идентификаторы таймеров для возможности их остановки
let profileRefreshInterval = null;
let linksRefreshInterval = null;

// Вспомогательная функция для глубокого сравнения объектов (простая версия)
function deepEqual(obj1, obj2) {
    if (obj1 === obj2) return true;
    if (obj1 == null || obj2 == null) return obj1 === obj2;
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return obj1 === obj2;

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) return false;

    for (let key of keys1) {
        if (!keys2.includes(key)) return false;
        if (!deepEqual(obj1[key], obj2[key])) return false;
    }
    return true;
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Переключение языка
    const languageSelector = document.getElementById('languageSelector');
    const languageDropdown = document.getElementById('languageDropdown');

    if (languageSelector) {
        languageSelector.addEventListener('click', (e) => {
            e.stopPropagation();
            if (languageDropdown) {
                languageDropdown.classList.toggle('show');
            }
        });
    }

    // Выбор языка
    document.querySelectorAll('[data-lang]').forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            const lang = option.dataset.lang;
            if (LanguageModule.changeLanguage(lang)) {
                LanguageModule.loadTranslations();
                updateUI(); // Обновляем UI с новым языком
            }
            if (languageDropdown) {
                languageDropdown.classList.remove('show');
            }
        });
    });

    // Переключение темы
    const themeSelector = document.getElementById('themeSelector');
    const themeDropdown = document.getElementById('themeDropdown');

    if (themeSelector) {
        themeSelector.addEventListener('click', (e) => {
            e.stopPropagation();
            if (themeDropdown) {
                themeDropdown.classList.toggle('show');
            }
        });
    }

    // Выбор темы
    document.querySelectorAll('[data-theme]').forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            const theme = option.dataset.theme;
            ThemeModule.changeTheme(theme);
            if (themeDropdown) {
                themeDropdown.classList.remove('show');
            }
        });
    });

    // Закрытие dropdown'ов при клике вне их
    document.addEventListener('click', (e) => {
        if (languageSelector && !languageSelector.contains(e.target)) {
            if (languageDropdown) {
                languageDropdown.classList.remove('show');
            }
        }
        if (themeSelector && !themeSelector.contains(e.target)) {
            if (themeDropdown) {
                themeDropdown.classList.remove('show');
            }
        }
    });
}

// Загрузка данных профиля
async function fetchProfileData() {
    try {
        const response = await fetch(CONFIG.PROFILE_API_URL.trim());
        const data = await response.json();

        if (data.success && data.data.length > 0) {
            const newProfileData = data.data[0];

            // Проверяем, изменились ли данные
            if (!deepEqual(newProfileData, state.previousProfileData)) {
                console.log("Данные профиля обновлены");
                state.previousProfileData = JSON.parse(JSON.stringify(newProfileData)); // Глубокая копия
                state.profileData = newProfileData;
                updateProfileUI(); // Обновляем UI только если данные изменились
            } else {
                console.log("Данные профиля не изменились");
            }
        } else {
            // Обработка случая, когда данные отсутствуют
            if (state.previousProfileData !== null) { // Были данные, теперь их нет
                console.log("Данные профиля больше не доступны");
                state.previousProfileData = null;
                state.profileData = null;
                updateProfileUI(); // Обновляем UI, чтобы показать ошибку
            }
        }
    } catch (error) {
        console.error('Ошибка при получении данных профиля:', error);
        // Обновляем UI в случае ошибки, если раньше данные были
        if (state.previousProfileData !== undefined) {
            state.previousProfileData = undefined; // Или какой-то флаг ошибки
            state.profileData = null;
            updateProfileUI();
        }
    }
}

// Загрузка данных ссылок
async function fetchLinksData() {
    try {
        const response = await fetch(CONFIG.LINKS_API_URL.trim());
        const data = await response.json();

        // Проверяем, изменились ли данные
        const isNewDataDifferent = !deepEqual(data, state.previousLinksData);

        if (isNewDataDifferent) {
            console.log("Данные ссылок обновлены");
            state.previousLinksData = JSON.parse(JSON.stringify(data)); // Глубокая копия
            state.linksData = data;
            updateLinksUI(); // Обновляем UI только если данные изменились
        } else {
            console.log("Данные ссылок не изменились");
        }
    } catch (error) {
        console.error('Ошибка при загрузке данных ссылок:', error);
        // Обновляем UI в случае ошибки, если раньше данные были
        if (state.previousLinksData !== undefined) {
            state.previousLinksData = undefined;
            state.linksData = null;
            updateLinksUI();
        }
    }
}

// Обновление интерфейса профиля (только если есть изменения)
function updateProfileUI() {
    const currentLang = LanguageModule.getCurrentLanguage();
    const t = LanguageModule.LANGUAGES[currentLang];

    if (state.profileData) {
        const { username, status, onlinestatus, avatar } = state.profileData;

        if (DOM.username) DOM.username.textContent = username || t.userNotFound;
        if (DOM.status) DOM.status.innerHTML = status || t.statusNotFound;
        if (DOM.onlinestatus) DOM.onlinestatus.textContent = onlinestatus || t.checkingStatus;

        // Обновление индикатора статуса с цветом
        if (DOM.statusIndicator) {
            const statusIndicator = DOM.statusIndicator;
            // Сначала удаляем все возможные классы статусов
            statusIndicator.classList.remove(
                'status-online', 'status-idle', 'status-dnd',
                'status-offline', 'status-invisible'
            );

            // Определяем класс для текущего статуса
            let statusClass = 'status-offline'; // По умолчанию серый
            if (onlinestatus) {
                const trimmedStatus = onlinestatus.trim();
                // Проверяем точное совпадение
                if (CONFIG.STATUS_CLASSES[trimmedStatus]) {
                    statusClass = CONFIG.STATUS_CLASSES[trimmedStatus];
                } else {
                    // Проверяем частичные совпадения (на случай опечаток или вариаций)
                    const lowerStatus = trimmedStatus.toLowerCase();
                    if (lowerStatus.includes("в сети") || lowerStatus.includes("online")) {
                        statusClass = 'status-online';
                    } else if (lowerStatus.includes("не активен") || lowerStatus.includes("idle")) {
                        statusClass = 'status-idle';
                    } else if (lowerStatus.includes("не беспокоить") || lowerStatus.includes("do not disturb") || lowerStatus.includes("dnd")) {
                        statusClass = 'status-dnd';
                    } else if (lowerStatus.includes("оффлайн") || lowerStatus.includes("offline")) {
                        statusClass = 'status-offline';
                    } else if (lowerStatus.includes("невидимый") || lowerStatus.includes("invisible")) {
                        statusClass = 'status-invisible';
                    }
                }
            }
            // Применяем соответствующий класс
            statusIndicator.classList.add(statusClass);
        }

        // --- ИСПРАВЛЕНИЕ АВАТАРА: Возвращаем логику из оригинала ---
        // Обновление аватара
        if (DOM.avatar) {
            if (avatar) {
                // Всегда устанавливаем src, если аватар есть
                DOM.avatar.src = avatar;
                DOM.avatar.alt = `Avatar of ${username}`;
                // Очищаем innerHTML на случай, если до этого был fa-user
                // (Хотя img не должно иметь innerHTML, но на всякий случай)
                DOM.avatar.innerHTML = '';
            } else {
                // Если аватара нет, показываем иконку
                DOM.avatar.src = ''; // Очищаем src
                DOM.avatar.alt = 'Аватар отсутствует';
                DOM.avatar.innerHTML = '<i class="fas fa-user"></i>';
            }
        }
        // --- КОНЕЦ ИСПРАВЛЕНИЯ АВАТАРА ---

        // Скрытие секции статуса если нужно
        const statusSection = document.querySelector('.status-section');
        if (statusSection) {
            const shouldBeHidden = (status === "none");
            if (statusSection.hidden !== shouldBeHidden) {
                statusSection.hidden = shouldBeHidden;
            }
        }
    } else {
        // Отображение ошибки или состояния "загрузка" если данных нет
        if (DOM.username) DOM.username.textContent = t.errorLoadingStatus;
        if (DOM.status) DOM.status.textContent = t.errorLoadingStatus;
        if (DOM.onlinestatus) DOM.onlinestatus.textContent = t.checkingStatus;
        // Устанавливаем индикатор в серый цвет при ошибке
        if (DOM.statusIndicator) {
            const currentClasses = DOM.statusIndicator.className;
            if (!currentClasses.includes('status-offline') || currentClasses.includes('online-indicator')) {
                DOM.statusIndicator.className = 'online-indicator status-offline';
            }
        }
        // Показываем секцию статуса в случае ошибки, чтобы показать сообщение
        const statusSection = document.querySelector('.status-section');
        if (statusSection && statusSection.hidden) {
            statusSection.hidden = false;
        }
    }
}

// Обновление интерфейса ссылок (только если есть изменения)
function updateLinksUI() {
    const currentLang = LanguageModule.getCurrentLanguage();
    const t = LanguageModule.LANGUAGES[currentLang];

    if (DOM.linksContainer) {
        // Проверка, есть ли данные для отображения
        const hasValidData = state.linksData && Array.isArray(state.linksData) && state.linksData.length > 0;
        const currentlyHasContent = DOM.linksContainer.children.length > 0 &&
            !(DOM.linksContainer.children.length === 1 &&
                DOM.linksContainer.children[0].textContent.includes(t.errorLoadingLinks || t.linksNotFound));

        // Если данные есть и они изменились, или если раньше были данные, а теперь их нет
        if (hasValidData || currentlyHasContent) {
            // Очищаем контейнер
            DOM.linksContainer.innerHTML = '';

            if (hasValidData) {
                state.linksData.forEach(linkItem => {
                    // Выбираем название на текущем языке или fallback на английский
                    const title = linkItem.name[currentLang] || linkItem.name['en'] || 'Link';

                    const linkElement = document.createElement('a');
                    linkElement.href = linkItem.url;
                    linkElement.target = '_blank';
                    linkElement.className = 'link-card';

                    const iconElement = document.createElement('div');
                    iconElement.className = 'link-icon';

                    if (linkItem.icon) {
                        const img = document.createElement('img');
                        img.src = linkItem.icon;
                        img.alt = `Logo of ${title}`;
                        img.style.width = '24px';
                        img.style.height = '24px';
                        iconElement.appendChild(img);
                    } else {
                        // Дефолтная иконка, если иконка не предоставлена
                        iconElement.innerHTML = '<i class="fas fa-external-link-alt"></i>';
                    }

                    const textElement = document.createElement('div');
                    textElement.className = 'link-text';
                    textElement.textContent = title;

                    linkElement.appendChild(iconElement);
                    linkElement.appendChild(textElement);
                    DOM.linksContainer.appendChild(linkElement);
                });
            } else {
                // Обработка ошибки или отсутствия данных
                const errorDiv = document.createElement('div');
                errorDiv.style.gridColumn = '1 / -1';
                errorDiv.style.textAlign = 'center';
                errorDiv.style.padding = '20px';
                // Выбираем более подходящее сообщение
                const errorMessage = state.linksData === null ? t.errorLoadingLinks : t.linksNotFound;
                errorDiv.textContent = errorMessage || 'Ошибка загрузки ссылок.';
                DOM.linksContainer.appendChild(errorDiv);
            }
        }
        // Если данных не было и нет, и контейнер уже пуст или содержит сообщение об ошибке, не обновляем
    }
}


// Функция для запуска автоматического обновления
function startAutoRefresh() {
    // Останавливаем существующие таймеры, если они есть
    stopAutoRefresh();

    // Запускаем таймер для обновления профиля
    profileRefreshInterval = setInterval(() => {
        console.log("Автоматическое обновление профиля...");
        fetchProfileData();
    }, CONFIG.PROFILE_REFRESH_INTERVAL);

    // Запускаем таймер для обновления ссылок
    linksRefreshInterval = setInterval(() => {
        console.log("Автоматическое обновление ссылок...");
        fetchLinksData();
    }, CONFIG.LINKS_REFRESH_INTERVAL);

    console.log(`Автоматическое обновление запущено: профиль каждые ${CONFIG.PROFILE_REFRESH_INTERVAL / 1000}с, ссылки каждые ${CONFIG.LINKS_REFRESH_INTERVAL / 1000}с`);
}

// Функция для остановки автоматического обновления
function stopAutoRefresh() {
    if (profileRefreshInterval) {
        clearInterval(profileRefreshInterval);
        profileRefreshInterval = null;
        console.log("Автоматическое обновление профиля остановлено");
    }
    if (linksRefreshInterval) {
        clearInterval(linksRefreshInterval);
        linksRefreshInterval = null;
        console.log("Автоматическое обновление ссылок остановлено");
    }
}

// Инициализация приложения
async function initApp() {
    setupEventListeners();

    // Первоначальная загрузка данных
    await Promise.all([
        fetchProfileData(),
        fetchLinksData()
    ]);

    // Запуск автоматического обновления
    startAutoRefresh();

    console.log("Приложение инициализировано");
}

// Запуск приложения после загрузки всех модулей
document.addEventListener('DOMContentLoaded', function () {
    // Убеждаемся, что модули инициализированы
    if (typeof LanguageModule !== 'undefined' && typeof ThemeModule !== 'undefined') {
        // Инициализация модулей (уже происходит в их файлах, но можно вызвать снова для гарантии)
        // LanguageModule.init();
        // ThemeModule.init();

        initApp();
    } else {
        console.error('Не удалось загрузить модули LanguageModule или ThemeModule');
        // Можно показать сообщение об ошибке пользователю
        if (DOM.status) {
            DOM.status.textContent = 'Ошибка инициализации приложения.';
        }
    }
});

// Опционально: остановка обновления при уходе со страницы (для экономии ресурсов)
window.addEventListener('beforeunload', function () {
    stopAutoRefresh();
});
