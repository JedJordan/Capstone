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
    { url: 'https://a.animethemes.moe/DragonBallZ-OP1-NCBD1080.ogg', answer: 'Dragon Ball Z'}
];

let songs = [
    { url: 'https://a.animethemes.moe/Bleach-OP1.ogg', answer: 'Bleach' },
    { url: 'https://a.animethemes.moe/OnePiece-OP1-NCDVD480.ogg', answer: 'One Piece' },
    { url: 'https://a.animethemes.moe/Naruto-OP4v2.ogg', answer: 'Naruto' },
    { url: 'https://a.animethemes.moe/JujutsuKaisenS2-OP2-NCBD1080.ogg', answer: 'Jujutsu Kaisen'},
    { url: 'https://a.animethemes.moe/DragonBallZ-OP1-NCBD1080.ogg', answer: 'Dragon Ball Z'}
];

io.on('connection', (socket) => {
    //console.log('a user connected');

    socket.on('joinRoom', (roomName) => {
        // Join the user to the specified room
        socket.join(roomName);
        console.log(`User ${socket.id} joined room ${roomName}`);
        // You can also emit a confirmation message back to the client if needed
         socket.emit('roomJoined', `You've joined room ${roomName}`);

         const usersInRoom = Array.from(io.sockets.adapter.rooms.get(roomName) || []);       
         console.log(`Users in room ${roomName}:`, usersInRoom);
         io.to(roomName).emit('usersInRoom', usersInRoom);
    });

    
    socket.on('startGame', (roomName) => {
        //console.log(`User ${socket.id} is in ${roomName}`);
        // Send the answers to the client in the specific room
        const answers = songs.map((song) => song.answer);
        io.to(roomName).emit('answers', answers);
        
        // Send the first song URL to the client in the specific room
        if (songs.length > 0) {
            io.to(roomName).emit('song', songs[0].url);
        }
        });

        socket.on('guess', (data) => {
            const { guess, roomName } = data;
        
            if (songs.length > 0 && guess === songs[0].answer) {
              io.to(roomName).emit('result', 'Correct!');
              songs.shift();
              if (songs.length > 0) {
                io.to(roomName).emit('song', songs[0].url);
              } else {
                io.to(roomName).emit('end', 'Congratulations, you guessed all the songs correctly!');
                songs = [...initialsongs];
              }
            } else {
              io.to(roomName).emit('result', 'Wrong, try again.');
            }
          });

    socket.on('disconnect', () => {
        socket.leave(socket.id);
        console.log('user disconnected');
        songs = [...initialsongs];
        
    });
});

server.listen(4000);