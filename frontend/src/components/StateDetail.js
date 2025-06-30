import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import StateImages from './StateImages';
import './StateDetail.css';
import { API_BASE_URL } from '../config';

const StateDetail = () => {
  const { stateName } = useParams();
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchState = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/states`);
        if (!response.ok) {
          throw new Error('Failed to fetch state data');
        }
        const data = await response.json();
        const stateData = data.find(s => s.name.toLowerCase().replace(/\s+/g, '-') === stateName.toLowerCase());
        setState(stateData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (stateName) {
      fetchState();
    }
  }, [stateName]);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!state) return <div className="not-found">State not found</div>;

  return (
    <div className="state-detail">
      <h1 className="state-title">{state.name}</h1>
      <StateImages stateId={state.id} />
      <div className="state-info">
        <p className="state-description">{state.description}</p>
        <div className="state-activities">
          <h2>Popular Activities</h2>
          <div className="activities-list">
            {state.activities && state.activities.split(',').map((activity, index) => (
              <span key={index} className="activity-tag">{activity.trim()}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StateDetail; 