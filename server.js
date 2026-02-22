const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

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
  verb: [
    [
      { en: 'Run',       zh: '跑',     ja: '走る' },
      { en: 'Jump',      zh: '跳',     ja: '跳ぶ' },
      { en: 'Swim',      zh: '游泳',   ja: '泳ぐ' },
      { en: 'Fly',       zh: '飛',     ja: '飛ぶ' },
      { en: 'Climb',     zh: '爬',     ja: '登る' },
      { en: 'Dance',     zh: '跳舞',   ja: '踊る' },
      { en: 'Sing',      zh: '唱歌',   ja: '歌う' },
      { en: 'Crawl',     zh: '爬行',   ja: '這う' },
      { en: 'Spin',      zh: '旋轉',   ja: '回る' },
      { en: 'Roll',      zh: '滾動',   ja: '転がる' },
    ],
    [
      { en: 'Laugh',     zh: '笑',     ja: '笑う' },
      { en: 'Cry',       zh: '哭',     ja: '泣く' },
      { en: 'Scream',    zh: '尖叫',   ja: '叫ぶ' },
      { en: 'Whisper',   zh: '耳語',   ja: 'ささやく' },
      { en: 'Argue',     zh: '爭吵',   ja: '言い争う' },
      { en: 'Hug',       zh: '擁抱',   ja: '抱きしめる' },
      { en: 'Kiss',      zh: '親吻',   ja: 'キスする' },
      { en: 'Stare',     zh: '凝視',   ja: '見つめる' },
      { en: 'Blink',     zh: '眨眼',   ja: 'まばたく' },
      { en: 'Smile',     zh: '微笑',   ja: '微笑む' },
    ],
    [
      { en: 'Cook',      zh: '烹飪',   ja: '料理する' },
      { en: 'Build',     zh: '建造',   ja: '建てる' },
      { en: 'Draw',      zh: '畫畫',   ja: '描く' },
      { en: 'Write',     zh: '寫作',   ja: '書く' },
      { en: 'Read',      zh: '閱讀',   ja: '読む' },
      { en: 'Teach',     zh: '教導',   ja: '教える' },
      { en: 'Steal',     zh: '偷竊',   ja: '盗む' },
      { en: 'Fix',       zh: '修理',   ja: '直す' },
      { en: 'Hunt',      zh: '狩獵',   ja: '狩る' },
      { en: 'Plant',     zh: '種植',   ja: '植える' },
    ],
  ],
  adjective: [
    [
      { en: 'Happy',     zh: '快樂的',   ja: '嬉しい' },
      { en: 'Sad',       zh: '悲傷的',   ja: '悲しい' },
      { en: 'Angry',     zh: '憤怒的',   ja: '怒った' },
      { en: 'Scared',    zh: '害怕的',   ja: '怖い' },
      { en: 'Bored',     zh: '無聊的',   ja: '退屈な' },
      { en: 'Excited',   zh: '興奮的',   ja: 'わくわくした' },
      { en: 'Tired',     zh: '疲倦的',   ja: '疲れた' },
      { en: 'Nervous',   zh: '緊張的',   ja: '緊張した' },
      { en: 'Jealous',   zh: '嫉妒的',   ja: '嫉妬深い' },
      { en: 'Proud',     zh: '驕傲的',   ja: '誇りに思う' },
    ],
    [
      { en: 'Tiny',      zh: '微小的',   ja: '小さな' },
      { en: 'Huge',      zh: '巨大的',   ja: '巨大な' },
      { en: 'Heavy',     zh: '沉重的',   ja: '重い' },
      { en: 'Light',     zh: '輕盈的',   ja: '軽い' },
      { en: 'Rough',     zh: '粗糙的',   ja: 'ざらざらした' },
      { en: 'Smooth',    zh: '光滑的',   ja: 'なめらかな' },
      { en: 'Sharp',     zh: '鋒利的',   ja: '鋭い' },
      { en: 'Soft',      zh: '柔軟的',   ja: '柔らかい' },
      { en: 'Cold',      zh: '寒冷的',   ja: '冷たい' },
      { en: 'Burning',   zh: '燃燒的',   ja: '燃える' },
    ],
    [
      { en: 'Brave',     zh: '勇敢的',   ja: '勇敢な' },
      { en: 'Clever',    zh: '聰明的',   ja: '賢い' },
      { en: 'Lazy',      zh: '懶惰的',   ja: '怠惰な' },
      { en: 'Cruel',     zh: '殘忍的',   ja: '残酷な' },
      { en: 'Gentle',    zh: '溫柔的',   ja: '優しい' },
      { en: 'Greedy',    zh: '貪婪的',   ja: '欲張りな' },
      { en: 'Honest',    zh: '誠實的',   ja: '正直な' },
      { en: 'Reckless',  zh: '魯莽的',   ja: '無謀な' },
      { en: 'Stubborn',  zh: '頑固的',   ja: '頑固な' },
      { en: 'Sneaky',    zh: '狡猾的',   ja: 'ずるい' },
    ],
  ],
  adverb: [
    [
      { en: 'Quickly',   zh: '迅速地',   ja: '素早く' },
      { en: 'Slowly',    zh: '緩慢地',   ja: 'ゆっくりと' },
      { en: 'Quietly',   zh: '安靜地',   ja: '静かに' },
      { en: 'Loudly',    zh: '大聲地',   ja: '大きな声で' },
      { en: 'Carefully', zh: '小心地',   ja: '注意深く' },
      { en: 'Wildly',    zh: '瘋狂地',   ja: '激しく' },
      { en: 'Gently',    zh: '輕柔地',   ja: '優しく' },
      { en: 'Roughly',   zh: '粗暴地',   ja: '乱暴に' },
      { en: 'Suddenly',  zh: '突然地',   ja: '突然' },
      { en: 'Lazily',    zh: '懶洋洋地', ja: 'だらだらと' },
    ],
    [
      { en: 'Always',    zh: '總是',     ja: 'いつも' },
      { en: 'Never',     zh: '從不',     ja: '決して〜ない' },
      { en: 'Sometimes', zh: '有時',     ja: '時々' },
      { en: 'Often',     zh: '經常',     ja: 'よく' },
      { en: 'Rarely',    zh: '很少',     ja: 'めったに〜ない' },
      { en: 'Already',   zh: '已經',     ja: 'すでに' },
      { en: 'Soon',      zh: '很快',     ja: 'もうすぐ' },
      { en: 'Still',     zh: '仍然',     ja: 'まだ' },
      { en: 'Forever',   zh: '永遠',     ja: '永遠に' },
      { en: 'Lately',    zh: '最近',     ja: '最近' },
    ],
    [
      { en: 'Everywhere', zh: '到處',    ja: 'どこでも' },
      { en: 'Nowhere',   zh: '無處',     ja: 'どこにもない' },
      { en: 'Nearby',    zh: '附近',     ja: '近くに' },
      { en: 'Far Away',  zh: '遠處',     ja: '遠くに' },
      { en: 'Upstairs',  zh: '樓上',     ja: '上の階に' },
      { en: 'Outside',   zh: '外面',     ja: '外に' },
      { en: 'Inside',    zh: '裡面',     ja: '中に' },
      { en: 'Apart',     zh: '分開地',   ja: '離れて' },
      { en: 'Together',  zh: '一起',     ja: '一緒に' },
      { en: 'Alone',     zh: '獨自地',   ja: '一人で' },
    ],
  ],
};

const ALL_SETS = [
  ...WORD_SETS.location,
  ...WORD_SETS.animal,
  ...WORD_SETS.food,
  ...WORD_SETS.verb,
  ...WORD_SETS.adjective,
  ...WORD_SETS.adverb,
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

function doReveal(room, code) {
  // Build per-player reveal: each player's role & word
  const playerReveal = room.players.map(p => ({
    id: p.id,
    name: p.name,
    isSpy: p.id === room.spyId,
    word: p.id === room.spyId ? null : room.correctWord,
  }));

  room.gameState = 'reveal';
  io.to(code).emit('game-reveal', {
    spyId: room.spyId,
    spyName: room.players.find(p => p.id === room.spyId)?.name,
    votedOutId: room.votedOutId || null,
    votedOutName: room.players.find(p => p.id === room.votedOutId)?.name || null,
    correctWord: room.correctWord,
    wordList: room.wordSet,
    playerReveal,
  });
  io.to(code).emit('room-update', getRoomState(room));
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
      votedOutId: null,
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
    if (!['location', 'animal', 'food', 'verb', 'adjective', 'adverb', 'random'].includes(genre)) return;
    room.genre = genre;
    io.to(socket.roomCode).emit('room-update', getRoomState(room));
  });

  socket.on('start-game', () => {
    const room = rooms[socket.roomCode];
    if (!room || room.hostId !== socket.id) return;
    if (room.players.length < 3) return socket.emit('error', 'Need at least 3 players');

    const wordSet = pickWordSet(room.genre);
    const correctWord = wordSet[Math.floor(Math.random() * wordSet.length)];
    const shuffledWords = shuffle(wordSet);
    const spyIndex = Math.floor(Math.random() * room.players.length);
    const spyId = room.players[spyIndex].id;

    room.wordSet = shuffledWords;
    room.correctWord = correctWord;
    room.spyId = spyId;
    room.votedOutId = null;
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
        doReveal(room, socket.roomCode);
      }
    }, 1000);
  });

  // Host votes out a player — triggers voting screen for everyone,
  // then host confirms to reveal
  socket.on('vote-out', ({ targetId }) => {
    const room = rooms[socket.roomCode];
    if (!room || room.hostId !== socket.id) return;
    if (room.gameState !== 'playing') return;
    clearInterval(room.timerInterval);
    room.votedOutId = targetId;
    room.gameState = 'voting';

    const target = room.players.find(p => p.id === targetId);
    io.to(socket.roomCode).emit('voting-result', {
      votedOutId: targetId,
      votedOutName: target?.name || '???',
    });
    io.to(socket.roomCode).emit('room-update', getRoomState(room));
  });

  // After voting screen, host confirms reveal
  socket.on('confirm-reveal', () => {
    const room = rooms[socket.roomCode];
    if (!room || room.hostId !== socket.id) return;
    doReveal(room, socket.roomCode);
  });

  // Skip voting — just reveal without voting anyone out
  socket.on('reveal', () => {
    const room = rooms[socket.roomCode];
    if (!room || room.hostId !== socket.id) return;
    clearInterval(room.timerInterval);
    room.votedOutId = null;
    doReveal(room, socket.roomCode);
  });

  socket.on('reset-game', () => {
    const room = rooms[socket.roomCode];
    if (!room || room.hostId !== socket.id) return;
    clearInterval(room.timerInterval);
    room.gameState = 'lobby';
    room.spyId = null;
    room.votedOutId = null;
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
    if (room.hostId === socket.id) room.hostId = room.players[0].id;
    io.to(code).emit('room-update', getRoomState(room));
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));