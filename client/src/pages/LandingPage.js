// LandingPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

function LandingPage() {
  return (
    <div className="landing-page-container">
      <h1 className="welcome-text">Welcome to the Song Guessing Game!</h1>
      <Link to="/game" className="start-game-button">
        Start Game
      </Link>
    </div>
  );
}

export default LandingPage;