const apiUri_links = 'https://sheets.livepolls.app/api/spreadsheets/68c215d2-1f4e-471d-8d4c-9e5cb6ccf007/links';

async function fetchLinksAndDisplay() {
  try {
    const response = await fetch(apiUri_links);
    const data = await response.json();

    if (data.success && data.data.length > 0) {
      const linksContainer = document.querySelector('.links ul');

      data.data.forEach(item => {
        // Обрабатываем каждую пару ключ-значение в объекте
        Object.entries(item).forEach(([markdown, logo]) => {
          // Парсим заголовок и ссылку из Markdown-строки
          const match = markdown.match(/\[(.*?)\]\((.*?)\)/);
          if (!match) {
            console.error('Неверный формат заголовка с ссылкой:', markdown);
            return;
          }
          const title = match[1]; // Текст внутри квадратных скобок
          const link = match[2];  // Ссылка внутри круглых скобок

          // Логирование в консоль
          console.log(`Заголовок: ${title}`);
          console.log(`Ссылка для текста: ${link}`);
          console.log(`Логотип: ${logo}`);

          // Создаем элементы для отображения
          const li = document.createElement('li');
          const a = document.createElement('a');
          a.href = link; 
          a.target = '_blank';

          const img = document.createElement('img');
          img.src = logo; 
          img.alt = `Logo of ${title}`;
          img.className = 'logo-icon';

          // Добавляем логотип и текст ссылки
          a.appendChild(img);
          a.appendChild(document.createTextNode(` ${title}`));
          li.appendChild(a);

          // Вставляем элемент в контейнер
          linksContainer.appendChild(li);

          // Логирование успешного добавления в DOM
          console.log(`Добавлена ссылка в DOM: ${link}`);
        });
      });
    } else {
      console.error('Нет данных для ссылок и логотипов.');
    }
  } catch (error) {
    console.error('Ошибка при загрузке данных:', error);
  }
}

fetchLinksAndDisplay();
