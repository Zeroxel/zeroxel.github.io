const apiUri_sheets = 'https://sheets.livepolls.app/api/spreadsheets/68c215d2-1f4e-471d-8d4c-9e5cb6ccf007/main-gtnntg';

async function fetchStatus() {
  try {
    const response = await fetch(apiUri_sheets);
    const data = await response.json();
    
    if (data.success && data.data.length > 0) {
      const status = data.data[0].status; 
      const username = data.data[0].username;
      document.getElementById('status').textContent = `${status}`;
      document.getElementById('username').textContent = `${username}`;
    } else {
      document.getElementById('status').textContent = 'Статус не найден.';
      document.getElementById('username').textContent = 'Не найден.';
    }
  } catch (error) {
    console.error('Ошибка при получении данных:', error);
    document.getElementById('status').textContent = 'Ошибка при загрузке статуса.';
    document.getElementById('username').textContent = 'Ошибка';
  }
}

// Запускаем функцию после загрузки страницы
fetchStatus();
