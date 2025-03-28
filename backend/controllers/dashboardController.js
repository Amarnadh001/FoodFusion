import orderModel from "../models/orderModels.js";
import foodModel from "../models/foodModel.js";

export const getDashboardData = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get daily orders and profits using aggregation
    const dailyStats = await orderModel.aggregate([
      { $match: { date: { $gte: today } } },
      { $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalAmount: { $sum: "$amount" },
        items: { $push: "$items" }
      }}
    ]).exec();

    // Get weekly stats using aggregation
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 7);
    const weeklyStats = await orderModel.aggregate([
      { $match: { date: { $gte: weekStart } } },
      { $group: {
        _id: null,
        totalAmount: { $sum: "$amount" }
      }}
    ]).exec();

    // Get monthly stats using aggregation
    const monthStart = new Date(today);
    monthStart.setMonth(today.getMonth() - 1);
    const monthlyStats = await orderModel.aggregate([
      { $match: { date: { $gte: monthStart } } },
      { $group: {
        _id: null,
        totalAmount: { $sum: "$amount" }
      }}
    ]).exec();

    // Extract profits from aggregation results
    const dailyProfit = dailyStats[0]?.totalAmount || 0;
    const weeklyProfit = weeklyStats[0]?.totalAmount || 0;
    const monthlyProfit = monthlyStats[0]?.totalAmount || 0;

    // Calculate top selling items using the aggregated items
    const itemSales = new Map();
    if (dailyStats[0]?.items) {
      dailyStats[0].items.flat().forEach(item => {
        const current = itemSales.get(item.name) || 0;
        itemSales.set(item.name, current + item.quantity);
      });
    }

    const topSellingItems = Array.from(itemSales.entries())
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Get non-selling items
    const allFoodItems = await foodModel.find({});
    const nonSellingItems = allFoodItems.filter(
      item => !itemSales.has(item.name)
    );

    // Get food items statistics
    const foodItemsStats = {
      added: await foodModel.countDocuments({ createdAt: { $gte: today } }),
      removed: await foodModel.countDocuments({ deletedAt: { $gte: today } })
    };

    // Prepare sales data for charts using aggregation
    const salesData = await Promise.all([
      getDailySalesData(today),
      getWeeklySalesData(weekStart),
      getMonthlySalesData(monthStart)
    ]).then(([daily, weekly, monthly]) => ({
      daily,
      weekly,
      monthly
    }));

    res.json({
      success: true,
      statistics: {
        dailyProfit,
        weeklyProfit,
        monthlyProfit,
        topSellingItems,
        nonSellingItems,
        foodItemsStats
      },
      salesData
    });

  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data'
    });
  }
};

const getDailySalesData = async (startDate) => {
  const hourlyData = await orderModel.aggregate([
    { $match: { date: { $gte: startDate } } },
    { $group: {
      _id: { $hour: "$date" },
      sales: { $sum: "$amount" }
    }},
    { $sort: { "_id": 1 } }
  ]).exec();

  return {
    labels: hourlyData.map(h => `${h._id}:00`),
    values: hourlyData.map(h => h.sales)
  };
};

const getWeeklySalesData = async (startDate) => {
  const dailyData = await orderModel.aggregate([
    { $match: { date: { $gte: startDate } } },
    { $group: {
      _id: { $dayOfWeek: "$date" },
      sales: { $sum: "$amount" }
    }},
    { $sort: { "_id": 1 } }
  ]).exec();

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return {
    labels: dailyData.map(d => days[d._id - 1]),
    values: dailyData.map(d => d.sales)
  };
};

const getMonthlySalesData = async (startDate) => {
  const dailyData = await orderModel.aggregate([
    { $match: { date: { $gte: startDate } } },
    { $group: {
      _id: { $dayOfMonth: "$date" },
      sales: { $sum: "$amount" }
    }},
    { $sort: { "_id": 1 } }
  ]).exec();

  return {
    labels: dailyData.map(d => `Day ${d._id}`),
    values: dailyData.map(d => d.sales)
  };
};