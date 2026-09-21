/**
 * My Notepad - Reminders Engine
 * Checks tasks scheduled with reminder times for today and notifies the user.
 */

const Reminders = {
  checkInterval: null,
  notifiedTaskIds: new Set(),

  init() {
    // Check permission for desktop notifications politely if supported
    if ('Notification' in window && Notification.permission === 'default') {
      // We will request on first interaction or user gesture
    }

    // Dismiss alert button
    const dismissBtn = document.getElementById('dismissReminderBtn');
    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => {
        const alertBox = document.getElementById('reminderAlert');
        if (alertBox) alertBox.classList.add('hidden');
      });
    }

    // Start background checker loop
    this.startChecker();
  },

  startChecker() {
    if (this.checkInterval) clearInterval(this.checkInterval);

    // Run initial check and then every 25 seconds
    this.checkDueTasks();
    this.checkInterval = setInterval(() => {
      this.checkDueTasks();
    }, 25000);
  },

  checkDueTasks() {
    const today = new Date();
    const todayKey = Store.formatDateKey(today);
    const tasks = Store.getTasksForDate(todayKey);

    const nowHours = String(today.getHours()).padStart(2, '0');
    const nowMinutes = String(today.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${nowHours}:${nowMinutes}`;

    tasks.forEach(task => {
      if (!task.completed && task.time && !this.notifiedTaskIds.has(task.id)) {
        // Compare times
        if (task.time === currentTimeStr) {
          this.notifiedTaskIds.add(task.id);
          this.triggerReminder(task);
        }
      }
    });
  },

  triggerReminder(task) {
    // Play alert sound
    Celebration.playChime();

    // Show In-App Alert Card
    const alertBox = document.getElementById('reminderAlert');
    const msg = document.getElementById('reminderMessage');
    if (alertBox && msg) {
      msg.textContent = `"${task.title}" is due now!`;
      alertBox.classList.remove('hidden');

      // Auto-hide after 10s if not dismissed
      setTimeout(() => {
        alertBox.classList.add('hidden');
      }, 10000);
    }

    // Desktop Notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification('My Notepad Reminder', {
          body: `${task.title} is scheduled for now.`,
          icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23E26D82"><circle cx="12" cy="12" r="10"/></svg>'
        });
      } catch (e) {
        console.warn('Desktop notification failed:', e);
      }
    }
  },

  requestPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }
};
