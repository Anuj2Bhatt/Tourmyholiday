import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import StateImages from './StateImages';
import './StateDetail.css';

const StateDetail = () => {
  const { stateName } = useParams();
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchState = async () => {
      try {
        // First get all states
        const response = await fetch('http://localhost:5000/api/states');
        if (!response.ok) {
          throw new Error('Failed to fetch states');
        }
        const states = await response.json();
        
        // Find the state by name
        const stateData = states.find(s => 
          s.name.toLowerCase().replace(/\s+/g, '-') === stateName.toLowerCase()
        );
        
        if (!stateData) {
          throw new Error('State not found');
        }
        
        setState(stateData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchState();
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