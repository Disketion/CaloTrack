document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('calorie-form');
  const resultEl = document.getElementById('result');
  const ctx = document.getElementById('bjuChart')?.getContext('2d');
  const weightCtx = document.getElementById('weightChart')?.getContext('2d');

  if (!form) return;

  let chart = null;

  const dataLabelPlugin = {
    id: 'dataLabelPlugin',
    afterDatasetsDraw(chart) {
      const ctx = chart.ctx;
      chart.data.datasets.forEach((dataset, i) => {
        const meta = chart.getDatasetMeta(i);
        meta.data.forEach((arc, index) => {
          const data = dataset.data[index];
          const label = data + ' г';
          const centerPoint = arc.getCenterPoint();
          ctx.save();
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 14px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(label, centerPoint.x, centerPoint.y);
          ctx.restore();
        });
      });
    },
  };

  form.addEventListener('submit', e => {
    e.preventDefault();

    const gender = form.gender.value;
    const age = +form.age.value;
    const height = +form.height.value;
    const weight = +form.weight.value;
    const activity = +form.activity.value;
    const goal = form.goal.value;

    if (
      age < 10 || age > 120 ||
      height < 50 || height > 250 ||
      weight < 20 || weight > 300
    ) {
      resultEl.textContent = 'Проверь корректность введённых данных.';
      return;
    }

    let bmr = gender === 'male'
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;

    let tdee = bmr * activity;

    switch (goal) {
      case 'lose': tdee *= 0.85; break;
      case 'gain': tdee *= 1.15; break;
    }

    const calories = Math.round(tdee);

    let proteinPerKg, fatPerKg, carbPerKg;
    switch (goal) {
      case 'lose':
        proteinPerKg = 2.2; fatPerKg = 0.8; carbPerKg = 2.5;
        break;
      case 'gain':
        proteinPerKg = 2.0; fatPerKg = 1.2; carbPerKg = 5.0;
        break;
      default:
        proteinPerKg = 1.8; fatPerKg = 1.0; carbPerKg = 4.0;
    }

    const proteinGrams = Math.round(weight * proteinPerKg);
    const fatGrams = Math.round(weight * fatPerKg);
    const carbGrams = Math.round(weight * carbPerKg);

    // Расчёт ИМТ
    const heightM = height / 100;
    const bmi = +(weight / (heightM * heightM)).toFixed(1);
    let bmiStatus = '';

    if (bmi < 16) bmiStatus = 'Выраженный дефицит массы';
    else if (bmi < 18.5) bmiStatus = 'Недостаточный вес';
    else if (bmi < 25) bmiStatus = 'Нормальный вес';
    else if (bmi < 30) bmiStatus = 'Избыточный вес';
    else if (bmi < 35) bmiStatus = 'Ожирение I степени';
    else if (bmi < 40) bmiStatus = 'Ожирение II степени';
    else bmiStatus = 'Ожирение III степени';

    resultEl.innerHTML = `
      <strong>Суточный калораж:</strong> ${calories} ккал<br>
      <strong>Белки:</strong> ${proteinGrams} г<br>
      <strong>Жиры:</strong> ${fatGrams} г<br>
      <strong>Углеводы:</strong> ${carbGrams} г<br><br>
      <strong>ИМТ:</strong> ${bmi} — ${bmiStatus}
    `;

    // Диаграмма БЖУ
    const data = {
      labels: ['Белки', 'Жиры', 'Углеводы'],
      datasets: [{
        label: 'Граммы',
        data: [proteinGrams, fatGrams, carbGrams],
        backgroundColor: ['#4caf50', '#ff9800', '#2196f3'],
        hoverOffset: 30,
        borderRadius: 5,
      }],
    };

    const options = {
      responsive: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            font: { size: 14, weight: '600' },
          },
        },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.label}: ${ctx.parsed} г`,
          },
        },
      },
    };

    if (chart) chart.destroy();
    chart = new Chart(ctx, {
      type: 'doughnut',
      data,
      options,
      plugins: [dataLabelPlugin],
    });

    // График изменения веса
    if (weightCtx) {
      const maintenanceCalories = bmr * activity;
      const calorieDiffPerDay = calories - maintenanceCalories;
      const monthlyWeightChange = +(calorieDiffPerDay * 30 / 7700).toFixed(2);

      const weightData = Array.from({ length: 12 }, (_, i) =>
        +(weight + monthlyWeightChange * (i + 1)).toFixed(1)
      );

      const monthLabels = [
        '1 мес', '2 мес', '3 мес', '4 мес', '5 мес', '6 мес',
        '7 мес', '8 мес', '9 мес', '10 мес', '11 мес', '12 мес'
      ];

      if (window.weightChartObj) window.weightChartObj.destroy();

      window.weightChartObj = new Chart(weightCtx, {
        type: 'bar',
        data: {
          labels: monthLabels,
          datasets: [{
            label: 'Вес (кг)',
            data: weightData,
            backgroundColor: '#4caf50',
            borderRadius: 8,
            barThickness: 24,
          }]
        },
        options: {
          responsive: false,
          scales: {
            y: {
              beginAtZero: false,
              ticks: {
                callback: value => value + ' кг'
              }
            }
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: ctx => `Вес: ${ctx.parsed.y} кг`
              }
            }
          }
        }
      });
    }

    //  Сохраняем в историю без дублирования
    const historyItem = {
      date: new Date().toLocaleString('ru-RU'),
      calories,
      proteinGrams,
      fatGrams,
      carbGrams,
    };

    let history = JSON.parse(localStorage.getItem('caloHistory')) || [];
    const last = history[0];
    if (!last || JSON.stringify(last) !== JSON.stringify(historyItem)) {
      history.unshift(historyItem);
      if (history.length > 20) history = history.slice(0, 20);
      localStorage.setItem('caloHistory', JSON.stringify(history));
    }
  });
});