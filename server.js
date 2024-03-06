// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const app = express();
const server = http.createServer(app);
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
        // socket.emit('roomJoined', `You've joined room ${roomName}`);
    });
    // Send the first song URL to the client
    if (songs.length > 0) {
        socket.emit('song', songs[0].url);
    }

    socket.on('guess', (guess) => {
        if (songs.length > 0 && guess === songs[0].answer) {
            socket.emit('result', 'Correct!');
            // Remove the song from the list and send the next one
            songs.shift();
            if (songs.length > 0) {
                socket.emit('song', songs[0].url);
            } else {
                socket.emit('end', 'Congratulations, you guessed all the songs correctly!');
            }
        } else {
            socket.emit('result', 'Wrong, try again.');
        }
    });

    socket.on('disconnect', () => {
        socket.leave(socket.id);
        console.log('user disconnected');
        songs = [...initialsongs];
        
    });
});

server.listen(4000);
