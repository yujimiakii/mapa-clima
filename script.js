const apiKey = "14e1f930677171133a7e7d358a47fbbd"; 

const cityInput = document.querySelector("#city-input");
const searchBtn = document.querySelector("#search-btn");
const weatherCard = document.querySelector("#weather-card");
const errorMsg = document.querySelector("#error-msg");
const mapElement = document.querySelector("#map");

// Elementos do Card
const cityName = document.querySelector("#city-name");
const tempEl = document.querySelector("#temperature");
const descEl = document.querySelector("#description");
const iconEl = document.querySelector("#weather-icon");
const humidityEl = document.querySelector("#humidity");
const windEl = document.querySelector("#wind-speed");

// VARIÁVEIS DO MAPA
let map;
let marker;

// Função para inicializar ou atualizar o mapa
function updateMap(lat, lon) {
    mapElement.style.display = "block"; // Mostra a div do mapa

    if (!map) {
        // Se o mapa não existe, cria ele
        map = L.map('map').setView([lat, lon], 10);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(map);
        marker = L.marker([lat, lon]).addTo(map);
    } else {
        // Se já existe, apenas move a câmera e o marcador
        map.setView([lat, lon], 10);
        marker.setLatLng([lat, lon]);
    }
    
    // Pequeno ajuste para o Leaflet renderizar corretamente o tamanho da div
    setTimeout(() => { map.invalidateSize(); }, 200);
}

async function getWeatherData(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=pt_br&appid=${apiKey}`;
    
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
        console.error("Erro ao buscar dados:", err);
        showError();
    }
}

function displayWeather(data) {
    cityName.innerText = data.name;
    tempEl.innerText = `${Math.round(data.main.temp)}°C`;
    descEl.innerText = data.weather[0].description;
    humidityEl.innerText = `${data.main.humidity}%`;
    windEl.innerText = `${data.wind.speed} km/h`;
    
    const iconCode = data.weather[0].icon;
    iconEl.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

    weatherCard.classList.remove("hidden");
    errorMsg.classList.add("hidden");

    // CHAMADA DO MAPA usando as coordenadas da API
    updateMap(data.coord.lat, data.coord.lon);
}

function showError() {
    weatherCard.classList.add("hidden");
    mapElement.style.display = "none";
    errorMsg.classList.remove("hidden");
}

function saveToLocalStorage(data) {
    localStorage.setItem("lastWeather", JSON.stringify(data));
}

// ... (resto do código anterior igual)

window.onload = () => {
    const savedData = localStorage.getItem("lastWeather");
    if (savedData) {
        const data = JSON.parse(savedData);
        // Só exibe se os dados forem válidos
        if (data && data.name) {
            displayWeather(data);
        }
    }
};

// ... (resto dos eventos de clique igual)

searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (city) getWeatherData(city);
});

cityInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
        const city = cityInput.value.trim();
        if (city) getWeatherData(city);
    }
});