// Game.js
import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './Game.css';

const socket = io('http://localhost:4000');

function Game() {
  const [songUrl, setSongUrl] = useState('');
  const [guess, setGuess] = useState('');
  const [message, setMessage] = useState('');
  const [answers, setAnswers] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [usersInRoom, setUsersInRoom] = useState([]);
  const audioRef = useRef(null);
  const [scores, setScores] = useState({});
  const [remainingTime, setRemainingTime] = useState(30);

  /*const handleStartGame = () => {
    setGameStarted(true);
    const roomName = 'GameRoom';
    socket.emit('startGame', roomName);
  };*/

  const handleStartGame = () => {
    socket.emit('startGame', 'GameRoom');
  };

  useEffect(() => {
    socket.emit('joinRoom', 'GameRoom');

    socket.on('usersInRoom', (users) => {
        setUsersInRoom(users);
      });

    socket.on('song', (url) => {
      setSongUrl(url);
    });

    socket.on('startGame', (answersData) => {
        setGameStarted(true);
        setAnswers(answersData);
      });

    socket.on('scores', (scoresData) => {
        setScores(scoresData.reduce((acc, user) => {
          acc[user.userId] = user.score;
          return acc;
        }, {}));
      });

    socket.on('result', (result) => {
        setMessage(result);
        if (result === 'Correct!' || result === 'Time is up! Moving to the next song.') {
            setTimeout(() => {
            audioRef.current.play();
            }, 1000);
        }
    });

    socket.on('end', (endMessage) => {
      setMessage(endMessage);
    });

    socket.on('answers', (answersData) => {
      setAnswers(answersData);
    });

    socket.on('timer', (time) => {
        setRemainingTime(time);
    });

    return () => {
        socket.off('song');
        socket.off('result');
        socket.off('end');
        socket.off('answers');
        socket.off('usersInRoom');
        socket.off('scores');
        socket.off('startGame');
        socket.off('timer');
    };
  }, []);

  useEffect(() => {
    if (songUrl) {
      audioRef.current.play();
    }
  }, [songUrl]);

  const handleGuess = () => {
    socket.emit('guess', { guess, roomName: 'GameRoom' });
    setGuess('');
  };


  return (
    <div className="game-container">
      <audio ref={audioRef} className="audio-player" src={songUrl} />
      {!gameStarted && (
        <button onClick={handleStartGame} className="start-button">
          Start Game
        </button>
      )}
      
      {gameStarted && (
        <>
        <div className="timer">Time remaining: {remainingTime} seconds</div>
          <input
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            className="guess-input"
            placeholder="Enter your guess..."
            list="answer-options"
          />
          <datalist id="answer-options">
            {answers.map((answer, index) => (
              <option key={index} value={answer} />
            ))}
          </datalist>
          <button onClick={handleGuess}>Guess</button>
        </>
        
      )}
      <p>{message}</p>
      <div className="users-in-room">
        <h3>Users in Room:</h3>
        <ul>
          {usersInRoom.map((user) => (
            <li key={user.userId}>
              {user.userId}: {scores[user.userId] || 0} points
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Game;


