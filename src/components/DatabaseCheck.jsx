import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const DatabaseCheck = () => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkDatabase();
  }, []);

  const checkDatabase = async () => {
    try {
      setLoading(true);
      
      // Check boxes
      const { data: boxes, error: boxesError } = await supabase
        .from('boxes')
        .select('*');
      
      // Check sacks
      const { data: sacks, error: sacksError } = await supabase
        .from('sacks')
        .select('*');
      
      // Check customers
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('*');
      
      // Check user_accounts
      const { data: users, error: usersError } = await supabase
        .from('user_accounts')
        .select('*');

      setData({
        boxes: { data: boxes, error: boxesError, count: boxes?.length || 0 },
        sacks: { data: sacks, error: sacksError, count: sacks?.length || 0 },
        customers: { data: customers, error: customersError, count: customers?.length || 0 },
        users: { data: users, error: usersError, count: users?.length || 0 }
      });
    } catch (error) {
      console.error('Database check error:', error);
      setData({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const addTestData = async () => {
    try {
      // Add a test customer
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .insert([{
          first_name: 'Test',
          last_name: 'Customer',
          phone: '1234567890',
          email: 'test@example.com',
          address: '123 Test St'
        }])
        .select()
        .single();

      if (customerError) {
        alert(`Customer error: ${customerError.message}`);
        return;
      }

      // Add a test box
      const { data: box, error: boxError } = await supabase
        .from('boxes')
        .insert([{
          box_id: `BOX${Date.now()}`,
          customer_id: customer.customer_id,
          weight_kg: 5.5,
          dimensions: '30x20x15',
          status: 'packed',
          destination: 'Test Destination'
        }])
        .select()
        .single();

      if (boxError) {
        alert(`Box error: ${boxError.message}`);
        return;
      }

      // Add a test sack
      const { data: sack, error: sackError } = await supabase
        .from('sacks')
        .insert([{
          sack_id: `SACK${Date.now()}`,
          customer_id: customer.customer_id,
          weight_kg: 3.2,
          contents: 'Test contents',
          status: 'packed',
          destination: 'Test Destination'
        }])
        .select()
        .single();

      if (sackError) {
        alert(`Sack error: ${sackError.message}`);
        return;
      }

      alert('Test data added successfully!');
      checkDatabase(); // Refresh the data
    } catch (error) {
      alert(`Error adding test data: ${error.message}`);
    }
  };

  if (loading) {
    return <div className="p-4">Loading database check...</div>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Database Check</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-3">Boxes</h2>
            <p><strong>Count:</strong> {data.boxes?.count || 0}</p>
            <p><strong>Error:</strong> {data.boxes?.error?.message || 'None'}</p>
            {data.boxes?.data && data.boxes.data.length > 0 && (
              <details className="mt-2">
                <summary className="cursor-pointer text-blue-600">View Data</summary>
                <pre className="text-xs bg-gray-100 p-2 mt-2 rounded overflow-auto">
                  {JSON.stringify(data.boxes.data, null, 2)}
                </pre>
              </details>
            )}
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-3">Sacks</h2>
            <p><strong>Count:</strong> {data.sacks?.count || 0}</p>
            <p><strong>Error:</strong> {data.sacks?.error?.message || 'None'}</p>
            {data.sacks?.data && data.sacks.data.length > 0 && (
              <details className="mt-2">
                <summary className="cursor-pointer text-blue-600">View Data</summary>
                <pre className="text-xs bg-gray-100 p-2 mt-2 rounded overflow-auto">
                  {JSON.stringify(data.sacks.data, null, 2)}
                </pre>
              </details>
            )}
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-3">Customers</h2>
            <p><strong>Count:</strong> {data.customers?.count || 0}</p>
            <p><strong>Error:</strong> {data.customers?.error?.message || 'None'}</p>
            {data.customers?.data && data.customers.data.length > 0 && (
              <details className="mt-2">
                <summary className="cursor-pointer text-blue-600">View Data</summary>
                <pre className="text-xs bg-gray-100 p-2 mt-2 rounded overflow-auto">
                  {JSON.stringify(data.customers.data, null, 2)}
                </pre>
              </details>
            )}
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-3">Users</h2>
            <p><strong>Count:</strong> {data.users?.count || 0}</p>
            <p><strong>Error:</strong> {data.users?.error?.message || 'None'}</p>
            {data.users?.data && data.users.data.length > 0 && (
              <details className="mt-2">
                <summary className="cursor-pointer text-blue-600">View Data</summary>
                <pre className="text-xs bg-gray-100 p-2 mt-2 rounded overflow-auto">
                  {JSON.stringify(data.users.data, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">Actions</h2>
          <div className="space-x-4">
            <button
              onClick={checkDatabase}
              className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
            >
              Refresh Data
            </button>
            <button
              onClick={addTestData}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Add Test Data
            </button>
          </div>
        </div>

        {data.error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
            <strong>Error:</strong> {data.error}
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseCheck; 