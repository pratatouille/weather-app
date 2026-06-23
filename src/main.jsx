import { createRoot } from 'react-dom/client';
import React, { useState, useEffect } from 'react';

function useWeather(city) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!city) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('City not found or network error');
        }
        return response.json();
      })
      .then((result) => {
        if (isMounted) {
          const currentCondition = result.current_condition[0];
          const nearestArea = result.nearest_area[0];
          
          setData({
            temp: currentCondition.temp_C,
            condition: currentCondition.weatherDesc[0].value,
            humidity: currentCondition.humidity,
            city: nearestArea.areaName[0].value,
            country: nearestArea.country[0].value
          });
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message);
          setData(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [city]);

  return { data, loading, error };
}

function App() {
  const [inputValue, setInputValue] = useState('');
  const [searchCity, setSearchCity] = useState('Delhi');
  const { data, loading, error } = useWeather(searchCity);

  const handleSearch = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setSearchCity(inputValue.trim());
    }
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '400px', margin: '0 auto' }}>
      <h2>Weather App</h2>
      
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter city name..."
          style={{ flexGrow: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', backgroundColor: '#007bff', color: '#fff', cursor: 'pointer' }}>
          Search
        </button>
      </form>

      {loading && <div style={{ color: '#555', fontStyle: 'italic' }}>Loading weather data...</div>}

      {error && <div style={{ color: 'red', marginBottom: '10px' }}>⚠️ Error: {error}</div>}

      {data && !loading && (
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
          <h3 style={{ margin: '0 0 10px 0' }}>{data.city}, {data.country}</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '10px 0' }}>{data.temp}°C</p>
          <p style={{ margin: '5px 0' }}><strong>Condition:</strong> {data.condition}</p>
          <p style={{ margin: '5px 0' }}><strong>Humidity:</strong> {data.humidity}%</p>
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);