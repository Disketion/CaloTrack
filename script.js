// script.js с улучшенными анимациями
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('calorie-form');
    const resultEl = document.getElementById('result');
    const ctx = document.getElementById('bjuChart')?.getContext('2d');
    const weightCtx = document.getElementById('weightChart')?.getContext('2d');

    if (!form) return;

    let chart = null;
    let weightChart = null;

    // Плагин для анимированных диаграмм
    const animatedDataLabelPlugin = {
        id: 'animatedDataLabel',
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
                    ctx.font = 'bold 14px Outfit, Arial, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
                    ctx.shadowBlur = 4;
                    ctx.shadowOffsetX = 2;
                    ctx.shadowOffsetY = 2;
                    ctx.fillText(label, centerPoint.x, centerPoint.y);
                    ctx.restore();
                });
            });
        },
    };

    // Анимация появления формы
    animateFormElements();

    function animateFormElements() {
        const formElements = form.querySelectorAll('.calc-group');
        formElements.forEach((element, index) => {
            element.style.animationDelay = `${index * 0.1}s`;
            element.classList.add('fadeIn');
        });
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Анимация загрузки
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Рассчитываем...';
        submitBtn.classList.add('loading');
        
        // Задержка для лучшего UX
        await new Promise(resolve => setTimeout(resolve, 800));
        calculateCalories();
    });

    async function calculateCalories() {
        // Анимация расчета
        resultEl.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <div class="skeleton skeleton-text" style="width: 80%; margin: 10px auto;"></div>
                <div class="skeleton skeleton-text" style="width: 60%; margin: 10px auto;"></div>
                <div class="skeleton skeleton-text" style="width: 70%; margin: 10px auto;"></div>
            </div>
        `;

        // Имитация расчета
        await new Promise(resolve => setTimeout(resolve, 1000));

        const gender = form.gender.value;
        const age = +form.age.value;
        const height = +form.height.value;
        const weight = +form.weight.value;
        const activity = +form.activity.value;
        const goal = form.goal.value;

        // Валидация с анимацией
        if (age < 10 || age > 120 || height < 50 || height > 250 || weight < 20 || weight > 300) {
            showError('Проверь корректность введённых данных.');
            resetSubmitButton();
            return;
        }

        // Расчеты...
        let bmr = gender === 'male'
            ? 10 * weight + 6.25 * height - 5 * age + 5
            : 10 * weight + 6.25 * height - 5 * age - 161;

        let tdee = bmr * activity;

        switch (goal) {
            case 'lose': tdee *= 0.85; break;
            case 'gain': tdee *= 1.15; break;
        }

        const calories = Math.round(tdee);

        // Расчет БЖУ
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

        // Расчет ИМТ
        const heightM = height / 100;
        const bmi = +(weight / (heightM * heightM)).toFixed(1);
        let bmiStatus = '';
        let bmiColor = '';

        if (bmi < 16) {
            bmiStatus = 'Выраженный дефицит массы';
            bmiColor = '#e53935';
        } else if (bmi < 18.5) {
            bmiStatus = 'Недостаточный вес';
            bmiColor = '#ff9800';
        } else if (bmi < 25) {
            bmiStatus = 'Нормальный вес';
            bmiColor = '#4caf50';
        } else if (bmi < 30) {
            bmiStatus = 'Избыточный вес';
            bmiColor = '#ff9800';
        } else if (bmi < 35) {
            bmiStatus = 'Ожирение I степени';
            bmiColor = '#e53935';
        } else if (bmi < 40) {
            bmiStatus = 'Ожирение II степени';
            bmiColor = '#e53935';
        } else {
            bmiStatus = 'Ожирение III степени';
            bmiColor = '#b71c1c';
        }

        // Показ результатов с анимацией
        showResults(calories, proteinGrams, fatGrams, carbGrams, bmi, bmiStatus, bmiColor);
        
        // Создание графиков
        createAnimatedCharts(proteinGrams, fatGrams, carbGrams, weight, bmr, activity, calories);
        
        // Сохранение в историю
        saveToHistory(calories, proteinGrams, fatGrams, carbGrams);
        
        resetSubmitButton();
    }

    function showResults(calories, protein, fat, carbs, bmi, bmiStatus, bmiColor) {
        resultEl.classList.add('pulse-once');
        
        resultEl.innerHTML = `
            <div style="animation: fadeIn 0.6s ease-out;">
                <strong>🎯 Суточный калораж:</strong> <span style="color: var(--primary-color);">${calories} ккал</span><br>
                <strong>🥩 Белки:</strong> ${protein} г<br>
                <strong>🥑 Жиры:</strong> ${fat} г<br>
                <strong>🍚 Углеводы:</strong> ${carbs} г<br><br>
                <strong>📊 ИМТ:</strong> <span style="color: ${bmiColor}">${bmi} — ${bmiStatus}</span>
            </div>
        `;

        setTimeout(() => {
            resultEl.classList.remove('pulse-once');
        }, 600);
    }

    function createAnimatedCharts(proteinGrams, fatGrams, carbGrams, weight, bmr, activity, calories) {
        // Анимированная диаграмма БЖУ
        createAnimatedBJUDiagram(proteinGrams, fatGrams, carbGrams);
        
        // Анимированный график веса
        createAnimatedWeightChart(weight, bmr, activity, calories);
    }

    function createAnimatedBJUDiagram(proteinGrams, fatGrams, carbGrams) {
        const data = {
            labels: ['Белки', 'Жиры', 'Углеводы'],
            datasets: [{
                label: 'Граммы',
                data: [0, 0, 0], // Начальные значения для анимации
                backgroundColor: [
                    'rgba(76, 175, 80, 0.8)',
                    'rgba(255, 152, 0, 0.8)',
                    'rgba(33, 150, 243, 0.8)'
                ],
                borderColor: [
                    'rgb(76, 175, 80)',
                    'rgb(255, 152, 0)',
                    'rgb(33, 150, 243)'
                ],
                borderWidth: 2,
                hoverOffset: 20,
                borderRadius: 8,
            }],
        };

        const options = {
            responsive: false,
            animation: {
                animateScale: true,
                animateRotate: true,
                duration: 1000,
                easing: 'easeOutQuart'
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: { 
                            size: 14, 
                            weight: '600', 
                            family: 'Outfit' 
                        },
                        color: 'var(--text-color)'
                    },
                },
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.label}: ${context.parsed} г`,
                    },
                    backgroundColor: 'var(--card-bg)',
                    titleColor: 'var(--text-color)',
                    bodyColor: 'var(--text-color)',
                    borderColor: 'var(--primary-color)',
                    borderWidth: 1
                },
            },
            cutout: '60%',
        };

        if (chart) chart.destroy();

        chart = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: options,
            plugins: [animatedDataLabelPlugin],
        });

        // Анимация появления данных
        setTimeout(() => {
            chart.data.datasets[0].data = [proteinGrams, fatGrams, carbGrams];
            chart.update();
        }, 500);
    }

    function createAnimatedWeightChart(currentWeight, bmr, activity, targetCalories) {
        if (!weightCtx) return;

        const maintenanceCalories = bmr * activity;
        const calorieDiffPerDay = targetCalories - maintenanceCalories;
        const monthlyWeightChange = +(calorieDiffPerDay * 30 / 7700).toFixed(2);

        const weightData = Array.from({ length: 12 }, (_, i) =>
            +(currentWeight + monthlyWeightChange * (i + 1)).toFixed(1)
        );

        const monthLabels = [
            '1 мес', '2 мес', '3 мес', '4 мес', '5 мес', '6 мес',
            '7 мес', '8 мес', '9 мес', '10 мес', '11 мес', '12 мес'
        ];

        if (weightChart) weightChart.destroy();

        weightChart = new Chart(weightCtx, {
            type: 'bar',
            data: {
                labels: monthLabels,
                datasets: [{
                    label: 'Вес (кг)',
                    data: new Array(12).fill(currentWeight), // Начальные значения
                    backgroundColor: 'rgba(76, 175, 80, 0.6)',
                    borderColor: 'rgb(76, 175, 80)',
                    borderWidth: 2,
                    borderRadius: 8,
                    barThickness: 28,
                }]
            },
            options: {
                responsive: false,
                animation: {
                    duration: 2000,
                    easing: 'easeOutQuart'
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: value => value + ' кг',
                            font: { family: 'Outfit' },
                            color: 'var(--text-color)'
                        },
                        grid: {
                            color: 'var(--border-color)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: { family: 'Outfit' },
                            color: 'var(--text-color)'
                        }
                    }
                },
                plugins: {
                    legend: { 
                        display: false 
                    },
                    tooltip: {
                        callbacks: {
                            label: ctx => `Вес: ${ctx.parsed.y} кг`
                        },
                        backgroundColor: 'var(--card-bg)',
                        titleColor: 'var(--text-color)',
                        bodyColor: 'var(--text-color)',
                        borderColor: 'var(--primary-color)'
                    }
                }
            }
        });

        // Анимация появления данных
        setTimeout(() => {
            weightChart.data.datasets[0].data = weightData;
            weightChart.update();
        }, 1000);
    }

    function showError(message) {
        resultEl.classList.add('shake');
        resultEl.innerHTML = `<strong style="color: var(--error-color);">⚠️ ${message}</strong>`;
        
        setTimeout(() => {
            resultEl.classList.remove('shake');
        }, 500);
    }

    function resetSubmitButton() {
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Рассчитать';
        submitBtn.classList.remove('loading');
    }

    function saveToHistory(calories, proteinGrams, fatGrams, carbGrams) {
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
            
            // Показываем уведомление о сохранении
            showNotification('Расчет сохранен в историю!', 'success');
        }
    }

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <strong>${type === 'success' ? '✅' : 'ℹ️'} ${message}</strong>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideIn 0.5s ease-out reverse';
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }

    // Улучшение для мобильного ввода
    const numberInputs = document.querySelectorAll('input[type="number"]');
    numberInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('pulse-once');
            setTimeout(() => {
                this.parentElement.classList.remove('pulse-once');
            }, 600);
        });
    });

    // Анимация для кнопок продуктов
    const productButtons = document.querySelectorAll('.product-button');
    productButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            this.classList.add('pulse-once');
            setTimeout(() => {
                this.classList.remove('pulse-once');
            }, 600);
        });
    });

    // Анимация ползунка
    const activitySlider = document.getElementById('activity');
    if (activitySlider) {
        activitySlider.addEventListener('input', function() {
            this.style.background = `linear-gradient(90deg, #4caf50 0%, #81c784 ${this.value * 50}%, #aed581 50%, #dce775 75%, #ffeb3b 100%)`;
        });
    }
});

// CSS анимации для формы
const style = document.createElement('style');
style.textContent = `
    .calc-group {
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
    
    .fadeIn {
        animation: fadeIn 0.6s ease-out forwards;
    }
`;
document.head.appendChild(style);