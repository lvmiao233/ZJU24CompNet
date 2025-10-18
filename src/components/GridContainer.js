import React from 'react';
import '../css/GridContainer.css';

const GridContainer = ({ children }) => {
    return (
        <div className="options-container">
            {children}
        </div>
    );
};

export default GridContainer;