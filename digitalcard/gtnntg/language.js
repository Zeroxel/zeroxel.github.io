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

    // DOM элементы для перевода (изначально null, будут заполнены позже)
    let DOM = {
        currentLanguage: null,
        statusTitle: null,
        linksTitle: null,
        loadingStatus: null,
        backToHubText: null
        // username, status, onlinestatus больше не нужны здесь, так как api.js управляет ими напрямую
    };

    let currentLanguage = 'ru';
    let isInitialized = false; // Флаг инициализации
    let pendingTranslations = false; // Флаг, если нужно применить переводы после инициализации

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
        return LANGUAGES[currentLanguage]?.[key] || key;
    }

    // Безопасное получение элементов DOM
    function getDOMElements() {
        // Пытаемся получить элементы, если они ещё не получены
        if (!DOM.currentLanguage) DOM.currentLanguage = document.getElementById('currentLanguage');
        if (!DOM.statusTitle) DOM.statusTitle = document.getElementById('statusTitle');
        if (!DOM.linksTitle) DOM.linksTitle = document.getElementById('linksTitle');
        if (!DOM.loadingStatus) DOM.loadingStatus = document.getElementById('loadingStatus');
        if (!DOM.backToHubText) DOM.backToHubText = document.getElementById('backToHubText');
        // Не пытаемся получить username, status, onlinestatus здесь
    }

    // Загрузка переводов в интерфейс
    function loadTranslations() {
        // Проверяем, готовы ли элементы DOM
        getDOMElements();

        // Если DOM ещё не готов (элементы не найдены), откладываем применение
        if (!DOM.currentLanguage && document.readyState !== 'loading') {
             // Если документ уже загружен, а элементы всё ещё null, возможно, они отсутствуют
             console.warn("Элементы DOM для перевода не найдены. Убедитесь, что ID элементов совпадают.");
             return;
        }

        if (!DOM.currentLanguage) {
            // DOM ещё не готов
            pendingTranslations = true;
            console.log("Переводы отложены до готовности DOM");
            return;
        }

        const t = LANGUAGES[currentLanguage];
        if (!t) return;

        // Применяем переводы
        try {
            if (DOM.currentLanguage) DOM.currentLanguage.textContent = t.name;
            if (DOM.statusTitle) DOM.statusTitle.textContent = t.statusTitle;
            if (DOM.linksTitle) DOM.linksTitle.textContent = t.linksTitle;
            if (DOM.loadingStatus) DOM.loadingStatus.textContent = t.loadingStatus;
            if (DOM.backToHubText) DOM.backToHubText.textContent = t.backToHub;
            console.log(`Переводы применены для языка: ${currentLanguage}`);
        } catch (e) {
            console.error("Ошибка при применении переводов:", e);
        }
    }

    // Смена языка
    function changeLanguage(lang) {
        if (LANGUAGES[lang]) {
            const oldLang = currentLanguage;
            currentLanguage = lang;
            localStorage.setItem('preferredLanguage', lang);
            
            // Применяем переводы сразу
            loadTranslations();
            
            console.log(`Язык изменён с ${oldLang} на ${lang}`);
            return true;
        } else {
             console.warn(`Попытка сменить на несуществующий язык: ${lang}`);
        }
        return false;
    }

    // Получение текущего языка
    function getCurrentLanguage() {
        return currentLanguage;
    }

    // Инициализация модуля
    function init() {
        if (isInitialized) {
            console.log("LanguageModule уже инициализирован");
            return;
        }

        console.log("Инициализация LanguageModule...");
        loadUserPreferences(); // Загружаем предпочтения пользователя
        // Не вызываем loadTranslations здесь напрямую, так как DOM может быть не готов

        isInitialized = true;
        console.log(`LanguageModule инициализирован. Текущий язык: ${currentLanguage}`);

        // Проверяем, нужно ли применить отложенные переводы
        if (pendingTranslations && document.readyState !== 'loading') {
            console.log("Применение отложенных переводов...");
            loadTranslations();
            pendingTranslations = false;
        }
    }

    // Проверяем состояние DOM и применяем отложенные действия
    function checkAndApplyPending() {
        if (pendingTranslations && isInitialized) {
            console.log("DOM готов, применяем отложенные переводы...");
            loadTranslations();
            pendingTranslations = false;
        }
    }

    // --- Логика для работы с DOMContentLoaded ---
    // Инициализируем модуль как можно раньше
    init();

    // Если DOM уже загружен, применяем переводы
    if (document.readyState === 'loading') {
        // DOM ещё загружается, ждём события
        document.addEventListener('DOMContentLoaded', function() {
            console.log("Событие DOMContentLoaded получено в LanguageModule");
            getDOMElements(); // Получаем элементы после загрузки DOM
            checkAndApplyPending(); // Применяем отложенные переводы
            loadTranslations(); // Пробуем применить переводы ещё раз
        });
    } else {
        // DOM уже загружен
        console.log("DOM уже загружен при инициализации LanguageModule");
        getDOMElements();
        checkAndApplyPending();
        loadTranslations();
    }

    // Возвращаем публичные методы
    return {
        LANGUAGES,
        // DOM не возвращаем, так как он внутренний
        init, // init теперь безопасен для повторного вызова
        getTranslation,
        loadTranslations,
        changeLanguage,
        getCurrentLanguage,
        loadUserPreferences
    };
})();
// --- Конец IIFE LanguageModule ---
