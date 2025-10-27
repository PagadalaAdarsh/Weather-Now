import { useState } from "react";
import "./App.css";

export default function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");

  const UNSPLASH_ACCESS_KEY = "1YjvseB9sdYC4ncWo1Kw4ovI5SX6m654v0JOV8KQvEI"; // replace with your key if needed

  // Map weather codes to description
  const getWeatherDescription = (code) => {
    const map = {
      0: "☀️ Clear sky",
      1: "🌤 Mainly clear",
      2: "⛅ Partly cloudy",
      3: "☁️ Overcast",
      45: "🌫 Fog",
      48: "🌫 Depositing rime fog",
      51: "🌦 Light drizzle",
      61: "🌧 Light rain",
      63: "🌧 Moderate rain",
      65: "🌧 Heavy rain",
      71: "❄️ Snow fall",
      80: "🌧 Rain showers",
      95: "⛈ Thunderstorm",
    };
    return map[code] || "🌍 Weather info unavailable";
  };

  // Get weather + background
  const getWeather = async () => {
    try {
      setError("");
      setWeather(null);

      if (!city.trim()) {
        setError("Please enter a city name");
        return;
      }

      // 1️⃣ Get coordinates
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          city
        )}`
      );
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        setError("City not found");
        return;
      }

      const { latitude, longitude, name, country } = geoData.results[0];

      // 2️⃣ Get current weather
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
      );
      const weatherData = await weatherRes.json();

      const { temperature, windspeed, weathercode } =
        weatherData.current_weather;

      const description = getWeatherDescription(weathercode);

      setWeather({
        city: `${name}, ${country}`,
        temp: temperature,
        wind: windspeed,
        description,
      });

      // 3️⃣ Fetch background image from Unsplash API
      const imgRes = await fetch(
        `https://api.unsplash.com/photos/random?query=${encodeURIComponent(
          name
        )}&client_id=${UNSPLASH_ACCESS_KEY}`
      );
      const imgData = await imgRes.json();

      if (imgData?.urls?.regular) {
        document.body.style.backgroundImage = `url(${imgData.urls.regular})`;
      } else {
        document.body.style.backgroundImage = "url('default-bg.jpg')";
      }
    } catch (err) {
      console.error(err);
      setError("Error fetching weather data");
    }
  };

  return (
    <div className="app">
      <h1>☀️🌧⛈</h1>
      <h1>Weather Now</h1>

      <div className="search-box">
        <input
          type="text"
          placeholder="Enter city name..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button onClick={getWeather}>Search</button>
      </div>

      {error && <p className="error">{error}</p>}

      {weather && (
        <div className="result">
          <h2>{weather.city}</h2>
          <p>{weather.description}</p>
          <p>🌡 Temperature: {weather.temp}°C</p>
          <p>💨 Wind Speed: {weather.wind} km/h</p>
        </div>
      )}
    </div>
  );
}
