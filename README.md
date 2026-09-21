# 🌸 My Notepad — Aesthetic Calendar & Daily To-Do

> A chic, minimalist, and delightfully interactive calendar-based everyday to-do planner designed in a blush-pink aesthetic with instant task persistence, motivational celebrations, reminders, and multi-month navigation.

---

## ✨ Features

- **Editorial Blush Calendar**: High-impact bold month title and year, rose-tinted weekday headers (Monday–Sunday), and crisp grid cells matching the aesthetic reference design.
- **Pop-Out Daily Planner**: Click on any date on the calendar to open a sleek daily notepad modal to write down, view, and organize your to-dos.
- **Multi-Month & Multi-Year Navigation**: Effortlessly flip forward and backward through any month or year using the arrows or your arrow keys.
- **Celebration Quotes & Confetti**: Every time you check off a task, you're greeted with an uplifting quote (*"Woohoo! You did a great job!"*, *"Bravo! Task complete!"*, *"You go girl! Absolutely crushing it!"*), tasteful confetti, and an audio chime.
- **Smart Reminders**: Set optional reminder times for tasks. The app checks every minute and alerts you with a chime and banner notification when it's time!
- **Never Loses Your Data**: All tasks and checkboxes are permanently preserved in your browser via `localStorage` indexed by date (`YYYY-MM-DD`).
- **Backup & Restore**: Easily download your tasks as a `.json` backup file or restore them anytime.
- **100% Offline & Lightweight**: Zero external npm build dependencies. Simply double-click `index.html` to run.

---

## 🚀 How to Run Locally

You don't need to install Node.js, run complex terminal build steps, or set up servers:

1. Open this folder: `playful-calendar-todo`
2. Double-click **`index.html`** in your file explorer.
3. That's it! It opens directly in Chrome, Edge, Safari, or Firefox with full functionality.

---

## 📦 How to Push to Your GitHub

Follow these simple steps to put this project on your personal GitHub account:

### Step 1: Create a new repository on GitHub
1. Go to [github.com](https://github.com) and log in.
2. Click the **+** (plus) icon in the top-right corner and select **New repository**.
3. Name your repository (for example: `my-notepad` or `aesthetic-calendar-todo`).
4. Set it to **Public**.
5. Leave "Add a README file" unchecked (since we already have this README).
6. Click **Create repository**.

### Step 2: Push your code from your computer
Open your terminal (PowerShell, Command Prompt, or Git Bash) inside this folder (`playful-calendar-todo`) and run:

```bash
# 1. Initialize git
git init

# 2. Add all files to staging
git add .

# 3. Create your first commit
git commit -m "Initial commit: Aesthetic Calendar & To-Do app"

# 4. Set branch to main
git branch -M main

# 5. Link your GitHub repository (replace USERNAME and REPO with yours)
git remote add origin https://github.com/USERNAME/REPO.git

# 6. Push to GitHub!
git push -u origin main
```

---

## 🌐 How to Host It Live for Free (GitHub Pages)

You can share your live calendar app with friends and use it on your phone:

1. On your GitHub repository page, click **Settings** (tab at the top right).
2. In the left sidebar, click **Pages**.
3. Under **Build and deployment** > **Branch**:
   - Select **`main`** from the branch dropdown.
   - Leave the folder as **`/ (root)`**.
   - Click **Save**.
4. In about 1–2 minutes, GitHub will give you a live link:
   `https://USERNAME.github.io/REPO/`
5. Visit the link on your computer or phone browser and enjoy your live planner!

---

## 📂 Project Structure

```
playful-calendar-todo/
├── index.html              # Main HTML markup & calendar grid
├── css/
│   ├── style.css           # Base styles, blush pink palette, typography
│   ├── calendar.css        # Bold month/year, weekday headers, calendar grid
│   └── planner-modal.css   # Pop-out daily planner card, toasts, animations
├── js/
│   ├── app.js              # Application controller & event wiring
│   ├── calendar.js         # Month/year calculations & date grid generation
│   ├── store.js            # Permanent localStorage persistence, backup/restore
│   ├── celebration.js      # Confetti burst, sound chime & motivational quotes
│   └── reminders.js        # Background time check & reminder notifications
├── README.md               # Quickstart & GitHub guide
└── .gitignore              # Git ignore rules
```
