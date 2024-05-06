// LandingPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

function LandingPage() {
  return (
    <div className="landing-page-container">
      <h1 className="welcome-text">Name that Anime Tune!</h1>
      <Link to="/game" className="start-game-button">
        Start Game
      </Link>
    </div>
  );
}

export default LandingPage;