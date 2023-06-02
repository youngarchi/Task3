const crypto = require('crypto');

//Этот класс представляет игру и он включает в себя методы для генерации ключей, ходов и HMAC, а также определение результата игры и форматирование таблицы помощи.
class Game {
  constructor(moves) {
    this.moves = moves;
    this.key = this.generateKey();
    this.computerMove = this.generateMove();
    this.hmac = this.generateHMAC(this.computerMove);
  }

  //generateKey использует модуль crypto для генерации случайного ключа длиной 32 байта.
  generateKey() {
    return crypto.randomBytes(32).toString('hex');
  }

//generateMove случайным образом выбирает один из ходов из массива ходов игры.
  generateMove() {
    const randomIndex = Math.floor(Math.random() * this.moves.length);
    return this.moves[randomIndex];
  }

//Метод generateHMAC создает HMAC на основе переданного сообщения (хода компьютера) и ключа, сгенерированного в конструкторе. Юзается алгоритм хэширования SHA-256 для вычисления HMAC.

  generateHMAC(message) {
    const hmac = crypto.createHmac('sha256', this.key);
    hmac.update(message);
    return hmac.digest('hex');
  }

// вернёт строку с ходами 

  getMovesMenu() {
    let menu = 'Available moves:\n';
    this.moves.forEach((move, index) => {
      menu += `${index + 1} - ${move}\n`;
    });
    menu += '0 - exit\n? - help';
    return menu;
  }

//playGame принимает ход пользователя и проверяет его корректность. Потом он определяет результат игры и выводит информацию о ходах, результате и ключе.
  playGame(userMove) {
    const userIndex = parseInt(userMove) - 1;
    if (userIndex >= 0 && userIndex < this.moves.length) {
      const userMoveText = this.moves[userIndex];
      const result = this.getResult(userIndex);
      console.log(`Your move: ${userMoveText}`);
      console.log(`Computer move: ${this.computerMove}`);
      console.log(result);
      console.log(`HMAC key: ${this.key}`);
    } else if (userMove === '?') {
      const helpTable = this.generateHelpTable();
      console.log(helpTable);
    } else {
      console.log('Invalid move. Please try again.');
    }
  }

// Метод getResult определяет результат игры на основе хода пользователя и хода компьютера. метод использует половину следующих по кругу ходов для определения проигрышных ходов и половину предыдущих по кругу ходов для определения выигрышных ходов.
  getResult(userIndex) {
    const halfLength = Math.floor(this.moves.length / 2);
    const losingMoves = this.moves.slice(userIndex + 1, userIndex + 1 + halfLength);
    const winningMoves = this.moves.slice(userIndex - halfLength, userIndex);
    if (losingMoves.includes(this.computerMove)) {
      return 'You lose!';
    } else if (winningMoves.includes(this.computerMove)) {
      return 'You win!';
    } else {
      return 'It\'s a draw!';
    }
  }

//generateHelpTable создает таблицу, которая определяет результаты для всех возможных сочетаний ходов. Он возвращает отформатированную строку таблицы.
  generateHelpTable() {
    const table = [['Move', ...this.moves]];
    for (let i = 0; i < this.moves.length; i++) {
      const row = [this.moves[i]];
      for (let j = 0; j < this.moves.length; j++) {
        if (i === j) {
          row.push('Draw');
        } else if (j > i) {
          row.push('Win');
        } else {
          row.push('Lose');
        }
      }
      table.push(row);
    }
    return this.formatTable(table);
  }

//formatTable форматирует переданную таблицу таким образом, чтобы элементы в каждой колонке были выровнены по максимальной длине элемента в этой колонке.
  formatTable(table) {
    const maxLengths = [];
    for (let i = 0; i < table[0].length; i++) {
      let maxLength = 0;
      for (let j = 0; j < table.length; j++) {
        maxLength = Math.max(maxLength, table[j][i].length);
      }
      maxLengths.push(maxLength);
    }

    let formattedTable = '';
    for (let i = 0; i < table.length; i++) {
      for (let j = 0; j < table[i].length; j++) {
        formattedTable += table[i][j].padEnd(maxLengths[j] + 2);
      }
      formattedTable += '\n';
    }
    return formattedTable;
  }
}


//validateArguments принимает массив аргументов командной строки и проверяет, является ли количество аргументов правильным (нечетным и больше 3) и все ли аргументы являются уникальными ходами. Если проверка не проходит, функция выводит сообщение об ошибке.
function validateArguments(args) {
  if (args.length < 4 || args.length % 2 === 0) {
    console.log('Invalid number of moves. Please provide an odd number of unique moves.');
    console.log('Example: node game.js rock paper scissors');
    return false;
  }

  const uniqueMoves = new Set(args.slice(2));
  if (uniqueMoves.size !== args.length - 2) {
    console.log('Moves must be unique.');
    return false;
  }

  return true;
}

//startGame принимает массив аргументов командной строки. Она вызывает функцию validateArguments для проверки корректности аргументов. Если проверка проходит успешно, функция создает экземпляр класса Game, выводит HMAC и меню доступных ходов, а затем запрашивает ход пользователя с помощью модуля readline.
function startGame(args) {
  if (!validateArguments(args)) {
    return;
  }

  const moves = args.slice(2);
  const game = new Game(moves);

  console.log(`HMAC: ${game.hmac}`);
  console.log(game.getMovesMenu());

  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  readline.question('Enter your move: ', userMove => {
    game.playGame(userMove);
    readline.close();
  });
}

startGame(process.argv);