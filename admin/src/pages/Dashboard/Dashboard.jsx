import axios from 'axios';
import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
} from 'chart.js';
import React, { useEffect, useState, useRef } from 'react';
import { Line, Pie } from 'react-chartjs-2';
import './Dashboard.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Chart options
const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Sales Data'
    }
  }
};

const Dashboard = ({ url }) => {
  const [statistics, setStatistics] = useState({
    dailyProfit: 0,
    weeklyProfit: 0,
    monthlyProfit: 0,
    topSellingItems: [],
    nonSellingItems: [],
    foodItemsStats: {
      added: 0,
      removed: 0
    }
  });

  const pollingInterval = useRef(null);

  const [salesData, setSalesData] = useState({
    labels: [],
    datasets: [{
      label: 'Daily Sales',
      data: [],
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  });

  useEffect(() => {
    fetchDashboardData();
    
    // Setup polling interval for real-time updates
    pollingInterval.current = setInterval(() => {
      fetchDashboardData();
    }, 5000); // Poll every 5 seconds

    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [url]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${url}/api/admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setStatistics(response.data.statistics);
      
      // Update chart data
      setSalesData({
        labels: response.data.salesData.labels,
        datasets: [{
          label: 'Daily Sales',
          data: response.data.salesData.values,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }]
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Today's Profit</h3>
          <p>₹{statistics.dailyProfit}</p>
        </div>
        <div className="stat-card">
          <h3>Weekly Profit</h3>
          <p>₹{statistics.weeklyProfit}</p>
        </div>
        <div className="stat-card">
          <h3>Monthly Profit</h3>
          <p>₹{statistics.monthlyProfit}</p>
        </div>
        <div className="stat-card">
          <h3>Food Items</h3>
          <p>Added: {statistics.foodItemsStats.added}</p>
          <p>Removed: {statistics.foodItemsStats.removed}</p>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-container">
          <h3>Sales Trend</h3>
          <Line options={chartOptions} data={salesData} />
        </div>
        
        <div className="chart-container">
          <h3>Top Selling Items</h3>
          <Pie 
            data={{
              labels: statistics.topSellingItems.map(item => item.name),
              datasets: [{
                data: statistics.topSellingItems.map(item => item.quantity),
                backgroundColor: [
                  '#FF6384',
                  '#36A2EB',
                  '#FFCE56',
                  '#4BC0C0',
                  '#9966FF'
                ]
              }]
            }}
          />
        </div>
      </div>

      <div className="items-lists">
        <div className="top-selling">
          <h3>Top Selling Items Today</h3>
          <ul>
            {statistics.topSellingItems.map((item, index) => (
              <li key={index}>
                {item.name} - {item.quantity} orders
              </li>
            ))}
          </ul>
        </div>
        
        <div className="non-selling">
          <h3>Non-Selling Items Today</h3>
          <ul>
            {statistics.nonSellingItems.map((item, index) => (
              <li key={index}>{item.name}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;