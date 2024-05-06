// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const app = express();
const server = http.createServer(app);
const axios = require('axios');
//const io = socketIo(server);

const io = require('socket.io')(server, {
    cors: {
        origin: 'http://localhost:3000', // Replace with your React frontend URL
        methods: ['GET', 'POST'],
    },
});

let initialsongs = [
    { url: 'https://a.animethemes.moe/Bleach-OP1.ogg', answer: 'Bleach' },
    { url: 'https://a.animethemes.moe/OnePiece-OP1-NCDVD480.ogg', answer: 'One Piece' },
    { url: 'https://a.animethemes.moe/Naruto-OP4v2.ogg', answer: 'Naruto' },
    { url: 'https://a.animethemes.moe/JujutsuKaisenS2-OP2-NCBD1080.ogg', answer: 'Jujutsu Kaisen'},
    { url: 'https://a.animethemes.moe/DragonBallZ-OP1-NCBD1080.ogg', answer: 'Dragon Ball Z'},
    { url: 'https://a.animethemes.moe/FullmetalAlchemistBrotherhood-OP1.ogg', answer: 'Fullmetal Alchemist Brotherhood'},
    { url: 'https://a.animethemes.moe/NeonGenesisEvangelion-OP1.ogg', answer: 'Neon Genesis Evangelion'}
];

let songs = [
    { url: 'https://a.animethemes.moe/Bleach-OP1.ogg', answer: 'Bleach' },
    { url: 'https://a.animethemes.moe/OnePiece-OP1-NCDVD480.ogg', answer: 'One Piece' },
    { url: 'https://a.animethemes.moe/Naruto-OP4v2.ogg', answer: 'Naruto' },
    { url: 'https://a.animethemes.moe/JujutsuKaisenS2-OP2-NCBD1080.ogg', answer: 'Jujutsu Kaisen'},
    { url: 'https://a.animethemes.moe/DragonBallZ-OP1-NCBD1080.ogg', answer: 'Dragon Ball Z'},
    { url: 'https://a.animethemes.moe/FullmetalAlchemistBrotherhood-OP1.ogg', answer: 'Fullmetal Alchemist Brotherhood'},
    { url: 'https://a.animethemes.moe/NeonGenesisEvangelion-OP1.ogg', answer: 'Neon Genesis Evangelion'}
];

let scores = {};
let gameStarted = {};
let guessesReceived = {};
let songTimer = null;
let currentSong = {};

io.on('connection', (socket) => {
    //console.log('a user connected');

    socket.on('joinRoom', (roomName) => {
        // Join the user to the specified room
        socket.join(roomName);
        console.log(`User ${socket.id} joined room ${roomName}`);
        // You can also emit a confirmation message back to the client if needed
         socket.emit('roomJoined', `You've joined room ${roomName}`);

        // Initialize the score for the user
        scores[socket.id] = 0;

         const usersInRoom = Array.from(io.sockets.adapter.rooms.get(roomName) || []);       
         console.log(`Users in room ${roomName}:`, usersInRoom);
         // Emit the list of users and their scores in the room to all clients in the room
         io.to(roomName).emit('usersInRoom', getUsersWithScores(roomName));
    });

    
    socket.on('startGame', (roomName) => {
        if (!gameStarted[roomName]) {
          gameStarted[roomName] = true;
    
          const answers = songs.map((song) => song.answer);
          io.to(roomName).emit('startGame', answers);
    
          if (songs.length > 0) {
            currentSong[roomName] = songs[0];
            io.to(roomName).emit('song', currentSong[roomName].url);
            guessesReceived[roomName] = new Set();
            startSongTimer(roomName);
          }
        }
      });

    socket.on('guess', (data) => {
    const { guess, roomName } = data;
    
    if (!guessesReceived[roomName].has(socket.id)) {
        guessesReceived[roomName].add(socket.id);
    
        if (songs.length > 0 && guess === songs[0].answer) {
        if (!socket.guessedCorrectly) {
            // Award points based on the order of correct guesses
            if (!io.sockets.adapter.rooms.get(roomName).firstCorrectGuess) {
            scores[socket.id] += 2; // First correct guess gets 2 points
            console.log('score:', scores[socket.id]);
            io.sockets.adapter.rooms.get(roomName).firstCorrectGuess = true;
            } else {
            scores[socket.id] += 1; // Subsequent correct guesses get 1 point
            }
            socket.guessedCorrectly = true;
        }
    
        socket.emit('result', 'Correct answer!');
        io.to(roomName).emit('scores', getUsersWithScores(roomName));
        } else {
        socket.emit('result', 'Wrong answer!');
        }
    
        if (guessesReceived[roomName].size === io.sockets.adapter.rooms.get(roomName).size) {
        moveToNextSong(roomName);
        }
    }
    });




    socket.on('disconnect', () => {
        console.log('User disconnected');
    
        // Find the room the disconnected user was in
        const roomName = Array.from(socket.rooms).find(room => room !== socket.id);
    
        if (roomName) {
          // Remove the user from the scores and guessesReceived
          delete scores[socket.id];
          guessesReceived[roomName].delete(socket.id);
          console.log(io.sockets.adapter.rooms.get(roomName).size);
          // Check if there are no more users in the room
          if (io.sockets.adapter.rooms.get(roomName).size === 0) {
            // End the game and clean up the variables
            console.log('Cleaning up room');
            endGame(roomName);
          }
        }
    });
    
    /*socket.on('disconnect', () => {
        delete scores[socket.id];
        socket.leave(socket.id);
        console.log('user disconnected');
        
        songs = [...initialsongs];
        //delete currentSong[roomName];
        gameStarted['GameRoom'] = false;
        
        //need to make it so when room is empty, set gameStarted to false
        
    });

    function startSongTimer(roomName) {
        songTimer = setTimeout(() => {
          moveToNextSong(roomName);
        }, 30000); // 30 seconds
      }*/

    function startSongTimer(roomName) {
        let remainingTime = 30;
        
        songTimer = setInterval(() => {
            remainingTime--;
            io.to(roomName).emit('timer', remainingTime);
        
            if (remainingTime <= 0) {
            moveToNextSong(roomName);
            }
        }, 1000);
    }

    function moveToNextSong(roomName) {
        clearInterval(songTimer);
        io.to(roomName).emit('result', 'All players have guessed. Moving to the next song.');
        
        songs.shift();
        if (songs.length > 0) {
            currentSong[roomName] = songs[0];
            io.to(roomName).emit('song', currentSong[roomName].url);
            io.sockets.adapter.rooms.get(roomName).firstCorrectGuess = false;
            resetGuessedCorrectly(roomName);
            guessesReceived[roomName].clear();
            startSongTimer(roomName);
        } else {
            io.to(roomName).emit('end', 'Congratulations, you guessed all the songs correctly!');
            songs = [...initialsongs];
            delete currentSong[roomName];
            gameStarted[roomName] = false;
        }
    }


    function getUsersWithScores(roomName) {
        const usersInRoom = Array.from(io.sockets.adapter.rooms.get(roomName) || []);
        return usersInRoom.map((userId) => ({
          userId,
          score: scores[userId],
        }));
      }
      
    function resetGuessedCorrectly(roomName) {
        const usersInRoom = Array.from(io.sockets.adapter.rooms.get(roomName) || []);
        usersInRoom.forEach((userId) => {
            io.sockets.sockets.get(userId).guessedCorrectly = false;
        });
    }

    function endGame(roomName) {
        clearInterval(songTimer);
        io.to(roomName).emit('end', 'The game has ended due to a player disconnecting.');
      
        // Clean up the game variables
        delete gameStarted[roomName];
        delete currentSong[roomName];
        delete guessesReceived[roomName];
      
        // Reset the songs array
        songs = [...initialsongs];
    }


});

server.listen(4000);