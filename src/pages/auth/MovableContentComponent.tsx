import React, { useState } from 'react';
import './MoveableContentComponent.css'; // You can create this CSS file for styling

const MoveableContentComponent = () => {
  const [isMoved, setIsMoved] = useState(false);

  const handleContentMove = () => {
    setIsMoved(!isMoved);
  };

  return (
    <div className={`moveable-content ${isMoved ? 'moved' : ''}`}>
      <div className="background" />
      <div className="content">
        <button className="move-button" onClick={handleContentMove}>
          Move Content
        </button>
      </div>
    </div>
  );
};

export default MoveableContentComponent;
