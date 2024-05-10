// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const app = express();
const server = http.createServer(app);
const axios = require('axios');

//local multiplayer testing 
const io = require('socket.io')(server, {
    cors: {
        origin: 'http://localhost:3000', 
        methods: ['GET', 'POST'],
    },
});

/*const io = require('socket.io')(server, {
  cors: {
    origin: '*', // Allow connections from any origin
    methods: ['GET', 'POST'],
  },
});*/

let initialsongs = [
    { url: 'https://a.animethemes.moe/Bleach-OP1.ogg', answer: 'Bleach' },
    { url: 'https://a.animethemes.moe/OnePiece-OP10-NCDVD480.ogg', answer: 'One Piece' },
    { url: 'https://a.animethemes.moe/Naruto-OP4v2.ogg', answer: 'Naruto' },
    { url: 'https://a.animethemes.moe/JujutsuKaisenS2-OP2-NCBD1080.ogg', answer: 'Jujutsu Kaisen'},
    { url: 'https://a.animethemes.moe/DragonBallZ-OP1-NCBD1080.ogg', answer: 'Dragon Ball Z'},
    { url: 'https://a.animethemes.moe/FullmetalAlchemistBrotherhood-OP1.ogg', answer: 'Fullmetal Alchemist Brotherhood'},
    { url: 'https://a.animethemes.moe/NeonGenesisEvangelion-OP1.ogg', answer: 'Neon Genesis Evangelion'},
    { url: 'https://a.animethemes.moe/SousouNoFrieren-OP1-NCBD1080.ogg', answer: 'Sousou no Frieren'},
    { url: 'https://a.animethemes.moe/CodeGeass-OP1.ogg', answer: 'Code Geass: Lelouch of the Rebellion'},
    { url: 'https://a.animethemes.moe/HunterHunter2011-OP1.ogg', answer: 'Hunter X Hunter'},
    { url: 'https://a.animethemes.moe/DeathParade-OP1.ogg', answer: 'Death Parade'},
    { url: 'https://a.animethemes.moe/TokyoGhoul-OP1.ogg', answer: 'Tokyo Ghoul'},
    { url: 'https://a.animethemes.moe/TensuraS2Part2-OP1-NCBD1080.ogg', answer: 'That Time I Got Reincarnated as a Slime'},
    { url: 'https://a.animethemes.moe/SteinsGate-OP1.ogg', answer: 'Steins;Gate'},
    { url: 'https://a.animethemes.moe/KimiUso-OP1.ogg', answer: 'Your Lie in April'},
    { url: 'https://a.animethemes.moe/ShingekiNoKyojinS2-OP1-NCBD1080.ogg', answer: 'Attack on Titan'},
    { url: 'https://a.animethemes.moe/CowboyBebop-OP1.ogg', answer: 'Cowboy Bebop'},
    { url: 'https://a.animethemes.moe/YuuYuuHakusho-OP1.ogg', answer: 'Yu Yu Hakusho'},
    { url: 'https://a.animethemes.moe/OshiNoKo-OP1-NCBD1080.ogg', answer: 'Oshi No Ko'},
    { url: 'https://a.animethemes.moe/Baccano-OP1.ogg', answer: 'Baccano'},
    { url: 'https://a.animethemes.moe/JojoNoKimyouNaBoukenS4-OP1.ogg', answer: "Jojo's Bizarre Adventure: Diamond is Unbreakable"},
    { url: 'https://a.animethemes.moe/DeathNote-OP1.ogg', answer: 'Death Note'},
    { url: 'https://a.animethemes.moe/CyberpunkEdgerunners-OP1.ogg', answer: 'Cyberpunk: Edgerunner'},
    { url: 'https://a.animethemes.moe/PsychoPass-OP2v2.ogg', answer: 'Psycho-Pass'},
    { url: 'https://a.animethemes.moe/KillLaKill-OP2.ogg', answer: 'Kill la Kill'},
    { url: 'https://a.animethemes.moe/TengenToppaGurrenLagann-OP1.ogg', answer: 'Tengen Toppa Gurren Lagann'},
    { url: 'https://a.animethemes.moe/ChainsawMan-OP1-NCBD1080.ogg', answer: 'Chainsaw man'},
    { url: 'https://a.animethemes.moe/OusamaRanking-OP2-NCBD1080.ogg', answer: 'Ranking of Kings'},
    { url: 'https://a.animethemes.moe/SamuraiChamploo-OP1-NCBD1080.ogg', answer: 'Samurai Champloo'},
    { url: 'https://a.animethemes.moe/SpaceDandy-OP1.ogg', answer: 'Space Dandy'},
    { url: 'https://a.animethemes.moe/EnenNoShouboutai-OP1-NCBD1080.ogg', answer: 'Fire Force'},
    { url: 'https://a.animethemes.moe/SummertimeRender-OP1-NCBD1080.ogg', answer: 'Summer Time Rendering'},
    { url: 'https://a.animethemes.moe/MadokaMagica-OP1-NCBD1080.ogg', answer: 'Puella Magi Madoka Magica'},
    { url: 'https://a.animethemes.moe/OnePunchMan-OP1.ogg', answer: 'One Punch Man'},
    { url: 'https://a.animethemes.moe/KimetsuNoYaiba-OP1-NCBD1080.ogg', answer: 'Demon Slayer: Kimetsu no Yaiba'},
    { url: 'https://a.animethemes.moe/MobPsycho100-OP1-BD1080.ogg', answer: 'Mob Psycho 100'},
    { url: 'https://a.animethemes.moe/YuruCamp-OP1-BD1080.ogg', answer: 'Yuru Camp'},
    { url: 'https://a.animethemes.moe/KaguyaSamaWaKokurasetai-OP1-NCBD1080.ogg', answer: 'Kaguya-sama: Love is War'},
    { url: 'https://a.animethemes.moe/FateZero-OP1.ogg', answer: 'Fate/Zero'},
    { url: 'https://a.animethemes.moe/HaikyuuS3-OP1-NCBD1080.ogg', answer: 'Haikyuu'},
    { url: 'https://a.animethemes.moe/BokuNoHeroAcademiaS2-OP1-NCBD1080.ogg', answer: 'My Hero Academia'},
    { url: 'https://a.animethemes.moe/OddTaxi-OP1-NCBD1080.ogg', answer: 'Odd Taxi'},
    { url: 'https://a.animethemes.moe/NoragamiAragoto-OP1.ogg', answer: 'Noragami Aragoto'},
    { url: 'https://a.animethemes.moe/OverlordS4-OP1-NCBD1080.ogg', answer: 'Overlord'},
    { url: 'https://a.animethemes.moe/BokuDakeGaInaiMachi-OP1.ogg', answer: 'Erased'},
    { url: 'https://a.animethemes.moe/BlueLock-OP1-NCBD1080.ogg', answer: 'Blue Lock'}
];

let scores = {};
let gameStarted = {};
let guessesReceived = {};
let songTimer = null;
let currentSong = {};
let currentSongIndex = {};
let playersReady = {};

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
        socket.emit('result', `Wrong! The correct answer is: ${songs[0].answer}`);
        }
    
        if (guessesReceived[roomName].size === io.sockets.adapter.rooms.get(roomName).size) {
        moveToNextSong(roomName);
        }
    }
    });


    socket.on('joinGame', (data) => {
        const { roomName, username } = data;
        socket.join(roomName);
        socket.username = username;
    
        if (!playersReady[roomName]) {
          playersReady[roomName] = new Set();
        }
        playersReady[roomName].add(socket.id);
    
        // Check if all players are ready
        if (playersReady[roomName].size === io.sockets.adapter.rooms.get(roomName).size) {
          startGame(roomName);
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
    
    function startGame(roomName) {
      gameStarted[roomName] = true;
    
      // Randomly select 10 songs from the initial list
      const shuffledSongs = shuffleArray(initialsongs);
      songs = shuffledSongs.slice(0, 10);
    
      const answers = initialsongs.map((song) => song.answer);
      io.to(roomName).emit('startGame', answers);
      io.to(roomName).emit('scores', getUsersWithScores(roomName));
      io.to(roomName).emit('totalSongs', songs.length);
    
      currentSongIndex[roomName] = 0;
      io.to(roomName).emit('songIndex', currentSongIndex[roomName]);
    
      if (songs.length > 0) {
        currentSong[roomName] = songs[0];
        io.to(roomName).emit('song', currentSong[roomName].url);
        guessesReceived[roomName] = new Set();
        startSongTimer(roomName);
      }
    }
    
    function shuffleArray(array) {
      const shuffledArray = [...array];
      for (let i = shuffledArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
      }
      return shuffledArray;
    }

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
      //io.to(roomName).emit('result', 'All players have guessed. Moving to the next song.');
      
      songs.shift();
      currentSongIndex[roomName]++;
    
        if (songs.length > 0) {
          currentSong[roomName] = songs[0];
          io.to(roomName).emit('song', currentSong[roomName].url);
          io.to(roomName).emit('songIndex', currentSongIndex[roomName]);
          io.sockets.adapter.rooms.get(roomName).firstCorrectGuess = false;
          resetGuessedCorrectly(roomName);
          guessesReceived[roomName].clear();
          startSongTimer(roomName);
        } else {
            const winner = getWinner(roomName);
            io.to(roomName).emit('end', `Congratulations! The game has ended. The winner is ${winner.username} with a score of ${winner.score}!`);
            io.to(roomName).emit('scores', getUsersWithScores(roomName));
            
            // Clean up the game variables
            delete gameStarted[roomName];
            delete currentSong[roomName];
            delete guessesReceived[roomName];
            delete playersReady[roomName];

            const usersInRoom = Array.from(io.sockets.adapter.rooms.get(roomName) || []);
            usersInRoom.forEach((userId) => {
                delete scores[userId];
            });

            songs = [...initialsongs];
        }
    }

    function getWinner(roomName) {
        const usersInRoom = Array.from(io.sockets.adapter.rooms.get(roomName) || []);
        let maxScore = 0;
        let winner = null;
      
        usersInRoom.forEach((userId) => {
          const userScore = scores[userId] || 0;
          if (userScore > maxScore) {
            maxScore = userScore;
            winner = {
              username: io.sockets.sockets.get(userId).username,
              score: userScore,
            };
          }
        });
      
        return winner;
    }


    function getUsersWithScores(roomName) {
        const usersInRoom = Array.from(io.sockets.adapter.rooms.get(roomName) || []);
        return usersInRoom.map((userId) => ({
          username: io.sockets.sockets.get(userId).username,
          score: scores[userId] || 0,
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
      delete currentSongIndex[roomName];
    
      // Reset the songs array to the initial list
      songs = [...initialsongs];
    }


});

server.listen(4000);
//server.listen(4000, '0.0.0.0', () => {
//  console.log('Server is running on port 4000');
//});