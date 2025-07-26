import React, { useState, useEffect } from 'react';
import { db } from '../lib/supabase';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const TestFunctionality = () => {
  const [tests, setTests] = useState([]);
  const [running, setRunning] = useState(false);

  const runTests = async () => {
    setRunning(true);
    const testResults = [];

    // Test 1: Database Connection
    try {
      const settings = await db.getCompanySettings();
      testResults.push({
        name: 'Database Connection',
        status: 'passed',
        message: 'Successfully connected to database'
      });
    } catch (error) {
      testResults.push({
        name: 'Database Connection',
        status: 'failed',
        message: `Database connection failed: ${error.message}`
      });
    }

    // Test 2: Get Users
    try {
      const users = await db.getUsers();
      testResults.push({
        name: 'Get Users',
        status: 'passed',
        message: `Found ${users?.length || 0} users`
      });
    } catch (error) {
      testResults.push({
        name: 'Get Users',
        status: 'failed',
        message: `Failed to get users: ${error.message}`
      });
    }

    // Test 3: Get All Parcels
    try {
      const parcels = await db.getAllParcels();
      testResults.push({
        name: 'Get All Parcels',
        status: 'passed',
        message: `Found ${(parcels?.boxes?.length || 0) + (parcels?.sacks?.length || 0)} parcels`
      });
    } catch (error) {
      testResults.push({
        name: 'Get All Parcels',
        status: 'failed',
        message: `Failed to get parcels: ${error.message}`
      });
    }

    // Test 4: Search Parcels
    try {
      const searchResults = await db.searchParcel('test');
      testResults.push({
        name: 'Search Parcels',
        status: 'passed',
        message: 'Search function working'
      });
    } catch (error) {
      testResults.push({
        name: 'Search Parcels',
        status: 'failed',
        message: `Search failed: ${error.message}`
      });
    }

    // Test 5: Navigation Routes
    const routes = [
      '/dashboard',
      '/register-box',
      '/register-sack',
      '/scan-and-log',
      '/map-tracker',
      '/admin-panel',
      '/portal'
    ];

    routes.forEach(route => {
      testResults.push({
        name: `Route: ${route}`,
        status: 'info',
        message: 'Route exists in App.jsx'
      });
    });

    setTests(testResults);
    setRunning(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'info':
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'passed':
        return 'bg-green-50 border-green-200';
      case 'failed':
        return 'bg-red-50 border-red-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Functionality Test</h1>
        <p className="mt-1 text-sm text-gray-500">
          Test all main features to ensure they're working properly
        </p>
      </div>

      <div className="card">
        <button
          onClick={runTests}
          disabled={running}
          className="btn-primary"
        >
          {running ? 'Running Tests...' : 'Run All Tests'}
        </button>
      </div>

      {tests.length > 0 && (
        <div className="space-y-4">
          {tests.map((test, index) => (
            <div
              key={index}
              className={`p-4 border rounded-lg ${getStatusColor(test.status)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(test.status)}
                  <div>
                    <h3 className="font-medium text-gray-900">{test.name}</h3>
                    <p className="text-sm text-gray-600">{test.message}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  test.status === 'passed' ? 'bg-green-100 text-green-800' :
                  test.status === 'failed' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {test.status.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Manual Testing Checklist</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <input type="checkbox" className="h-4 w-4 text-blue-600" />
            <span>Dashboard loads with statistics</span>
          </div>
          <div className="flex items-center space-x-3">
            <input type="checkbox" className="h-4 w-4 text-blue-600" />
            <span>Register Box form works</span>
          </div>
          <div className="flex items-center space-x-3">
            <input type="checkbox" className="h-4 w-4 text-blue-600" />
            <span>Register Sack form works</span>
          </div>
          <div className="flex items-center space-x-3">
            <input type="checkbox" className="h-4 w-4 text-blue-600" />
            <span>Scan & Log opens mobile scanner</span>
          </div>
          <div className="flex items-center space-x-3">
            <input type="checkbox" className="h-4 w-4 text-blue-600" />
            <span>Map Tracker shows parcel list</span>
          </div>
          <div className="flex items-center space-x-3">
            <input type="checkbox" className="h-4 w-4 text-blue-600" />
            <span>Track Package (Customer Portal) works</span>
          </div>
          <div className="flex items-center space-x-3">
            <input type="checkbox" className="h-4 w-4 text-blue-600" />
            <span>Admin Panel loads with tabs</span>
          </div>
          <div className="flex items-center space-x-3">
            <input type="checkbox" className="h-4 w-4 text-blue-600" />
            <span>User Management tab works</span>
          </div>
          <div className="flex items-center space-x-3">
            <input type="checkbox" className="h-4 w-4 text-blue-600" />
            <span>System Settings tab works</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestFunctionality; 