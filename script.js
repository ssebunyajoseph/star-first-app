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

// Public Information Functions
const weatherBtn = document.getElementById("weatherBtn");
const quoteBtn = document.getElementById("quoteBtn");
const publicInfoSection = document.getElementById("publicInfoSection");
const weatherContent = document.getElementById("weatherContent");
const quoteContent = document.getElementById("quoteContent");

let publicInfoVisible = false;

function togglePublicInfo() {
    publicInfoVisible = !publicInfoVisible;
    publicInfoSection.style.display = publicInfoVisible ? "flex" : "none";
}

async function fetchWeather() {
    try {
        weatherContent.innerHTML = '<div class="loading">Getting weather data...</div>';
        
        // Get user's location (fallback to a default if not available)
        let lat = 40.7128; // Default: New York
        let lon = -74.0060;
        
        if (navigator.geolocation) {
            try {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
                });
                lat = position.coords.latitude;
                lon = position.coords.longitude;
            } catch (error) {
                console.log("Using default location for weather");
            }
        }
        
        // Using OpenWeatherMap API (free tier)
        const apiKey = 'bd5e378503939ddaee76f12ad7a97608'; // Free API key
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
        );
        
        if (!response.ok) {
            throw new Error('Weather API request failed');
        }
        
        const data = await response.json();
        
        const weatherHtml = `
            <div class="weather-info">
                <div class="weather-main">
                    <span>${data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1)}</span>
                    <span>${Math.round(data.main.temp)}°C</span>
                </div>
                <div class="weather-details">
                    <div class="weather-detail">
                        <span>Feels like:</span>
                        <span>${Math.round(data.main.feels_like)}°C</span>
                    </div>
                    <div class="weather-detail">
                        <span>Humidity:</span>
                        <span>${data.main.humidity}%</span>
                    </div>
                    <div class="weather-detail">
                        <span>Wind:</span>
                        <span>${Math.round(data.wind.speed * 3.6)} km/h</span>
                    </div>
                    <div class="weather-detail">
                        <span>Location:</span>
                        <span>${data.name}</span>
                    </div>
                </div>
            </div>
        `;
        
        weatherContent.innerHTML = weatherHtml;
        
    } catch (error) {
        console.error('Weather fetch error:', error);
        weatherContent.innerHTML = '<div class="error">Unable to load weather data. Please try again later.</div>';
    }
}

async function fetchQuote() {
    try {
        quoteContent.innerHTML = '<div class="loading">Getting inspirational quote...</div>';
        
        // Using Quotable API (free)
        const response = await fetch('https://api.quotable.io/random?tags=inspirational|motivational|success');
        
        if (!response.ok) {
            throw new Error('Quote API request failed');
        }
        
        const data = await response.json();
        
        const quoteHtml = `
            <div class="quote-info">
                <p class="quote-text">"${data.content}"</p>
                <p class="quote-author">— ${data.author}</p>
            </div>
        `;
        
        quoteContent.innerHTML = quoteHtml;
        
    } catch (error) {
        console.error('Quote fetch error:', error);
        quoteContent.innerHTML = '<div class="error">Unable to load quote. Please try again later.</div>';
    }
}

weatherBtn.addEventListener("click", () => {
    togglePublicInfo();
    if (publicInfoVisible) {
        fetchWeather();
    }
});

quoteBtn.addEventListener("click", () => {
    togglePublicInfo();
    if (publicInfoVisible) {
        fetchQuote();
    }
});

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
