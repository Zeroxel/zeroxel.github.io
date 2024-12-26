const apiUri_sheets = 'https://sheets.livepolls.app/api/spreadsheets/68c215d2-1f4e-471d-8d4c-9e5cb6ccf007/main-gamecop20';

async function fetchStatus() {
  try {
    const response = await fetch(apiUri_sheets);
    const data = await response.json();

    if (data.success && data.data.length > 0) {
      const status = data.data[0].status; 
      const username = data.data[0].username;
      const avatar = data.data[0].avatar; // Поле для аватара

      document.getElementById('status').textContent = `${status}`;
      document.getElementById('username').textContent = `${username}`;

      const avatarElement = document.getElementById('avatar');
      if (avatar) {
        avatarElement.src = avatar; // Установка ссылки на аватар
        avatarElement.alt = `Avatar of ${username}`;
      } else {
        console.warn('Ссылка на аватар отсутствует.');
        avatarElement.alt = 'Аватар отсутствует';
      }
    } else {
      document.getElementById('status').textContent = 'Статус не найден.';
      document.getElementById('username').textContent = 'Не найден.';
      console.error('Данные для статуса и имени не найдены.');
    }
  } catch (error) {
    console.error('Ошибка при получении данных:', error);
    document.getElementById('status').textContent = 'Ошибка при загрузке статуса.';
    document.getElementById('username').textContent = 'Ошибка';
  }
}

// Запускаем функцию после загрузки страницы
fetchStatus();
