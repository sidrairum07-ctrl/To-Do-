/**
 * My Notepad - Application Controller
 * Orchestrates event handling, modal pop-out, task creation, and updates.
 */

const App = {
  activeDateStr: null,

  init() {
    // Initialize Subsystems
    Calendar.init();
    Reminders.init();

    // Set Sound Toggle State
    this.updateSoundToggleUI();

    // Wire Up Calendar Navigation
    document.getElementById('prevMonthBtn')?.addEventListener('click', () => {
      Calendar.prevMonth();
    });

    document.getElementById('nextMonthBtn')?.addEventListener('click', () => {
      Calendar.nextMonth();
    });

    document.getElementById('todayBtn')?.addEventListener('click', () => {
      Calendar.goToToday();
    });

    // Sound Toggle Button
    document.getElementById('soundToggleBtn')?.addEventListener('click', () => {
      const current = Store.isSoundEnabled();
      Store.setSoundEnabled(!current);
      this.updateSoundToggleUI();
      if (!current) {
        Celebration.playChime();
      }
    });

    // Export / Import Backup
    document.getElementById('exportBtn')?.addEventListener('click', () => {
      Store.exportBackup();
    });

    document.getElementById('importFile')?.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result;
          if (content && Store.importBackup(content)) {
            Calendar.render();
            if (this.activeDateStr) {
              this.renderPlannerTasks(this.activeDateStr);
            }
            alert('Your notepad data has been restored successfully! ✨');
          } else {
            alert('Could not restore backup. Please make sure the file is a valid JSON backup.');
          }
        };
        reader.readAsText(file);
      }
    });

    // Modal Close Button
    document.getElementById('closePlannerBtn')?.addEventListener('click', () => {
      this.closePlannerModal();
    });

    // Click Outside Modal Card to Close
    const modalBackdrop = document.getElementById('plannerModal');
    modalBackdrop?.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) {
        this.closePlannerModal();
      }
    });

    // Global Keyboard Shortcuts (Esc to close, Arrow keys for month navigation)
    window.addEventListener('keydown', (e) => {
      const isModalOpen = !modalBackdrop.classList.contains('hidden');
      if (e.key === 'Escape' && isModalOpen) {
        this.closePlannerModal();
      } else if (!isModalOpen) {
        if (e.key === 'ArrowLeft') Calendar.prevMonth();
        if (e.key === 'ArrowRight') Calendar.nextMonth();
      }
    });

    // Add Task Form Submission
    const addForm = document.getElementById('addTaskForm');
    addForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleAddTask();
    });
  },

  updateSoundToggleUI() {
    const isEnabled = Store.isSoundEnabled();
    const soundOnIcon = document.getElementById('soundOnIcon');
    const soundOffIcon = document.getElementById('soundOffIcon');
    if (soundOnIcon && soundOffIcon) {
      if (isEnabled) {
        soundOnIcon.classList.remove('hidden');
        soundOffIcon.classList.add('hidden');
      } else {
        soundOnIcon.classList.add('hidden');
        soundOffIcon.classList.remove('hidden');
      }
    }
  },

  // Open Pop-Out Daily Planner Modal for a specific date
  openPlannerModal(dateStr) {
    this.activeDateStr = dateStr;
    const modal = document.getElementById('plannerModal');
    const dateTitle = document.getElementById('plannerDateTitle');
    if (!modal || !dateTitle) return;

    // Format human-friendly title, e.g. "Monday, September 21, 2026"
    const dateObj = Store.parseDateKey(dateStr);
    const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    dateTitle.textContent = dateObj.toLocaleDateString('en-US', options);

    // Render tasks for this day
    this.renderPlannerTasks(dateStr);

    // Reveal modal
    modal.classList.remove('hidden');

    // Auto-focus input
    setTimeout(() => {
      document.getElementById('taskTextInput')?.focus();
    }, 100);

    // Request notification permissions gracefully on interaction
    Reminders.requestPermission();
  },

  closePlannerModal() {
    const modal = document.getElementById('plannerModal');
    if (modal) {
      modal.classList.add('hidden');
    }
    // Refresh calendar to reflect any task changes in day cell previews
    Calendar.render();
  },

  // Handle adding new task
  handleAddTask() {
    if (!this.activeDateStr) return;

    const input = document.getElementById('taskTextInput');
    const timeInput = document.getElementById('taskTimeInput');
    const categorySelect = document.getElementById('taskCategorySelect');

    const title = input?.value.trim();
    if (!title) return;

    const time = timeInput?.value || '';
    const category = categorySelect?.value || 'General';

    Store.addTask(this.activeDateStr, { title, time, category });

    // Reset input fields
    if (input) input.value = '';
    if (timeInput) timeInput.value = '';

    // Re-render
    this.renderPlannerTasks(this.activeDateStr);
    Calendar.render();
  },

  // Render task list in the pop-out planner
  renderPlannerTasks(dateStr) {
    const taskList = document.getElementById('taskList');
    const emptyState = document.getElementById('emptyTasksState');
    if (!taskList) return;

    const tasks = Store.getTasksForDate(dateStr);
    taskList.innerHTML = '';

    if (tasks.length === 0) {
      if (emptyState) emptyState.classList.remove('hidden');
      this.updateProgress(0, 0);
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    let completedCount = 0;

    tasks.forEach(task => {
      if (task.completed) completedCount++;

      const li = document.createElement('li');
      li.className = `task-item ${task.completed ? 'completed' : ''}`;

      // Left wrap
      const leftWrap = document.createElement('div');
      leftWrap.className = 'task-item-left';

      // Custom Checkbox
      const checkbox = document.createElement('div');
      checkbox.className = `custom-checkbox ${task.completed ? 'checked' : ''}`;
      checkbox.setAttribute('role', 'checkbox');
      checkbox.setAttribute('aria-checked', task.completed ? 'true' : 'false');
      checkbox.setAttribute('tabindex', '0');

      // SVG Checkmark icon
      checkbox.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `;

      // Checkbox click handler
      const toggleAction = (e) => {
        e.stopPropagation();
        const updated = Store.toggleTask(dateStr, task.id);
        if (updated && updated.completed) {
          // CELEBRATION! Motivational quote + Confetti + Audio chime
          Celebration.celebrateTaskCompletion();
        }
        this.renderPlannerTasks(dateStr);
        Calendar.render();
      };

      checkbox.addEventListener('click', toggleAction);
      checkbox.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleAction(e);
        }
      });

      // Task text & tags
      const details = document.createElement('div');
      details.className = 'task-details';

      const title = document.createElement('span');
      title.className = 'task-title';
      title.textContent = task.title;

      const meta = document.createElement('div');
      meta.className = 'task-meta';

      const tag = document.createElement('span');
      tag.className = `tag-badge tag-${task.category}`;
      tag.textContent = task.category;
      meta.appendChild(tag);

      if (task.time) {
        const timeBadge = document.createElement('span');
        timeBadge.className = 'task-time-badge';
        timeBadge.innerHTML = `
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          ${this.formatTime12Hour(task.time)}
        `;
        meta.appendChild(timeBadge);
      }

      details.appendChild(title);
      details.appendChild(meta);

      leftWrap.appendChild(checkbox);
      leftWrap.appendChild(details);

      // Delete Button
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn-task-delete';
      deleteBtn.setAttribute('title', 'Delete task');
      deleteBtn.setAttribute('aria-label', 'Delete task');
      deleteBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      `;
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        Store.deleteTask(dateStr, task.id);
        this.renderPlannerTasks(dateStr);
        Calendar.render();
      });

      li.appendChild(leftWrap);
      li.appendChild(deleteBtn);
      taskList.appendChild(li);
    });

    this.updateProgress(completedCount, tasks.length);
  },

  // Update Progress Bar & Percentage
  updateProgress(completed, total) {
    const statsEl = document.getElementById('progressStats');
    const percentEl = document.getElementById('progressPercent');
    const barEl = document.getElementById('progressBar');

    const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

    if (statsEl) statsEl.textContent = `${completed} of ${total} completed`;
    if (percentEl) percentEl.textContent = `${pct}%`;
    if (barEl) barEl.style.width = `${pct}%`;
  },

  // Helper to format 24h (14:30) to 12h (2:30 PM)
  formatTime12Hour(timeStr) {
    if (!timeStr) return '';
    const [hStr, mStr] = timeStr.split(':');
    let h = parseInt(hStr, 10);
    const m = mStr;
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12; // 0 becomes 12
    return `${h}:${m} ${ampm}`;
  }
};

// Initialize Application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
