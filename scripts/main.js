// ========================
// CONFIGURACIÓN DEL JUEGO
// ========================
const ROWS = 20;
const COLS = 10;
const colors = {
  I: "color-I",
  O: "color-O",
  T: "color-T",
  S: "color-S",
  Z: "color-Z",
  J: "color-J",
  L: "color-L"
};

let board = [];
let currentPiece;
let nextPiece;
let score = 0;
let speed = 500;
let linesClearedTotal = 0;
let gameInterval;
let isGameOver = false;

// ========================
// FIGURAS TETROMINÓS
// ========================
const pieces = {
  I: [[1, 1, 1, 1]],
  O: [
    [1, 1],
    [1, 1]
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1]
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0]
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1]
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1]
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1]
  ]
};

// ========================
// FUNCIONES PRINCIPALES
// ========================
function createBoard() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function randomPiece() {
  const types = Object.keys(pieces);
  const type = types[Math.floor(Math.random() * types.length)];
  return {
    type: type,
    shape: pieces[type].map(row => [...row]),
    row: 0,
    col: Math.floor(COLS / 2) - Math.ceil(pieces[type][0].length / 2)
  };
}

function draw() {
  $(".game-board").empty();
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = $("<div>").addClass("cell");
      if (board[r][c]) cell.addClass(board[r][c]);
      $(".game-board").append(cell);
    }
  }
  // Pintar la pieza actual
  currentPiece.shape.forEach((row, rIdx) => {
    row.forEach((val, cIdx) => {
      if (val) {
        const r = currentPiece.row + rIdx;
        const c = currentPiece.col + cIdx;
        if (r >= 0) {
          $(".game-board .cell")
            .eq(r * COLS + c)
            .addClass(colors[currentPiece.type]);
        }
      }
    });
  });
}

function drawNextPiece() {
  $("#next-piece-board").empty();
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      let cell = $("<div>").addClass("cell");
      $("#next-piece-board").append(cell);
    }
  }
  const startRow = Math.floor((4 - nextPiece.shape.length) / 2);
  const startCol = Math.floor((4 - nextPiece.shape[0].length) / 2);
  nextPiece.shape.forEach((row, rIdx) => {
    row.forEach((val, cIdx) => {
      if (val) {
        const r = startRow + rIdx;
        const c = startCol + cIdx;
        const index = r * 4 + c;
        $("#next-piece-board .cell")
          .eq(index)
          .addClass(colors[nextPiece.type]);
      }
    });
  });
}

function movePiece(dir) {
  currentPiece.col += dir;
  if (collides()) currentPiece.col -= dir;
  draw();
}

function dropPiece() {
  currentPiece.row++;
  if (collides()) {
    currentPiece.row--;
    mergePiece();
    clearLines();
    spawnPiece();
  }
  draw();
}

function rotatePiece() {
  const shape = currentPiece.shape;
  const rotated = shape[0].map((_, i) => shape.map(row => row[i]).reverse());
  const prevShape = currentPiece.shape;
  currentPiece.shape = rotated;
  if (collides()) {
    currentPiece.shape = prevShape;
  }
  draw();
}

function collides() {
  return currentPiece.shape.some((row, rIdx) =>
    row.some((val, cIdx) => {
      if (val) {
        const r = currentPiece.row + rIdx;
        const c = currentPiece.col + cIdx;
        return (
          r < 0 ||
          r >= ROWS ||
          c < 0 ||
          c >= COLS ||
          board[r][c]
        );
      }
      return false;
    })
  );
}

function mergePiece() {
  currentPiece.shape.forEach((row, rIdx) => {
    row.forEach((val, cIdx) => {
      if (val) {
        const r = currentPiece.row + rIdx;
        const c = currentPiece.col + cIdx;
        board[r][c] = colors[currentPiece.type];
      }
    });
  });
}

function clearLines() {
  let linesCleared = 0;
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r].every(cell => cell)) {
      board.splice(r, 1);
      board.unshift(Array(COLS).fill(null));
      linesCleared++;
      r++;
    }
  }
  if (linesCleared > 0) {
    score += linesCleared * 100;
    linesClearedTotal += linesCleared;
    $("#score").text(score);
    if (linesClearedTotal >= 10) {
      console.log('velocidad aumentada en 50ms')
      linesClearedTotal = 0;
      speed = Math.max(100, speed - 50);
      restartInterval();
    }
  }
}

function spawnPiece() {
  currentPiece = nextPiece;
  nextPiece = randomPiece();
  drawNextPiece();
  if (collides()) {
    gameOver();
  }
}

function gameOver() {
  isGameOver = true;
  clearInterval(gameInterval);
  alert("Game Over");
}

function restartInterval() {
  clearInterval(gameInterval);
  gameInterval = setInterval(() => {
    dropPiece();
  }, speed);
}

function startGame() {
  createBoard();
  score = 0;
  speed = 500;
  linesClearedTotal = 0;
  isGameOver = false;
  $("#score").text(score);
  currentPiece = randomPiece();
  nextPiece = randomPiece();
  draw();
  drawNextPiece();
  restartInterval();
}

// ========================
// CONTROLES
// ========================
$(document).keydown(function(e) {
  if (!isGameOver) {
    switch (e.key) {
      case "ArrowLeft":
        movePiece(-1);
        break;
      case "ArrowRight":
        movePiece(1);
        break;
      case "ArrowDown":
        dropPiece();
        break;
      case " ":
        e.preventDefault(); // Evitar scroll con espacio
        rotatePiece();
        break;
    }
  }
});

// Controles móviles
$("#btn-left").on("click", function() {
  if (!isGameOver) movePiece(-1);
});
$("#btn-right").on("click", function() {
  if (!isGameOver) movePiece(1);
});
$("#btn-down").on("click", function() {
  if (!isGameOver) dropPiece();
});
$("#btn-rotate").on("click", function() {
  if (!isGameOver) rotatePiece();
});

// ========================
// INICIO
// ========================
$("#start-btn").on("click", startGame);
