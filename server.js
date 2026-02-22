const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

// Word sets: [correct answer, ...9 distractors]
const WORD_SETS = [
  ['Apple', 'Orange', 'Banana', 'Grape', 'Mango', 'Peach', 'Cherry', 'Lemon', 'Melon', 'Plum'],
  ['Dog', 'Cat', 'Horse', 'Rabbit', 'Wolf', 'Bear', 'Fox', 'Deer', 'Lion', 'Tiger'],
  ['Pizza', 'Burger', 'Sushi', 'Tacos', 'Pasta', 'Ramen', 'Steak', 'Curry', 'Salad', 'Soup'],
  ['Guitar', 'Piano', 'Violin', 'Drums', 'Flute', 'Cello', 'Harp', 'Trumpet', 'Banjo', 'Sitar'],
  ['Beach', 'Mountain', 'Forest', 'Desert', 'Island', 'Canyon', 'Valley', 'Glacier', 'Swamp', 'Plains'],
  ['Soccer', 'Tennis', 'Basketball', 'Baseball', 'Hockey', 'Golf', 'Rugby', 'Volleyball', 'Cricket', 'Boxing'],
  ['Paris', 'Tokyo', 'London', 'Cairo', 'Sydney', 'Berlin', 'Rome', 'Dubai', 'Moscow', 'Mumbai'],
  ['Doctor', 'Pilot', 'Chef', 'Artist', 'Teacher', 'Lawyer', 'Nurse', 'Farmer', 'Soldier', 'Sailor'],
  ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Pink', 'Brown', 'Black', 'White'],
  ['Rain', 'Snow', 'Storm', 'Fog', 'Hail', 'Wind', 'Thunder', 'Sunshine', 'Tornado', 'Blizzard'],
];

// rooms: { [roomCode]: { players, gameState, timer, hostId } }
const rooms = {};

function generateCode() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getRoomState(room) {
  return {
    players: room.players.map(p => ({ id: p.id, name: p.name, ready: p.ready })),
    gameState: room.gameState,
    timerDuration: room.timerDuration,
    hostId: room.hostId,
  };
}

io.on('connection', (socket) => {
  console.log('Connected:', socket.id);

  socket.on('create-room', ({ name }) => {
    const code = generateCode();
    rooms[code] = {
      code,
      players: [{ id: socket.id, name, ready: false }],
      gameState: 'lobby',
      timerDuration: 60,
      hostId: socket.id,
      wordSet: null,
      spyId: null,
      timerInterval: null,
      timeLeft: 0,
    };
    socket.join(code);
    socket.roomCode = code;
    socket.emit('room-joined', { code, playerId: socket.id });
    io.to(code).emit('room-update', getRoomState(rooms[code]));
  });

  socket.on('join-room', ({ name, code }) => {
    const room = rooms[code];
    if (!room) return socket.emit('error', 'Room not found');
    if (room.gameState !== 'lobby') return socket.emit('error', 'Game already in progress');
    if (room.players.length >= 10) return socket.emit('error', 'Room is full');

    room.players.push({ id: socket.id, name, ready: false });
    socket.join(code);
    socket.roomCode = code;
    socket.emit('room-joined', { code, playerId: socket.id });
    io.to(code).emit('room-update', getRoomState(room));
  });

  socket.on('set-timer', ({ duration }) => {
    const room = rooms[socket.roomCode];
    if (!room || room.hostId !== socket.id) return;
    room.timerDuration = duration;
    io.to(socket.roomCode).emit('room-update', getRoomState(room));
  });

  socket.on('start-game', () => {
    const room = rooms[socket.roomCode];
    if (!room || room.hostId !== socket.id) return;
    if (room.players.length < 3) return socket.emit('error', 'Need at least 3 players');

    // Pick random word set
    const wordSet = WORD_SETS[Math.floor(Math.random() * WORD_SETS.length)];
    const shuffledWords = shuffle(wordSet);
    const correctWord = wordSet[0];

    // Pick random spy
    const spyIndex = Math.floor(Math.random() * room.players.length);
    const spyId = room.players[spyIndex].id;

    room.wordSet = shuffledWords;
    room.spyId = spyId;
    room.gameState = 'playing';
    room.timeLeft = room.timerDuration;

    // Send each player their role privately
    room.players.forEach(player => {
      const isSpy = player.id === spyId;
      io.to(player.id).emit('game-start', {
        isSpy,
        word: isSpy ? null : correctWord,
        wordList: shuffledWords,
        timeLeft: room.timerDuration,
      });
    });

    io.to(socket.roomCode).emit('room-update', getRoomState(room));

    // Start countdown
    room.timerInterval = setInterval(() => {
      room.timeLeft--;
      io.to(socket.roomCode).emit('timer-tick', { timeLeft: room.timeLeft });
      if (room.timeLeft <= 0) {
        clearInterval(room.timerInterval);
        room.gameState = 'reveal';
        io.to(socket.roomCode).emit('game-reveal', {
          spyId: room.spyId,
          spyName: room.players.find(p => p.id === room.spyId)?.name,
          correctWord: wordSet[0],
          wordList: shuffledWords,
        });
        io.to(socket.roomCode).emit('room-update', getRoomState(room));
      }
    }, 1000);
  });

  socket.on('reveal', () => {
    const room = rooms[socket.roomCode];
    if (!room || room.hostId !== socket.id) return;
    clearInterval(room.timerInterval);
    const wordSet = WORD_SETS.find(ws => ws[0] === room.wordSet?.find(w => ws.includes(w) && ws[0] === w)) || WORD_SETS[0];
    const correctWord = room.wordSet ? room.wordSet.find(w => WORD_SETS.some(ws => ws[0] === w)) : '?';

    room.gameState = 'reveal';
    io.to(socket.roomCode).emit('game-reveal', {
      spyId: room.spyId,
      spyName: room.players.find(p => p.id === room.spyId)?.name,
      correctWord,
      wordList: room.wordSet,
    });
    io.to(socket.roomCode).emit('room-update', getRoomState(room));
  });

  socket.on('reset-game', () => {
    const room = rooms[socket.roomCode];
    if (!room || room.hostId !== socket.id) return;
    clearInterval(room.timerInterval);
    room.gameState = 'lobby';
    room.spyId = null;
    room.wordSet = null;
    room.timeLeft = 0;
    room.players.forEach(p => p.ready = false);
    io.to(socket.roomCode).emit('room-update', getRoomState(room));
    io.to(socket.roomCode).emit('game-reset');
  });

  socket.on('disconnect', () => {
    const code = socket.roomCode;
    const room = rooms[code];
    if (!room) return;

    room.players = room.players.filter(p => p.id !== socket.id);

    if (room.players.length === 0) {
      clearInterval(room.timerInterval);
      delete rooms[code];
      return;
    }

    // Transfer host if needed
    if (room.hostId === socket.id) {
      room.hostId = room.players[0].id;
    }

    io.to(code).emit('room-update', getRoomState(room));
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));