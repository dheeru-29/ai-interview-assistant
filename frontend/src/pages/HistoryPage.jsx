import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import SuggestionCard from '../components/SuggestionCard';
import { PulseLoader } from 'react-spinners';

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/analyses/history`, config);
        setHistory(data);
      } catch (err) {
        setError('Failed to load history.');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchHistory();
  }, [user]);

  if (loading) { return <div className="flex justify-center items-center h-screen"><PulseLoader color="#3498db" /></div>; }
  if (error) { return <div className="text-center text-destructive mt-10">{error}</div>; }

  return (
    <div className=" text-amber-400 container mx-auto p-6">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">Your Analysis History</h1>
      {history.length === 0 ? (
        <p className="text-center text-muted-foreground">You have no past analyses.</p>
      ) : (
        <div className="space-y-8">
          {history.map((item) => (
            <div key={item._id} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start p-4 border border-border rounded-lg">
              <div className="flex flex-col items-center">
                <img
                  src={`data:image/jpeg;base64,${item.image}`}
                  alt={`Analysis from ${new Date(item.createdAt).toLocaleString()}`}
                  className="rounded-lg w-full max-w-md object-cover shadow-lg"
                />
                 <p className="text-xs text-muted-foreground mt-2">{new Date(item.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex flex-col gap-6">
                <SuggestionCard title="Visual Feedback" suggestions={item.visualFeedback} />
                <SuggestionCard title="Verbal Feedback" suggestions={item.voiceFeedback} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;