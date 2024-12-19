import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import './App.css';

function App() {
  const [data, setData] = useState([]);
  const [locationId, setLocationId] = useState(1); // Default location
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const locations = [
    { id: 1, name: 'Mission Site Alpha' },
    { id: 2, name: 'Mission Site Lambda' },
    { id: 3, name: 'Mission Site Omega' },
  ];

  const maxTableResults = 40; // Maximum number of rows in the table

  useEffect(() => {
    setLoading(true);
    fetch(`/data?location_id=${locationId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Network error');
        }
        return res.json();
      })
      .then((data) => {
        console.log(`Data fetched for location ${locationId}:`, data);
        setData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setError(error.message);
        setLoading(false);
      });
  }, [locationId]);

  const processData = (sensorId) => {
    return data
      .filter((item) => item.sensor_id === sensorId)
      .map((item) => ({
        x: new Date(item.timestamp).toISOString(),
        y: parseFloat(item.topic_value),
      }));
  };

  const calculateStats = (sensorId) => {
    const values = data
      .filter((item) => item.sensor_id === sensorId)
      .map((item) => parseFloat(item.topic_value));

    if (!values.length) return { mean: 0, median: 0, min: 0, max: 0, stdDev: 0 };

    const mean = (values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(2);
    const sortedValues = [...values].sort((a, b) => a - b);
    const median =
      values.length % 2 === 0
        ? ((sortedValues[values.length / 2 - 1] + sortedValues[values.length / 2]) / 2).toFixed(2)
        : sortedValues[Math.floor(values.length / 2)].toFixed(2);
    const min = Math.min(...values).toFixed(2);
    const max = Math.max(...values).toFixed(2);
    const variance =
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance).toFixed(2);

    return { mean, median, min, max, stdDev };
  };

  const temperatureStats = calculateStats(1);
  const humidityStats = calculateStats(2);
  const airQualityStats = calculateStats(3);

  const temperatureData = processData(1);
  const humidityData = processData(2);
  const airQualityData = processData(3);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Cydonia´s Monitoring Dashboard 👩‍🚀</h1>
        <h2>{locations.find((loc) => loc.id === locationId)?.name}</h2>

        <div className="slider-container">
          <p>Switch Mission Sites:</p>
          <div className="slider">
            {locations.map((location) => (
              <button
                key={location.id}
                className={`slider-button ${locationId === location.id ? 'active' : ''}`}
                onClick={() => setLocationId(location.id)}
              >
                {location.name}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p>Loading data for {locations.find((loc) => loc.id === locationId)?.name}...</p>
        ) : error ? (
          <p className="error">Error: {error}</p>
        ) : (
          <div className="content-container">
            <div className="chart-container">
              <Line
                data={{
                  datasets: [
                    {
                      label: 'Temperature (°C)',
                      data: temperatureData,
                      borderColor: 'rgba(255, 99, 132, 1)',
                      backgroundColor: 'rgba(255, 99, 132, 0.2)',
                      fill: true,
                      tension: 0.4,
                    },
                    {
                      label: 'Humidity (%)',
                      data: humidityData,
                      borderColor: 'rgba(54, 162, 235, 1)',
                      backgroundColor: 'rgba(54, 162, 235, 0.2)',
                      fill: true,
                      tension: 0.4,
                    },
                    {
                      label: 'Air Quality (PPM)',
                      data: airQualityData,
                      borderColor: 'rgba(75, 192, 192, 1)',
                      backgroundColor: 'rgba(75, 192, 192, 0.2)',
                      fill: true,
                      tension: 0.4,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                  },
                  scales: {
                    x: {
                      type: 'time',
                      time: {
                        unit: 'minute',
                      },
                      title: {
                        display: true,
                        text: 'Timestamp',
                      },
                    },
                    y: {
                      title: {
                        display: true,
                        text: 'Value',
                      },
                    },
                  },
                }}
              />
            </div>
            <div className="stats-container">
              <h3>Statistics 📊</h3>
              <div className="stats-grid">
                <div className="stats-card">
                  <h4>Temperature (°C)</h4>
                  <p>Mean: {temperatureStats.mean}</p>
                  <p>Median: {temperatureStats.median}</p>
                  <p>Min: {temperatureStats.min}</p>
                  <p>Max: {temperatureStats.max}</p>
                  <p>Std Dev: {temperatureStats.stdDev}</p>
                </div>
                <div className="stats-card">
                  <h4>Humidity (%)</h4>
                  <p>Mean: {humidityStats.mean}</p>
                  <p>Median: {humidityStats.median}</p>
                  <p>Min: {humidityStats.min}</p>
                  <p>Max: {humidityStats.max}</p>
                  <p>Std Dev: {humidityStats.stdDev}</p>
                </div>
                <div className="stats-card">
                  <h4>Air Quality (PPM)</h4>
                  <p>Mean: {airQualityStats.mean}</p>
                  <p>Median: {airQualityStats.median}</p>
                  <p>Min: {airQualityStats.min}</p>
                  <p>Max: {airQualityStats.max}</p>
                  <p>Std Dev: {airQualityStats.stdDev}</p>
                </div>
              </div>
            </div>
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Sensor ID</th>
                    <th>Location ID</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {data.slice(-maxTableResults).map((item, index) => (
                    <tr key={index}>
                      <td>{new Date(item.timestamp).toLocaleString()}</td>
                      <td>{item.sensor_id}</td>
                      <td>{item.location_id}</td>
                      <td>{item.topic_value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
