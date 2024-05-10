// Game.js
import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './Game.css';

const socket = io('http://localhost:4000');

//const socket = io('http://192.168.56.1:4000');

function Game() {
  const [songUrl, setSongUrl] = useState('');
  const [guess, setGuess] = useState('');
  const [message, setMessage] = useState('');
  const [answers, setAnswers] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [usersInRoom, setUsersInRoom] = useState([]);
  const audioRef = useRef(null);
  const [remainingTime, setRemainingTime] = useState(30);
  const [username, setUsername] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [totalSongs, setTotalSongs] = useState(0);
  const [hasStartedTyping, setHasStartedTyping] = useState(false);


  const handleJoinGame = () => {
    if (username.trim() !== '') {
      socket.emit('joinGame', { roomName: 'GameRoom', username });
      setIsReady(true);
    }
  };

  useEffect(() => {
    socket.emit('joinRoom', 'GameRoom');

    socket.on('usersInRoom', (users) => {
      setUsersInRoom(users);
    });

    socket.on('song', (url) => {
      setSongUrl(url);
    });

    socket.on('songIndex', (index) => {
        setCurrentSongIndex(index);
    });
  
    socket.on('totalSongs', (total) => {
        setTotalSongs(total);
    });

    socket.on('startGame', (answersData) => {
      setGameStarted(true);
      setAnswers(answersData);
    });

    socket.on('scores', (scoresData) => {
      setUsersInRoom(scoresData);
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
      setHasStartedTyping(false);
    }
  }, [songUrl]);

  const handleGuess = () => {
    socket.emit('guess', { guess, roomName: 'GameRoom' });
    setGuess('');
  };

  const handleGuessChange = (e) => {
    setGuess(e.target.value);
    setShowSuggestions(e.target.value !== '');
    setHasStartedTyping(true);
  };

  return (
    <div className="game-container">
      {!isReady && (
        <div>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
          />
          <button onClick={handleJoinGame}>Join Game</button>
        </div>
      )}
      {isReady && !gameStarted && <p>Waiting for the game to start...</p>}
      {gameStarted && (
        <>
        <audio ref={audioRef} className="audio-player" src={songUrl} />
          <div className="game-info">
            <div className="song-tracker">
              Current Song: {currentSongIndex + 1} / {totalSongs}
            </div>
            <div className="timer">Time remaining: {remainingTime} seconds</div>
          </div>
          <input
            type="text"
            value={guess}
            onChange={handleGuessChange}
            className="guess-input"
            placeholder="Enter your guess..."
            list={showSuggestions ? 'answer-options' : undefined}
          />
          {showSuggestions && hasStartedTyping && (
            <datalist id="answer-options">
              {answers.map((answer, index) => (
                <option key={index} value={answer} />
              ))}
            </datalist>
          )}
          <button onClick={handleGuess}>Guess</button>
        </>
      )}
      <p>{message}</p>
      <div className="users-in-room">
        <h3>Users in Room:</h3>
        <ul>
          {usersInRoom.map((user) => (
            <li key={user.username}>
              {user.username}: {user.score} points
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Game;