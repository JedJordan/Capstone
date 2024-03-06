// Game.js
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './Game.css'; // Import your custom CSS file

const socket = io('http://localhost:4000');

function Game() {
    const [songUrl, setSongUrl] = useState('');
    const [guess, setGuess] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        socket.on('song', (url) => {
            setSongUrl(url);
        });

        socket.on('result', (result) => {
            setMessage(result);
        });

        socket.on('end', (endMessage) => {
            setMessage(endMessage);
        });

        return () => {
            socket.off('song');
            socket.off('result');
            socket.off('end');
        };
    }, []);

    const handleGuess = () => {
        socket.emit('guess', guess);
        setGuess('');
    };

    return (
        <div className="game-container">
            <audio controls className="audio-player" src={songUrl} />
            <input
                type="text"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                className="guess-input"
                placeholder="Enter your guess..."
            />
            <button onClick={handleGuess}>Guess</button>
            <p>{message}</p>
        </div>
    );
}

export default Game;

