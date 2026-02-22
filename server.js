const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

// Each word: { en, zh, ja }
// First item in each array = the correct answer
const WORD_SETS = {
  location: [
    [
      { en: 'Beach',      zh: '海灘',     ja: 'ビーチ' },
      { en: 'Mountain',   zh: '山',       ja: '山' },
      { en: 'Forest',     zh: '森林',     ja: '森' },
      { en: 'Desert',     zh: '沙漠',     ja: '砂漠' },
      { en: 'Island',     zh: '島嶼',     ja: '島' },
      { en: 'Canyon',     zh: '峽谷',     ja: '渓谷' },
      { en: 'Valley',     zh: '山谷',     ja: '谷' },
      { en: 'Glacier',    zh: '冰川',     ja: '氷河' },
      { en: 'Swamp',      zh: '沼澤',     ja: '沼地' },
      { en: 'Waterfall',  zh: '瀑布',     ja: '滝' },
    ],
    [
      { en: 'Paris',      zh: '巴黎',     ja: 'パリ' },
      { en: 'Tokyo',      zh: '東京',     ja: '東京' },
      { en: 'London',     zh: '倫敦',     ja: 'ロンドン' },
      { en: 'Cairo',      zh: '開羅',     ja: 'カイロ' },
      { en: 'Sydney',     zh: '雪梨',     ja: 'シドニー' },
      { en: 'Berlin',     zh: '柏林',     ja: 'ベルリン' },
      { en: 'Rome',       zh: '羅馬',     ja: 'ローマ' },
      { en: 'Dubai',      zh: '杜拜',     ja: 'ドバイ' },
      { en: 'New York',   zh: '紐約',     ja: 'ニューヨーク' },
      { en: 'Mumbai',     zh: '孟買',     ja: 'ムンバイ' },
    ],
    [
      { en: 'Library',    zh: '圖書館',   ja: '図書館' },
      { en: 'Hospital',   zh: '醫院',     ja: '病院' },
      { en: 'Airport',    zh: '機場',     ja: '空港' },
      { en: 'Museum',     zh: '博物館',   ja: '博物館' },
      { en: 'Market',     zh: '市場',     ja: '市場' },
      { en: 'School',     zh: '學校',     ja: '学校' },
      { en: 'Stadium',    zh: '體育場',   ja: 'スタジアム' },
      { en: 'Theatre',    zh: '劇院',     ja: '劇場' },
      { en: 'Temple',     zh: '廟宇',     ja: '神社' },
      { en: 'Prison',     zh: '監獄',     ja: '刑務所' },
    ],
  ],
  animal: [
    [
      { en: 'Dog',        zh: '狗',       ja: '犬' },
      { en: 'Cat',        zh: '貓',       ja: '猫' },
      { en: 'Horse',      zh: '馬',       ja: '馬' },
      { en: 'Rabbit',     zh: '兔子',     ja: 'ウサギ' },
      { en: 'Wolf',       zh: '狼',       ja: 'オオカミ' },
      { en: 'Bear',       zh: '熊',       ja: 'クマ' },
      { en: 'Fox',        zh: '狐狸',     ja: 'キツネ' },
      { en: 'Deer',       zh: '鹿',       ja: '鹿' },
      { en: 'Lion',       zh: '獅子',     ja: 'ライオン' },
      { en: 'Tiger',      zh: '老虎',     ja: 'トラ' },
    ],
    [
      { en: 'Eagle',      zh: '老鷹',     ja: 'ワシ' },
      { en: 'Penguin',    zh: '企鵝',     ja: 'ペンギン' },
      { en: 'Parrot',     zh: '鸚鵡',     ja: 'オウム' },
      { en: 'Owl',        zh: '貓頭鷹',   ja: 'フクロウ' },
      { en: 'Flamingo',   zh: '紅鶴',     ja: 'フラミンゴ' },
      { en: 'Peacock',    zh: '孔雀',     ja: '孔雀' },
      { en: 'Swan',       zh: '天鵝',     ja: '白鳥' },
      { en: 'Crow',       zh: '烏鴉',     ja: 'カラス' },
      { en: 'Hawk',       zh: '鷹',       ja: 'タカ' },
      { en: 'Pelican',    zh: '鵜鶘',     ja: 'ペリカン' },
    ],
    [
      { en: 'Shark',      zh: '鯊魚',     ja: 'サメ' },
      { en: 'Octopus',    zh: '章魚',     ja: 'タコ' },
      { en: 'Dolphin',    zh: '海豚',     ja: 'イルカ' },
      { en: 'Whale',      zh: '鯨魚',     ja: 'クジラ' },
      { en: 'Crab',       zh: '螃蟹',     ja: 'カニ' },
      { en: 'Jellyfish',  zh: '水母',     ja: 'クラゲ' },
      { en: 'Lobster',    zh: '龍蝦',     ja: 'ロブスター' },
      { en: 'Turtle',     zh: '烏龜',     ja: 'カメ' },
      { en: 'Seahorse',   zh: '海馬',     ja: 'タツノオトシゴ' },
      { en: 'Clownfish',  zh: '小丑魚',   ja: 'クマノミ' },
    ],
  ],
  food: [
    [
      { en: 'Pizza',      zh: '披薩',     ja: 'ピザ' },
      { en: 'Burger',     zh: '漢堡',     ja: 'バーガー' },
      { en: 'Sushi',      zh: '壽司',     ja: '寿司' },
      { en: 'Tacos',      zh: '墨西哥捲', ja: 'タコス' },
      { en: 'Pasta',      zh: '義大利麵', ja: 'パスタ' },
      { en: 'Ramen',      zh: '拉麵',     ja: 'ラーメン' },
      { en: 'Steak',      zh: '牛排',     ja: 'ステーキ' },
      { en: 'Curry',      zh: '咖哩',     ja: 'カレー' },
      { en: 'Dumpling',   zh: '餃子',     ja: '餃子' },
      { en: 'Croissant',  zh: '可頌',     ja: 'クロワッサン' },
    ],
    [
      { en: 'Apple',      zh: '蘋果',     ja: 'リンゴ' },
      { en: 'Mango',      zh: '芒果',     ja: 'マンゴー' },
      { en: 'Grape',      zh: '葡萄',     ja: 'ブドウ' },
      { en: 'Watermelon', zh: '西瓜',     ja: 'スイカ' },
      { en: 'Strawberry', zh: '草莓',     ja: 'イチゴ' },
      { en: 'Peach',      zh: '桃子',     ja: '桃' },
      { en: 'Lemon',      zh: '檸檬',     ja: 'レモン' },
      { en: 'Cherry',     zh: '櫻桃',     ja: 'チェリー' },
      { en: 'Pineapple',  zh: '鳳梨',     ja: 'パイナップル' },
      { en: 'Coconut',    zh: '椰子',     ja: 'ココナッツ' },
    ],
    [
      { en: 'Cake',       zh: '蛋糕',     ja: 'ケーキ' },
      { en: 'Donut',      zh: '甜甜圈',   ja: 'ドーナツ' },
      { en: 'Ice Cream',  zh: '冰淇淋',   ja: 'アイスクリーム' },
      { en: 'Waffle',     zh: '鬆餅',     ja: 'ワッフル' },
      { en: 'Macaron',    zh: '馬卡龍',   ja: 'マカロン' },
      { en: 'Pudding',    zh: '布丁',     ja: 'プリン' },
      { en: 'Brownie',    zh: '布朗尼',   ja: 'ブラウニー' },
      { en: 'Mochi',      zh: '麻糬',     ja: '餅' },
      { en: 'Tiramisu',   zh: '提拉米蘇', ja: 'ティラミス' },
      { en: 'Cheesecake', zh: '起司蛋糕', ja: 'チーズケーキ' },
    ],
  ],
};

const ALL_SETS = [
  ...WORD_SETS.location,
  ...WORD_SETS.animal,
  ...WORD_SETS.food,
];

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
    players: room.players.map(p => ({ id: p.id, name: p.name })),
    gameState: room.gameState,
    timerDuration: room.timerDuration,
    hostId: room.hostId,
    genre: room.genre,
  };
}

function pickWordSet(genre) {
  const pool = genre === 'random' ? ALL_SETS : (WORD_SETS[genre] || ALL_SETS);
  return pool[Math.floor(Math.random() * pool.length)];
}

io.on('connection', (socket) => {
  console.log('Connected:', socket.id);

  socket.on('create-room', ({ name }) => {
    const code = generateCode();
    rooms[code] = {
      code,
      players: [{ id: socket.id, name }],
      gameState: 'lobby',
      timerDuration: 60,
      genre: 'random',
      hostId: socket.id,
      wordSet: null,
      correctWord: null,
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

    room.players.push({ id: socket.id, name });
    socket.join(code);
    socket.roomCode = code;
    socket.emit('room-joined', { code, playerId: socket.id });
    io.to(code).emit('room-update', getRoomState(room));
  });

  socket.on('set-timer', ({ duration }) => {
    const room = rooms[socket.roomCode];
    if (!room || room.hostId !== socket.id) return;
    room.timerDuration = Math.max(60, Math.min(600, duration));
    io.to(socket.roomCode).emit('room-update', getRoomState(room));
  });

  socket.on('set-genre', ({ genre }) => {
    const room = rooms[socket.roomCode];
    if (!room || room.hostId !== socket.id) return;
    if (!['location', 'animal', 'food', 'random'].includes(genre)) return;
    room.genre = genre;
    io.to(socket.roomCode).emit('room-update', getRoomState(room));
  });

  socket.on('start-game', () => {
    const room = rooms[socket.roomCode];
    if (!room || room.hostId !== socket.id) return;
    if (room.players.length < 3) return socket.emit('error', 'Need at least 3 players');

    const wordSet = pickWordSet(room.genre);
    const shuffledWords = shuffle(wordSet);
    const correctWord = wordSet[0];

    const spyIndex = Math.floor(Math.random() * room.players.length);
    const spyId = room.players[spyIndex].id;

    room.wordSet = shuffledWords;
    room.correctWord = correctWord;
    room.spyId = spyId;
    room.gameState = 'playing';
    room.timeLeft = room.timerDuration;

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

    room.timerInterval = setInterval(() => {
      room.timeLeft--;
      io.to(socket.roomCode).emit('timer-tick', { timeLeft: room.timeLeft });
      if (room.timeLeft <= 0) {
        clearInterval(room.timerInterval);
        room.gameState = 'reveal';
        io.to(socket.roomCode).emit('game-reveal', {
          spyId: room.spyId,
          spyName: room.players.find(p => p.id === room.spyId)?.name,
          correctWord: room.correctWord,
          wordList: room.wordSet,
        });
        io.to(socket.roomCode).emit('room-update', getRoomState(room));
      }
    }, 1000);
  });

  socket.on('reveal', () => {
    const room = rooms[socket.roomCode];
    if (!room || room.hostId !== socket.id) return;
    clearInterval(room.timerInterval);
    room.gameState = 'reveal';
    io.to(socket.roomCode).emit('game-reveal', {
      spyId: room.spyId,
      spyName: room.players.find(p => p.id === room.spyId)?.name,
      correctWord: room.correctWord,
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
    room.correctWord = null;
    room.timeLeft = 0;
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

    if (room.hostId === socket.id) {
      room.hostId = room.players[0].id;
    }

    io.to(code).emit('room-update', getRoomState(room));
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));