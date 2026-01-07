import React from 'react';
import '../css/homepage.css';

const InfoCard = ({ icon, title, children }) => (
    <div className="info-card">
        <div className="info-card-header">
            <span className="info-card-icon">{icon}</span>
            <h3 className="info-card-title">{title}</h3>
        </div>
        <div className="info-card-content">{children}</div>
    </div>
);

export default InfoCard;
