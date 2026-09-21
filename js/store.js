/**
 * My Notepad - Data Store (Persistence Engine)
 * Saves, retrieves, and organizes to-do tasks per date string (YYYY-MM-DD).
 * Persists everything permanently into browser localStorage.
 */

const STORAGE_KEY = 'my_notepad_data_v1';
const SETTINGS_KEY = 'my_notepad_settings_v1';

const Store = {
  // Get all data
  _getData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error('Error reading localStorage:', e);
      return null;
    }
  },

  // Save all data
  _saveData(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  },

  // Initialize with initial welcome data if first time
  init() {
    let data = this._getData();
    if (!data) {
      const today = new Date();
      const todayStr = Store.formatDateKey(today);
      
      data = {
        [todayStr]: [
          {
            id: 'demo-1',
            title: 'Welcome to My Notepad! Click to check me off ✨',
            completed: false,
            time: '09:00',
            category: 'Personal',
            createdAt: new Date().toISOString()
          },
          {
            id: 'demo-2',
            title: 'Pick any date on the calendar to plan ahead',
            completed: false,
            time: '14:30',
            category: 'Work',
            createdAt: new Date().toISOString()
          }
        ]
      };
      this._saveData(data);
    }
  },

  // Format Date object to YYYY-MM-DD key
  formatDateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  },

  // Parse YYYY-MM-DD to Date object
  parseDateKey(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  },

  // Get tasks for a specific date
  getTasksForDate(dateStr) {
    const data = this._getData() || {};
    return data[dateStr] || [];
  },

  // Add a task to a specific date
  addTask(dateStr, { title, time = '', category = 'General' }) {
    const data = this._getData() || {};
    if (!data[dateStr]) {
      data[dateStr] = [];
    }

    const newTask = {
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      title: title.trim(),
      completed: false,
      time,
      category,
      createdAt: new Date().toISOString()
    };

    data[dateStr].push(newTask);
    this._saveData(data);
    return newTask;
  },

  // Toggle completion status
  toggleTask(dateStr, taskId) {
    const data = this._getData() || {};
    const tasks = data[dateStr] || [];
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      task.completedAt = task.completed ? new Date().toISOString() : null;
      this._saveData(data);
      return task;
    }
    return null;
  },

  // Delete a task
  deleteTask(dateStr, taskId) {
    const data = this._getData() || {};
    if (data[dateStr]) {
      data[dateStr] = data[dateStr].filter(t => t.id !== taskId);
      if (data[dateStr].length === 0) {
        delete data[dateStr];
      }
      this._saveData(data);
      return true;
    }
    return false;
  },

  // Get all tasks mapping
  getAllTasks() {
    return this._getData() || {};
  },

  // Sound settings
  isSoundEnabled() {
    const settings = localStorage.getItem(SETTINGS_KEY);
    if (settings) {
      try {
        const parsed = JSON.parse(settings);
        return parsed.sound !== false;
      } catch (e) {
        return true;
      }
    }
    return true;
  },

  setSoundEnabled(enabled) {
    const settings = { sound: !!enabled };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },

  // Export JSON backup
  exportBackup() {
    const data = this._getData() || {};
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-notepad-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // Import JSON backup
  importBackup(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (typeof parsed === 'object' && parsed !== null) {
        this._saveData(parsed);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to import backup:', e);
      return false;
    }
  }
};

// Initialize default store
Store.init();
