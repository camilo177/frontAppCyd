import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import './App.css'; 

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/data')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then((data) => {
        console.log('Fetched data:', data);
        setData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('There was a problem with the fetch operation:', error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  const processData = (topic) => {
    return data
      .filter((item) => item.topic === topic)
      .map((item) => ({
        x: new Date(item.timestamp).toISOString(),
        y: parseFloat(item.topic_value),
      }));
  };

  const temperatureData = processData('temperature');
  const humidityData = processData('humidity');
  const airQualityData = processData('air_quality');

  return (
    <div className="App">
      <header className="App-header">
        <h1>Cydonia's Dashboard</h1>
        {loading ? (
          <p>Loading data...</p>
        ) : error ? (
          <p className="error">Error: {error}</p>
        ) : (
          <div className="content-container">
            <div className="chart-container">
              <Line
                data={{
                  datasets: [
                    {
                      label: 'Temperature',
                      data: temperatureData,
                      borderColor: 'rgba(255, 99, 132, 1)',
                      backgroundColor: 'rgba(255, 99, 132, 0.2)',
                      fill: true,
                      tension: 0.4,
                      showLine: true,
                    },
                    {
                      label: 'Humidity',
                      data: humidityData,
                      borderColor: 'rgba(54, 162, 235, 1)',
                      backgroundColor: 'rgba(54, 162, 235, 0.2)',
                      fill: true,
                      tension: 0.4,
                      showLine: true,
                    },
                    {
                      label: 'Air Quality',
                      data: airQualityData,
                      borderColor: 'rgba(75, 192, 192, 1)',
                      backgroundColor: 'rgba(75, 192, 192, 0.2)',
                      fill: true,
                      tension: 0.4,
                      showLine: true,
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
            <div className="data-table-container">
              <h2>Data Table</h2>
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
                  {data.map((item, index) => (
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
