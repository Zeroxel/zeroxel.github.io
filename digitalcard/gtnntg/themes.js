// Модуль управления темами
const ThemeModule = (function() {
    // Темы
    const THEMES = {
        dark: {
            name: 'Темная',
            className: 'theme-dark',
            icon: 'fas fa-moon'
        },
        light: {
            name: 'Светлая',
            className: 'theme-light',
            icon: 'fas fa-sun'
        }
    };

    // DOM элементы для тем (изначально null)
    let DOM = {
        themeSelector: null,
        themeDropdown: null,
        currentTheme: null
    };

    let currentTheme = 'dark';
    let isInitialized = false;

    // Безопасное получение элементов DOM
    function getDOMElements() {
        if (!DOM.themeSelector) DOM.themeSelector = document.getElementById('themeSelector');
        if (!DOM.themeDropdown) DOM.themeDropdown = document.getElementById('themeDropdown');
        if (!DOM.currentTheme) DOM.currentTheme = document.getElementById('currentTheme');
    }

    // Загрузка предпочтений пользователя
    function loadUserPreferences() {
        const savedTheme = localStorage.getItem('preferredTheme');
        if (savedTheme && THEMES[savedTheme]) {
            currentTheme = savedTheme;
        }
        return currentTheme;
    }

    // Применение темы
    function applyTheme() {
        // Убедимся, что у нас есть ссылки на элементы
        getDOMElements();

        // Удаление всех классов тем
        Object.values(THEMES).forEach(theme => {
            document.body.classList.remove(theme.className);
        });
        
        // Применение текущей темы
        const theme = THEMES[currentTheme];
        if (theme) {
            document.body.classList.add(theme.className);
            if (DOM.currentTheme) {
                DOM.currentTheme.textContent = theme.name;
            }
            // Обновление иконки темы
            if (DOM.themeSelector) {
                const themeIcon = DOM.themeSelector.querySelector('i');
                if (themeIcon) {
                    themeIcon.className = theme.icon;
                }
            }
        }
    }

    // Смена темы
    function changeTheme(theme) {
        console.log(`Попытка сменить тему на: ${theme}`); // Отладка
        if (THEMES[theme]) {
            const oldTheme = currentTheme;
            currentTheme = theme;
            localStorage.setItem('preferredTheme', theme);
            applyTheme();
            console.log(`Тема изменена с ${oldTheme} на ${theme}`); // Отладка
            return true;
        } else {
            console.warn(`Попытка сменить на несуществующую тему: ${theme}`); // Отладка
        }
        return false;
    }

    // Получение текущей темы
    function getCurrentTheme() {
        return currentTheme;
    }

    // Инициализация модуля
    function init() {
        if (isInitialized) {
            console.log("ThemeModule уже инициализирован");
            return;
        }

        console.log("Инициализация ThemeModule...");
        loadUserPreferences(); // Загружаем предпочтения пользователя
        // applyTheme вызовется позже, когда DOM будет готов

        isInitialized = true;
        console.log(`ThemeModule инициализирован. Текущая тема: ${currentTheme}`);
    }

    // Инициализируем модуль сразу
    init();

    // Если DOM уже загружен, применяем тему
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            console.log("Событие DOMContentLoaded получено в ThemeModule");
            getDOMElements(); // Получаем элементы после загрузки DOM
            applyTheme(); // Применяем тему, когда элементы доступны
        });
    } else {
        // DOM уже загружен
        console.log("DOM уже загружен при инициализации ThemeModule");
        getDOMElements();
        applyTheme();
    }

    // Возвращаем публичные методы
    return {
        THEMES,
        init, // init безопасен для повторного вызова
        applyTheme,
        changeTheme,
        getCurrentTheme,
        loadUserPreferences
    };
})();
// --- Конец IIFE ThemeModule ---
