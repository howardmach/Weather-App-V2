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
const locationSelector = document.getElementById("location-selector");
const locationList = document.getElementById("location-list");
const geoBtn = document.getElementById("geo-btn");

let currentTempUnit = 'celsius';
let currentWindUnit = 'kmh';

// Add this near your other 'let' variables
let currentSelectedLoc = null;

let lastFetchedData = null; // To store the Open-Meteo response

celsiusRadio.addEventListener('change', function() {
    if (this.checked) {
        currentTempUnit = 'celsius';
        unitSymbol.textContent = '°C';
        // If a city is already being displayed, just refresh the data for that city
        if (currentSelectedLoc) {
            displayWeather(currentSelectedLoc);
        }
    }
});

fahrenheitRadio.addEventListener('change', function() {
    if (this.checked) {
        currentTempUnit = 'fahrenheit';
        unitSymbol.textContent = '°F';
        // If a city is already being displayed, just refresh the data for that city
        if (currentSelectedLoc) {
            displayWeather(currentSelectedLoc);
        }
    }
});

kmhRadio.addEventListener('change', function() {
    if (this.checked) {
        currentWindUnit = 'kmh';
        windUnitElem.textContent = 'km/h';
        // If a city is already being displayed, just refresh the data for that city
        if (currentSelectedLoc) {
            displayWeather(currentSelectedLoc);
        }
    }
});

mphRadio.addEventListener('change', function() {
    if (this.checked) {
        currentWindUnit = 'mph';
        windUnitElem.textContent = 'mph';
        // If a city is already being displayed, just refresh the data for that city
        if (currentSelectedLoc) {
            displayWeather(currentSelectedLoc);
        }
    }
});

// Update this block in script.js
geoBtn.addEventListener("click", () => {
    if (navigator.geolocation) {
        errTxt.textContent = "Requesting location access...";
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const loc = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                    display: "Your Current Location"
                };
                
                // Clear the previous insight text so it doesn't show old data
                document.getElementById("suggestion-text").textContent = "";
                
                displayWeather(loc); 
                errTxt.textContent = ""; 
            },
            (error) => {
                errTxt.textContent = "Location access denied or unavailable.";
                console.error(error);
            }
        );
    } else {
        errTxt.textContent = "Geolocation is not supported by this browser.";
    }
});

async function getLocations(location) {
     const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location.trim())}&count=10&language=en&format=json`);
     const data = await res.json();
     if (!data.results || data.results.length === 0) throw new Error("Location Not Found");
     
     // Return formatted strings for the UI and raw data for coordinates
     return data.results.map(result => ({
          display: [result.name, result.admin1, result.country].filter(Boolean).join(', '),
          lat: result.latitude,
          lon: result.longitude
     }));
}

async function getWeather(location){
     const {lat,lon,name} = await getLocation(location);
     const tempUnit = currentTempUnit === 'celsius' ? 'celsius' : 'fahrenheit';
     const windUnit = currentWindUnit;
     const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,is_day,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&temperature_unit=${tempUnit}&wind_speed_unit=${windUnit}`);
     const data = await res.json();
     return {
          name,
          current: data.current,
          daily: data.daily
     }
}

async function displayWeather(loc) {
     // Save this location so unit toggles can reuse it
    currentSelectedLoc = loc; 

    // 1. Hide the selection list and show that we are loading
    const locationSelector = document.getElementById("location-selector");
    locationSelector.style.display = "none";

    try {
        // 2. Prepare API parameters based on current unit states
        const tempUnit = currentTempUnit === 'celsius' ? 'celsius' : 'fahrenheit';
        const windUnit = currentWindUnit;

        // 3. Fetch data from Open-Meteo
        // Add precipitation_sum to the daily section of the URL
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=temperature_2m,relative_humidity_2m,is_day,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,wind_speed_10m_max,precipitation_sum&temperature_unit=${tempUnit}&wind_speed_unit=${windUnit}`);
        const data = await res.json();

        lastFetchedData = data; // Store the fetched data for insights
        
        if (!data.current || !data.daily) throw new Error("Weather data unavailable");
        
        // 4. Extract current weather details
        const { temperature_2m, relative_humidity_2m, is_day, weather_code, wind_speed_10m } = data.current;
        const weatherCondition = weather_codes[weather_code];
        const imgSrc = `assets/${is_day ? weatherCondition.icons.day : weatherCondition.icons.night}`;

        // 5. Update main UI elements
        errTxt.textContent = "";
        locationTxt.textContent = loc.display;
        temperatureTxt.textContent = Math.round(temperature_2m);
        unitSymbol.textContent = currentTempUnit === 'celsius' ? '°C' : '°F';
        windUnitElem.textContent = currentWindUnit === 'kmh' ? 'km/h' : 'mph';
        humidityTxt.textContent = relative_humidity_2m;
        windSpeedTxt.textContent = wind_speed_10m;
        weatherCondName.textContent = weatherCondition.name;
        weatherCondIcon.src = imgSrc;

        // 6. Clear and populate the 7-day forecast
        dailyForecastElems.innerHTML = "";
        // ADD the two new variables to this list:
        const { 
            weather_code: daily_weather_code, 
            temperature_2m_max, 
            temperature_2m_min, 
            time,
            precipitation_sum: daily_precipitation_sum, // Add this
            wind_speed_10m_max: daily_wind_speed_10m_max // Add this
        } = data.daily;

        for (let i = 0; i < 7; i++) {
            const dayCondition = weather_codes[daily_weather_code[i]];
            const elem = document.createElement("div");
            elem.className = "card";

            // Data Preparation
            const highTemp = Math.round(temperature_2m_max[i]);
            const lowTemp = Math.round(temperature_2m_min[i]);
            const precip = daily_precipitation_sum[i];
            const wind = Math.round(daily_wind_speed_10m_max[i]);
            const displayUnit = unitSymbol.textContent;
            const windUnitStr = currentWindUnit === 'kmh' ? 'km/h' : 'mph';

            elem.innerHTML = `
                <p class="date">${time[i]}</p>
                <img src="assets/${dayCondition.icons.day}" alt="weather-icon" />
                <div class="temps">
                    <p class="highTemp">${highTemp}${displayUnit}</p>
                    <p class="lowTemp">${lowTemp}${displayUnit}</p>
                </div>
                <div class="card-details">
                    <div class="detail-item">
                        <img src="assets/humidity.svg" class="card-icon" alt="precip">
                        <span>${precip}mm</span>
                    </div>
                    <div class="detail-item">
                        <img src="assets/wind.svg" class="card-icon" alt="wind">
                        <span>${wind}${windUnitStr}</span>
                    </div>
                </div>`;
            
            dailyForecastElems.appendChild(elem);
        }

        // 7. Reveal the weather details container
        weatherDetailsElem.classList.add("active");

    } catch (error) {
        console.error(error);
        errTxt.textContent = "Error fetching weather data. Please try again.";
    }
}

searchBox.addEventListener("submit", async e => {
     e.preventDefault();

     // Clear the previous selection since the user is starting a brand new search
     currentSelectedLoc = null;
     
     // 1. Reset the UI for a new search
     weatherDetailsElem.classList.remove("active");
     dailyForecastElems.innerHTML = "";
     
     // Ensure the new selection UI is hidden and cleared at the start of a search
     const locationSelector = document.getElementById("location-selector");
     const locationList = document.getElementById("location-list");
     locationSelector.style.display = "none";
     locationList.innerHTML = "";

     if (locationInput.value.trim() === "") {
          errTxt.textContent = "Please Enter a Location To Get Weather Details";
     } else {
          errTxt.textContent = "";
          try {
               window.lastQuery = locationInput.value;
               
               // 2. Fetch potential matches instead of immediate weather
               const locations = await getLocations(locationInput.value);
               
               if (locations.length > 1) {
                    // 3. If multiple cities found, display the selection list
                    locations.forEach(loc => {
                         const li = document.createElement("li");
                         li.textContent = loc.display;
                         li.classList.add("location-option"); // You can style this in CSS
                         li.onclick = () => {
                              displayWeather(loc); // Call helper to fetch weather for this specific choice
                              locationSelector.style.display = "none";
                         };
                         locationList.appendChild(li);
                    });
                    locationSelector.style.display = "block";
               } else {
                    // 4. If only one city is found, proceed immediately
                    displayWeather(locations[0]);
               }
          } catch (error) {
               errTxt.textContent = "Location Not Found";
          }
     }
});

document.getElementById("insight-btn").addEventListener("click", () => {
    const suggestionElement = document.getElementById("suggestion-text");

    // TOGGLE LOGIC: If text already exists, clear it and exit
    if (suggestionElement.textContent !== "") {
        suggestionElement.textContent = "";
        return;
    }

    // Otherwise, generate the insight as usual
    if (!lastFetchedData || !lastFetchedData.daily || !lastFetchedData.daily.wind_speed_10m_max) {
        suggestionElement.textContent = "Please search for a city first!";
        return;
    }

    const tomorrowData = {
        // Rounding here ensures the "Heuristic Classifier" logic 
        // uses the same numbers the user sees on the screen
        tempMax: Math.round(lastFetchedData.daily.temperature_2m_max[1]),
        weatherCode: lastFetchedData.daily.weather_code[1],
        windSpeed: Math.round(lastFetchedData.daily.wind_speed_10m_max[1])
    };

    const recommendation = getSmartActivity(tomorrowData, currentTempUnit, currentWindUnit);
    suggestionElement.textContent = recommendation;
});

function getSmartActivity(tomorrow, tempUnit, windUnit) {
    const { tempMax, weatherCode, windSpeed } = tomorrow;
    
    // Threshold Definitions
    const coldThreshold = (tempUnit === 'celsius') ? 15 : 59;
    const hotThreshold = (tempUnit === 'celsius') ? 32 : 90;
    
    // Wind threshold (approx 25 km/h or 15 mph is where it starts feeling "windy")
    const windThreshold = (windUnit === 'kmh') ? 25 : 15;

    // 1. Logic for Rain or Cold
    if (weatherCode > 3 || tempMax < coldThreshold) { 
        return "The forecast suggests indoor activities might be best tomorrow due to the cooler or unsettled conditions.";
    }

    // 2. Logic for High Wind
    if (windSpeed > windThreshold) {
        return "It looks quite windy tomorrow! You might prefer indoor settings or wind-shielded areas for your activities.";
    }

    // 3. Logic for High Heat
    if (tempMax > hotThreshold) {
        return "It's expected to be quite warm tomorrow; consider staying in a cooler environment.";
    }

    // 4. Default for Pleasant Weather
    return "The weather looks favorable for outdoor activities tomorrow!";
}