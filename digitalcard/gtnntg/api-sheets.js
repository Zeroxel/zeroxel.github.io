const apiUri_sheets = 'https://sheets.livepolls.app/api/spreadsheets/3b95e3e1-82e1-49fe-baf8-bf02c5d8deae/main-gtnntg';

async function fetchStatus() {
  try {
    const response = await fetch(apiUri_sheets);
    const data = await response.json();

    if (data.success && data.data.length > 0) {
      const onlinestatus = data.data[0].onlinestatus;
      const status = data.data[0].status; 
      const username = data.data[0].username;
      const avatar = data.data[0].avatar; // Поле для аватара

      document.getElementById('status').textContent = `${status}`;
      document.getElementById('username').textContent = `${username}`;
      document.getElementById('onlinestatus').textContent = `${onlinestatus}`;

      const avatarElement = document.getElementById('avatar');
      if (avatar) {
        avatarElement.src = avatar; // Установка ссылки на аватар
        avatarElement.alt = `Avatar of ${username}`;
      } else {
        console.warn('Ссылка на аватар отсутствует.');
        avatarElement.alt = 'Аватар отсутствует';
      }
      if (document.getElementById('status').textContent === "none") {
        document.getElementById('api-status').hidden = true
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
