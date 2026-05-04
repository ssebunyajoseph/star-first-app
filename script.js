const taskForm = document.getElementById("taskForm");
const input = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const themeToggle = document.getElementById("themeToggle");
const themeToggleSetting = document.getElementById("themeToggleSetting");
const settingsOpen = document.getElementById("settingsOpen");
const settingsClose = document.getElementById("settingsClose");
const settingsPanel = document.getElementById("settingsPanel");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");
const clearAllBtn = document.getElementById("clearAllBtn");
const list = document.getElementById("taskList");
const body = document.body;

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let theme = localStorage.getItem("theme") || "light";

const icons = {
    light: "🌙",
    dark: "☀️"
};

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function saveTheme() {
    localStorage.setItem("theme", theme);
}

function setTheme(value) {
    theme = value;
    body.classList.toggle("dark-theme", theme === "dark");
    body.classList.toggle("light-theme", theme === "light");
    themeToggle.textContent = icons[theme];
    themeToggleSetting.textContent = icons[theme];
    themeToggle.setAttribute("aria-pressed", theme === "dark");
    themeToggleSetting.setAttribute("aria-pressed", theme === "dark");
    saveTheme();
}

function openSettings() {
    settingsPanel.classList.add("visible");
    settingsPanel.setAttribute("aria-hidden", "false");
    settingsOpen.setAttribute("aria-expanded", "true");
    settingsClose.focus();
}

function closeSettings() {
    settingsPanel.classList.remove("visible");
    settingsPanel.setAttribute("aria-hidden", "true");
    settingsOpen.setAttribute("aria-expanded", "false");
    settingsOpen.focus();
}

function clearCompletedTasks() {
    tasks = tasks.filter((task) => !task.done);
    saveTasks();
    renderTasks();
}

function clearAllTasks() {
    tasks = [];
    saveTasks();
    renderTasks();
}

function renderTasks() {
    list.innerHTML = "";

    tasks.forEach((task, index) => {
        const item = document.createElement("li");
        item.className = "task-item";
        item.setAttribute("role", "button");
        item.setAttribute("tabindex", "0");
        item.setAttribute("aria-pressed", task.done);
        if (task.done) item.classList.add("done");

        const text = document.createElement("span");
        text.textContent = task.text;
        item.appendChild(text);

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "✕";
        deleteButton.title = `Delete task: ${task.text}`;
        deleteButton.setAttribute("aria-label", `Delete task: ${task.text}`);
        deleteButton.setAttribute("type", "button");

        deleteButton.addEventListener("click", (event) => {
            event.stopPropagation();
            tasks.splice(index, 1);
            saveTasks();
            renderTasks();
        });

        const toggleTask = () => {
            task.done = !task.done;
            saveTasks();
            renderTasks();
        };

        item.addEventListener("click", toggleTask);
        item.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                toggleTask();
            }
        });

        item.appendChild(deleteButton);
        list.appendChild(item);
    });
}

function addTask(event) {
    event.preventDefault();
    const value = input.value.trim();
    if (!value) return;

    tasks.push({ text: value, done: false });
    saveTasks();
    renderTasks();
    input.value = "";
    input.focus();
}

function createRipple(target) {
    const ripple = document.createElement("span");
    ripple.className = "ripple";
    target.appendChild(ripple);
    setTimeout(() => ripple.remove(), 500);
}

taskForm.addEventListener("submit", addTask);

addBtn.addEventListener("click", () => {
    addTask(new Event("submit"));
    createRipple(addBtn);
});

themeToggle.addEventListener("click", () => {
    setTheme(theme === "dark" ? "light" : "dark");
});

themeToggleSetting.addEventListener("click", () => {
    setTheme(theme === "dark" ? "light" : "dark");
});

settingsOpen.addEventListener("click", openSettings);
settingsClose.addEventListener("click", closeSettings);

clearCompletedBtn.addEventListener("click", () => {
    clearCompletedTasks();
});

clearAllBtn.addEventListener("click", () => {
    clearAllTasks();
});

settingsPanel.addEventListener("click", (event) => {
    if (event.target === settingsPanel) {
        closeSettings();
    }
});

setTheme(theme);
renderTasks();

// PWA Install Prompt Handler
let deferredPrompt = null;
const installBtn = document.getElementById("installBtn");

window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = "flex";
});

installBtn.addEventListener("click", async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    
    if (choiceResult.outcome === "accepted") {
        console.log("User accepted install");
    }
    
    deferredPrompt = null;
    installBtn.style.display = "none";
});

window.addEventListener("appinstalled", () => {
    console.log("App installed successfully");
    deferredPrompt = null;
    installBtn.style.display = "none";
});

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("sw.js").catch((error) => {
            console.warn("Service worker registration failed:", error);
        });
    });
}
