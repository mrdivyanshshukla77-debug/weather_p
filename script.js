// Insert your OpenWeatherMap API key below
const API_KEY = "enter api";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const currentWeather = document.getElementById("currentWeather");
const forecastContainer = document.getElementById("forecast");
const loader = document.getElementById("loader");
const themeToggle = document.getElementById("themeToggle");

let chartInstance;

searchBtn.addEventListener("click", () => fetchWeather(cityInput.value));
cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") fetchWeather(cityInput.value);
});

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});

window.onload = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
    });
  }
};

function toggleLoader(show) {
  loader.classList.toggle("hidden", !show);
}

async function fetchWeather(city) {
  if (!city) return alert("Enter a city name");
  toggleLoader(true);
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`);
    if (!res.ok) throw new Error("City not found");
    const data = await res.json();
    displayCurrent(data);
    fetchForecast(city);
  } catch (err) {
    alert(err.message);
  }
  toggleLoader(false);
}

async function fetchWeatherByCoords(lat, lon) {
  toggleLoader(true);
  const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
  const data = await res.json();
  displayCurrent(data);
  fetchForecast(data.name);
  toggleLoader(false);
}

function displayCurrent(data) {
  const time = new Date().toLocaleString("en-IN", { hour: "numeric", minute: "numeric", hour12: true });
  currentWeather.innerHTML = `
    <h2>${data.name}</h2>
    <p>${time}</p>
    <h1>${data.main.temp}°C</h1>
    <p>${data.weather[0].description}</p>
    <p>Feels like: ${data.main.feels_like}°C</p>
    <p>Humidity: ${data.main.humidity}%</p>
    <p>Wind: ${data.wind.speed} m/s</p>
  `;
  updateBackground(data.weather[0].main);
}

async function fetchForecast(city) {
  const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`);
  const data = await res.json();
  const daily = data.list.filter(item => item.dt_txt.includes("12:00:00")).slice(0,5);
  displayForecast(daily);
  updateChart(daily);
}

function displayForecast(days) {
  forecastContainer.innerHTML = "";
  days.forEach(day => {
    const card = document.createElement("div");
    card.className = "forecast-card";
    card.innerHTML = `
      <h4>${new Date(day.dt_txt).toLocaleDateString()}</h4>
      <p>${day.weather[0].description}</p>
      <p>${day.main.temp_min}°C - ${day.main.temp_max}°C</p>
    `;
    forecastContainer.appendChild(card);
  });
}

function updateChart(days) {
  const labels = days.map(d => new Date(d.dt_txt).toLocaleDateString());
  const temps = days.map(d => d.main.temp);

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(document.getElementById("tempChart"), {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Temperature (°C)",
        data: temps,
        borderWidth: 2,
        fill: false
      }]
    },
    options: {
      responsive: true
    }
  });
}

function updateBackground(condition) {
  if (condition.includes("Rain")) {
    document.body.style.background = "url('assets/rain.png') center/cover";
  } else if (condition.includes("Cloud")) {
    document.body.style.background = "url('assets/clouds.png') center/cover";
  } else {
    document.body.style.background = "linear-gradient(135deg, #4facfe, #00f2fe)";
  }
}
