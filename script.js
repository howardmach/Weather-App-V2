const weather_codes = {
     0: { name: "Clear Sky", icons: { day: "clear.svg", night: "clear-night.svg" } },
     1: { name: "Mainly Clear", icons: { day: "clear.svg", night: "clear-night.svg" } },
     2: { name: "Partly Cloudy", icons: { day: "partly-cloudy.svg", night: "partly-cloudy-night.svg" } },
     3: { name: "Overcast", icons: { day: "overcast.svg", night: "overcast.svg" } },
     45: { name: "Fog", icons: { day: "fog.svg", night: "fog-night.svg" } },
     48: { name: "Rime Fog", icons: { day: "rime-fog.svg", night: "rime-fog.svg" } },
     51: { name: "Light Drizzle", icons: { day: "light-drizzle.svg", night: "light-drizzle.svg" } },
     53: { name: "Moderate Drizzle", icons: { day: "drizzle.svg", night: "drizzle.svg" } },
     55: { name: "Heavy Drizzle", icons: { day: "heavy-drizzle.svg", night: "heavy-drizzle.svg" } },
     56: { name: "Light Freezing Drizzle", icons: { day: "drizzle.svg", night: "drizzle.svg" } },
     57: { name: "Dense Freezing Drizzle", icons: { day: "heavy-drizzle.svg", night: "heavy-drizzle.svg" } },
     61: { name: "Slight Rain", icons: { day: "slight-rain.svg", night: "slight-rain-night.svg" } },
     63: { name: "Moderate Rain", icons: { day: "rain.svg", night: "rain.svg" } },
     65: { name: "Heavy Rain", icons: { day: "heavy-rain.svg", night: "heavy-rain.svg" } },
     66: { name: "Light Freezing Rain", icons: { day: "rain.svg", night: "rain.svg" } },
     67: { name: "Heavy Freezing Rain", icons: { day: "heavy-rain.svg", night: "heavy-rain.svg" } },
     71: { name: "Slight Snowfall", icons: { day: "light-snow.svg", night: "light-snow-night.svg" } },
     73: { name: "Moderate Snowfall", icons: { day: "snow.svg", night: "snow.svg" } },
     75: { name: "Heavy Snowfall", icons: { day: "heavy-snow.svg", night: "heavy-snow.svg" } },
     77: { name: "Snow Grains", icons: { day: "snow-grains.svg", night: "snow-grains.svg" } },
     80: { name: "Slight Rain Showers", icons: { day: "slight-rain-showers.svg", night: "slight-rain-showers-night.svg" } },
     81: { name: "Moderate Rain Showers", icons: { day: "rain-showers.svg", night: "rain-showers.svg" } },
     82: { name: "Heavy Rain Showers", icons: { day: "heavy-rain-showers.svg", night: "heavy-rain-showers.svg" } },
     85: { name: "Light Snow Showers", icons: { day: "light-snow-showers.svg", night: "light-snow-showers.svg" } },
     86: { name: "Heavy Snow Showers", icons: { day: "heavy-snow-showers.svg", night: "heavy-snow-showers.svg" } },
     95: { name: "Thunderstorm", icons: { day: "thunderstorm.svg", night: "thunderstorm.svg" } },
     96: { name: "Slight Hailstorm", icons: { day: "hail.svg", night: "hail.svg" } },
     99: { name: "Heavy Hailstorm", icons: { day: "heavy-hail.svg", night: "heavy-hail.svg" } }
};

const searchBox = document.getElementById("search-box");
const weatherDetailsElem = document.getElementById("weather-details");
const locationTxt = document.getElementById("location");
const weatherCondIcon = document.getElementById("weather-condition-icon");
const weatherCondName = document.getElementById("weather-condition-name");
const temperatureTxt = document.getElementById("temperature");
const humidityTxt = document.getElementById("humidity");
const windSpeedTxt = document.getElementById("wind-speed");
const windUnitElem = document.getElementById("wind-unit");
const locationInput = document.getElementById("location-input");
const dailyForecastElems = document.getElementById("daily-forecast")
const errTxt = document.getElementById("errTxt")
const unitSymbol = document.getElementById('unit-symbol');

const celsiusRadio = document.getElementById('celsius');
const fahrenheitRadio = document.getElementById('fahrenheit');
const kmhRadio = document.getElementById('kmh');
const mphRadio = document.getElementById('mph');

let currentTempUnit = 'celsius';
let currentWindUnit = 'kmh';

celsiusRadio.addEventListener('change', function() {
    if (this.checked) {
        currentTempUnit = 'celsius';
        unitSymbol.textContent = '°C';
        if (window.lastQuery) searchBox.dispatchEvent(new Event('submit'));
    }
});
fahrenheitRadio.addEventListener('change', function() {
    if (this.checked) {
        currentTempUnit = 'fahrenheit';
        unitSymbol.textContent = '°F';
        if (window.lastQuery) searchBox.dispatchEvent(new Event('submit'));
    }
});
kmhRadio.addEventListener('change', function() {
    if (this.checked) {
        currentWindUnit = 'kmh';
        windUnitElem.textContent = 'km/h';
        if (window.lastQuery) searchBox.dispatchEvent(new Event('submit'));
    }
});
mphRadio.addEventListener('change', function() {
    if (this.checked) {
        currentWindUnit = 'mph';
        windUnitElem.textContent = 'mph';
        if (window.lastQuery) searchBox.dispatchEvent(new Event('submit'));
    }
});

async function getLocation(location){
     const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location.trim())}&count=1&language=en&format=json`);
     const data = await res.json();
     if (!data.results || data.results.length === 0) throw new Error("Location Not Found");
     const result = data.results[0];
     return {
          name: [result.name, result.admin1, result.country].filter(Boolean).join(', '),
          lat: result.latitude,
          lon: result.longitude
     }
}

async function getWeather(location){
     const {lat,lon,name} = await getLocation(location);
     const tempUnit = currentTempUnit === 'celsius' ? 'celsius' : 'fahrenheit';
     const windUnit = currentWindUnit;
     const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,is_day,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&temperature_unit=${tempUnit}&windspeed_unit=${windUnit}`);
     const data = await res.json();
     return {
          name,
          current: data.current,
          daily: data.daily
     }
}

searchBox.addEventListener("submit",async e=>{
     e.preventDefault()
     weatherDetailsElem.classList.remove("active")
     dailyForecastElems.innerHTML = ""
     if(locationInput.value.trim()===""){
          errTxt.textContent = "Please Enter a Location To Get Weather Details"
     } else {
          errTxt.textContent = ""
          try{
               window.lastQuery = locationInput.value;
               const weather = await getWeather(locationInput.value)
               const {temperature_2m,relative_humidity_2m,is_day,weather_code,wind_speed_10m} = weather.current
               const {weather_code: daily_weather_code,temperature_2m_max,temperature_2m_min,time} = weather.daily
               const weatherCondition = weather_codes[weather_code]
               const imgSrc = `assets/${is_day ? weatherCondition.icons.day : weatherCondition.icons.night}`
               locationTxt.textContent = weather.name
               temperatureTxt.textContent = temperature_2m
               unitSymbol.textContent = currentTempUnit === 'celsius' ? '°C' : '°F';
               windUnitElem.textContent = currentWindUnit === 'kmh' ? 'km/h' : 'mph';
               humidityTxt.textContent = relative_humidity_2m
               windSpeedTxt.textContent = wind_speed_10m
               weatherCondName.textContent = weatherCondition.name
               weatherCondIcon.src = imgSrc
               for(let i=0;i<7;i++){
                    const weatherCond = weather_codes[daily_weather_code[i]]
                    const temperatureMax = temperature_2m_max[i]
                    const temperatureMin = temperature_2m_min[i]
                    const timestamp = time[i] 
                    const elem = document.createElement("div")
                    elem.className = "card"
                    elem.innerHTML = `<img src="assets/${weatherCond.icons.day}" alt="weather-icon" width="100" height="100"/>
<div class="temps">
     <p class="temp" title="Maximum Temperature">${temperatureMax}<span>${currentTempUnit === 'celsius' ? '°C' : '°F'}</span></p>
     <p class="temp" title="Minimum Temperature">${temperatureMin}<span>${currentTempUnit === 'celsius' ? '°C' : '°F'}</span></p>
</div>
<p class="date">${timestamp}</p>`
                    dailyForecastElems.appendChild(elem)
               }
               weatherDetailsElem.classList.add("active")
          } catch {
               errTxt.textContent = "Location Not Found"
          }
     }
})