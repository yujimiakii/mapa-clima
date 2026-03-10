// Configurações Iniciais
const apiKey = "14e1f930677171133a7e7d358a47fbbd"; 

// Seleção de Elementos do HTML
const cityInput = document.querySelector("#city-input");
const searchBtn = document.querySelector("#search-btn");
const locationBtn = document.querySelector("#location-btn");
const weatherCard = document.querySelector("#weather-card");
const errorMsg = document.querySelector("#error-msg");
const mapElement = document.querySelector("#map");

// Elementos Internos do Card
const cityName = document.querySelector("#city-name");
const dateEl = document.querySelector("#date");
const tempEl = document.querySelector("#temperature");
const descEl = document.querySelector("#description");
const iconEl = document.querySelector("#weather-icon");
const humidityEl = document.querySelector("#humidity");
const windEl = document.querySelector("#wind-speed");

// Variáveis do Mapa (Leaflet)
let map;
let marker;

// --- FUNÇÃO 1: Buscar clima por NOME DA CIDADE ---
async function getWeatherData(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=pt_br&appid=${apiKey}`;
    fetchData(url);
}

// --- FUNÇÃO 2: Buscar clima por COORDENADAS (GPS) ---
async function getWeatherByCoords(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=pt_br&appid=${apiKey}`;
    fetchData(url);
}

// --- FUNÇÃO 3: Fazer a requisição para a API (Centralizada) ---
async function fetchData(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.cod === "404" || data.cod === "400") {
            showError();
            return;
        }

        displayWeather(data);
        saveToLocalStorage(data);
    } catch (err) {
        console.error("Erro na requisição:", err);
        showError();
    }
}

// --- FUNÇÃO 4: Exibir os dados na tela ---
function displayWeather(data) {
    // 1. Preencher textos
    cityName.innerText = data.name;
    tempEl.innerText = `${Math.round(data.main.temp)}°C`;
    descEl.innerText = data.weather[0].description;
    humidityEl.innerText = `${data.main.humidity}%`;
    windEl.innerText = `${data.wind.speed} km/h`;
    
    // 2. Formatar data atual
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    dateEl.innerText = new Date().toLocaleDateString('pt-br', options);

    // 3. Atualizar Ícone
    const iconCode = data.weather[0].icon;
    iconEl.src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

    // 4. Mostrar o Card e esconder erro
    weatherCard.classList.remove("hidden");
    errorMsg.classList.add("hidden");

    // 5. Atualizar o Mapa
    updateMap(data.coord.lat, data.coord.lon);
}

// --- FUNÇÃO 5: Lógica do Mapa Interativo ---
function updateMap(lat, lon) {
    mapElement.style.display = "block"; // Mostrar a div

    if (!map) {
        // Se o mapa não foi criado, inicializa
        map = L.map('map').setView([lat, lon], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(map);
        marker = L.marker([lat, lon]).addTo(map);
    } else {
        // Se já existe, apenas move a visão e o marcador
        map.setView([lat, lon], 12);
        marker.setLatLng([lat, lon]);
    }

    // Corrige erro de renderização do mapa em divs dinâmicas
    setTimeout(() => { map.invalidateSize(); }, 300);
}

// --- FUNÇÃO 6: Persistência (LocalStorage) ---
function saveToLocalStorage(data) {
    localStorage.setItem("lastWeather", JSON.stringify(data));
}

// --- FUNÇÃO 7: Tratamento de Erro ---
function showError() {
    weatherCard.classList.add("hidden");
    mapElement.style.display = "none";
    errorMsg.classList.remove("hidden");
}

// --- EVENTOS (LISTENERS) ---

// 1. Botão Buscar
searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (city) getWeatherData(city);
});

// 2. Tecla Enter no Input
cityInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
        const city = cityInput.value.trim();
        if (city) getWeatherData(city);
    }
});

// 3. Botão Minha Localização (GPS)
locationBtn.addEventListener("click", () => {
    if (navigator.geolocation) {
        locationBtn.innerText = "⌛"; // Feedback de carregando
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                getWeatherByCoords(latitude, longitude);
                locationBtn.innerText = "📍";
            },
            () => {
                alert("Permissão de localização negada.");
                locationBtn.innerText = "📍";
            }
        );
    } else {
        alert("Seu navegador não suporta geolocalização.");
    }
});

// 4. Carregar dados ao abrir a página (Recuperar Cache)
window.onload = () => {
    const savedData = localStorage.getItem("lastWeather");
    if (savedData) {
        const data = JSON.parse(savedData);
        displayWeather(data);
    }
};