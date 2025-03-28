import React, { useEffect, useState, useRef } from 'react';
import { Line, Pie, Bar } from 'react-chartjs-2';
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
import './Dashboard.css';
import api from '../../utils/api';

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

const Dashboard = () => {
  const [statistics, setStatistics] = useState({
    dailyProfit: 0,
    weeklyProfit: 0,
    monthlyProfit: 0,
    dailyProfitTrend: 0,
    weeklyProfitTrend: 0,
    monthlyProfitTrend: 0,
    topSellingItems: [],
    nonSellingItems: [],
    foodItemsStats: {
      added: 0,
      removed: 0
    }
  });

  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const [isLoading, setIsLoading] = useState(false);
  const [categoryStats, setCategoryStats] = useState([]);
  const [filterActive, setFilterActive] = useState(false);

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

  // For the Revenue by Day of Week chart
  const [weekdayData, setWeekdayData] = useState(Array(7).fill(0));

  useEffect(() => {
    fetchDashboardData();
    
    // Setup polling interval for real-time updates
    pollingInterval.current = setInterval(() => {
      fetchDashboardData();
    }, 30000); // Poll every 30 seconds

    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, []);

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange({
      ...dateRange,
      [name]: value
    });
  };

  const applyFilter = () => {
    setFilterActive(true);
    fetchDashboardData(true);
  };

  const resetFilter = () => {
    setDateRange({
      startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    });
    setFilterActive(false);
    fetchDashboardData();
  };

  const fetchDashboardData = async (filtered = false) => {
    try {
      setIsLoading(true);
      
      // Updated endpoint to match the backend route structure
      let endpoint = "/api/admin/dashboard";
      if (filtered) {
        endpoint += `?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
      }
      
      console.log("Fetching dashboard data from:", endpoint);
      const response = await api.get(endpoint);
      console.log("Dashboard response:", response.data);
      
      // Initialize default data structure if response data is missing
      const responseData = response.data || {};
      const statsData = responseData.statistics || {};
      const salesData = responseData.salesData || { labels: [], values: [] };
      const categoryData = responseData.categoryStats || [];
      
      // Set statistics with defaults for missing values
      setStatistics({
        dailyProfit: statsData.dailyProfit || 0,
        weeklyProfit: statsData.weeklyProfit || 0,
        monthlyProfit: statsData.monthlyProfit || 0,
        dailyProfitTrend: statsData.dailyProfitTrend || 0,
        weeklyProfitTrend: statsData.weeklyProfitTrend || 0,
        monthlyProfitTrend: statsData.monthlyProfitTrend || 0,
        topSellingItems: statsData.topSellingItems || [],
        nonSellingItems: statsData.nonSellingItems || [],
        foodItemsStats: {
          added: statsData.foodItemsStats?.added || 0,
          removed: statsData.foodItemsStats?.removed || 0
        }
      });
      
      // Update chart data
      setSalesData({
        labels: salesData.labels || [],
        datasets: [{
          label: 'Daily Sales',
          data: salesData.values || [],
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.1
        }]
      });
      
      // Set weekday data safely
      if (salesData.values && salesData.values.length > 0) {
        // Take up to 7 values for the days of the week, or pad with zeros if less than 7
        const dayData = salesData.values.slice(0, 7);
        setWeekdayData(dayData.length < 7 ? [...dayData, ...Array(7 - dayData.length).fill(0)] : dayData);
      } else {
        setWeekdayData(Array(7).fill(0));
      }
      
      // Set category stats
      setCategoryStats(categoryData);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      console.error('Error details:', error.response?.data || error.message);
      // Display a more informative message
      alert(`Failed to load dashboard data: ${error.response?.data?.message || error.message}`);
      // Set default data on error
      resetDataToDefaults();
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetDataToDefaults = () => {
    setStatistics({
      dailyProfit: 0,
      weeklyProfit: 0,
      monthlyProfit: 0,
      dailyProfitTrend: 0,
      weeklyProfitTrend: 0,
      monthlyProfitTrend: 0,
      topSellingItems: [],
      nonSellingItems: [],
      foodItemsStats: {
        added: 0,
        removed: 0
      }
    });
    
    setSalesData({
      labels: [],
      datasets: [{
        label: 'Daily Sales',
        data: [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1
      }]
    });
    
    setWeekdayData(Array(7).fill(0));
    setCategoryStats([]);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <div className="date-filter">
          <div className="filter-inputs">
            <div className="filter-group">
              <label>From</label>
              <input 
                type="date" 
                name="startDate" 
                value={dateRange.startDate} 
                onChange={handleDateChange} 
              />
            </div>
            <div className="filter-group">
              <label>To</label>
              <input 
                type="date" 
                name="endDate" 
                value={dateRange.endDate} 
                onChange={handleDateChange} 
              />
            </div>
          </div>
          <div className="filter-actions">
            <button onClick={applyFilter} className="filter-btn apply">Apply Filter</button>
            {filterActive && <button onClick={resetFilter} className="filter-btn reset">Reset</button>}
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Today's Profit</h3>
              <p>₹{statistics.dailyProfit}</p>
              <div className="stat-trend">
                <span className={statistics.dailyProfitTrend > 0 ? "trend-up" : "trend-down"}>
                  {statistics.dailyProfitTrend > 0 ? '↑' : '↓'} 
                  {Math.abs(statistics.dailyProfitTrend || 0)}%
                </span>
                <span className="trend-period">vs yesterday</span>
              </div>
            </div>
            <div className="stat-card">
              <h3>Weekly Profit</h3>
              <p>₹{statistics.weeklyProfit}</p>
              <div className="stat-trend">
                <span className={statistics.weeklyProfitTrend > 0 ? "trend-up" : "trend-down"}>
                  {statistics.weeklyProfitTrend > 0 ? '↑' : '↓'} 
                  {Math.abs(statistics.weeklyProfitTrend || 0)}%
                </span>
                <span className="trend-period">vs last week</span>
              </div>
            </div>
            <div className="stat-card">
              <h3>Monthly Profit</h3>
              <p>₹{statistics.monthlyProfit}</p>
              <div className="stat-trend">
                <span className={statistics.monthlyProfitTrend > 0 ? "trend-up" : "trend-down"}>
                  {statistics.monthlyProfitTrend > 0 ? '↑' : '↓'} 
                  {Math.abs(statistics.monthlyProfitTrend || 0)}%
                </span>
                <span className="trend-period">vs last month</span>
              </div>
            </div>
            <div className="stat-card">
              <h3>Food Items</h3>
              <p>{(statistics.foodItemsStats?.added || 0) - (statistics.foodItemsStats?.removed || 0)}</p>
              <div className="food-stats">
                <span className="food-added">+{statistics.foodItemsStats?.added || 0} Added</span>
                <span className="food-removed">-{statistics.foodItemsStats?.removed || 0} Removed</span>
              </div>
            </div>
          </div>

          <div className="charts-grid">
            <div className="chart-container">
              <h3>Sales Trend {filterActive ? `(${dateRange.startDate} to ${dateRange.endDate})` : ''}</h3>
              {salesData.labels.length > 0 ? (
                <Line options={chartOptions} data={salesData} />
              ) : (
                <div className="no-data">No sales data available</div>
              )}
            </div>
            
            <div className="chart-container">
              <h3>Top Selling Items</h3>
              {statistics.topSellingItems && statistics.topSellingItems.length > 0 ? (
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
                        '#9966FF',
                        '#FF9F40',
                        '#8BC34A'
                      ]
                    }]
                  }}
                  options={{
                    plugins: {
                      legend: {
                        position: 'right',
                      }
                    }
                  }}
                />
              ) : (
                <div className="no-data">No top selling items data available</div>
              )}
            </div>
          </div>
          
          <div className="charts-grid">
            <div className="chart-container">
              <h3>Category Performance</h3>
              {categoryStats.length > 0 ? (
                <Bar 
                  data={{
                    labels: categoryStats.map(item => item.category),
                    datasets: [{
                      label: 'Orders',
                      data: categoryStats.map(item => item.count),
                      backgroundColor: 'rgba(54, 162, 235, 0.5)',
                      borderColor: 'rgb(54, 162, 235)',
                      borderWidth: 1
                    }]
                  }}
                />
              ) : (
                <div className="no-data">No category performance data available</div>
              )}
            </div>
            
            <div className="chart-container">
              <h3>Revenue by Day of Week</h3>
              {weekdayData.some(value => value > 0) ? (
                <Bar 
                  data={{
                    labels: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                    datasets: [{
                      label: 'Revenue (₹)',
                      data: weekdayData,
                      backgroundColor: 'rgba(153, 102, 255, 0.5)',
                      borderColor: 'rgb(153, 102, 255)',
                      borderWidth: 1
                    }]
                  }}
                />
              ) : (
                <div className="no-data">No revenue by day data available</div>
              )}
            </div>
          </div>
          
          <div className="items-lists">
            <div className="top-selling">
              <h3>Top Selling Items</h3>
              {statistics.topSellingItems && statistics.topSellingItems.length > 0 ? (
                <ul>
                  {statistics.topSellingItems.map((item, index) => (
                    <li key={index}>
                      <div className="sales-item">
                        <div className="item-info">
                          <span className="item-rank">{index + 1}</span>
                          <span className="item-name">{item.name}</span>
                        </div>
                        <div className="item-metrics">
                          <span className="item-quantity">{item.count || item.quantity || 0} orders</span>
                          <span className="item-revenue">₹{item.revenue || 0}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="no-data centered">No top selling items data available</div>
              )}
            </div>
            
            <div className="non-selling">
              <h3>Non-Selling Items</h3>
              {statistics.nonSellingItems && statistics.nonSellingItems.length > 0 ? (
                <ul>
                  {statistics.nonSellingItems.map((item, index) => (
                    <li key={index}>
                      <div className="non-sales-item">
                        <span className="item-name">{item.name}</span>
                        <span className="item-category">{item.category || 'Uncategorized'}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="no-data centered">No non-selling items data available</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;