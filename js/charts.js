/**
 * Charts Module — My Body Health Tracker
 * Chart.js графіки з красивими градієнтами та адаптивним дизайном
 */
const Charts = (() => {
    /* ─── Chart Instances Registry ─── */
    let chartInstances = {};

    /* ─── Color Palettes ─── */
    const COLORS = {
        purple: { main: '#BF5AF2', light: 'rgba(191, 90, 242, 0.2)', border: 'rgba(191, 90, 242, 0.8)' },
        cyan: { main: '#64D2FF', light: 'rgba(100, 210, 255, 0.2)', border: 'rgba(100, 210, 255, 0.7)' },
        pink: { main: '#FF375F', light: 'rgba(255, 55, 95, 0.2)', border: 'rgba(255, 55, 95, 0.7)' },
        green: { main: '#30D158', light: 'rgba(48, 209, 88, 0.2)', border: 'rgba(48, 209, 88, 0.7)' },
        yellow: { main: '#FFD60A', light: 'rgba(255, 214, 10, 0.2)', border: 'rgba(255, 214, 10, 0.7)' },
        red: { main: '#FF453A', light: 'rgba(255, 69, 58, 0.2)', border: 'rgba(255, 69, 58, 0.7)' },
        blue: { main: '#0A84FF', light: 'rgba(10, 132, 255, 0.2)', border: 'rgba(10, 132, 255, 0.8)' },
        orange: { main: '#FF9F0A', light: 'rgba(255, 159, 10, 0.2)', border: 'rgba(255, 159, 10, 0.7)' },
    };

    /* ─── Chart.js Global Defaults ─── */
    const setDefaults = () => {
        Chart.defaults.color = 'rgba(235, 235, 245, 0.3)';
        Chart.defaults.font.family = "-apple-system, 'SF Pro Text', 'Inter', system-ui, sans-serif";
        Chart.defaults.font.size = 11;
        Chart.defaults.plugins.legend.labels.usePointStyle = true;
        Chart.defaults.plugins.legend.labels.padding = 16;
        Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(44, 44, 46, 0.95)';
        Chart.defaults.plugins.tooltip.titleColor = '#ffffff';
        Chart.defaults.plugins.tooltip.bodyColor = 'rgba(235, 235, 245, 0.6)';
        Chart.defaults.plugins.tooltip.borderColor = 'rgba(84, 84, 88, 0.65)';
        Chart.defaults.plugins.tooltip.borderWidth = 0.5;
        Chart.defaults.plugins.tooltip.cornerRadius = 10;
        Chart.defaults.plugins.tooltip.padding = 10;
        Chart.defaults.plugins.tooltip.displayColors = true;
        Chart.defaults.scale.grid = {
            color: 'rgba(84, 84, 88, 0.25)',
            drawBorder: false,
        };
        Chart.defaults.scale.ticks = {
            ...Chart.defaults.scale.ticks,
            color: 'rgba(235, 235, 245, 0.3)',
        };
    };

    /* ─── Gradient Helper ─── */
    const createGradient = (ctx, colorMain, colorLight) => {
        const gradient = ctx.createLinearGradient(0, 0, 0, 250);
        gradient.addColorStop(0, colorMain);
        gradient.addColorStop(1, colorLight);
        return gradient;
    };

    /* ─── Destroy All Charts ─── */
    const destroyAll = () => {
        Object.values(chartInstances).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        chartInstances = {};
    };

    /* ─── Format Dates for Labels ─── */
    const formatDateLabels = (entries) => {
        return entries.map(e => {
            const d = new Date(e.date);
            return d.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' });
        });
    };

    /* ─── Weight Chart ─── */
    const renderWeightChart = (canvasId, entries) => {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        if (chartInstances[canvasId]) chartInstances[canvasId].destroy();

        if (!entries || entries.length === 0) {
            showEmptyState(canvas);
            return;
        }

        const gradient = createGradient(ctx, 'rgba(10, 132, 255, 0.35)', 'rgba(10, 132, 255, 0.02)');

        chartInstances[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: formatDateLabels(entries),
                datasets: [{
                    label: 'Вага (кг)',
                    data: entries.map(e => e.weight),
                    borderColor: COLORS.blue.border,
                    backgroundColor: gradient,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: COLORS.blue.main,
                    pointBorderColor: '#1c1c1e',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 7,
                    borderWidth: 2.5,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `${ctx.parsed.y} кг`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: (val) => `${val} кг`
                        }
                    }
                }
            }
        });
    };

    /* ─── Mood & Energy Chart ─── */
    const renderMoodEnergyChart = (canvasId, entries) => {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        if (chartInstances[canvasId]) chartInstances[canvasId].destroy();

        if (!entries || entries.length === 0) {
            showEmptyState(canvas);
            return;
        }

        const gradientMood = createGradient(ctx, 'rgba(255, 55, 95, 0.3)', 'rgba(255, 55, 95, 0.02)');
        const gradientEnergy = createGradient(ctx, 'rgba(100, 210, 255, 0.2)', 'rgba(100, 210, 255, 0.02)');

        chartInstances[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: formatDateLabels(entries),
                datasets: [
                    {
                        label: 'Настрій',
                        data: entries.map(e => e.mood),
                        borderColor: COLORS.pink.border,
                        backgroundColor: gradientMood,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: COLORS.pink.main,
                        pointBorderColor: '#1c1c1e',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 7,
                        borderWidth: 2.5,
                    },
                    {
                        label: 'Енергія',
                        data: entries.map(e => e.energy),
                        borderColor: COLORS.cyan.border,
                        backgroundColor: gradientEnergy,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: COLORS.cyan.main,
                        pointBorderColor: 'rgba(255,255,255,0.8)',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 7,
                        borderWidth: 2.5,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (ctx) => {
                                if (ctx.datasetIndex === 0) {
                                    const moods = ['Пригнічений', 'Сумно', 'Нейтрально', 'Радісно', 'Супер'];
                                    return `Настрій: ${moods[ctx.parsed.y - 1] || ctx.parsed.y}`;
                                }
                                return `Енергія: ${ctx.parsed.y}/5`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        min: 1,
                        max: 5,
                        ticks: {
                            stepSize: 1,
                            callback: (val) => {
                                const labels = ['😫', '😔', '😐', '😊', '😁'];
                                return labels[val - 1] || val;
                            }
                        }
                    }
                }
            }
        });
    };

    /* ─── Sleep Chart ─── */
    const renderSleepChart = (canvasId, entries) => {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        if (chartInstances[canvasId]) chartInstances[canvasId].destroy();

        if (!entries || entries.length === 0) {
            showEmptyState(canvas);
            return;
        }

        // Color bars based on sleep duration
        const barColors = entries.map(e => {
            if (e.sleepHours >= 7) return COLORS.green.border;
            if (e.sleepHours >= 5) return COLORS.yellow.border;
            return COLORS.red.border;
        });

        const barBgColors = entries.map(e => {
            if (e.sleepHours >= 7) return COLORS.green.light;
            if (e.sleepHours >= 5) return COLORS.yellow.light;
            return COLORS.red.light;
        });

        chartInstances[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: formatDateLabels(entries),
                datasets: [{
                    label: 'Сон (годин)',
                    data: entries.map(e => e.sleepHours || 0),
                    backgroundColor: barBgColors,
                    borderColor: barColors,
                    borderWidth: 2,
                    borderRadius: 6,
                    borderSkipped: false,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `${ctx.parsed.y} год сну`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 14,
                        ticks: {
                            callback: (val) => `${val}г`
                        }
                    }
                }
            }
        });
    };

    /* ─── Training Chart ─── */
    const renderTrainingChart = (canvasId, entries) => {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        if (chartInstances[canvasId]) chartInstances[canvasId].destroy();

        if (!entries || entries.length === 0) {
            showEmptyState(canvas);
            return;
        }

        const barColors = entries.map(e =>
            e.training ? COLORS.green.border : 'rgba(84, 84, 88, 0.3)'
        );

        const barBgColors = entries.map(e =>
            e.training ? COLORS.green.light : 'rgba(84, 84, 88, 0.1)'
        );

        chartInstances[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: formatDateLabels(entries),
                datasets: [{
                    label: 'Тренування',
                    data: entries.map(e => e.training ? 1 : 0.15),
                    backgroundColor: barBgColors,
                    borderColor: barColors,
                    borderWidth: 2,
                    borderRadius: 6,
                    borderSkipped: false,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => ctx.raw > 0.5 ? '✅ Тренування' : '— Відпочинок'
                        }
                    }
                },
                scales: {
                    y: {
                        display: false,
                        max: 1.2,
                    }
                }
            }
        });
    };

    /* ─── Water Chart ─── */
    const renderWaterChart = (canvasId, entries) => {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        if (chartInstances[canvasId]) chartInstances[canvasId].destroy();

        if (!entries || entries.length === 0) {
            showEmptyState(canvas);
            return;
        }

        const gradient = createGradient(ctx, 'rgba(100, 210, 255, 0.3)', 'rgba(100, 210, 255, 0.02)');

        chartInstances[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: formatDateLabels(entries),
                datasets: [
                    {
                        label: 'Вода (л)',
                        data: entries.map(e => e.water || 0),
                        backgroundColor: 'rgba(6, 182, 212, 0.3)',
                        borderColor: COLORS.cyan.border,
                        borderWidth: 2,
                        borderRadius: 6,
                        borderSkipped: false,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `${ctx.parsed.y} л`
                        }
                    },
                    annotation: undefined // Will add goal line if plugin available
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (val) => `${val} л`
                        }
                    }
                }
            }
        });
    };

    /* ─── Nutrition Chart ─── */
    const renderNutritionChart = (canvasId, entries) => {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        if (chartInstances[canvasId]) chartInstances[canvasId].destroy();

        if (!entries || entries.length === 0) {
            showEmptyState(canvas);
            return;
        }

        const gradient = createGradient(ctx, 'rgba(255, 214, 10, 0.3)', 'rgba(255, 214, 10, 0.02)');

        chartInstances[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: formatDateLabels(entries),
                datasets: [{
                    label: 'Якість харчування',
                    data: entries.map(e => e.nutrition || 0),
                    borderColor: COLORS.yellow.border,
                    backgroundColor: gradient,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: COLORS.yellow.main,
                    pointBorderColor: '#1c1c1e',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 7,
                    borderWidth: 2.5,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `${'★'.repeat(ctx.parsed.y)} (${ctx.parsed.y}/5)`
                        }
                    }
                },
                scales: {
                    y: {
                        min: 0,
                        max: 5,
                        ticks: {
                            stepSize: 1,
                            callback: (val) => '★'.repeat(val)
                        }
                    }
                }
            }
        });
    };

    /* ─── Render All Charts for a Profile ─── */
    const renderAllCharts = (entries) => {
        setDefaults();
        renderWeightChart('chart-weight', entries);
        renderMoodEnergyChart('chart-mood-energy', entries);
        renderSleepChart('chart-sleep', entries);
        renderTrainingChart('chart-training', entries);
        renderWaterChart('chart-water', entries);
        renderNutritionChart('chart-nutrition', entries);
    };

    /* ─── Comparison Charts ─── */
    const renderComparisonCharts = (profiles, allEntries) => {
        setDefaults();
        const colors = [COLORS.blue, COLORS.pink, COLORS.cyan, COLORS.green];

        // Weight comparison
        renderComparisonLineChart('chart-weight', profiles, allEntries, 'weight', 'Вага (кг)', colors);
        renderComparisonLineChart('chart-mood-energy', profiles, allEntries, 'mood', 'Настрій', colors);
        renderComparisonBarChart('chart-sleep', profiles, allEntries, 'sleepHours', 'Сон (год)', colors);
        renderComparisonBarChart('chart-water', profiles, allEntries, 'water', 'Вода (л)', colors);
        renderComparisonLineChart('chart-nutrition', profiles, allEntries, 'nutrition', 'Харчування', colors);

        // Training — special
        renderComparisonTraining('chart-training', profiles, allEntries, colors);
    };

    const renderComparisonLineChart = (canvasId, profiles, allEntries, field, label, colors) => {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        if (chartInstances[canvasId]) chartInstances[canvasId].destroy();

        // Collect all unique dates
        const allDates = new Set();
        profiles.forEach(p => {
            (allEntries[p] || []).forEach(e => allDates.add(e.date));
        });
        const sortedDates = [...allDates].sort();

        if (sortedDates.length === 0) {
            showEmptyState(canvas);
            return;
        }

        const labels = sortedDates.map(d => {
            const date = new Date(d);
            return date.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' });
        });

        const datasets = profiles.map((profile, i) => {
            const c = colors[i % colors.length];
            const entries = allEntries[profile] || [];
            const dateMap = {};
            entries.forEach(e => { dateMap[e.date] = e[field]; });

            return {
                label: profile,
                data: sortedDates.map(d => dateMap[d] ?? null),
                borderColor: c.border,
                backgroundColor: c.light,
                fill: false,
                tension: 0.4,
                pointBackgroundColor: c.main,
                pointBorderColor: '#1c1c1e',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 7,
                borderWidth: 2.5,
                spanGaps: true,
            };
        });

        chartInstances[canvasId] = new Chart(ctx, {
            type: 'line',
            data: { labels, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y}`
                        }
                    }
                },
                scales: {
                    y: { beginAtZero: field !== 'weight' }
                }
            }
        });
    };

    const renderComparisonBarChart = (canvasId, profiles, allEntries, field, label, colors) => {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        if (chartInstances[canvasId]) chartInstances[canvasId].destroy();

        const allDates = new Set();
        profiles.forEach(p => {
            (allEntries[p] || []).forEach(e => allDates.add(e.date));
        });
        const sortedDates = [...allDates].sort();

        if (sortedDates.length === 0) {
            showEmptyState(canvas);
            return;
        }

        const labels = sortedDates.map(d => {
            const date = new Date(d);
            return date.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' });
        });

        const datasets = profiles.map((profile, i) => {
            const c = colors[i % colors.length];
            const entries = allEntries[profile] || [];
            const dateMap = {};
            entries.forEach(e => { dateMap[e.date] = e[field]; });

            return {
                label: profile,
                data: sortedDates.map(d => dateMap[d] ?? 0),
                backgroundColor: c.light,
                borderColor: c.border,
                borderWidth: 2,
                borderRadius: 6,
                borderSkipped: false,
            };
        });

        chartInstances[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: { labels, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y}`
                        }
                    }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    };

    const renderComparisonTraining = (canvasId, profiles, allEntries, colors) => {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        if (chartInstances[canvasId]) chartInstances[canvasId].destroy();

        // Doughnut chart showing training percentage per profile
        const data = profiles.map(p => {
            const entries = allEntries[p] || [];
            if (entries.length === 0) return 0;
            return Math.round((entries.filter(e => e.training).length / entries.length) * 100);
        });

        if (data.every(d => d === 0)) {
            showEmptyState(canvas);
            return;
        }

        chartInstances[canvasId] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: profiles,
                datasets: [{
                    data: data,
                    backgroundColor: profiles.map((_, i) => colors[i % colors.length].light),
                    borderColor: profiles.map((_, i) => colors[i % colors.length].border),
                    borderWidth: 2,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `${ctx.label}: ${ctx.parsed}% тренувань`
                        }
                    }
                }
            }
        });
    };

    /* ─── Empty State Helper ─── */
    const showEmptyState = (canvas) => {
        const parent = canvas.parentElement;
        if (parent) {
            const existing = parent.querySelector('.chart-empty');
            if (!existing) {
                const empty = document.createElement('div');
                empty.className = 'chart-empty';
                empty.textContent = 'Немає даних для відображення';
                parent.appendChild(empty);
            }
        }
    };

    /* ─── Clear Empty States ─── */
    const clearEmptyStates = () => {
        document.querySelectorAll('.chart-empty').forEach(el => el.remove());
    };

    /* ─── Public API ─── */
    return {
        renderAllCharts,
        renderComparisonCharts,
        destroyAll,
        clearEmptyStates,
        setDefaults
    };
})();
