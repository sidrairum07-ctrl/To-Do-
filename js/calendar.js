/**
 * My Notepad - Calendar Engine
 * Renders the full monthly grid matching the reference design:
 * - Bold uppercase month name on the left
 * - Bold year on the right
 * - Monday through Sunday column layout
 * - Top-left day numbers & preview task pills
 * - Multi-month / multi-year navigation
 */

const Calendar = {
  currentDate: new Date(), // Selected navigation cursor
  selectedDateStr: null,   // Active date clicked by user (YYYY-MM-DD)

  monthNames: [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
  ],

  init() {
    // Default to today
    const today = new Date();
    this.currentDate = new Date(today.getFullYear(), today.getMonth(), 1);
    this.selectedDateStr = Store.formatDateKey(today);

    this.render();
  },

  prevMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.render();
  },

  nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.render();
  },

  goToToday() {
    const today = new Date();
    this.currentDate = new Date(today.getFullYear(), today.getMonth(), 1);
    this.selectedDateStr = Store.formatDateKey(today);
    this.render();
  },

  render() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    // Update Header Text (Matches Reference)
    const monthEl = document.getElementById('calendarMonth');
    const yearEl = document.getElementById('calendarYear');
    if (monthEl) monthEl.textContent = this.monthNames[month];
    if (yearEl) yearEl.textContent = year;

    const gridEl = document.getElementById('calendarDaysGrid');
    if (!gridEl) return;

    gridEl.innerHTML = '';

    // First day of current month
    const firstDayDate = new Date(year, month, 1);
    // Convert JS Sunday=0 to Monday=0
    // (Sun: 0 -> 6, Mon: 1 -> 0, Tue: 2 -> 1, ..., Sat: 6 -> 5)
    const startDayIndex = (firstDayDate.getDay() + 6) % 7;

    // Total days in current month
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Total days in previous month
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const todayStr = Store.formatDateKey(new Date());

    // 1. Previous Month Leading Days
    for (let i = startDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevDate = new Date(year, month - 1, dayNum);
      const dateKey = Store.formatDateKey(prevDate);
      gridEl.appendChild(this._createDayCell(dayNum, dateKey, true, todayStr));
    }

    // 2. Current Month Days
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const dateKey = Store.formatDateKey(date);
      gridEl.appendChild(this._createDayCell(d, dateKey, false, todayStr));
    }

    // 3. Next Month Trailing Days to fill full weeks (35 or 42 grid cells)
    const totalRendered = startDayIndex + daysInMonth;
    const totalSlots = totalRendered > 35 ? 42 : 35;
    const trailingDays = totalSlots - totalRendered;

    for (let n = 1; n <= trailingDays; n++) {
      const nextDate = new Date(year, month + 1, n);
      const dateKey = Store.formatDateKey(nextDate);
      gridEl.appendChild(this._createDayCell(n, dateKey, true, todayStr));
    }
  },

  _createDayCell(dayNum, dateKey, isOutsideMonth, todayStr) {
    const cell = document.createElement('div');
    cell.className = 'day-cell';
    cell.dataset.date = dateKey;

    if (isOutsideMonth) {
      cell.classList.add('outside-month');
    }
    if (dateKey === todayStr) {
      cell.classList.add('is-today');
    }
    if (dateKey === this.selectedDateStr) {
      cell.classList.add('is-selected');
    }

    // Day Header with number in top-left
    const topRow = document.createElement('div');
    topRow.className = 'day-cell-top';

    const numSpan = document.createElement('span');
    numSpan.className = 'day-number';
    numSpan.textContent = dayNum;
    topRow.appendChild(numSpan);

    cell.appendChild(topRow);

    // Task preview inside the cell
    const tasks = Store.getTasksForDate(dateKey);
    if (tasks.length > 0) {
      const previewWrap = document.createElement('div');
      previewWrap.className = 'cell-tasks-preview';

      const maxShow = 2;
      tasks.slice(0, maxShow).forEach(t => {
        const pill = document.createElement('div');
        pill.className = `cell-task-pill ${t.completed ? 'completed' : ''}`;
        
        const dot = document.createElement('span');
        dot.className = 'pill-dot';
        
        const text = document.createElement('span');
        text.className = 'pill-text';
        text.textContent = t.title;

        pill.appendChild(dot);
        pill.appendChild(text);
        previewWrap.appendChild(pill);
      });

      if (tasks.length > maxShow) {
        const moreSpan = document.createElement('span');
        moreSpan.className = 'cell-task-more';
        moreSpan.textContent = `+${tasks.length - maxShow} more`;
        previewWrap.appendChild(moreSpan);
      }

      cell.appendChild(previewWrap);
    }

    // Click handler to open the pop-out daily planner
    cell.addEventListener('click', () => {
      this.selectedDateStr = dateKey;
      // Re-highlight active cell
      document.querySelectorAll('.day-cell').forEach(c => c.classList.remove('is-selected'));
      cell.classList.add('is-selected');

      // Pop out the daily planner
      App.openPlannerModal(dateKey);
    });

    return cell;
  }
};
