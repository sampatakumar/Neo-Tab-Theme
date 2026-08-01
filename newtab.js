// newtab.js - Complete Liquid Glassmorphism Engine

// -----------------------------
// Storage Helper (Local + Fallback)
// -----------------------------
function saveData(key, value) {
  const payload = { [key]: value };
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    chrome.storage.local.set(payload, () => {
      if (chrome.runtime.lastError) {
        console.warn("chrome.storage.local write warning:", chrome.runtime.lastError);
        try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
      }
    });
  } else {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }
}

function loadData(key, callback) {
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get([key], result => {
      if (result && result[key] !== undefined) {
        callback(result[key]);
      } else {
        try {
          const raw = localStorage.getItem(key);
          callback(raw ? JSON.parse(raw) : undefined);
        } catch (e) {
          callback(undefined);
        }
      }
    });
  } else {
    try {
      const raw = localStorage.getItem(key);
      callback(raw ? JSON.parse(raw) : undefined);
    } catch (e) {
      callback(undefined);
    }
  }
}

// -----------------------------
// DOM Helper Utilities
// -----------------------------
function el(id) { return document.getElementById(id); }

function create(tag, props = {}) {
  const node = document.createElement(tag);
  Object.entries(props).forEach(([k, v]) => {
    if (k === "text") node.textContent = v;
    else if (k === "html") node.innerHTML = v;
    else if (k === "class") node.className = v;
    else node.setAttribute(k, v);
  });
  return node;
}

// -----------------------------
// Clock & Date Display
// -----------------------------
function updateClock() {
  const now = new Date();
  const clockEl = el("clock");
  const dateEl = el("date-display");
  
  if (clockEl) clockEl.textContent = now.toLocaleTimeString();
  if (dateEl) {
    dateEl.textContent = now.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }
}
setInterval(updateClock, 1000);
updateClock();

// -----------------------------
// Search Engine Handler
// -----------------------------
const searchInput = el("search");
if (searchInput) {
  searchInput.addEventListener("keypress", e => {
    if (e.key === "Enter") {
      const val = searchInput.value.trim();
      if (!val) return;
      
      const isUrl = /^https?:\/\//i.test(val) || (/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}(:\d+)?(\/.*)?$/i.test(val) && !val.includes(" "));
      if (isUrl) {
        const url = /^https?:\/\//i.test(val) ? val : "https://" + val;
        window.location.href = url;
      } else {
        window.location.href = "https://www.google.com/search?q=" + encodeURIComponent(val);
      }
    }
  });
}

// -----------------------------
// Left Side Floating Animated Sidebar Trigger Handler
// -----------------------------
const sidebarToggleBtn = el("sidebar-toggle");
const sideNavbar = el("side-navbar");

if (sidebarToggleBtn && sideNavbar) {
  sidebarToggleBtn.addEventListener("mouseenter", () => {
    sideNavbar.classList.add("is-open");
  });

  sidebarToggleBtn.addEventListener("click", () => {
    sideNavbar.classList.toggle("is-open");
  });

  sideNavbar.addEventListener("mouseleave", () => {
    const isBookmarkModalOpen = bookmarkModal && !bookmarkModal.classList.contains("hidden");
    const isTodoModalOpen = todoModal && !todoModal.classList.contains("hidden");
    const isSettingsModalOpen = settingsModal && !settingsModal.classList.contains("hidden");

    if (!isBookmarkModalOpen && !isTodoModalOpen && !isSettingsModalOpen) {
      sideNavbar.classList.remove("is-open");
    }
  });
}

// -----------------------------
// To-Do List Widget & Modal
// -----------------------------
function saveTodos() {
  const todos = [];
  document.querySelectorAll("#todo-list li").forEach(li => {
    todos.push({
      id: li.dataset.id || Date.now().toString(),
      text: li.querySelector(".todo-text").textContent,
      completed: li.querySelector(".todo-item-content").classList.contains("completed")
    });
  });
  saveData("todos", todos);
}

function renderTodoItem(item) {
  const li = create("li", { "data-id": item.id || Date.now().toString() });

  const contentDiv = create("div", { class: "todo-item-content" + (item.completed ? " completed" : "") });
  
  const checkboxLabel = create("label", { class: "checkbox-label" });
  const checkbox = create("input", { type: "checkbox" });
  checkbox.checked = !!item.completed;
  const customCb = create("span", { class: "custom-checkbox" });
  checkboxLabel.appendChild(checkbox);
  checkboxLabel.appendChild(customCb);

  const textSpan = create("span", { class: "todo-text", text: item.text });

  contentDiv.appendChild(checkboxLabel);
  contentDiv.appendChild(textSpan);

  checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
      contentDiv.classList.add("completed");
    } else {
      contentDiv.classList.remove("completed");
    }
    saveTodos();
  });

  const deleteBtn = create("button", { class: "action-btn-delete", title: "Delete task" });
  deleteBtn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
  deleteBtn.addEventListener("click", () => {
    li.remove();
    saveTodos();
  });

  li.appendChild(contentDiv);
  li.appendChild(deleteBtn);
  el("todo-list").appendChild(li);
}

const openTodoModalBtn = el("open-todo-modal");
const closeTodoModalBtn = el("close-todo-modal");
const todoModal = el("todo-modal");
const addTodoBtn = el("add-todo");
const todoInput = el("todo-input");

function openTodoModal() {
  if (todoModal) {
    todoModal.classList.remove("hidden");
    if (sideNavbar) sideNavbar.classList.add("is-open");
    if (todoInput) todoInput.focus();
  }
}

function closeTodoModal() {
  if (todoModal) {
    todoModal.classList.add("hidden");
    if (sideNavbar) sideNavbar.classList.remove("is-open");
  }
}

if (openTodoModalBtn) openTodoModalBtn.addEventListener("click", openTodoModal);
if (closeTodoModalBtn) closeTodoModalBtn.addEventListener("click", closeTodoModal);

if (todoModal) {
  todoModal.addEventListener("click", e => {
    if (e.target === todoModal) closeTodoModal();
  });
}

function handleAddTodo() {
  if (!todoInput) return;
  const text = todoInput.value.trim();
  if (!text) return;
  renderTodoItem({ id: Date.now().toString(), text, completed: false });
  todoInput.value = "";
  saveTodos();
  closeTodoModal();
}

if (addTodoBtn) addTodoBtn.addEventListener("click", handleAddTodo);
if (todoInput) {
  todoInput.addEventListener("keypress", e => {
    if (e.key === "Enter") handleAddTodo();
  });
}

function loadTodos() {
  loadData("todos", todos => {
    const list = el("todo-list");
    if (!list) return;
    list.innerHTML = "";
    if (!Array.isArray(todos)) return;
    todos.forEach(task => {
      if (typeof task === "string") {
        renderTodoItem({ id: Date.now().toString(), text: task, completed: false });
      } else {
        renderTodoItem(task);
      }
    });
  });
}

// -----------------------------
// Floating Bookmarks & + Button Tile inside Drawer
// -----------------------------
const defaultBookmarks = [
  { name: "YouTube", url: "https://www.youtube.com" },
  { name: "Gmail", url: "https://mail.google.com" },
  { name: "Google", url: "https://www.google.com" },
  { name: "GitHub", url: "https://github.com" }
];

function saveBookmarks() {
  const bookmarks = [];
  document.querySelectorAll("#bookmark-list .bookmark-tile").forEach(tile => {
    const a = tile.querySelector("a.bookmark-tile-link");
    if (a) {
      bookmarks.push({ name: a.textContent.trim(), url: a.href });
    }
  });
  saveData("bookmarks", bookmarks);
}

function formatUrl(url) {
  url = url.trim();
  if (!/^https?:\/\//i.test(url)) {
    return "https://" + url;
  }
  return url;
}

function createBookmarkTile(name, url) {
  const tile = create("div", { class: "bookmark-tile" });
  const formatted = formatUrl(url);

  let domain = "";
  try {
    domain = new URL(formatted).hostname;
  } catch (e) {
    domain = formatted;
  }

  const a = create("a", { class: "bookmark-tile-link", href: formatted });
  a.target = "_blank";
  a.rel = "noopener noreferrer";

  const favicon = create("img", {
    class: "bookmark-tile-favicon",
    src: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=32`,
    alt: name
  });
  favicon.onerror = () => { favicon.style.display = "none"; };

  const labelSpan = create("span", { text: name });

  a.appendChild(favicon);
  a.appendChild(labelSpan);

  const deleteBtn = create("button", { class: "bookmark-tile-delete", title: "Delete bookmark" });
  deleteBtn.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
  deleteBtn.addEventListener("click", e => {
    e.stopPropagation();
    tile.remove();
    saveBookmarks();
  });

  tile.appendChild(a);
  tile.appendChild(deleteBtn);
  return tile;
}

const openBookmarkModalBtn = el("open-bookmark-modal");
const closeBookmarkModalBtn = el("close-bookmark-modal");
const bookmarkModal = el("bookmark-modal");
const addBookmarkBtn = el("add-bookmark");
const bookmarkNameInput = el("bookmark-name");
const bookmarkUrlInput = el("bookmark-url");

function openBookmarkModal() {
  if (bookmarkModal) {
    bookmarkModal.classList.remove("hidden");
    if (sideNavbar) sideNavbar.classList.add("is-open");
    if (bookmarkNameInput) bookmarkNameInput.focus();
  }
}

function closeBookmarkModal() {
  if (bookmarkModal) {
    bookmarkModal.classList.add("hidden");
    if (sideNavbar) sideNavbar.classList.remove("is-open");
  }
}

if (openBookmarkModalBtn) openBookmarkModalBtn.addEventListener("click", openBookmarkModal);
if (closeBookmarkModalBtn) closeBookmarkModalBtn.addEventListener("click", closeBookmarkModal);

if (bookmarkModal) {
  bookmarkModal.addEventListener("click", e => {
    if (e.target === bookmarkModal) closeBookmarkModal();
  });
}

document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    if (bookmarkModal && !bookmarkModal.classList.contains("hidden")) closeBookmarkModal();
    if (todoModal && !todoModal.classList.contains("hidden")) closeTodoModal();
    if (settingsModal && !settingsModal.classList.contains("hidden")) closeSettingsModal();
  }
});

function handleAddBookmark() {
  if (!bookmarkNameInput || !bookmarkUrlInput) return;
  const name = bookmarkNameInput.value.trim();
  const url = bookmarkUrlInput.value.trim();
  if (!name || !url) return;
  
  const list = el("bookmark-list");
  const addTile = list.querySelector(".add-bookmark-tile");
  const tile = createBookmarkTile(name, url);

  if (addTile) {
    list.insertBefore(tile, addTile);
  } else {
    list.appendChild(tile);
  }

  bookmarkNameInput.value = "";
  bookmarkUrlInput.value = "";
  saveBookmarks();
  closeBookmarkModal();
}

if (addBookmarkBtn) addBookmarkBtn.addEventListener("click", handleAddBookmark);
if (bookmarkNameInput) {
  bookmarkNameInput.addEventListener("keypress", e => {
    if (e.key === "Enter") bookmarkUrlInput ? bookmarkUrlInput.focus() : handleAddBookmark();
  });
}
if (bookmarkUrlInput) {
  bookmarkUrlInput.addEventListener("keypress", e => {
    if (e.key === "Enter") handleAddBookmark();
  });
}

function renderBookmarksList(bookmarks) {
  const list = el("bookmark-list");
  if (!list) return;
  list.innerHTML = "";

  const items = (Array.isArray(bookmarks) && bookmarks.length > 0) ? bookmarks : defaultBookmarks;

  items.forEach(b => {
    if (b && b.name && b.url) {
      const tile = createBookmarkTile(b.name, b.url);
      list.appendChild(tile);
    }
  });

  const addTile = create("button", {
    class: "add-bookmark-tile",
    title: "Add Bookmark"
  });
  addTile.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;
  addTile.addEventListener("click", openBookmarkModal);
  list.appendChild(addTile);

  if (!Array.isArray(bookmarks) || bookmarks.length === 0) {
    saveBookmarks();
  }
}

function loadBookmarks() {
  loadData("bookmarks", bookmarks => {
    renderBookmarksList(bookmarks);
  });
}

// -----------------------------
// Settings Tuning Modal Handler
// -----------------------------
const openSettingsModalBtn = el("open-settings-modal");
const closeSettingsModalBtn = el("close-settings-modal");
const settingsModal = el("settings-modal");

function openSettingsModal() {
  if (settingsModal) {
    settingsModal.classList.remove("hidden");
    if (sideNavbar) sideNavbar.classList.add("is-open");
  }
}

function closeSettingsModal() {
  if (settingsModal) {
    settingsModal.classList.add("hidden");
    if (sideNavbar) sideNavbar.classList.remove("is-open");
  }
}

if (openSettingsModalBtn) openSettingsModalBtn.addEventListener("click", openSettingsModal);
if (closeSettingsModalBtn) closeSettingsModalBtn.addEventListener("click", closeSettingsModal);

if (settingsModal) {
  settingsModal.addEventListener("click", e => {
    if (e.target === settingsModal) closeSettingsModal();
  });
}

// -----------------------------
// Background Handling (Hides glowing liquid orbs when image/video is active)
// -----------------------------
function setBackground(url, mimeType = null) {
  const bg = el("background");
  if (!bg) return;

  bg.style.backgroundImage = "";
  bg.style.background = "";

  if (!url) {
    bg.classList.remove("has-custom-bg");
    bg.style.background = "var(--bg-color)";
    return;
  }

  const lower = url.toLowerCase();
  const isVideo = mimeType ? mimeType.startsWith("video") : lower.endsWith(".mp4") || lower.endsWith(".webm") || lower.endsWith(".ogg") || url.startsWith("data:video/");
  const isImageOrVideo = isVideo || url.startsWith("http") || url.startsWith("url(") || url.startsWith("data:image/") || url.startsWith("data:video/") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".png") || lower.endsWith(".webp") || lower.endsWith(".gif");

  if (isImageOrVideo) {
    bg.classList.add("has-custom-bg");
  } else {
    bg.classList.remove("has-custom-bg");
  }

  if (isVideo) {
    const video = create("video");
    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.style.width = "100%";
    video.style.height = "100%";
    video.style.objectFit = "cover";
    
    const source = create("source", { src: url });
    if (mimeType) source.type = mimeType;
    video.appendChild(source);
    
    [...bg.children].forEach(child => {
      if (!child.classList.contains("liquid-orb")) child.remove();
    });
    bg.appendChild(video);
  } else {
    [...bg.children].forEach(child => {
      if (!child.classList.contains("liquid-orb")) child.remove();
    });
    
    if (url.startsWith("linear-gradient") || url.startsWith("radial-gradient") || (url.startsWith("#") && !url.includes(" ")) || url.startsWith("rgb")) {
      bg.style.background = url;
    } else {
      bg.style.backgroundImage = url.startsWith("url(") ? url : `url("${url}")`;
      bg.style.backgroundSize = "cover";
      bg.style.backgroundPosition = "center center";
      bg.style.backgroundRepeat = "no-repeat";
    }
  }
}

const applyBgBtn = el("apply");
if (applyBgBtn) {
  applyBgBtn.addEventListener("click", () => {
    const input = el("url");
    const url = input ? input.value.trim() : "";
    if (!url) return;
    setBackground(url);
    saveData("customBackground", { url });
  });
}

const uploadBgBtn = el("upload");
if (uploadBgBtn) {
  uploadBgBtn.addEventListener("click", () => {
    const fileInput = create("input", { type: "file" });
    fileInput.accept = "image/*,video/*";
    fileInput.onchange = e => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(evt) {
        const dataUrl = evt.target.result;
        setBackground(dataUrl, file.type);
        saveData("customBackground", { url: dataUrl, mimeType: file.type });
      };
      reader.readAsDataURL(file);
    };
    fileInput.click();
  });
}

function loadCustomBackground() {
  loadData("customBackground", bg => {
    if (bg && bg.url) {
      setBackground(bg.url, bg.mimeType || null);
    }
  });
}

// -----------------------------
// Liquid Glass Theme Presets & Engine
// -----------------------------
const themes = {
  minimal: {
    bgColor: "#0f172a",
    cardBg: "rgba(255, 255, 255, 0.14)",
    glassBorder: "rgba(255, 255, 255, 0.28)",
    textColor: "#ffffff",
    accentColor: "#38bdf8",
    background: ""
  },
  dark: {
    bgColor: "#050811",
    cardBg: "rgba(15, 23, 42, 0.55)",
    glassBorder: "rgba(255, 255, 255, 0.14)",
    textColor: "#f8fafc",
    accentColor: "#818cf8",
    background: ""
  },
  cyberpunk: {
    bgColor: "#0d021a",
    cardBg: "rgba(30, 10, 50, 0.45)",
    glassBorder: "rgba(255, 0, 127, 0.35)",
    textColor: "#00f0ff",
    accentColor: "#ff007f",
    background: "linear-gradient(135deg, #0d021a 0%, #1f0538 100%)"
  },
  nature: {
    bgColor: "#0a1c12",
    cardBg: "rgba(20, 45, 30, 0.45)",
    glassBorder: "rgba(74, 222, 128, 0.3)",
    textColor: "#ecfdf5",
    accentColor: "#34d399",
    background: "url('https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1600&q=80')"
  },
  productivity: {
    bgColor: "#1c0d24",
    cardBg: "rgba(45, 18, 55, 0.45)",
    glassBorder: "rgba(251, 146, 60, 0.35)",
    textColor: "#fff7ed",
    accentColor: "#ff7e5f",
    background: "linear-gradient(135deg, #1c0d24 0%, #3b143e 100%)"
  }
};

function applyTheme(name) {
  const theme = themes[name];
  if (!theme) return;

  const root = document.documentElement;
  
  root.style.setProperty("--bg-color", theme.bgColor || "#0f172a");
  root.style.setProperty("--glass-card-bg", theme.cardBg || "rgba(255, 255, 255, 0.14)");
  root.style.setProperty("--glass-border", theme.glassBorder || "rgba(255, 255, 255, 0.28)");
  root.style.setProperty("--text-color", theme.textColor || "#ffffff");
  root.style.setProperty("--accent-color", theme.accentColor || "#38bdf8");

  if (theme.background) {
    setBackground(theme.background);
  } else {
    loadData("customBackground", bg => {
      if (bg && bg.url) {
        setBackground(bg.url, bg.mimeType);
      } else {
        setBackground(theme.bgColor || "#0f172a");
      }
    });
  }

  document.querySelectorAll(".card, .bookmark-tile").forEach(card => {
    card.classList.remove("fade-in");
    void card.offsetWidth;
    card.classList.add("fade-in");
  });
}

const themeSelect = el("theme-select");
if (themeSelect) {
  themeSelect.addEventListener("change", e => {
    applyTheme(e.target.value);
    saveData("activeTheme", e.target.value);
  });
}

function shuffleTheme() {
  const keys = Object.keys(themes);
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  if (themeSelect) themeSelect.value = randomKey;
  applyTheme(randomKey);
  saveData("activeTheme", randomKey);
}

const shuffleBtn = el("shuffle-theme");
if (shuffleBtn) {
  shuffleBtn.addEventListener("click", shuffleTheme);
}

const autoShuffleCheckbox = el("auto-shuffle");
if (autoShuffleCheckbox) {
  autoShuffleCheckbox.addEventListener("change", e => {
    saveData("autoShuffle", e.target.checked);
  });
}

// -----------------------------
// Custom Theme Creator & Gallery
// -----------------------------
function ensureOptionInSelect(value, text) {
  if (!themeSelect) return;
  if (![...themeSelect.options].some(opt => opt.value === value)) {
    const option = create("option", { value, text });
    themeSelect.appendChild(option);
  }
}

const saveCustomThemeBtn = el("save-custom-theme");
if (saveCustomThemeBtn) {
  saveCustomThemeBtn.addEventListener("click", () => {
    const customBg = el("custom-bg") ? el("custom-bg").value.trim() : "";
    const cardBgColor = el("custom-card-bg") ? el("custom-card-bg").value : "#ffffff";
    const textColor = el("custom-text") ? el("custom-text").value : "#ffffff";
    const customShadow = el("custom-shadow") ? el("custom-shadow").value.trim() : "";

    const themeObj = {
      bgColor: "#0f172a",
      cardBg: "rgba(255, 255, 255, 0.16)",
      glassBorder: "rgba(255, 255, 255, 0.35)",
      textColor: textColor,
      accentColor: "#38bdf8",
      background: customBg || "#0f172a"
    };

    themes["custom"] = themeObj;
    saveData("customThemeObj", themeObj);
    ensureOptionInSelect("custom", "Custom Glass Theme");
    if (themeSelect) themeSelect.value = "custom";
    applyTheme("custom");

    const galleryName = "Glass Custom (" + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ")";
    saveThemeToGallery(galleryName, themeObj);
  });
}

const exportThemeBtn = el("export-theme");
if (exportThemeBtn) {
  exportThemeBtn.addEventListener("click", () => {
    const active = themeSelect ? themeSelect.value : "minimal";
    const themeData = themes[active] || themes.minimal;
    
    const blob = new Blob([JSON.stringify(themeData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = create("a", { href: url });
    a.download = `glass-theme-${active}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

const importThemeBtn = el("import-theme");
if (importThemeBtn) {
  importThemeBtn.addEventListener("click", () => {
    const fileInput = create("input", { type: "file" });
    fileInput.accept = "application/json";
    fileInput.onchange = e => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(evt) {
        try {
          const imported = JSON.parse(evt.target.result);
          const themeName = (file.name.replace(/\.[^/.]+$/, "") || "Imported") + " " + Date.now().toString().slice(-4);
          themes[themeName] = imported;
          saveThemeToGallery(themeName, imported);
          ensureOptionInSelect(themeName, themeName);
          if (themeSelect) themeSelect.value = themeName;
          applyTheme(themeName);
        } catch (err) {
          alert("Invalid glass theme JSON.");
        }
      };
      reader.readAsText(file);
    };
    fileInput.click();
  });
}

function saveThemeToGallery(name, themeObj) {
  loadData("themeGallery", gallery => {
    gallery = gallery || {};
    gallery[name] = themeObj;
    saveData("themeGallery", gallery);
    renderGallery(gallery);
  });
}

function renderGallery(gallery) {
  const galleryList = el("theme-gallery");
  if (!galleryList) return;
  galleryList.innerHTML = "";

  if (!gallery || Object.keys(gallery).length === 0) {
    const emptyLi = create("li", { text: "No saved glass themes in gallery." });
    emptyLi.style.justifyContent = "center";
    emptyLi.style.opacity = "0.7";
    galleryList.appendChild(emptyLi);
    return;
  }

  Object.keys(gallery).forEach(name => {
    const li = create("li");
    const nameSpan = create("span", { text: name });

    const actionsDiv = create("div", { class: "gallery-actions" });
    
    const applyBtn = create("button", { class: "btn btn-sm btn-primary", text: "Apply" });
    applyBtn.addEventListener("click", () => {
      themes[name] = gallery[name];
      ensureOptionInSelect(name, name);
      if (themeSelect) themeSelect.value = name;
      applyTheme(name);
    });

    const deleteBtn = create("button", { class: "action-btn-delete", title: "Delete theme" });
    deleteBtn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
    deleteBtn.addEventListener("click", () => {
      delete gallery[name];
      saveData("themeGallery", gallery);
      renderGallery(gallery);
      
      if (themeSelect && themeSelect.value === name) {
        themeSelect.value = "minimal";
        applyTheme("minimal");
      }
    });

    actionsDiv.appendChild(applyBtn);
    actionsDiv.appendChild(deleteBtn);

    li.appendChild(nameSpan);
    li.appendChild(actionsDiv);
    galleryList.appendChild(li);
  });
}

function loadGallery() {
  loadData("themeGallery", gallery => {
    if (gallery) {
      Object.keys(gallery).forEach(k => {
        themes[k] = gallery[k];
        ensureOptionInSelect(k, k);
      });
      renderGallery(gallery);
    } else {
      renderGallery({});
    }
  });
}

// Real-time storage listener
if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.onChanged) {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local") return;
    
    if (changes.activeTheme) {
      const themeName = changes.activeTheme.newValue;
      if (themeSelect) themeSelect.value = themeName;
      if (themes[themeName]) applyTheme(themeName);
    }
    if (changes.customBackground) {
      const bg = changes.customBackground.newValue;
      if (bg && bg.url) setBackground(bg.url, bg.mimeType);
    }
    if (changes.customThemeObj) {
      themes["custom"] = changes.customThemeObj.newValue;
      loadData("activeTheme", name => {
        if (name === "custom") applyTheme("custom");
      });
    }
    if (changes.themeGallery) {
      const gallery = changes.themeGallery.newValue;
      if (gallery) {
        Object.keys(gallery).forEach(k => themes[k] = gallery[k]);
        renderGallery(gallery);
      }
    }
  });
}

// -----------------------------
// Dashboard Initialization
// -----------------------------
document.addEventListener("DOMContentLoaded", () => {
  loadTodos();
  loadBookmarks();
  loadGallery();

  loadData("customThemeObj", customObj => {
    if (customObj) {
      themes["custom"] = customObj;
      ensureOptionInSelect("custom", "Custom Glass Theme");
    }
  });

  loadData("autoShuffle", isAuto => {
    if (autoShuffleCheckbox) autoShuffleCheckbox.checked = !!isAuto;
    if (isAuto) {
      shuffleTheme();
    } else {
      loadData("activeTheme", activeThemeName => {
        const themeToApply = (activeThemeName && themes[activeThemeName]) ? activeThemeName : "minimal";
        if (themeSelect) themeSelect.value = themeToApply;
        applyTheme(themeToApply);
      });
    }
  });

  loadCustomBackground();
});
