# 📅 Schedule Tracker

A clean, offline-capable personal schedule tracker. Works on laptop and iPhone as an installable PWA (Progressive Web App).

## ✨ Features

- Add events with title, date/time, category, and priority
- Filter by All / Today / Upcoming / Done
- Marks overdue and soon-due events automatically
- Works fully offline after first load
- Installable on iPhone (Add to Home Screen) and laptop (Chrome/Edge)
- Data stored locally in your browser — private, no account needed

---

## 🚀 Deploy to GitHub Pages (free hosting)

### Step 1 — Create a GitHub account
Go to [github.com](https://github.com) and sign up if you don't have an account.

### Step 2 — Create a new repository
1. Click the **+** icon (top right) → **New repository**
2. Name it: `schedule-tracker`
3. Set it to **Public**
4. Click **Create repository**

### Step 3 — Upload the files
1. On your new repo page, click **uploading an existing file**
2. Drag and drop all 4 files:
   - `index.html`
   - `sw.js`
   - `manifest.json`
   - `icon.svg`
3. Click **Commit changes**

### Step 4 — Enable GitHub Pages
1. Go to your repo → **Settings** tab
2. Scroll to **Pages** in the left sidebar
3. Under **Source**, select **Deploy from a branch**
4. Branch: `main`, folder: `/ (root)`
5. Click **Save**

### Step 5 — Get your URL
After ~60 seconds, your site will be live at:
```
https://YOUR_USERNAME.github.io/schedule-tracker/
```
Replace `YOUR_USERNAME` with your GitHub username.

---

## 📱 Install on iPhone

1. Open your URL in **Safari** (must be Safari, not Chrome)
2. Tap the **Share button** (⬆ box with arrow) at the bottom
3. Tap **"Add to Home Screen"**
4. Tap **Add** — it appears on your home screen like a real app

## 💻 Install on Laptop (Chrome / Edge)

1. Open your URL in Chrome or Edge
2. Look for the **install icon** in the address bar (or the banner at the bottom)
3. Click **Install**
4. The app opens in its own window and works offline

---

## 📁 File Structure

```
schedule-tracker/
├── index.html      ← Main app
├── sw.js           ← Service worker (offline caching)
├── manifest.json   ← PWA config (name, icon, colors)
└── icon.svg        ← App icon
```

---

## ⚠️ Note on data sync

Data is stored in each browser's local storage separately. Events added on your laptop won't appear on your phone and vice versa. This is intentional — no server, no account, fully private. If you want sync across devices, let me know and I can add a cloud backend.
