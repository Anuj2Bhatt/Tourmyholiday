import React, { useState } from 'react';
import './TeamCard.css';

const TeamCard = ({ member }) => {
  const [hovered, setHovered] = useState(false);

  const handleCardClick = (e) => {
    // Prevent click if connect button is clicked
    if (e.target.closest('.connect-btn')) return;
    if (member.linkedin) {
      window.open(member.linkedin, '_blank', 'noopener noreferrer');
    }
  };

  return (
    <div
      className="team-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleCardClick}
      style={{ cursor: member.linkedin ? 'pointer' : 'default' }}
    >
      <div className="team-card-top">
        <img className="team-card-img" src={member.image} alt={member.name} />
        <div className="team-card-role">{member.role}</div>
        <div className="team-card-desc">{member.description}</div>
        {hovered && member.linkedin && (
          <a
            href={member.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="connect-btn"
            onClick={e => e.stopPropagation()}
          >
            Connect
          </a>
        )}
      </div>
      <div className="team-card-name">{member.name}</div>
    </div>
  );
};

export default TeamCard; 