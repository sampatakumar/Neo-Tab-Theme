# 🚀 NeoMorph Theme - Liquid Glassmorphism Chrome Extension

**NeoMorph Theme** is a modern Chrome Extension (Manifest V3) New Tab replacement built with a **Liquid Glassmorphism** design system, designed to keep your desktop wallpapers 100% clean and unobstructed while offering powerful quick-launch productivity tools.

---

## ✨ Features

- **🎨 Liquid Glassmorphism Aesthetics**: Translucent frosted glass surfaces, backdrop blur, specular highlights, glowing custom scrollbars, and dynamic background light morphing.
- **📂 Collapsible Hover Side Navbar Drawer**: All dashboard widgets (Clock, Search Bar, Bookmarks, To-Do List) are tucked away inside a left-side drawer. Hovering over the **Left-Side Animated Floating Button** smoothly slides out the drawer, keeping your wallpaper artwork 100% unblocked when closed.
- **🔍 Smart Search & Digital Clock**: Search Google or enter direct URLs with live real-time clock and date display.
- **🔖 Favicon Bookmark Quick-Launch**: Pre-populated default shortcuts (YouTube, Gmail, Google, GitHub) with automatic site favicon icons and modal popups (`+` button) for adding new links.
- **✅ Interactive To-Do List**: Task management featuring checkbox toggles, strike-through completion styling, item deletion, and modal additions.
- **🖼️ Custom Background Engine**: Upload local image or video files (stored safely in `chrome.storage.local`) or paste custom image/video URLs. Automatically suppresses shining orb overlays on custom backgrounds for sharp, crisp visuals.
- **⚙️ Theme Engine & Custom Tuning**: Includes 5 built-in glass presets (*Minimal Glass*, *Dark Liquid*, *Cyberpunk Neon*, *Nature Forest*, *Sunset Liquid*), a custom theme color creator with JSON Import/Export, and optional **Auto-Shuffle on New Tab**.
- **🧩 Extension Action Popup**: Tune settings either directly from the dashboard or through the Chrome extension toolbar action popup (`popup.html`).

---

## 🛠️ Installation & Setup

1. Clone or download this repository:
   ```bash
   git clone https://github.com/sampatakumar/Neo-Tab-Theme.git
   ```
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** in the top right corner.
4. Click **Load unpacked** and select the project directory (`NeoMorph Theme`).
5. Open a new tab to enjoy your liquid glass dashboard!

---

## 📁 Project Structure

```
├── manifest.json       # Manifest V3 Extension Configuration
├── newtab.html         # Main Liquid Glass Dashboard HTML
├── newtab.css          # Design System, Liquid Glassmorphism & Animations
├── newtab.js           # Storage Engine, Favicons, Modals & Theme Manager
├── popup.html          # Chrome Extension Action Popup
├── popup.css          # Extension Popup Styling
└── popup.js           # Extension Popup Logic & Sync
```

---

## 📄 License

MIT License. Feel free to customize and build upon this extension!
