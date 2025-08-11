// Модуль управления языками и переводами
const LanguageModule = (function() {
    // Языки и их переводы
    const LANGUAGES = {
        ru: {
            name: 'Русский',
            statusTitle: 'Статус',
            linksTitle: 'Ссылки',
            loadingStatus: 'Загрузка статуса...',
            backToHub: 'Назад к хабу',
            online: 'Онлайн',
            offline: 'Оффлайн',
            checkingStatus: 'Проверка статуса...',
            statusNotFound: 'Статус не найден.',
            userNotFound: 'Пользователь не найден.',
            errorLoadingStatus: 'Ошибка загрузки статуса.',
            errorLoadingLinks: 'Ошибка загрузки ссылок.',
            linksNotFound: 'Ссылки не найдены.'
        },
        en: {
            name: 'English',
            statusTitle: 'Status',
            linksTitle: 'Links',
            loadingStatus: 'Loading status...',
            backToHub: 'Back to Hub',
            online: 'Online',
            offline: 'Offline',
            checkingStatus: 'Checking status...',
            statusNotFound: 'Status not found.',
            userNotFound: 'User not found.',
            errorLoadingStatus: 'Error loading status.',
            errorLoadingLinks: 'Error loading links.',
            linksNotFound: 'Links not found.'
        }
    };

    // DOM элементы для перевода
    const DOM = {
        currentLanguage: document.getElementById('currentLanguage'),
        statusTitle: document.getElementById('statusTitle'),
        linksTitle: document.getElementById('linksTitle'),
        loadingStatus: document.getElementById('loadingStatus'),
        backToHubText: document.getElementById('backToHubText'),
        username: document.getElementById('username'),
        status: document.getElementById('status'),
        onlinestatus: document.getElementById('onlinestatus')
    };

    let currentLanguage = 'ru';

    // Загрузка предпочтений пользователя
    function loadUserPreferences() {
        const savedLanguage = localStorage.getItem('preferredLanguage');
        if (savedLanguage && LANGUAGES[savedLanguage]) {
            currentLanguage = savedLanguage;
        }
        return currentLanguage;
    }

    // Получение перевода по ключу
    function getTranslation(key) {
        return LANGUAGES[currentLanguage][key] || key;
    }

    // Загрузка переводов в интерфейс
    function loadTranslations() {
        const t = LANGUAGES[currentLanguage];
        if (!t) return;
        
        if (DOM.currentLanguage) DOM.currentLanguage.textContent = t.name;
        if (DOM.statusTitle) DOM.statusTitle.textContent = t.statusTitle;
        if (DOM.linksTitle) DOM.linksTitle.textContent = t.linksTitle;
        if (DOM.loadingStatus) DOM.loadingStatus.textContent = t.loadingStatus;
        if (DOM.backToHubText) DOM.backToHubText.textContent = t.backToHub;
    }

    // Смена языка
    function changeLanguage(lang) {
        if (LANGUAGES[lang]) {
            currentLanguage = lang;
            localStorage.setItem('preferredLanguage', lang);
            loadTranslations();
            return true;
        }
        return false;
    }

    // Получение текущего языка
    function getCurrentLanguage() {
        return currentLanguage;
    }

    // Инициализация модуля
    function init() {
        loadUserPreferences();
        loadTranslations();
    }

    // Возвращаем публичные методы
    return {
        LANGUAGES,
        DOM,
        init,
        getTranslation,
        loadTranslations,
        changeLanguage,
        getCurrentLanguage,
        loadUserPreferences
    };
})();

// Инициализируем модуль языков при загрузке
document.addEventListener('DOMContentLoaded', function() {
    LanguageModule.init();
});
