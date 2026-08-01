// popup.js - Liquid Glassmorphism Extension Settings Tuning Logic

function saveData(key, value) {
  const payload = { [key]: value };
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    chrome.storage.local.set(payload);
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

const themeSelect = el("theme-select");

function selectTheme(name) {
  if (!themes[name]) return;
  saveData("activeTheme", name);
}

if (themeSelect) {
  themeSelect.addEventListener("change", e => {
    selectTheme(e.target.value);
  });
}

const shuffleBtn = el("shuffle-theme");
if (shuffleBtn) {
  shuffleBtn.addEventListener("click", () => {
    const keys = Object.keys(themes);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    if (themeSelect) themeSelect.value = randomKey;
    selectTheme(randomKey);
  });
}

const autoShuffleCheckbox = el("auto-shuffle");
if (autoShuffleCheckbox) {
  autoShuffleCheckbox.addEventListener("change", e => {
    saveData("autoShuffle", e.target.checked);
  });
}

// Background controls
const applyBgBtn = el("apply");
if (applyBgBtn) {
  applyBgBtn.addEventListener("click", () => {
    const urlInput = el("url");
    const url = urlInput ? urlInput.value.trim() : "";
    if (!url) return;
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
        saveData("customBackground", { url: evt.target.result, mimeType: file.type });
      };
      reader.readAsDataURL(file);
    };
    fileInput.click();
  });
}

// Custom theme creator
function ensureOptionInSelect(value, text) {
  if (!themeSelect) return;
  if (![...themeSelect.options].some(opt => opt.value === value)) {
    const option = create("option", { value, text });
    themeSelect.appendChild(option);
  }
}

const saveCustomBtn = el("save-custom-theme");
if (saveCustomBtn) {
  saveCustomBtn.addEventListener("click", () => {
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
    selectTheme("custom");

    const name = "Glass Custom (" + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ")";
    saveThemeToGallery(name, themeObj);
  });
}

// Export / Import
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
          selectTheme(themeName);
        } catch (err) {
          alert("Invalid glass theme JSON.");
        }
      };
      reader.readAsText(file);
    };
    fileInput.click();
  });
}

// Theme gallery
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
    const emptyLi = create("li", { text: "No custom saved themes." });
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
      selectTheme(name);
    });

    const deleteBtn = create("button", { class: "action-btn-delete", title: "Delete theme" });
    deleteBtn.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
    deleteBtn.addEventListener("click", () => {
      delete gallery[name];
      saveData("themeGallery", gallery);
      renderGallery(gallery);
      
      if (themeSelect && themeSelect.value === name) {
        themeSelect.value = "minimal";
        selectTheme("minimal");
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

document.addEventListener("DOMContentLoaded", () => {
  loadGallery();

  loadData("customThemeObj", customObj => {
    if (customObj) {
      themes["custom"] = customObj;
      ensureOptionInSelect("custom", "Custom Glass Theme");
    }
  });

  loadData("autoShuffle", isAuto => {
    if (autoShuffleCheckbox) autoShuffleCheckbox.checked = !!isAuto;
  });

  loadData("activeTheme", activeThemeName => {
    if (themeSelect && activeThemeName && themes[activeThemeName]) {
      themeSelect.value = activeThemeName;
    }
  });
});
