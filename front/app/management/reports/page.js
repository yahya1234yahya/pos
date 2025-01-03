'use client';
import { useEffect, useState } from 'react';
import { withAuth } from '@/middleware/authMiddleware';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function ReportsPage() {
  const [dateRange, setDateRange] = useState({
    startDate: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });
  const [reportData, setReportData] = useState({
    summary: null,
    dailySales: [],
    popularItems: [],
    categorySales: [],
    staffPerformance: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all report types
      const reports = ['summary', 'daily', 'items', 'categories', 'staff'];
      const results = await Promise.all(
        reports.map(type => 
          fetch(`http://localhost/pos/POS/api/reports.php?type=${type}&start_date=${dateRange.startDate}&end_date=${dateRange.endDate}`, {
            credentials: 'include'
          }).then(res => res.json())
        )
      );

      setReportData({
        summary: results[0].success ? results[0].data : null,
        dailySales: results[1].success ? results[1].data : [],
        popularItems: results[2].success ? results[2].data : [],
        categorySales: results[3].success ? results[3].data : [],
        staffPerformance: results[4].success ? results[4].data : []
      });
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const handleQuickSelect = (period) => {
    const today = new Date();
    let start, end;

    switch (period) {
      case 'today':
        start = end = format(today, 'yyyy-MM-dd');
        break;
      case 'yesterday':
        start = end = format(subDays(today, 1), 'yyyy-MM-dd');
        break;
      case 'last7days':
        start = format(subDays(today, 7), 'yyyy-MM-dd');
        end = format(today, 'yyyy-MM-dd');
        break;
      case 'thisMonth':
        start = format(startOfMonth(today), 'yyyy-MM-dd');
        end = format(endOfMonth(today), 'yyyy-MM-dd');
        break;
      case 'lastMonth':
        const lastMonth = subDays(startOfMonth(today), 1);
        start = format(startOfMonth(lastMonth), 'yyyy-MM-dd');
        end = format(endOfMonth(lastMonth), 'yyyy-MM-dd');
        break;
    }

    setDateRange({ startDate: start, endDate: end });
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Chart configurations
  const dailySalesConfig = {
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Daily Sales',
        },
      },
    },
    data: {
      labels: reportData.dailySales?.map(item => item.date) || [],
      datasets: [
        {
          label: 'Sales',
          data: reportData.dailySales?.map(item => Number(item.total || 0)) || [],
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
        },
      ],
    },
  };

  const popularItemsConfig = {
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Popular Items',
        },
      },
    },
    data: {
      labels: reportData.popularItems?.map(item => item.name) || [],
      datasets: [
        {
          label: 'Quantity Sold',
          data: reportData.popularItems?.map(item => Number(item.quantity || 0)) || [],
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        },
      ],
    },
  };

  const categorySalesConfig = {
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Sales by Category',
        },
      },
    },
    data: {
      labels: reportData.categorySales?.map(item => item.category) || [],
      datasets: [
        {
          data: reportData.categorySales?.map(item => Number(item.total || 0)) || [],
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)',
          ],
        },
      ],
    },
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Sales Reports</h1>
        
        {/* Date Range Selection */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center space-x-4">
            <input
              type="date"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateChange}
              className="border rounded px-3 py-2"
            />
            <span>to</span>
            <input
              type="date"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateChange}
              className="border rounded px-3 py-2"
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleQuickSelect('today')}
              className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200"
            >
              Today
            </button>
            <button
              onClick={() => handleQuickSelect('yesterday')}
              className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200"
            >
              Yesterday
            </button>
            <button
              onClick={() => handleQuickSelect('last7days')}
              className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200"
            >
              Last 7 Days
            </button>
            <button
              onClick={() => handleQuickSelect('thisMonth')}
              className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200"
            >
              This Month
            </button>
            <button
              onClick={() => handleQuickSelect('lastMonth')}
              className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200"
            >
              Last Month
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            {reportData.summary && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">Total Sales</h3>
                    <p className="text-2xl font-bold">
                      ${Number(reportData.summary.total_sales || 0).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Daily Avg: ${Number(reportData.summary.daily_average || 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">Total Orders</h3>
                    <p className="text-2xl font-bold">
                      {Number(reportData.summary.total_orders || 0)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {Number(reportData.summary.orders_per_day || 0).toFixed(1)} orders/day
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">Average Order</h3>
                    <p className="text-2xl font-bold">
                      ${Number(reportData.summary.average_order || 0).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {Number(reportData.summary.avg_items_per_order || 0).toFixed(1)} items/order
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">Items Sold</h3>
                    <p className="text-2xl font-bold">
                      {Number(reportData.summary.items_sold || 0)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {Number(reportData.summary.total_items || 0)} unique items
                    </p>
                  </div>
                </div>

                {/* Additional Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* Peak Hours */}
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Peak Hours</h3>
                    <div className="space-y-2">
                      {reportData.summary.peak_hours?.map((hour, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-gray-600">
                            {hour.hour}:00 - {hour.hour + 1}:00
                          </span>
                          <div className="text-right">
                            <div className="font-medium">{Number(hour.order_count)} orders</div>
                            <div className="text-sm text-gray-500">
                              ${Number(hour.hour_sales || 0).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Busiest Days */}
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Busiest Days</h3>
                    <div className="space-y-2">
                      {reportData.summary.busiest_days?.map((day, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-gray-600">
                            {new Date(day.date).toLocaleDateString()}
                          </span>
                          <div className="text-right">
                            <div className="font-medium">{Number(day.order_count)} orders</div>
                            <div className="text-sm text-gray-500">
                              ${Number(day.daily_sales || 0).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily Sales Chart */}
              <div className="bg-white p-6 rounded-lg shadow">
                <Line options={dailySalesConfig.options} data={dailySalesConfig.data} />
              </div>

              {/* Popular Items Chart */}
              <div className="bg-white p-6 rounded-lg shadow">
                <Bar options={popularItemsConfig.options} data={popularItemsConfig.data} />
              </div>

              {/* Category Sales Chart */}
              <div className="bg-white p-6 rounded-lg shadow">
                <Pie options={categorySalesConfig.options} data={categorySalesConfig.data} />
              </div>

              {/* Staff Performance Table */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Staff Performance</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Staff Member</th>
                        <th className="text-right p-2">Orders</th>
                        <th className="text-right p-2">Total Sales</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.staffPerformance.map((staff, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{staff.name}</td>
                          <td className="text-right p-2">{Number(staff.orders || 0)}</td>
                          <td className="text-right p-2">
                            ${Number(staff.total_sales || 0).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default withAuth(ReportsPage, ['admin', 'manager']);