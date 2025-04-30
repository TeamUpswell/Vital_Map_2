'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Add this helper function near the top of your component
const getGoogleMapsLink = (lat, lng) => {
  if (!lat || !lng) return null;
  return `https://www.google.com/maps?q=${lat},${lng}`;
};

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [surveyData, setSurveyData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  });
  const [stats, setStats] = useState({
    totalResponses: 0,
    caresForGirlCount: { yes: 0, no: 0, undefined: 0 },
    receivedDoseCount: { yes: 0, no: 0, undefined: 0 },
    readyForVaccineCount: { yes: 0, needs_info: 0, undefined: 0 },
    whatsappJoinedCount: { yes: 0, no: 0 },
    responsesByDate: {},
  });

  // Add state to track which location is being previewed
  const [previewLocation, setPreviewLocation] = useState(null);

  // Simple password verification
  const authenticate = (e) => {
    e.preventDefault();
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

    if (password === adminPassword) {
      setIsAuthenticated(true);
      localStorage.setItem('adminAuthenticated', 'true');
      fetchSurveyData();
    } else {
      setError('Incorrect password');
    }
  };

  // Check if previously authenticated
  useEffect(() => {
    const checkAuth = () => {
      const isAuth = localStorage.getItem('adminAuthenticated') === 'true';
      setIsAuthenticated(isAuth);
      if (isAuth) {
        fetchSurveyData();
      }
    };

    checkAuth();
  }, []);

  // Calculate statistics from survey data
  useEffect(() => {
    if (!surveyData.length) return;

    const calculateStats = () => {
      // Initialize counters
      const caresForGirlCount = { yes: 0, no: 0, undefined: 0 };
      const receivedDoseCount = { yes: 0, no: 0, undefined: 0 };
      const readyForVaccineCount = { yes: 0, needs_info: 0, undefined: 0 };
      const whatsappJoinedCount = { yes: 0, no: 0 };
      const responsesByDate = {};

      // Process each survey response
      surveyData.forEach((response) => {
        // Count cares_for_girl responses
        if (response.cares_for_girl === true) caresForGirlCount.yes++;
        else if (response.cares_for_girl === false) caresForGirlCount.no++;
        else caresForGirlCount.undefined++;

        // Count received_hpv_dose responses
        if (response.received_hpv_dose === true) receivedDoseCount.yes++;
        else if (response.received_hpv_dose === false) receivedDoseCount.no++;
        else receivedDoseCount.undefined++;

        // Count ready_for_vaccine responses
        if (response.ready_for_vaccine === 'yes') readyForVaccineCount.yes++;
        else if (response.ready_for_vaccine === 'needs_info')
          readyForVaccineCount.needs_info++;
        else readyForVaccineCount.undefined++;

        // Count whatsapp_joined responses
        if (response.whatsapp_joined === true) whatsappJoinedCount.yes++;
        else whatsappJoinedCount.no++;

        // Count responses by date
        if (response.created_at) {
          const date = new Date(response.created_at).toLocaleDateString();
          responsesByDate[date] = (responsesByDate[date] || 0) + 1;
        }
      });

      setStats({
        totalResponses: surveyData.length,
        caresForGirlCount,
        receivedDoseCount,
        readyForVaccineCount,
        whatsappJoinedCount,
        responsesByDate,
      });
    };

    calculateStats();
  }, [surveyData]);

  const fetchSurveyData = async (start = null, end = null) => {
    setLoading(true);
    try {
      let query = supabase
        .from('survey_responses')
        .select('*')
        .order('created_at', { ascending: false });

      if (start && end) {
        query = query
          .gte('created_at', start)
          .lte('created_at', end + 'T23:59:59');
      }

      const { data, error } = await query;

      if (error) throw error;

      setSurveyData(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching survey data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchSurveyData(dateRange.start, dateRange.end);
  };

  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    setIsAuthenticated(false);
  };

  // CSV export function
  const exportToCSV = () => {
    if (surveyData.length === 0) return;

    // Get headers from first data object
    const headers = Object.keys(surveyData[0]);

    // Create CSV content
    const csvContent = [
      headers.join(','), // CSV header row
      ...surveyData.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            // Handle special cases like null, undefined, and values containing commas
            if (value === null || value === undefined) return '';
            if (typeof value === 'string' && value.includes(','))
              return `"${value}"`;
            return value;
          })
          .join(',')
      ),
    ].join('\n');

    // Create a blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `survey_data_${new Date().toISOString().split('T')[0]}.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Chart data for "Cares for Girl" responses
  const caresForGirlData = {
    labels: ['Yes', 'No', 'No Answer'],
    datasets: [
      {
        label: 'Cares for Girl',
        data: [
          stats.caresForGirlCount.yes,
          stats.caresForGirlCount.no,
          stats.caresForGirlCount.undefined,
        ],
        backgroundColor: ['#4ade80', '#f87171', '#cbd5e1'],
        borderWidth: 1,
      },
    ],
  };

  // Chart data for "Received HPV Dose" responses
  const receivedDoseData = {
    labels: ['Yes', 'No', 'No Answer'],
    datasets: [
      {
        label: 'Received HPV Dose',
        data: [
          stats.receivedDoseCount.yes,
          stats.receivedDoseCount.no,
          stats.receivedDoseCount.undefined,
        ],
        backgroundColor: ['#4ade80', '#f87171', '#cbd5e1'],
        borderWidth: 1,
      },
    ],
  };

  // Chart data for "Ready for Vaccine" responses
  const readyForVaccineData = {
    labels: ['Yes', 'Needs Info', 'No Answer'],
    datasets: [
      {
        label: 'Ready for Vaccine',
        data: [
          stats.readyForVaccineCount.yes,
          stats.readyForVaccineCount.needs_info,
          stats.readyForVaccineCount.undefined,
        ],
        backgroundColor: ['#4ade80', '#facc15', '#cbd5e1'],
        borderWidth: 1,
      },
    ],
  };

  // Chart data for "WhatsApp Joined" responses
  const whatsappJoinedData = {
    labels: ['Joined', 'Did Not Join'],
    datasets: [
      {
        label: 'WhatsApp Joined',
        data: [stats.whatsappJoinedCount.yes, stats.whatsappJoinedCount.no],
        backgroundColor: ['#22c55e', '#cbd5e1'],
        borderWidth: 1,
      },
    ],
  };

  // Chart data for responses by date
  const responsesByDateData = {
    labels: Object.keys(stats.responsesByDate).slice(-14), // Last 14 days
    datasets: [
      {
        label: 'Responses per Day',
        data: Object.keys(stats.responsesByDate)
          .slice(-14)
          .map((date) => stats.responsesByDate[date]),
        backgroundColor: '#3b82f6',
      },
    ],
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h1 className="text-2xl font-bold mb-6 text-center">Admin Access</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={authenticate}>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="password"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold text-gray-800">
            HPV Vaccine Survey Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Logout
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm uppercase text-gray-600 font-semibold">
              Total Responses
            </h3>
            <p className="text-3xl font-bold mt-1">{stats.totalResponses}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm uppercase text-gray-600 font-semibold">
              Eligible (Cares for Girl)
            </h3>
            <p className="text-3xl font-bold mt-1">
              {stats.caresForGirlCount.yes}
            </p>
            <p className="text-sm text-gray-500">
              {stats.totalResponses > 0
                ? Math.round(
                    (stats.caresForGirlCount.yes / stats.totalResponses) * 100
                  ) + '%'
                : '0%'}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm uppercase text-gray-600 font-semibold">
              Already Vaccinated
            </h3>
            <p className="text-3xl font-bold mt-1">
              {stats.receivedDoseCount.yes}
            </p>
            <p className="text-sm text-gray-500">
              {stats.receivedDoseCount.yes + stats.receivedDoseCount.no > 0
                ? Math.round(
                    (stats.receivedDoseCount.yes /
                      (stats.receivedDoseCount.yes +
                        stats.receivedDoseCount.no)) *
                      100
                  ) + '%'
                : '0%'}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm uppercase text-gray-600 font-semibold">
              WhatsApp Conversions
            </h3>
            <p className="text-3xl font-bold mt-1">
              {stats.whatsappJoinedCount.yes}
            </p>
            <p className="text-sm text-gray-500">
              {stats.totalResponses > 0
                ? Math.round(
                    (stats.whatsappJoinedCount.yes / stats.totalResponses) * 100
                  ) + '%'
                : '0%'}
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Filter Data</h2>
          <form
            onSubmit={handleFilterSubmit}
            className="flex flex-wrap gap-4 items-end"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                name="start"
                value={dateRange.start}
                onChange={handleDateRangeChange}
                className="border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                name="end"
                value={dateRange.end}
                onChange={handleDateRangeChange}
                className="border rounded px-3 py-2"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Apply Filters
            </button>
            <button
              type="button"
              onClick={() => {
                setDateRange({ start: '', end: '' });
                fetchSurveyData();
              }}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              Reset
            </button>
          </form>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* First row of charts */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Cares for Girl Responses
            </h2>
            <div className="h-64">
              <Pie
                data={caresForGirlData}
                options={{ maintainAspectRatio: false }}
              />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Received HPV Dose
            </h2>
            <div className="h-64">
              <Pie
                data={receivedDoseData}
                options={{ maintainAspectRatio: false }}
              />
            </div>
          </div>

          {/* Second row of charts */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Ready for Vaccine
            </h2>
            <div className="h-64">
              <Pie
                data={readyForVaccineData}
                options={{ maintainAspectRatio: false }}
              />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              WhatsApp Joined
            </h2>
            <div className="h-64">
              <Pie
                data={whatsappJoinedData}
                options={{ maintainAspectRatio: false }}
              />
            </div>
          </div>
        </div>

        {/* Daily Responses Chart (full width) */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800">
            Responses by Date
          </h2>
          <div className="h-64">
            <Bar
              data={responsesByDateData}
              options={{
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      precision: 0,
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Raw Data Table */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              Survey Responses
            </h2>
            <button
              onClick={exportToCSV}
              disabled={surveyData.length === 0}
              className={`${
                surveyData.length === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-700'
              } text-white font-bold py-2 px-4 rounded`}
            >
              Export to CSV
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
              <p className="mt-2">Loading data...</p>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          ) : surveyData.length === 0 ? (
            <p className="text-center py-8 text-gray-600">
              No survey responses found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(surveyData[0]).map((header) => (
                      <th
                        key={header}
                        className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
                      >
                        {header.replace(/_/g, ' ')}
                      </th>
                    ))}
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {surveyData.map((row, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                    >
                      {Object.entries(row).map(([key, value]) => (
                        <td
                          key={key}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                        >
                          {value === true
                            ? 'Yes'
                            : value === false
                            ? 'No'
                            : value === null
                            ? '-'
                            : typeof value === 'object'
                            ? JSON.stringify(value)
                            : String(value)}
                        </td>
                      ))}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {row.latitude && row.longitude ? (
                          <a
                            href={getGoogleMapsLink(
                              row.latitude,
                              row.longitude
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            onClick={(e) => {
                              e.preventDefault(); // Prevent immediate navigation
                              setPreviewLocation((prev) =>
                                prev
                                  ? null
                                  : { lat: row.latitude, lng: row.longitude }
                              );
                            }}
                            onMouseEnter={() =>
                              setPreviewLocation({
                                lat: row.latitude,
                                lng: row.longitude,
                              })
                            }
                            onMouseLeave={() => setPreviewLocation(null)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            View Map
                          </a>
                        ) : (
                          <span className="text-gray-400">No location</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Location Preview */}
        {previewLocation && (
          <div className="fixed bottom-4 right-4 w-64 h-64 bg-white border shadow-lg rounded-lg overflow-hidden z-50">
            <div className="absolute top-2 right-2">
              <button
                onClick={() => setPreviewLocation(null)}
                className="bg-white rounded-full p-1 hover:bg-gray-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <iframe
              title="Location Preview"
              width="100%"
              height="100%"
              frameBorder="0"
              src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${previewLocation.lat},${previewLocation.lng}&zoom=14`}
              allowFullScreen
            />
          </div>
        )}
      </div>
    </div>
  );
}
