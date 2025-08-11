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

    // DOM элементы для тем
    const DOM = {
        themeSelector: document.getElementById('themeSelector'),
        themeDropdown: document.getElementById('themeDropdown'),
        currentTheme: document.getElementById('currentTheme')
    };

    let currentTheme = 'dark';

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
        if (THEMES[theme]) {
            currentTheme = theme;
            localStorage.setItem('preferredTheme', theme);
            applyTheme();
            return true;
        }
        return false;
    }

    // Получение текущей темы
    function getCurrentTheme() {
        return currentTheme;
    }

    // Инициализация модуля
    function init() {
        loadUserPreferences();
        applyTheme();
    }

    // Возвращаем публичные методы
    return {
        THEMES,
        DOM,
        init,
        applyTheme,
        changeTheme,
        getCurrentTheme,
        loadUserPreferences
    };
})();

// Инициализируем модуль тем при загрузке
document.addEventListener('DOMContentLoaded', function() {
    ThemeModule.init();
});
