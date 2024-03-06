// LandingPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css'; // Import your custom CSS file (create this file if it doesn't exist)
import io from 'socket.io-client'; // Import Socket.io client library

const socket = io('http://localhost:4000'); // Replace with your server URL

function LandingPage() {
    const handleStartGame = () => {
        // Emit the 'joinRoom' event to the server
        socket.emit('joinRoom', 'GameRoom'); // Replace 'myGameRoom' with your desired room name
    };

    return (
        <div className="landing-page-container">
            <h1 className="welcome-text">Welcome to the Song Guessing Game!</h1>
            <Link to="/game" className="start-game-button" onClick={handleStartGame}>
                Start Game
            </Link>
        </div>
    );
}

export default LandingPage;
