// Конфигурация
const CONFIG = {
    // URL для данных профиля (Google Sheets API)
    PROFILE_API_URL: 'https://sheets.livepolls.app/api/spreadsheets/fc0ed5f8-a649-47c5-a6fa-946f177d998d/main-gtnntg',
    
    // URL для данных ссылок (GitHub Gist)
    LINKS_API_URL: 'https://gist.githubusercontent.com/Zeroxel/30d571fe4d15914c5a45ccf9a26255af/raw/9001c0cffd6392bca30f41a9f346dd035c87f293/links.json',
    
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
    linksData: null
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
                updateUI();
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

// Загрузка данных
async function fetchData() {
    await Promise.all([
        fetchProfileData(),
        fetchLinksData()
    ]);
    updateUI();
}

// Загрузка данных профиля
async function fetchProfileData() {
    try {
        const response = await fetch(CONFIG.PROFILE_API_URL.trim());
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
            state.profileData = data.data[0];
        }
    } catch (error) {
        console.error('Ошибка при получении данных профиля:', error);
    }
}

// Загрузка данных ссылок
async function fetchLinksData() {
    try {
        const response = await fetch(CONFIG.LINKS_API_URL.trim());
        const data = await response.json();
        state.linksData = data;
    } catch (error) {
        console.error('Ошибка при загрузке данных ссылок:', error);
    }
}

// Обновление интерфейса
function updateUI() {
    updateProfileUI();
    updateLinksUI();
}

// Обновление профиля в интерфейсе с цветным индикатором статуса
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
        
        // Обновление аватара
        if (DOM.avatar) {
            if (avatar) {
                DOM.avatar.innerHTML = '';
                const img = document.createElement('img');
                img.src = avatar;
                img.alt = `Avatar of ${username}`;
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.borderRadius = '50%';
                img.style.objectFit = 'cover';
                DOM.avatar.appendChild(img);
            } else {
                DOM.avatar.innerHTML = '<i class="fas fa-user"></i>';
            }
        }
        
        // Скрытие секции статуса если нужно
        if (status === "none") {
            const statusSection = document.querySelector('.status-section');
            if (statusSection) {
                statusSection.hidden = true;
            }
        }
    } else {
        if (DOM.username) DOM.username.textContent = t.errorLoadingStatus;
        if (DOM.status) DOM.status.textContent = t.errorLoadingStatus;
        if (DOM.onlinestatus) DOM.onlinestatus.textContent = t.checkingStatus;
        // Устанавливаем индикатор в серый цвет при ошибке
        if (DOM.statusIndicator) {
            DOM.statusIndicator.className = 'online-indicator status-offline';
        }
    }
}

// Обновление ссылок в интерфейсе
function updateLinksUI() {
    const currentLang = LanguageModule.getCurrentLanguage();
    const t = LanguageModule.LANGUAGES[currentLang];
    
    if (DOM.linksContainer) {
        DOM.linksContainer.innerHTML = '';

        if (state.linksData && Array.isArray(state.linksData)) {
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
            errorDiv.textContent = t.errorLoadingLinks || 'Ошибка загрузки ссылок.';
            DOM.linksContainer.appendChild(errorDiv);
        }
    }
}

// Инициализация приложения
function initApp() {
    setupEventListeners();
    fetchData();
}

// Запуск приложения после загрузки всех модулей
document.addEventListener('DOMContentLoaded', function() {
    // Убеждаемся, что модули инициализированы
    if (typeof LanguageModule !== 'undefined' && typeof ThemeModule !== 'undefined') {
        LanguageModule.init();
        ThemeModule.init();
        initApp();
    } else {
        console.error('Не удалось загрузить модули LanguageModule или ThemeModule');
    }
});
