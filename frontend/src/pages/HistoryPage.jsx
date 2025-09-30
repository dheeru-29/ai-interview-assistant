// frontend/src/pages/HistoryPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { PulseLoader } from 'react-spinners';

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };
        const { data } = await axios.get('http://localhost:5000/api/analyses/history', config);
        setHistory(data);
      } catch (err) {
        setError('Failed to load history.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchHistory();
    }
  }, [user]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><PulseLoader color="#3498db" /></div>;
  }

  if (error) {
    return <div className="text-center text-red-400 mt-10">{error}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-white text-center">
        Your Analysis History
      </h1>
      {history.length === 0 ? (
        <p className="text-center text-gray-400">You have no past analyses.</p>
      ) : (
        <div className="space-y-8">
          {history.map((item) => (
            <div key={item._id} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-800 p-6 rounded-xl shadow-md">
              <div>
                <img
                  src={`data:image/jpeg;base64,${item.image}`}
                  alt={`Analysis from ${new Date(item.createdAt).toLocaleString()}`}
                  className="rounded-lg w-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-300 mb-2">
                  Analysis from {new Date(item.createdAt).toLocaleString()}
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-300">
                  {item.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;