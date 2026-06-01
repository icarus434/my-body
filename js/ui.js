/**
 * UI Module — My Body Health Tracker
 * Модалки, toast-нотифікації, рендеринг компонентів
 */
const UI = (() => {
    /* ─── Mood Config ─── */
    const MOODS = [
        { value: 1, emoji: '😫', label: 'Пригнічений' },
        { value: 2, emoji: '😔', label: 'Сумно' },
        { value: 3, emoji: '😐', label: 'Нейтрально' },
        { value: 4, emoji: '😊', label: 'Радісно' },
        { value: 5, emoji: '😁', label: 'Супер' }
    ];

    const ENERGY_LABELS = ['Виснажений', 'Втомлений', 'Нормально', 'Бадьорий', 'Енергійний'];

    /* ─── Modal Management ─── */
    const showModal = (modalId) => {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    const hideModal = (modalId) => {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        modal.classList.remove('active');
        document.body.style.overflow = '';
    };

    const hideAllModals = () => {
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.style.overflow = '';
    };

    /* ─── Toast Notifications ─── */
    const showToast = (message, type = 'success') => {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icon = type === 'success' ? '✅' : '❌';
        toast.innerHTML = `
            <span class="toast-icon">${icon}</span>
            <span>${message}</span>
        `;

        container.appendChild(toast);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            toast.classList.add('toast-removing');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    };

    /* ─── Render Profile Cards ─── */
    const renderProfileCards = () => {
        const container = document.getElementById('profiles-grid');
        if (!container) return;

        const profiles = Storage.getProfiles();
        container.innerHTML = '';

        profiles.forEach((profile, index) => {
            const lastEntry = Storage.getLastEntry(profile);
            const entryCount = Storage.getEntryCount(profile);
            const initial = profile.charAt(0).toUpperCase();

            const card = document.createElement('div');
            card.className = 'profile-card animate-slide-up';
            card.style.animationDelay = `${index * 0.1}s`;

            let statsHTML = '';
            let lastUpdateHTML = '';

            if (lastEntry) {
                const moodData = MOODS.find(m => m.value === lastEntry.mood);
                const moodDisplay = moodData ? `${moodData.emoji} ${moodData.label}` : '—';

                statsHTML = `
                    <div class="profile-stats">
                        <div class="stat-badge">
                            <span class="stat-value">${lastEntry.weight} кг</span>
                        </div>
                        <div class="stat-badge">
                            <span class="stat-value">${moodDisplay}</span>
                        </div>
                        <div class="stat-badge">
                            <span class="stat-value">${lastEntry.sleepHours || '—'} год сну</span>
                        </div>
                        <div class="stat-badge">
                            <span class="stat-value">${entryCount} записів</span>
                        </div>
                    </div>
                `;

                const dateObj = new Date(lastEntry.date);
                const formattedDate = dateObj.toLocaleDateString('uk-UA', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                });
                lastUpdateHTML = `<p class="profile-last-update">Останній запис: ${formattedDate}</p>`;
            } else {
                statsHTML = `<p class="profile-no-data">Ще немає записів</p>`;
                lastUpdateHTML = '';
            }

            card.innerHTML = `
                <div class="profile-avatar">${initial}</div>
                <h3 class="profile-name">${profile}</h3>
                ${statsHTML}
                ${lastUpdateHTML}
                <button class="btn-record" data-profile="${profile}">
                    Зафіксувати дані
                </button>
            `;

            container.appendChild(card);
        });
    };

    /* ─── Render Profile Selector in Form ─── */
    const renderProfileSelector = (selectId) => {
        const select = document.getElementById(selectId);
        if (!select) return;

        const profiles = Storage.getProfiles();
        select.innerHTML = profiles.map(p =>
            `<option value="${p}">${p}</option>`
        ).join('');
    };

    /* ─── Render Dashboard Profile Tabs ─── */
    const renderDashboardTabs = () => {
        const container = document.getElementById('profile-tabs');
        if (!container) return;

        const profiles = Storage.getProfiles();
        container.innerHTML = '';

        profiles.forEach((profile, index) => {
            const btn = document.createElement('button');
            btn.className = `tab-btn${index === 0 ? ' active' : ''}`;
            btn.dataset.profile = profile;
            btn.textContent = profile;
            container.appendChild(btn);
        });

        // Add comparison tab
        if (profiles.length >= 2) {
            const compareBtn = document.createElement('button');
            compareBtn.className = 'tab-btn';
            compareBtn.dataset.profile = '__compare__';
            compareBtn.textContent = 'Порівняння';
            container.appendChild(compareBtn);
        }
    };

    /* ─── Render Mood Selector ─── */
    const renderMoodSelector = (containerId) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = MOODS.map(mood => `
            <button type="button" class="mood-btn" data-value="${mood.value}">
                <span class="mood-emoji">${mood.emoji}</span>
                <span class="mood-text">${mood.label}</span>
            </button>
        `).join('');

        // Click handler
        container.querySelectorAll('.mood-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                container.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
            });
        });
    };

    /* ─── Render Star Rating ─── */
    const renderStarRating = (containerId, maxStars = 5) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';
        for (let i = 1; i <= maxStars; i++) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'star-btn';
            btn.dataset.value = i;
            btn.textContent = '★';
            container.appendChild(btn);
        }

        // Click handler
        container.querySelectorAll('.star-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const value = parseInt(btn.dataset.value);
                container.querySelectorAll('.star-btn').forEach((b, idx) => {
                    b.classList.toggle('active', idx < value);
                });
            });

            btn.addEventListener('mouseenter', () => {
                const value = parseInt(btn.dataset.value);
                container.querySelectorAll('.star-btn').forEach((b, idx) => {
                    b.style.color = idx < value ? 'var(--warning)' : '';
                });
            });

            btn.addEventListener('mouseleave', () => {
                container.querySelectorAll('.star-btn').forEach(b => {
                    b.style.color = '';
                });
            });
        });
    };

    /* ─── Setup Energy Slider ─── */
    const setupEnergySlider = (sliderId, displayId) => {
        const slider = document.getElementById(sliderId);
        const display = document.getElementById(displayId);
        if (!slider) return;

        const updateDisplay = () => {
            const val = parseInt(slider.value);
            if (display) {
                display.textContent = `${val}/5 — ${ENERGY_LABELS[val - 1]}`;
            }
            // Update slider track color
            const percent = ((val - 1) / 4) * 100;
            slider.style.background = `linear-gradient(to right, var(--accent-purple) 0%, var(--accent-cyan) ${percent}%, rgba(255,255,255,0.1) ${percent}%)`;

            // Update labels
            const labelsContainer = slider.closest('.form-group')?.querySelector('.energy-labels');
            if (labelsContainer) {
                labelsContainer.querySelectorAll('.energy-label').forEach((label, idx) => {
                    label.classList.toggle('active', idx === val - 1);
                });
            }
        };

        slider.addEventListener('input', updateDisplay);
        updateDisplay();
    };

    /* ─── Setup Sleep Duration Auto-calc ─── */
    const setupSleepCalculation = (startId, endId, displayId) => {
        const startInput = document.getElementById(startId);
        const endInput = document.getElementById(endId);
        const display = document.getElementById(displayId);

        if (!startInput || !endInput || !display) return;

        const calculate = () => {
            const start = startInput.value;
            const end = endInput.value;

            if (start && end) {
                const hours = Storage.calculateSleepHours(start, end);
                display.innerHTML = `
                    <span class="sleep-duration-value">${hours}</span>
                    <span class="sleep-duration-label">годин сну</span>
                `;
            } else {
                display.innerHTML = `
                    <span class="sleep-duration-label">Вкажіть час сну</span>
                `;
            }
        };

        startInput.addEventListener('change', calculate);
        endInput.addEventListener('change', calculate);
        calculate();
    };

    /* ─── Get Form Data ─── */
    const getRecordFormData = () => {
        const profile = document.getElementById('record-profile')?.value;
        const date = document.getElementById('record-date')?.value;
        const weight = parseFloat(document.getElementById('record-weight')?.value);
        const training = document.getElementById('record-training')?.checked || false;

        const moodBtn = document.querySelector('#mood-selector .mood-btn.selected');
        const mood = moodBtn ? parseInt(moodBtn.dataset.value) : null;

        const energy = parseInt(document.getElementById('record-energy')?.value) || 3;

        const sleepStart = document.getElementById('record-sleep-start')?.value || '';
        const sleepEnd = document.getElementById('record-sleep-end')?.value || '';
        const sleepHours = Storage.calculateSleepHours(sleepStart, sleepEnd);

        const water = parseFloat(document.getElementById('record-water')?.value) || 0;

        const activeStars = document.querySelectorAll('#nutrition-rating .star-btn.active');
        const nutrition = activeStars.length || 0;

        // Validation
        if (!profile) return { error: 'Оберіть профіль' };
        if (!date) return { error: 'Вкажіть дату' };
        if (isNaN(weight) || weight <= 0) return { error: 'Вкажіть вагу' };
        if (!mood) return { error: 'Оберіть настрій' };

        return {
            data: {
                date,
                weight,
                training,
                mood,
                energy,
                sleepStart,
                sleepEnd,
                sleepHours,
                water,
                nutrition
            },
            profile
        };
    };

    /* ─── Reset Form ─── */
    const resetRecordForm = () => {
        const form = document.getElementById('record-form');
        if (form) {
            // Reset date to today
            const dateInput = document.getElementById('record-date');
            if (dateInput) dateInput.value = new Date().toISOString().slice(0, 10);

            // Reset weight
            const weightInput = document.getElementById('record-weight');
            if (weightInput) weightInput.value = '';

            // Reset training toggle
            const trainingToggle = document.getElementById('record-training');
            if (trainingToggle) trainingToggle.checked = false;
            const toggleLabel = document.querySelector('#training-label');
            if (toggleLabel) {
                toggleLabel.textContent = 'Ні';
                toggleLabel.classList.remove('active');
            }

            // Reset mood
            document.querySelectorAll('#mood-selector .mood-btn').forEach(b => b.classList.remove('selected'));

            // Reset energy
            const energySlider = document.getElementById('record-energy');
            if (energySlider) {
                energySlider.value = 3;
                energySlider.dispatchEvent(new Event('input'));
            }

            // Reset sleep
            const sleepStart = document.getElementById('record-sleep-start');
            const sleepEnd = document.getElementById('record-sleep-end');
            if (sleepStart) sleepStart.value = '';
            if (sleepEnd) sleepEnd.value = '';

            const sleepDisplay = document.getElementById('sleep-duration');
            if (sleepDisplay) {
                sleepDisplay.innerHTML = '<span class="sleep-duration-label">Вкажіть час сну</span>';
            }

            // Reset water
            const waterInput = document.getElementById('record-water');
            if (waterInput) waterInput.value = '';

            // Reset stars
            document.querySelectorAll('#nutrition-rating .star-btn').forEach(b => b.classList.remove('active'));
        }
    };

    /* ─── Render Summary Stats ─── */
    const renderSummaryStats = (entries) => {
        const container = document.getElementById('stats-summary');
        if (!container) return;

        if (!entries || entries.length === 0) {
            container.innerHTML = '<p class="no-data-message">Немає даних для відображення</p>';
            return;
        }

        const avg = (arr) => arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : '—';

        const weights = entries.map(e => e.weight).filter(w => w > 0);
        const moods = entries.map(e => e.mood).filter(m => m > 0);
        const energies = entries.map(e => e.energy).filter(e => e > 0);
        const sleepHours = entries.map(e => e.sleepHours).filter(s => s > 0);
        const waterArr = entries.map(e => e.water).filter(w => w > 0);
        const trainings = entries.filter(e => e.training).length;
        const nutritionArr = entries.map(e => e.nutrition).filter(n => n > 0);

        const avgMoodVal = moods.length ? Math.round(moods.reduce((a, b) => a + b, 0) / moods.length) : 0;
        const moodData = MOODS.find(m => m.value === avgMoodVal);

        container.innerHTML = `
            <div class="summary-card animate-scale-in">
                <div class="summary-value">${avg(weights)} кг</div>
                <div class="summary-label">Середня вага</div>
            </div>
            <div class="summary-card animate-scale-in" style="animation-delay: 0.05s">
                <div class="summary-value">${avg(moods)}/5</div>
                <div class="summary-label">Настрій</div>
            </div>
            <div class="summary-card animate-scale-in" style="animation-delay: 0.1s">
                <div class="summary-value">${avg(energies)}/5</div>
                <div class="summary-label">Енергія</div>
            </div>
            <div class="summary-card animate-scale-in" style="animation-delay: 0.15s">
                <div class="summary-value">${avg(sleepHours)} год</div>
                <div class="summary-label">Сон</div>
            </div>
            <div class="summary-card animate-scale-in" style="animation-delay: 0.2s">
                <div class="summary-value">${trainings}/${entries.length}</div>
                <div class="summary-label">Тренувань</div>
            </div>
            <div class="summary-card animate-scale-in" style="animation-delay: 0.25s">
                <div class="summary-value">${avg(waterArr)} л</div>
                <div class="summary-label">Вода</div>
            </div>
        `;
    };

    /* ─── Render Entry History Table ─── */
    const renderHistoryTable = (profile, entries) => {
        const container = document.getElementById('history-section');
        if (!container) return;

        if (!entries || entries.length === 0) {
            container.innerHTML = '';
            return;
        }

        // Show most recent first
        const sorted = [...entries].reverse();

        const rows = sorted.map(entry => {
            const moodData = MOODS.find(m => m.value === entry.mood);
            const dateFormatted = new Date(entry.date).toLocaleDateString('uk-UA', {
                day: '2-digit',
                month: '2-digit'
            });

            return `
                <tr>
                    <td>${dateFormatted}</td>
                    <td>${entry.weight} кг</td>
                    <td>${entry.training ? 'Так' : '—'}</td>
                    <td>${moodData ? moodData.emoji : '—'}</td>
                    <td>${entry.energy}/5</td>
                    <td>${entry.sleepHours || '—'} год</td>
                    <td>${entry.water || '—'} л</td>
                    <td>${entry.nutrition ? '★'.repeat(entry.nutrition) : '—'}</td>
                    <td>
                        <button class="btn-delete-entry" data-profile="${profile}" data-date="${entry.date}" title="Видалити">
                            ✕
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        container.innerHTML = `
            <h3 class="history-title">Історія записів</h3>
            <div class="history-table-container">
                <table class="history-table">
                    <thead>
                        <tr>
                            <th>Дата</th>
                            <th>Вага</th>
                            <th>Тренув.</th>
                            <th>Настрій</th>
                            <th>Енергія</th>
                            <th>Сон</th>
                            <th>Вода</th>
                            <th>Харчув.</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    };

    /* ─── Public API ─── */
    return {
        MOODS,
        ENERGY_LABELS,
        showModal,
        hideModal,
        hideAllModals,
        showToast,
        renderProfileCards,
        renderProfileSelector,
        renderDashboardTabs,
        renderMoodSelector,
        renderStarRating,
        setupEnergySlider,
        setupSleepCalculation,
        getRecordFormData,
        resetRecordForm,
        renderSummaryStats,
        renderHistoryTable
    };
})();
