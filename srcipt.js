// Name: Ashim khatri chhetri
// University id: 2408241

const todayButton = document.querySelector('.today-button');
const historyButton = document.querySelector('.history-button');
const mainSection = document.querySelector('main');
const pastSection = document.querySelector('.past-data');
const weatherSection = document.querySelector('.weather-section');
const historyTitle = document.querySelector('.past-header');
const returnButton = document.querySelector('.return-button');
const inputBox = document.querySelector('.search-box');
const searchIcon = document.querySelector('.search-icon-button');
const apiKey = 'c30f253bcae18f3b268b07da1063cc8a';

const todayDataTemplate = `
<div class="temperature-left-section">
  <div class="temperature-icon-section">
    <h2 class="temperature-section"></h2>
    <div class="weather-icon-section">
      <img class="weather-icon" src="">
      <p class="display-weather-condition"></p>
    </div>
  </div>
  <p class="feelslike-section"></p>
  <div class="minmax-section">
    <p class="display-mintemp"></p>
    <p class="display-maxtemp"></p>
  </div>
  <p class="display-day-date"></p>
</div>
<div class="temperature-right-section">
  <div class="pwh-section pressure-section">
    <div class="condition-title">Air Pressure:</div>
    <div class="condition-div">
      <img class="pwh-image pressure-image" src="https://raw.githubusercontent.com/Aseeeem-kc/weather-app-images-ashim-kc/main/icons/pressure.png">
      <p class="display-pressure"></p>
    </div>
  </div>
  <div class="pwh-section windspeed-section">
    <div class="condition-title">Wind Speed:</div>
    <div class="condition-div">
      <img class="pwh-image windspeed-image" src="https://raw.githubusercontent.com/Aseeeem-kc/weather-app-images-ashim-kc/main/icons/wind.png">
      <p class="display-windspeed"></p>
    </div>
  </div>
  <div class="pwh-section humidity-section">
    <div class="condition-title">Humidity:</div>
    <div class="condition-div">
      <img class="pwh-image humidity-image" src="https://raw.githubusercontent.com/Aseeeem-kc/weather-app-images-ashim-kc/main/icons/humidity.png">
      <p class="display-humidity"></p>
    </div>
  </div>
</div>
`;

document.addEventListener("DOMContentLoaded", () => {
  clickTodayButton('serampore');
  pastSection.style.display = "none";
});

function clickTodayButton(cityName) {
  weatherSection.innerHTML = todayDataTemplate;
  fetchWeather(cityName);
  returnButton.style.display = "none";
  todayButton.style.background = "rgba(50, 47, 47, 0.4)";
}

async function fetchWeather(cityName) {
  try {
    const localData = JSON.parse(localStorage.getItem(cityName));
    const today = new Date();
    const fetchNewData = !localData || new Date(localData[0].date).toDateString() !== today.toDateString();
    
    if (!navigator.onLine && !localData) {
      throw new Error('No internet connection');
    }

    if (fetchNewData) {
      const response = await fetch(`ashim_khatrichhetri_2408241.php?q=${cityName}`);
      const newData = await response.json();
      if (newData.error) throw new Error(newData.error.message || 'Unknown error');
      localStorage.setItem(cityName, JSON.stringify(newData));
      displayWeatherData(newData);
    } else {
      displayWeatherData(localData);
    }
  } catch (error) {
    handleFetchError(error, cityName);
  }
}

function handleFetchError(error, cityName) {
  console.error('Error fetching weather data:', error);
  if (error.message === 'No internet connection') {
    alert('No internet connection. Please try again later.');
  } else if (error.message === 'City not found') {
    alert('City not found. Please enter a valid city name.');
  } else {
    localStorageDataFetcher(cityName);
  }
  showInvalidMessage();
}

function showInvalidMessage() {
  const invalidMessage = document.querySelector('.search-invalidity');
  invalidMessage.style.display = "block";
  setTimeout(() => {
    invalidMessage.style.display = "none";
  }, 2000);
}

function localStorageDataFetcher(city) {
  const localData = JSON.parse(localStorage.getItem(city));
  if (localData) {
    displayWeatherData(localData);
  } else {
    console.error('No data in local storage');
  }
}

function displayWeatherData(data) {
  const temperatureDisplay = document.querySelector('.temperature-section');
  const feelslikeDisplay = document.querySelector('.feelslike-section');
  const minDisplay = document.querySelector('.display-mintemp');
  const maxDisplay = document.querySelector('.display-maxtemp');
  const weatherConditionDisplay = document.querySelector('.display-weather-condition');
  const weatherIconDisplay = document.querySelector('.weather-icon');
  const pressureDisplay = document.querySelector('.display-pressure');
  const windspeedDisplay = document.querySelector('.display-windspeed');
  const humidityDisplay = document.querySelector('.display-humidity');
  const cityCountryDisplay = document.querySelector('.display-city-country');
  const timeDisplay = document.querySelector('.time-box');
  const dateDisplay = document.querySelector('.display-day-date');

  const [weather] = data;
  
  temperatureDisplay.innerHTML = `${weather.temperature}&deg;C`;
  feelslikeDisplay.innerHTML = `feels like ${weather.feels_like}&deg;C`;
  minDisplay.innerHTML = `Min. Temperature: ${weather.min_temp}`;
  maxDisplay.innerHTML = `Max. Temperature: ${weather.max_temp}`;
  weatherConditionDisplay.innerHTML = weather.weather_condition;
  weatherIconDisplay.src = `http://openweathermap.org/img/w/${weather.weather_icons}.png`;
  pressureDisplay.innerHTML = `${weather.pressure} Pa`;
  windspeedDisplay.innerHTML = `${weather.wind_speed} km/h`;
  humidityDisplay.innerHTML = `${weather.humidity} %`;
  cityCountryDisplay.innerHTML = `${weather.city}, ${weather.country}`;

  const currentDate = new Date();
  currentDate.setMilliseconds(currentDate.getMilliseconds() + weather.time_zone * 1000);

  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    hour12: false,
    hour: 'numeric',
    minute: 'numeric',
  });

  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  timeDisplay.innerHTML = timeFormatter.format(currentDate);
  dateDisplay.innerHTML = dateFormatter.format(currentDate);
}

async function getPastWeather(cityName = "serampore") {
  try {
    const localData = JSON.parse(localStorage.getItem(cityName));
    const data = localData || await fetchWeatherData(cityName);
    const pastData = filterPastWeatherData(data);

    displayPastWeatherData(pastData);
  } catch (error) {
    console.error('Error fetching past weather data:', error);
    alert('City not found');
    pastSection.style.display = "none";
    mainSection.style.display = "block";
  }
}

async function fetchWeatherData(cityName) {
  const response = await fetch(`ashim_khatrichhetri_2408241.php?q=${cityName}`);
  const data = await response.json();
  localStorage.setItem(cityName, JSON.stringify(data));
  return data;
}

function filterPastWeatherData(data) {
  const today = new Date().toDateString();
  const last7DaysData = data.filter(item => new Date(item.date).toDateString() !== today)
    .slice(0, 7);

  return last7DaysData;
}

function displayPastWeatherData(data) {
  const weatherList = document.querySelector('.weather-list');
  weatherList.innerHTML = '';

  if (data.length === 0) {
    const noDataItem = document.createElement('li');
    noDataItem.textContent = 'No past data available for the last 7 days';
    weatherList.appendChild(noDataItem);
  } else {
    data.forEach(item => {
      const weatherItem = document.createElement('li');
      weatherItem.classList.add('weather-item');

      const date = new Date(item.date);
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });

      weatherItem.innerHTML = `
        <div class="weather-date">${dayOfWeek}</div>
        <div class="weather-condition">${item.weather_condition}</div>
        <div class="weather-temperature">Temp: ${item.temperature}°C</div>
        <div class="weather-icon"><img src="http://openweathermap.org/img/w/${item.weather_icons}.png"></div>
        <div class="weather-humidity">Humidity: ${item.humidity}%</div>
        <div class="weather-pressure">Pressure: ${item.pressure} Pa</div>
      `;

      weatherList.appendChild(weatherItem);
    });
  }
}

inputBox.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') fetchWeather(inputBox.value.trim());
});

searchIcon.addEventListener('click', () => {
  fetchWeather(inputBox.value.trim());
});

historyButton.addEventListener('click', () => {
  const searchCityName = inputBox.value.trim();
  historyTitle.innerHTML = `Weather in ${searchCityName || 'Shrirampur'} last 7 days`;
  getPastWeather(searchCityName);
  returnButton.style.display = "block";
  mainSection.style.display = "none";
  pastSection.style.display = "block";
});

returnButton.addEventListener('click', () => {
  mainSection.style.display = "block";
  pastSection.style.display = "none";
});
