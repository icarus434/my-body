/**
 * App Module — My Body Health Tracker
 * Головна логіка додатку: навігація, event handlers, ініціалізація
 */
const App = (() => {
    /* ─── State ─── */
    let currentView = 'home';
    let currentDashboardProfile = null;
    let dashboardDateFrom = null;
    let dashboardDateTo = null;

    /* ─── Initialization ─── */
    const init = () => {
        // Set default date range (last 30 days)
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        dashboardDateFrom = thirtyDaysAgo.toISOString().slice(0, 10);
        dashboardDateTo = today.toISOString().slice(0, 10);

        // Render initial UI
        UI.renderProfileCards();

        // Setup navigation
        setupNavigation();

        // Setup modal handlers
        setupRecordModal();
        setupProfileModal();
        setupImportExport();

        // Setup dashboard
        setupDashboard();

        // Setup modal overlay close
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', () => UI.hideAllModals());
        });

        // Setup modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => UI.hideAllModals());
        });

        // Keyboard: Escape to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') UI.hideAllModals();
        });

        // 🔥 Firebase real-time sync — refresh UI when data changes from another device
        Storage.onChange(() => {
            UI.renderProfileCards();
            setupRecordButtons();
            if (currentView === 'dashboard') {
                refreshDashboard();
            }
        });

        console.log('🏋️ My Body Health Tracker — Ініціалізовано! (Firebase sync active)');
    };

    /* ─── Navigation ─── */
    const setupNavigation = () => {
        const navHome = document.getElementById('nav-home');
        const navDashboard = document.getElementById('nav-dashboard');

        if (navHome) {
            navHome.addEventListener('click', () => navigateTo('home'));
        }
        if (navDashboard) {
            navDashboard.addEventListener('click', () => navigateTo('dashboard'));
        }

        // Logo click → home
        const logo = document.querySelector('.header-logo');
        if (logo) {
            logo.addEventListener('click', () => navigateTo('home'));
        }
    };

    const navigateTo = (view) => {
        currentView = view;

        // Update views
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        const targetView = document.getElementById(`view-${view}`);
        if (targetView) targetView.classList.add('active');

        // Update nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        const activeNav = document.getElementById(`nav-${view}`);
        if (activeNav) activeNav.classList.add('active');

        // If navigating to dashboard, initialize it
        if (view === 'dashboard') {
            initDashboard();
        }

        // If navigating home, refresh cards
        if (view === 'home') {
            UI.renderProfileCards();
            setupRecordButtons();
        }
    };

    /* ─── Record Modal ─── */
    const setupRecordModal = () => {
        // Render form components
        UI.renderProfileSelector('record-profile');
        UI.renderMoodSelector('mood-selector');
        UI.renderStarRating('nutrition-rating');
        UI.renderEnergySelector('energy-selector');
        UI.setupSleepCalculation('record-sleep-start', 'record-sleep-end', 'sleep-duration');

        // Set default date
        const dateInput = document.getElementById('record-date');
        if (dateInput) {
            dateInput.value = new Date().toISOString().slice(0, 10);
        }

        // Training toggle label update
        const trainingToggle = document.getElementById('record-training');
        const trainingLabel = document.getElementById('training-label');
        if (trainingToggle && trainingLabel) {
            trainingToggle.addEventListener('change', () => {
                trainingLabel.textContent = trainingToggle.checked ? 'Так' : 'Ні';
                trainingLabel.classList.toggle('active', trainingToggle.checked);
            });
        }

        // Save button
        const saveBtn = document.getElementById('btn-save-record');
        if (saveBtn) {
            saveBtn.addEventListener('click', handleSaveRecord);
        }

        // Setup record buttons on profile cards
        setupRecordButtons();
    };

    const setupRecordButtons = () => {
        // Delegate click on profile cards' record buttons
        document.querySelectorAll('.btn-record').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const profile = e.target.dataset.profile;
                openRecordModal(profile);
            });
        });
    };

    const openRecordModal = (profile = null) => {
        UI.resetRecordForm();

        // Update profile selector
        UI.renderProfileSelector('record-profile');

        if (profile) {
            const select = document.getElementById('record-profile');
            if (select) select.value = profile;
        }

        // Re-init form components
        UI.renderMoodSelector('mood-selector');
        UI.renderStarRating('nutrition-rating');
        UI.setupEnergySlider('record-energy', 'energy-value');
        UI.setupSleepCalculation('record-sleep-start', 'record-sleep-end', 'sleep-duration');

        // Set date to today
        const dateInput = document.getElementById('record-date');
        if (dateInput) dateInput.value = new Date().toISOString().slice(0, 10);

        UI.showModal('modal-record');
    };

    const handleSaveRecord = () => {
        const result = UI.getRecordFormData();

        if (result.error) {
            UI.showToast(result.error, 'error');
            return;
        }

        Storage.saveEntry(result.profile, result.data);
        UI.showToast(`Дані збережено для ${result.profile}! ✨`, 'success');
        UI.hideModal('modal-record');

        // Refresh UI
        UI.renderProfileCards();
        setupRecordButtons();

        // If dashboard is active, refresh it
        if (currentView === 'dashboard') {
            refreshDashboard();
        }
    };

    /* ─── Profile Modal ─── */
    const setupProfileModal = () => {
        const addBtn = document.getElementById('btn-add-profile');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                UI.showModal('modal-profile');
                const input = document.getElementById('new-profile-name');
                if (input) {
                    input.value = '';
                    input.focus();
                }
            });
        }

        const saveProfileBtn = document.getElementById('btn-save-profile');
        if (saveProfileBtn) {
            saveProfileBtn.addEventListener('click', handleAddProfile);
        }

        // Enter key to save
        const nameInput = document.getElementById('new-profile-name');
        if (nameInput) {
            nameInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') handleAddProfile();
            });
        }
    };

    const handleAddProfile = () => {
        const input = document.getElementById('new-profile-name');
        const name = input?.value?.trim();

        if (!name) {
            UI.showToast('Введіть ім\'я профілю', 'error');
            return;
        }

        const success = Storage.addProfile(name);
        if (success) {
            UI.showToast(`Профіль "${name}" створено! 🎉`, 'success');
            UI.hideModal('modal-profile');
            UI.renderProfileCards();
            setupRecordButtons();
        } else {
            UI.showToast('Профіль з таким ім\'ям вже існує', 'error');
        }
    };

    /* ─── Import / Export ─── */
    const setupImportExport = () => {
        const exportBtn = document.getElementById('btn-export');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                Storage.exportData();
                UI.showToast('Дані експортовано! 📦', 'success');
            });
        }

        const importBtn = document.getElementById('btn-import');
        const fileInput = document.getElementById('file-import');

        if (importBtn && fileInput) {
            importBtn.addEventListener('click', () => fileInput.click());

            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (event) => {
                    const result = Storage.importData(event.target.result);
                    if (result.success) {
                        UI.showToast(result.message, 'success');
                        UI.renderProfileCards();
                        setupRecordButtons();
                        if (currentView === 'dashboard') {
                            initDashboard();
                        }
                    } else {
                        UI.showToast(result.message, 'error');
                    }
                };
                reader.readAsText(file);

                // Reset file input
                fileInput.value = '';
            });
        }
    };

    /* ─── Dashboard ─── */
    const setupDashboard = () => {
        // Date filter inputs
        const dateFrom = document.getElementById('filter-date-from');
        const dateTo = document.getElementById('filter-date-to');
        const filterBtn = document.getElementById('btn-filter');

        if (dateFrom) dateFrom.value = dashboardDateFrom;
        if (dateTo) dateTo.value = dashboardDateTo;

        if (filterBtn) {
            filterBtn.addEventListener('click', () => {
                dashboardDateFrom = dateFrom?.value || null;
                dashboardDateTo = dateTo?.value || null;
                refreshDashboard();
            });
        }

        // Tab clicks
        const tabsContainer = document.getElementById('profile-tabs');
        if (tabsContainer) {
            tabsContainer.addEventListener('click', (e) => {
                const tab = e.target.closest('.tab-btn');
                if (!tab) return;

                // Update active tab
                tabsContainer.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                currentDashboardProfile = tab.dataset.profile;
                refreshDashboard();
            });
        }

        // Delete entry handler (delegated)
        document.getElementById('history-section')?.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-delete-entry');
            if (!btn) return;

            const profile = btn.dataset.profile;
            const date = btn.dataset.date;

            if (confirm(`Видалити запис за ${date}?`)) {
                Storage.deleteEntry(profile, date);
                UI.showToast('Запис видалено', 'success');
                refreshDashboard();
                UI.renderProfileCards();
                setupRecordButtons();
            }
        });
    };

    const initDashboard = () => {
        // Render tabs
        UI.renderDashboardTabs();

        // Set current profile to first available
        const profiles = Storage.getProfiles();
        if (!currentDashboardProfile || !profiles.includes(currentDashboardProfile)) {
            currentDashboardProfile = profiles[0] || null;
        }

        // Set active tab
        const tabsContainer = document.getElementById('profile-tabs');
        if (tabsContainer) {
            tabsContainer.querySelectorAll('.tab-btn').forEach(tab => {
                tab.classList.toggle('active', tab.dataset.profile === currentDashboardProfile);
            });

            // Re-attach tab click handler
            tabsContainer.onclick = (e) => {
                const tab = e.target.closest('.tab-btn');
                if (!tab) return;

                tabsContainer.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                currentDashboardProfile = tab.dataset.profile;
                refreshDashboard();
            };
        }

        // Update date filter values
        const dateFrom = document.getElementById('filter-date-from');
        const dateTo = document.getElementById('filter-date-to');
        if (dateFrom) dateFrom.value = dashboardDateFrom;
        if (dateTo) dateTo.value = dashboardDateTo;

        refreshDashboard();
    };

    const refreshDashboard = () => {
        Charts.clearEmptyStates();

        if (currentDashboardProfile === '__compare__') {
            // Comparison mode
            const profiles = Storage.getProfiles();
            const allEntries = {};
            profiles.forEach(p => {
                allEntries[p] = Storage.getEntries(p, dashboardDateFrom, dashboardDateTo);
            });

            // Summary for all combined
            const combined = Object.values(allEntries).flat();
            UI.renderSummaryStats(combined);
            Charts.renderComparisonCharts(profiles, allEntries);
            UI.renderHistoryTable('', []); // Hide history in comparison mode
        } else if (currentDashboardProfile) {
            const entries = Storage.getEntries(currentDashboardProfile, dashboardDateFrom, dashboardDateTo);
            UI.renderSummaryStats(entries);
            Charts.renderAllCharts(entries);
            UI.renderHistoryTable(currentDashboardProfile, entries);
        }
    };

    /* ─── Public API ─── */
    return {
        init,
        navigateTo,
        openRecordModal,
    };
})();

/* ─── Start App on DOM Ready ─── */
document.addEventListener('DOMContentLoaded', App.init);
