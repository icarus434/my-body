/**
 * Storage Module — My Body Health Tracker
 * 🔥 Firebase Realtime Database + localStorage cache
 * Real-time sync between all devices
 */
const Storage = (() => {
    const CACHE_KEY = 'myBody_cache';

    /* ─── Firebase Configuration ─── */
    const firebaseConfig = {
        apiKey: "AIzaSyARUQBL2i2sBTCn2WXduesxb1o0tZqVItg",
        authDomain: "my-body-7210c.firebaseapp.com",
        databaseURL: "https://my-body-7210c-default-rtdb.europe-west1.firebasedatabase.app",
        projectId: "my-body-7210c",
        storageBucket: "my-body-7210c.firebasestorage.app",
        messagingSenderId: "481527385131",
        appId: "1:481527385131:web:bd3c251a6679daed88ee6e"
    };

    /* ─── Initialize Firebase ─── */
    firebase.initializeApp(firebaseConfig);
    const db = firebase.database();
    const dbRef = db.ref('my-body-data');

    /* ─── Local Cache ─── */
    let data = loadCache();
    let changeCallbacks = [];
    let firebaseReady = false;

    function getDefaultData() {
        return {
            profiles: ['Богдан', 'Ліза'],
            entries: {}
        };
    }

    function loadCache() {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                if (parsed.profiles && parsed.entries) return parsed;
            } catch {}
        }
        return getDefaultData();
    }

    function saveCache() {
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    }

    /* ─── Firebase → Local conversion ─── */
    // Firebase stores entries as { "Богдан": { "2026-06-01": {weight:80,...}, ... } }
    // App uses entries as { "Богдан": [ {date:"2026-06-01", weight:80, ...}, ... ] }

    function firebaseToLocal(fbData) {
        if (!fbData) return getDefaultData();

        const result = {
            profiles: fbData.profiles || ['Богдан', 'Ліза'],
            entries: {}
        };

        // Ensure profiles is array
        if (!Array.isArray(result.profiles)) {
            result.profiles = Object.values(result.profiles);
        }

        if (fbData.entries) {
            Object.keys(fbData.entries).forEach(profile => {
                const profileEntries = fbData.entries[profile];
                if (!profileEntries) {
                    result.entries[profile] = [];
                    return;
                }

                if (Array.isArray(profileEntries)) {
                    result.entries[profile] = profileEntries;
                } else if (typeof profileEntries === 'object') {
                    // Convert {date: data} object to array
                    result.entries[profile] = Object.keys(profileEntries).map(date => {
                        const entry = profileEntries[date];
                        return {
                            date,
                            weight: parseFloat(entry.weight) || 0,
                            training: !!entry.training,
                            mood: parseInt(entry.mood) || 0,
                            energy: parseInt(entry.energy) || 3,
                            sleepStart: entry.sleepStart || '',
                            sleepEnd: entry.sleepEnd || '',
                            sleepHours: parseFloat(entry.sleepHours) || 0,
                            water: parseFloat(entry.water) || 0,
                            nutrition: parseInt(entry.nutrition) || 0
                        };
                    });
                }

                // Sort newest first
                result.entries[profile].sort((a, b) => b.date.localeCompare(a.date));
            });
        }

        return result;
    }

    function localToFirebaseEntries(entries) {
        // Convert array of entries to {date: data} object for Firebase
        const result = {};
        (entries || []).forEach(entry => {
            const { date, ...rest } = entry;
            result[date] = rest;
        });
        return result;
    }

    /* ─── Firebase Real-time Listener ─── */
    dbRef.on('value', (snapshot) => {
        const fbData = snapshot.val();
        if (fbData) {
            data = firebaseToLocal(fbData);
        } else {
            // Database is empty — push defaults
            const defaults = getDefaultData();
            dbRef.set({
                profiles: defaults.profiles,
                entries: {}
            });
            data = defaults;
        }
        firebaseReady = true;
        saveCache();
        notifyChange();
    }, (error) => {
        console.warn('Firebase read error:', error.message);
        // Continue with cached data
    });

    /* ─── Change Notification ─── */
    function notifyChange() {
        changeCallbacks.forEach(cb => {
            try { cb(data); } catch (e) { console.error('Change callback error:', e); }
        });
    }

    const onChange = (callback) => {
        changeCallbacks.push(callback);
    };

    /* ─── Profile Management ─── */
    const getProfiles = () => {
        return data.profiles || [];
    };

    const addProfile = (name) => {
        const trimmed = name.trim();
        if (!trimmed) return false;
        if (data.profiles.includes(trimmed)) return false;

        data.profiles.push(trimmed);
        data.entries[trimmed] = [];
        saveCache();

        // Push to Firebase
        dbRef.child('profiles').set(data.profiles);
        return true;
    };

    const removeProfile = (name) => {
        const idx = data.profiles.indexOf(name);
        if (idx === -1) return false;

        data.profiles.splice(idx, 1);
        delete data.entries[name];
        saveCache();

        // Update Firebase
        dbRef.child('profiles').set(data.profiles);
        dbRef.child('entries/' + name).remove();
        return true;
    };

    /* ─── Entry CRUD ─── */
    const saveEntry = (profile, entry) => {
        if (!data.entries[profile]) {
            data.entries[profile] = [];
        }

        // Sanitize numeric fields to prevent undefined/NaN in Firebase
        entry.weight = parseFloat(entry.weight) || 0;
        entry.mood = parseInt(entry.mood) || 0;
        entry.energy = parseInt(entry.energy) || 3;
        entry.sleepHours = parseFloat(entry.sleepHours) || 0;
        entry.water = parseFloat(entry.water) || 0;
        entry.nutrition = parseInt(entry.nutrition) || 0;
        entry.training = !!entry.training;

        // Update local cache
        const existingIdx = data.entries[profile].findIndex(e => e.date === entry.date);
        if (existingIdx !== -1) {
            data.entries[profile][existingIdx] = entry;
        } else {
            data.entries[profile].push(entry);
        }
        data.entries[profile].sort((a, b) => b.date.localeCompare(a.date));
        saveCache();

        // Push to Firebase (store without date field, date is the key)
        const { date, ...entryData } = entry;
        dbRef.child('entries/' + profile + '/' + date).set(entryData);
    };

    const getEntries = (profile, dateFrom = null, dateTo = null) => {
        let entries = data.entries[profile] || [];

        if (dateFrom) {
            entries = entries.filter(e => e.date >= dateFrom);
        }
        if (dateTo) {
            entries = entries.filter(e => e.date <= dateTo);
        }

        // Sort chronologically (oldest first for charts)
        return [...entries].sort((a, b) => a.date.localeCompare(b.date));
    };

    const getLastEntry = (profile) => {
        const entries = data.entries[profile] || [];
        if (entries.length === 0) return null;
        return entries[0]; // Already sorted newest first
    };

    const getTodayEntry = (profile) => {
        const today = new Date().toISOString().slice(0, 10);
        const entries = data.entries[profile] || [];
        return entries.find(e => e.date === today) || null;
    };

    const deleteEntry = (profile, date) => {
        if (!data.entries[profile]) return false;
        const idx = data.entries[profile].findIndex(e => e.date === date);
        if (idx === -1) return false;

        data.entries[profile].splice(idx, 1);
        saveCache();

        // Remove from Firebase
        dbRef.child('entries/' + profile + '/' + date).remove();
        return true;
    };

    /* ─── Export / Import ─── */
    const exportData = () => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `my-body-backup-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const importData = (jsonString) => {
        try {
            const imported = JSON.parse(jsonString);
            if (!imported.profiles || !imported.entries) {
                throw new Error('Невірний формат файлу');
            }

            // Merge profiles
            imported.profiles.forEach(profile => {
                if (!data.profiles.includes(profile)) {
                    data.profiles.push(profile);
                    data.entries[profile] = [];
                }
            });

            // Merge entries
            Object.keys(imported.entries).forEach(profile => {
                if (!data.entries[profile]) {
                    data.entries[profile] = [];
                }
                const importedEntries = imported.entries[profile] || [];
                importedEntries.forEach(entry => {
                    const existingIdx = data.entries[profile].findIndex(e => e.date === entry.date);
                    if (existingIdx !== -1) {
                        data.entries[profile][existingIdx] = entry;
                    } else {
                        data.entries[profile].push(entry);
                    }
                });
                data.entries[profile].sort((a, b) => b.date.localeCompare(a.date));
            });

            saveCache();

            // Push everything to Firebase
            const fbEntries = {};
            Object.keys(data.entries).forEach(profile => {
                fbEntries[profile] = localToFirebaseEntries(data.entries[profile]);
            });
            dbRef.set({
                profiles: data.profiles,
                entries: fbEntries
            });

            return { success: true, message: 'Дані успішно імпортовано!' };
        } catch (err) {
            return { success: false, message: `Помилка імпорту: ${err.message}` };
        }
    };

    /* ─── Utility ─── */
    const getEntryCount = (profile) => {
        return (data.entries[profile] || []).length;
    };

    const calculateSleepHours = (sleepStart, sleepEnd) => {
        if (!sleepStart || !sleepEnd) return 0;
        const [sh, sm] = sleepStart.split(':').map(Number);
        const [eh, em] = sleepEnd.split(':').map(Number);

        let startMinutes = sh * 60 + sm;
        let endMinutes = eh * 60 + em;

        if (endMinutes <= startMinutes) {
            endMinutes += 24 * 60;
        }

        const diff = endMinutes - startMinutes;
        return Math.round((diff / 60) * 10) / 10;
    };

    const isReady = () => firebaseReady;

    /* ─── Public API ─── */
    return {
        getProfiles,
        addProfile,
        removeProfile,
        saveEntry,
        getEntries,
        getLastEntry,
        getTodayEntry,
        deleteEntry,
        exportData,
        importData,
        getEntryCount,
        calculateSleepHours,
        onChange,
        isReady
    };
})();
