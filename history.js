// history.js
document.addEventListener('DOMContentLoaded', () => {
  const historyList = document.getElementById('history-list');
  const clearBtn = document.getElementById('clear-history');
  
  // Загрузка истории
  loadHistory();

  function loadHistory() {
    const history = JSON.parse(localStorage.getItem('caloHistory')) || [];

    // Убираем скелетон-загрузку
    historyList.innerHTML = '';

    if (history.length === 0) {
      historyList.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; color: var(--text-color); opacity: 0.7;">
          <p>История расчётов пуста.</p>
          <p>Перейдите в <a href="calculator.html" style="color: var(--primary-color);">калькулятор</a>, чтобы сделать первый расчет!</p>
        </div>
      `;
    } else {
      history.forEach((entry, index) => {
        const div = document.createElement('div');
        div.className = 'history-entry';
        
        // Определяем иконку цели на основе калорий
        let goalIcon = '⚖️';
        let goalText = 'Поддержание';
        if (entry.calories < 1800) {
          goalIcon = '⬇️';
          goalText = 'Похудение';
        } else if (entry.calories > 2500) {
          goalIcon = '⬆️';
          goalText = 'Набор массы';
        }
        
        div.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; flex-wrap: wrap; gap: 10px;">
            <div>
              <strong>${goalIcon} ${entry.date}</strong>
              <div style="font-size: 12px; color: var(--text-color); opacity: 0.7; margin-top: 2px;">${goalText}</div>
            </div>
            <span style="background: var(--primary-color); color: white; padding: 6px 12px; border-radius: 20px; font-size: 14px; font-weight: 600;">
              ${entry.calories} ккал
            </span>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px; margin-top: 15px;">
            <div style="text-align: center; padding: 10px; background: rgba(76, 175, 80, 0.1); border-radius: 8px;">
              <div style="color: var(--primary-color); font-weight: 700; font-size: 18px;">${entry.proteinGrams}г</div>
              <div style="font-size: 12px; color: var(--text-color);">Белки</div>
            </div>
            <div style="text-align: center; padding: 10px; background: rgba(255, 152, 0, 0.1); border-radius: 8px;">
              <div style="color: #ff9800; font-weight: 700; font-size: 18px;">${entry.fatGrams}г</div>
              <div style="font-size: 12px; color: var(--text-color);">Жиры</div>
            </div>
            <div style="text-align: center; padding: 10px; background: rgba(33, 150, 243, 0.1); border-radius: 8px;">
              <div style="color: #2196f3; font-weight: 700; font-size: 18px;">${entry.carbGrams}г</div>
              <div style="font-size: 12px; color: var(--text-color);">Углеводы</div>
            </div>
          </div>
        `;
        historyList.appendChild(div);
      });
    }
  }

  clearBtn.addEventListener('click', () => {
    if (confirm('Вы уверены, что хотите очистить всю историю расчётов?')) {
      localStorage.removeItem('caloHistory');
      loadHistory();
      
      // Показываем уведомление об успешном удалении
      const notification = document.createElement('div');
      notification.className = 'theme-notification success';
      notification.innerHTML = `
        <strong>✅ История очищена!</strong>
        <p>Все записи удалены</p>
      `;

      document.body.appendChild(notification);

      // Позиционируем уведомление
      const clearBtnRect = clearBtn.getBoundingClientRect();
      notification.style.top = `${clearBtnRect.bottom + 10}px`;
      notification.style.left = `${clearBtnRect.left}px`;

      setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-10px)';
        setTimeout(() => notification.remove(), 300);
      }, 3000);
    }
  });

  // Добавляем анимацию появления элементов истории
  const style = document.createElement('style');
  style.textContent = `
    .history-entry {
      opacity: 0;
      transform: translateY(20px);
      animation: fadeInUp 0.6s ease-out forwards;
    }
    
    @keyframes fadeInUp {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;
  document.head.appendChild(style);
});