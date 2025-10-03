document.addEventListener('DOMContentLoaded', () => {
  const historyList = document.getElementById('history-list');
  const clearBtn = document.getElementById('clear-history');
  const history = JSON.parse(localStorage.getItem('caloHistory')) || [];

  if (history.length === 0) {
    historyList.innerHTML = '<p>История пуста.</p>';
  } else {
    history.forEach(entry => {
      const div = document.createElement('div');
      div.className = 'history-entry';
      div.innerHTML = `
        <strong>${entry.date}</strong>
        <p>Калории: ${entry.calories} ккал</p>
        <p>Белки: ${entry.proteinGrams} г, Жиры: ${entry.fatGrams} г, Углеводы: ${entry.carbGrams} г</p>
      `;
      historyList.appendChild(div);
    });
  }

  clearBtn.addEventListener('click', () => {
    if (confirm('Очистить всю историю?')) {
      localStorage.removeItem('caloHistory');
      historyList.innerHTML = '<p>История очищена.</p>';
    }
  });
});
