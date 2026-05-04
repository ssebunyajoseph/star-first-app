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

// Communication Event Listeners
chatBtn.addEventListener("click", toggleCommunication);
socialBtn.addEventListener("click", toggleSocial);
searchBtn.addEventListener("click", toggleResearch);

// Initialize features
setTheme(theme);
renderTasks();
loadChatMessages();
loadSocialPosts();

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

// Communication Functions
const chatBtn = document.getElementById("chatBtn");
const socialBtn = document.getElementById("socialBtn");
const searchBtn = document.getElementById("searchBtn");
const communicationSection = document.getElementById("communicationSection");
const socialSection = document.getElementById("socialSection");
const researchSection = document.getElementById("researchSection");

let communicationVisible = false;
let socialVisible = false;
let researchVisible = false;

function toggleCommunication() {
    communicationVisible = !communicationVisible;
    communicationSection.style.display = communicationVisible ? "flex" : "none";
    if (communicationVisible) {
        socialVisible = false;
        socialSection.style.display = "none";
        researchVisible = false;
        researchSection.style.display = "none";
        publicInfoVisible = false;
        publicInfoSection.style.display = "none";
    }
}

function toggleSocial() {
    socialVisible = !socialVisible;
    socialSection.style.display = socialVisible ? "flex" : "none";
    if (socialVisible) {
        communicationVisible = false;
        communicationSection.style.display = "none";
        researchVisible = false;
        researchSection.style.display = "none";
        publicInfoVisible = false;
        publicInfoSection.style.display = "none";
    }
}

function toggleResearch() {
    researchVisible = !researchVisible;
    researchSection.style.display = researchVisible ? "flex" : "none";
    if (researchVisible) {
        communicationVisible = false;
        communicationSection.style.display = "none";
        socialVisible = false;
        socialSection.style.display = "none";
        publicInfoVisible = false;
        publicInfoSection.style.display = "none";
    }
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

// Chat Functions
const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const sendMessageBtn = document.getElementById("sendMessageBtn");

function addChatMessage(message, type = "user") {
    const messageDiv = document.createElement("div");
    messageDiv.className = `chat-message ${type}`;
    messageDiv.innerHTML = `<span>${message}</span>`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Save chat messages to localStorage
    saveChatMessages();
}

function saveChatMessages() {
    const messages = Array.from(chatMessages.children).map(msg => ({
        text: msg.textContent,
        type: msg.classList.contains("user") ? "user" : 
              msg.classList.contains("system") ? "system" : "other"
    }));
    localStorage.setItem("chatMessages", JSON.stringify(messages));
}

function loadChatMessages() {
    const saved = JSON.parse(localStorage.getItem("chatMessages")) || [];
    saved.forEach(msg => {
        const messageDiv = document.createElement("div");
        messageDiv.className = `chat-message ${msg.type}`;
        messageDiv.innerHTML = `<span>${msg.text}</span>`;
        chatMessages.appendChild(messageDiv);
    });
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;
    
    addChatMessage(message, "user");
    
    // Simulate AI response (in a real app, this would connect to a backend)
    setTimeout(() => {
        const responses = [
            "That's interesting! Tell me more.",
            "I understand. How can I help you with that?",
            "Great point! Have you considered...",
            "Thanks for sharing that with me.",
            "I'm here to help. What else is on your mind?",
            "That sounds important. Let's break it down.",
            "I see. What's your next step?",
            "Good thinking! Keep going."
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        addChatMessage(randomResponse, "system");
    }, 1000 + Math.random() * 2000);
    
    chatInput.value = "";
}

chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        sendMessage();
    }
});

sendMessageBtn.addEventListener("click", sendMessage);

// Social Functions
const socialContent = document.getElementById("socialContent");
const socialInput = document.getElementById("socialInput");
const postBtn = document.getElementById("postBtn");

function createPost(content, author = "You", time = "Just now") {
    const postDiv = document.createElement("div");
    postDiv.className = "social-post";
    postDiv.innerHTML = `
        <div class="post-header">
            <span class="post-author">${author}</span>
            <span class="post-time">${time}</span>
        </div>
        <div class="post-content">
            <p>${content}</p>
        </div>
        <div class="post-actions">
            <button class="like-btn">👍 0</button>
            <button class="comment-btn">💬 0</button>
            <button class="share-btn">🔗 Share</button>
        </div>
    `;
    
    // Add event listeners for post actions
    const likeBtn = postDiv.querySelector(".like-btn");
    const commentBtn = postDiv.querySelector(".comment-btn");
    const shareBtn = postDiv.querySelector(".share-btn");
    
    likeBtn.addEventListener("click", () => {
        const currentLikes = parseInt(likeBtn.textContent.split(" ")[1]);
        likeBtn.textContent = `👍 ${currentLikes + 1}`;
        likeBtn.style.color = "#3b82f6";
    });
    
    commentBtn.addEventListener("click", () => {
        const currentComments = parseInt(commentBtn.textContent.split(" ")[1]);
        commentBtn.textContent = `💬 ${currentComments + 1}`;
    });
    
    shareBtn.addEventListener("click", () => {
        navigator.share({
            title: "Star App Post",
            text: content,
            url: window.location.href
        }).catch(() => {
            // Fallback for browsers that don't support Web Share API
            navigator.clipboard.writeText(`${content} - ${window.location.href}`);
            alert("Link copied to clipboard!");
        });
    });
    
    socialContent.insertBefore(postDiv, socialContent.firstChild);
    saveSocialPosts();
}

function saveSocialPosts() {
    const posts = Array.from(socialContent.children).map(post => ({
        author: post.querySelector(".post-author").textContent,
        time: post.querySelector(".post-time").textContent,
        content: post.querySelector(".post-content p").textContent,
        likes: parseInt(post.querySelector(".like-btn").textContent.split(" ")[1]),
        comments: parseInt(post.querySelector(".comment-btn").textContent.split(" ")[1])
    }));
    localStorage.setItem("socialPosts", JSON.stringify(posts));
}

function loadSocialPosts() {
    const saved = JSON.parse(localStorage.getItem("socialPosts")) || [];
    saved.forEach(post => {
        createPost(post.content, post.author, post.time);
        // Restore likes and comments
        const postElement = socialContent.firstChild;
        postElement.querySelector(".like-btn").textContent = `👍 ${post.likes}`;
        postElement.querySelector(".comment-btn").textContent = `💬 ${post.comments}`;
    });
}

function createSocialPost() {
    const content = socialInput.value.trim();
    if (!content) return;
    
    createPost(content);
    socialInput.value = "";
}

socialInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        createSocialPost();
    }
});

postBtn.addEventListener("click", createSocialPost);

// Search Functions
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const searchResults = document.getElementById("searchResults");

async function performSearch(query) {
    searchResults.innerHTML = '<div class="loading">Searching...</div>';
    
    try {
        // Use DuckDuckGo Instant Answer API for general knowledge
        const ddgResponse = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`);
        const ddgData = await ddgResponse.json();
        
        let resultsHtml = "";
        
        if (ddgData.AbstractText) {
            resultsHtml += `
                <div class="search-result-item">
                    <a href="${ddgData.AbstractURL || '#'}" class="search-result-title" target="_blank">${ddgData.Heading || query}</a>
                    <p class="search-result-snippet">${ddgData.AbstractText}</p>
                </div>
            `;
        }
        
        // Add related topics if available
        if (ddgData.RelatedTopics && ddgData.RelatedTopics.length > 0) {
            ddgData.RelatedTopics.slice(0, 3).forEach(topic => {
                if (topic.Text && topic.FirstURL) {
                    resultsHtml += `
                        <div class="search-result-item">
                            <a href="${topic.FirstURL}" class="search-result-title" target="_blank">${topic.Text.split(' - ')[0]}</a>
                            <p class="search-result-snippet">${topic.Text}</p>
                        </div>
                    `;
                }
            });
        }
        
        // If no results from DDG, try Wikipedia API
        if (!resultsHtml) {
            const wikiResponse = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
            if (wikiResponse.ok) {
                const wikiData = await wikiResponse.json();
                resultsHtml = `
                    <div class="search-result-item">
                        <a href="${wikiData.content_urls?.desktop?.page || '#'}" class="search-result-title" target="_blank">${wikiData.title}</a>
                        <p class="search-result-snippet">${wikiData.extract}</p>
                    </div>
                `;
            }
        }
        
        if (!resultsHtml) {
            resultsHtml = `<p>No results found for "${query}". Try different keywords or check your spelling.</p>`;
        }
        
        searchResults.innerHTML = resultsHtml;
        
    } catch (error) {
        console.error('Search error:', error);
        searchResults.innerHTML = '<div class="error">Unable to perform search. Please check your internet connection and try again.</div>';
    }
}

function handleSearch() {
    const query = searchInput.value.trim();
    if (!query) return;
    
    performSearch(query);
}

searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        handleSearch();
    }
});

searchBtn.addEventListener("click", handleSearch);

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
